# Source-phrase projective q5 inverse and opening-boundary candidate

Agent 5, 26 November 2026. This is a different crib receiver from the pure additive q8/q13 cyclic-cover test. For each latent true word allow arbitrary independent nonzero plaintext scale a, shift b, nonzero cycle amplitude t, starting phase and direction, with one shared q5 cycle K:
C_j=aP_j+b+tK_(r+dj mod5).
Ordinary and authentic F-hold semantics are distinct. All six source-selected repeated whole-word LP1 phrases happen to have no F, so their local crib equations are identical under both clocks.

## Exact projective crib inversion

Enumerate the 2,557 zero-sum difference-cycle classes modulo translation of K, nonzero scaling, rotations and reversal. For a known plaintext word, project out the constant vector and P column. A ciphertext fragment is compatible iff its residual is a nonzero scalar multiple of the corresponding projected K fragment (or both zero), with a nonzero a witness. Enumerate all ten oriented phases; intersect the compatible key sets across every word of a crib, processing longest first. This is exact finite key membership, not a language fit.

Four independently masked native section plants yield the correct key as unique top raw-crib-support class: KOAN ordinary 13 vs next≤2, KOAN F-hold 14 vs next3, LOSS ordinary 4 vs next2, LOSS F-hold 4 vs next3. Overlapping nested phrases count separately; hence raw support is not independent evidence. Across original nine chapters, 76,071 alignments give 3,339 compatible starts and 3,778 key/start incidences, 3,379 unique chapter/key combinations. No key has more than one disjoint long (≥29-rune) anchor; the most supported long-anchor key has four disjoint total anchors in p40–53. The high false-positive count is expected from the independent private word parameters; it does not authenticate any phrase.

## Exact source-boundary candidate and independent continuation

At the first black rune of p0 (global offset13), the 41-rune native phrase “NOT WHO YOU ARE WHO ARE YOU WHO WISHES TO STUDY HERE” admits K=[0,1,5,19,23] up to projective equivalence. This is a source-boundary selection, not the highest-scoring original key. Freeze it and exclude the entire candidate span [13,54); decode all following 675 runes through p2 without any refit.

The fixed-key lexical inverse projects out the constant and K columns for every candidate dictionary word and phase, indexes residuals up to scalar, then counts all (a,b,t) with both a,t nonzero. It marginalizes all such parameters and every phase/direction and latent word boundary, with 95% weighted lexicon and 5% singleton fallback. Literal F uses only compatible hold masks. A dynamic program gives exact finite-model full likelihood and MAP word segmentation. It does not establish unique plaintext because independently chosen word masks leave many possible words.

| Case, 675 runes | Correct-key score nats/rune | Wrong-key | iid pad | True rune accuracy |
|---|---:|---:|---:|---:|
| Shakespeare held ordinary | −3.259612 | −3.395955 | −3.401635 | 36.4% |
| Emerson held F-hold | −3.237476 | −3.394052 | −3.412424 | 39.9% |
| Original frozen opening ordinary | −3.402451 | — | — | unknown |
| Original frozen opening F-hold | −3.400178 | — | — | unknown |

Both original continuations are word salad, in the wrong-key/pad score range. No coherent sentence or authenticated key. This retires the concrete source-boundary candidate; the weak control plaintext accuracy prohibits claiming this receiver solves arbitrary projective word-masked texts. Other accidental crib candidates are not disproved by this one test; the separate exact long-chapter capacity result excludes p40–53 against all tested literary windows.

Reproduce: [crib SFT](../sims/lp2_q5_latent_projective_source_crib_sft.cjs), [lexical SFT](../sims/lp2_q5_projective_fixed_key_lexical_sft.cjs). Raw [native controls](lp2-q5-latent-projective-source-crib-controls.json), [original](lp2-q5-latent-projective-source-crib-original.json), [ordinary continuation](lp2-q5-projective-fixed-key-lexical-original-ordinary.json), [F-hold continuation](lp2-q5-projective-fixed-key-lexical-original-hold.json), two 675-rune control files lp2-q5-projective-fixed-key-lexical-control{1-ordinary,2-hold}.json. Executed on connector-returned repository code and data; no standalone Node run asserted.
