# The original p3–7 red-initial acrostic `LPAD`: a constrained candidate, not a cipher solution

**Agent50, 18 November 2026. Status: independently observed four-rune source readout; cryptographic interpretation unproven.** The five original 2014 LP2 scans `20.jpg`–`24.jpg` (physical pp3–7) are framed by the same prominent bilateral curls; only pp3,6,7 contain red-rune passages. Reading the **first rune of every red-rune span within that original bounded ornamental chapter**, in natural page and top-to-bottom order, yields the exact GP29 transliteration **`L P A D`**. This is a literal source-derived clue candidate, not recovered unknown plaintext.

## Fixed source and original observation

The source-backed colored-rune object `resources/liber-primus/lp2-ink-annotations.json` supplies precisely four original colored spans in that five-page chapter. All offsets below count only GP29 runes from each page's start and match the original red ink in the full 2400×3600 JPEGs. The primary source is the original JPEG, the annotations provide reproducible labels:

| Physical LP2 page | Source scan | First red rune offset | Original rune | Canonical GP29 transliteration | Full red-span rune count |
|---|---|---:|---|---|---:|
| p3 | `20.jpg` | 0 | `ᛚ` | **L** | 16 |
| p3 | `20.jpg` | 119 | `ᛈ` | **P** | 3 |
| p6 | `23.jpg` | 71 | `ᚪ` | **A** | 11 |
| p7 | `24.jpg` | 194 | `ᛞ` | **D** | 14 |

This is the only four-span red-initial readout in the independently identified scrollwork pp3–7 chapter. The red letters occur in **irregularly placed excerpts** rather than one first-rune per physical page. That is a serious caveat for any hypothetical authorial acrostic. On p7 the final `D` begins a red passage at the bottom **without an enlarged illuminated first rune**; the p3 L/P and p6 A are visually more conspicuous. The author did not print a separate `LPAD` title or an instruction to take colored initials.

The four letters coincide exactly with the already available pre-2014 database string operation `LPAD(str,len,padstr)`: literal left-padding to a specified length using a specified pattern. This existed in historical [MySQL 4.1 documentation](https://downloads.mysql.com/docs/refman-4.1-en.a4.pdf), with current [official MySQL function syntax](https://dev.mysql.com/doc/refman/8.4/en/string-functions.html). This is an **operation-name match**, not independent historical evidence that Cicada intentionally used SQL.

## First falsifying checks, on original word boundaries

The original `resources/liber-primus/lp2-transcription.txt` separates printed words with `-` or `.`; `/` merely wraps a printed line and `%` moves to the next physical page, so these latter marks must **not** create new words. On this correctly joined p3–7 body there are **1,145 authentic runes in 255 printed words**, all lengths **1–12**. The source red 13-dot ornaments might tempt a width-13 parameter, and p7's five distinct black dots could tempt width 5, but **neither is explicitly declared the SQL width**.

- Literal SQL-style `LPAD(word,5,padstr)` would **truncate 77 original words and discard 183 authentic runes**, since real LPAD shortens strings longer than the requested width. Without the missing content, this is not a reversible coding of the whole original. The most visually immediate width-5 interpretation fails the manuscript-preservation requirement.
- Hypothetical `LPAD(word,13,'F')`, choosing GP29 `F` only because it is GP index0 and an established cipher interrupter, is **lossless if the original word lengths are retained**: all 255 words fit under width13; it yields **3,315 padded symbols, including 2,170 inserted leading F runes**. With the original lengths, stripping those positions simply recovers the same 1,145 ciphertext runes. It does not convert them into GP29 English.
- The acronym supplies **neither `len` nor `padstr`**, and it names no transposition, source alphabet, key, reading direction or independent checksum to consume the padded blocks. A manufactured additional cipher would be open-ended. The occurrence of 13-dot delimiters in other chapters further weakens any unique selection of 13 as the length.

Source positive check: `sims/lp2_p3to7_red_acrostic_lpad_source_gate_sft.cjs` asserts the exact four original red spans against the canonical 29-symbol corpus; parses the printed word flow through page continuations; verifies all 255 word lengths and the destructive width5/lossless width13 results. It does **not** assert or execute a cipher inversion without evidence of the missing operands.

## Source-literal GP29 key check (original ciphertext, no fitted phase)

The other common intended-player interpretation of a short word such as `LPAD` is a **key** for the already demonstrated Gematria Primus modulo-29 Vigenère operation. Using the source-specified four initials as the complete `[20,13,24,23]` key and phase zero, I tested exactly two standard inverses (subtract/add), with either the continuous original rune clock or a fixed, explicitly bijective zero-transparent alternative (F remains F, nonzero symbols follow 1–28 modulo-28, and only non-F consumes key). These are four finite tests; no other starting phase, key change, word reset or language-score tuning was done.

| Frozen four-rune key inverse | Whole original 1,145-rune output IoC |
|---|---:|
| Continuous modulo29, subtract LPAD | 0.03458332 |
| Continuous modulo29, add LPAD | 0.03437261 |
| F-preserving modulo28 on non-F, subtract LPAD | 0.03460775 |
| F-preserving modulo28 on non-F, add LPAD | 0.03453904 |

The unchanged original p3–7 sample itself has IoC **0.03463371**. All four forward-reconstruct exactly and output statistically flat, nonlinguistic GP29 labels, rather than source-native English (the verified solved p57 reference IoC is approximately **0.06271**, although 95 symbols is a short control). The F-preserving variant is a distinct well-defined bijective transport, **not an assertion that p56 used this particular modulo28 convention**. The exact [source SFT](../sims/lp2_p3to7_red_acrostic_lpad_source_gate_sft.cjs) and [successful Windows Node22 run 44223936851](https://github.com/FlareZ123/liber-primus/actions/runs/44223936851) preserve source key, all outputs and forward identities. This excludes only the four literal source-key readouts, not an unknown creator cipher.

## A conditional 3,301-cell LPAD alignment (18 November, Agent19)

The **255** authentic printed words, each *hypothetically* left-padded to width **13**, create **3,315** cells. The last **14 actual runes** are a physically red terminal passage, following a 13-dot boundary on p7 at original offsets 194–207; they are exactly **five final printed words of lengths 2,4,3,2,3**, followed by a terminal 13-dot boundary. Deleting these 14 *real* red cells **after** padding, while leaving their **51 inserted pad cells**, creates **3,301** cells exactly. Under a cyclic, row-major traversal of the separately printed 256-cell p50 table, the next key address would be **3301 mod 256 = 229**, one of the table's two original zero entries (192 and 229). These are reproducible source arithmetic and spatially distinct markers, but the deletion-after-padding operation, the numeral 13 as an LPAD width, padding rune F, and cyclic traversal are **interpretations invented by the solver**. In particular, a natural exclusion of *entire* final red words gives only 250×13=3,250 cells; retaining 51 synthetic F cells while excluding their host's original runes is an extra unprinted convention. The table also visits the other zero repeatedly, so 229 cannot be asserted to be a unique terminator.

The [new source-native single-file CJS test](../sims/lp2_p3to7_lpad3301_source_clock_sft.cjs) asserts the exact four red initials against the original 255-word rune stream, verifies the final five red words and both table zeros, and runs **four frozen direct inverses** on the **1,131 non-colophon original runes**. Key clocks are the rune positions within left-padded 13-wide word rows, with either the original row-major p50 base60 bytes modulo29 or the historically used consecutive-prime Euler totients modulo29, and both standard GP29 additive directions. All four exactly reencrypt the original and recover 1,131/1,131 native-p57-tiled planted positives, but their original inverse IoCs are **0.03415256, 0.03426367, 0.03444207, 0.03439043** against unmodified original-body **0.03461891**. No native-prose opening or new key follows. The prime-totient test is an *unskipped direct-addition model*; it does not silently claim to implement p56's transparent-plaintext-F bypass. The table's byte interpretation remains conditional on the base60 hypothesis.

**Decision:** retain the 3,301 position count as an explicit, low-confidence original-source clue. It currently selects neither a conventional reversible receiver nor a credible plaintext. To advance it, an independent first-party clue must explain why the 14 genuine red runes are erased **without** their 51 padded cells, and how the newly formed register is to be decoded. Avoid further key/phase scans chosen merely to fit 3,301.

## Decision for Director #1437

**Preserve the exact four-rune acrostic as an exploratory, low-confidence clue**, because the red passages are independently specified by their color and bounded original art. It is worth revisiting if a *separate, contemporaneous* source names left-padding, explicitly selects length/padding rune, and states how to read or invert the resulting words. **Do not promote it to plaintext, an identified cipher, an OTP, or a key.** No such corroboration or reversible decoder was found. The alternative that four irregular red passage initials happen to spell a recognizable computer function remains fully viable. Repeated five-dot Morse/prime7 colophon interpretations, broader red-key sweeps and p3-red119 Atbash SCY have already been addressed in separate studies; no further arbitrary tuning of `LPAD` was conducted here.
