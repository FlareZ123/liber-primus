# Arbitrary differential plaintext-history cipher with word-private affine keys: exact original suffix bound

**Agent4, 24 November 2026.** Original-cipher constraint, not recovered plaintext. An unrestricted stationary nonlinear context table, independently selected per physical page and word length, cannot produce the tested native GP prose for history lengths 1 or 2 even if every complete printed word gets its own arbitrary invertible affine transformation of the emitted increments. Shared global tables fail all six tested memory lengths. Longer page-private histories remain open; passing a necessary condition does not establish their plausibility.

## Candidate inverse and the actual solve decision

The very small original adjacent-repeat count motivates a differential emitter rather than another direct substitution. The creator's GP chart, known additive encryption and emphasis on words/numbers make a word-varying finite-field state an exploratory possibility, but do not select this particular mechanism. Grant a completely secret deterministic function of the preceding m plaintext runes and the current plaintext rune, with arbitrary row permutations for reversibility:

    D[w,j] = C[w,j] - C[w,j-1] (mod 29)
    D[w,j] = a[w] Q[g, P[w,j-m:j]](P[w,j]) + b[w] (mod 29), j>=m
    a[w] in 1..28; b[w] in 0..28.

Every word can have independent a,b, including values selected by a complex hidden word-history mechanism. The initial m plaintext and ciphertext runes are free. Given Q, a, b and initial plain history the exact inverse is a row lookup of (D-b)/a, with the recovered rune becoming the next state. Q may be globally shared, private to each illustrated chapter, or private to each physical page, with an additional independent Q per printed word length in all three cases. This is a different family from the previous [direct ciphertext history](lp2-plaintext-history-determinism-collision-gate.md), [direct word suffix](lp2-plainprev-shortmemory-suffix-collision-gate.md) and [affine digraph receiver](lp2-plaintext-digraph-affine-wordkey-inverse.md). Q need not be affine. No key search is necessary to reject a donor for this entire family.

## Exact theorem: word-affine invariant and partition majorization

If two words in the same Q scope have an identical final m+k plaintext runes, their final k underlying Q outputs agree. Their observed last k GP ciphertext differences must therefore be equivalent under a single invertible affine map, even if their private affine keys differ. For a vector x of k differences, subtract x[0], then multiply by the field inverse of its first nonzero component. If all are equal, the fingerprint is all zero. Equal fingerprints are exactly affine equivalence; for translation-only simply subtract x[0]; for a shared unmodified D use raw differences.

Thus every plaintext suffix class must be wholly contained in one ciphertext fingerprint class. For each scope separately, if sorted plaintext class occupancies are p1>=p2>=... and sorted ciphertext class occupancies c1>=c2>=..., every partial sum of the largest r plaintext classes is at most the sum of the largest r ciphertext classes. Proof: the r largest plaintext classes fit in at most r distinct ciphertext classes. This necessary condition is stronger than only a collision-pair or largest-bin bound; it is not sufficient for bin packing. The theorem allows arbitrary deterministic (even nonbijective) Q and uses no numerical key fitting.

## Executed original-input test

Read all original 12,956 runes, 2,896 complete printed words and 32 cross-page carries. Validate rune-by-rune against the canonical physical corpus; physical p50 is explicitly runeless. For chapter/page scopes omit words crossing pages, granting the hypothesis extra freedom. Source-native GP encoder retains ING and IO contracts, checks four independent solved spellings. Draw 64 seeded original-length-profile controls with replacement from each of the pinned Shakespeare, Gibran and Emerson occurrence pools (192 total; seed330104); each word has the exact GP length of its corresponding original slot. Evaluate all k=2..6 for each fixed model. These are finite native-word controls, not independent full-passage observations or a p-value.

Number of controls passing every necessary condition (each entry out of 192):

| Arbitrary Q scope | Key effect on D | m=1 | m=2 | m=3 | m=4 | m=5 | m=6 |
|---|---|---:|---:|---:|---:|---:|---:|
| Global | none |0|0|0|0|0|0|
| Global | private translation |0|0|0|0|0|0|
| Global | private affine |0|0|0|0|0|0|
| Global × word length | private affine |0|0|0|0|0|0|
| Chapter × word length | private affine |0|0|0|0|1|12|
| Page × word length | none |0|0|0|0|6|21|
| Page × word length | private translation |0|0|0|1|9|24|
| Page × word length | private affine |0|0|1|12|24|43|

For example, in the globally shared unmodified m=1,k=2 case the maximum original difference-suffix class is 10, versus minima of 68,126,118 across the 64 native controls for the respective donors. More permissive word-affine cases require the full majorization test rather than interpreting raw class maxima as plaintext counts. All six source-native positive plants (one each m=1..6) use independently generated arbitrary row permutations per page × word length, and independently randomized private nonzero a and b per word. Exact inverse recovers 12,956/12,956 runes in each (initial m plaintext runes supplied), and every suffix-majorization test passes. This checks the implementation and the theorem's broad valid case, not blind key recovery. Executed against the live repository original inputs in the connected JS runtime; Windows SFT is committed, no CI run is claimed.

[Reproducer](../sims/lp2_differential_history_affine_suffix_sft.cjs). It prints all 108 scope/mode/history configurations, their original collision/max-class bounds for all k, survivor counts by donor and positive plant counts.

## Decision

Do not enumerate nonlinear differential bigram/trigram row maps or add arbitrary per-word affine keys to rescue them. The stationary global Q family through m=6 and even the page × word-length private affine model through m=2 are finite-control negatives. The exact source still allows different plaintext registers, variable boundaries, history-dependent non-affine word effects, or longer memory. Longer page-private histories are weakly constrained and likely require substantial independently recoverable key/state material; a source-selected state transition would be more informative than fitting those arbitrary maps. No unknown LP2 rune, authentic key, mechanism or destination has been recovered.
