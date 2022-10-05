const Moralis = require("moralis-v1/node")
require("dotenv").config()

const contractAddresses = require("../constants/networkMapping.json")

const chainId = process.env.chainId || 31337
// Note: Moralis recognize 1337 as localhost chainId, hence we have to dinamically update it
const moralisChainId = chainId == "31337" ? "1337" : chainId
const contractAddress = contractAddresses[chainId].NftMarketplace[0]

/* Moralis Init Code */
const {
  NEXT_PUBLIC_MORALIS_APP_ID,
  NEXT_PUBLIC_MORALIS_SERVER_URL,
  moralisMasterKey,
} = process.env

const serverUrl = NEXT_PUBLIC_MORALIS_SERVER_URL
const appId = NEXT_PUBLIC_MORALIS_APP_ID
const masterKey = moralisMasterKey

async function main() {
  await Moralis.start({ serverUrl, appId, masterKey })
  console.log(`Init Moralis`)
  console.log(`Working with contract address: ${contractAddress}`)

  // Configuring moralis in order to listen to emitted events
  // ItemListed Event:
  const itemListedOptions = {
    address: contractAddress,
    chainId: moralisChainId,
    // allows te node to go back and keep trace of every event emitted from the blockchain
    sync_historical: true,
    // describe the event arguments ( types )
    topic: "ItemListed(address, address, uint256, uint256)",
    // describe the event abi
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "seller",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "nftAddress",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "price",
          type: "uint256",
        },
      ],
      name: "ItemListed",
      type: "event",
    },
    // describe the moralis db table name
    tableName: "ItemListed",
  }
  const itemBoughtOptions = {
    address: contractAddress,
    chainId: moralisChainId,
    // allows te node to go back and keep trace of every event emitted from the blockchain
    sync_historical: true,
    // describe the event arguments ( types )
    topic: "ItemBought(address, address, uint256, uint256)",
    // describe the event abi
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "receiver",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "nftAddress",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "price",
          type: "uint256",
        },
      ],
      name: "ItemBought",
      type: "event",
    },
    // describe the moralis db table name
    tableName: "ItemBought",
  }
  const itemDeletedOptions = {
    address: contractAddress,
    chainId: moralisChainId,
    // allows te node to go back and keep trace of every event emitted from the blockchain
    sync_historical: true,
    // describe the event arguments ( types )
    topic: "ItemDeleted(address, address, uint256)",
    // describe the event abi
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "seller",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "nftAddress",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "ItemDeleted",
      type: "event",
    },
    // describe the moralis db table name
    tableName: "ItemDeleted",
  }

  // Now list events on our db
  // If everything works properly API should return { success: true }

  const listedResponse = await Moralis.Cloud.run(
    "watchContractEvent",
    itemListedOptions,
    { useMasterKey: true }
  ).then((result) => {
    console.log(result)
  })
  const boughtResponse = await Moralis.Cloud.run(
    "watchContractEvent",
    itemBoughtOptions,
    { useMasterKey: true }
  ).then((result) => {
    console.log(result)
  })
  const deleteResponse = await Moralis.Cloud.run(
    "watchContractEvent",
    itemDeletedOptions,
    { useMasterKey: true }
  ).then((result) => {
    console.log(result)
  })

  if (
    listedResponse.success &&
    boughtResponse.success &&
    deleteResponse.success
  ) {
    console.log("Success! Database updated with watching events")
  } else {
    console.log("Something wen wrong when listening to events...")
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
