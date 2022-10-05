const { deployments, getNamedAccounts, network } = require("hardhat")
const { verify } = require("../utils/verify")
const { devChains } = require("../helper-hardhat-config")

module.exports = async () => {
  const { deployer } = await getNamedAccounts()
  const { log, deploy } = deployments

  log("Deploying NFT market-place")

  const args = []
  const nftMarketPlace = await deploy("NftMarketplace", {
    from: deployer,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
    args,
  })

  log("Contract successfully deployed!")
  if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(nftMarketPlace.address, args)
  }
  log("----------------------------------------------")
}

module.exports.tags = ["all", "nftmarketplace"]
