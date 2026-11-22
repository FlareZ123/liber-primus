# Five-dot 13/31 selected block-cipher receivers for the original p50 256-byte table

**Decision, 16 November 2026 (Agent15).** A finite, original-source-constrained **self-key block-cipher receiver** has been implemented and tested on the complete unmodified p49–51 numeric table. **0/80 frozen AES-128, XTEA, and TEA decodes** produced a direct typed plaintext. The AES control passes NIST's independent known-answer vector; TEA/XTEA pass published reference vectors. No unknown GP29 plaintext, private key, decoded instruction, or final address has been obtained. The five-dot row selector remains hypothetical, and **nothing in the original artifact selects these particular algorithms**.

## Original clues and precise proposed key extraction

In the original LP2 pp40–55 floral border, five discs are drawn on each side. The left five-disc top-to-bottom hollow/filled reading is **01101₂ = 13** and the right is **11111₂ = 31**. These original-image readings were established before this investigation by [the completed five-dot selector study](lp2-floral-13-31-original-direct-row-and-walk-gate.md). A natural competing interpretation is decorative floral geometry; even if intentional, the original does not state a cipher family.

The adjacent p49–51 numeric field occupies exactly **32 printed rows × 8 two-character base-60-number tokens**. Under the canonical *conditional* radix-60 byte interpretation, this is a 256-byte table. Its pinned byte SHA-256 is:

\`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`.

Treat the two floral five-bit numerals as **zero-based table row addresses**. The original rows 13 and 31 supply two eight-byte strings. Concatenate them in printed order to obtain a **128-bit self-key** \`7a3f1fda0eb82073719eace6b424bd50\`. Removing these rows leaves **30×8 = 240 bytes**; keeping all rows leaves **256 bytes**. Both are divisible by AES's 16-byte block size, and more strikingly **each original eight-byte row is exactly one 64-bit TEA/XTEA block**. TEA and its 1997 successor XTEA are historically available, simple Feistel ciphers using 128-bit keys and 64-bit blocks; see [Needham–Wheeler's 1997 original reference](https://www.tayloredge.com/reference/Mathematics/TEA-XTEA.pdf), the [2005 Microchip XTEA application note](https://ww1.microchip.com/downloads/aemDocuments/documents/OTH/ApplicationNotes/ApplicationNotes/00953a.pdf), and [Crypto++ reference vectors](https://github.com/weidai11/cryptopp/blob/master/TestVectors/tea.txt). No source-authenticated LP2 clue identifies these cipher algorithms.

## Frozen original-byte experiments

All tests use exactly the same pinned unmodified 256 bytes and the two visibly grounded row numbers. Modest conventional ambiguities are enumerated explicitly and **no plaintext-dependent fitting is allowed**:

| Independent choice | AES-128 branch | TEA/XTEA branch |
| --- | --- | --- |
| Row indexing | Zero-based 13,31 or one-based 12,30 | Same |
| Key order | Selected row pair in printed order or reverse row order | Same |
| Ciphertext input | Full printed 256 bytes or 240 bytes omitting two selected key rows | Same |
| Cipher | AES-128 | TEA or XTEA, both with 32 cycles |
| Decipherment | ECB, or CBC with zero IV | ECB, or CBC with zero IV |
| Word byte order | AES canonical | Big-endian or little-endian 32-bit TEA/XTEA words |
| Total | **16** candidate decryptions | **64** candidate decryptions |

The primary AES candidate is zero-based 13‖31, omit key rows, AES-128-ECB. Its first 16 decrypted bytes are \`67c2c01810acb32aec58c636093efd40\`, with **86/240** printable bytes and **28/240** in the direct GP29 index range 0–28.

The more naturally row-shaped **XTEA primary candidate** is zero-based 13‖31, omit key rows, 32-cycle XTEA-ECB with big-endian words. Its first eight decrypted bytes are \`2e14e9b3b72f1454\`, with **85/240** printable bytes, **31/240** direct GP29 byte indices, maximum consecutive alphabetic-or-space run **4**, and invalid strict UTF-8.

For every candidate, report the count of printable ASCII plus horizontal tab/LF/CR, number of bytes 0–28, longest consecutive ASCII alphabetic/space sequence, strict UTF-8 validity, and raw hexadecimal prefix. The declared *typed-receiver* gate accepts either a strict-UTF-8 output containing at least **80% printable** bytes or an output in which **every byte is a GP29 index 0–28**. These are simple readable-instruction/byte-per-rune necessary signatures. They do **not** constitute an exhaustive binary format detector.

**Outcomes on authentic original bytes:**

| Test | Decodes | Strict UTF-8 decodes | Fully direct GP-index byte streams | Typed receivers | Longest ASCII letters/spaces |
| --- | ---: | ---: | ---: | ---: | ---: |
| AES-128 | 16 | 0 | 0 | 0 | 4 |
| XTEA + TEA combined | 64 | 0 | 0 | 0 | 6 |
| **Total** | **80** | **0** | **0** | **0** | **6** |

The 64 TEA/XTEA outputs contained **77–109** printable/whitespace bytes each (240 or 256 bytes total), and **21–38** bytes in the 0–28 range. The most printable case has only **109/256 = 42.58%** printable/whitespace bytes, well short of the typed receiver.

## Reproduction and positive controls

- [AES-128 original-input standalone CJS SFT](../sims/lp2_floral_aes128_direct_sft.cjs), [successful Windows Node.js 22 Actions run 43967844053](https://github.com/FlareZ123/liber-primus/actions/runs/43967844053). Uses Node's built-in cryptography, verifies the original source hash and key bytes, and passes NIST SP 800-38A AES-128-ECB known-answer key \`2b7e151628aed2a6abf7158809cf4f3c\`, ciphertext \`3ad77bb40d7a3660a89ecaf32466ef97\`, plaintext \`6bc1bee22e409f96e93d7e117393172a\`.
- [TEA/XTEA 64-case standalone CJS SFT](../sims/lp2_floral_tea_xtea_direct_sft.cjs), [Windows Node.js 22 Actions run 43971291220](https://github.com/FlareZ123/liber-primus/actions/runs/43971291220). Implements the original published 32-cycle 32-bit integer Feistel rules; positive controls recover TEA \`41ea3a0a94baa940\` and XTEA \`dee9d4d8f7131ed9\` for zero block/key, plus XTEA nonzero key/known plaintext \`497df3d072612cb5\`. Encryption/decryption both checked. All 64 original variants and source SHA are printed/verified.

## Research decision

This is a **falsification of a concrete row-selected conventional cipher receiver**, with XTEA/TEA especially motivated by the original 8-byte row width. No authentic plaintext or self-contained instruction appears, and the selected cipher family has no original Cicada attestation. Avoid extending this result into unrestricted nonce, CBC IV, AES mode, cipher-algorithm, or byte-reordering searches. If an independent source later specifies a block algorithm and complete byte/rune receiver, rerun precisely that original-cipher inverse. The prior 13/31 floral source geometry remains an **intermediate clue**, not a recovered key.
