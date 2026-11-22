# Word-boundary structure of the LP2 adjacent-rune doublets

**Classification: new structural constraint, not plaintext recovery.** This independently reproduces the 86 adjacent-equal rune sites in LP2 pages 0–54 and separates true within-word adjacency from pairs that become adjacent only after stripping visible word separators.

## Data and segmentation

Inputs are the repository's `resources/liber-primus/lp2-transcription.txt` and `lp2-corpus.json`. The first 55 page blocks (LP2 pp0–54) contain **12,956 runes**. In the transcription, `-` and sentence/punctuation markers delimit words; `/` marks a line ending and `%` a page ending. A line wrap alone does not split a word. Adjacent pairs crossing a page boundary are excluded.

The 86 doublet positions and 1,000-rune block counts reproduce the independent [Dukotah Round44 T7 report](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md): **[8, 3, 7, 2, 6, 9, 10, 8, 11, 2, 9, 6, 5]**. The full 86-site gap AC1 is **+0.3795**; a 10,000-draw position-conditioned null gives **p=0.0006**, consistent with the external p≈0.001.

| Pair class | Sites | Available adjacent pairs | Rate |
|---|---:|---:|---:|
| Within a word | 63 | 10,028 | 0.628% |
| Across a word boundary | 23 | 2,873 | 0.800% |
| Across a line boundary | 4 (3 within-word, 1 cross-word) | 539 | 0.742% |
| Across a page boundary | 0 | 54 | 0% |

The 23 cross-word pairs are real transcription adjacencies only after spaces are stripped; they are not within-word doubles. Word-aware stratification changes the interpretation of T7: the 63 within-word sites have gap lag-1 autocorrelation **+0.1786**, but a 10,000-draw position-conditioned null gives **p=0.061**; the 23 cross-word sites have AC1 **−0.0857** and **p=0.558**. The full 86-site signal is significant, but neither stratum is independently significant at 0.05. Thus the T7 result is sensitive to mixing adjacency classes and is not, by itself, evidence of a within-word stateful filter.

## Cross-release control: initial LP1 transcription blocks

The first three blocks of `resources/transcriptions/lp1_wulfic_canonical.txt` provide a useful same-alphabet / same-separator control: **699 runes**, **16/530 within-word** doubles (**3.02%**) and **5/166 cross-word** doubles (**3.01%**). By comparison, LP2 pp0–54 has **63/10,028 (0.628%)** within-word and **23/2,873 (0.800%)** cross-word doubles—about **4.8×** and **3.8×** lower, respectively.

The later LP1 blocks include solved plaintext and are not pooled into this initial-block control. This comparison shows that the LP2 repeat deficit is not an inevitable property of the rune alphabet or the transcription's word-separator convention. It supports an LP2-specific output/cipher difference, but does not by itself prove a rejection filter: LP1 and LP2 may use different mechanisms and plaintext.

## A source-visible span with no cross-word doubles

There is a longer, more specific boundary anomaly:

- LP2 pp15–22, the visual chapter containing the Fibonacci/prime grid and infinity mark, has **0 cross-word doublets in 433 word boundaries** across 1,903 runes.
- The longest contiguous zero-cross-word-doublet run in the 55-page stream is **pp11–23**: 13 pages, 3,059 runes and **0 in 686 word boundaries**. Outside that span there are 23 in 2,187 boundaries (1.05%).
- A 100,000-draw max-run null assigns the 23 observed cross-word sites uniformly among all 2,873 boundary opportunities, preserving each page's number of opportunities. The probability of a zero run at least 13 pages long is **p=0.032**. This is a family-wise statistic over the full 55-page scan, not the unadjusted probability for a preselected window. Within-word behavior does not change comparably: pp11–23 has **13/2,360 (0.551%)** within-word doubles versus **50/7,668 (0.652%)** outside (Fisher two-sided **p=0.657**). Cross-word repeats are **0/686** in the span versus **23/2,187 (1.052%)** outside (unadjusted one-sided Fisher **p=0.00183**; use the family-wise max-run **p=0.032** for the post-hoc scan). This isolates the extra suppression to word boundaries rather than a generally stricter within-word process. The word-length distributions themselves are indistinguishable: 699 words in pp11–23 (mean 4.38 runes) versus 2,229 outside (mean 4.44; two-sample KS (D=0.0138, p=0.9999)). The boundary effect is therefore not explained by a visibly different segmentation regime.

The endpoint marginals do not make the zero diagonal automatic: all 29 GP symbols occur as both word-final and next-word-initial runes in pp11–23. Under random pairing with those fixed marginals, the expected number of equal boundary pairs is **23.6**, versus zero observed. A 5,000-draw fixed-marginal permutation produced no zero-diagonal sample. This is a conditional diagnostic after selecting the zero-run span, so it is **not** a second family-wise p-value.

A bounded check for a simple source-authentic boundary transform also fails: across the 686 pp11–23 boundary pairs, the best (y=ax+b\pmod{29}) map matches **40/686**; a 5,000-draw max-over-812-affine-maps permutation gives **p=0.59**. The no-repeat diagonal is not explained by one fixed Atbash/Vigenère-style affine relation.

## Transition differences: diagonal suppression, not a fixed shift

Across the 12,901 within-page adjacent-rune opportunities, LP2 has **86** equal pairs. An iid-uniform 29-rune stream would produce **444.9**; a permutation null preserving each page's observed rune counts expects **439.2**. Thus LP2 has about **80.4% fewer** adjacent repeats than the page-marginal null. The first three LP1 blocks, by contrast, have repeat rates near 3%, close to the 1/29 iid expectation.

For each adjacent pair define (d=(x_{i+1}-x_i)\bmod29). After excluding (d=0), the 28 nonzero difference counts are consistent with uniformity:

| Scope | Nonzero-difference (chi^2) | df | p |
|---|---:|---:|---:|
| LP2 within-word | 34.30 | 27 | 0.157 |
| LP2 cross-word | 33.00 | 27 | 0.197 |
| LP2 pp11–23 cross-word | 33.02 | 27 | 0.196 |
| LP2 pp11–23 within-word | 25.53 | 27 | 0.545 |

This is the signature of **diagonal suppression without an obvious preferred nonzero offset**. The simplest statistical description is a one-step no-repeat / non-backtracking transition over the 29-symbol alphabet (choose among the 28 symbols other than the previous one), with rare repeat slips. It is not a recovered cipher: the transition statistics do not identify how plaintext or key material selects the next symbol. The p11–23 span appears to enforce a cross-word exclusion while leaving within-word repeat rates unchanged, but its source selector remains unknown.

## p15's 16-value spiral as a repeating word key (negative)

The obvious source-derived consumer is a 16-step repeating word key: the p15 grid has exactly sixteen values, its red 3299 fixes the spiral start, and the infinity mark plausibly suggests repetition. Starting at the first word of p16 (the page after the key), I tested the five directly source-derived sequences modulo 29: printed grid values, underlying primes, prime totients, distinct Fibonacci inputs, and one-based prime ranks. For each, the four fixed additive/Atbash sign forms (P=aC+sK_{j\bmod16}\pmod{29}), (a\in\{1,-1\}), (s\in\{1,-1\}), give 20 fixed candidates without a fitted phase.

- Applied as a constant shift to every rune in each of the **1,957 runes / 450 words on pp16–23**, the best IoC is **0.034823**, essentially the 29-symbol uniform baseline **0.034483**; the resulting word strings are not readable.
- Applied as a continuous 16-rune Vigenère-style key over the same 1,957-rune stream (spaces ignored), the best IoC is **0.034722**, again essentially uniform; no readable output appears.
- Applied to the **442 p16–23 word-boundary pairs** as (y=a x+sK_{j\bmod16}), the best candidate matches **23/442**. A 10,000-draw permutation of next-word initials, taking the maximum over all 20 fixed candidates each time, gives **p=0.513**.

This rejects the most natural p15-grid repeating-key consumer of the boundary anomaly. Do not rescue it with free phase shifts, per-word fitted keys, or a broader family of transforms.

## Word-initial GP28 no-repeat rank: an all-secret page-local permutation fails

**13 November 2026, Agent36; Director #755. Original-input exclusion, no plaintext or key.** The pp11–23 run of 686 unequal cross-word rune transitions suggests a compact *reversible on a constrained alphabet* candidate. Let a word-initial source GP28 symbol be \(P\in\{0,\ldots,27\}\), let the previous ciphertext rune be \(C_{\rm prev}\), and let \(S_{\rm page}\) be **any secret permutation** of the 28 code symbols. Emit

\[
C_{\rm start}=(C_{\rm prev}+1+S_{\rm page}(P))\bmod29.
\]

The inverse recovers \(S_{\rm page}(P)=(C_{\rm start}-C_{\rm prev}-1)\bmod29\) followed by the inverse permutation. This is an exact and human-executable no-repeat boundary rule for the 28-symbol alphabet; an independent lossless GP29 operation could encode within-word letters. **The twenty-ninth GP rune has no initial-letter code without another source-specified escape or side channel.** A native-English source positive plant of 686 initial runes, secret permutation \(S(x)=5x+7\bmod28\), and arbitrary preceding word-final ciphertext runes recovers all **686/686** originals with this inverse, without a repeated boundary rune.

There is a key-free necessary condition that avoids guessing the unknown permutation. A secret bijection, even independently selected for each page, preserves the number of equal word-initial source symbols *within that page*. The original 686 source-ordered nonzero **cyclic difference ranks** produce only **1,374 ordered equal-rank pairs in 37,818 within-page eligible initial pairs**, pooled IoC **0.0363319054**. Their global rank inventory has IoC **0.0360281756** and a maximum single-rank count **40/686**. No secret page-specific permutation can increase those collision counts.

The [self-contained original-source and positive-control reproducer](../sims/lp2_wordboundary_rank28_original_sft.cjs) compares three retained pre-2014 English text controls. It renders TH as one GP rune when word-initial and follows the standard GP C/K, S/Z and U/V equivalences. Every control block preserves the original thirteen page-local word-start group lengths: 54, 64, 60, 30, 36, 59, 68, 60, 65, 64, 54, 27, 45 (sum 686).

| Control text | All consecutive 686-word windows | Minimum most-frequent initial count | Page-stratified windows, every third start | Minimum page-stratified IoC |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare, first 300k characters | 54,722 | **47** | 18,241 | **0.05161563** |
| Emerson, 2,944-line essays | 77,247 | **65** | 25,749 | **0.05521180** |
| Gibran, *The Prophet* | 15,048 | **64** | 5,016 | **0.06002433** |
| **Original pp11–23 ciphertext ranks** | One fixed span | **40** | One fixed span | **0.03633191** |

**Every** control window has a more concentrated initial-rune distribution than the actual original rank stream. The controls overlap and share source texts, so these are reproducible bounded corpus contrasts, not independent p-values or a universal impossibility theorem for all languages and intermediate codes. The positive plant verifies that this particular reversible mechanism preserves, and can expose, native-English initial-rune concentration.

**Decision:** this GP28 word-initial no-repeat code is mathematically possible but fails the original English-register gate even with completely unconstrained secret per-page symbol permutations. It yields **no original plaintext**, authentic key or decoded source text. The printed p11 tree also appears before the zero-run interval on p10; p15's numeric square sits within the span rather than marking both boundaries. Neither independently selects the proposed cipher mode. The 23 repeated cross-word rune pairs outside pp11–23 require a separately motivated exception rule. Do not rescue the hypothesis by fitting position-dependent pads or escape clocks. Reconsider only if an original instruction selects the actual permutation, exceptional channel and a held-out plaintext inverse.

## Interpretation and limits

The robust observations are (i) an LP2-wide adjacent-repeat deficit relative to the initial LP1 control, (ii) near-uniform nonzero transition differences consistent with a diagonal-exclusion process, and (iii) a **region-specific word-boundary derangement**: no word's final rune equals the next word's initial rune across pp11–23, despite 686 opportunities and full endpoint-symbol coverage. The data do not establish whether this is a rejection/filter rule in the encoder, a different word-boundary mode, or an unusual property of the unknown underlying text. It does not reveal a key or a reversible operation.

The page art is context, not proof: p11 and p23 carry tree illustrations; p15 has the red 3299 Fibonacci/prime grid and infinity mark; p22 has the three-bar cross/shrouded-body engraving; p24 has mayfly imagery. p10 also has a tree, so these motifs do not uniquely delimit the zero-run span. Independent external work likewise cautions that figural-motif signals fire in 80–99% of section-structured control books; see the [Dukotah research handoff](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/PICKUP-HERE.md) and [art-attribution catalogue](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round30/C1-art-attribution/RESULTS.md). Do not promote a “tree cipher”, “cross cipher”, or a general motif theory from this alignment.

## Next discriminating question

Does the pp11–23 zero-boundary run reflect a source-selected word-boundary encoding mode, or only the plaintext/word segmentation? The p15 sixteen-value repeating word-key and all-secret page-local GP28 word-initial permutation are now negative. Any further work must identify an original clue that explains the LP2-specific repeat suppression and selects a reversible operation or key schedule; do not search arbitrary per-word maps, add free phases, or repeat the generic figural-motif scan.

## Reproduction

Run `node sims/lp2_word_boundary_doublet_audit.cjs` from the repository root. The script reads the two source files above and reproduces the segmentation, within/cross-word counts, conditional gap tests, 13-page max-run test, and affine boundary-map check with fixed seeds.
