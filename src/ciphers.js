import CryptoJS from "crypto-js";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";

// ============================================
// ========== CLASSICAL CIPHERS ==============
// ============================================

const CAESAR_DEFAULT_KEY = 3;

export function caesarEncrypt(text, key = CAESAR_DEFAULT_KEY) {
  if (!text || text.trim() === "") {
    return "Error: Text is required for Caesar cipher";
  }

  const k = parseInt(key, 10);
  if (isNaN(k)) {
    return "Error: Key must be an integer for Caesar cipher";
  }

  const shift = ((k % 26) + 26) % 26;

  return text.replace(/[a-z]/gi, (c) => {
    const base = c >= "a" && c <= "z" ? 97 : 65;
    return String.fromCharCode(((c.charCodeAt(0) - base + shift) % 26) + base);
  });
}

export function caesarDecrypt(text, key = CAESAR_DEFAULT_KEY) {
  if (!text || text.trim() === "") {
    return "Error: Text is required for Caesar cipher";
  }

  const k = parseInt(key, 10);
  if (isNaN(k)) {
    return "Error: Key must be an integer for Caesar cipher";
  }

  return caesarEncrypt(text, 26 - (k % 26));
}

// Default keys for Affine cipher (a must be coprime with 26)
const AFFINE_DEFAULT_A = 5;
const AFFINE_DEFAULT_B = 8;

function modInv(a, m) {
  a = ((a % m) + m) % m;
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x;
  }
  return null;
}

export function affineEncrypt(text, a = AFFINE_DEFAULT_A, b = AFFINE_DEFAULT_B) {
  if (!text || text.trim() === "") {
    return "Error: Text is required for Affine cipher";
  }

  a = parseInt(a, 10);
  b = parseInt(b, 10);

  if (isNaN(a) || isNaN(b)) {
    return "Error: Keys 'a' and 'b' must be integers";
  }

  if (modInv(a, 26) === null) {
    return "Error: Key 'a' must be coprime with 26";
  }

  return text.replace(/[a-z]/gi, (c) => {
    const base = c >= "a" && c <= "z" ? 97 : 65;
    return String.fromCharCode(((a * (c.charCodeAt(0) - base) + b) % 26) + base);
  });
}

export function affineDecrypt(text, a = AFFINE_DEFAULT_A, b = AFFINE_DEFAULT_B) {
  if (!text || text.trim() === "") {
    return "Error: Text is required for Affine cipher";
  }

  a = parseInt(a, 10);
  b = parseInt(b, 10);

  if (isNaN(a) || isNaN(b)) {
    return "Error: Keys 'a' and 'b' must be integers";
  }

  const inv = modInv(a, 26);
  if (inv === null) {
    return "Error: Key 'a' must be coprime with 26";
  }

  return text.replace(/[a-z]/gi, (c) => {
    const base = c >= "a" && c <= "z" ? 97 : 65;
    return String.fromCharCode(((inv * (c.charCodeAt(0) - base - b + 26)) % 26) + base);
  });
}

// ============================================
// ========== VIGENÈRE CIPHER ================
// ============================================

// Default fallback key
const VIGENERE_DEFAULT_KEY = "KEY";

export function vigenereEncrypt(text, key = VIGENERE_DEFAULT_KEY) {
  if (!text || text.trim() === "") {
    return "Error: Text is required for Vigenère cipher";
  }

  key = (key || VIGENERE_DEFAULT_KEY).trim().toUpperCase();
  if (!/^[A-Z]+$/.test(key)) {
    return "Error: Key must contain only alphabetic characters (A-Z)";
  }

  let j = 0;
  return text.replace(/[a-z]/gi, (c) => {
    const base = c >= "a" && c <= "z" ? 97 : 65;
    const k = key.charCodeAt(j % key.length) - 65;
    j++;
    return String.fromCharCode(((c.charCodeAt(0) - base + k) % 26) + base);
  });
}

export function vigenereDecrypt(text, key = VIGENERE_DEFAULT_KEY) {
  if (!text || text.trim() === "") {
    return "Error: Text is required for Vigenère cipher";
  }

  key = (key || VIGENERE_DEFAULT_KEY).trim().toUpperCase();
  if (!/^[A-Z]+$/.test(key)) {
    return "Error: Key must contain only alphabetic characters (A-Z)";
  }

  let j = 0;
  return text.replace(/[a-z]/gi, (c) => {
    const base = c >= "a" && c <= "z" ? 97 : 65;
    const k = key.charCodeAt(j % key.length) - 65;
    j++;
    return String.fromCharCode(((c.charCodeAt(0) - base - k + 26) % 26) + base);
  });
}
// ---------- Rail Fence Cipher ----------

// Default fallback rails
const RAIL_FENCE_DEFAULT_RAILS = 3;

export function railFenceEncrypt(text, rails = RAIL_FENCE_DEFAULT_RAILS) {
  if (!text || text.trim() === "") {
    return "Error: Text is required for Rail Fence cipher";
  }

  rails = parseInt(rails, 10);
  if (isNaN(rails) || rails < 2) {
    return "Error: Rails must be an integer >= 2";
  }

  let fence = Array.from({ length: rails }, () => []);
  let rail = 0, dir = 1;

  for (const c of text) {
    fence[rail].push(c);
    rail += dir;
    if (rail === 0 || rail === rails - 1) dir *= -1;
  }

  return fence.flat().join("");
}

export function railFenceDecrypt(cipher, rails = RAIL_FENCE_DEFAULT_RAILS) {
  if (!cipher || cipher.trim() === "") {
    return "Error: Ciphertext is required for Rail Fence cipher";
  }

  rails = parseInt(rails, 10);
  if (isNaN(rails) || rails < 2) {
    return "Error: Rails must be an integer >= 2";
  }

  const len = cipher.length;
  const railLen = Array(rails).fill(0);
  let rail = 0, dir = 1;

  // Count characters per rail
  for (let i = 0; i < len; i++) {
    railLen[rail]++;
    rail += dir;
    if (rail === 0 || rail === rails - 1) dir *= -1;
  }

  // Slice ciphertext into rails
  let pos = 0;
  const fence = railLen.map(l => cipher.slice(pos, pos += l).split(""));

  rail = 0; dir = 1;
  let result = "";

  for (let i = 0; i < len; i++) {
    result += fence[rail].shift();
    rail += dir;
    if (rail === 0 || rail === rails - 1) dir *= -1;
  }

  return result;
}
// ---------- Columnar Transposition Cipher ----------

// Default fallback key
const COLUMNAR_DEFAULT_KEY = "3142"; // simple numeric permutation

export function columnarEncrypt(text, key = COLUMNAR_DEFAULT_KEY) {
  if (!text || text.trim() === "") {
    return "Error: Text is required for Columnar Transposition cipher";
  }

  const cleanedKey = (key || COLUMNAR_DEFAULT_KEY).replace(/\s+/g, "");
  if (!/^[0-9]+$/.test(cleanedKey)) {
    return "Error: Key must be numeric digits for Columnar Transposition cipher";
  }

  const kArr = cleanedKey.split("").map(Number);
  const n = kArr.length;
  const cols = Array.from({ length: n }, () => "");

  for (let i = 0; i < text.length; i++) {
    cols[i % n] += text[i];
  }

  const order = kArr
    .map((v, i) => ({ v, i }))
    .sort((a, b) => a.v - b.v)
    .map(x => x.i);

  let out = "";
  for (let idx of order) out += cols[idx];
  return out;
}

export function columnarDecrypt(cipher, key = COLUMNAR_DEFAULT_KEY) {
  if (!cipher || cipher.trim() === "") {
    return "Error: Ciphertext is required for Columnar Transposition cipher";
  }

  const cleanedKey = (key || COLUMNAR_DEFAULT_KEY).replace(/\s+/g, "");
  if (!/^[0-9]+$/.test(cleanedKey)) {
    return "Error: Key must be numeric digits for Columnar Transposition cipher";
  }

  const kArr = cleanedKey.split("").map(Number);
  const n = kArr.length, L = cipher.length;
  const base = Math.floor(L / n), extra = L % n;

  const order = kArr
    .map((v, i) => ({ v, i }))
    .sort((a, b) => a.v - b.v)
    .map(x => x.i);

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
    for (let c = 0; c < n; c++) {
      if (cols[c][r] !== undefined) out += cols[c][r];
    }
  }
  return out;
}
// ---------- Modern Ciphers (AES, DES, 3DES, RC4) ----------

// Default fallback key
const MODERN_DEFAULT_KEY = "DEFAULT_SECRET_KEY";

export function cryptoJSEncrypt(algo, text, key = MODERN_DEFAULT_KEY) {
  if (!text || text.trim() === "") {
    return "Error: Text is required for encryption";
  }

  try {
    switch (algo) {
      case "AES":
        return CryptoJS.AES.encrypt(text, key).toString();
      case "DES":
        return CryptoJS.DES.encrypt(text, key).toString();
      case "TripleDES":
        return CryptoJS.TripleDES.encrypt(text, key).toString();
      case "RC4":
        return CryptoJS.RC4.encrypt(text, key).toString();
      default:
        return "Error: Unsupported algorithm. Use AES, DES, TripleDES, or RC4.";
    }
  } catch (e) {
    return "Encryption error: " + e.message;
  }
}

export function cryptoJSDecrypt(algo, cipher, key = MODERN_DEFAULT_KEY) {
  if (!cipher || cipher.trim() === "") {
    return "Error: Ciphertext is required for decryption";
  }

  try {
    let decrypted;
    switch (algo) {
      case "AES":
        decrypted = CryptoJS.AES.decrypt(cipher, key);
        break;
      case "DES":
        decrypted = CryptoJS.DES.decrypt(cipher, key);
        break;
      case "TripleDES":
        decrypted = CryptoJS.TripleDES.decrypt(cipher, key);
        break;
      case "RC4":
        decrypted = CryptoJS.RC4.decrypt(cipher, key);
        break;
      default:
        return "Error: Unsupported algorithm. Use AES, DES, TripleDES, or RC4.";
    }

    return decrypted.toString(CryptoJS.enc.Utf8) || "Error: Wrong key or corrupted cipher";
  } catch (e) {
    return "Decryption error: " + e.message;
  }
}
// ---------- XSalsa20 (NaCl Secretbox) ----------

export function naclEncrypt(text, pass) {
  if (!text || text.trim() === "") {
    return "Error: Text is required for encryption";
  }
  if (!pass || pass.trim() === "") {
    return "Error: Passphrase is required for XSalsa20 encryption";
  }

  try {
    // Derive 32-byte key from passphrase
    const key = nacl.hash(naclUtil.decodeUTF8(pass)).slice(0, 32);

    // Generate random nonce
    const nonce = nacl.randomBytes(nacl.box.nonceLength);

    // Encode and encrypt
    const msg = naclUtil.decodeUTF8(text);
    const cipher = nacl.secretbox(msg, nonce, key);

    // Concatenate nonce + cipher
    const full = new Uint8Array(nonce.length + cipher.length);
    full.set(nonce);
    full.set(cipher, nonce.length);

    return naclUtil.encodeBase64(full);
  } catch (e) {
    return "Encryption error: " + e.message;
  }
}

export function naclDecrypt(b64, pass) {
  if (!b64 || b64.trim() === "") {
    return "Error: Ciphertext is required for decryption";
  }
  if (!pass || pass.trim() === "") {
    return "Error: Passphrase is required for XSalsa20 decryption";
  }

  try {
    // Derive 32-byte key from passphrase
    const key = nacl.hash(naclUtil.decodeUTF8(pass)).slice(0, 32);

    // Decode Base64 into nonce + cipher
    const full = naclUtil.decodeBase64(b64);
    const nonce = full.slice(0, nacl.box.nonceLength);
    const cipher = full.slice(nacl.box.nonceLength);

    // Decrypt
    const msg = nacl.secretbox.open(cipher, nonce, key);
    if (!msg) return "Error: Wrong key or corrupted ciphertext";

    return naclUtil.encodeUTF8(msg);
  } catch (e) {
    return "Decryption error: " + e.message;
  }
}
// ---------- NEW: Additional Ciphers ----------

// 1) Atbash
export function atbashEncrypt(text = "") {
  if (!text) return "";
  return text.replace(/[A-Za-z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    const mapped = 25 - (c.charCodeAt(0) - base);
    return String.fromCharCode(mapped + base);
  });
}
export const atbashDecrypt = atbashEncrypt; // symmetric

// 2) ROT13
export function rot13Encrypt(text = "") {
  if (!text) return "";
  return text.replace(/[A-Za-z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}
export const rot13Decrypt = rot13Encrypt; // symmetric

// 3) Playfair (5x5, I/J combined)
function buildPlayfairSquare(key = "KEYWORD") {
  key = key.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I");
  if (key.length === 0) key = "KEYWORD"; // fallback default

  const seen = new Set();
  const arr = [];

  for (const ch of key) {
    if (!seen.has(ch)) {
      seen.add(ch);
      arr.push(ch);
    }
  }

  for (let i = 0; i < 26; i++) {
    const ch = String.fromCharCode(65 + i);
    if (ch === "J") continue;
    if (!seen.has(ch)) {
      seen.add(ch);
      arr.push(ch);
    }
  }

  const square = [];
  for (let r = 0; r < 5; r++) {
    square.push(arr.slice(r * 5, r * 5 + 5));
  }
  return square;
}

function findInSquare(square, ch) {
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (square[r][c] === ch) return [r, c];
    }
  }
  return [-1, -1];
}

function preparePlayfairText(text) {
  let t = text.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I");
  const pairs = [];

  for (let i = 0; i < t.length; i++) {
    let a = t[i];
    let b = t[i + 1] || "";
    if (!b) {
      pairs.push([a, "X"]);
      break;
    }
    if (a === b) {
      pairs.push([a, "X"]);
      continue;
    }
    pairs.push([a, b]);
    i++;
  }
  return pairs;
}

export function playfairEncrypt(text, key = "KEYWORD") {
  if (!text) return "";
  const square = buildPlayfairSquare(key);
  const pairs = preparePlayfairText(text);

  let out = "";
  for (const [a, b] of pairs) {
    const [r1, c1] = findInSquare(square, a);
    const [r2, c2] = findInSquare(square, b);

    if (r1 === r2) {
      out += square[r1][(c1 + 1) % 5];
      out += square[r2][(c2 + 1) % 5];
    } else if (c1 === c2) {
      out += square[(r1 + 1) % 5][c1];
      out += square[(r2 + 1) % 5][c2];
    } else {
      out += square[r1][c2];
      out += square[r2][c1];
    }
  }
  return out;
}

export function playfairDecrypt(text, key = "KEYWORD") {
  if (!text) return "";
  const square = buildPlayfairSquare(key);
  const clean = text.toUpperCase().replace(/[^A-Z]/g, "");

  const pairs = [];
  for (let i = 0; i < clean.length; i += 2) {
    pairs.push([clean[i], clean[i + 1] || "X"]);
  }

  let out = "";
  for (const [a, b] of pairs) {
    const [r1, c1] = findInSquare(square, a);
    const [r2, c2] = findInSquare(square, b);

    if (r1 === r2) {
      out += square[r1][(c1 + 4) % 5];
      out += square[r2][(c2 + 4) % 5];
    } else if (c1 === c2) {
      out += square[(r1 + 4) % 5][c1];
      out += square[(r2 + 4) % 5][c2];
    } else {
      out += square[r1][c2];
      out += square[r2][c1];
    }
  }
  return out;
}
// ---------- Hill Cipher (2x2 or 3x3) ----------

function egcd(a, b) {
  if (b === 0) return [a, 1, 0];
  const [g, x1, y1] = egcd(b, a % b);
  return [g, y1, x1 - Math.floor(a / b) * y1];
}

function modInverseInt(a, m) {
  a = ((a % m) + m) % m;
  const [g, x] = egcd(a, m);
  if (g !== 1) return null;
  return ((x % m) + m) % m;
}

function matrixDeterminant(mat, mod) {
  const n = mat.length;
  if (n === 2) {
    return ((mat[0][0]*mat[1][1] - mat[0][1]*mat[1][0]) % mod + mod) % mod;
  } else if (n === 3) {
    const a = mat;
    let det = a[0][0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1])
            - a[0][1]*(a[1][0]*a[2][2]-a[1][2]*a[2][0])
            + a[0][2]*(a[1][0]*a[2][1]-a[1][1]*a[2][0]);
    return ((det % mod) + mod) % mod;
  }
  throw new Error("Only 2x2 and 3x3 matrices supported");
}

function matrixAdjugate(mat, mod) {
  const n = mat.length;
  if (n === 2) {
    return [
      [mat[1][1] % mod, (-mat[0][1]+mod)%mod],
      [(-mat[1][0]+mod)%mod, mat[0][0]%mod]
    ];
  } else if (n === 3) {
    const a = mat;
    const adj = [
      [ (a[1][1]*a[2][2]-a[1][2]*a[2][1]), -(a[0][1]*a[2][2]-a[0][2]*a[2][1]),  (a[0][1]*a[1][2]-a[0][2]*a[1][1])],
      [-(a[1][0]*a[2][2]-a[1][2]*a[2][0]),  (a[0][0]*a[2][2]-a[0][2]*a[2][0]), -(a[0][0]*a[1][2]-a[0][2]*a[1][0])],
      [ (a[1][0]*a[2][1]-a[1][1]*a[2][0]), -(a[0][0]*a[2][1]-a[0][1]*a[2][0]),  (a[0][0]*a[1][1]-a[0][1]*a[1][0])]
    ];
    // transpose cofactor matrix
    const trans = Array.from({length:3},()=>Array(3).fill(0));
    for(let i=0;i<3;i++) for(let j=0;j<3;j++) trans[i][j] = ((adj[j][i]%mod)+mod)%mod;
    return trans;
  }
  throw new Error("Only 2x2 and 3x3 matrices supported");
}

function parseKeyMatrix(key) {
  const cleaned = key.toUpperCase().replace(/[^A-Z]/g, "");
  const len = cleaned.length;
  const n = Math.sqrt(len);
  if (![2,3].includes(n)) throw new Error("Hill key must be length 4 (2x2) or 9 (3x3)");
  const mat = Array.from({length:n},()=>Array(n).fill(0));
  for(let i=0;i<len;i++) mat[Math.floor(i/n)][i%n] = cleaned.charCodeAt(i)-65;
  return mat;
}

function multiplyMatrixVector(mat, vec, mod) {
  const n = mat.length;
  const out = new Array(n).fill(0);
  for(let i=0;i<n;i++){
    let sum = 0;
    for(let j=0;j<n;j++) sum += mat[i][j]*vec[j];
    out[i] = ((sum%mod)+mod)%mod;
  }
  return out;
}

export function hillEncrypt(text, key = "GYBNQKURP") {
  if(!text) return "";
  let mat;
  try { mat = parseKeyMatrix(key); } catch(e){ return "Invalid Hill key: "+e.message; }
  const n = mat.length;
  const clean = text.toUpperCase().replace(/[^A-Z]/g,"");
  let padded = clean;
  while(padded.length%n!==0) padded+="X";
  let out = "";
  for(let i=0;i<padded.length;i+=n){
    const block = padded.slice(i,i+n).split("").map(c=>c.charCodeAt(0)-65);
    const res = multiplyMatrixVector(mat, block, 26);
    out += res.map(v=>String.fromCharCode(v+65)).join("");
  }
  return out;
}

export function hillDecrypt(text, key = "GYBNQKURP") {
  if(!text) return "";
  let mat;
  try { mat = parseKeyMatrix(key); } catch(e){ return "Invalid Hill key: "+e.message; }
  const n = mat.length;
  const det = matrixDeterminant(mat,26);
  const detInv = modInverseInt(det,26);
  if(detInv===null) return "Key matrix not invertible modulo 26";
  const adj = matrixAdjugate(mat,26);
  const inv = adj.map(row => row.map(v=>((v*detInv)%26+26)%26));
  const clean = text.toUpperCase().replace(/[^A-Z]/g,"");
  let out = "";
  for(let i=0;i<clean.length;i+=n){
    const block = clean.slice(i,i+n).split("").map(c=>c.charCodeAt(0)-65);
    const res = multiplyMatrixVector(inv, block, 26);
    out += res.map(v=>String.fromCharCode(v+65)).join("");
  }
  return out;
}
// ---------- Additional Classical Ciphers ----------

// 5) Autokey Cipher (Vigenère variant)
export function autokeyEncrypt(text, key = "KEY") {
  const keyChars = (key || "").toUpperCase().split("").map(c => c.charCodeAt(0) - 65);
  if (!keyChars.length) return text;

  const keystream = [...keyChars];
  let out = "", j = 0;

  for (const ch of text) {
    if (/[A-Za-z]/.test(ch)) {
      const base = ch <= "Z" ? 65 : 97;
      const pval = ch.toUpperCase().charCodeAt(0) - 65;
      const k = keystream[j % keystream.length];
      const cval = (pval + k) % 26;
      out += String.fromCharCode(cval + base);
      keystream.push(pval); // extend with plaintext
      j++;
    } else out += ch;
  }
  return out;
}

export function autokeyDecrypt(text, key = "KEY") {
  const keyChars = (key || "").toUpperCase().split("").map(c => c.charCodeAt(0) - 65);
  if (!keyChars.length) return text;

  const keystream = [...keyChars];
  let out = "", j = 0;

  for (const ch of text) {
    if (/[A-Za-z]/.test(ch)) {
      const base = ch <= "Z" ? 65 : 97;
      const cval = ch.toUpperCase().charCodeAt(0) - 65;
      const k = keystream[j % keystream.length];
      const pval = ((cval - k) + 26) % 26;
      out += String.fromCharCode(pval + base);
      keystream.push(pval); // extend with recovered plaintext
      j++;
    } else out += ch;
  }
  return out;
}

// 6) Beaufort Cipher (encrypt/decrypt same)
export function beaufortEncrypt(text, key = "KEY") {
  const ks = key.toUpperCase().split("").map(c => c.charCodeAt(0) - 65);
  if (!ks.length) return text;

  let j = 0;
  return text.replace(/[A-Za-z]/g, c => {
    const base = c <= "Z" ? 65 : 97;
    const cv = c.toUpperCase().charCodeAt(0) - 65;
    const kv = ks[j % ks.length];
    j++;
    return String.fromCharCode(((kv - cv + 26) % 26) + base);
  });
}
export const beaufortDecrypt = beaufortEncrypt;

// 7) Polybius Square Cipher (5x5)
export function polybiusEncrypt(text, key = "") {
  const square = buildPlayfairSquare(key);
  const coords = {};
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) coords[square[r][c]] = `${r+1}${c+1}`;

  const clean = text.toUpperCase().replace(/J/g, "I");
  return clean.split("").map(ch => /[A-Z]/.test(ch) ? coords[ch] : ch).join(" ");
}

export function polybiusDecrypt(cipher, key = "") {
  const square = buildPlayfairSquare(key);
  const map = {};
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) map[`${r+1}${c+1}`] = square[r][c];

  return cipher.trim().split(/\s+/).map(p => (/^[1-5][1-5]$/.test(p) ? map[p] : p)).join("");
}
// ---------- Additional Ciphers ----------

// 8) ADFGVX Cipher (6x6 Polybius + Columnar Transposition)
const ADFGVX_LETTERS = ['A','D','F','G','V','X'];
function buildAdfgvxSquare(polyKey = "") {
  const base = (polyKey || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const seen = new Set();
  const arr = [];
  for (const ch of base) if (!seen.has(ch)) { seen.add(ch); arr.push(ch); }
  for (let i = 0; i < 26; i++) { const ch = String.fromCharCode(65+i); if (!seen.has(ch)) { seen.add(ch); arr.push(ch); } }
  for (let d = 0; d < 10; d++) { const ch = String(d); if (!seen.has(ch)) { seen.add(ch); arr.push(ch); } }
  const square = [];
  for (let r = 0; r < 6; r++) square.push(arr.slice(r*6, r*6+6));
  return square;
}

export function adfgvxEncrypt(text, polyKey = "", columnKey = "3142") {
  const square = buildAdfgvxSquare(polyKey);
  const clean = text.toUpperCase().replace(/\s+/g, "");
  let intermediate = "";
  for (const ch of clean) {
    const idx = square.flat().indexOf(ch);
    if (idx === -1) continue;
    const r = Math.floor(idx/6), c = idx%6;
    intermediate += ADFGVX_LETTERS[r] + ADFGVX_LETTERS[c];
  }
  const key = columnKey.toString();
  const n = key.length;
  const rows = Math.ceil(intermediate.length / n);
  const table = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: n }, (_, c) => intermediate[r*n+c] || "")
  );
  const order = key.split("").map((ch,i)=>({ch,i})).sort((a,b)=>a.ch.localeCompare(b.ch)).map(x=>x.i);
  let out = "";
  for (const colIdx of order) for (let r = 0; r < rows; r++) if (table[r][colIdx]) out += table[r][colIdx];
  return out;
}

export function adfgvxDecrypt(cipher, polyKey = "", columnKey = "3142") {
  const key = columnKey.toString();
  const n = key.length;
  const L = cipher.length;
  const rows = Math.ceil(L/n);
  const order = key.split("").map((ch,i)=>({ch,i})).sort((a,b)=>a.ch.localeCompare(b.ch)).map(x=>x.i);
  const base = Math.floor(L/n), extra = L % n;
  const colLens = new Array(n).fill(base).map((v,i)=>v+(order.indexOf(i)<extra?1:0));
  const cols = new Array(n);
  let idx = 0;
  for (let j=0;j<n;j++) { const colIdx = order[j]; cols[colIdx]=cipher.slice(idx,idx+colLens[colIdx]).split(""); idx+=colLens[colIdx]; }
  let intermediate = "";
  for (let r=0;r<rows;r++) for (let c=0;c<n;c++) if(cols[c][r]) intermediate+=cols[c][r];
  const square = buildAdfgvxSquare(polyKey);
  let out = "";
  for (let i=0;i<intermediate.length;i+=2) {
    const a=intermediate[i], b=intermediate[i+1];
    if(!a||!b) continue;
    const r = ADFGVX_LETTERS.indexOf(a), c = ADFGVX_LETTERS.indexOf(b);
    if(r===-1||c===-1) continue;
    out += square[r][c];
  }
  return out;
}

// 9) Bacon's Cipher (A/B representation)
const baconTable = (() => { const map={}; for(let i=0;i<26;i++){ const bits=i.toString(2).padStart(5,'0'); map[String.fromCharCode(65+i)]=bits.replace(/0/g,'A').replace(/1/g,'B'); } return map; })();
const baconReverse = Object.fromEntries(Object.entries(baconTable).map(([k,v])=>[v,k]));
export function baconEncrypt(text) {
  const clean = text.toUpperCase().replace(/[^A-Z]/g,"");
  return clean.split("").map(ch=>baconTable[ch]||"").join(" ");
}
export function baconDecrypt(cipher) {
  return cipher.trim().split(/\s+/).map(p=>p.length===5?baconReverse[p]||"?":"?").join("");
}

// 10) XOR Cipher (hex output)
function strToBytes(str){ const arr=[]; for(let i=0;i<str.length;i++) arr.push(str.charCodeAt(i)); return arr; }
function bytesToStr(bytes){ return String.fromCharCode(...bytes); }
export function xorEncrypt(text,key="key") {
  const t=strToBytes(text), k=strToBytes(key), out=[];
  for(let i=0;i<t.length;i++) out.push((t[i]^k[i%k.length]).toString(16).padStart(2,'0'));
  return out.join("");
}
export function xorDecrypt(hex,key="key") {
  if(!hex) return "";
  const bytes = hex.match(/.{1,2}/g)||[];
  const k = strToBytes(key), out=[];
  for(let i=0;i<bytes.length;i++) out.push(parseInt(bytes[i],16)^k[i%k.length]);
  return bytesToStr(out);
}
// ---------- 11) TEA (Tiny Encryption Algorithm, 32 rounds, ECB) ----------
function teaEncryptBlock(v,k){
  let [v0,v1]=[v[0]>>>0,v[1]>>>0], sum=0, delta=0x9E3779B9>>>0;
  for(let i=0;i<32;i++){
    sum=(sum+delta)>>>0;
    v0=(v0+(((v1<<4>>>0)+k[0])^(v1+sum)^((v1>>>5)+k[1]>>>0)))>>>0;
    v1=(v1+(((v0<<4>>>0)+k[2])^(v0+sum)^((v0>>>5)+k[3]>>>0)))>>>0;
  }
  return [v0>>>0,v1>>>0];
}
function teaDecryptBlock(v,k){
  let [v0,v1]=[v[0]>>>0,v[1]>>>0], delta=0x9E3779B9>>>0, sum=(delta*32)>>>0;
  for(let i=0;i<32;i++){
    v1=(v1-(((v0<<4>>>0)+k[2])^(v0+sum)^((v0>>>5)+k[3]>>>0)))>>>0;
    v0=(v0-(((v1<<4>>>0)+k[0])^(v1+sum)^((v1>>>5)+k[1]>>>0)))>>>0;
    sum=(sum-delta)>>>0;
  }
  return [v0>>>0,v1>>>0];
}
function toUint32ArrayFromKey(keyStr){
  const keyBytes=strToBytes(keyStr.padEnd(16,"\0").slice(0,16)), k=[];
  for(let i=0;i<4;i++) k.push(((keyBytes[i*4]<<24)|(keyBytes[i*4+1]<<16)|(keyBytes[i*4+2]<<8)|keyBytes[i*4+3])>>>0);
  return k;
}
export function teaEncrypt(text,key="0123456789ABCDEF"){
  const k=toUint32ArrayFromKey(key), bytes=strToBytes(text), pad=(8-(bytes.length%8))%8;
  for(let i=0;i<pad;i++) bytes.push(0);
  const outWords=[];
  for(let i=0;i<bytes.length;i+=8){
    const v0=(bytes[i]<<24)|(bytes[i+1]<<16)|(bytes[i+2]<<8)|bytes[i+3];
    const v1=(bytes[i+4]<<24)|(bytes[i+5]<<16)|(bytes[i+6]<<8)|bytes[i+7];
    outWords.push(...teaEncryptBlock([v0>>>0,v1>>>0],k));
  }
  const outBytes=[];
  for(const w of outWords) outBytes.push((w>>>24)&0xFF,(w>>>16)&0xFF,(w>>>8)&0xFF,w&0xFF);
  return btoa(String.fromCharCode(...outBytes));
}
export function teaDecrypt(b64,key="0123456789ABCDEF"){
  try{
    const raw=atob(b64), bytes=raw.split("").map(ch=>ch.charCodeAt(0)), k=toUint32ArrayFromKey(key), out=[];
    for(let i=0;i<bytes.length;i+=8){
      const v0=(bytes[i]<<24)|(bytes[i+1]<<16)|(bytes[i+2]<<8)|bytes[i+3];
      const v1=(bytes[i+4]<<24)|(bytes[i+5]<<16)|(bytes[i+6]<<8)|bytes[i+7];
      out.push(...teaDecryptBlock([v0>>>0,v1>>>0],k));
    }
    const outBytes=[];
    for(const w of out) outBytes.push((w>>>24)&0xFF,(w>>>16)&0xFF,(w>>>8)&0xFF,w&0xFF);
    while(outBytes.length&&outBytes[outBytes.length-1]===0) outBytes.pop();
    return String.fromCharCode(...outBytes);
  }catch{ return "Bad input for TEA decrypt"; }
}

// ---------- 12) Placeholders for Heavy Algorithms ----------
function libWrapper(name, type){
  if(typeof window!=="undefined"&&window[name]&&window[name][type]) return window[name][type];
  return `${name} not available. Add the library and expose it as window.${name}`;
}
export const blowfishEncrypt=text=>libWrapper("Blowfish","encrypt")(text);
export const blowfishDecrypt=c=>libWrapper("Blowfish","decrypt")(c);
export const twofishEncrypt=text=>libWrapper("Twofish","encrypt")(text);
export const twofishDecrypt=c=>libWrapper("Twofish","decrypt")(c);
export const rc5Encrypt=text=>libWrapper("RC5","encrypt")(text);
export const rc5Decrypt=c=>libWrapper("RC5","decrypt")(c);
export const chacha20Encrypt=text=>libWrapper("ChaCha20","encrypt")(text);
export const chacha20Decrypt=c=>libWrapper("ChaCha20","decrypt")(c);
