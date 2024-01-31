import { ethers } from "hardhat";
import fs from 'fs';

async function main() {
    const daiToken = await ethers.deployContract("TestToken", ['Dai Stable Coin', 'DAI'])
    await daiToken.waitForDeployment();
    const daiAddress = await daiToken.getAddress();

    const zrxToken = await ethers.deployContract("TestToken", ['Xero Token', 'ZRX'])
    await zrxToken.waitForDeployment();
    const zrxAddress = await zrxToken.getAddress();

    const orderBookDex = await ethers.deployContract("OrderBookDex");
    await orderBookDex.waitForDeployment();
    const orderBookDexAddress = await orderBookDex.getAddress();

    const adresses = {
        OBDex: orderBookDexAddress,
        dai: daiAddress,
        zrx: zrxAddress
    }

    fs.writeFileSync(
        'client/src/contract-addresses.json', 
        JSON.stringify({ adresses }), 
        { flag: 'w' }
    )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
