// EXTEME CODING PLEASE IGNORE QUALITY AND VERIFICATIONS
import { ethers } from "hardhat";
import * as readline from "readline";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TigrsNFT__factory } from "../typechain-types";
import * as dotenv from 'dotenv';
dotenv.config();

let signer: ethers.Wallet;
let NFTContract: TigrsNFT__factory;
let accounts: SignerWithAddress[];

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
    // [2]: Deploy NFTContract 
    // [3]: Connect to NFT Contract 
    // [4]: Mint NFT 
    // [5]: Fetch NFT Data 
    // [6]: Burn NFT 

  rl.question(
    "Select operation: \n Options: \n [0]: Exit \n [1]: Select Network \n [2]: Deploy NFTContract  \n [3]: Connect NFT Contract \n [4]: Mint NFT \n [5]: Fetch NFT Data \n [6]: Burn NFT \n",
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
                await initProvider(selectedNetwork);
            } catch (error) {
              console.log("error\n");
              console.log({ error });
            }
            mainMenu(rl);
          });
          break;
        case 2:
          rl.question("Deploy Contract\n", async (owners) => {
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
      const provider = new ethers.providers.InfuraProvider( selectedNetwork,
          infuraApiKey
      );
      signer = wallet.connect(provider);
  }
  else{
      const provider = new ethers.providers.JsonRpcProvider(providerUrl);
      signer = wallet.connect(provider);
  } 
}

async function deployTigrRulez(): Promise<string> {
  const [deployer] = await ethers.getSigners();

  // Replace with the actual contract factory and constructor arguments
  const TigrRulezFactory = await ethers.getContractFactory("TigrRulez");
  const tigrRulezContract = await TigrRulezFactory.connect(deployer).deploy();
  await tigrRulezContract.deployed();

  console.log("TigrRulez deployed to:", tigrRulezContract.address);
  return tigrRulezContract.address;
}

async function mintNFT(contractAddress: string, contractAbi: any) {
  const [deployer] = await ethers.getSigners();

  const tigrRulezContract = new ethers.Contract(contractAddress, contractAbi, deployer);

  const toAddress = deployer.address;
  const tokenUri = "ipfs://your-token-uri";
  await tigrRulezContract.safeMint(toAddress, tokenUri);
  console.log("Minted a new NFT");
}

async function getTotalSupply(contractAddress: string, contractAbi: any) {
  const [deployer] = await ethers.getSigners();

  const tigrRulezContract = new ethers.Contract(contractAddress, contractAbi, deployer);

  const totalSupply = await tigrRulezContract.totalSupply();
  console.log("Total supply of NFTs:", totalSupply.toString());
}

async function getTokenOwner(contractAddress: string, contractAbi: any, tokenId: number) {
  const [deployer] = await ethers.getSigners();

  const tigrRulezContract = new ethers.Contract(contractAddress, contractAbi, deployer);

  const tokenOwner = await tigrRulezContract.ownerOf(tokenId);
  console.log(`Owner of token ${tokenId}:`, tokenOwner);
}

async function getTokenURI(contractAddress: string, contractAbi: any, tokenId: number) {
  const [deployer] = await ethers.getSigners();

  const tigrRulezContract = new ethers.Contract(contractAddress, contractAbi, deployer);

  const tokenURI = await tigrRulezContract.tokenURI(tokenId);
  console.log(`Token URI of token ${tokenId}:`, tokenURI);
}

async function depositToSafe(amount: string){
  const newSafeAddress = await safeSdk.getAddress();
  const txReceipt = await safeOwner.sendTransaction({
      to: newSafeAddress,
      value: ethers.utils.parseEther(amount)
  }) 
  console.log(`TxRecepit: (${txReceipt})\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})
