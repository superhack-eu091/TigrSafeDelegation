import { ethers } from 'hardhat';
import * as dotenv from 'dotenv';
dotenv.config();

let signer: ethers.Wallet;


async function main() {
  const NFTContract = await ethers.getContractFactory('TigrRulez');
  const nft = await NFTContract.deploy();
  await nft.deployed();

  const minterRole = await nft.MINTER_ROLE();

  const [signer] = await ethers.getSigners();
  await nft.grantRole(minterRole, signer.address);

  const uris = [
    'QmbmGdGzfuD4rzXzsip7c6QPuKSSLLDLCSwCrbG16NbN2n',
    'QmdNWDWcBMcngb6HCM3TyXMuM17jjHWJqV2Dnv3wuQz1zs',
    'Qmc4RX4ZppPGMbEHuSew48x23ZbgtZfhCxG2AaMpaBh7Je',
    'QmVCxdnBiXwMRw1qaY4sRTU3qeXSZZ7yYucFDfA3YWt9aD',
    'Qmf5YUrtjnbk3X6wPDhAXK3okPffbf7oyZGZeAnrwRWFHL',
    'QmSHG6wuTbg3bW1yNYqQahQ1RfVpkzc7Btq2kc9xGLZKUg',
  ];

  for (let i = 0; i < uris.length; i++) {
    const randomIndex = Math.floor(Math.random() * uris.length);
    const selectedURI = uris[randomIndex];
    uris.splice(randomIndex, 1);

    await nft.safeMint(signer.address, selectedURI);

    console.log(`NFT minted with URI: ${selectedURI}`);
  }
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
      )

      signer = wallet.connect(provider);
  }
  else{
      const provider = new ethers.providers.JsonRpcProvider(providerUrl);
      signer = wallet.connect(provider);
  } 
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

