"use client";
import ReactDOM from "react-dom";
import "98.css";
import React, { useState, ChangeEvent, FormEvent } from "react";
import mintNFT from "./mintNFT";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import mintCoin from "./mintCoin";

interface FormData {
  nftName: string;
  collection: string;
  id: string;
  recipient: string;
}

export type NetworkType = "devnet" | "testnet";
export type AssetType = "nft" | "coin";

const NFTForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    nftName: "",
    collection: "",
    id: "",
    recipient: "",
  });
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>("devnet");
  const [selectedAsset, setSelectedAsset] = useState<AssetType>("nft");

  const handleNetworkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedNetwork(event.target.value as NetworkType);
  };

  const handleAssetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAsset(event.target.value as AssetType);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const mutation = useMutation({
    mutationFn: async () => {
      return selectedAsset === "nft"
        ? await mintNFT({
            recipient: formData.recipient,
            network: selectedNetwork,
          })
        : await mintCoin({
            recipient: formData.recipient,
            network: selectedNetwork,
          });
    },
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // "use server";
    e.preventDefault();
    console.log(formData); // You can handle form submission logic here

    mutation.mutate();
  };

  return (
    <div>
      <h2>
        Mint Aptos NFT / Coin <img src="/mail.gif" />
      </h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: "350px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label
            style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}
          >
            Recipient (please do 0x0 addresses, no .apt Names):
            <input
              type="text"
              name="recipient"
              value={formData.recipient}
              onChange={handleChange}
              style={{ marginLeft: "10px", padding: "5px", width: "100%" }}
            />
          </label>
        </div>
        <fieldset style={{ marginBottom: "10px" }}>
          <legend>Select what to mint:</legend>
          <div>
            <input
              type="radio"
              id="nft"
              name="nft"
              value="nft"
              checked={selectedAsset === "nft"}
              onChange={handleAssetChange}
            />
            <label htmlFor="nft">CHEWY NFT</label>
          </div>

          <div>
            <input
              type="radio"
              id="coin"
              name="coin"
              value="coin"
              checked={selectedAsset === "coin"}
              onChange={handleAssetChange}
            />
            <label htmlFor="coin">Max Coin</label>
          </div>
        </fieldset>
        <fieldset style={{ marginBottom: "10px" }}>
          <legend>Select a network:</legend>
          <div>
            <input
              type="radio"
              id="devnet"
              name="network"
              value="devnet"
              checked={selectedNetwork === "devnet"}
              onChange={handleNetworkChange}
            />
            <label htmlFor="devnet">Devnet</label>
          </div>

          <div>
            <input
              type="radio"
              id="testnet"
              name="network"
              value="testnet"
              checked={selectedNetwork === "testnet"}
              onChange={handleNetworkChange}
            />
            <label htmlFor="testnet">Testnet</label>
          </div>
        </fieldset>
        {selectedAsset === "coin" && selectedNetwork === "devnet" && (
          <div style={{ marginBottom: "10px" }}>
            <p>
              sorry minting coin is currently <strong>not</strong> available for{" "}
              <strong>devnet</strong>
            </p>
          </div>
        )}

        {/* <div style={{ marginBottom: "10px" }}>
          <label
            style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}
          >
            NFT Name (OPTIONAL):
            <input
              type="text"
              name="nftName"
              value={formData.nftName}
              onChange={handleChange}
              style={{ marginLeft: "10px", padding: "5px", width: "100%" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label
            style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}
          >
            Collection (OPTIONAL):
            <input
              type="text"
              name="collection"
              value={formData.collection}
              onChange={handleChange}
              style={{ marginLeft: "10px", padding: "5px", width: "100%" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label
            style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}
          >
            ID (OPTIONAL):
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              style={{ marginLeft: "10px", padding: "5px", width: "100%" }}
            />
          </label>
        </div> */}

        <button
          type="submit"
          style={{
            display: "block",
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
          }}
        >
          Submit
        </button>
      </form>

      {mutation.isPending && (
        <p>
          Submitting... <img src="/pending.gif" />
        </p>
      )}
      {mutation.isError && (
        <p>
          Something went wrong <img src="/error.gif" />
        </p>
      )}
      {mutation.isSuccess && (
        <p>
          Submitted successfully {mutation.data} <img src="/success.gif" />
        </p>
      )}

      <p>Disclaimer: Input validation is not provided.</p>
    </div>
  );
};

const Page = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "30px",
      }}
      className="window"
    >
      <div style={{ width: 650 }}>
        <NFTForm />
      </div>
      <div>
        {" "}
        built brick by brick by <a href="https://blog.chiu.fyi/">chiu.fyi</a>
        <div>
          tips:
          0x9e17437360ef302868607ce277c379406f9ad7313e919ebf89605a4ba9ddc9ec
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ width: 300 }} className="window">
      <div className="title-bar">
        <div className="title-bar-text">Counter</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" />
          <button aria-label="Maximize" />
          <button aria-label="Close" />
        </div>
      </div>

      <div className="window-body">
        <p style={{ textAlign: "center" }}>Current count: {count}</p>
        <div className="field-row" style={{ justifyContent: "center" }}>
          <button onClick={() => setCount(count + 1)}>+</button>
          <button onClick={() => setCount(count - 1)}>-</button>
          <button onClick={() => setCount(0)}>0</button>
        </div>
      </div>
    </div>
  );
};

// import { getTodos, postTodo } from '../my-api'

// Create a client
const queryClient = new QueryClient();

export default function App() {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>
  );
}
