Front + Web3 Test Task:

We have this smart contract, which is our Magazine NFT collection in Shibarium blockchain:

0x007Bbf85988cAF18Cf4222C9214e4fa019b3e002

Analytical/Blockchain part of a task:

Write code which will analyse all mint transactions and render down top 100 NFT holders - wallets whom collected most of the NFTs

Front-end part of the test:
Use NextJS API feature to perform all communication with blockchain, and return data via SSR to client

* use Shadcn + Tailwind to
* render top 100 wallets in a way of cards with infinite scrolling
* 6 cards per row on desktop, 3 cards on mobile
* Order elements by minted NFTs count of wallet