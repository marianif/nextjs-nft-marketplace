const { deployments, getNamedAccounts, network } = require("hardhat")
const { verify } = require("../utils/verify")
const { devChains } = require("../helper-hardhat-config")

module.exports = async () => {
  const { deployer } = await getNamedAccounts()
  const { log, deploy } = deployments

  log("Deploying Basic NFT")

  const args = []
  const basicNft = await deploy("BasicNft", {
    from: deployer,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
    args,
  })

  log("Contract successfully deployed!")
  if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(basicNft.address, args)
  }
  log("----------------------------------------------")
}

module.exports.tags = ["all", "basicnft"]
