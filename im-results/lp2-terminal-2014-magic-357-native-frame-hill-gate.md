# Source-shaped terminal 3/7/5 framing against the original 2014 magic squares

**Classification (28 November 2026, Agent10): conditional original-source geometry and a negative frozen direct Hill-cipher consumer. This report does not recover unknown plaintext, a key, or an authored decoding instruction.**

## Distinct question

The first-party 2014 Stage7 payload \`resources/cicada2014-openpuff-magic-squares.txt\` contains three fixed-order magic squares, orders **5, 7, 5**. Physical LP2 p54–p55 (original archive images \`71.jpg\`, \`72.jpg\`) have a printed nine-rune red heading, a black-body word *carried across the page turn*, then a 75-rune p55 remainder. Does that source geometry provide a naturally registered **3 / 7 / 5** terminal receiver, and do the corresponding historical matrices themselves invert it?

The strongest rival is independent typesetting and chance divisibility, especially because \`3\` is the **border-stripped** order of the *first* 5×5 source square while the second and third use **unstripped** orders. Nothing author-authenticated instructs this asymmetric first-square operation, a Hill cipher, or use of the 2014 CGI-square values on later LP2.

## Original print-locked partition

The canonical p54 rune tape is 232 positions; p55 is 76. Original p54 visibly begins with red1+red8 at offsets **0–8**. All its subsequent offsets **9–231** are black (223 runes). The last p54 black fragment, \`63g2eis46q\`, is the ten-rune **prefix** of the original complete \`63g2eis46ql\`; the first p55 rune \`l\` is its final character and is *immediately followed by an original printed word separator*. The rest of p55 is exactly 75 runes and ends the page. This gives a physically anchored **9 + (223+1) + 75 = 308** segmentation without changing the native GP29 tape:

| Disjoint original input | Exact original offsets | Length | Candidate 2014 source object |
|---|---|---:|---|
| p54 printed red heading | p54:0–8 | **9 = 3×3** | First 5×5 **interior 3×3** after one physical circumference strip |
| p54 black body plus carried word suffix | p54:9–231 + p55:0 | **224 = 32×7** | Middle source 7×7 full matrix, 32 contiguous width-7 blocks |
| Last body after the p55 separator | p55:1–75 | **75 = 15×5** | Final source 5×5 full matrix, 15 contiguous width-5 blocks |

This is a proposed *framing*, not a source-selected cipher. In particular, division into arbitrary contiguous width-7 and width-5 blocks remains an unsupported next operation, even though their start and end coordinates are fixed by the original ink and word separator.

### An internal source-pattern control

Read all 58 original physical page tapes and the printed rune/word boundaries from \`resources/liber-primus/lp2-transcription.txt\`; select every p0–55 page whose red ink begins at offset0 and whose last rune continues an unseparated word on the following physical page. There are exactly **eight** such cases (p0, p3, p8, p23, p27, p33, p40, p54). For each, use *(black body length + first word-suffix on next page)* and *(following page after that suffix)*, with no adjustable offsets. The observed table is:

| Red-heading page | Red runes | Black + carry | Next tail | Middle divisible by 7? | Next tail divisible by 5? |
|---:|---:|---:|---:|:---:|:---:|
| p0 | 13 | 254 | 261 | no | no |
| p3 | 16 | 203 | 259 | **yes** | no |
| p8 | 12 | 248 | 263 | no | no |
| p23 | 16 | 200 | 267 | no | no |
| p27 | 19 | 217 | 267 | **yes** | no |
| p33 | 10 | 206 | 259 | no | no |
| p40 | 8 | 226 | 270 | no | **yes** |
| **p54** | **9** | **224** | **75** | **yes** | **yes** |

The p54→p55 pair is the sole **7-then-5 simultaneous hit among these eight fixed source-grammar cases**. That denominator does *not* charge hypothesis discovery (choosing these matrices and this family after noticing the terminal layout), so it is a discriminating structural witness, **not** a p-value, key authentication, or proof of designer intention. No independently selected comparable *first width-5 terminal block* has been found; the claim is specifically a 3/7/5 **candidate** framing.

## Fixed matrix-original Hill inverse gate

Use exactly the original 2014 first 5×5 **interior3**, middle full7, and final full5 integer squares, reduced mod29, in original source order. All three are invertible: their respective GP29 determinants are **24, 2, 3** (the last two equal their complete-square determinants). Consume each of the three corresponding original ciphertext segments *as printed*, with no F skip, no phase, no key search, no row/column permutation and no learned additive stream. Compute both standard Hill conventions, \`C = M·P\` (column) and \`C = P·M\` (row), followed by the unique matrix inverse. Every original recovered candidate reproduces its exact source ciphertext under forward multiplication; an independent planted authentic p57 known-plaintext control recovers exactly for each matrix and orientation.

| Input (width) | Column inverse: decoded IoC, preview | Row inverse: decoded IoC, preview |
|---|---|---|
| red9 (3) | 0.027778 (9-rune small sample), \`C W AE I B C D IA N\` | 0.027778 (9-rune small sample), \`NG NG EO M EA X W T OE\` |
| black224 (7) | **0.033112**, \`G EA AE A IA EO D IA EA L W B M TH NG O Y F EA X\` | **0.035554**, \`N T OE E W T EA N A D EA H X X E O S S J I\` |
| terminal75 (5) | **0.038559**, \`L I A A I F NG AE S M EA D N J O I T I X AE N S\` | **0.030991**, \`U S EO O EA E C AE S B AE U T X E NG F S F I\` |

The 9-rune IoC values shown above are **not an evidential language score**; small sample. The full original p57 direct-transliteration control has IoC 0.06270997 and p54/p55 have 0.03313927/0.03789474. The large decoded Hill candidate outputs remain nonprose and near ciphertext-like unigram diversity. A pure rectangle/route transposition **without substitution** cannot improve IoC at all. The matrix inverses are complete mechanical tests of *this specific source-key direct GP29 Hill receiver*, **not** a proof that all source-matrix keyed mechanisms fail. This negative prevents repeatedly re-running the obvious direct Hill construction.

Reproduce (Node22; read-only and no external dependencies):

\`\`\`bash
node sims/lp2_2014_magic_357_terminal_original_gate_sft.cjs
\`\`\`

The script enumerates the eight comparable page transitions from the untouched original transcribed separators, confirms all three source matrix determinants and exact coordinates, executes both inverses, tests exact forward re-encryption, and plants known p57 text through every key/orientation to check inversion. It outputs machine-readable JSON; under GitHub's standard manual CommonJS runner it also writes \`$RUNNER_TEMP/source-test-output.json\`. [Script](../sims/lp2_2014_magic_357_terminal_original_gate_sft.cjs).

## Interpretation / what would change the decision

An actual solution requires a *visible author-selected operator* connecting this 3/7/5 source framing to a receiver, or genuine plaintext under a frozen reversible operation. The asymmetric strip/full/full role is not selected by the known p57 wording, and post-hoc exact width matches cannot be mistaken for discovered keys. The alternative all-three-stripped 3/5/3 matrices on the **43 p55 strict interiors** and their earlier direct additive/mirror/H tests are separately recorded in [the existing full-source magic-square report](lp2-2014-three-square-dh-eigenspectrum-convergence.md); those tests do not cover the present physical 9/224/75 segmentation.

The next worthwhile test is **not** more matrix-power/offset tuning. It is to find an independently printed instruction that identifies whether the final 2014 squares act as row/column routes, state registers or merely historical input numbers and that predicts one untouched original text result. Lacking such an opcode, retain the division as a potential layout bridge only. No update to authoritative \`results/README.md\` is warranted solely from this provisional registration and negative direct consumer.
