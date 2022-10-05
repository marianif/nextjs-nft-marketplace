const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")
const tokenId = 3

const deleteItem = async () => {
  const nftMarketplace = await ethers.getContract("NftMarketplace")
  const basicNft = await ethers.getContract("BasicNft")
  const tx = await nftMarketplace.cancelItem(basicNft.address, tokenId)
  await tx.wait(1)
  console.log("Nft Deleted")

  if (network.config.chainId == "31337") {
    await moveBlocks(2, 1000)
  }
}

deleteItem()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
