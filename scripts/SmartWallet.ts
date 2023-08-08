import { ethers } from "hardhat";
import { EthersAdapter } from '@safe-global/protocol-kit'
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as dotenv from 'dotenv';
dotenv.config();

let accounts: SignerWithAddress[];

async function main() {
  await initAccounts();
  // Setup Provider
  //const provider = new ethers.JsonRpcProvider(
  //        process.env.ALCHEMY_BASE_RPC_URL
  //    );
  // const provider = new ethers.JsonRpcProvider(
  //           "HTTP://127.0.0.1:7545"
  //       );


  //console.log({ provider });
  //const pkey = process.env.PRIVATE_KEY_ACCOUNT;
  //console.log({ pkey });
  //const balanceBN = await ethers.provider.getBalance(
  //  accounts[Number(index)].address
  //);
  //const lastBlock = await provider.getBlock("latest");
  //console.log({ lastBlock });
  //const wallet = new ethers.Wallet(`${pkey}`);
  //const signer = wallet.connect(provider);

  const safeOwner = ethers.provider.getSigner(0)


  console.log({ safeOwner });

  const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: safeOwner
  })

    
}

async function initAccounts() {
  accounts = await ethers.getSigners();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})
