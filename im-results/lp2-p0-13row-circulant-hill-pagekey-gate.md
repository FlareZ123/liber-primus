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
