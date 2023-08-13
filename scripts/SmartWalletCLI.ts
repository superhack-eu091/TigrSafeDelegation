// Reference https://github.com/safe-global/safe-core-sdk/blob/main/guides/integrating-the-safe-core-sdk.md
// EXTEME CODING PLEASE IGNORE QUALITY AND VERIFICATIONS
import { ethers } from "hardhat";
import Safe, { EthersAdapter, SafeFactory, SafeAccountConfig, EthersAdapterConfig } from '@safe-global/protocol-kit'
import { SafeTransaction, SafeTransactionDataPartial, SwapOwnerTxParams } from '@safe-global/safe-core-sdk-types'
import * as readline from "readline";
import * as dotenv from 'dotenv';
dotenv.config();

let ethAdapter: EthersAdapter;
let safeOwner: ethers.Wallet;
let safeSdk: Safe;
let safeTransaction: SafeTransaction;

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  mainMenu(rl);
}

async function mainMenu(rl: readline.Interface) {
  menuOptions(rl);
}

function menuOptions(rl: readline.Interface) {
    // [0]: Exit 
    // [1]: Select Network 
    // [2]: Deploy Safe 
    // [3]: Connect Safe 
    // [4]: Print Safe info 
    // [5]: Deposit to Safe 
    // [6]: Create a Safe Transaction 
    // [7]: Sign and Execute Transaction \n",

  rl.question(
    "Select operation: \n Options: \n [0]: Exit \n [1]: Select Network \n [2]: Deploy Safe \n [3]: Connect Safe \n [4]: Print Safe info \n [5]: Deposit to Safe \n [6]: Create a Safe Transaction \n [7]: Sign and Execute Transaction \n",
    async (answer: string) => {
      console.log(`Selected: ${answer}\n`);
      const option = Number(answer);
      switch (option) {
        case 0:
          rl.close();
          return;
        case 1:
          rl.question("Input Network (Example: goerli):\n ", async (selectedNetwork) => {
            try {
                await initEthAdapter(selectedNetwork);
            } catch (error) {
              console.log("error\n");
              console.log({ error });
            }
            mainMenu(rl);
          });
          break;
        case 2:
          rl.question("Input the Safe Owner\n", async (owners) => {
            // for now only works with one owner and threshold
            try {
                await deploySafe(owners);
            } catch (error) {
              console.log("error\n");
              console.log({ error });
            }
            mainMenu(rl);
          });
          break;
        case 3:
          rl.question("Input the Safe Address\n", async (safeAddress) => {
            try {
                await connectSafe(safeAddress);
            } catch (error) {
              console.log("error\n");
              console.log({ error });
            }
            mainMenu(rl);
          });
          break;
        case 4:
            await printSafeInfo();
            mainMenu(rl);
          break;
        case 5:
          rl.question("How much Eth to top Up:\n ", async (amount) => {
            try {
              await depositToSafe(amount);
            } catch (error) {
              console.log("error\n");
              console.log({ error });
            }
            mainMenu(rl);
          });
          break;
        case 6:
          rl.question("Address to send from the Safe:\n ", async (to) => {
            rl.question("Amount of Eth to send:\n ", async (amount) => {
                try {
                    await createSafeTx(to, amount);
                    await signAndExecuteSafeTx();
                } catch (error) {
                    console.log("error\n");
                    console.log({ error });
                }
            });
          mainMenu(rl);
          });
          break;
        default:
          throw new Error("Invalid option");
      }
    }
  );
}

async function initProvider(selectedNetwork: string){
  // WALLET CONNECTOR WITH PROVIDER
  // selectChain Options are:
  // goerli
  // optimism-goerli
  // ToDO: Add Base 
  const infuraApiKey = process.env.INFURA_API_KEY;
  const pkey = process.env.PRIVATE_KEY_ACCOUNT2;
  const providerUrl = `https://${selectedNetwork}.infura.io/v3/${infuraApiKey}`;
  const wallet = new ethers.Wallet(`${pkey}`);
        
  if ( selectedNetwork == "goerli" || selectedNetwork == "optimism-goerli"){
      const provider = new ethers.providers.InfuraProvider( selectedNetwork,
          infuraApiKey
      );
      return wallet.connect(provider);
  }
  else{
      const provider = new ethers.providers.JsonRpcProvider(providerUrl);
      return wallet.connect(provider);
  } 
}

async function initEthAdapter(selectedNetwork: string){
  // BUILD EthAdapter
  // by using ethers and initProvider function
  safeOwner = await initProvider(selectedNetwork);
  ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: safeOwner
  });  
}

async function addSafeSendModule(moduleAddress: string){ 
    const moduleEnabled = await safeSdk.isModuleEnabled(moduleAddress)
    if( moduleEnabled ) 
        console.log(`the Module is already added to this safe\n`);
    else {
        const safeTransaction = await safeSdk.createEnableModuleTx(moduleAddress)
        const txResponse = await safeSdk.executeTransaction(safeTransaction)
        await txResponse.transactionResponse?.wait()
    }
}


async function deploySafe(owners: string | string[],
                                   toAddress?: string,
                                   customThreshold?: number,
                                   moduleAddress?: string) {
  // The TiGr-bot deploys a safe to another user 
  const safeFactory = await SafeFactory.create({ ethAdapter });

  if (typeof owners === 'string') {
    owners = [owners];
  }

  const threshold = customThreshold !== undefined ? customThreshold : 1;

  const safeAccountConfig: SafeAccountConfig = {
    owners,
    threshold,
    // ...
  };

  safeSdk = await safeFactory.deploySafe({ safeAccountConfig });

  // Set the default module address if not provided (Goerli default)
  //const defaultModuleAddress = '0x3e85A3d5654ef96dB74f0A2d2C5154223E62b7e3';
  // Set the default module address if not provided (Optimism-Goerli default)
  const defaultModuleAddress = '0x6e4317694661BBd113Fd3907Dd0E34A6acFcac17';
  const moduleToAdd = moduleAddress !== undefined ? moduleAddress : defaultModuleAddress;

  // Call the addSafeSendModule method with the module address
  const safeOwnerAddress: string = safeOwner.address
  if (await safeSdk.isOwner(safeOwnerAddress)){
    await addSafeSendModule(moduleToAdd);
    // Set the default to address if not provided (the bot keeps it)
    if (toAddress != undefined){
      const params: SwapOwnerTxParams = {safeOwnerAddress, toAddress};
      const safeTransaction = await safeSdk.createSwapOwnerTx(params);
      const txResponse = await safeSdk.executeTransaction(safeTransaction);
      await txResponse.transactionResponse?.wait()     
    }
  }
  else
      console.log("cannot add safeSendModule you are not an owner");
}

async function connectSafe(safeAddress: string, moduleAddress?: string){
  safeSdk = await Safe.create({ ethAdapter: ethAdapter, safeAddress })
  
  // Set the default module address if not provided (Goerli default)
  //const defaultModuleAddress = '0x3e85A3d5654ef96dB74f0A2d2C5154223E62b7e3';
  // Set the default module address if not provided (Optimism-Goerli default)
  const defaultModuleAddress = '0x6e4317694661BBd113Fd3907Dd0E34A6acFcac17';
  const moduleToAdd = moduleAddress !== undefined ? moduleAddress : defaultModuleAddress;
  
  // Call the addSafeSendModule method with the module address
  const isOwner = await safeSdk.isOwner(safeOwner.address) 
  if (isOwner)
      await addSafeSendModule(moduleToAdd);
  else
      console.log("cannot add safeSendModule you are not an owner");
}

async function printSafeInfo(){
  // Getting Some Safe Data

  const newSafeAddress = await safeSdk.getAddress()
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

}

async function depositToSafe(amount: string){
  const newSafeAddress = await safeSdk.getAddress();
  const txReceipt = await safeOwner.sendTransaction({
      to: newSafeAddress,
      value: ethers.utils.parseEther(amount)
  }) 
  console.log(`TxRecepit: (${txReceipt})\n`);
}

async function createSafeTx(_to: string, amount: string){
  // Create Transaction
  const amountWei = ethers.utils.parseEther(amount).toString(); // Convert to wei
  const safeTransactionData: SafeTransactionDataPartial = {
      to: _to,
      value: amountWei,
      data: '0x' // ToDo Add Parameter
  }
  safeTransaction = await safeSdk.createTransaction({ safeTransactionData })
  console.log(`SafeTrandaction: (${safeTransaction})\n`);
}

async function signAndExecuteSafeTx(){
  // Sign Transaction
  
  const txHash = await safeSdk.getTransactionHash(safeTransaction)
  const approveTxResponse = await safeSdk.approveTransactionHash(txHash)
  await approveTxResponse.transactionResponse?.wait()
  console.log(`approvedTx: (${approveTxResponse})\n`);

  // Execute Transaction
  
  const executeTxResponse = await safeSdk.executeTransaction(safeTransaction)
  const txReceipt = await executeTxResponse.transactionResponse?.wait()
  console.log(`executedTx: (${txReceipt?.transactionHash})\n`);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})
