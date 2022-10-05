const fs = require("fs")
const { ethers, network } = require("hardhat")

const networkMapping = "../frontend-moralis/constants/networkMapping.json"

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Updating front-end...")
    await updateContractAddresses()
    console.log("Frontend Updated!")
  }
}

async function updateContractAddresses() {
  const nftMarketPlace = await ethers.getContract("NftMarketplace")
  // const basicNft = await ethers.getContract("BasicNft")
  const chainId = network.config.chainId.toString()
  const _contractAddresses = fs.readFileSync(networkMapping, "utf8")
  const contractAddresses = await JSON.parse(_contractAddresses)

  if (chainId in contractAddresses) {
    if (
      !contractAddresses[chainId].NftMarketplace.includes(
        nftMarketPlace.address
      )
    ) {
      !contractAddresses[chainId]["NftMarketplace"].push(nftMarketPlace.address)
    } else {
      contractAddresses[chainId].NftMarketplace = [nftMarketPlace.address]
      // contractAddresses[chainId] = { NftMarketplace: [nftMarketPlace.address] }
    }

    fs.writeFileSync(networkMapping, JSON.stringify(contractAddresses))
  }
}
module.exports.tags = ["all", "frontend"]
