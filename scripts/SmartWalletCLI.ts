// Reference https://github.com/safe-global/safe-core-sdk/blob/main/guides/integrating-the-safe-core-sdk.md
// EXTEME CODING PLEASE IGNORE QUALITY AND VERIFICATIONS
import { ethers } from "hardhat";
import Safe, { EthersAdapter, SafeFactory, SafeAccountConfig, EthersAdapterConfig } from '@safe-global/protocol-kit'
import { SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types'
import * as readline from "readline";
import * as dotenv from 'dotenv';
dotenv.config();

let ethAdapter: EthersAdapter;
let safeSdk: Safe;

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
  const pkey = process.env.PRIVATE_KEY_ACCOUNT1;
  const providerUrl = `https://${selectedNetwork}.infura.io/v3/${infuraApiKey}`;
  const wallet = new ethers.Wallet(`${pkey}`);
        
  if ( selectedNetwork == "goerli" || selectedNetwork == "optimism-goerli"){
      const provider = new ethers.providers.InfuraProvider(
          selectedNetwork,
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
  const safeOwner = await initProvider(selectedNetwork);
  ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: safeOwner
  });  
}

async function deploySafe( owners: string | string [] ){

  const safeFactory = await SafeFactory.create({ ethAdapter })

  if(typeof owners === 'string' )
    owners = [owners]

  const threshold = 1
  const safeAccountConfig: SafeAccountConfig = {
      owners,
      threshold
      // ...
  }

  safeSdk = await safeFactory.deploySafe({ safeAccountConfig })
}

async function connectSafe(safeAddress: string){
  safeSdk = await Safe.create({ ethAdapter: ethAdapter, safeAddress })
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
  // ToDo Make safeOwner.address public Variable
  // const isOwner = await safeSdk.isOwner(safeOwner.address) 
  // console.log(`is the safeOwner an Owner?: (${isOwner})\n`);

}

async function depositToSafe(amount: string){
    // TODO
// await safeOwner.sendTransaction({
//     to: newSafeAddress,
//     value: ethers.utils.parseEther(amount),
// }) 
}

async function createSafeTx(_to: string, amount: string){
  // Create Transaction
  //const safeTransactionData: SafeTransactionDataPartial = {
  //    to: _to,
  //    value: ethers.utils.parseEther(amount),
  //    data: '0x' // ToDo Add Parameter
  //}
  //const safeTransaction = await safeSdk.createTransaction({ safeTransactionData })
  //console.log(`SafeTrandactionData: (${safeTransaction})\n`);
}

async function signAndExecuteSafeTx(){
  // Sign Transaction
  
  //const txHash = await safeSdk.getTransactionHash(safeTransaction)
  //const approveTxResponse = await safeSdk.approveTransactionHash(txHash)
  //await approveTxResponse.transactionResponse?.wait()
  //console.log(`approvedTx: (${approveTxResponse})\n`);

  // Execute Transaction
  
  //const executeTxResponse = await safeSdk.executeTransaction(safeTransaction)
  //await executeTxResponse.transactionResponse?.wait()
  //console.log(`executedTx: (${executeTxResponse})\n`);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})
