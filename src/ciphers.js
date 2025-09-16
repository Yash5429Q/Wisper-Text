import CryptoJS from "crypto-js";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";

// ---------- Classical Ciphers ----------

// Caesar
export function caesarEncrypt(text, key) {
  const k = ((parseInt(key, 10) || 0) % 26 + 26) % 26;
  return text.replace(/[A-Za-z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + k) % 26) + base);
  });
}
export function caesarDecrypt(text, key) {
  return caesarEncrypt(text, -(parseInt(key, 10) || 0));
}

// Affine
function modInv(a, m) {
  a = ((a % m) + m) % m;
  for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
  return null;
}
export function affineEncrypt(text, a, b) {
  a = parseInt(a, 10); b = parseInt(b, 10);
  if (!a || modInv(a, 26) === null) return "Invalid 'a' key (must be coprime with 26)";
  return text.replace(/[A-Za-z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    const x = c.charCodeAt(0) - base;
    return String.fromCharCode(((a * x + b) % 26) + base);
  });
}
export function affineDecrypt(text, a, b) {
  a = parseInt(a, 10); b = parseInt(b, 10);
  const inv = modInv(a, 26);
  if (inv === null) return "Invalid 'a' key (must be coprime with 26)";
  return text.replace(/[A-Za-z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    const y = c.charCodeAt(0) - base;
    return String.fromCharCode(((inv * (y - b + 26)) % 26) + base);
  });
}

// Vigenere
export function vigenereEncrypt(text, key) {
  const shifts = key.split("").map(ch =>
    (/\d/.test(ch) ? parseInt(ch, 10) : (ch.toLowerCase().charCodeAt(0) - 97))
  );
  if (shifts.length === 0) return text;
  let j = 0;
  return text.replace(/[A-Za-z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    const s = (shifts[j % shifts.length] % 26 + 26) % 26;
    j++;
    return String.fromCharCode(((c.charCodeAt(0) - base + s) % 26) + base);
  });
}
export function vigenereDecrypt(text, key) {
  const shifts = key.split("").map(ch =>
    (/\d/.test(ch) ? parseInt(ch, 10) : (ch.toLowerCase().charCodeAt(0) - 97))
  );
  if (shifts.length === 0) return text;
  let j = 0;
  return text.replace(/[A-Za-z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    const s = (shifts[j % shifts.length] % 26 + 26) % 26;
    j++;
    return String.fromCharCode(((c.charCodeAt(0) - base - s + 26) % 26) + base);
  });
}

// Rail Fence
export function railFenceEncrypt(text, rails) {
  rails = Math.max(2, parseInt(rails, 10) || 2);
  const fence = Array.from({ length: rails }, () => []);
  let row = 0, dir = 1;
  for (let ch of text) {
    fence[row].push(ch);
    row += dir;
    if (row === 0 || row === rails - 1) dir *= -1;
  }
  return fence.map(r => r.join("")).join("");
}
export function railFenceDecrypt(cipher, rails) {
  rails = Math.max(2, parseInt(rails, 10) || 2);
  const n = cipher.length;
  const railLens = new Array(rails).fill(0);
  let row = 0, dir = 1;
  for (let i = 0; i < n; i++) {
    railLens[row]++; row += dir;
    if (row === 0 || row === rails - 1) dir *= -1;
  }
  const railsArr = [];
  let idx = 0;
  for (let r = 0; r < rails; r++) {
    railsArr[r] = cipher.slice(idx, idx + railLens[r]).split("");
    idx += railLens[r];
  }
  row = 0; dir = 1; let out = "";
  for (let i = 0; i < n; i++) {
    out += railsArr[row].shift();
    row += dir;
    if (row === 0 || row === rails - 1) dir *= -1;
  }
  return out;
}

// Columnar Transposition
export function columnarEncrypt(text, key) {
  const cleanedKey = key.replace(/\s+/g, "");
  const kArr = cleanedKey.split("").map(Number);
  const n = kArr.length;
  const cols = Array.from({ length: n }, () => "");
  for (let i = 0; i < text.length; i++) cols[i % n] += text[i];
  const order = kArr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v).map(x => x.i);
  let out = "";
  for (let idx of order) out += cols[idx];
  return out;
}
export function columnarDecrypt(cipher, key) {
  const cleanedKey = key.replace(/\s+/g, "");
  const kArr = cleanedKey.split("").map(Number);
  const n = kArr.length, L = cipher.length;
  const base = Math.floor(L / n), extra = L % n;
  const order = kArr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v).map(x => x.i);
  const cols = new Array(n);
  let idx = 0;
  for (let j = 0; j < n; j++) {
    const colIdx = order[j];
    const len = base + (j < extra ? 1 : 0);
    cols[colIdx] = cipher.slice(idx, idx + len).split("");
    idx += len;
  }
  let out = "";
  for (let r = 0; r < base + 1; r++) {
    for (let c = 0; c < n; c++) if (cols[c][r] !== undefined) out += cols[c][r];
  }
  return out;
}

// ---------- Modern Ciphers ----------

// AES, DES, 3DES, RC4
export function cryptoJSEncrypt(algo, text, key) {
  switch (algo) {
    case "AES": return CryptoJS.AES.encrypt(text, key).toString();
    case "DES": return CryptoJS.DES.encrypt(text, key).toString();
    case "TripleDES": return CryptoJS.TripleDES.encrypt(text, key).toString();
    case "RC4": return CryptoJS.RC4.encrypt(text, key).toString();
    default: return text;
  }
}
export function cryptoJSDecrypt(algo, cipher, key) {
  switch (algo) {
    case "AES": return CryptoJS.AES.decrypt(cipher, key).toString(CryptoJS.enc.Utf8);
    case "DES": return CryptoJS.DES.decrypt(cipher, key).toString(CryptoJS.enc.Utf8);
    case "TripleDES": return CryptoJS.TripleDES.decrypt(cipher, key).toString(CryptoJS.enc.Utf8);
    case "RC4": return CryptoJS.RC4.decrypt(cipher, key).toString(CryptoJS.enc.Utf8);
    default: return cipher;
  }
}

// XSalsa20
export function naclEncrypt(text, pass) {
  const key = nacl.hash(naclUtil.decodeUTF8(pass)).slice(0, 32);
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const msg = naclUtil.decodeUTF8(text);
  const cipher = nacl.secretbox(msg, nonce, key);
  const full = new Uint8Array(nonce.length + cipher.length);
  full.set(nonce); full.set(cipher, nonce.length);
  return naclUtil.encodeBase64(full);
}
export function naclDecrypt(b64, pass) {
  const key = nacl.hash(naclUtil.decodeUTF8(pass)).slice(0, 32);
  const full = naclUtil.decodeBase64(b64);
  const nonce = full.slice(0, nacl.box.nonceLength);
  const cipher = full.slice(nacl.box.nonceLength);
  const msg = nacl.secretbox.open(cipher, nonce, key);
  if (!msg) return "Bad key or corrupted";
  return naclUtil.encodeUTF8(msg);
}