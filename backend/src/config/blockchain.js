import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const provider = new ethers.JsonRpcProvider(
  process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545',
);

const wallet = process.env.PRIVATE_KEY
  ? new ethers.Wallet(process.env.PRIVATE_KEY, provider)
  : null;

export { provider, wallet };
