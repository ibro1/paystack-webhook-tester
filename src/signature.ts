import crypto from 'node:crypto';

/**
 * Computes the Paystack HMAC-SHA512 signature for a webhook payload.
 *
 * @param payload - Raw JSON string or object payload
 * @param secretKey - Paystack secret key
 * @returns 128-character lowercase hexadecimal HMAC-SHA512 signature
 */
export function generateSignature(payload: string | object, secretKey: string): string {
  if (!secretKey) {
    throw new Error('Secret key is required to generate signature');
  }
  const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHmac('sha512', secretKey).update(payloadString, 'utf-8').digest('hex');
}

/**
 * Verifies that a received x-paystack-signature matches the HMAC-SHA512 digest of the payload.
 *
 * Uses timingSafeEqual to guard against timing analysis attacks.
 *
 * @param payload - Raw request body string or object
 * @param signature - Signature from the x-paystack-signature header
 * @param secretKey - Paystack secret key
 * @returns boolean indicating whether the signature is authentic
 */
export function verifySignature(
  payload: string | object,
  signature: string | undefined | null,
  secretKey: string,
): boolean {
  if (!signature || typeof signature !== 'string' || !secretKey) {
    return false;
  }
  const cleanSignature = signature.trim().toLowerCase();
  // SHA-512 hex is always 128 characters
  if (cleanSignature.length !== 128) {
    return false;
  }

  try {
    const expected = generateSignature(payload, secretKey);
    const expectedBuffer = Buffer.from(expected, 'hex');
    const providedBuffer = Buffer.from(cleanSignature, 'hex');

    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  } catch {
    return false;
  }
}
