import { Buffer } from '@craftzdog/react-native-buffer';
import QuickCrypto from 'react-native-quick-crypto';

const AES_ALGORITHM = 'aes-256-cbc';
const AES_KEY_BYTES = 32;
const AES_IV_BYTES = 16;
const OPENSSL_SALT_HEADER = 'Salted__';
const OPENSSL_SALT_BYTES = 8;

interface CryptoJsWordArrayJson {
  words: number[];
  sigBytes: number;
}

interface EncryptedPayload {
  ciphertext: string;
  iv: CryptoJsWordArrayJson;
}

interface DerivedCipherParams {
  key: Buffer;
  iv: Buffer;
}

export const generateRandomIV = (byteCount = 32) => QuickCrypto.randomBytes(byteCount);

const deriveOpenSslCipherParams = (password: string, salt: Buffer): DerivedCipherParams => {
  const passwordBuffer = Buffer.from(password, 'utf8');
  const requiredBytes = AES_KEY_BYTES + AES_IV_BYTES;
  const derivedChunks: Buffer[] = [];
  let previousChunk = Buffer.alloc(0);

  while (Buffer.concat(derivedChunks).length < requiredBytes) {
    previousChunk = QuickCrypto.createHash('md5')
      .update(Buffer.concat([previousChunk, passwordBuffer, salt]))
      .digest();
    derivedChunks.push(previousChunk);
  }

  const derived = Buffer.concat(derivedChunks);

  return {
    key: derived.subarray(0, AES_KEY_BYTES),
    iv: derived.subarray(AES_KEY_BYTES, requiredBytes),
  };
};

const bufferToCryptoJsWordArrayJson = (buffer: Buffer): CryptoJsWordArrayJson => {
  const words: number[] = [];

  for (let i = 0; i < buffer.length; i += 4) {
    words.push(
      (((buffer[i] ?? 0) << 24) |
        ((buffer[i + 1] ?? 0) << 16) |
        ((buffer[i + 2] ?? 0) << 8) |
        (buffer[i + 3] ?? 0)) >>>
        0,
    );
  }

  return {
    words,
    sigBytes: buffer.length,
  };
};

const parseOpenSslCiphertext = (ciphertext: string) => {
  const encryptedBuffer = Buffer.from(ciphertext, 'base64');
  const header = encryptedBuffer.subarray(0, OPENSSL_SALT_HEADER.length).toString('utf8');

  if (header !== OPENSSL_SALT_HEADER) {
    throw new Error('Invalid OpenSSL salted ciphertext');
  }

  return {
    salt: encryptedBuffer.subarray(
      OPENSSL_SALT_HEADER.length,
      OPENSSL_SALT_HEADER.length + OPENSSL_SALT_BYTES,
    ),
    encrypted: encryptedBuffer.subarray(OPENSSL_SALT_HEADER.length + OPENSSL_SALT_BYTES),
  };
};

export const encrypt = (text: string, key: string) => {
  const salt = generateRandomIV(OPENSSL_SALT_BYTES);
  const cipherParams = deriveOpenSslCipherParams(key, salt);
  const cipher = QuickCrypto.createCipheriv(AES_ALGORITHM, cipherParams.key, cipherParams.iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const ciphertext = Buffer.concat([
    Buffer.from(OPENSSL_SALT_HEADER, 'utf8'),
    salt,
    encrypted,
  ]).toString('base64');

  return JSON.stringify({
    ciphertext,
    iv: bufferToCryptoJsWordArrayJson(cipherParams.iv),
  } satisfies EncryptedPayload);
};

export const decrypt = (json: string, key: string): string => {
  try {
    const { ciphertext } = JSON.parse(json) as EncryptedPayload;
    const { salt, encrypted } = parseOpenSslCiphertext(ciphertext);
    const cipherParams = deriveOpenSslCipherParams(key, salt);
    const decipher = QuickCrypto.createDecipheriv(AES_ALGORITHM, cipherParams.key, cipherParams.iv);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Malformed UTF-8 data';
    throw new Error(`Decryption failed: ${message} (wrong key or corrupted data)`);
  }
};

export const generateRandomString = () => generateRandomIV(16).toString('hex');
