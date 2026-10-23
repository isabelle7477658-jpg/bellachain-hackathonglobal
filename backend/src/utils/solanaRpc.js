import { createHash } from 'node:crypto';
import { decodeBase58 } from './solanaWallet.js';

const keyText = (entry) => typeof entry === 'string' ? entry : entry?.pubkey;

export const anchorDiscriminator = (instructionName) => createHash('sha256')
  .update(`global:${instructionName}`)
  .digest()
  .subarray(0, 8);

export const readU64LE = (buffer, offset) => {
  let value = 0n;
  for (let index = 0; index < 8; index += 1) value |= BigInt(buffer[offset + index]) << BigInt(index * 8);
  return value;
};

export const confirmProgramInstruction = async ({ signature, instructionName, validate }) => {
  const rpcUrl = process.env.SOLANA_RPC_URL;
  const programId = process.env.SOLANA_PROGRAM_ID;
  if (!rpcUrl || !programId) throw Object.assign(new Error('RPC ou Program ID Solana não configurado.'), { status: 503 });

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'getTransaction',
      params: [signature, { commitment: 'confirmed', encoding: 'json', maxSupportedTransactionVersion: 0 }],
    }),
  });
  if (!response.ok) throw Object.assign(new Error('RPC Solana indisponível.'), { status: 502 });
  const payload = await response.json();
  if (payload.error) throw Object.assign(new Error('RPC não confirmou a transação.'), { status: 502 });
  const transaction = payload.result;
  if (!transaction || transaction.meta?.err) throw Object.assign(new Error('Transação ainda não foi confirmada ou falhou.'), { status: 409 });

  const message = transaction.transaction?.message;
  const keys = (message?.accountKeys || []).map(keyText);
  const transactionSignatures = transaction.transaction?.signatures || [];
  if (!transactionSignatures.includes(signature)) throw Object.assign(new Error('Assinatura não pertence à transação retornada.'), { status: 400 });

  const expectedDiscriminator = anchorDiscriminator(instructionName);
  const matching = (message?.instructions || []).find((instruction) => {
    const instructionProgram = instruction.programId || keys[instruction.programIdIndex];
    if (instructionProgram !== programId) return false;
    try {
      return decodeBase58(instruction.data).subarray(0, 8).equals(expectedDiscriminator);
    } catch {
      return false;
    }
  });
  if (!matching) throw Object.assign(new Error('A transação não contém a instrução Solana esperada.'), { status: 400 });

  let instructionData;
  try { instructionData = decodeBase58(matching.data); } catch {
    throw Object.assign(new Error('Dados da instrução inválidos.'), { status: 400 });
  }
  const accountIndexes = matching.accounts || [];
  const accounts = accountIndexes.map((index) => typeof index === 'number' ? keys[index] : index);
  const result = { accounts, instructionData, keys, slot: transaction.slot, programId };
  if (!validate(result)) throw Object.assign(new Error('A transação confirmada não corresponde aos dados esperados.'), { status: 400 });
  return result;
};
