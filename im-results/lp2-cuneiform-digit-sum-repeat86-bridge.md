# Cuneiform digit-sum 86 ↔ LP2 adjacent-repeat count

**Agent 19, 18 November 2026. Evidence class: exact cross-artifact arithmetic/structure observation with a direct receiver negative. No unknown plaintext or key is recovered.**


## Original sign-level adjudication (#2959, Agent18, 26 November 2026)

The literal stamp is ordinary Babylonian sexagesimal numeral notation, not an independently supported phonetic inscription. The original archive `50.jpg` (physical LP2 p33) has seven visually separate ink components at grayscale threshold 128 (area >=50 pixels), in two rows. The half-open source crop is (980,3000,1450,3460); the ink bounding box is (1030,3050,1393,3440). Compare the pre-LP2 [MacTutor Babylonian numeral article](https://mathshistory.st-andrews.ac.uk/HistTopics/Babylonian_numerals/) (2000), the [January 2000 Toronto teaching chart](https://www.math.utoronto.ca/mathnet/simmer/jan-00-notes.html), and the [2009 CDLI sign study, §4.2–4.3](https://cdli.earth/articles/cdlj/2009-1). In the standard positional system, left-pointing angle wedges represent tens (u), upright downward-stem wedges units (diš), grouped into places; groups of up to three wedges are conventional. Read left to right, higher place first.

| Row, cluster left to right | p33 source component box (x,y,width,height) | Sign reading |
|---|---|---|
| top 1 | 1030,3110,71,96 | one tens hook (10) |
| top 2 | 1101,3071,143,180 | seven unit wedges, 3+3+1 (7) |
| top 3 | 1262,3088,58,107 | one tens hook (10) |
| top 4 | 1304,3050,89,101 | three unit wedges (3) |
| bottom 1 | 1030,3264,131,176 | standard compact five-tens sign (50) |
| bottom 2 | 1177,3275,131,125 | five unit wedges, 3+2 (5) |
| bottom 3 | 1335,3271,54,93 | one unit wedge (1) |

Thus the explicit digit pairs are (17,13) and (55,1). The conventional integer values are 1033 and 3301, familiar from the prior Cicada square/protocol material. The absolute radix-point position is conventionally context-dependent in historical Babylonian notation; no additional signs specify a fraction, operation, operand role or GP receiver. The local triangular motifs are normal numeral groupings and need not be independent occult/phonetic symbols. The [Sugarfish 2003 public-domain chart](https://commons.wikimedia.org/wiki/File:Babylonian_numerals.jpg) and its [2010 vector derivative by Josell7](https://commons.wikimedia.org/wiki/File:Babylonian_numerals.svg) show closely comparable distinctive 7/50/5 groups. Both predate LP2. They are useful candidate visual references, not established production sources: exact source image bytes could not be downloaded into the local runtime for pixel/template attribution, and resemblance is not an exact-source match.

**Held-out occurrence test:** p34–p39 (archive 51–56) all have the same 470×460 grayscale crop at (980,100,1450,560), identical element-by-element and with SHA-256 `d52a4ef3c0ceb4842deae0872e2ae01a10dc243946f5b49ae23f3027203f2b3d` of the decoded grayscale array. At threshold128 each has exactly seven components with the same areas and coordinates; p33 bottom stamp has the same seven-cluster topology. Translation-only comparison of tightly cropped binary masks (±4px in each axis; no rotation/rescale) gives p33 versus each header IoU 0.870565, 0.886620 and 0.900045 at thresholds 64,128,192 respectively. There is one repeated graphical motif, not six independent observations of an encoded state or a new operand on p38. The p33 raster is not byte-identical to the later headers.

Reproduce on the supplied combined JPEG ZIP: `python sims/lp2_cuneiform_stamp_gate.py liber-primus-jpegs.zip` (Pillow, NumPy, OpenCV; executed locally). This confirms the reading independently of the 43/33 geometry, but provides no new source-selected arithmetic operation or decryptable key. Do not infer a page-specific state from differences among p34–39 header crops; there are none at decoded grayscale resolution. The unchanged stamp remains compatible with a common section label or common operand pair. The existing finite receiver negatives below remain valid; no further p55 key search is justified by sign morphology alone. Reopen on an exact historical source match with a distinctive non-numeral feature or independently typed operation/recipient.

## Exact source arithmetic

The repeated cuneiform-style header on LP2 pp33–39 is conventionally read as the four sexagesimal components

[
17, 13, 55, 1,
]

forming the two visible base-60 values (17cdot60+13=1033) and (55cdot60+1=3301).

The four literal components have two immediate, parameter-free sums:

- total: **17 + 13 + 55 + 1 = 86**;
- row sums: **17 + 13 = 30**, **55 + 1 = 56**.

Across the entire unsolved LP2 ciphertext p0–p55, there are exactly **86 adjacent-equal rune transitions**. The count is the same whether pages are treated separately or concatenated because no physical page seam is itself an equality.

This exact numerical bridge was not present in the existing cuneiform reports inspected during this invocation.

## Direct 86-rune payload test

Taking one rune from every doubled pair in source order gives exactly 86 GP symbols:

`THXEAJLAESNGGAENOEJFYGXUAEGIAOMHWDXJEAAEGIAOSNXULSELOERCFEOAEMTHEOFNTDHRATHJTAEFXWIOEWEANOEIAEOEXEOEPWWWYNGGTH`

Its GP29 IoC is **0.03365253**, close to uniform. Reading the four component-sized groups (17|13|55|1) in source order, reversing each group, reversing group order, or doing both does not produce readable GP prose.

The four cumulative group boundaries also give no obvious instruction:

- repeat 17: p10 local 182, rune X;
- repeat 30: p23 local 127, rune AE;
- repeat 85: p54 local 155, rune G;
- repeat 86: p55 local 58, rune TH.

The direct ordinal selection (17,13,55,1) gives X, J, D, TH. No source instruction identifies either readout as a key or message.

## Row sums 30 and 56: authentic p56 consumer fails on p30

The row sums are both valid LP2 page numbers, and p56 is the authentic solved prime/totient example. This supplies a much stronger test than treating 30 and 56 as arbitrary constants.

Freeze the solved p56 inverse unchanged:

[
P=C-(p-1)pmod{29},
]

starting with the first prime, with the authentic literal-plaintext-F non-consuming branch. Apply it to original p30.

The inverse state machine has **no legal branch beyond zero-based rune 40**. The live prime-counter set never exceeds one state and is empty at the contradiction. Thus the most direct interpretation "row 30 points to a page that should use p56's solved mechanism" is structurally impossible.

## p50 literal-value bridge also fails

Treating 17, 13, 55, and 1 as conventional numeric values in the p50 printed table does not supply four cells. Only 13 occurs among those conventional low values; 17, 55, and 1 do not. This blocks the simplest cuneiform-components → p50-cell receiver.

## The 86 repeat events as a period-86 key (Agent1, 26 November 2026)

The exact 86-event sequence can be tested as a key, not only read as a payload. The cuneiform components sum to 86, the repeated-run symbols form a fixed 86-symbol sequence, and additive GP29 Vigenère is a simple, recognizable consumer. I applied a global period-86 key from the first rune of p0 through the last rune of p55; no page reset or phase search was introduced.

Three direct key derivations were frozen:

1. **Repeated rune values:** the same one-rune-per-equal-pair sequence already printed above.
2. **Absolute repeat positions modulo 29:** use the zero-based position of the second rune in each repeated pair.
3. **First position plus inter-repeat gaps modulo 29:** use the first absolute position, then each successive gap, giving exactly 86 key symbols.

For each key, both additive signs were tested over the complete 12,956-rune p0–p55 stream. All six readouts are nonprose, and their IoCs remain essentially at the ciphertext baseline:

| Period-86 key | Subtract key | Add key |
|---|---:|---:|
| Repeated rune values | 0.03448270 | 0.03451058 |
| Repeat positions mod 29 | 0.03448086 | 0.03450858 |
| First position + gaps mod 29 | 0.03450956 | 0.03447367 |

The input IoC is 0.03447840. The exact readout prefixes, tails, key strings, byte hashes and round-trip assertions are emitted by the extended SFT. This closes only these three fixed, source-derived period-86 Vigenère keys at global phase zero; it does not exclude using the repeat events as some other form of side information or as part of a separately specified state machine.

## Decision

Preserve **17+13+55+1 = 86 = the complete unsolved adjacent-repeat count** as an exact structural lead. It has a plausible human-puzzle character because both sides are directly observable and require only addition/counting.

Current direct consumers fail:

- the 86 selected runes and natural four-group reversals are nonlinguistic;
- the row-sum page pair (30,56) does not transfer the authentic p56 cipher to p30;
- the four literal components do not map cleanly to p50 conventional values;
- the repeated-rune, repeat-position, and repeat-gap sequences do not decrypt the full p0–p55 stream as direct period-86 additive GP29 keys.

Do not turn the equality into a broad key search. A useful successor needs an independent clue explaining why the doubled-rune events should be segmented, transformed, or used as side information.

Reproduction: **sims/lp2_cuneiform_digits_repeat86_p30_p56_gate_sft.cjs**. Windows Node22 manual SFT passed (run 45768485592).
