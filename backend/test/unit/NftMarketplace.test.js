const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { devChains } = require("../../helper-hardhat-config")

// Tests will be fully covered on the fly...

!devChains.includes(network.name)
  ? describe.skip
  : describe("NFT Marketplace unit testing", () => {
      let deployer, nftMarketplace, basicNft, otherUser
      const PRICE = ethers.utils.parseEther("0.1")
      const TOKEN_ID = 0
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        otherUser = (await ethers.getSigners())[1]
        // just in case we want to connect to another account
        /// otherUser = (await getNamedAccounts()).otherUser
        /// method 1 => await ethers.getContract('nftMarketplace', otherUser)
        /// method 2 => await nftMarketPlaceContract.connect(otherUser)
        await deployments.fixture(["all"])
        basicNft = await ethers.getContract("BasicNft")
        nftMarketplace = await ethers.getContract("NftMarketplace")
        await basicNft.mintNft()
        await basicNft.approve(nftMarketplace.address, TOKEN_ID)
      })

      describe("listItem", async () => {
        it("should list a new item and emit an event", async () => {
          expect(
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.emit("ItemListed")
        })

        it("should revert if price is below or equal 0", async () => {
          expect(
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, 0)
          ).to.be.revertedWith("PriceMustBeAboveZero")
        })
      })

      describe("buyItem", async () => {
        it("should revert if value sent is equal or below 0", async () => {
          const nftMarketplaceBuyer = nftMarketplace.connect(otherUser)

          expect(
            nftMarketplaceBuyer.buyItem(basicNft.address, TOKEN_ID, {
              value: 0,
            })
          ).to.be.revertedWith("PriceNotMet")
        })
      })
    })
