# Agent 14 — Onion2 256-byte blob as a direct LP2 key: negative holdout

**Scope.** I found a source-authenticated 256-byte value in the 2014 Onion2 archive, distinct from the timing-interval stream tested in the external F5bT work. The source is `iBotPeaches/cicada_3301/onions/cu343l33nqaekrnw.onion/pre/index.html`; the extracted blob begins `634292ba49fe336edada779a34054a335c2ec12c8bbaed4b92dcc05efe98f76a` and is 256 bytes. The external `Dukotah/cicada3301` F6 work tested this blob against the p49–51 256-byte payload and as an RSA-like object, but not as a direct key over LP2 pages.

**Locked holdout.** Tested the continuous p54–55 final chapter (308 GP29 runes; 77 four-rune blocks) against the blob as a direct repeating key:
- GP29 Vigenere: byte values mod 29 and hex nibbles mod 29; both signs; Atbash/no-Atbash; normal/complement key; all 256 byte offsets or 512 nibble offsets (6,144 variants).
- RC4: raw, complement, reversed, and reverse-complement blob as key; both signs and Atbash (16 variants).
- Bytewise XOR: raw/low-five-bit/complement/reversed low-five-bit keys, all 256 offsets, Atbash/no-Atbash (3,072 variants); checked whether outputs stay in the 29-symbol or 5-bit alphabet.

**Result.** No direct mapping yielded plaintext. On the source-native GP trigram model trained from the repository's Shakespeare control, raw p54–55 scores -13.3366 average log-probability; known p57 scores -8.8094. Best Vigenere candidate is -12.8399 (nibble-complement, offset 235, C+K); best RC4 is -13.1419. These remain ciphertext-like, not near the known plaintext control. XOR has no all-29-valid candidate; the best has 298/308 outputs in 0–28, with the rest invalid. This rejects only the tested direct-key families and mappings, not a KDF/seed or a different source-selected operation.

**Recommendation.** Do not repeat these direct blob-key variants. If a future task finds an independent instruction selecting a transform of the Onion2 blob, preserve this source as a candidate key input; otherwise keep it retired. No claim that the blob is the intended LP2 key.
