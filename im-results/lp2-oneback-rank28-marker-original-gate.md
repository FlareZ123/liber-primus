# One-rune-delayed rank-28 doublet marker: source-word-position gate

**Agent 25, 14 November 2026. Evidence class:** bounded, independently selected one-rune feedback hypothesis on unchanged original LP2 runes, with a reversible positive plant and a withheld section. **No unknown plaintext, author-selected marker or decipherment.** This is a distinct word-position test of a *one-step delayed* marker, rather than the previously rejected current-rune marker [source test](lp2-doublet-gap-source-boundary-conditional-gate.md).

## The executable causal hypothesis

Across the unsolved text, **86** of **12,901** eligible within-page adjacent ciphertext pairs are identical. In a lossless, anti-repeat emitter with a reserved rare plaintext symbol, a repeat can mark the reserved symbol while the other 28 plaintext symbols are mapped bijectively to the 28 allowed nonrepeat outputs. A one-rune delay could account for a repeat at the *start* of a printed word marking the *last rune of the preceding word*, unlike an undelayed marker.

Fix a page-local plaintext vector `P[0..L−1]`. Circularly delay the plaintext by one rune: `S[0]=P[L−1]`; `S[i]=P[i−1]` for `i≥1`. Let `r` denote a single reserved GP29 rune, and let `C[0]=S[0]`. For each later position `i`, set `C[i]=C[i−1]` iff `S[i]=r`; otherwise remove `r` from the input alphabet (giving rank `u = S[i] − [S[i]>r]`) and insert the preceding ciphertext `C[i−1]` into the output alphabet (giving `C[i] = u + [u≥C[i−1]]`). The inverse is explicit at every position, so each page roundtrips **L/L** and preserves the 29-symbol alphabet. More generally, an extra fixed secret bijection of the 28 nonmarker outputs cannot change whether each position repeats.

**Source-predictive consequence:** at each observed repeat site `i≥1`, the *preceding original plaintext slot `i−1`* must be exactly the same rune `r`, independent of secret permutations. The ciphertext's original page, word boundary and word lengths supply **all 12,901** eligible source slot addresses. This prediction is separate from any direct GP29 decryption or language score.

The weakest premise remains unprinted: no original LP2 clue commands this 1-rune circular shift, reserves any one symbol, or selects the rank-28 code. The test specifically asks whether a delayed-marker version rescues the source-word-position evidence, before authorizing any decipherment effort.

## Frozen original and independent language input

The [single-file CommonJS inverse and score SFT](../sims/lp2_oneback_rank28_marker_sft.cjs) directly consumes `lp2-corpus.json` and the separate runic `lp2-transcription.txt` parse. It asserts **12,956** actual runes, **2,896** full words, and exact rune-by-rune equality, including page-spanning words and runeless physical p50. Three separately supplied English sources (Shakespeare, Gibran and Emerson in `resources/control/`) are encoded into original solved-LP1-style GP spelling: ING is one NG rune, IO is one IA rune, and period native letter folds are retained.

For a candidate reserved symbol, take its frequency conditional on each **printed word length and exact within-word slot** in those independent texts. For sparse word positions, smooth by `max(15, count/10)` times the pooled GP29 unigram law, without fitting this prior to the LP2 event positions. A site contributes `log(p)` for a repeat and `log(1−p)` otherwise. Use pp0–39 only to select the highest-scoring one of **all 29 reserved runes**; pp40–55 are a previously unselected holdout. As a source-blind baseline, fit one constant doublet event rate separately in each cohort, giving the baseline its own optimum.

| Exact source cohort | Observed repeats / sites | Best train-selected marker | Marker expected repeats | Marker log likelihood | Cohort-fitted constant-rate log likelihood |
| --- | --- | --- | ---: | ---: | ---: |
| Train physical pp0–39 | **65 / 9,600** | **NG (index21)** | **64.20489** | **−418.40824** | **−389.46297** |
| Held out physical pp40–55 | **21 / 3,301** | **same NG**, no reselection | **22.49033** | **−142.18318** | **−127.13968** |

The marker loses **28.94527** log-likelihood units in training and **15.04350** on held-out source pages. Its predicted total repeat *counts* are close, but its word-position predictions explain the actual observed **event sites** worse than the source-blind rate. This defeats the hope that shifting rare final NGs to the next word's start rescues the model. The preexisting undelayed control also fails, selecting G on pp0–39 and losing **40.55415** train / **21.50076** held-out log units under the same frozen source prior. No favorable variant was obtained from the neighboring ±2 slot diagnostics; those exploratory comparisons do not authenticate an alternative clock.

### Positive control and scope

The SFT constructs a genuine encoded GP-native prose passage, applies the complete page-local delayed 29-state emitter under four independent markers `r∈{0,6,21,28}`, decodes it back exactly, and checks every artificial repeated-ciphertext position iff the immediately preceding plaintext position equals the reserved marker. The original source does **not** satisfy the independent lexical-position fingerprint even after selecting the best marker on training pages.

**Decision:** the one-rune-delayed rank-28 marker, *including arbitrary secret permutations of its 28 nonrepeat output symbols*, lacks a plausible printed-word-aligned English event pattern on withheld original pages. This is a finite source-native language-model rejection, not a theorem for every possible English text or other plaintext language. A different plaintext word segmentation, nonstationary event symbol, more complex delay/state, or separate encryption layer escapes the test but currently has no manuscript-authenticated selector. **Do not fit further lags to rescue this marker.** The rare original doublets remain an unexplained source constraint, and the established plaintext count stays unchanged.

**Reproducer:** [`sims/lp2_oneback_rank28_marker_sft.cjs`](../sims/lp2_oneback_rank28_marker_sft.cjs). Source inputs and spelling conventions are local, no network, no writes, seeded randomness or external packages.
