# Original p50/G quotient as one complete BASE29 bzip2 object

**Agent12, 18 November 2026; Director #1455.** **Result:** the source-selected 254-coefficient G quotient, interpreted under one frozen 2013-style positional BASE29 to minimal big-endian byte convention, is **154 bytes** beginning `1f843d1d`. It is **not** a bzip2 member. A true self-contained original-source-shaped bzip2 plant is recovered exactly, including its decompression checksum. No unknown LP2 plaintext, authentic creator key, standalone typed message, cryptographic method or destination was recovered.

## Human-readable path and why it might matter

The unchanged original p39 red triad at source offsets 119–121 is `[27,5,15]` in GP29 reading order. Treating it as a polynomial's coefficients low-first gives `G(X)=27+5X+15X²=15(X−24)² mod29`, with repeated root 24 independently present as the oversized red A at p54's beginning. The separately printed p49–51 **32×8 = 256** numerical cells yield 256 conventional base60 bytes. Their row-major residues modulo29 form a polynomial exactly divisible by G. This preserves a **254-slot** quotient, a candidate different from the older H×G **252-slot** quotient (whose whole-base29 binary/PGP/gzip/deflate reading was already rejected in [the complete factor study](lp2-grid-complete-gf29-factorization.md#hg-source-quotient-as-a-literal-binary-payload-agent12-14-november-2026)).

An authenticated **2013 Cicada BASE29** worked example licenses a historically accessible digit-to-integer operation, while the authenticated 2014 Stage08 puzzle used an actual bzip2 file extracted with OutGuess ([original-stage audit](cicada2014-stage08-bzip2-original-member-audit.md)). A single plausible next operation is therefore to take the G quotient as a complete base29 positional integer and see whether its bytes hold a bzip2-compressed typed message. The **missing instruction** is the author's specification that these *particular* quotient digits should be treated as a binary file, and specifically as bzip2. The historical examples show capability, not an LP2 mandate; the quotient's arithmetic is independently interesting but not proof of this interpretation.

## Frozen, original-input operation and exact observations

1. Read the **unchanged** original 256 table tokens in printed row-major order using `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` as radix-60 digits, asserting SHA-256 of its **256 bytes** `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Reduce these bytes modulo29 as the highest-degree-first polynomial coefficients.
2. Divide by high-first G coefficients `[15,5,27]` over GF29, retaining the leading zero quotient slot. The exact quotient has **254 digits**, starts `[0,27,6,14,20,11,19,17,3,14,10,23,14,18,10,19,5,24,13,3]`, and has remainder `[0,0]`. Re-multiplication recovers **all 256 original** field coefficients.
3. Interpret the 254 digits as **one** nonnegative positional base29 integer, first digit most significant, and encode as the shortest unsigned **big-endian** byte string. Do not pad to 256 bytes, append terminators, search for an offset, reverse or choose an alternate factor.
4. Apply a **strict single-member bzip2** parser at byte offset0: require `BZh1`…`BZh9` prefix, exact member EOF and no trailing bytes. Only a checksum-validated, full typed plaintext would count.

| Original result | Measured |
| --- | --- |
| G quotient length and leading digit | 254 slots, zero |
| Original file candidate | **154 bytes** |
| First 32 bytes, hex | `1f843d1dde230f1799780b5372c064cdd4638ceed51e8699d69bb1bc1bd1611a` |
| Candidate SHA-256 | `86eb76542e4cb2815bc3e6616237c7d619c214250f2cc0b899f97d6165ce9e2b` |
| Valid bzip2 header at byte zero | **No** (`1f843d1d`, not `425a68`) |
| Complete compressed plaintext, key or instruction | **None** |

**Detector-power control:** Take the first **65 genuine clear p57 GP29 runes** (transliteration = 68 ASCII bytes), compress with standard Python bzip2 level9 into **87 bytes**, encode that complete positive as one base29 integer with precisely **254 zero-padded positional digits**, and multiply by the **unchanged actual G polynomial**. On the synthetic 256-coefficient table, the identical original-source division recovers all **254 digits** and the exact **87-byte BZh9 file**. Strict bzip2 decompression reaches member EOF with no extra data and recovers every **68/68 plaintext bytes** with its internal checksums verified. The original source bytes were never modified.

The test is finite and complete for **this** G-only, whole-integer, canonical-binary, unencrypted bzip2 interpretation. It does not reject a source-selected encrypted packet, alternative GP29 receiver, extra KDF, or ciphertext-dependent state. Those need an independently authored selector before any key/serialization sweep. The earlier G quotient additive moth attack remains a distinct [scoped negative](lp2-moth-p50-gquotient-254-direct-key-gate.md), and the older H×G binary attempt tested a different 252-digit source object.

## Reproduction and Director decision

- Reproducer: [`sims/lp2_p50_g254_base29_bzip2_source_sft.py`](../sims/lp2_p50_g254_base29_bzip2_source_sft.py), standard library Python 3.12, exact original table/p39 glyph assertions and planted bzip2 decode.
- [Windows GitHub Actions PASS run 44280173844](https://github.com/FlareZ123/liber-primus/actions/runs/44280173844), using the existing manual-only read-only Python SFT workflow.
- **Decision:** close #1455's one-source-serialization gate as a negative. The source can supply quotient digits and a standard BASE29 integer mapping, while a required independently printed **quotient-to-bzip2 framing instruction** is missing. A different consumer must be source-motivated first. The authoritative [current findings](../results/README.md) still correctly report the entire unknown book as undeciphered.
