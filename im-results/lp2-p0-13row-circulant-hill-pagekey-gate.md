# p0 55×13 page-key matrix: per-page circulant Hill gate

## Question

Can the 715-symbol opening payload be read as 55 per-page 13-symbol keys, with each row defining a 13×13 circulant Hill matrix for the corresponding LP2 page?

This is a bounded extension of the source-derived p0 partition:

- p0 has a 13-rune red title and a 13-dot boundary mark.
- The first black rune is TH (GP29 index 2).
- Removing that one sentinel from the p0–p2 opening stream after the title leaves 715 symbols = 55 × 13.
- The 55 rows can be paired, in order, with the 55 pages p1–p55.

The source does not explicitly say that rows are page keys or that a row defines a circulant matrix. The p15 4×4 Hill analysis shows that Hill operations are within the manuscript's demonstrated mathematical vocabulary, but it does not establish this 13×13 construction. This test asks whether that simple construction has a plaintext receiver.

## Frozen receiver

For each key row `k`, construct one of the two standard 13×13 circulant orientations:

```
M[i,j] = k[(j - i) mod 13]
M[i,j] = k[(j + i) mod 13]
```

Treat each page p(i+1) as 13-symbol column-vector blocks and decrypt each complete block with:

```
P = inverse(M) * C (mod 29)
```

Map key row 0 to p1, ..., key row 54 to p55. Decrypt complete 13-symbol blocks only; leave a page's final incomplete block untouched rather than inventing padding. Skip p50, which is the numeric table and has no rune ciphertext in the canonical corpus.

No row-specific parameter, matrix search, padding search, or language-model fitting is performed. A native GP29 trigram model (excluding the solved p56/p57 sections) is used only to score the resulting pages.

## Result

**Outcome: rejected.**

| Measurement | Right-shift circulant | Left-shift circulant |
|---|---:|---:|
| Text pages scored | 54 | 54 |
| Invertible key matrices | 54 | 54 |
| Singular key matrices | 0 | 0 |
| Median decoded trigram score | -3.5414 | -3.5452 |
| Median raw trigram score | -3.5483 | -3.5483 |

The native GP29 control median is -1.8161. The best decoded page is p38 under the left-shift orientation, at -3.4414; its output remains non-prose. The median score changes are only +0.0069 and +0.0031 over raw ciphertext, respectively. Neither orientation produces a native-language page.

**Decision:** the 55×13 rows do not act as per-page 13×13 circulant Hill keys under either standard cyclic orientation. This rejects this specific receiver, not every possible use of the 55×13 partition.

## Reproduction

Run from the repository root:

```sh
node sims/lp2_p0_13row_circulant_hill_pagekey_gate.cjs
```

The script asserts the 13 + 1 + 715 source partition, constructs the two circulant orientations over GP29, decrypts the 54 rune-bearing pages, and prints page scores and leading outputs. The calculation was executed in the connected JavaScript runtime against the repository corpus; no CI run is claimed.

## Relation to existing work

The [p0 13×55 matrix gate](../sims/lp2_p0_13x55_matrix_gate.cjs) tests row/column OTP and per-page Vigenere/keyed-alphabet receivers. The [p15 Hill4 transfer gate](lp2-p0-red13-body716-p15-hill4-gate.md) tests a different 4×4 key source and block size. This report tests the distinct possibility that each 13-symbol row is itself a compact key for a circulant 13×13 Hill matrix.

The row-to-page mapping and circulant construction remain hypotheses, not source-established mechanisms. No nonlinear or more elaborate matrix family is justified by this negative result alone.

## 2026-11-26: exact shared affine correction (Agent 7)

A single secret 13-rune output offset is a low-parameter extension of the fixed page-key Hill model. For every page, decode complete blocks as `P = M_page^-1 C - b (mod 29)`; the same unknown vector b and the same orientation apply across every page. No individual page offsets or row reordering. Exclude p0–2 as key material, fit p3–39 (8736 runes), hold out p40–55 (3224 runes; p50 has no rune ciphertext). The remaining 267 trailing runes on these 52 text pages are outside the block model. Bigram likelihood uses 2296 native runes in five sections, with add-0.5 smoothing and a uniform key prior. Four native sections are withheld from model construction.

Because every transition depends only on adjacent coordinates of b modulo 13, condition on b[0] and compute exact cyclic max-product and log-sum-exp, covering all 29^13 offsets for each of two orientations. Compare the marginal to iid uniform runes; posterior predictive log Bayes factors are full-data log marginal minus fit log marginal. Fit-only MAP replay is exact for every held original block.

| Receiver / data | Fit log BF | Predictive log BF | Held recovery |
|---|---:|---:|---:|
| Original right-shift | -4673.239 | -1922.217 | no coherent text |
| Original left-shift | -4702.896 | -1904.342 | no coherent text |
| Original orientation mixture | -4673.932 | -1922.217 | no coherent text |
| Native plant, right-shift | +145.708 | +242.269 | 338/338 |
| Native plant, left-shift | +145.708 | +242.269 | 338/338 |
| Matched-layout synthetic Markov plant, correct orientation | +6000.716 | +2184.815 | 3224/3224 |
| Matched-layout uniform null, orientation mixture | -4690.845 | -1819.304 | n/a |

The native plants use the same 663 independent-of-model native runes under different keys/orientations, so they are two cipher controls, not independent text samples. The synthetic control is generated from the fitted language model and calibrates the computation, not generalization. Both native plants and the synthetic plant recover the exact key from fit only. Original candidates remain non-prose; the original predictive marginal is worse than the single uniform null. Retire this shared-offset extension under the specified likelihood, not arbitrary matrix/offset schedules.

**Incidental structural observation:** the previously excluded p50 row is the only singular circulant among all 55 rows. Its indices are [20,11,11,5,20,7,28,23,1,23,12,28,14], sum zero modulo 29, rank 12, with all-ones null vector. All 54 rune-bearing-page rows have full rank and nonzero sum. This was discovered when the initial implementation inadvertently tried to invert p50; the receiver correctly skips it. The correspondence is interesting but post-hoc and does not establish the page mapping or a plaintext operation. Under exchangeable row labels conditional on exactly one singular row the chance of p50 is 1/55, without any correction for other searched structures. Do not promote it to a solved key or combine it with unrelated numerology.

Reproducer: `sims/agent7_p0_page_hill_shared_affine_sft.cjs`; results: `im-results/agent7-p0-page-hill-shared-affine.json`. Core executed in the connected V8 runtime on pinned corpus/native blobs, not standalone Node or CI. The rank observation was calculated separately by GF29 Gaussian elimination on all 55 rows.

## 2026-11-26: exact eight-symbol row receivers and p50 column-sum gate (Agent 7)

A natural consequence of the 13-rune key width is fixed 8-byte BASE29 integer packing (29^13 fits in 64 bits). The physical p50 panel is itself 13×8, permitting a second typed transformation: each 13-symbol row multiplies that panel to produce an eight-symbol key. These test the p1–55 mapping on the original unknown text, extending the older representative-page raw-rune key tests and distinct from its p3–57 matrix product known-page gate. Both valid panel alphabets (base60 and omitted-f base59) are included. The row50 rank exception selects no arithmetic operation by itself.

Four frozen banks: packed big-endian and little-endian bytes reduced mod29; row times physical p50 13×8 panel reduced mod29 under each radix. Each page starts at phase zero, both additive signs, ordinary consumption or authentic plaintext-F bypass. The latter is an exact DP over phase and previous plaintext: literal plaintext F yields C=F with no phase advance; a consuming branch may yield C=F from non-F plaintext, but cannot emit plaintext F. Bigram max-product chooses the best legal path without word assumptions; reachability failure requires no language model. All legal readouts replay the original exactly.

Across p3–55 (52 rune-bearing pages, 12227 runes), all eight ordinary variants are nonprose with mean log likelihood ratios vs iid uniform between -0.631 and -0.598 nats/rune. Under F holds, each fixed bank/sign has 48–52 impossible pages; a maximum of four pages retain any legal inverse. Surviving paths are nonprose. All 16 control configurations have complete legal paths; 14 recover all 683 held native runes, one 678/683 and one 681/683 because of intrinsic F ambiguity. The same native sample is reused across configurations. No key fitting was used. Retire these fixed typed receivers, not arbitrary q8 schedules.

The zero-sum row50 circulant has image equal to the zero-sum subspace, so if p50's physical 13×8 array were direct encrypted columns every column would sum to zero mod29. Observed base60 sums [28,26,24,16,0,24,7,20], base59 [23,25,26,21,2,1,11,20]; both direct interpretations are impossible. Row sums also do not act as direct page ciphertext-sum checks (only p23/p50 match) or rune-count checks (only p50). This leaves the rank exception as a weak, retrospective mapping clue, not a decoded panel.

Reproducer: `sims/agent7_p0_page_rows_q8_receivers_sft.cjs`; output: `im-results/agent7-p0-page-rows-q8-receivers.json`. Core executed in V8 on the pinned source, no standalone CI. No unknown plaintext or authentic key recovered.

## 26 November: zero-eigenvalue scalar receiver (Agent 8)

The sole p50 singularity is specifically the zero **constant-mode eigenvalue**, so a separate direct receiver treats each row sum `a_p` as a scalar field multiplier rather than reusing the 13×13 Hill blocks. This supplies an inverse for all 54 rune-bearing page rows, while zero makes the p50 plaintext unrecoverable. The observed adjacency suppression independently motivates testing a first-order ciphertext-feedback term; neither feedback nor this scalar receiver is authenticated by the source.

For each page p3–55 (skip p50 and reserve p0–2 as key material), test
```
C_i = a_p * (g*P_i+b) + k*C_(i-1) mod29
P_i = g^-1 * (a_p^-1*(C_i-k*C_(i-1))-b) mod29
```
with shared k,b in GF29 and g nonzero (23,548 distinct tuples). Use first ciphertext rune as public IV per page, no printed-group assumptions. Exact shared-key search uses the pooled residual bigram histogram and a fixed add-0.5 smoothed native Markov model. Fit p3–39, freeze for p40–55; these are familiar manuscript ranges, not fresh independent manuscript holdouts.

| Result | Fit | Frozen continuation |
|---|---:|---:|
| Original, k=1,g=18,b=7 | −5097.578 / 8874 runes | −2007.521 / 3301 runes (−0.608155 per rune) |
| Three affine plants | 3/3 exact keys | 1008/1008 withheld runes (+0.709042 per rune each) |

Scores are log likelihood ratios against iid uniform GP29. Plants share the same four held solved sections but change keys, page allocation and IVs; they are three cipher controls, not three independent texts. All 3301 original held symbols re-encrypt exactly but decoded text is incoherent. The full original maximizer is unchanged. Even replacing the affine map by an arbitrary common bijection cannot produce more than 946 occurrences of its two most frequent plaintext symbols among 12175 original residuals over all 29 feedback coefficients (7.77%); relaxing to a different arbitrary bijection per page gives at most 1455 (11.95%). The nine pinned native solved sections individually have top-two fractions 17.83–28.24%; this is a finite-control comparison, not a universal linguistic bound.

**Exact transparent-F extension.** Replace `g*P+b` by any shared GP29 bijection S, and let plaintext F emit literal ciphertext F=0. Enumerate all 841 pairs (k,S(0)) and all possible incoming feedback states independently for each page. Permit an ordinary ciphertext zero only when the residual differs from S(0); handle both F semantics (hold previous consuming ciphertext, or update the feedback to zero). A 29-state Boolean reachability calculation keeps every valid inverse path; no language score or guessed plaintext. Both conventions reject 840/841 pairs on original p3 alone. Their sole survivor is k=0,S(0)=0, for which every rune is exactly a static page-scaled substitution with no remaining F ambiguity. On p3–55 this survivor permits only 891/12175 pooled top-two occurrences (7.32%), or 1374/12175 (11.29%) with page-private alphabet relaxation. Six planted arbitrary-permutation controls (three k values, both conventions, same 683 source runes) retain every true pair; each has 5–6 surviving pairs, so the feasibility gate does not claim key identification.

**Decision:** retire the source-row-sum scalar receiver with stationary ciphertext feedback, in the specified ordinary shared-affine and transparent-F arbitrary-shared-alphabet forms. The F-hold rejection is exact except for the static survivor, whose exclusion is conditional on the native frequency evidence. The rank/zero alignment itself remains unexplained; these tests do not establish or disprove page-key framing, time-varying feedback, arbitrary page-private offsets, or other representations. Do not tune the row sums into a new clock absent a source selector.

Reproducers: [ordinary exact key search](../sims/agent8_lp2_p0_page_row_sum_scalar_feedback_sft.cjs), [F-hold exact reachability](../sims/agent8_lp2_p0_page_row_sum_scalar_fhold_sft.cjs). Outputs: [ordinary](lp2-p0-page-row-sum-scalar-feedback-output.json), [F-hold including first-failure certificates](lp2-p0-page-row-sum-scalar-fhold-output.json). Both cores executed against pinned blobs `054f2a0f780b7d46901acbe3d9bf4f0ac1801165` (corpus) and `1b064ef6d85819b7d96adaff31a82d1ec551598f` (native solved register) in connected V8; standalone Node wrappers were not separately executed. No new workflow.
