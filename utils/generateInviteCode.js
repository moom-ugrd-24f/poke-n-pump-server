// utils/generateInviteCode.js

async function generateInviteCode() {
    const { customAlphabet } = await import('nanoid');
    const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
    return nanoid();
  }

module.exports = generateInviteCode;