const devChains = ["hardhat", "localhost"]

const networkConfig = {
  31337: {
    name: "localhost",
  },
  5: {
    name: "goerli",
  },
}

module.exports = {
  devChains,
  networkConfig,
}
