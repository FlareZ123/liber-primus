# Original p40 red-eight as ChaCha20 nonce, eight printed table columns as keys

**Agent30, 13 November 2026. Bounded original-rune negative.** This single, explicit source-shaped cryptographic reading produces no new LP2 plaintext, cipher key or authenticated continuation. It adds a red-heading-as-nonce check that the earlier eight-column/zero-nonce ChaCha20 audit did not cover.

## Human-visible route and locked interpretation

The original physical p40 has an eight-GP-rune red heading `[0,9,19,26,6,23,25,8]`; it heads the pp40–53 chapter of **3,008** runes, leaving exactly **3,000** after that header. The original numeric table on pp49–51 contains **32 rows × 8 columns**, conditionally encoded as base60 into 256 bytes. Taking **one uninterrupted printed vertical column** gives one 32-byte key for each of eight columns. Eight red GP ordinal values also give exactly the eight bytes of the original 64-bit nonce flavor of ChaCha20/256. A technically experienced 2014 solver could recognize these sizes.

The operation is *not source-authenticated*: neither the inscription nor signed Cicada materials names ChaCha20, declares that the red heading should serve as a nonce, chooses among eight columns, or prescribes byte `%29` keystream reduction. The nonce `00 09 13 1a 06 17 19 08` is simply the printed GP29 indices, in their existing order. This is a bounded no-fit hypothesis, not a recovered key.

Freeze the entire original p40–53 cipher body as one continuous 3,000-rune record. For each of the **eight** original vertical columns, use standard ChaCha20/256, 64-bit zero initial block counter, 64-bit red nonce, then apply both directly reversible GP29 operations `P_i=(C_i ± (streamByte_i % 29)) mod29`. No key or nonce bytes are modified, no original rune is omitted from this 3,000-rune body, and no position, orientation, reset, parameter or score is used to choose a candidate.

## Full original-input result

The original ciphertext-body GP index of coincidence is **0.034544403690**, and all **16** candidate inverses remain close to uniform `1/29 ≈ 0.03448276`. The best candidate is **column 3 (zero-based), plus sign**, IoC **0.034664888296**. The least concentrated is column 2, plus sign, IoC **0.034318106035**.

| Original column (zero-based) | Subtract byte residue, IoC | Add byte residue, IoC |
| --- | ---: | ---: |
| 0 | 0.034586862287 | 0.034419473158 |
| 1 | 0.034422807603 | 0.034637768145 |
| 2 | 0.034415916417 | 0.034318106035 |
| 3 | 0.034454151384 | **0.034664888296** |
| 4 | 0.034447037902 | 0.034373013227 |
| 5 | 0.034565744137 | 0.034425252862 |
| 6 | 0.034402800934 | 0.034605979771 |
| 7 | 0.034406802267 | 0.034535956430 |

These values are far below the roughly **0.06** native-GP English references established in the repository. The outputs lack ordinary-language concentration and provide no authentic plaintext. This result says only that these 16 fixed direct GP29 additive inverses are unpromising. It does not exclude another key-derivation rule, an unrecognized intermediate cipher, source-specified ChaCha variants, hidden streams, or an entirely different treatment of the table.

## Verification

The [source-exact SFT](../sims/lp2_p40_red8_chacha_nonce_sft.cjs) directly loads the tracked 58-page GP29 corpus and canonical 256-byte grid, asserts the complete 3,008=8+3,000 chapter split and the table SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. It implements the original 64-bit-nonce ChaCha20 block with a published all-zero key/nonce RFC-style known-answer vector, and exact forward re-encoding of all original runes for all 16 candidates. Every candidate also encrypts and recovers a 3,000-rune repeated source-native control drawn from genuine solved p57, 3,000/3,000 positions exactly. The 16 original-output IoC values are locked in assertions.

The actual 16 candidate scores above were computed directly from the current repository's original 3,008-rune chapter and checked in a JavaScript execution environment with the standard ChaCha20 zero-key vector. The committed Node.js SFT reproduces the same source operation and asserts these results. **No manual GitHub Actions job was dispatched**; the source file can be run by a researcher with Node.js 22.

**Research decision:** do not assign additional grid-column cipher mode, arbitrary nonce-phase or orientation sweeps based solely on the eight-by-eight visual correspondence. A creator-selected consumer or independently validated key would be needed to reconsider this route.
