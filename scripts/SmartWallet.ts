// Reference https://github.com/safe-global/safe-core-sdk/blob/main/guides/integrating-the-safe-core-sdk.md
import { ethers } from "hardhat";
import { EthersAdapter } from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'
import Safe, { SafeFactory, SafeAccountConfig } from '@safe-global/protocol-kit'
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  //await initAccounts();
  // Setup Provider
  // const provider = new ethers.JsonRpcProvider(
  //         process.env.ALCHEMY_BASE_RPC_URL
  //     );
  // Optimism.. does not have an URL to the constructor of the Safe Transaction Service
  //const provider = new ethers.providers.AlchemyProvider("optimism-goerli",
  //         process.env.ALCHEMY_API_KEY_OPTIMISM_GOERLI
  //     );
  // Goerli
  const provider = new ethers.providers.AlchemyProvider("goerli",
             process.env.ALCHEMY_API_KEY_GOERLI
         );


  //console.log({ provider });
  const pkey = process.env.PRIVATE_KEY_ACCOUNT;
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

  // Initialize the Safe API Kit

  //const txServiceUrl = 'https://safe-transaction-goerli.safe.global'
  //const safeService = new SafeApiKit({ txServiceUrl, ethAdapter })

  // Initialize the Protocol Kit
  
  // const safeFactory = await SafeFactory.create({ ethAdapter, isL1SafeMasterCopy: true })
  // const safeSdk = await Safe.create({ ethAdapter, safeAddress, isL1SafeMasterCopy: true })
  
  // Deploy a Safe 

  const safeFactory = await SafeFactory.create({ ethAdapter })

  const owners = ['0x934a406B7CAB0D8cB3aD201f0cdcA6a7855F43b0',
      '0xDDd93CEC5843f471Eb2b8B2886b2Be32555B5209',
      '0xD64258a33E7AC0294a9fdE8e4C9A76674bD33A23']
  const threshold = 2
  const safeAccountConfig: SafeAccountConfig = {
      owners,
      threshold
      // ...
  }

  const safeSdk: Safe = await safeFactory.deploySafe({ safeAccountConfig })
  
  //const safeAccountConfig: SafeAccountConfig = {
  //    owners: ['0x934a406B7CAB0D8cB3aD201f0cdcA6a7855F43b0',
  //        '0xDDd93CEC5843f471Eb2b8B2886b2Be32555B5209',
  //        '0xD64258a33E7AC0294a9fdE8e4C9A76674bD33A23'],
  //    threshold: 2,
  //    // ... (optional params)
  //}
  //const safeSdk = await safeFactory.deploySafe({ safeAccountConfig })
    
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})
