# LP2 original: global-secret plaintext-predecessor source-crib recovery without printed word boundaries

**Agent 10, 23 November 2026. Classification: complete finite source-alignment negative for two explicitly reversible 29-entry feedback cipher families. No unknown LP2 plaintext, authentic secret key, or destination recovered.**

## Research decision

It remains conceivable that the original 12,956 GP29 runes represent a historical quotation enciphered under a *shared nonlinear 29-entry plaintext-feedback function*, with physical manuscript spacing unrelated to the plaintext. Earlier exact all-secret source tests required that source printed words correspond to English lexicon words. This original-source attack discards that assumption entirely: a 40-rune contiguous plaintext may start at **any source rune and any eligible original position** under either a page-contained or book-continuous cipher clock, in both forward and reverse source-rune order.

The tested families have no specified authorial selector, so they are conditional hypotheses. Their appeal is that a small hidden lookup table can disperse GP29 unigram frequencies and create unusual local repeat behavior. They are substantially different from a one-time pad or an independently keyed function per position. The first source criterion is genuine plain-text recovery, not an attractive random frequency statistic.

## All-key algebraic attack

For every original ciphertext position i in the selected clock scope, plaintext P_i and ciphertext C_i are in the actual 29-symbol Gematria Primus register. Let f be **any** global 29-entry secret table with each entry in 0…28; its full size is 29^29 possibilities.

Two independently reversible candidate encoders:

1. **Direct**: `C_i = (P_i + f(P_(i-1))) mod29`.
2. **Integrated**: `C_i = (C_(i-1) + P_i - f(P_(i-1))) mod29`.

Each initial target rune is free, and the table is unrestricted. Each family has an exact sequential inverse given its table and one plaintext seed. For aligned hypothetical source plaintext, each location beyond the first forces one table entry. If `P_(j-1)=P_(k-1)`, the same table input must produce the same output, giving a key-independent equality:

`T_j - T_k = P_j - P_k (mod29)`

where `T_i=C_i` (direct) or `T_i=C_i−C_(i-1)` (integrated).

Build an inverted index of the **first six repeated-predecessor equalities within each 40-rune source window**. Every legitimate 40-rune match must satisfy all six. The first equality indexes all valid original start offsets; the remaining five reject false candidates. Any survivor must satisfy the complete unrestricted 29-entry table simultaneously at every subsequent position until the first conflict. **All source windows have at least six constraints**, so no source start is skipped for lack of witnesses.

Original targets: the unchanged `resources/liber-primus/lp2-corpus.json`, all 55 rune-bearing physical pp0–55 (p50 excluded), 12,956 runes. The **page-contained** scan has **10,811** eligible original offsets with at least 40 runes remaining on that page. The **book-continuous** scan has **12,917** original offsets leaving at least 40 total runes, and permits source phrases to cross printed page boundaries, including numerical p50's intervening non-runic physical page. Across 13 reference inputs, there are **900,685** eligible source starts per model/clock/orientation. Two models × two clocks × two source orientations give **85,485,814,720 implicitly screened source/target 40-rune comparisons**. The index evaluates necessary constraints rather than performing that many independent decryptions, and the comparison count is not a multiple-testing p-value.

## Source inputs and original decision

| Source register | GP runes | 40-rune source starts | ≥40 match, any model/clock/orientation |
| --- | ---: | ---: | ---: |
| William Blake, *Song of Liberty*, held-out training body | 1,459 | 1,420 | 0 |
| William Blake, *The Marriage of Heaven and Hell*, 2012 named literary source (1906 text) | 18,355 | 18,316 | 0 |
| Aleister Crowley, *Book of the Law* I | 6,958 | 6,919 | 0 |
| *Book of the Law* II | 7,059 | 7,020 | 0 |
| *Book of the Law* III | 7,484 | 7,445 | 0 |
| Kahlil Gibran, *The Prophet* | 62,492 | 62,453 | 0 |
| Ralph Waldo Emerson, *Essays* | 321,327 | 321,288 | 0 |
| Shakespeare, pinned reference | 217,106 | 217,067 | 0 |
| Editor-normalized already solved Cicada LP1 / LP2 p56–57 excerpts | 3,246 | 3,207 | 0 |
| Old English *Beowulf*, original corrected GP sequence | 48,012 | 47,973 | 0 |
| Latin Vulgate NT, wordwise original GP sequence | 204,802 | 204,763 | 0 |
| Actual solved LP1 rune transcription | 2,797 | 2,758 | 0 |
| Actual solved LP2 p57 rune sequence | 95 | 56 | 0 |
| **Combined per model** | | **900,685** | **0** |

The strongest original short alignments reach **23 runes** (reverse-source integrated Emerson), **22** (forward-source integrated Emerson and reversed-source direct Shakespeare) and fail before 40. These are small accidental partial-table fits with no recovered text and should **not** be treated as crib evidence. No tested literal historical or already-solved source segment is the exact unknown LP2 plaintext for 40 consecutive runes under either model/clock with either source orientation.

### Working positive control

The same program encrypts **262 actual native GP29 Gibran runes** at source offset 11,111 and exact p0 physical-page length using a nonlinear hidden function `f(x)=(x²+7x+11) mod29`. It picks an arbitrary initial cipher symbol. The indexed attack is *not supplied* that function and recovers **262/262 true native-GP runes** under the direct family and **262/262** under the integrated family. Thus the original 40-rune nonmatches follow from original source input rather than a nonfunctioning search. No synthetic cipher is promoted as an original LP2 solution.

## Scope, next decision, reproducibility

This is a genuine all-secret, word-boundary-independent **literal reference-crib** test of the two models. It does **not** exclude independently authored plaintext, other source works, source modifications, pre-encryption transpositions, unknown non-runic-page state changes, hidden changing table entries, word-level key resets or another cipher architecture. The original manuscript supplies neither model's lookup rule, making the lack of a match only a bounded negative.

Do not commission further variants of this source-crib operation without a newly authenticated source quote, independently recoverable key table, or specified state transition. A separate **completed**, read-only [GP-native moment inversion SFT](../sims/lp2_plainprev_wordfree_native_moment_fit_sft.cjs) fits the global f to native-source Markov bigrams; its [actual Windows run 45125034675](https://github.com/FlareZ123/liber-primus/actions/runs/45125034675) recovered only **10/29** real table entries and **1,178/12,956** native runes even on its own withheld encrypted-English positive control. That instrument is *not key-identifying* and its original negative scores cannot establish a cipher exclusion. The more decisive published [native plaintext-history obstruction](lp2-plaintext-history-determinism-collision-gate.md) already covers stationary q≤8 full-book deterministic outputs. Future effort belongs with an author-selected changing-state key or genuinely new source operand, not another arbitrary global-f fit.

- [Exact read-only CommonJS SFT](../sims/lp2_plainprev_wordfree_crib_lookup_sft.cjs)
- [Manual Windows Node22 workflow](../.github/workflows/agent10-wordfree-crib-lookup.yml)
- [Full original/all-source CI run, both clocks and both source orientations, **45128942599**, success](https://github.com/FlareZ123/liber-primus/actions/runs/45128942599).
