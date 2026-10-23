import { createPublicKey, verify as verifySignature } from 'node:crypto';

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

export const decodeBase58 = (value) => {
  if (typeof value !== 'string' || value.length === 0) throw new Error('Base58 inválido');
  let number = 0n;
  for (const character of value) {
    const digit = BASE58_ALPHABET.indexOf(character);
    if (digit < 0) throw new Error('Base58 inválido');
    number = number * 58n + BigInt(digit);
  }

  const bytes = [];
  while (number > 0n) {
    bytes.push(Number(number & 0xffn));
    number >>= 8n;
  }
  bytes.reverse();
  let leadingZeroes = 0;
  while (leadingZeroes < value.length && value[leadingZeroes] === '1') leadingZeroes += 1;
  return Buffer.concat([Buffer.alloc(leadingZeroes), Buffer.from(bytes)]);
};

export const isSolanaAddress = (address) => {
  try {
    return decodeBase58(address).length === 32;
  } catch {
    return false;
  }
};

export const verifySolanaMessage = ({ address, message, signature }) => {
  const publicKeyBytes = decodeBase58(address);
  const signatureBytes = decodeBase58(signature);
  if (publicKeyBytes.length !== 32 || signatureBytes.length !== 64) return false;

  const publicKey = createPublicKey({
    key: Buffer.concat([ED25519_SPKI_PREFIX, publicKeyBytes]),
    format: 'der',
    type: 'spki',
  });
  return verifySignature(null, Buffer.from(message, 'utf8'), publicKey, signatureBytes);
};
