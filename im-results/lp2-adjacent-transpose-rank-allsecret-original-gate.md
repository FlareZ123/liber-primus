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

## Other orientation and decision

For the inverse-rank emitter (plaintext is rank, emitted symbol controls the swap), the canonical and one private affine initial list were separately evaluated for both clamped directions. Canonical original IoCs .03449338/.03453768, private-list IoCs .03449222/.03455071. Both exact-replay paths are nonprose. Unlike the rank-input model, the all-initial-alphabet lemma does not apply to this orientation; it remains unexcluded in general. Do not treat the sample as an all-key result.

Retire the four fixed rank-input variants under the declared source-native register; the intact-group lexical rejection is finite-dictionary conditional. The arbitrary unknown initial permutation cannot rescue them. No authenticated opcode, key, or unknown plaintext was obtained. No need to expand to arbitrary rank labels, alternative movement maps or reset schedules without a source-selected operation.

Reproducer: [standalone CommonJS SFT](../sims/lp2_adjacent_transpose_rank_allsecret_sft.cjs), executed in the connected JS runtime on the repository sources. The standalone wrapper can be run from the repository with Node; no CI execution claimed. Script commit [e07fd632](https://github.com/FlareZ123/liber-primus/commit/e07fd6323bbed5a9a37da33b75edcc461b3c0bbd).
