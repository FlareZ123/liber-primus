# P55 original-body test: p50 5×5 tile minus authenticated 2014 numerical square

**Agent33, 22 November 2026. Bounded original-cipher negative.** All eight frozen source-shaped additive GP29 inverses complete and replay exactly, but none recovers a contiguous coherent unknown p55 sentence or a creator-supplied key. This narrows one *direct* use of a source-selected p50 tile and the previously solved 2014 squares. It does not exclude dynamic schedules, cipher modes, different recipients, or square-based operations with a separate original clue.

## Independent operands and why this experiment is different

The already verified 2013 audio and the clear original p57 PARABLE produce native prime sums **1259, 1031, 1229**, with zero-based prime ordinals **205, 173, 201**. Under the already proposed GP-ordinal-to-p50-cell address rule, these three addresses occupy three corners of a 5×5 tile in the printed 32×8 p50 table: rows21–25 and columns1–5. Its row-major source tokens are:

```text
3m 4E 0s 2S 1v
2B 2k 2t 2O 0e
2a 0J 1L 0c 3C
2Z 2d 1T 2u 1t
1E 3T 18 3E 1G
```

Two original 2014 Cicada 5×5 numerical squares are preserved as separate solved-stage operands in `resources/cicada2014-openpuff-magic-squares.txt`: first square with row sum3301 and third with row sum1033. The latter's center is91 and the selected p50 tile under the conditional drop-f base59 reading sums3210=3301−91; the center3×3 sums1032=φ(1033). These numerical correspondences and the tile geometry are already reported in [the PARABLE three-prime/tile source study](lp2-p55-parable-threeprime-3x25-totient-original-gate.md) and do **not** independently authenticate a cipher key.

A previously untested simple candidate is to subtract the corresponding 2014 square cell from each p50 tile cell, modulo the original29-symbol rune alphabet, to derive a **25-position additive key**. The same original p55 consists of one rune carried from p54 followed by exactly75 intact GP29 runes, or three uninterrupted25-step key cycles. This avoids a fitted offset, word-specific edits, and invented byte/key sources. The earlier direct **Hill5 matrix inverses**, three separate prime clocks, and φ-key consumers are different operations and are not repeated here.

## Frozen original-cipher gate

Flatten each 5×5 matrix in its printed row-major order. For each of two historical p50 digit readings (conventional base60, alternative drop-f base59), and each of the **two genuine 5×5** historical squares (3301 and1033), compute

```text
K[j] = (table_tile[j] - historical_square[j]) mod 29, j=0..24.
P[i] = (C[i] + s*K[i mod 25]) mod 29, i=0..74, s in {-1,+1}.
C[i] = (P[i] - s*K[i mod 25]) mod 29.
```

The cipher target is **exactly** `lp2-corpus.json pages[55].indices.slice(1)`, with 16 source-preserved complete words (word-rune lengths `4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3`). The source-only script checks all25 tokens and source selection, 2014 square row sums, both p50 radix sums3210/3258, exact p55 original transcript, and full75/75 original forward replay. A source-native positive takes the first75 authentic clear p57 runes, encodes them with the actual candidate key, then recovers all75 exactly, in **every one** of the eight cases. A bijective key's own round trip is only an implementation check.

| P50 reading | 2014 square row sum | Inverse sign | Original 75-rune IoC | First source-preserved decoded words |
| --- | ---: | ---: | ---: | --- |
| base59 | 3301 | − | 0.034595 | OWHD AEC AEIA HEAXSGIA |
| base59 | 3301 | + | 0.030270 | ETHEOL CF OJ OEAEIATHIAD |
| base59 | 1033 | − | 0.034595 | SDHNG OEOE NGG MMLBPF |
| base59 | 1033 | + | **0.042523** | GSEOOE HEO WO JCNGFLNG |
| base60 | 3301 | − | 0.037117 | EAOWNG DO OEA GEAEOSCIA |
| base60 | 3301 | + | 0.036757 | OEGPOE WTH GX AAEFTHEAD |
| base60 | 1033 | − | 0.031712 | JMWM LL EO BMEBEOF |
| base60 | 1033 | + | 0.032072 | IMPA IX IG PCDFNGNG |

For comparison: original p55 core IoC **0.038559**, authentic clear p57 first75 IoC **0.059459**, full clear p57 IoC **0.062710**. These are descriptive scale controls; with just75 runes, an IoC alone cannot prove non-English or quantify a discovery-adjusted p-value. The full 16-word outputs printed by the SFT are visibly nonprose, including the best-IoC candidate. No word-boundary search or key tuning was used.

**Exact reproducer:** [`sims/lp2_p50_tile_minus_historical_square_p55_sft.cjs`](../sims/lp2_p50_tile_minus_historical_square_p55_sft.cjs), direct original-source Node22/CommonJS, **Windows GitHub Actions PASS** [44995130421](https://github.com/FlareZ123/liber-primus/actions/runs/44995130421) (including the authentic-F branch test). The test pulls the actual preserved original source bytes, rather than embedding a second hand-transcription.

## Complete authentic plaintext-F transparency gate

The directly repeated key above held its 25-position clock fixed through every ciphertext rune. The solved p56 and two solved LP1 Vigenère passages require a second **authentic-source** behavior: a plaintext F (rune index0) is printed as literal ciphertext F and does not consume a key position. An observed ciphertext F may alternatively be ordinary encryption of a non-F letter, so each such position must be branched. An ordinary non-F ciphertext symbol decoding to F is impossible under this documented rule. The actual original p55 75-rune body has **three ciphertext Fs at body offsets14,24,40**.

We enumerated all such reachable branches for each of the same eight source-frozen direct keys without word or phase tuning. A real p57 first75-rune plant was **encrypted under the complete F-bypass convention**, including its three actual plaintext Fs, and then recovered exactly by the branch solver under **each** key. The printed 16 complete p55 words are preserved for every survivor.

| P50 reading / historical square / sign | Authentic F-bypass full75 paths | First impossible original offset | Surviving F skips / GP29 IoC |
| --- | ---: | ---: | --- |
| 59 / 3301 / − | **1** | none | body24,40; **0.033153** |
| 59 / 3301 / + | 0 | 5 | none |
| 59 / 1033 / − | 0 | 13 | none |
| 59 / 1033 / + | 0 | 11 | none |
| 60 / 3301 / − | 0 | 32 | none |
| 60 / 3301 / + | 0 | 10 | none |
| 60 / 1033 / − | 0 | 13 | none |
| 60 / 1033 / + | 0 | 11 | none |

**Seven of eight** direct historical-square differences are now rejected by an *algebraic impossibility* under the actual F-transparent scheme. Their early failures cannot be rescued by choosing a different later skip mask. The sole complete branch uses base59/square3301/subtraction with two literal F skips, and its 75-rune result begins **OWHD AEC AEIA HEAXSGIA THBTHOEGC** and remains entirely nonprose (IoC0.033153). This is stronger than the simple direct-clock language negative, though it does not exclude unconventional non-F handling or a different key-generation operation. The original does not tell the solver to subtract the squares in the first place.

The [same original-source SFT](../sims/lp2_p50_tile_minus_historical_square_p55_sft.cjs) includes both tests, the exact native plants, every original branch, original forward checks, and the one-survivor assertion. This strengthened test resolves the only historically grounded omitted exception, avoiding an unjustified follow-on F-mask sweep.

## Decision and unresolved dependency

Retire the **direct repeated GP29 difference key** between the PARABLE-selected p50 5×5 table tile and either authentic 2014 5×5 square: the eight ordinary-clock inverses are nonprose; when the historically mandatory transparent-F semantics are added, seven families become algebraically impossible and the sole surviving branch is nonprose. Source constraints select neither cellwise subtraction nor key repetition. This does **not** exclude a differently authored square operation, genuinely external key, or dynamic cipher state. No further arbitrary start, phase, transposition or wordwise rescue is warranted.

No unknown LP2 plaintext, key or full p55 decoder was recovered. Waiting independent original-p55 verifier #41 does not receive a qualifying candidate.
