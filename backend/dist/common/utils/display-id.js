"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDisplayId = generateDisplayId;
const crypto = require("crypto");
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateDisplayId(role) {
    const prefix = role === 'CREATOR' ? 'CRE' : 'PLY';
    let random = '';
    const bytes = crypto.randomBytes(5);
    for (let i = 0; i < 5; i++) {
        random += CHARS[bytes[i] % CHARS.length];
    }
    return `${prefix}-${random}`;
}
//# sourceMappingURL=display-id.js.map