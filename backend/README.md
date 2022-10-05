# NFT Marketplace

This project is a simpler version of artio.io: a completelt open-source decentralized smart contract NFT marketplace

#### Tech Stack notes:

We are going to have two different front-end repos that are sligthly different providing two different ways to handle events: using the Moralis Indexer (centralized database) and TheGraph Indexer (Decentralized Db).

Usually a centralized approach is a better solutions for speeding up development process, it's usually the best way to get an MVP done. There are a lot of projects that have a decentralized backend and a centralized frontend ( such as Opensea )

###### Summary:

- Connect to a web3 provider
- Displaying NFTs once connected
- If we are on address that's own by us the interface will render "own by you"
- Else it will show the owner address
- If an NFT is own by us we can dinamically update listing, i.e change it's price in ETH, or cancel listing.
- If we are using an account that's not the owner account we can buy nfts
- We can also sell Nfts via a simple form that requires the NFT Address, token Id and chosen selling price.
- The marketplace keeps tracks of the transaction, hence we can withdraw our funds once our NFT ( or NFTs ) is sold

##### Implemented Logic:

1. `listItem`: List NFTs on the marketplace
2. `buyitem`: Buy NFTs
3. `cancelItem`: Cancel a listing
4. `updateListing`: Update Price
5. `withdrawProceeds`: Withdraw payments for my bought NFTs

Subtopic: we wrote the code in order to avoid a re-entracy hack attack.
