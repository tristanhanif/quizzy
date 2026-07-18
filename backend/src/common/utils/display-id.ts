import * as crypto from 'crypto';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateDisplayId(role: string): string {
  const prefix = role === 'CREATOR' ? 'CRE' : 'PLY';
  let random = '';
  const bytes = crypto.randomBytes(5);
  for (let i = 0; i < 5; i++) {
    random += CHARS[bytes[i] % CHARS.length];
  }
  return `${prefix}-${random}`;
}
