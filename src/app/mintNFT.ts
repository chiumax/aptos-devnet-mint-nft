import {
  Account,
  AccountAddress,
  Aptos,
  AptosConfig,
  Network,
} from "@aptos-labs/ts-sdk";
import { NetworkType } from "./page";
var randomEmoji = require("random-unicode-emoji");

const INITIAL_BALANCE = 100_000_000;

// Setup the client NetworkToNetworkName[process.env.APTOS_NETWORK] ||

interface mintNFTProps {
  recipient: string;
  network: NetworkType;
}

const mintNFT = async ({ recipient, network }: mintNFTProps) => {
  const APTOS_NETWORK: Network =
    network === "devnet" ? Network.DEVNET : Network.TESTNET;
  const config = new AptosConfig({ network: APTOS_NETWORK });
  const aptos = new Aptos(config);

  // Create Alice and Bob accounts
  const alice = Account.generate();

  // Fund and create the accounts
  await aptos.faucet.fundAccount({
    accountAddress: alice.accountAddress,
    amount: INITIAL_BALANCE,
  });

  const collectionName = "CHEWY";
  const collectionDescription = "very max. much wow.";
  const collectionURI = "https://i.imgur.com/VGt0IVk.png";

  // Create the collection
  const createCollectionTransaction = await aptos.createCollectionTransaction({
    creator: alice,
    description: collectionDescription,
    name: collectionName,
    uri: collectionURI,
  });

  let committedTxn = await aptos.signAndSubmitTransaction({
    signer: alice,
    transaction: createCollectionTransaction,
  });

  let pendingTxn = await aptos.waitForTransaction({
    transactionHash: committedTxn.hash,
  });

  const alicesCollection = await aptos.getCollectionData({
    creatorAddress: alice.accountAddress,
    collectionName,
    minimumLedgerVersion: BigInt(pendingTxn.version),
  });

  const tokenName = randomEmoji.random({ count: 3 })[0];
  const tokenDescription = "very max. much wow.";
  const tokenURI = "https://i.imgur.com/VGt0IVk.png";

  const mintTokenTransaction = await aptos.mintDigitalAssetTransaction({
    creator: alice,
    collection: collectionName,
    description: tokenDescription,
    name: tokenName,
    uri: tokenURI,
  });

  committedTxn = await aptos.signAndSubmitTransaction({
    signer: alice,
    transaction: mintTokenTransaction,
  });
  pendingTxn = await aptos.waitForTransaction({
    transactionHash: committedTxn.hash,
  });

  const alicesDigitalAsset = await aptos.getOwnedDigitalAssets({
    ownerAddress: alice.accountAddress,
    minimumLedgerVersion: BigInt(pendingTxn.version),
  });

  // new AccountAddress(bob.accountAddress.toUint8Array());
  const fromHexString = (hexString: string) =>
    Uint8Array.from(
      hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );

  console.log(
    fromHexString(recipient.startsWith("0x") ? recipient.slice(2) : recipient)
  );

  const transferTransaction = await aptos.transferDigitalAssetTransaction({
    sender: alice,
    digitalAssetAddress: alicesDigitalAsset[0].token_data_id,
    recipient: new AccountAddress(
      fromHexString(recipient.startsWith("0x") ? recipient.slice(2) : recipient)
    ),
  });
  committedTxn = await aptos.signAndSubmitTransaction({
    signer: alice,
    transaction: transferTransaction,
  });

  pendingTxn = await aptos.waitForTransaction({
    transactionHash: committedTxn.hash,
    options: { checkSuccess: true },
  });

  return committedTxn.hash;
};

export default mintNFT;
