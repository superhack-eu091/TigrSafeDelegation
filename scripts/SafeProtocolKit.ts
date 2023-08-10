// Reference https://github.com/safe-global/safe-core-sdk/blob/main/guides/integrating-the-safe-core-sdk.md
import { ethers } from "hardhat";
import Safe, { EthersAdapter, SafeFactory, SafeAccountConfig } from '@safe-global/protocol-kit'
import { SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types'
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  //await initAccounts();
  // Setup Provider const provider = new ethers.JsonRpcProvider(
  //         process.env.ALCHEMY_BASE_RPC_URL
  //     );
  // Optimism.. does not have an URL to the constructor of the Safe Transaction Service
  //const provider = new ethers.providers.AlchemyProvider("optimism-goerli",
  //         process.env.ALCHEMY_API_KEY_OPTIMISM_GOERLI
  //     );
  // Goerli Alchemy
  // const provider = new ethers.providers.AlchemyProvider("goerli",
  //            process.env.ALCHEMY_API_KEY_GOERLI
  //        );
  const provider = new ethers.providers.InfuraProvider(
      "goerli",
      process.env.INFURA_API_KEY
  );


  //console.log({ provider });
  const pkey = process.env.PRIVATE_KEY_ACCOUNT1;
  //console.log({ pkey });
  //const balanceBN = await ethers.provider.getBalance(
  //  accounts[Number(index)].address
  //);
  const lastBlock = await provider.getBlock("latest");
  console.log({ lastBlock});
  const wallet = new ethers.Wallet(`${pkey}`);
  //const signer = wallet.connect(provider);
  const safeOwner = wallet.connect(provider);

  // Create an EthersAdapter instance
  //const safeOwner = ethers.provider.getSigner(0)

  console.log({ safeOwner });

  const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: safeOwner
  })  
  
  // Deploy a Safe 

  //const safeFactory = await SafeFactory.create({ ethAdapter })

  //const owners = ['0x934a406B7CAB0D8cB3aD201f0cdcA6a7855F43b0']
  //const threshold = 1
  //const safeAccountConfig: SafeAccountConfig = {
  //    owners,
  //    threshold
  //    // ...
  //}

  //const safeSdk: Safe = await safeFactory.deploySafe({ safeAccountConfig })
 
  // Connect to an Already Deployed Safe at newSafeAddress

  //const safeAddress = '0x2fACb719c0B8954deb288e913D03030Ecbb66a50'
  const safeAddress = '0x3FA6c296F8aD959d55BA209A3A7243b0Aba6B7DC'
  const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress })

  // Get the Safe Address
  const newSafeAddress = await safeSdk.getAddress()
  console.log(`the Safe Address is: (${newSafeAddress})\n`);

  // Test Getting Some Safe Data

  console.log(`the Safe Address is: (${newSafeAddress})\n`);
  const ownerAddresses = await safeSdk.getOwners()
  console.log(`Owners Addresses are: (${ownerAddresses})\n`);
  //const threshold = await safeSdk.getThreshold()
  //console.log(`the threshold is: (${threshold})\n`);
  const balance = await safeSdk.getBalance()
  console.log(`the Safe Balance is: (${balance})\n`);
  const guardAddress = await safeSdk.getGuard()
  console.log(`the guardAddress is: (${guardAddress})\n`);
  const moduleAddresses = await safeSdk.getModules()
  console.log(`the Modules enabled are: (${moduleAddresses})\n`);
  const isOwner = await safeSdk.isOwner(safeOwner.address) 
  console.log(`is the safeOwner an Owner?: (${isOwner})\n`);

 // Deposit to the safe
  
 //await safeOwner.sendTransaction({
 //    to: newSafeAddress,
 //    value: ethers.utils.parseEther("0.001"),
 //}) 


  // Create Transaction
  
  const safeTransactionData: SafeTransactionDataPartial = {
      to: '0xDDd93CEC5843f471Eb2b8B2886b2Be32555B5209',
      value: '40000000000000000',
      data: '0x'
  }
  const safeTransaction = await safeSdk.createTransaction({ safeTransactionData })
  console.log(`SafeTrandactionData: (${safeTransaction})\n`);

  // Sign Transaction
  
  const txHash = await safeSdk.getTransactionHash(safeTransaction)
  const approveTxResponse = await safeSdk.approveTransactionHash(txHash)
  await approveTxResponse.transactionResponse?.wait()
  console.log(`approvedTx: (${approveTxResponse})\n`);

  // Execute Transaction
  
  const executeTxResponse = await safeSdk.executeTransaction(safeTransaction)
  await executeTxResponse.transactionResponse?.wait()
  console.log(`executedTx: (${executeTxResponse})\n`);



}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})
