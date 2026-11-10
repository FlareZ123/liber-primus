# Fixed homophonic substitution: search-free necessary conditions

**Classification:** mathematical exclusion of a narrowly specified decoder family, supported by a reproducible ciphertext calculation. This is not a plaintext recovery and does not identify the actual LP2 cipher.

## Research question and contribution

Could a **fixed**, possibly many-to-one, mapping of the 29 ciphertext runes directly to plaintext letters produce ordinary English? [Wulfic's October 2026 findings §15, C15](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/reference/findings/lp2_logic_findings_2026-09-29.md) had **already excluded ordinary homophonic substitution** using an exhaustive allocation and χ² argument. The analysis here is an independent and simpler information-theoretic derivation, extending the presentation to arbitrary fixed maps and phase-conditional bounds. Do not count the overlapping exclusion as a newly cracked cipher.

There are two necessary conditions for such a map, both computable **without enumerating mappings**:

1. **Unigram mass floor.** Every rune appears between 399 and 492 times in 12,956 glyphs. For any fixed deterministic map f, every output symbol used by f has at least 399 / 12,956 = **3.079654%** of the output's positions. Ordinary English contains many letters rarer than that; the solved English text in the comparison corpus has 11 used letters with frequencies below this bound: **B C F G J K M P V X Y**. Therefore, no such f produces that solved text's letter-frequency profile.
2. **Adjacent mutual-information bound.** Let (C,C') be the empirical joint distribution of consecutive ciphertext runes within pages, and set (P,P')=(f(C),f(C')). The data-processing inequality gives the exact finite-corpus bound **I(P;P') <= I(C;C')**. The unsolved ciphertext has I(C;C') = **0.071173574 bits** over 12,901 within-page pairs. The known solved English comparison corpus has **0.819409168 bits** over 3,007 within-line pairs. A fixed map cannot turn the measured ciphertext pair distribution into a pair distribution with the comparison text's much stronger dependence.

The theorem holds for **any deterministic output alphabet and any number of rune-to-symbol mergers**. The frequency argument assumes one output symbol for each input rune, with neither deletion nor insertion. The empirical mutual-information bound assumes the mapping and both adjacent-pair definitions remain fixed.

## Reproduction, sources and controls

- Script: [`sims/homophonic_information_bound.py`](../sims/homophonic_information_bound.py)
- On-demand CI run (verified successful on Python 3.12): [2026-11-10 run 42737967287](https://github.com/FlareZ123/liber-primus/actions/runs/42737967287)
- LP2 transcription: [krisyotam/cicada3301, immutable commit 1ccf958](https://github.com/krisyotam/cicada3301/blob/1ccf9583b7064ffd6feb52a49442311048295b41/liber-primus/runes-text.txt); Git blob SHA-1 `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7`.
- English reference: [Wulfic/Cicada3301-Liber_Primus, immutable commit f038274](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/f038274969449660fff5450b229bb96b510ec079/data/canonical/liber_primus_translation.txt); Git blob SHA-1 `4a49f51284ecd3235d4e07023f1d0dc9f0d60fdc`.
- There are **55 rune-bearing pages** in the unsolved 56-page LP2 segment because the table page contains no runes. Punctuation and whitespace are excluded from symbol distributions; page boundaries are excluded from adjacent pairs.
- Across the 12,901 pairs, **86** have the same rune. In 600 pre-seeded uniform 29-symbol Markov sequences with this observed repeat probability and the same page lengths, the median adjacent MI was **0.069308557 bits**, the central 95% interval was **[0.063298013, 0.074858062]**, and the upper-tail exceedance fraction with add-one correction was **0.2778702**. This is descriptive evidence that the already-documented immediate-repeat deficit accounts for the detectable dependence; its matched-repeat parameter was estimated from the observed corpus.
- In 600 independent within-line shuffles of the solved English letters, preserving unigram counts and lengths, the central 95% MI interval was **[0.112626178, 0.142880831]**, versus the observed English **0.819409168** (permutation upper-tail p <= 1/601). This confirms the English reference's substantial adjacency structure.

A phase-dependent but position-predictable decoder f_(i mod m) obeys the **phase-conditional** bound I(P_i;P_(i+1) | phase) <= I(C_i;C_(i+1) | phase), provided the phase is fixed independently of the underlying ciphertext/plaintext. Page-local phase grouping gives the following descriptive bounds:

| Period m | LP2 conditional MI, bits | Solved English conditional MI, bits |
|---:|---:|---:|
| 1 | 0.071174 | 0.819409 |
| 2 | 0.115645 | 0.901281 |
| 3 | 0.167377 | 0.988497 |
| 4 | 0.214315 | 1.063699 |
| 5 | 0.271622 | 1.103895 |
| 8 | 0.431148 | 1.324916 |

**Caution:** the solved-English reference is shorter and is grouped by lines, while LP2 is grouped by rune-bearing pages. Its exact phase-conditional numbers are illustrative language-register comparisons, not a probabilistic rejection threshold for every possible plaintext. The uncorrected empirical MI also contains positive finite-sample bias, which grows with period m.

## Implications and precise exclusions

- **Already excluded by prior work and independently corroborated here for LP1-like English:** one-rune-to-one-letter **static substitution**, including a non-injective map from 29 runes down to fewer than 29 English letter symbols. The result includes conventional simple substitutions and fixed disjoint-alphabet homophonic encoders whose plaintext decoder is static and unambiguous.
- **A related necessary-condition check for short periodic substitutions:** independent, page-phase-specific alphabets with periods 2–8, when the target register resembles ordinary English; the phase-conditional bound applies even if the maps in adjacent phases differ.
- **Untested here:** context-dependent or stateful substitutions, nonlinear recurrent transformations, word- or rune-position resets conditional on text, insertions/deletions, multiple plaintext symbols per rune, additive/pseudorandom streams, true external key material, transpositions, and nonlinguistic plaintext.
- **No new decrypted passage or key** is asserted. The contribution closes a concrete otherwise-unenumerated decoder family with an information-theoretic necessary condition, and narrows attention to mechanisms that can create plaintext dependence from a low-dependence ciphertext.

The doublet deficit and broad flatness were already known, as documented by [Dukotah's Solvers' Dossier](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/SOLVERS-DOSSIER.md). The additional contribution within this repository is the **alternative universal data-processing proof** and its explicit phase-conditioned extension. The underlying fixed homophonic family was already excluded independently by Wulfic's C15, so this note is supporting mathematical evidence rather than a novel decryption or a new global exclusion.
