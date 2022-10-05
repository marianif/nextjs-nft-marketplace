/*
Create a new table called "ActiveItem"
Add items when they are listed on the marketplace
Remove them when are bought or canceled
*/

const task = "[Marketplace]"

Moralis.Cloud.afterSave("ItemListed", async (request) => {
  // @method at request.object.get => allows to get the value of the updated row with that argument
  const confirmed = request.object.get("confirmed")
  const logger = Moralis.Cloud.getLogger()
  logger.info("Looking for confirmed Tx")

  if (confirmed) {
    logger.info("New Item Listed and Confirmed!")
    // If ActiveItem does not exist create it, else just update it
    const ActiveItem = Moralis.Object.extend("ActiveItem")
    const activeItem = new ActiveItem()

    // @method set: allows to manually add rows in db
    activeItem.set("marketplaceAddress", request.object.get("address"))
    activeItem.set("nftAddress", request.object.get("nftAddress"))
    activeItem.set("price", request.object.get("price"))
    activeItem.set("tokenId", request.object.get("tokenId"))
    activeItem.set("seller", request.object.get("seller"))

    logger.info(
      `Adding address ${request.object.get(
        "address"
      )}, tokenId: ${request.object.get("tokenId")}`
    )

    logger.info("Saving...")
    await activeItem.save()
    logger.info("Active item successfully saved!")
  }
})

Moralis.Cloud.afterSave("ItemDeleted", async (request) => {
  const confirmed = request.object.get("confirmed")
  const logger = Moralis.Cloud.getLogger()
  logger.info("[MarketPlace] Object:", request.object)

  if (confirmed) {
    // Get table name
    const activeItem = Moralis.Object.extend("ActiveItem")
    // Setup Query
    const query = new Moralis.Query(activeItem)
    query.equalTo("marketplaceAddress", request.object.get("address"))
    query.equalTo("nftAddress", request.object.get("nftAddress"))
    query.equalTo("tokenId", request.object.get("tokenId"))
    logger.info("[MarketPlace] Query:", query)

    // Perform query
    const deletedItem = await query.first()
    logger.info("[MarketPlace] Deleted Item:", deletedItem)

    if (deletedItem) {
      logger.info(
        `[MarketPlace] Deleting ${request.object.get(
          "tokenId"
        )} at address ${request.object.get("address")} since it was canceled`
      )
      // Now remove it from activeItem
      deletedItem.destroy()
    } else {
      logger.info("No item found")
    }
  }
})

Moralis.Cloud.afterSave("ItemBought", async (request) => {
  const confirmed = request.object.get("confirmed")
  const logger = Moralis.Cloud.getLogger()
  logger.info(`${task} Object: ${request.object}`)

  if (confirmed) {
    // Get table name
    const activeItem = Moralis.Object.extend("ActiveItem")
    // Setup Query
    const query = new Moralis.Query(activeItem)
    query.equalTo("marketplaceAddress", request.object.get("address"))
    query.equalTo("nftAddress", request.object.get("nftAddress"))
    query.equalTo("tokenId", request.object.get("tokenId"))
    logger.info(`${task} Object: ${query.toString()}`)

    // Perform query
    /// @method first() allows to get the first occurence
    const boughtItem = await query.first()
    logger.info(`${task} Bought Item; ${boughtItem.toString()}`)

    if (boughtItem) {
      logger.info(
        `${task}, Removing ${request.object.get(
          "tokenId"
        )} at address ${request.object.get("address")} since it was bought`
      )

      // Remove item from table
      await boughtItem.destroy()
    } else {
      logger.info("No Item Found")
    }
  }
})
