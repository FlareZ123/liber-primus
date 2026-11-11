# Key-independent entropy gate for previous-ciphertext feedback

**Classification (11 November 2026): exact finite-alphabet invariant plus an English-register exclusion; no unknown ciphertext decrypted.** This is a genuinely keyless constraint on an entire family of reversible GP29 ciphers. It does not assert that the manuscript is English, that the creator selected this cipher, or that cipher output is independent randomness.

## Candidate inverse and precise obstruction

Consider any original-length GP29 stream cipher with **one preceding ciphertext rune as its entire recurrent state**, potentially choosing an entirely secret permutation for each of the 29 previous-rune values. For input plaintext \(P_i\), preceding ciphertext \(C_{i-1}\), and output \(C_i\), write

\[
C_i=\pi_{C_{i-1}}(P_i).
\]

Every \(\pi_s\) is a full unknown bijection of all 29 rune symbols. The initial rune on each physical page is arbitrary and omitted from this gate. For a nine-section variant, each source-text section receives its own independent set of 29 secret permutations:

\[
C_i=\pi_{\text{section}(i),\,C_{i-1}}(P_i).
\]

At every fixed *observed* state, applying a permutation preserves its empirical output histogram, up to relabeling. Therefore the **exact empirical entropy identity** and elementary conditioning bound are

\[
H_{\rm emp}(C_i\mid S_i)
=H_{\rm emp}(P_i\mid S_i)
\le H_{\rm emp}(P_i),
\]

where \(S_i=C_{i-1}\) globally or \(S_i=(\text{section},C_{i-1})\). The statement holds with completely unknown keys, correlations in the plaintext and arbitrary page-initial symbols. It does not require a cryptanalytic key search or an iid assumption. An injective rune-to-rune mapping under a fixed state must be a permutation.

## Original input and measured lower bound on plaintext entropy

Source: unchanged [LP2 GP29 corpus](../resources/liber-primus/lp2-corpus.json). All **55** original rune-bearing unknown physical pages contribute **12,956** runes, with **12,901** within-page transitions. The manuscript's nine independent text-section lengths, already used in the [source section segmentation](lp2-anti-repeat-lossless-capacity.md), are **729, 1145, 1729, 9, 1894, 1021, 1524, 1589, 3316**, totaling 12,956. Two section boundaries fall inside rune-bearing physical pages, so the section-reset calculation drops both cross-section transitions and retains **12,899** eligible transitions.

| Unknown-key feedback model | Empirical \(H(C_i\mid S_i)\), bits/rune | Implication for candidate original GP29 plaintext |
| --- | ---: | --- |
| One global alphabet-family indexed by preceding ciphertext rune | **4.7853067372** | The plaintext's empirical marginal entropy at the 12,901 eligible positions must be at least this high |
| Nine independently keyed section alphabet-families | **4.4295723126** | The plaintext's empirical marginal entropy at the 12,899 eligible positions must be at least this high |

These bounds are invariant under *every* possible secret row permutation for the stated model. The maximum theoretical GP29 entropy is \(\log_2 29=4.8579809951\) bits/rune, so the observed predecessor-conditioned ciphertext remains near the uniform limit.

To calibrate the register of ordinary GP29-encoded prose, the SFT uses the repository's three historical English reference texts, with the same greedy canonical GP transcription and a sliding 12,956-rune block. For the nine-section model it measures the plaintext marginal entropy at the **same 12,899 destination offsets** as in the original. Windows overlap, so these are corpus comparisons rather than statistically independent trials.

| Control text | Matched windows | Minimum | Median | Maximum GP29 marginal entropy |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare, first 300k characters | 32 | 4.22251 | 4.25703 | **4.28909** |
| Gibran, *The Prophet* | 8 | 4.24736 | 4.26116 | **4.27775** |
| Emerson, *Essays* | 49 | 4.20911 | 4.23690 | **4.25485** |

All **89** measured windows fall below even the nine-section source lower bound. The narrowest gap is \(4.42957231-4.28909395=0.14047836\) bits/rune. Any stationary predecessor-feedback permutation with these resets would necessarily decode the original into a GP29 sequence whose empirical marginal entropy is higher than every sampled native-English control. Merely choosing a cleverer secret 29×29 table, nonlinear row entries, or nine unrelated secret tables cannot repair this invariant.

## Arbitrary hidden alphabet per repeating clock phase

The same exact invariant applies when the key depends on the preceding ciphertext rune **and** a known public phase \(t\bmod k\): \(S_i=(C_{i-1},t\bmod k)\). Each of the \(29k\) states is allowed a completely unrelated secret GP29 permutation. The repeated clock can advance continuously over the 12,956-rune book or restart at the original page boundary. Source-suggested five and seven phases match the sizes of the earlier round's original 5×5 and 7×7 magic-square clues; they are candidates, not verified LP2 clock instructions.

| Phase period \(k\) | Global absolute-rune clock, bits | Page-local clock, bits |
| ---: | ---: | ---: |
| 1 | 4.785307 | 4.785307 |
| 5 | **4.583525** | **4.578481** |
| 7 | **4.469229** | **4.466438** |
| 8 | 4.421768 | 4.414309 |
| 10 | 4.307543 | 4.309558 |
| 11 | 4.258999 | 4.241224 |

For every period **1 through 10** under both clocks, the original source's conditional entropy exceeds the **4.289094** maximum measured in any of the 89 English-GP reference windows. Period 11 no longer clears that benchmark. This is a finite English-register exclusion of all unknown 29×29 phase-row substitution families in this clock range, including source-suggested 5 and 7; it does not depend on selecting or guessing the \(29k\) secret permutations. Phases keyed by a hidden or evolving state, section plus phase, or varying word positions are outside this table. As phase buckets become smaller, empirical conditional entropy falls from finite-sample grouping even under uniform ciphertext, so a low bound is not positive evidence for a cipher.

## Concrete eight-column key schedule from the original numeric grid

The original p50 grid is exactly **32 rows × 8 columns**, each cell a two-character base-60 token interpreted as a byte. The separately oversized p54 Ac rune has GP29 index **24**, and the p54 text has **232 = 29×8** runes; this gives a conceivable yet **unverified** proposal to skip the grid's first 24 entries and interpret the remaining 232 cells as 29 GP29 predecessor rows × eight time phases. The 29-by-eight interpretation is a natural source-constrained feedback-key candidate, regardless of whether the p54 alignment was intentional.

If the looked-up byte is a phase/previous-ciphertext-dependent additive rune shift, or **any** secret one-to-one substitution of the plaintext rune, this candidate is already covered by our period-eight invariant. Crucially, **every one of the 232 lookup rows may be a completely secret arbitrary permutation**; the actual p50 bytes need not be guessed.

| State clock for the same 29×8 secret table | Original \(H(C_i\mid\text{previous }C,\text{phase})\), bits/rune |
| --- | ---: |
| Global eight-rune phase | **4.42176760** |
| Page-reset eight-rune phase | **4.41430860** |
| Nine-section-reset eight-rune phase, **same** 232 tables reused across sections | **4.41259832** |

All three exceed the **4.28909395** highest marginal GP-plaintext entropy among the 89 native-English controls. The [single-file reproducer](../sims/lp2_cipher_feedback_entropy_sft.cjs) now independently computes the section-reset variant from original source boundaries and asserts the exact values. Consequently **no direct reversible, fixed secret previous-ciphertext × eight-phase GP29 alphabet lookup of this natural table shape** can explain the original as ordinary native-GP English, even if every hidden table value were freely chosen. This rejects a whole concrete source-led cipher model without another grid-key search. Section-dependent *distinct* keys, changing hidden state, nonbijective transforms or non-GP output are outside the invariant. The proposed p50 last232 selection remains an unverified reading of the numerals, not an authenticated key.

## Positive control and interpretation

The [single-file CommonJS reproducer](../sims/lp2_cipher_feedback_entropy_sft.cjs) builds nine deterministic secret families of 29 independently shuffled 29-symbol permutations, encrypts a length-matched native-English rune stream using the previous *ciphertext* symbol, inverts all 12,956 positions exactly, and verifies the entropy identity to \(10^{-12}\) bits. It also asserts the two original counts, measured entropies and native-reference bounds.

**Decision:** deprioritize stationary, length-preserving GP29 ciphertext-feedback ciphers in which the immediately preceding ciphertext rune, optionally plus one of nine source sections or a public global/page-local phase of period at most ten, selects an arbitrary hidden permutation. This is much stronger than a null search of a few additive or multiplicative keys. It remains conditional on plaintext in a native English-like GP29 register.

**Live alternatives:** per-page or per-word-position codebooks, multirune state, source-selected evolving keys, altered alphabets, word/section coding, auxiliary side information, compression and sufficiently different plaintext distributions are outside this scope. The short nine-rune segment does not by itself identify an encryption mechanism. No cipher key, unknown plaintext or destination is recovered by this exclusion.
