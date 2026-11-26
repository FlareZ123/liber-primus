# Exact two-history native-source crib receiver

**Agent 8, 26 November 2026. Classification: constructive known-source offset and partial key recovery; original finite-donor exclusion.** No unknown LP2 plaintext or authentic key recovered.

## Distinct receiver

The prior [all-secret two-history collision study](lp2-two-ciphertext-history-allsecret-collision-gate.md) used planted collision rates; the [dictionary study](lp2-secondhistory-original-dictionary-equality-gate.md) propagated individual word candidates and left millions of possibilities. Neither established an exact contiguous-source inverse. This receiver tests literal contiguous native-GP source excerpts without printed word boundaries. It allows independent keys for each original illustration chapter and two unconstrained IV runes per physical page.

For every other rune, let s=(C[i-2],C[i-1]), and C[i]=S_s(P[i]), where S_s is an arbitrary permutation of 29 labels. An affine subclass permits arbitrary independent nonzero slopes and offsets per state. These are hypothetical ciphers, not source-selected Cicada operations.

For an alignment of a candidate donor tape, every equal ciphertext triple forces equality of the corresponding plaintext symbols. Every two distinct successors of a common predecessor state force inequality. These constraints are necessary **and sufficient** for the existence of a full arbitrary permutation table: the observed partial bijection can always be completed. For affine rows, choose two distinct observed successors c0,c1, with putative plaintexts p0,p1. For each additional pair (c,p), require (p-p0)(c1-c0)=(p1-p0)(c-c0) mod29. Together with inequalities, this is necessary and sufficient for the row to extend to an invertible affine map. No guessed key, score threshold, or alphabet enumeration is required.

Fit on the first floor(2n/3) runes of a chapter, then freeze the observed inverse rows. Check the remaining third for exact compatibility, separately counting predictions actually made by the frozen inverse (unobserved mappings are not predictions). For affine rows, two distinct observations specify the entire row. All feasible offsets are counted; previews are merely examples and not inferred plaintext. Native normalization follows the previous scalar-capacity study: QU→CW, V→U, K/Q→C, Z→S, ING→NG, IO→IA, longest GP tokenization within words. Files include their existing repository framing and are pinned by blob SHA in the output.

## Hidden-key controls

Both p40–53-sized (3,008 rune) controls use source excerpts with unknown offsets and independent hidden row keys, plus random page IVs. The receiver searches all 59,485 Gibran offsets; it is never supplied the truth offset or key.

| Model | True offset | Training survivors | Full survivors | Correct frozen predictions / 993 eligible suffix positions |
|---|---:|---:|---:|---:|
| Arbitrary permutations | 4,013 | 1 | 1 | 152/152 (15.3% coverage) |
| Affine rows | 12,029 | 1 | 1 | 675/675 (68.0% coverage) |

The sender's actual hidden-key inverse was independently checked at every encoded position. These controls recover source alignment and the observed part of the secret key; they do not establish generic blind decryption without a donor.

## Original results

All contiguous chapter-length windows across the pinned Gibran, Shakespeare, Emerson and Blake tapes were searched. No interchapter shared table, common donor or global source alignment was required. This is 5,375,552 distinct chapter/donor offsets, or 10,751,104 model-offset tests counting both families.

| Physical chapter | Runes | Distinct offsets | Arbitrary full fits | Affine full fits |
|---|---:|---:|---:|---:|
| p0–2 |729|600,014|0|0|
| p3–7 |1,145|598,350|0|0|
| p8–14 |1,729|596,014|0|0|
| p15–22 |1,903|595,318|0|0|
| p23–26 |1,021|598,846|0|0|
| p27–32 |1,433|597,198|0|0|
| p33–39 |1,680|596,210|0|0|
| p40–53 |3,008|591,904|0|0|
| p54–55 |308|601,698|588|0|

For the first eight chapters, even training-only compatibility is zero under both families. For p54–55, 169,192 offsets pass training in each family, but only 588 arbitrary-permutation offsets survive the full tape. Every surviving example predicts at most **one** of 101 eligible held-out positions; the other compatible positions rely on unobserved map entries. The affine extension rejects all 588. The short final chapter is therefore nonidentifying under arbitrary rows and none of its candidate excerpts qualifies as recovered plaintext.

**Decision:** retire exact *chapter-length* quotation from these four pinned source registers under the two-history row families. Independently embedded shorter quotes, new prose, F-transparent or non-consuming clocks, alternative transcription, and changing row maps remain outside this test. Do not retry a dictionary search for unconstrained predecessor rows on the strength of the short-chapter matches.

[Standalone Node/CommonJS receiver](../sims/lp2_twohistory_native_crib_receiver_sft.cjs) · [complete machine output and source blobs](lp2-twohistory-native-crib-receiver-output.json). Experiment core executed in connected V8; standalone Node wrapper not separately run; no CI claim.

## Embedded 650-rune passages: complete original-window search

A chapter may include an embedded quote without being a chapter-length quotation. Therefore a second receiver searches **every** 650-rune original interval within the eight chapters long enough to contain one, using actual physical-page resets and the original preceding ciphertext state even at an excerpt boundary. Every donor start in the same four pinned registers is allowed. The 450-rune prefix supplies all training constraints; the last 200 are withheld for predictive coverage. For each prefix with a repeated triple, index the rarest required donor equality distance and enumerate only donor offsets satisfying that exact necessary condition. For prefixes with no repeated triple, affine constraints are checked directly at every donor offset. This avoids arbitrary language-score cutoffs and is exact for the stated models.

Two independently planted 650-rune controls recover their source offset uniquely: arbitrary rows at 10,080 (7/7 frozen held-out predictions), affine rows at 22,220 (24/24). Both have 200 eligible held-out positions; unobserved row entries are not counted as predictions.

There are **7,456** original 650-rune intervals, of which **7,269** have a prefix equality anchor and **187** do not. Across four donors, the indexed prefix sweep examines 265,432,799 equality-anchored offsets and 112,261,710 direct affine offsets. Exactly 37,779 arbitrary-model training alignments survive, and zero survive the full interval; zero affine training alignments survive. For the remaining 187 unanchored arbitrary-model intervals, all have a full-window equality anchor. A separate exact full-window scan covers 112,261,710 possible alignments, enumerates 6,817,335 anchor-compatible offsets and finds zero full matches. This final scan uses the entire window for candidate selection and does not claim withheld validation.

Thus **no 650-rune or longer contiguous quote** from any of these four pinned registers can occur entirely within any original chapter under either stationary predecessor-row family and the stated native encoding. A longer exact quote would contain a 650-rune subinterval. This is not an exclusion of shorter quotations, new prose, nonlinear clocks, F holds or arbitrary row models with other plaintexts.

[Embedded receiver](../sims/lp2_twohistory_embedded_source_receiver_sft.cjs) · [output](lp2-twohistory-embedded-source-output.json) · [unanchored receiver](../sims/lp2_twohistory_unanchored_source_receiver_sft.cjs) · [output](lp2-twohistory-unanchored-source-output.json). Both experiment cores executed in connected V8; no standalone Node or CI claim.

## Short final chapter: exact cross-book posterior over arbitrary row completions

The 588 compatible source offsets in p54–55 represent 581 distinct effective partial keys. Instead of claiming one of them from text appearance, use its 303 fixed inverse entries to predict **independent earlier ciphertext** under the additional hypothesis that a single stationary set of 841 arbitrary permutations is shared book-wide. This is an actual source-key selector conditional on that family.

Fix a GP29 native-frequency prior from Gibran and Emerson with add-one smoothing. For each ciphertext row, let n_c count held-out successor c and K be the fixed inverse entries from a candidate tail. Under the explicit model of iid GP letters with frequencies f and uniformly random independent row permutations, the exact marginal likelihood is

    L(row | K) = product_{c in K} f[K(c)]^n_c
                 * mean_{bijections of remaining labels} product_{c not in K} f[P(c)]^n_c.

Group unobserved ciphertext labels by equal count r. Assign remaining plaintext labels to count groups of sizes m_r using a coefficient DP, weighting assignment of label p to group r by f[p]^r. Zero-count slots are the implicit final group. Divide the coefficient by the multinomial number of partitions. This integrates **all** compatible row completions, not a frequency-ranked heuristic or independent redraw per ciphertext occurrence. A 24-completion direct sum regression agrees within 1e-10. The code uses weights 29*f for numerical scaling.

Score p0–32 as discovery, and p33–53 as validation using the exact difference log L(p0–53 | K) − log L(p0–32 | K), subtracting the equivalent unconditional row marginal. This difference conditions the validation on discovery ciphertext while preserving shared unknown row entries. The score is exact only under its stated iid-letter/random-table prior; authentic natural-language dependencies and deterministic authored keys may differ.

### Six matched-profile blind controls

Each synthetic book has the exact original physical page lengths, one unknown shared random row table, Shakespeare prose in p0–53, and a literal independent donor excerpt in p54–55. Tail ciphertext is conditioned solely on the original low-information profile: one repeated triple and 50–76 different-successor pair constraints (original 63). No rank-based control selection. The receiver enumerates every source offset before scoring. Pre-fixed gate: at least 5/6 true keys in discovery top five and at least 4/6 true keys ranked first on combined evidence.

| Source | Candidate partial keys | True discovery log BF | True conditional validation log BF | True total log BF | Frozen correct earlier runes |
|---|---:|---:|---:|---:|---:|
| Gibran 4,013 |1,277|25.125|27.276|52.400|281/281|
| Shakespeare 38,000 |1,296|43.872|23.507|67.379|294/294|
| Emerson 17,000 |1,356|48.164|19.447|67.611|303/303|
| Blake 500 |1,094|42.914|30.664|73.579|307/307|
| Gibran 20,000 |723|16.439|23.769|40.208|292/292|
| Emerson 80,000 |591|59.938|14.616|74.554|297/297|

True source/partial key ranks **1/1/1 for discovery, conditional validation and combined score on all six controls**, passing the gate. This actually recovers the complete planted tail source alignment and every observed tail inverse entry and predicts 281–307 previously unseen earlier runes per control; it does not recover full arbitrary tables.

### Original: calibrated selector fails decisively

Original p54–55: 601,698 candidate source offsets, 588 exact compatible offsets, 581 distinct partial keys. The strongest discovery candidate (Shakespeare offset 165,718) has log BF −15.084, validation −26.086, combined −41.170; it ranks 465th in validation and 12th combined. The strongest combined candidate (Shakespeare offset 109,927) has discovery −28.927, validation −4.892, combined −33.819, and ranks 73rd in discovery. **Even the maximum combined evidence is negative**; all six true controls are positive +40.208 to +74.554 and predict independent runes. Original frozen maps cover only 165 of 12,542 eligible earlier runes, with nine multi-rune runs, compared to 281–307 covered in controls. None of the short fragments establishes coherent source plaintext.

The unconditional whole-pre-tail native-iid random-table model log likelihood relative to uniform-GP output is **−624.879** on original versus **+796.189 to +848.287** on the matched controls. This supplies a calibrated model failure, not an algebraic all-key exclusion for deterministic authored tables or arbitrary non-iid plaintext.

**Decision:** no surviving short-tail source candidate supports a globally shared stationary arbitrary two-history decoder under this calibrated independent-evidence receiver. Retire this particular source reuse/shared-table branch; do not promote the best negative score or try arbitrary source offsets again. Chapter-private keys, other source material, different state laws and non-iid structures remain outside this test.

[Exact posterior receiver](../sims/lp2_twohistory_tail_exact_row_posterior_sft.cjs) · [complete raw output, seeds, scores and partial prediction positions](lp2-twohistory-tail-exact-row-posterior-output.json). Code core executed in connected V8; standalone Node wrapper not separately run; no CI claim.
