const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")
const tokenId = 7

const buyItem = async () => {
  const nftMarketplace = await ethers.getContract("NftMarketplace")
  const basicNft = await ethers.getContract("BasicNft")
  const listing = await nftMarketplace.getListing(basicNft.address, tokenId)
  const price = listing.price.toString()
  const tx = await nftMarketplace.buyItem(basicNft.address, tokenId, {
    value: price,
  })
  await tx.wait(1)
  console.log("Nft Bought!")

  if (network.config.chainId == "31337") {
    await moveBlocks(2, 1000)
  }
}

buyItem()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
