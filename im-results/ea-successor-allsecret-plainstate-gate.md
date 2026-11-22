# LP2 post-repeat successor distribution: all-secret plaintext-state gate

**Classification (10 November 2026, Agent 19): exact original-cipher arithmetic and a bounded source-register exclusion, with a genuinely reversible 12,956-rune positive control. No unknown LP2 plaintext, key, cipher, or destination is recovered.**

## The original constraint

The 55 rune-bearing unsolved LP2 physical pages carry 12,956 original GP ciphertext runes. For within-page differences over the published 29-rune numeric order, define

\[
\Delta_i=(C_i-C_{i-1})\bmod29.
\]

There are **86** within-page sites with \(\Delta_i=0\). Exactly **85** have a next rune in the same page. At these 85 successors \(\Delta_{i+1}\) is always nonzero, covers **all 28 values 1–28**, and has **maximum multiplicity 8**, **42 observations in its eight most frequent bins**, and equality count **254/7,140 ordered distinct-position pairs** (0.03557423). The count of equal pairs is \(\sum_x n_x(n_x-1)\).

These are properties of the unmodified source, with all repeated-rune sites and eligible successor sites included. Their position selection uses no plaintext guess or model fitting.

## A stronger unknown-key family than affine plaintext autokey

Consider the explicit *hypothetical* reversible cipher, with each original page's first GP plaintext rune transmitted as its initial ciphertext symbol:

\[
\Delta_i =
\begin{cases}
0,&P_i=28\ (\mathrm{EA}),\\
\pi_{P_{i-1}}(P_i),&P_i\in\{0,\ldots,27\},
\end{cases}
\]

where **every \(\pi_x\), \(x=0,\ldots,28\), is an arbitrary secret bijection** from the other 28 plaintext symbols to the 28 nonzero GP29 differences. All **29 independent 28-permutations** are allowed; no affine, periodic, or supplied-key assumptions are made. The decoder is exact: the zero step yields GP-EA; otherwise invert \(\pi_{P_{i-1}}\) using the already recovered preceding plaintext rune.

Whenever a zero step occurs, \(P_i=28\). Thus the **next** nonzero step is encrypted by *one common unknown row* \(\pi_{28}\), regardless of the previous ciphertext glyph. Every candidate row merely permutes the 28 observed next-step labels. In particular, their **28-symbol support, maximum count 8, and collision count are identical for every possible secret key**.

The statement also excludes the entire fixed first-order plaintext-feedback subfamily \(\log_{15}(\Delta_i)=P_i+f(P_{i-1})\pmod{28}\) for all **arbitrary unknown functions \(f\)**, subject to the same GP-EA source register and stationary row. It is stronger than the previously reported 784 affine \(f(p)=ap+b\) trial ([that earlier inverse](ea-anchored-plaintext-feedback-inverse.md)).

## Generalization to all 29 possible fixed plaintext markers

The original 85 post-repeat ciphertext differences include **all 28 nonzero GP29 values**. The all-secret theorem does not require choosing GP-EA as the marker. For **any single unknown fixed plaintext marker** \(\rho\) selected from all 29 GP symbols, let every plaintext predecessor \(u\) have its own arbitrary secret bijection \(\pi_u\) mapping the other 28 plaintext symbols to the 28 nonzero differences. A zero output step exposes \(P_i=\rho\). The very next nonzero output step must use the same row \(\pi_\rho\) after every such event. As that bijection can only relabel 28 different steps, the **85 hidden plaintext successors must together include all 28 other GP runes**.

The independent [all-29-marker gate](../sims/all29_marker_successor_support.cjs) examines every occurrence of every one of 29 marker candidates in the **entire** pinned GP-encoded source texts, counting all distinct immediate nonmarker successors. The test is deliberately more permissive than seeking a contiguous quotation: even an arbitrary selection of source positions cannot acquire a symbol that never follows the marker anywhere in the source.

| Source or observed channel | GP runes | Greatest distinct successors after any one fixed marker, anywhere in source | Greatest distinct successors in a consecutive 85-event window |
| --- | ---: | ---: | ---: |
| LP2 original post-repeat differences | 12,956 | **28 of 28** | **28** |
| Shakespeare | 218,800 | **26 of 28** | 24 |
| Gibran | 63,114 | **25 of 28** | 23 |
| Emerson | 324,630 | **27 of 28** | 23 |

The exhaustive 85-event comparison covers **209,228** Shakespeare windows, **59,133** Gibran windows and **312,883** Emerson windows, **581,244** across all 29 possible marker identities. None reaches 28 distinct following symbols. All these windows overlap; their tally is a finite-source exclusion, not a set of independent significance trials. The stronger whole-source support obstruction does not rely on their contiguity.

The all-29-marker program also constructs and exactly reverses a source-native **12,956-rune** cipher under a different marker, **E (GP index 18)**, using 29 independently seeded secret 28-permutation rows. It recovers and reencrypts every symbol and checks every output difference; the earlier two EA-marker original-length plants likewise invert. This is a **key-independent exclusion of the entire fixed-marker, stationary predecessor-plaintext-row family for these three finite GP-English texts**. It cannot exclude specially authored prose, changed orthography, other languages, a moving key/state, ciphertext-dependent rows, or a hidden outer alphabet. No unknown LP2 plaintext is recovered.

## Literal native-GP source constraints

Encode complete checked-in Shakespeare, Gibran and Emerson texts using the existing greedy GP digraph convention and the usual QU/V/K/Z spelling normalization. For each occurrence of source GP-EA followed by another GP rune, retain the **next** plaintext symbol. Exhaustively check every contiguous window of exactly **85 such EA-successor events** in each source, with no choice of secret row, key, output label or favorable passage:

| Data register | 85-event windows | Lowest maximum count of one successor | Highest distinct-successor count | Lowest equality-pair rate |
| --- | ---: | ---: | ---: | ---: |
| **Original LP2** | one manuscript sample | **8** | **28** | **0.035574** |
| Shakespeare (218,800 GP runes, 1,633 EA) | **1,549** | 17 | 15 | 0.108123 |
| Gibran (63,114 GP runes, 606 EA) | **522** | 20 | 16 | 0.118487 |
| Emerson (324,630 GP runes, 2,224 EA) | **2,140** | 13 | 15 | 0.101401 |

No one of the **4,211 exact source windows** meets either original value (maximum at most eight, or 28 distinct). This is a deterministic **finite source-window mismatch**, not a p-value over independent samples; source windows overlap. Crucially, the true secret row is allowed to be **any** of the \(28!\) bijections, yet cannot alter either statistic. The source files' source-event coordinates are word-boundary-free, so the argument does not depend on preserving original ciphertext-word boundaries.

An illustrative specific symbol is GP **R** after GP-EA: Shakespeare has 555 of 1,633 such transitions, Gibran 175 of 606, and Emerson 527 of 2,224. Whichever secret step represents R, that step can appear at most eight times in the 85 original source-selected successor sites.

## Full reversible positive cipher and meaning

The reproducer constructs independent, hidden, seeded random permutations for **all 29 predecessor-plaintext rows**, enciphers each of two original-length, source-native GP plaintext streams, and completely inverts the resulting ciphertext, **12,956/12,956 exact plaintext rune recoveries and 12,956/12,956 reencryption checks per plant**. The Shakespeare and Gibran plants have respectively **90 and 142** within-page usable post-EA successors, maxima **39 and 45**, and **11 and 13** distinct next-step types. Their true unknown permutation keys obey the same fixed-row model exactly.

Therefore the original LP2 output lacks a **necessary next-symbol source fingerprint** of this broad reversible stationary plaintext-state cipher family under these three native-English registers. Unlike a guessed high-scoring decryption, the exclusion is algebraically invariant under every allowed secret key. It does **not** refute EA as a possible marker in a cipher with changing rows, a ciphertext-dependent state, an external keystream, a hidden outer GP alphabet, or a distinct plaintext source/register. In particular, native textual spelling and a secret changing state remain unresolved.

## Exact reproduction

Run the **self-contained Node 22 CommonJS** program [sims/ea_successor_allsecret_gate.cjs](../sims/ea_successor_allsecret_gate.cjs). Its assertions cover all original page and marker counts, all native GP corpus token counts, the 4,211 exhaustive reference windows, and both complete reversible plants. The program reads only established resources and writes nothing; no new per-commit workflow or original input manipulation is required.
