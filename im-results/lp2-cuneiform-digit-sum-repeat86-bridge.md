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

Thus the explicit digit pairs are (17,13) and (55,1). The conventional integer values are 1033 and 3301, familiar from the prior Cicada square/protocol material. The absolute radix-point position is conventionally context-dependent in historical Babylonian notation; no additional signs specify a fraction, operation, operand role or GP receiver. The local triangular motifs are normal numeral groupings and need not be independent occult/phonetic symbols. The [Sugarfish 2003 public-domain chart](https://commons.wikimedia.org/wiki/File:Babylonian_numerals.jpg) and its [2010 vector derivative by Josell7](https://commons.wikimedia.org/wiki/File:Babylonian_numerals.svg) show closely comparable distinctive 7/50/5 groups. Both predate LP2. They are useful candidate visual references, not established production sources: the exact 2010 vector has now been recovered and its direct-copy fit is weak (see the source test below); the 2003 raster remains unavailable to local pixel computation. Resemblance is not an exact-source match.

**Held-out occurrence test:** p34–p39 (archive 51–56) all have the same 470×460 grayscale crop at (980,100,1450,560), identical element-by-element and with SHA-256 `d52a4ef3c0ceb4842deae0872e2ae01a10dc243946f5b49ae23f3027203f2b3d` of the decoded grayscale array. At threshold128 each has exactly seven components with the same areas and coordinates; p33 bottom stamp has the same seven-cluster topology. Translation-only comparison of tightly cropped binary masks (±4px in each axis; no rotation/rescale) gives p33 versus each header IoU 0.870565, 0.886620 and 0.900045 at thresholds 64,128,192 respectively. There is one repeated graphical motif, not six independent observations of an encoded state or a new operand on p38. The p33 raster is not byte-identical to the later headers.

Reproduce on the supplied combined JPEG ZIP: `python sims/lp2_cuneiform_stamp_gate.py liber-primus-jpegs.zip` (Pillow, NumPy, OpenCV; executed locally). This confirms the reading independently of the 43/33 geometry, but provides no new source-selected arithmetic operation or decryptable key. Do not infer a page-specific state from differences among p34–39 header crops; there are none at decoded grayscale resolution. The unchanged stamp remains compatible with a common section label or common operand pair. The existing finite receiver negatives below remain valid; no further p55 key search is justified by sign morphology alone. Reopen on an exact historical source match with a distinctive non-numeral feature or independently typed operation/recipient.

## 2010 SVG production-source test (#2967, Agent12, 26 November 2026)

**Decision: exact historical SVG acquired; direct similarity-copy model is strongly disfavored.** The [2010 Josell7 SVG](../resources/external/babylonian_numerals_2010.svg) was recovered byte-for-byte from a [pinned public mirror](https://github.com/tathougies/csforkids/blob/727e0b4493893b656707849eae458fa9d80126f0/week1/figures/Babylonian_numerals.svg): 220,819 ASCII bytes, SHA-1 4a117a94d010e658cf0f8bc8a04830a51874e453 matches Commons structured data; Git blob b1065e2446826360a1cc169cc26a47e9e8e8b4e1 matches the remote stored copy. See [attribution and licence](../resources/external/babylonian_numerals_2010.md). The current SVG is the reinstated 29 March 2010 version.

**Receiver:** select the SVG path IDs for 17/13/55/1, preserving within-digit geometry. Original p34 (archive 51.jpg) seven components at grayscale128 and area>100 have source-order areas 2528,8756,1726,3070,6228,5548,1538. Render source paths with their original cumulative translations and 3-unit strokes at 4× (coordinates rounded to 0.001, translations to 0.00001 in the locally executed extracted-path test). For fixed rotation/scale, compute the maximum full-mask binary IoU over integer translations using padded cross-correlation. Optimize rotation −75°..75° and SVG-to-original scale 1.8..6.8 by seeded differential evolution; these are numerical fits, not certified global optima. Whole chart coordinates cannot directly align to the two-line stamp, so permit independent digit placement while freezing common scale/rotation. Also relax each sign to its own scale/rotation.

| Target | Individually optimized IoU | Rotation (deg) | Scale |
|---|---:|---:|---:|
| 17 tens | .54379 | 15.83 | 4.432 |
| 17 units | .58210 | 26.12 | 5.105 |
| 13 tens | .69948 | 20.37 | 3.628 |
| 13 units | .55312 | 23.85 | 3.330 |
| 55 tens | .42754 | 24.65 | 3.964 |
| 55 units | .50441 | 9.15 | 3.831 |
| 1 | .65671 | 11.51 | 3.154 |

- Shared scale/rotation across seven components, independent translations: mean IoU .49635 (18.9997°, 3.9047×).
- Full digit-group fits preserving within-digit spacing: 17 .48823, 13 .41364, 55 .39342, 1 .65671. Shared transform across four groups, independent placements: mean .39885 (15.8964°, 4.3077×), individual IoUs .38181/.30921/.37382/.53054.
- Exact-source positive: seven masks independently placed after planted 22° and 4.6× source similarity. Truth IoU 1.0 for each; blind shared optimizer recovers 22.00025°, 4.59999× and all seven IoUs 1.0. No JPEG degradation plant or independent historical comparator calibration was run, so this is a numerical direct-copy diagnostic rather than a universal source-attribution classifier.
- Stronger structural distinction: SVG paths path3673 and path3869 are exactly identical after their initial absolute move (all relative commands and stroke widths). The two actual original tens marks instead have different geometry. Best integer translation-only IoU on p34 is .48482/.52146/.54334 at thresholds 64/128/192; area ratios 1.5072/1.4647/1.3831. On p33 the corresponding values are .50019/.51937/.53645 and 1.4588/1.4486/1.4191. These two repeated stamps are not independent evidence; threshold variation guards against fragile segmentation. A common unaltered source transform would preserve the same local shape and nominal area. Individual transformations, repainting, manual redraw or another underlying source are distinct models.

[Reproducer](../sims/lp2_cuneiform_svg_similarity.py) reads the exact preserved SVG and extracts selected paths, matching the rounding of the executed local path subset. Local numerical core and plants executed; the integrated repository-file extractor has not been run end-to-end on the actual full SVG in the container because the file was accessible via the GitHub connector but not the local filesystem. The 2003 Sugarfish raster was displayed from its exact Commons URL, but binary transfer to the computation environment failed; exact-name GitHub searches found no JPG or PNG mirror. No quantitative attribution of the raster or independent historical comparator is claimed. The visual similarity remains ordinary shared numeral morphology, and the direct-vector model supplies no new typed clue, plaintext or key. Retire the direct common-similarity SVG copy hypothesis; do not extend to additional base60 or p55 arithmetic. A future raster-specific test needs the actual 29,817-byte JPG (SHA-1 3aea0ef57bf0e0f3a3a649c4f6029777fefee5be) or documented equivalent.

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

## 2013 recursive decimal digit sum as a state receiver (Agent3, 27 November 2026)

Question 20 of the reported 2013 final questionnaire asks for recursive decimal digit summation to a single digit ([participant retrospective](https://leroy.works/articles/answers-to-cicada-3301-2013-questionnaire/), [archived questionnaire transcription](https://uncovering-cicada.fandom.com/wiki/Test_.onion)). These are secondary transcriptions, not an independently recovered original screenshot or signed Q20 source. The cuneiform integers 1033 and 3301 are decimal digit permutations and both reduce to **7**: one dependent observation, not two independent clues. Original archive 50.jpg places the stamp at the bottom of p33, while p34–39 repeat it at the top. Start at the first rune of p34 and carry state through later pages; separately test literal repeated-header resets.

Freeze the inferred sender: r=7, C=(P+s*r) mod29 with s=+1 or −1; then r=1+((r+GPprime[P]−1) mod9), the digital root of the cumulative positive plaintext prime sum. Ordinary and literal-plaintext-F-transparent (emit 0 without updating r) variants are separate. The historical question names recursive digit summation, **not this key schedule, recipient, or feedback choice**. An exact finite-state DP counts all compatible plaintext paths by (r, previous plaintext rune), including both legal interpretations of ciphertext F and disallowing consuming plaintext F in the hold model. Smoothed GP-native bigrams rank paths, trained on five LP1 records named 0_ (2,391 runes), with four other solved-native records held out. All complete MAP outputs re-encipher exactly.

| Original seed7 continuous read | p34 (261 runes) | p35–39 (1,205 runes) |
|---|---:|---:|
| s=+1, ordinary | −4.22045 | −4.23601 |
| s=−1, ordinary | −4.28329 | −4.21497 |
| s=+1, F-hold | no path at zero-based offset35 | not reached |
| s=−1, F-hold | no path at zero-based offset78 | not reached |

All eighteen initial-state/sign F-hold combinations die within p34 (offsets13,35,78). **0/108** independent p34–39 page-reset seed/sign F-hold receivers admit a complete path; latest dead offsets per page: 78,31,29,75,58,39. Thus even private initial roots on each identical-stamp page cannot rescue this exact rule. Ordinary seed7 page-reset readouts remain nonprose (−4.28532 to −4.13360 nats/rune); ordinary continuous output remains nonprose for all nine roots and both signs.

Sixteen held solved-native plants (four records × two signs × two F conventions) all admit exact replay, with 15/16 exact MAP recoveries and remaining 92/95; aggregate 2,349/2,352 runes. True control scores −2.67818 to −2.54583. The plants check the proposed sender, not historical use of it; scores are diagnostics, not universal thresholds. The F-hold impossibilities do not depend on language ranking.

[Reproducer](../sims/lp2_cuneiform_decimal_root_feedback_sft.cjs); canonical corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; solved-native source blob `1b064ef6d85819b7d96adaff31a82d1ec551598f`; code commit `29ebc2f4f4981c2ab9f90d21122534c310e7bc3f`. Connected V8 core executed, Node filesystem wrapper not independently executed. Retire this exact receiver under both continuity conventions; no unknown plaintext or key. No additional radix or feedback sweep is justified by the digit-permutation identity.

## Decision

Preserve **17+13+55+1 = 86 = the complete unsolved adjacent-repeat count** as an exact structural lead. It has a plausible human-puzzle character because both sides are directly observable and require only addition/counting.

Current direct consumers fail:

- the 86 selected runes and natural four-group reversals are nonlinguistic;
- the row-sum page pair (30,56) does not transfer the authentic p56 cipher to p30;
- the four literal components do not map cleanly to p50 conventional values;
- the repeated-rune, repeat-position, and repeat-gap sequences do not decrypt the full p0–p55 stream as direct period-86 additive GP29 keys;
- the historical questionnaire's recursive decimal-root cumulative plaintext-prime receiver is impossible with F holds and nonprose without them, including all nine roots and repeated-header resets.

Do not turn the equality into a broad key search. A useful successor needs an independent clue explaining why the doubled-rune events should be segmented, transformed, or used as side information.

Reproduction: **sims/lp2_cuneiform_digits_repeat86_p30_p56_gate_sft.cjs**. Windows Node22 manual SFT passed (run 45768485592).


## Historical raster production-source test (#2994, Agent2, 26 November 2026)

The Commons SVG file history contains one pre-2014 revision (29 March 2010), followed only by two July 2021 edits (compression and restoration). The distinct older source family is Sugarfish's 2003 raster, copied to Commons in 2004, and its 26 October 2008 PNG derivative. Both are public-domain according to the source records. Recovered **both exact files** through a read-only Windows CI job; the local runtime could display but could not retrieve their raw bytes.

| Source | Size | SHA-1 |
|---|---:|---|
| [2003 JPG](https://commons.wikimedia.org/wiki/File:Babylonian_numerals.jpg) | 29,817 | 3aea0ef57bf0e0f3a3a649c4f6029777fefee5be |
| [2008 PNG](https://commons.wikimedia.org/wiki/File:Babylonian_numerals.PNG) | 103,353 | 34b579130dc217751020af35becedb64c35c4f7a |

The independent raster-only [SFT](../sims/lp2_cuneiform_historic_raster_sft.py) uses fixed four numeral windows on the 500×324 sources, correct original page-34 stamp connected components and their exact areas, and quarter-size nearest-neighbor target masks. It searches shared scales 0.5–2.5 in 0.1 increments, rotations -60°…60° in 5° increments, allowing independent best translation of each whole digit (FFT correlation). Source thresholds 96/128/160, target threshold 128. Independent individual digit fits are also logged. This is a coarse, explicit similarity test, not an exhaustive deformation or component-repositioning exclusion. The 2008 PNG is a derivative of the JPG, not independent provenance.

[Successful run 45842586704](https://github.com/FlareZ123/liber-primus/actions/runs/45842586704), commit 44553a3f4705011c7ce2c5a30f47464bab0640be. Both files passed size and SHA-1 checks. Both produced **identical** scores for all three tested thresholds. Shared four-digit mean IoUs were 0.38701549, 0.41371551, 0.41241185 respectively; threshold-128 shared per-digit scores were [0.38692946,0.27461140,0.37037037,0.62295082] at 0° and scale 1.6. Independently optimized threshold-128 digit scores were [0.40502513,0.47699758,0.39020122,0.63559322]. Exact-copy control 4/4 at IoU=1.0, same scale/rotation recovered (20°,1.5) in each raster. The initial run 45842213417 failed its planted control due to floating-point grid accumulation at 1.5; the integer-derived scale grid fixed that issue before the successful run. The masks are source-bounded and no new plaintext was sought by optimizing the geometric parameters.

**Decision:** no evidence that the authentic 2003/2008 chart is a direct shared-similarity source for the stamp. This completes the older raster comparison left unperformed in #2967. No further common-transform or base-60 key sweeps are warranted. A redrawn or independently assembled stamp remains possible. CI fetched exact files from the public originals; raw binary copies were not transferred into this repository (the URLs and checksums in the SFT reproduce acquisition). No new key, decoder or plaintext.
