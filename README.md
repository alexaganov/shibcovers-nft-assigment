# TheShibCovers NFT Collection - Web3 & Next.js Test Task

This repository contains a test task that demonstrates a full-stack Web3 solution. The project indexes mint transactions from a TheShibCovers NFT collection on the Shibarium blockchain and renders a list of the top 100 NFT holders via a Next.js application.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)

## Overview

The application performs the following:

- **Blockchain Analysis**:  
  - Connects to the Shibarium blockchain using the Viem library.
  - Analyzes all mint transactions of the TheShibCovers NFT collection.
  - Identifies and indexes the top NFT holders (wallets with the most minted NFTs).

- **API & Data Fetching**:  
  - Uses Next.js API routes with SSR to fetch and process blockchain data.
  - Aggregates data from a MongoDB database.

- **Frontend Display**:  
  - Uses Shadcn UI components with Tailwind CSS.
  - Displays the top 100 wallet addresses as cards with infinite scrolling.
  - Responsive grid layout with 6 cards per row on desktop and 3 on mobile.

## Features

- **Blockchain Integration**:  
  - Connects to the Shibarium blockchain.
  - Processes `Transfer` events (mint transactions) from a given smart contract address.

- **Database Indexing**:  
  - Uses MongoDB to store and update contract metadata and holder data.
  - Bulk writes holder data to optimize database performance.

- **Responsive UI**:  
  - Implements a card-based layout that adapts to different screen sizes.
  - Infinite scrolling to load more results on demand.

## Architecture

The main logic is divided into two parts:

1. **Analytical/Blockchain Layer**:  
   - Connects to the blockchain and processes `Transfer` events.
   - Indexes NFT mint transactions and updates MongoDB documents accordingly.
   - Uses a locking mechanism to prevent concurrent indexing.

2. **Frontend Layer**:  
   - Next.js SSR API route fetches and aggregates top NFT holders.
   - The client renders the data using a card-based UI (with infinite scrolling).

## Setup & Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/alexaganov/shibcovers-nft-assigment.git
   cd shibcovers-nft-assigment
   ```

2. **Install Dependencies**

   Ensure you have [Node.js](https://nodejs.org/) installed, then run:

   ```bash
   npm install
   ```

3. **Setup Environment Variables**

   Create a `.env.local` file at the root of the project and add the following variables:

   ```env
   # MongoDB connection URI
   MONGODB_URI=your_mongodb_connection_uri

   # Smart contract address for the TheShibCovers NFT collection
   NFT_CONTRACT_ADDRESS=0x007Bbf85988cAF18Cf4222C9214e4fa019b3e002

   # Block number where the NFT contract was deployed
   NFT_CONTRACT_DEPLOYMENT_BLOCK=1534736

   # Host
   NEXT_PUBLIC_HOST=http://localhost:3000
   ```

4. **Run the Application**

   To start the development server, run:

   ```bash
   npm run dev
   ```

   The application should now be available at [http://localhost:3000](http://localhost:3000).

## Environment Variables

- **MONGODB_URI**:  
  Your MongoDB connection string.

- **NFT_CONTRACT_ADDRESS**:  
  The address of the NFT contract (in this case, the TheShibCovers NFT collection on Shibarium).

- **NFT_CONTRACT_DEPLOYMENT_BLOCK**:  
  The block number at which the NFT contract was deployed. This is used as a starting point for indexing.

- **NEXT_PUBLIC_HOST**:  
  The host URL for the Next.js application.

## Usage

- **Indexing Minted NFTs**:  
  When the API endpoint is accessed, it triggers the `indexMintedNfts` function which:
  - Fetches new blockchain logs for mint transactions.
  - Updates the database with newly minted NFTs.
  - Utilizes a lock mechanism to ensure a single indexing process runs at any given time.

- **Fetching Top NFT Holders**:  
  The GET API route aggregates wallet data:
  - Projects the number of NFTs held by each wallet.
  - Sorts and limits the results to the top 100 NFT holders.
  - Supports pagination via `limit` and `offset` query parameters.

- **Frontend Display**:
  The top NFT holders are rendered in a responsive grid layout with infinite scrolling.
  - **Desktop**: 6 cards per row.
  - **Mobile**: 3 cards per row.
