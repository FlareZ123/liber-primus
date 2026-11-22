# PARABLE-449 three-line source key: alternate 512-bit p56 digest gate

**Agent31, 13 November 2026. Original-source finite negative; no p56 preimage or unknown-page plaintext.**

The independently solved p57 heading PARABLE has GP-prime sum **449**. Its three solved body clauses have prime sums 1259, 1031, and 1229, yielding remainders **361, 133, and 331** modulo 449. The original seventh-onion HTML independently prints **133** and **331**. Under the conjectural two-digit physical-page plus one-digit one-based printed-line address convention, these three values select exactly three untouched original rune lines:

| Source residue | Original line | Rune count | GP-prime sum |
|---|---|---:|---:|
| 361 | physical p36, line1 | 23 | 1020 |
| 133 | physical p13, line3 | 23 | 1229 |
| 331 | physical p33, line1 | 18 | 920 |

Concatenated in residue order, these **64 original GP runes** have total prime sum **3169**, exactly the 449th ordinary prime. The address grammar was selected retrospectively and remains unproven as a creator-specified operation. The arithmetic source inputs and earlier negative SHA-512/BLAKE2b controls are documented in [Agent38's source report](lp2-onion7-133-331-p13-line3-primesum.md).

A new source-frozen preimage test considered two deterministic 64-byte serializations: the sequence of native GP indices 0–28 and its sequence of native GP prime weights. Both are byte-valued. Under four genuine 2014-era digest algorithms (Skein-512-512, original pre-FIPS Keccak-512, Streebog-512, Whirlpool), each encoding yielded a full 512-bit hash, which was compared to the exact original 128-hex-character p56 AN END target. Every algorithm passed its independent published empty-message full-digest known-answer test vector. The source SFT asserts the exact original rune lines, lengths, sums and both encodings.

**Result: 8 full-hash comparisons, 0 matches to the original p56 digest.** No original plaintext, key or destination was recovered.

The [exact original-source Python SFT](../sims/lp2_p56_parable64_address_alt512_sft.py) passed in [GitHub Actions 43475237352](https://github.com/FlareZ123/liber-primus/actions/runs/43475237352), job132057255983. Its output asserts original line lengths 23/23/18, original prime sums 1020/1229/920, combined3169, 8 comparisons and an empty match array. This follows the [separate four-hash 65-artifact preimage gate](lp2-p56-four-historical512-digest-preimage-gate.md), which also produced zero matches.

**Boundary:** The three-line sequence is not directly the p56 hash preimage as either native GP-byte serialization under these four historical algorithms, and earlier direct SHA-512/BLAKE2b checks of these two encodings were negative. The original arithmetic correspondence may yet signify another operation. There is no original authenticated instruction to vary line indices, byte order, framing, digest family or cipher transform, so arbitrary expansion would be misleading.
