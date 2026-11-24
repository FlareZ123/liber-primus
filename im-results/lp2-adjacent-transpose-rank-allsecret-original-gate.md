# Adjacent-transpose adaptive rank cipher: original inverse and all-initial-alphabet gate

**Agent 17, independent draw 1, 24 November 2026.** No unknown LP2 plaintext or key recovered. The frozen adjacent-transpose rank-input construction is excluded under the specified native-prose/printed-group assumptions even with an arbitrary private initial alphabet. Its two inverse-rank-emitter orientations were only sampled, not all-key excluded.

## Hypothesis and inverse

The source supplies the ordered GP29 alphabet, and the clear p57 parable explicitly speaks of shedding circumferences. A standard adjacent-transposition list update is a distinct reversible candidate between the already tested move-to-front/back and frequency-count rank algorithms. The cyclic neighbor variant is a literal geometric extension; neither the source wording nor the historical use of adaptive lists establishes this opcode. The tested rank labels are the canonical GP29 indices. Freeze all runes as consuming, continuous state, and the four combinations of step ±1 and endpoint clamping/wrapping.

Let L be a list of 29 distinct plaintext symbols. To encode P, emit its current position r in L, then swap positions r and j, where j is r±1 clamped to [0,28] or taken mod29. To decode, emit L[r] and perform the identical swap. This is lossless with no sidecar.

**All-initial-alphabet lemma.** For every rank sequence and initial permutation σ, the two decoder lists starting with identity and σ remain related by pointwise relabeling σ at every step: the same swap depends solely on the observed rank. Hence decoded text with initial σ equals σ applied to the identity decode. Its equality partition, count multiset, IoC and number of distinct singleton symbols are invariant. This reduces recovery of any private initial alphabet to an ordinary substitution CSP on one explicitly computed tape; all 29! initial keys are covered without enumerating them. The two cyclic directions also cover all rotations/reflections of the rank-label circle, because a cyclic rotation is conjugate to a relabeling of the initial positions and reflection changes the step sign. Arbitrary non-dihedral rank-label permutations are not included.

## Original input and results

The code aligns the canonical original corpus and corrected printed transcription: 12,956 runes, 2,896 complete printed groups, 83 singletons. Whole-book results:

| Update | All-key decoded IoC | Distinct singleton types | Maximum private-page reset IoC |
|---|---:|---:|---:|
| left, clamped | .0344794703 | 26 | .0438228438 |
| right, clamped | .0344767773 | 28 | .0387505367 |
| left, cyclic | .0344832952 | 29 | .0475524476 |
| right, cyclic | .0344560916 | 28 | .0372477458 |

Native solved-source IoCs from the nine archived reference sections span .05250694–.07002801. These sections have unequal lengths, so this comparison is a descriptive diagnostic, not a calibrated universal statistical bound. More decisively, under intact A/I(/O) singleton assumptions, every private initial permutation fails globally. With independent arbitrary initial alphabets in the nine artwork-defined chapters, eight chapters individually require at least four distinct singleton types for all four models; the final p54–55 chapter has two and is not rejected by the singleton test alone.

## Attempt to recover the final chapter's arbitrary key

The final chapter is 308 runes. Freeze the state at p54's start. Fit the key using only 43 complete p54 printed groups of length ≥3 or length 1; withhold 11 complete p55 groups under the same selection. The dictionary contains 38,919 GP spellings, combining the archived TextBlob list with alternate GP segmentation and the nine native solved records. The exact substitution constraint solver indexes candidate words by equality pattern, intersects variable domains, enforces a perfect matching and branches only if needed. There is no language-score optimization or key dictionary.

- Left-clamped and left-cyclic: zero possible initial alphabets at the root of domain propagation (one visited node each).
- Right-clamped and right-cyclic: one length-10 training group's equality pattern has no dictionary candidate, so the complete training model is impossible before branching.
- All four: no training key, hence no original held-out plaintext prediction. No use of p55 words for fitting.

Positive controls: encode the actual WELCOME and second KOAN native reference records with a private initial alphabet σ(i)=(7i+9) mod29 for each of four models. Recover a candidate initial alphabet from the first two-thirds of the complete word groups using the same solver, then freeze it and predict the remainder. Each of four WELCOME plants recovers 27/29 initial entries and 169/169 withheld runes; each KOAN plant recovers 24/29 entries and 112/113 withheld runes. Total 1,124/1,128 withheld runes. Exact inverse with the planted key passes in all eight controls. These are native-text positive plants with control vocabulary included, not blind historical key discoveries or a general exact-key uniqueness claim. Unused symbols in the key are completed arbitrarily; one KOAN held-out symbol is incorrect.

## Complementary exact recovery: arbitrary ciphertext rank labels, canonical initial list

The all-initial-alphabet lemma assumes canonical rank labels. A complementary key-recovery attack grants **every arbitrary 29! ciphertext-label-to-rank permutation** with the GP29 chart as the fixed initial plaintext list and the standard left-clamped transposition. This is a distinct key envelope; it does not grant both unknown permutations simultaneously. The chart supplies the fixed initial order, but no source instruction independently selects a secret rank labeling or this update.

At each original ciphertext symbol x, if its rank r is already known, the plaintext must equal L[r]. Otherwise, each permitted next dictionary rune p fixes r to its current location in L and creates the key assignment x→r, provided no other label owns that rank. Perform the left-neighbor swap and continue within a fixed-word-length trie, undoing state and assignments on every rejected branch. This enumerates precisely the intact-group finite-lexicon paths under an arbitrary rank permutation, without guessing an initial key. All words, including the printed singletons, participate. The original 38,919-spelling dictionary is unchanged.

| Original fitting interval | Complete groups / runes fitted | Visited trie states | Deepest complete groups | Decision |
|---|---:|---:|---:|---|
| p0 opening, first ≤200 runes | 44 / 196 | 913,741 | 5 | Exhausted, no key |
| p0 black body from original red13 boundary, first ≤200 runes | 45 / 198 | 14,351,281 | 4 | Exhausted, no key |
| p54–55 terminal chapter, first ≤200 runes | 44 / 199 | 59,859 | 2 | Exhausted, no key |

All three original searches finish below their explicit caps (3,000,000 for the full opening and terminal chapter, 30,000,000 for the independently source-selected black-body restart at rune13). None has a surviving key for a withheld prediction. The black-body start is frozen from the original image ink override, not a fitted offset. A WELCOME native plant with a private rank-label permutation recovers all 29 key entries and predicts all 176 untouched suffix runes exactly. A separate second-KOAN plant reaches the 30,000,000-node cap at seven complete groups; it is **inconclusive**, not an additional successful key recovery. Its known-key inverse still passes. The plant vocabulary includes the native words, so this is a key-recovery calibration, not a blind historical plaintext discovery. The initial whole-word candidate search timed out; the final trie-guided implementation ran successfully and supplies the reported exact original exhaustion. An exploratory frequency-weighted branch order also capped on KOAN2 at 3,000,000 nodes, and was not retained as a duplicate implementation.

[Trie-guided rank-label recovery SFT](../sims/lp2_adjacent_transpose_ranklabel_exact_recovery_sft.cjs), initial source commit [0a7ea8bf](https://github.com/FlareZ123/liber-primus/commit/0a7ea8bf000587f6e1cb4fd6f564be7fc1e2b58e); source-selected boundary and final control cap in [f16eb3ea](https://github.com/FlareZ123/liber-primus/commit/f16eb3ea0c946bcdf65a33c7d435be17b8e51ac6). Executed on the canonical sources in connected JS. No CI claimed. The combined simultaneously arbitrary initial list and rank-label map remains open; it would require an independently selected clue or another discriminating invariant to warrant a larger joint search.

## Other orientation and decision

For the inverse-rank emitter (plaintext is rank, emitted symbol controls the swap), the canonical and one private affine initial list were separately evaluated for both clamped directions. Canonical original IoCs .03449338/.03453768, private-list IoCs .03449222/.03455071. Both exact-replay paths are nonprose. Unlike the rank-input model, the all-initial-alphabet lemma does not apply to this orientation; it remains unexcluded in general. Do not treat the sample as an all-key result.

Retire the four fixed rank-input variants under the declared source-native register; the intact-group lexical rejection is finite-dictionary conditional. The arbitrary unknown initial permutation cannot rescue them. No authenticated opcode, key, or unknown plaintext was obtained. The complementary canonical-list arbitrary-label result above also retires that exact envelope on the three fitting intervals. Do not expand to simultaneous arbitrary lists and labels, alternative movement maps or reset schedules without a source-selected operation.

Reproducer: [standalone CommonJS SFT](../sims/lp2_adjacent_transpose_rank_allsecret_sft.cjs), executed in the connected JS runtime on the repository sources. The standalone wrapper can be run from the repository with Node; no CI execution claimed. Script commit [e07fd632](https://github.com/FlareZ123/liber-primus/commit/e07fd6323bbed5a9a37da33b75edcc461b3c0bbd).
