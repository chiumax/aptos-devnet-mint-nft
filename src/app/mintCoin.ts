"use server";
import {
  Account,
  AccountAddress,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  Network,
} from "@aptos-labs/ts-sdk";
import { NetworkType } from "./page";
import path from "path";
import fs from "fs";
var randomEmoji = require("random-unicode-emoji");

const INITIAL_BALANCE = 100_000_000;

// Setup the client NetworkToNetworkName[process.env.APTOS_NETWORK] ||

/** Mints amount of the newly created coin to a specified receiver address */
async function mint(
  minter: Account,
  receiverAddress: AccountAddress,
  amount: number,
  aptos: Aptos
): Promise<string> {
  const transaction = await aptos.transaction.build.simple({
    sender: minter.accountAddress,
    data: {
      function: "0x1::managed_coin::mint",
      typeArguments: [`${minter.accountAddress}::max_coin::MaxCoin`],
      functionArguments: [receiverAddress, amount],
    },
  });

  const senderAuthenticator = aptos.transaction.sign({
    signer: minter,
    transaction,
  });
  const pendingTxn = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator,
  });

  return pendingTxn.hash;
}

/** Register the receiver account to receive transfers for the new coin. */
async function registerCoin(
  receiver: Account,
  coinTypeAddress: AccountAddress,
  aptos: Aptos
): Promise<string> {
  const transaction = await aptos.transaction.build.simple({
    sender: receiver.accountAddress,
    data: {
      function: "0x1::managed_coin::register",
      typeArguments: [`${coinTypeAddress}::max_coin::MaxCoin`],
      functionArguments: [],
    },
  });

  const senderAuthenticator = aptos.transaction.sign({
    signer: receiver,
    transaction,
  });
  const pendingTxn = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator,
  });

  return pendingTxn.hash;
}

const fromHexString = (hexString: string) =>
  Uint8Array.from(
    hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );

/**
 * A convenience function to get the compiled package metadataBytes and byteCode
 * @param packageDir
 * @param outputFile
 * @param namedAddresses
 */
export async function getPackageBytesToPublish(filePath: string) {
  // current working directory - the root folder of this repo
  const cwd = process.cwd();
  // target directory - current working directory + filePath (filePath json file is generated with the prevoius, compilePackage, cli command)
  const modulePath = path.join(cwd, filePath);

  const jsonData = JSON.parse(fs.readFileSync(modulePath, "utf8"));

  const metadataBytes = jsonData.args[0].value;
  const byteCode = jsonData.args[1].value;

  return { metadataBytes, byteCode };
}

/** Transfer the newly created coin to a specified receiver address */
async function transferCoin(
  sender: Account,
  receiverAddress: AccountAddress,
  amount: number | bigint,
  aptos: Aptos
): Promise<string> {
  const transaction = await aptos.transaction.build.simple({
    sender: sender.accountAddress,
    data: {
      function: "0x1::aptos_account::transfer_coins",
      typeArguments: [`${sender.accountAddress}::max_coin::MaxCoin`],
      functionArguments: [receiverAddress, amount],
    },
  });
  console.log(transaction);

  const senderAuthenticator = aptos.transaction.sign({
    signer: sender,
    transaction,
  });
  const pendingTxn = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator,
  });

  return pendingTxn.hash;
}

interface mintCoinProps {
  recipient: string;
  network: NetworkType;
}

const mintCoin = async ({ recipient, network }: mintCoinProps) => {
  const APTOS_NETWORK: Network =
    network === "devnet" ? Network.DEVNET : Network.TESTNET;
  const config = new AptosConfig({ network: APTOS_NETWORK });
  const aptos = new Aptos(config);

  const devnetAccount = Account.generate();
  const testnetPK =
    "0xb5c50875715191468dfad36c6b418328c12a87479fcd0710b5019fe62ff7d0a0";
  const devnetPK = devnetAccount.privateKey.toString();
  if (network === "devnet") {
    await aptos.fundAccount({
      accountAddress: devnetAccount.accountAddress,
      amount: 100_000_000,
    });

    //  deploy contract
    const { metadataBytes, byteCode } = await getPackageBytesToPublish(
      "./maxCoin.json"
    );

    console.log(
      `\n=== Publishing MaxCoin package to ${aptos.config.network} network ===`
    );

    // Publish MoonCoin package to chain
    const transaction = await aptos.publishPackageTransaction({
      account: devnetAccount.accountAddress,
      metadataBytes,
      moduleBytecode: byteCode,
    });

    const pendingTransaction = await aptos.signAndSubmitTransaction({
      signer: devnetAccount,
      transaction,
    });
    console.log("published package", pendingTransaction);
  }

  console.log("mint coin");
  // maxCoin contracts have already been deployed from the following PKs

  const pk = network === "devnet" ? devnetPK : testnetPK;

  const alice = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(pk),
  }) as Account;

  const registerCoinTransactionHash = await registerCoin(
    alice,
    alice.accountAddress,
    aptos
  );
  await aptos.waitForTransaction({
    transactionHash: registerCoinTransactionHash,
  });

  const mintCoinTransactionHash = await mint(
    alice,
    alice.accountAddress,
    100_000_00000,
    aptos
  );
  await aptos.waitForTransaction({ transactionHash: mintCoinTransactionHash });

  const transferCoinTransactionHash = await transferCoin(
    alice,
    new AccountAddress(
      fromHexString(recipient.startsWith("0x") ? recipient.slice(2) : recipient)
    ),
    100_000_00000,
    aptos
  );
  await aptos.waitForTransaction({
    transactionHash: transferCoinTransactionHash,
  });

  return transferCoinTransactionHash;
};

export default mintCoin;
