const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

async function main() {
  const PRICE = ethers.utils.parseEther("0.1")
  const nftMarketplace = await ethers.getContract("NftMarketplace")
  const basicNft = await ethers.getContract("BasicNft")

  // Minting NFT
  console.log("minting...")
  const mintTx = await basicNft.mintNft()
  const mintTxReceipt = await mintTx.wait(1)
  const { tokenId } = mintTxReceipt.events[0].args

  // Approving NFT
  console.log("Approving NFT...")
  const approvalTx = await basicNft.approve(nftMarketplace.address, tokenId)
  await approvalTx.wait(1)

  // Listing NFT
  const listTx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
  await listTx.wait(1)

  console.log("Listed!")

  if (network.config.chainId == "31337") {
    await moveBlocks(2, 1000)
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err)
    process.exit(1)
  })
