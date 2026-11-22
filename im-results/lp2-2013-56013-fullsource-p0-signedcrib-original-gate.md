# Complete historical 560.13 direct-pad scan against a fixed p0 13-rune candidate

**Decision, 22 November 2026:** The complete authentic 118,818,811-byte 2013 CicadaOS file \`DATA/560.13\` contains **zero** contiguous byte-aligned pads that would transform original LP2 p0 red heading indices into the previously frozen hypothetical 13-rune plaintext \`EPIPHANY SEECS\` by either direct modulo-29 additive direction. This excludes exactly the one-byte-per-rune, byte-mod29, unknown-offset, fixed-crib architecture. It recovers no unknown plaintext.

## Why these two operands were selected

- The original physical p0 red heading consists of **13 GP29 runes** in printed 8+5 whole words, followed by a 13-dot mark. Its exact original index vector is \`C=[15,8,18,3,6,19,27,0,15,26,18,21,5]\`.
- A Cicada-signed 2016 message says \`epiphany seeks the devoted\`. Its first two words normalized to the historical GP C/K rule yield the **hypothetical**, not established, \`P=[18,13,10,13,8,24,9,26,15,18,18,5,15]\`, matching the observed 8+5 word lengths. The resulting frozen additive key is \`K=(C-P) mod29=[26,24,8,19,27,24,18,3,0,8,0,16,19]\`. Existing [signed-crib analysis](lp2-p0-epiphany-seeks-signed2016-crib-fclock.md) excludes ordinary repeating period13 and two classical autokeys; the present test instead searches a full historical external pad.
- The original CicadaOS 2013 file \`DATA/560.13\` is a real historically available byte source, unusually selected in a separate 2013 DH transcript by an exact modulus/file-size equality of **118,818,811**. The DH client transcript is unsigned and does **not** instruct LP2 solvers to use this file, so this is a **conditional** cross-release operand selection.
- The 2013 puzzle explicitly used ISO data as XOR pads. Using consecutive source bytes reduced mod29 as a GP29 additive pad is the narrow, reproducible **hypothesis** here; no historical document authenticates that operation for LP2. The hypothesized plaintext title contains no literal plaintext GP F, so the verified Cicada F-transparent bypass does not affect these first13 keyed symbols.

## Full-source finite experiment

Use one byte for each original rune, with zero-based file offset \`t\` unbounded over every possible contiguous 13-byte window. Test both orientations:

1. \`C[i] = P[i] + (file[t+i] %29) (mod29)\` requires byte residues equal to the fixed \`K[i]\`.
2. \`C[i] = P[i] - (file[t+i] %29) (mod29)\` requires residues equal \`-K[i] mod29\`.

The [read-only Node22 CommonJS program](../sims/lp2_p0_signed2016_56013_full_pad_crib_sft.cjs) parses original GP29 corpus data and derives the heading key from the specified literal title rather than copying a looked-up match. It streams the complete historical file via the archive's inner ISO member endpoint, maintains two exact 13-rune KMP matchers across chunk boundaries, and computes the complete SHA-256. A separate randomly planted byte stream with the same thirteen residues inserted across a buffer-chunk boundary is recovered at its exact offset before authentic input is read.

The source file was fully retrieved and cryptographically identified:

| Measurement | Observed |
| --- | --- |
| Full original byte count | **118,818,811** |
| SHA-256 | \`db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f\` |
| Positions satisfying \`+K\` | **0** |
| Positions satisfying \`-K\` | **0** |
| Positive planted-title detector | **PASS** |
| Native Windows Node22 execution | **PASS** |

[GitHub Actions full original run 45052042096](https://github.com/FlareZ123/liber-primus/actions/runs/45052042096), 22 November 2026, source SHA verified and \`SOURCE_SCAN\` recorded in job logs. This is an exhaustive result over the declared file, not a sparse offset sample. Because two 13-symbol patterns over the 29-residue alphabet have an expectation of approximately \`2.3160×10⁻¹¹\` uniform matches in 118,818,799 candidate windows, **zero matches is the predicted outcome of unrelated source content**; it is only negative evidence for the specific historical-cipher hypothesis.

## Research decision

**Retire the signed-2016-crib / 2013-560.13 consecutive-byte direct additive pad route.** There is no reason to rerun additional offsets, sample larger fractions of the same file, or tune a shift after seeing this full result. The fixed title is a guess, the external file-to-LP2 connection is unlicensed, and the full-source direct test found no possible offset. A different authentic plaintext, a separately evidenced key serialization, or a historically documented source-to-rune transformation would constitute a new hypothesis requiring its own source-led decision. No revision of the overall no-unknown-plaintext status is justified.
