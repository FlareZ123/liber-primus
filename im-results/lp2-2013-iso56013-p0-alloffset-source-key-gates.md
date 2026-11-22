# Original CicadaOS DATA/560.13 as a full-offset p0 source key: two exact inverse gates

**Agent37, 22 November 2026. Classification: complete, original-input negative tests of two specific source-byte→GP source-key architectures. The three proposed p0 plaintext spans remain unverified, and no unknown Liber Primus plaintext, original cipher, or author-selected ISO key offset is recovered.**

## Why this particular historical key bank is an admissible source

The 2013 CicadaOS `DATA/560.13` is an actual earlier Cicada puzzle operand: the documented 2013 phone stage supplied a dataset number, source byte offset, and XOR data field, recovering a former Tor onion address from an **explicit source-specified byte offset**. The full original file is **118,818,811 bytes**, independently preserved as a member of `3301.iso`, and can be accessed directly at `https://archive.org/download/3301.iso/3301.iso/DATA%2F560.13`. Its pinned SHA-256 is `db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f`. The Windows manual workflow asserts both properties after downloading before starting any test.

The original ciphertext in the canonical LP2 p0 page has a **13-rune red title-shaped opening** at offsets0–12. The project's prior signed-2016 navigation work proposes three plaintext constraints, independently of the 2013 file:

| Hypothetical p0 original plaintext | Original GP29 positions | Number of GP runes |
| --- | --- | ---: |
| EPIPHANY SEECS, with historical K→C GP spelling | 0–12 | 13 |
| THE ROAD | 103–108 | 6 |
| THE DEVOTED | 235–243 | 9 |
| **Total** | **28 original ciphertext coordinates** | **28** |

These are **hypothesized navigation-derived cribs**, not verified decryption. Treating them as true is a stronger assumption than merely believing that `560.13` is creator-authored. The test is conditional on them and tests whether a whole originally encrypted recipient could fit an independently available source file under a frozen historical-looking rule. The source does not instruct a human to use an arbitrary byte start, which is why **every** possible start is admitted rather than optimizing after seeing local English.

## A. Any single affine GP29 byte key with three secret coefficients

For original p0 GP29 plaintext P and ciphertext C, test the complete family

`C[i] = a×P[i] + b×K[i] + d (mod29)`,

with **completely private** `a,b,d` (a,b nonzero) and `K[i]` read from successive original ISO source bytes. Both projections `byte mod29` and `floor(29×byte/256)` and both forward/backward source directions are allowed.

For **each** of the 118,818,568 possible source starts per projection/direction, solve the three-unknown linear system algebraically on the first three p0 title runes, choosing the first linearly independent third row when necessary. Then test the other 10 consecutive title positions unchanged. This tests every secret `a,b,d` for the source candidate without enumerating all 29³ coefficients or dictionary-scoring any rune. A successful whole13 title would trigger checking the untouched ROAD and DEVOTED positions.

| Source-byte projection | Direction | Starts exhausted | Longest original title prefix | Exact 13-rune title hits |
| --- | --- | ---: | ---: | ---: |
| mod29 | forward | 118,818,568 | 8 | 0 |
| mod29 | reverse | 118,818,568 | 8 | 0 |
| balanced29 | forward | 118,818,568 | 8 | 0 |
| balanced29 | reverse | 118,818,568 | 9 | 0 |

A source-native positive for **each of the four** complete methods planted a 28-position crib using a genuinely private affine slope, byte slope, and intercept; all **28/28** planted source positions and all four source offsets/directions were exactly recovered. All original sources, plants, and assertions passed on [Windows Node.js 22 run 45083951709](https://github.com/FlareZ123/liber-primus/actions/runs/45083951709).

The decisive exclusion is limited to this single direct constant-affine ciphertext rule, both fixed byte-to-rune projections, and a source clock consuming a byte at each original GP rune. It does not refute the authenticity of the three plaintext predictions, or another original source key, or an evolving state cipher.

## B. Secret additive GP28 byte key under a predecessor-excluding ciphertext alphabet

A much stronger independent cipher clue is the unknown book's rarity of adjacent-equal runes. If the cipher emits a transformed symbol drawn from the **28 possible GP29 rune values except the immediately preceding ciphertext rune**, each cipher step has a 28-symbol rank. Test both fully reversible 28-rank definitions:

- **Sorted:** remove the preceding ciphertext rune from the canonical ascending 0–28 runes.
- **Cyclic:** read the 28 runes clockwise after that preceding rune.

For each transition i after the first original p0 title rune, let `R[i]` be its rank 0..27. The original proposed title's **13 GP runes are all non-F**, so under the known 2014 Cicada plaintext-F passthrough rule, all **12 title transitions must consume a key**. A literal source-key model is

`R[i] = (P[i] − 1 + key[i] + d) mod28`,

where a fixed completely secret `d` is admitted. Subtracting the first title transition removes `d` exactly. Scan **every** source-byte offset for all 11 required source-key residue differences, across both rank grammars, byte projections `byte mod28` and `floor(28×byte/256)`, and both forward/reverse source directions. Each of the eight variants tests **118,818,568** original source starts.

| GP28 rank grammar | Mod28 forward / reverse longest prefix | Balanced28 forward / reverse longest prefix | Exact complete 12-transition title hits (four variants) |
| --- | --- | --- | ---: |
| Sorted | 6 / 6 | 6 / 6 | **0** |
| Cyclic | 6 / 6 | 6 / 6 | **0** |

If a source title hit existed, the SFT would demand the two other original cribs too, allowing **every** possible count of authentic plaintext-F key skips in the unknown intervals between title, ROAD and DEVOTED. No title hits occurred, so no offset survived to those heldout gates.

Eight planted GP-native source controls construct correct original-shaped ciphertext under both rank grammars, both byte projections and both directions. They introduce plaintext-F bypasses between the three separately positioned spans, yet recover all **27 expected non-F transitions**, the true ISO-like source offset, the unknown additive bias and compatible source clocks through all three spans. All eight positives and the full original scan passed [Windows Node.js 22 run 45084371239](https://github.com/FlareZ123/liber-primus/actions/runs/45084371239).

## Decision for source-led cryptanalysis

Both source-byte mechanisms are **excluded on the exact original p0 title under the independently predicted title plaintext**, across every possible contiguous source offset in the complete hash-pinned 2013 CicadaOS file. This covers an unconstrained key offset and fully secret constant affine parameters/bias without relaxing ciphertext integrity. The original byte source and earlier 2013 offset-XOR opcode are historically real, but a human LP2 solver is still missing an original instruction to select this file and its start.

The more promising next use of the historical source would require a **different author-selected typed operation**, such as the documented 2013 byte XOR applied to explicitly represented GP data, or a recoverable offset supplied in original 2014 media. Longest fitted prefixes of 6–9 runes among approximately a billion source tests are ordinary look-elsewhere coincidences, not partial plaintext.

**Reproduce:** read-only CommonJS [affine SFT](../sims/lp2_2013_iso56013_threecrib_alloffset_secret_affine_sft.cjs) and [GP28 predecessor SFT](../sims/lp2_2013_iso56013_p0_title12_gp28_source_pad_sft.cjs), with downloaded hash-pinned 2013 source and environment `CICADA_ISO_56013_PATH`. Manual Windows input verification and execution are in [the source-file workflow](../.github/workflows/manual-cicadaos-full56013-crib-scan.yml), whose exact run IDs above preserve the scripts as executed even when its manual task is changed later.
