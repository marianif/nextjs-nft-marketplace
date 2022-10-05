/* 
A script that automatically allows to add one block confirmation
on the top of our local hardhat chain so that the state of the previous tx
changes to confirmed.

Infact, we want our NFT to be listed not when tx in sent, but when is sent AND confirmed.
Now we can manually mine blocks.
*/

const { network } = require("hardhat")

// @param amount: the number of blocks we want to move
// @param waitAmount: an optional paramater in case we want to emulate a real blockchain and wait n seconds between blocks moving

function wait(timeInMs) {
  return new Promise((resolve) => setTimeout(resolve, timeInMs))
}

async function moveBlocks(amount, waitAmount = 0) {
  console.log("Moving blocks...")
  for (let index = 0; index < amount; index++) {
    await network.provider.request({
      method: "evm_mine",
      params: [],
    })
    if (waitAmount) {
      console.log(`Waiting for ${waitAmount}...`)
      await wait(waitAmount)
    }
  }

  console.log(`Moved ${amount} blocks`)
}

module.exports = {
  moveBlocks,
}
