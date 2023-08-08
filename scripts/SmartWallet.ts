import { ethers } from "hardhat";
import { EthersAdapter } from '@safe-global/protocol-kit'
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  // Deploy ERC20Votes Contract
  const provider = new ethers.AlchemyProvider(network?: Networkish, apiKey?: null | string)(
      "maticmum",
      process.env.INFURA_API_KEY
  );
  //const provider = new ethers.providers.InfuraProvider(
  //    "goerli",
  //    process.env.INFURA_API_KEY
  //);

  const safeOwner = provider.getSigner(0)

  const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: safeOwner
  })

    
  console.log({ provider });
  const pkey = process.env.PRIVATE_KEY_ACCOUNT1;
  console.log({ pkey });
  const lastBlock = await provider.getBlock("latest");
  console.log({ lastBlock });
  const wallet = new ethers.Wallet(`${pkey}`);
  const signer = wallet.connect(provider);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})
