# LP1-to-LP2 original illustration reuse: p5 moth and p14 reclining figure

## Strongest source result and its decision

**A previously unindexed original-image match locates the LP2 p55 moth in solved LP1 page 5** (archive JPEG `05.jpg`, titled SOME WISDOM). Original LP2 p55 `72.jpg` reproduces the same detailed moth drawing at **2.33091×** the earlier scale without mirroring or appreciable rotation. SIFT original-pixel feature matching yields **313 RANSAC inliers among 316 accepted descriptor pairs**, registered grayscale correlation **0.973947**, and black-ink IoU **0.851713**. This source connection ties the last unsolved LP2 page to LP1's explicit statement that **primes and the totient function are sacred**. The source selects mathematical *topics*, not yet an original p55 inverse, source-origin key, or counter schedule.

**Critical independent original-image control: LP2 p53 carries the same moth.** Original archive JPEG `70.jpg` / physical **LP2 p53** contains an equally enlarged copy of this LP1 p5 insect, with **343 RANSAC inliers / 350 feature pairs**, scale **2.330624×**, registered grayscale correlation **0.974117** and ink IoU **0.852903**. The p53 insect at source crop `[2663:3213,564:1834]` and p55 insect `72.jpg[2730:3280,630:1900]` are almost **pixel-identical**, with **1715/1715 SIFT matches**, scale **0.9999998×**, registered grayscale correlation **0.999903** and black-ink IoU **0.994293** after the 66px horizontal/67px vertical translation. The artwork therefore selects **at least two LP2 pages** (p53 within the preceding chapter, and p55). The two visually cloned pages contain **179 vs 76 page-local GP29 rune segments** and share at most **three contiguous identical runes** (p53 offset15/p55 offset11); the text was not simply duplicated along with the illustration. This exact original-input check is now in the same image SFT. The source-boundary audit further establishes that p55's first page-local rune is an inherited `NG` completing p54's final word, leaving **75 actual p55 body runes in 16 complete words**. Thus the former F25/3×25 tests do not supply a separate p55-local selector: they retained the carry and omitted the actual p55 body `F` at body index24. The moth alone still does not uniquely appoint p55 as a prime/totient cipher target.

Independently, LP2 p22 (archive `39.jpg`) contains the **horizontal mirror of the complete reclining figure** decorating solved LP1 pp14–16 (archive `14.jpg`, `15.jpg`, `16.jpg`). This relationship was previously noticed in [`results/README.md`](../results/README.md) and the [p22 stave gate](../im-results/lp2-opening-stave-second-marker-gate.md); this test adds a reproducible original-pixel certificate: mirrored comparison has **443 inliers among 453 SIFT descriptor matches**, scale **1.005577×**, registered grayscale correlation **0.992524**, and black-ink IoU **0.906207**. In the wrong, nonmirrored orientation, just **4 of 24** accepted feature matches survive the affine RANSAC. LP1 pp14–16 share exactly the same bottom 400 source raster rows, a pixel-identical positive control.

Together with the [already-established LP2 p2 ↔ LP1 p9 mirrored insect](../im-results/lp2-p2-literal-rune-reflection-gate.md), this makes **three artwork families** reused across releases. **The insect appears on LP1 pp9, 13 and 16**, which prevents unique attribution of LP2 p2 to the first-koan inverse:

| Original solved LP1 source | LP2 unknown page | Transformation | Source-derived cipher candidate |
| --- | --- | --- | --- |
| LP1 p9 **and p13/p16**, the identical insect across three different solved-page contexts (first koan, instructions, magic-square material) | LP2 p2, 201 runes (`19.jpg`) | Horizontally mirrored relative to p9 and p16; identical handedness to p13 | **First-koan reflection** is one tested literal rule; the art does not uniquely select it |
| LP1 pp14–16, second koan: “THE I IS THE VOICE OF THE CIRCUMFERENCE” (LP1 pp14–15 solved with `FIRFUMFERENFE`) | LP2 p22, 131 runes (`39.jpg`) | **Horizontal mirror, ~1.0056×** | **Exact 13-rune Vigenère key** tested below; no plaintext |
| LP1 p5, SOME WISDOM: prime numbers and Euler's totient are sacred, with accompanying moth | **LP2 p53 (`70.jpg`) and p55 (`72.jpg`)**; p55 has 75 body runes plus one incoming p54 `NG` carry | **Two almost identical same-handed enlarged copies, ~2.3309×** | The moth nominates both pages; corrected p55-body φ(cell), Hill, and conditional p56 φ(prime) tests are nonlinguistic. No source fixes a p55 key or clock |

## Source-attribution disambiguation: repeated LP1 insect before LP2

Original-JPEG registration of the LP1 p9 690×185 insect crop gives an **exact black-pixel match (IoU 1.000000)** at **LP1 p13 archive13.jpg (x851,y1079), reflected** and at **LP1 p16 archive16.jpg (x859,y1455), unreflected**. The p16 grayscale crop is byte-identical to p9 after translation; p13 has gray mean-absolute error 0.03086. LP2 p2 archive19.jpg (x876,y2642) is another reflected copy (ink IoU 0.999972391). All four original JPEGs are SHA-256 pinned in [the exact multisource insect test](../sims/lp1_lp2_illustration_raster_reuse_sft.py), with full original-image evidence in [the consolidated art census](lp1-lp2-crossrelease-artwork-raster-copies.md).

This is a material limitation on the first line of the table: **LP2 p2 has at least three separately positioned solved-LP1 appearances of the same insect**, and none selects p9's first-koan cipher over p13's instructions or p16's square. Therefore direct P=2−C remains a historical operation worth one source-literal check, but its *selection* is not unique and neither a positive nor negative would establish what the maker intended without more evidence.

## Duplicated moth as a two-time-pad clue: finite original-cipher decision

The p53/p55 moth images are essentially the **same original raster** after a (+66,+67) translation. A distinct causal cryptanalytic hypothesis is that the maker reset an otherwise unknown, **identical GP29 additive key** when reusing the illustration. Under that exact key-reuse mechanism, ciphertext differences eliminate the secret without recovering it: `(C53_i − C55_i) mod29 = (P53_i − P55_i) mod29`. The difference of two ordinary native-GP English rune streams is generally biased rather than 29-way uniform. Unlike a guessed key, this provides an observable necessary plaintext condition on untouched original ciphertext. However, source artwork **does not itself prescribe key reuse or an alignment**, and only the two most literal independent page starts were tested below.

Freeze the canonical GP29 alphabet and 75-rune comparison length (the full p55 body). Compare p53 page-local indices 0–74 against (A) p55 page-local 0–74, or (B) p55 physical body 1–75, omitting the source-proven incoming p54 `NG`. Do not fit a shift, omit a different red heading, align matching text phrases, or change one pad's start after looking at the score. A 3,287-rune GP29 English control is reconstructed from solved LP1 editor-normalized plaintext via a fixed, source-independent longest-token alphabet rule (source-native misspellings and editorial omissions preserved as far as representable). Its unigram frequencies with a declared half-count prior define the 29-symbol distribution of independent English-rune differences. The test statistic is the full 75-position log-likelihood ratio `Σ ln[29 × Pr(P−Q mod29)]` against a uniform difference stream. There are **50,000** xorshift32-seeded simulated pairs of independent 75-rune slices from the same solved control and **50,000** uniform difference controls. A separate known-native pair encrypted under a single synthetic 75-rune additive pad exactly preserves its original difference score.

| Frozen original alignment | Difference log-likelihood ratio | Lower-tail rank among native-English pairs | Rank among independent uniform controls |
| --- | ---: | ---: | ---: |
| Original p53[0:75] − p55[0:75] | **−3.85288467** | **61/50,000 = 0.00122** | **8,159/50,000 = 0.16318** |
| Original p53[0:75] − p55 physical body[1:76] | **−1.25591690** | **2,533/50,000 = 0.05066** | **32,196/50,000 = 0.64392** |

A weaker **label-invariant** condition for any reusable *position-wise bijection* (as opposed to an additive pad) is that aligned ciphertext runes agree exactly whenever the corresponding plaintext runes agree. The two source-frozen original alignments have just **1/75** and **5/75** equal-symbol positions. For independent uniform 29-symbol text the expected coincidence count is 75/29 = 2.59; the one-sided probability of at least five is approximately 0.117, which provides **no significant positive key-reuse signal**. The count of five is also unsurprising for two English-rune streams. A general shared permutation is therefore **not excluded**, and equality counts reveal no plaintext or inverse.

The native-GP control mean is **+2.05293**, while the independent-uniform control mean is **−1.95064**. The observed original differences resemble *independent uniform ciphertext* much more than independently written GP29 English **under these fixed alignments**, particularly with literal page-local 0/0 starts. No common additive keystream or plaintext is recovered. The second body's approximately fifth-percentile native rank is merely a weak negative diagnostic in a small comparison, not a proof against English or against secret reuse with page-dependent phase, nonlinear state, different alphabet or an externally selected start. Do not optimize those unsourced free parameters to rescue reuse. [Self-contained original-input SFT](../sims/lp2_p53_p55_moth_reused_pad_sft.cjs).

## Test of two literal operation-transfer candidates

The known LP1 first-koan original inverse is `P = (2 − C) mod 29`, *different from* the generic GP29 Atbash `P=28−C` already tested on p2. On the complete 201 original LP2 p2 rune indices, it leaves unigram index of coincidence **0.03562189** (exactly unchanged, as a bijection must), and the first 85 transliterated output letters are

`NEOUDSXMJHDXEOOIAXOEDXPAEMHJAMREEADPOANGIANGDUFDCOEBXAELEUIOTHOENGPHRIIAHXLRNEONGTHSLHNGFIAJTPMEAAEXSHFWOEYC`.

There is no coherent native-GP plaintext; the result is exactly the expected behavior of arbitrary monoalphabetic substitution on the high-entropy original.

The known second-koan inverse is `P = C − repeating FIRFUMFERENFE` with the 13 GP29 indices `[0,10,4,0,1,19,0,18,4,18,9,0,18]`. On original p22, continuous page-initial subtraction without guessed skip positions has IoC **0.03487962**, against raw **0.03581914**. With the deliberately less favorable blanket “every ciphertext F is unencrypted” interpretation, IoC is **0.03429243**. Both full-position outputs are nonlinguistic. For scale, genuinely solved original p57 has IoC **0.06270997**. The LP1 p14–15 special two F skip positions are known from its own source and do *not* specify skip positions on LP2 p22, so this audit does not fit any.

**A distinct frozen one-F exception suggested by the original p22 length also fails.** The copied LP1 pp14–16 artwork makes the exact 13-rune koan key the source candidate, while physical LP2 p22 has **131 runes = 10×13+1**. Its *first* ciphertext F is at local rune **index 13**, immediately after one complete 13-step pass; treating precisely that F as one literal, non-consuming exception yields ten full key cycles. Under the already known koan subtraction sign the whole-page IoC is **0.03358779**, below the unmodified page **0.03581914**; the complete transliteration remains nonlinguistic. A native p57 GP plant with the F at index13 re-enciphers and deciphers exactly, as does the 131-rune original result. This excludes that precise 13-step/F exception, and prevents a misleading inference from the exact 131=10×13+1 count. [Standalone source-fixed gate](../sims/lp2_p22_koan13_first_f_sft.cjs). It supplies no reason to choose one of the other five source F positions or fit a reset by plaintext score.

These two tests reject the *literal original solved-section cipher transfer selected solely by artwork identity*. They do not exclude a different source-defined stateful inverse or a later external dependency.

## Corrected p55 body and fixed source-transfer tests

The canonical p55 page-local sequence contains **76 rune segments**, but `p55[0]` is `NG` (GP29 index **21**), the final rune of a word begun on p54. The actual p55 body is therefore `p55[1:]`: **75 runes in 16 complete words**, with lengths `[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. Its body `F` positions are `[14,24,40]` (zero-based). This is the original-image boundary established in the [p32/p54/p55 audit](../im-results/lp2-original-page-boundary-audit-p32-p54-p55.md) and independently asserted by the [correct 75-body Hill test](../im-results/p55-wisdom-5x5-original-75-gate.md).

### LP1 p5 Wisdom-square φ(cell) additive inverse on the correct 75-body input

The LP1 p5 5×5 square, read row-major from 272, supplies the fixed key `φ(cell) mod29`:

`[12,15,10,14,5,4,24,19,12,6,25,23,14,23,25,6,12,19,24,4,5,14,10,15,12]`.

Apply `P_i=(C_i-key[i mod25]) mod29` to all **75 actual p55 body runes**, with no F skip. The exact forward encoder and a 75-symbol solved-native plant both round-trip. The output is:

`PRFOEIPMFOGIFBTHRNGEOIAIYTHMWPBTHANTFNPTHHGDNGNRBDCEBUWREOIADEAAEUPJBEOMEOMHHJORWSMMGTWOIA`.

Its decoded GP29 IoC is **0.03423423** (raw body **0.03855856**). The Gibran-trained GP29 trigram score is **−6.02356095**, against raw **−6.17872422** and 151 solved-native 75-symbol windows with minimum **−3.81150721**. The wrong 3301 square gives **−6.51068478**. This source-derived 25-period candidate is a reproducible negative, not plaintext.

### LP1 p5 5×5 Hill inverse on the correct 75-body input

The same correct body was tested as 15 blocks of five under the original LP1 p5 5×5 matrix over GF(29). The matrix is invertible (determinant **3 mod29**); exact forward reconstruction and a solved-native positive plant pass, but the decoded output is nonlinguistic, with Gibran GP29 trigram score **−5.773447** versus the same native minimum **−3.811507**. See the complete [correct 75-rune Hill gate](../im-results/p55-wisdom-5x5-original-75-gate.md) and [reproducer](../sims/p55_wisdom5_hill75_sft.cjs).

### Full-page and body frequency-preserving invariant

The physical p55 page-local sequence has **76** rune segments (including the inherited p54 `NG`); the actual p55 body has **75**. Their GP29 IoCs are **0.03789474** and **0.03855856**, respectively. A fixed bijective monoalphabetic substitution preserves the symbol histogram; a pure transposition preserves it as well; their composition therefore preserves IoC on either fixed input.

| Input scope | Native stride-23 windows | Minimum IoC | Median IoC | Maximum IoC | At/below p55 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 76 page-local runes | 151 | **0.04631579** | 0.06035088 | 0.08526316 | **0** |
| 75 actual body runes | 151 | **0.04612613** | 0.06090090 | 0.08540541 | **0** |

| Input scope | All overlapping windows | Minimum IoC | 1st percentile | 5th percentile | Median IoC | At/below p55 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 76 page-local runes | 3,461 | **0.04561404** | 0.04771930 | 0.05228070 | 0.06070175 | **0** |
| 75 actual body runes | 3,462 | **0.04540541** | 0.04756757 | 0.05189189 | 0.06054054 | **0** |

Thus neither a fixed monoalphabetic substitution nor a pure transposition of the complete 76-glyph page or 75-rune body can yield ordinary GP29 English consistent with the native LP1 controls. This also excludes any composition of those two operations, including a whole-body 5×5 rank-order/route permutation. It does **not** exclude polyalphabetic, homophonic, position/context-dependent or non-bijective substitutions, mixed transforms, subset transposition, or deliberately non-English plaintext.

The counts are reproduced by [the corrected 75-body transfer SFT](../sims/p55_corrected_75body_transfer_sft.cjs).

### Conditional solved-p56 φ(prime) transfer on the correct body

The solved p56 control authenticates `P_i=C_i−φ(p_j) mod29`, consuming consecutive primes from 2 while one special literal `F` at p56 index56 is unchanged. That exact 85-rune p56 control reconstructs the known text. A single-F transfer hypothesis on p55 must now start at the actual body: skip only body index **24** (page-local25), while processing the other body `F` runes at 14 and 40 normally. This consumes **74** prime values; no phase or other skip is fitted. The p55 forward reconstruction and a planted 75-rune positive control pass. The complete output is:

`ABGUCCIAUOEPCTLEOEORASYEOEPOEIAFCYRJPBIAWFMTIEOINGTHPTHAETMDNGEATIXFWFLJAOEOAEILEHBOEDYAEJYWFS`.

Its Gibran GP29 trigram score is **−6.55536380**, below the same native minimum **−3.81150721**. This is a conditional cross-page transfer, not a source-selected p55 mechanism; it produces no plaintext.

### Superseded historical 76-symbol/F25 experiments

The earlier `lp2_p55_wisdom_moth_square_sft.cjs`, `lp2_p55_p56_totient_25_seam_sft.cjs`, and `lp1_wisdom5_hill_p55_sft.cjs` treated all 76 page-local segments as p55 body, retained the incoming p54 `NG`, and removed the actual p55 body `F` at index24 (page-local25). Their outputs are reproducible for that **misaligned synthetic sequence only**; they are not valid p55-body negative results. The earlier 3×25/F25 interpretation is withdrawn. The old Hill report is marked superseded; the correct 75-body Hill result is linked above. The former φ(cell) output on the misaligned sequence remains reproducible with the retained historical [script](../sims/lp2_p55_wisdom_moth_square_sft.cjs), which is explicitly marked as a misaligned-input test. Reproduce the corrected φ(cell) and p56-transfer tests with [`p55_corrected_75body_transfer_sft.cjs`](../sims/p55_corrected_75body_transfer_sft.cjs).

## P22 cross-round book-code/coordinate transfer decision (Director #496)

**Source comparison:** The original LP2 p22 scan `39.jpg` contains 131 runes, a separate three-crossbar illustration beneath the runic lines, and the footer that is horizontally mirrored from all three original LP1 source scans `14.jpg`–`16.jpg`. The three source pages are a solved second koan, the explicit instruction `KWESTION ALL THINGS / DISCOVER TRUTH INSIDE YOURSELF / FOLLOW YOUR TRUTH / IMPOSE NOTHING ON OTHERS`, and a `KNOW THIS` 5×5 integer square. The full editor-normalized text and the 25 printed integers are preserved at [LP1 plaintext reference](../resources/liber-primus/lp1-plaintext-reference.txt); the image overlap and 131-rune count are established above. The identical footer across three different source-page texts does not select one particular sentence, plaintext span, numerical origin, or page within the three-page group.

**Historical-operator check:** The independently reconstructed 2012 book-code tasks identify specific external works and supply line/character addresses. The 2014 fifth-onion `Gödel, Escher, Bach` step likewise identifies its external reference by Gödel/Escher/Bach clues and supplies **chapter title : dialogue exchange : word : letter** coordinates. The subsequent Stage10 archived static response returns LP1 pp14–16, but no recorded Stage10/Stage11 instruction transfers that earlier GEB coordinate syntax to LP2 p22 or redefines its chapter/line/exchange origins. See the [source-cited original player solve-path matrix](../workplace/historical-player-solvepath-operator-contract.md) and [Stage10 image handoff](../im-results/2014-stage10-three-images-lp1-source-handoff.md). The LP1 koan's direct speech does not supply an identified GEB chapter title or any source-fixed list of 131 coordinates. Its 5×5 square supplies 25 numbers, with no original rule explaining how to address all 131 target runes or preserve the page's word separators.

**Decisive missing link:** Recognition of a reused source illustration plausibly brings a player back to pp14–16, but does not fix book/edition, page or chapter origin, line/word/letter addressing, coordinate extraction, glyph direction, or a reversible 131-position consumer. The original p22 page supplies no explicit numerical coordinate list or equivalent plaintext instruction. Importing GEB's dialogue-exchange grammar unchanged is undefined for these three LP1 pages; inventing offsets, a square traversal, a cyclic key, or selective source phrases would select parameters *after* examining ciphertext. Thus no unique, source-defined complete p22 book-code inverse is available, and there is no basis for a held-out plaintext test. This is a **bounded no-selector** result for the specific LP1 pp14–16→p22 coordinate hypothesis, not a claim that the p22 artwork or any future source-selected operation is meaningless. Existing direct second-koan Vigenère tests remain the only frozen transfer tested here; they are not repeated.

## Historical #508 p56 φ(prime) transfer result (superseded input)

The former #508 experiment used all 76 p55 page-local segments, retaining the incoming p54 `NG`, and skipped only page-local `F25`. The boundary audit shows that this sequence is not the physical p55 body: it includes the prior page's final rune and omits p55 body index24. Its former output was:

`LDSRYOUAEYTJEAEOEHGIAOENOETTNTMFUAFNNODUIANXRGGSAEJNGDEOBJNAXGHIAYDXCOETEADFGXGPHBTDWLEADN`.

The old p56 positive control remains valid, but its p55 negative does not apply to the actual page body. The corrected 75-body single-F transfer is reported above and remains nonlinguistic. Retain the old script only to reproduce the historical misaligned sequence; do not count it as a p55-body exclusion.

## Reproducer and scope

Run `python sims/lp1_lp2_illustration_source_transfer_sft.py` with OpenCV/SIFT, NumPy and Pillow for the original-pixel art census, and `node sims/p55_corrected_75body_transfer_sft.cjs` for the corrected 75-body φ(cell) and p56 φ(prime) gates. The correct 75-body Hill test is `node sims/p55_wisdom5_hill75_sft.cjs`. The old `lp2_p55_wisdom_moth_square_sft.cjs`, `lp2_p55_p56_totient_25_seam_sft.cjs`, and `lp1_wisdom5_hill_p55_sft.cjs` remain only as historical reproductions of the misaligned 76-symbol sequence. The image SFT consumes `resources/liber-primus/{05,14,15,39,70,72}.jpg`, the canonical `lp2-corpus.json`, and the two externally established solved LP1 decipherment equations. An optional `--archive /path/to/liber-primus-jpegs.zip` supplies the same original JPEGs. Both good and wrong orientation, source image crop extents, 0.72 feature ratio threshold, RANSAC reprojection threshold 5, and direct-key clocks are frozen in code.

**Decision:** retain the LP1 p5 moth ↔ LP2 p53/p55 source link as a concrete cross-release illustration reuse, not a unique p55 selector. The correct p55 body is 75 runes after removing the inherited p54 `NG`; the old F25/3×25 sequence is misaligned. The source-fixed φ(cell) additive, 5×5 Hill, and conditional p56 φ(prime) inverses on the correct body all fail their native-language tests. Do not resume p55 key/clock sweeps without an independent source that selects the operation and input alignment. The p22 original-pixel certificate and its separate no-selector result remain unchanged. No unknown LP2 plaintext or genuine key has been recovered.
