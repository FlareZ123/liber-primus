# Arbitrary differential plaintext-history cipher with word-private affine keys: exact original suffix bound

**Agent4, 24 November 2026.** Original-cipher constraint, not recovered plaintext. An unrestricted stationary nonlinear context table, independently selected per physical page and word length, cannot produce the tested native GP prose for history lengths 1 or 2 even if every complete printed word gets its own arbitrary invertible affine transformation of the emitted increments. Shared global tables fail all six tested memory lengths. Longer page-private histories remain open; passing a necessary condition does not establish their plausibility. The spacing-free extension below gives exact all-secret boundaries for differential history with historical phase clocks and constructively shows six incompatible full-book English inverses in a more permissive model, demonstrating its non-identifiability.

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


## Spacing-free differential history: exact feasibility and constructive non-identifiability

**Agent19, 24 November 2026, Director #2273.** This extension removes the preceding experiment's reliance on intact printed words. It is distinct from the earlier [direct-output history feasibility test](lp2-plaintext-history-determinism-collision-gate.md) because the observable is the running GP29 difference, rather than the printed rune. It does not extend the private word-affine theorem to arbitrary word resets: the hidden table and its phase are stationary over each physical page, irrespective of the spaces, line breaks or any alternative segmentation.

Consider the full inverse family
```
D[p,i] = (C[p,i] - C[p,i-1]) mod 29
D[p,i] = Q[p, i mod q, P[p,i-m:i]](P[p,i]), i >= m >= 1
```
where every Q row is an arbitrary GP29 permutation, independently keyed per original physical page, phase and recovered plaintext history. Grant the first m plaintext and ciphertext runes of every page freely. The no-repeat anomaly makes the differential receiver interesting, and historical Vigenère lengths 8 and 13 and the GP29 alphabet motivate the phase probes; no first-party instruction selects this history model or any q. A necessary and sufficient condition for **a specified proposed full plaintext** to admit a key in this family is that each observed row's partial map P_i→D_i be a well-defined injection. Repeated row inputs must have identical outputs, and distinct row inputs cannot have identical outputs. Every finite partial injection on the 29 symbols extends to a permutation, so the test is exact for all secret tables. Arbitrary unused rows can be assigned identity permutations.

As an immediately visible constraint, the 55 original pages (12,956 runes) have the following unordered collision-pair counts for page-internal GP29 difference windows. Global pools all page-contained windows but does not cross a physical page seam.

| Difference window length | Same physical page | Global |
|---:|---:|---:|
| 3 | 57 | 3,558 |
| 4 | 1 | 100 |
| 5 | 0 | 3 |
| 6 | 0 | 0 |

For any repeated plaintext (m+k)-gram in the same page and phase, the corresponding k-gram of differences must repeat. The full forward/injective consistency test is stronger than merely comparing these counts.

Reuse the frozen historical-spelling calibration and 6,478-rune stride from the previous direct-output study. Encode the three pinned literary sources using GP source-native ING/IO, QU→CW, V→U, K/Q→C, Z→S and chart digraphs. Overlay original physical page lengths onto each 12,956-rune contiguous control, **without preserving printed word boundaries**. There are 8 Gibran, 32 Shakespeare and 48 Emerson windows (88 total; overlapping finite controls, not independent samples or p-values). Exact feasibility yields:

| Phase q | Plaintext memory m | Gibran admissible / 8 | Shakespeare / 32 | Emerson / 48 |
|---:|---:|---:|---:|---:|
| 1 | 8 | 0 | 0 | 0 |
| 1 | 9 | 0 | 0 | 1 |
| 8 | 5 | 0 | 0 | 0 |
| 8 | 6 | 0 | 0 | 1 |
| 13 | 4 | 0 | 0 | 0 |
| 13 | 5 | 0 | 0 | 1 |
| 13 | 7 | 1 | 0 | 5 |
| 29 | 3 | 0 | 0 | 0 |
| 29 | 4 | 0 | 0 | 1 |

At a fixed q, longer history can simulate any shorter history by ignoring earlier state. Therefore the complete finite donor family excludes stationary memory up to 8 at q=1, 5 at q=8, 4 at q=13 and 3 at q=29. The minimum number of contradictory forward assignments at those respective boundary histories, over all 88 controls, is 6, 2, 1 and 3. For q=8,m=6, a second Emerson control passes forward consistency but fails injectivity. These are candidate-plaintext exclusions, not an impossibility proof for all English or all changing-state architectures.

**Constructive original-cipher ambiguity, not recovered plaintext.** At the same fixed q=13,m=7, six distinct ordinary contiguous English passages admit the *exact same original LP2 ciphertext* under different keys. Construct each sparse page-specific table directly from its donor and original D; extend each observed partial injection by filling unused inputs with unused outputs in increasing GP order. Decode from the supplied seven-rune page primers, using only the completed table and original ciphertext after the primer, then forward re-encrypt. All six recover their chosen 12,956-rune donors and replay all 12,956 unchanged original ciphertext runes. This is an intentionally retrospective construction using known donor plaintext, not a blind prediction.

| Donor | GP-rune start offset | Occupied rows | Single-assignment rows | log2 completions of observed rows alone |
|---|---:|---:|---:|---:|
| Gibran | 6478 | 12569 | 12567 | 1231050.982 |
| Emerson | 12956 | 12569 | 12567 | 1231050.982 |
| Emerson | 90692 | 12568 | 12565 | 1230948.230 |
| Emerson | 142516 | 12571 | 12571 | 1231256.485 |
| Emerson | 194340 | 12571 | 12571 | 1231256.485 |
| Emerson | 233208 | 12568 | 12565 | 1230948.230 |

Each fit constrains exactly 12,571 row entries (one for each nonprimer rune), and nearly every occupied row is visited only once. A row with r assigned entries has (29-r)! completions. Multiplying across observed rows alone leaves **more than 2^1,230,948** key completions for each chosen donor, without counting unused rows or free primers. The six constructed keys are fully reproducible from the supplied offsets and source fixtures; no need to store huge sparse tables. A model of this flexibility can return authentic-looking English and exact reencryption while offering essentially no independent information about the true plaintext. Page-private tables also lack any learned mapping transfer to independent physical pages.

For an actual reversible native-source positive, generate random nonlinear row permutations and encrypt each of the nine solved GP29 sections independently. At (q,m)=(1,8),(8,5),(13,4),(29,3),(13,7), each family decodes and replays all **2,979/2,979** native solved runes; the partial-map fitter also reconstructs a completing inverse when given these known native words. This checks the mathematics and implementation; it is not a blind key recovery.

[Standalone CommonJS reproducer](../sims/lp2_spacingfree_differential_history_nonidentifiability_sft.cjs). Exact run function executed in connected V8 against the current checked-in original and control data; no Windows CI result claimed. Source blobs: LP2 `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, solved native `1b064ef6d85819b7d96adaff31a82d1ec551598f`, Gibran `df260a07d56bf5998d40a6360b6132c35c252d10`, Shakespeare `94c677ad9dd50771c6670e0c4e4dad9052b46d85`, Emerson `a92be8ba5b3511a003a22ba31523c14397aaa83a`.

**Causal decision:** do not spend effort optimizing increasingly deep arbitrary context rows, even if they produce readable whole-book candidates. A genuine source-selected compact generator, independent key material, or a testable cross-page state evolution is a prerequisite. The #2273 constrained-sequence question remains open for such an operation. No unknown LP2 plaintext, authentic key, or destination was recovered.
