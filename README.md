# TheShibCovers NFT Collection Analytics

This project indexes NFT mint transactions on the Shibarium blockchain and displays the top 100 NFT holders using Next.js, Tailwind CSS, and Shadcn UI.

## Setup

1. **Clone & Install**

    ```bash
    git clone https://github.com/alexaganov/shibcovers-nft-assigment.git
    cd shibcovers-nft-assigment
    npm install
    ```

2. **Configure Environment Variables**

    Create a `.env.local` file at the project root with:

    ```env
    # MongoDB connection URI
    MONGODB_URI=your_mongodb_connection_uri

    # NFT contract details
    NFT_CONTRACT_ADDRESS=0x007Bbf85988cAF18Cf4222C9214e4fa019b3e002
    NFT_CONTRACT_DEPLOYMENT_BLOCK=1534736

    # Host URL for the Next.js application (exposed to the client)
    NEXT_PUBLIC_HOST=http://localhost:3000
    ```

3. **Run Initial Indexing Locally**

    Because the NFT contract might have many blocks, it's best to index them locally before users visit the site.
    Trigger the initial indexing by calling the /api/top-holders endpoint. You can do this by opening your browser next path: `/api/top-holders`
    This process will go through all blocks and index mint transactions.
    Please note that it may take some time to complete.

4. **Run the App**

    ```bash
    npm run dev
    ```

    Visit [http://localhost:3000](http://localhost:3000).

## How It Works

- **Blockchain Indexing:**
  An API route fetches mint logs, updates the database, and aggregates the top 100 NFT holders.

- **Frontend:**
  The home page uses infinite scrolling to render wallet cards (6 per row on desktop, 3 on mobile).
