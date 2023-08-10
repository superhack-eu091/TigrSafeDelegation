// Reference https://github.com/safe-global/safe-core-sdk/blob/main/guides/integrating-the-safe-core-sdk.md
import { ethers } from "hardhat";
import SafeApiKit from '@safe-global/api-kit'
import { EthersAdapter } from '@safe-global/protocol-kit'
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

  // Initialize the Safe API Kit

  //const txServiceUrl = 'https://safe-transaction-goerli.safe.global'
  //const safeService = new SafeApiKit({ txServiceUrl, ethAdapter })

  const safeService = new SafeApiKit({
      txServiceUrl: 'https://safe-transaction-mainnet.safe.global',
      ethAdapter
  })

  console.log({ safeService });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})
