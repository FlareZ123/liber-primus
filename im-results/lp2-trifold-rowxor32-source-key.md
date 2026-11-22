# Literal three-fold 32-byte key from the original numeric grid

**Status (Agent 8, 11 November 2026):** A uniquely defined source-motivated 32-byte candidate key and two bounded original-cipher negative results. **No new plaintext or authenticated key.**

The signed January 2016 Cicada sentence contains three instances of **THE**. In the existing, still-provisional signed-word GP-prime map, THE has sum72; dividing by the original 58 physical LP2 positions gives p14, word1, an unusually literal original-cipher rune word **FOLD**. Three physical half-folds of the 32×8 printed table superpose its eight columns into a one-column stack of 32 rows. The earlier Cicada puzzle used XOR to combine hidden-service data, offering one economical operation for overlaid numeric source shares.

**Additional, source-independent count anchor:** The complete **first printed word of p14**, immediately preceding its second word `FOLD`, is the two-rune `TJ`. Standard GP prime weights give `T=59, J=37`, hence `TJ=96=3×32`. The numeric table independently has 32 rows and the authenticated signed-2016 source sentence repeats `the` three times, which the provisional page/word map sends to `FOLD`. The complete p14 first word is the **only first word on the 57 rune-bearing pages with GP-prime sum 96** under the canonical printed word parser. Exactly 14 of the 841 ordered two-GP-symbol combinations sum to 96. These exact textual coincidences reinforce a concrete human hypothesis of **three 32-row folds**; the particular decomposition 96=3×32 and the prior signed-to-book map are retrospective interpretations, and cannot authenticate the proposed XOR operation or any cipher key. The original source assertions remain the basis of the limited cryptographic tests below.

For each row r, with eight canonical radix60 byte values `b[r,c]`, the literal bitwise overlay has a fixed output

`K[r] = b[r,0] XOR b[r,1] XOR ... XOR b[r,7]` for r=0..31.

Order and face of folding cannot change K because XOR is associative and commutative. Thus **the unique 256-bit candidate** is

`74771ec30557c8be1709235b7a65f2dc938c2276dbfe2f33d855d2508adfc9d8`.

The original printed byte serialization has SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The key depends on radix60; the printed table is also readable in a documented alternate radix59, so neither the radix nor the proposed XOR is independently authenticated by the fold clue.

## Exact original-cipher tests

The [single-file SFT](../sims/lp2_trifold_rowxor32_source_inverse_sft.cjs) freezes the source grid, independently checks the signed sentence's three THEs and p14's actual FOLD, and derives K without ciphertext fitting. It tests a **zero-IV AES-256-CTR byte stream**, projected modulo29 to the original GP29 ciphertext, under both additive signs. The full 12,956-rune book produces IoC **0.03449607** (subtract sign) and **0.03445808** (add sign), both essentially the uniform baseline **1/29 = 0.03448276**, and the plaintext previews contain no recognizable prose. The p32/p55 single-page inverses likewise yield no recognizable plaintext. These tests exclude the direct zero-IV, byte-residue GP29 reading for this fixed key. They do not exclude a different hidden nonce, a novel rune-byte transport, or post-encryption repeat filtering.

A second, separate family reads each original GP29 sequence as one big-endian base29 integer, serializes it as fixed-length bytes and treats it as a standard `12-byte nonce || ciphertext || 16-byte tag` packet. Both AES-256-GCM and ChaCha20-Poly1305 authenticate **zero of six packets**: the 7,868-byte unsolved book, 74-byte p32 and 47-byte p55, under both algorithms. Positive controls authenticate both algorithms, and one-byte tag corruption is rejected. This excludes only those two exact standard tagged packet layouts, which were **not** specified by Cicada.

The full test passed [manual GitHub Actions run 42968680165](https://github.com/FlareZ123/liber-primus/actions/runs/42968680165) using the [dispatch-only workflow](../.github/workflows/lp2-trifold-rowxor32-manual.yml).

**Decision:** The literal grid fold yields a reproducible, orientation-independent 32-byte key candidate. It does not decipher any LP2 rune under the two defined common cryptographic transports. Do not promote it to established cipher information, vary hundreds of unhinted IVs, or relabel a failed packet as plaintext; a new source instruction must specify the missing use of the candidate bytes.
