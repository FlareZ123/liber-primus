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
