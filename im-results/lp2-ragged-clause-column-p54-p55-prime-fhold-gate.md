# p54–p55 ragged clause-columns with the p56 prime/F receiver: scoped negative

**Decision.** Retire this exact fixed geometry under the authentic positive p56 prime-minus-one / transparent-F receiver. The fixed transform is reversible and leaves three origins (six hold paths) structurally legal, but none yields plausible plaintext. No source evidence independently selects printed word groups as columns. This is not a rejection of other transpositions, other block boundaries, or other ciphers. No unknown plaintext, key, or destination was recovered.

## Source and frozen geometry

Inputs are the image-corrected transcription (blob `f7b534a33edeb212d427329798438325307463d7`), canonical GP29 corpus (`054f2a0f780b7d46901acbe3d9bf4f0ac1801165`), ink annotations (`0614aca67969a14ae006e0c1ae6aee6dcd8136e6`), and the nine-section solved-GP29 control corpus (`1b064ef6d85819b7d96adaff31a82d1ec551598f`). The original LP2 p54 and p55 images are archive `71.jpg` and `72.jpg` (Git blobs `5658a7f992c06ac7191f275cf32be2ce35b59754` and `ee00cd34013fe3a5c6808650abb6d3206b6f1b13`; SHA-256 `dbc2cfca46a150689e60ea83015dcd54ace81245711fefe114d6076b96412ec4` and `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`).

The p54 ink annotation marks the first **9 runes** as a red heading. Excluding it leaves **223 body runes**; p55 contains **76**, for 299 runes. The p54 body continues into p55 and only closes with the final period on p55: this is one punctuation-delimited clause, not two. At the page seam, p54's final group `ᚷᚩᛏᚦᛉᛖᛠᚱᚷᚣ` and p55's first group `ᛝ` are one carried group `ᚷᚩᛏᚦᛉᛖᛠᚱᚷᚣᛝ`. Line-break slash markers are removed before splitting on hyphens, so line wraps are joined rather than silently treated as word separators. At the page seam, the final p54 group is ten runes and the first p55 fragment is one rune; together they form one eleven-rune carried group. Preserving all such line and page carries yields **64 fixed columns**, heights 8, 3, 6, 2, 5, 3, 2, 3, 5, 7, 3, 4, 10, 8, 3, 5, 8, 4, 3, 4, 5, 4, 3, 5, 1, 3, 5, 5, 3, 4, 2, 6, 5, 3, 8, 5, 4, 8, 2, 3, 4, 6, 6, 3, 2, 10, 2, 11, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3, maximum height 13, sum 299. No column permutation, width search, dropped fragment, or fitted boundary is used.

For this hypothesis, each printed hyphen-delimited group is a column in printed order. The inverse reads rows left-to-right and skips absent cells. The forward reconstruction exactly reproduces all 64 original groups and 299 runes.

## Receiver and exact search

The known p56 plaintext independently replays its 85 ciphertext runes exactly (84 consuming prime steps; plaintext F is transparent and does not consume). The receiver is therefore fixed to

`C = (P + (prime[j]-1)) mod 29` for `P != F`; `P=F` emits F without advancing.

Every origin **0 through 3301 inclusive** was tested. At ciphertext F, both legal explanations were retained: transparent plaintext F, or a consuming non-F plaintext when the current prime shift is nonzero. At non-F ciphertext, the only legal inverse is the consuming non-F plaintext. No reset is inserted at the p54/p55 seam.

The reconstructed tape contains six ciphertext F symbols at positions 8, 52, 163, 171, 249, 262. A 223-symbol *length-matched prefix* leaves 13 origins and 21 legal paths; the full 299-symbol tape leaves exactly **3 origins and 6 paths**:

| Origin | Legal transparent-F positions |
|---:|---|
| 1022 | 8, 52, 163 |
| 1021 | 52, 163 |
| 1022 | 8, 52, 171 |
| 1021 | 52, 171 |
| 1065 | 8, 163, 249, 262 |
| 1065 | 8, 171, 249, 262 |

Each origin has two paths. The six complete candidates are preserved in the JSON output. The best 223-symbol prefix trigram score is **-3.885191 nats/rune** (origin 1022); the best prefix bigram score is **-4.213246**. Best full-stream trigram score is **-3.883516**.

## Native controls and language check

The p56 cipher and ragged transform were planted in three 299-rune windows from solved GP29 sections, at hidden origins 1021, 1022, and 1065. All three true plaintexts and their exact hold paths survived the same exhaustive all-origin inverse. Their true paths ranked 3rd, 37th, and 2nd by the 223-symbol prefix trigram model; this shows that the small model is not a reliable unique key/hold selector on its own.

As a separate reference, 12 native 299-rune windows were scored with leave-one-section-out models. Target candidates were scored using all nine sections, a more favorable training set. The native-control ranges versus the best target candidate are:

| Metric (mean log probability, nats/rune) | Native LOO range | Best target |
|---|---:|---:|
| 223-symbol prefix bigram | -2.839210 to -2.469296 | -4.213246 |
| 223-symbol prefix trigram | -2.907368 to -2.463027 | -3.885191 |
| 76-symbol suffix trigram | -3.078367 to -2.474105 | -3.770560 |
| Full 299-symbol trigram | -2.916908 to -2.461740 | -3.883516 |

The target remains substantially below even the weakest native control. Candidate strings are not coherent prose. This is a calibrated negative, not a formal impossibility proof or a claim that a small GP29 n-gram model recognizes every valid register.

## Page-holdout limitation and Director fork

Because the complete clause crosses the page seam, the clause-wide transpose interleaves p54- and p55-origin symbols. Its first 223 decoded symbols are **not** the physical p54 body, and its final 76 are **not** physical p55. The 223/76 split above is only a fixed length-matched diagnostic; it cannot honestly be described as selecting on physical p54 and freezing a physical p55 continuation. A page-local transpose would be a different model and would break the observed carried group.

The family-level fact that columnar transposition appeared in historical Cicada stages does not independently select this 64-word ragged geometry. The original pages show ordinary printed word groups, not a marked column grid or a source-selected row-reading direction. Retire this one clause-wide ragged-column / p56-prime-F combination. Do not expand into arbitrary widths, column permutations, resets, or language-score tuning. A successor needs independent first-party evidence selecting the group-as-column representation or a different source-defined receiver.

## Reproduction

Run from the repository root:

`node sims/lp2_ragged_clause_column_prime_fhold_sft.cjs`

The script checks the p56 calibration, exact 64-column forward replay, all 3,302 origins, all legal F histories, three hidden-origin native plants, and the leave-one-section-out score reference. It writes the complete raw result to `im-results/lp2-ragged-clause-column-p54-p55-output.json`. The research core was executed in connected V8 against the current repository inputs; the standalone Node wrapper has not been separately executed.
