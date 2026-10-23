import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { Buffer } from 'buffer';

export const SOLANA_PROGRAM_ID = import.meta.env.VITE_SOLANA_PROGRAM_ID;
export const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

const utf8 = (value) => new TextEncoder().encode(value);
const u64le = (value) => {
  let integer = BigInt(value);
  const bytes = new Uint8Array(8);
  for (let index = 0; index < 8; index += 1) {
    bytes[index] = Number(integer & 0xffn);
    integer >>= 8n;
  }
  return bytes;
};

const discriminator = async (name) => {
  const hash = await crypto.subtle.digest('SHA-256', utf8(`global:${name}`));
  return new Uint8Array(hash).slice(0, 8);
};

const join = (...arrays) => {
  const length = arrays.reduce((sum, array) => sum + array.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  for (const array of arrays) {
    result.set(array, offset);
    offset += array.length;
  }
  return result;
};

const ids = () => {
  if (!SOLANA_PROGRAM_ID) throw new Error('Configure VITE_SOLANA_PROGRAM_ID com o Program ID da rede selecionada.');
  return {
    program: new PublicKey(SOLANA_PROGRAM_ID),
    token: TOKEN_PROGRAM_ID,
    associated: ASSOCIATED_TOKEN_PROGRAM_ID,
  };
};

export const solanaWalletProvider = () => window.phantom?.solana || window.solana;

export const deriveProgramAddress = (seeds, programId) => PublicKey.findProgramAddressSync(seeds, programId)[0];

const deriveAta = (owner, mint, allowOwnerOffCurve = false) => {
  if (!allowOwnerOffCurve && !PublicKey.isOnCurve(owner.toBytes())) throw new Error('Endereço de carteira inválido.');
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )[0];
};

const createAtaInstruction = (payer, ata, owner, mint) => new TransactionInstruction({
  programId: ASSOCIATED_TOKEN_PROGRAM_ID,
  keys: [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: ata, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: false, isWritable: false },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ],
  data: Buffer.alloc(0),
});

const sendInstructions = async (wallet, instructions) => {
  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  const latest = await connection.getLatestBlockhash('confirmed');
  const transaction = new Transaction({
    feePayer: wallet.publicKey,
    recentBlockhash: latest.blockhash,
  }).add(...instructions);
  const response = await wallet.signAndSendTransaction(transaction, { preflightCommitment: 'confirmed' });
  const signature = response.signature || response;
  const confirmation = await connection.confirmTransaction({ signature, ...latest }, 'confirmed');
  if (confirmation.value.err) throw new Error('A transação Solana falhou.');
  return signature;
};

export async function publishPackageOnSolana({ providerWallet, packageRef, mintAddress, priceUnits }) {
  const { program } = ids();
  const provider = new PublicKey(providerWallet);
  const mint = new PublicKey(mintAddress);
  const packagePda = deriveProgramAddress([utf8('package'), provider.toBuffer(), u64le(packageRef)], program);
  const data = join(await discriminator('create_package'), u64le(packageRef), u64le(priceUnits), Uint8Array.of(1));
  const instruction = new TransactionInstruction({
    programId: program,
    keys: [
      { pubkey: provider, isSigner: true, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: packagePda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(data),
  });
  const wallet = solanaWalletProvider();
  if (!wallet?.publicKey || wallet.publicKey.toString() !== providerWallet) throw new Error('Conecte a carteira do prestador vinculada ao BellaChain.');
  const signature = await sendInstructions(wallet, [instruction]);
  return { signature, packageAddress: packagePda.toBase58() };
}

export async function buyPackageOnSolana({ customerWallet, packageAddress, providerWallet, mintAddress, packageRef, amountUnits }) {
  const { program, token, associated } = ids();
  const customer = new PublicKey(customerWallet);
  const provider = new PublicKey(providerWallet);
  const mint = new PublicKey(mintAddress);
  const packagePda = new PublicKey(packageAddress);
  const walletPda = deriveProgramAddress([utf8('wallet'), customer.toBuffer()], program);
  const customerAta = deriveAta(customer, mint);
  const walletAta = deriveAta(walletPda, mint, true);
  const purchaseBytes = new Uint8Array(6);
  crypto.getRandomValues(purchaseBytes);
  let purchaseRef = 0n;
  for (let index = purchaseBytes.length - 1; index >= 0; index -= 1) purchaseRef = (purchaseRef << 8n) | BigInt(purchaseBytes[index]);
  const purchasePda = deriveProgramAddress([utf8('purchase'), walletPda.toBuffer(), u64le(purchaseRef)], program);
  const walletAccount = deriveProgramAddress([utf8('wallet'), customer.toBuffer()], program);
  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  const instructions = [];

  if (!await connection.getAccountInfo(walletAccount, 'confirmed')) {
    instructions.push(new TransactionInstruction({
      programId: program,
      keys: [
        { pubkey: customer, isSigner: true, isWritable: true },
        { pubkey: walletAccount, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(await discriminator('initialize_wallet')),
    }));
  }
  if (!await connection.getAccountInfo(customerAta, 'confirmed')) {
    instructions.push(createAtaInstruction(customer, customerAta, customer, mint));
  }

  instructions.push(new TransactionInstruction({
    programId: program,
    keys: [
      { pubkey: customer, isSigner: true, isWritable: true },
      { pubkey: walletPda, isSigner: false, isWritable: false },
      { pubkey: packagePda, isSigner: false, isWritable: false },
      { pubkey: provider, isSigner: false, isWritable: false },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: customerAta, isSigner: false, isWritable: true },
      { pubkey: walletAta, isSigner: false, isWritable: true },
      { pubkey: purchasePda, isSigner: false, isWritable: true },
      { pubkey: associated, isSigner: false, isWritable: false },
      { pubkey: token, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(join(await discriminator('buy_package'), u64le(purchaseRef), u64le(amountUnits))),
  }));

  const wallet = solanaWalletProvider();
  if (!wallet?.publicKey || wallet.publicKey.toString() !== customerWallet) throw new Error('Conecte sua carteira Solana vinculada ao BellaChain.');
  const signature = await sendInstructions(wallet, instructions);
  return { signature, purchaseRef: purchaseRef.toString(), purchaseAddress: purchasePda.toBase58() };
}
