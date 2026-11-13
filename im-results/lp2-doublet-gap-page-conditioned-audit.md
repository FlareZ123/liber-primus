# Audit of Round-44 doublet-gap autocorrelation: real anomaly, unsupported drift interpretation

**Decision:** the external Round-44 T7 statistic is a genuine global spacing anomaly under a page-aware uniform-site null, but it does **not** establish a smoothly varying anti-repeat slip rate. With 86 sites sampled uniformly from the 12,901 valid within-page adjacency slots, excluding page joins and conditioning on the observed minimum gap of 6, the exact log-space spacing sampler gives upper-tail p=0.00041 and absolute two-sided p=0.00042. Thus T7 survives a page-aware global null.

The causal interpretation is weaker. The observed 1,000-rune block-count series has **negative** lag-1 autocorrelation (-0.190), not smooth positive drift. Of the 84 consecutive gap-pairs, only 21 are wholly within a page; their autocorrelation is -0.049. A sensitivity null preserving page lengths, per-page site counts, and minimum gap 6 gives centered two-sided p=0.0172, above the external preregistered familywise threshold 0.00143; preserving each page's first/last site positions as well raises it to 0.163. The remaining anomaly is concentrated in the joint arrangement of page-local site counts and page-edge positions, not demonstrated within-page rate drift.

This is an intermediate structural finding, not plaintext or key recovery. Retain T7 as an unresolved anomaly; do not promote the "smoothly varying slip rate" explanation without a source-selected mechanism and page-aware positive controls.

## 1. External claim and exact reproduction

Dukotah's Round 44 (2026-11-09 to 11) reported 86 equal-adjacent sites in the 12,956-rune unsolved stream, 85 inter-site gaps, Pearson lag-1 gap autocorrelation +0.3800196892, and a global site-matched-shuffle p=0.0010. An independent 20,000-draw permutation of the gap sequence gave p=0.00025. The report interpreted this as a smoothly varying slip rate and nominated it as the main Round 45 lane.

Using this repository's page-indexed corpus, independently extracting equal adjacent runes reproduces the exact 86-site census and +0.380019689241 autocorrelation. The unsolved stream is 55 nonempty LP2 pages (physical pages 0–49 and 51–55; page 50 is runeless), 12,956 runes, 86 sites, and 85 gaps. The minimum observed inter-site gap is 6.

## 2. Where the autocorrelation lives

Of the 85 gaps, **41 cross a page boundary**. The 84 adjacent gap-pairs divide as follows:

| Pair type | Count | Pearson correlation |
|---|---:|---:|
| Both gaps within the same page (WW) | 21 | -0.0494 |
| Within-page, then cross-page (WX) | 23 | +0.1260 |
| Cross-page, then within-page (XW) | 22 | +0.0682 |
| Both gaps cross page boundaries (XX) | 18 | +0.4231 |

The 18 XX pairs correspond to the 18 interior pages with exactly one doublet site; 19 pages have one site in total, with the last one-site page at the end of the site-bearing sequence. The full +0.380 signal is strongly influenced by gaps that bridge page boundaries and pages containing a single site.

The per-page site-count distribution is 13 pages with 0 sites, 19 with 1, 10 with 2, 8 with 3, 2 with 4, and 3 with 5. The page-count lag-1 correlation is only +0.124.

The external report's descriptive 1,000-rune block counts reproduce as:

[8, 3, 7, 2, 6, 9, 10, 8, 11, 2, 9, 6, 5]

Their lag-1 correlation is **-0.1900**, not positive. Under both global and page-conditioned simulations, that block-count autocorrelation is ordinary (upper-tail p≈0.64 and p≈0.50 respectively). This does not support the report's description of smoothly adjacent doublet-rich and doublet-poor regions.

## 3. Global page-aware uniform-site null

There are 12,901 possible within-page adjacent-rune positions across the 55 pages. The global null samples 86 of these positions uniformly, with two constraints: page joins are not candidate positions, and inter-site spacing is at least the observed minimum of 6. A log-space dynamic program samples uniformly from all valid subsets; it does not use the external shuffle code.

Across 100,000 draws (seed 0x4d595df4), the gap-AC1 null mean is -0.0121, SD 0.1046, 95th percentile 0.1694, and 99th percentile 0.2516. The observed +0.3800 is beyond the 100,000-draw upper and absolute two-sided tails (p=0.00041 and 0.00042). The T7 nonuniform-spacing signal therefore survives page-join exclusion and conditioning on the observed minimum gap.

This is evidence against a globally uniform placement of doublet sites. It does not identify the cause: a non-stationary filter, page/layout-conditioned process, or another structured mechanism remain distinguishable hypotheses.

## 4. Page-conditioned sensitivity nulls

The following nulls ask a narrower question: after holding the page-level structure fixed, is there residual within-page gap ordering?

The reproducible script runs 100,000 accepted draws with fixed seed 0x6f6c6453. It preserves actual page lengths and per-page site counts, imposes minimum site separation 6, and rejects cross-page gaps below 6.

| Null | Mean gap AC1 | SD | 95th percentile | Upper-tail p | Centered two-sided p |
|---|---:|---:|---:|---:|---:|
| Page lengths + per-page counts + min gap 6 | 0.2404 | 0.0605 | 0.3380 | 0.0086 | 0.0172 |
| Above, also preserve each page's first and last site | 0.3464 | 0.0251 | 0.3843 | 0.0816 | 0.1631 |

The first conditional result is above the external preregistered Bonferroni threshold 0.01/7 = 0.0014286. The second shows that once the observed page-edge sites are held fixed, the remaining within-page placement does not produce an unusual global gap autocorrelation. This second null is deliberately conditional and is a sensitivity diagnosis, not a universal model of the cipher.

A direct within-page-only statistic uses just the 21 consecutive gap-pairs whose three sites all lie on the same page; its observed correlation is -0.0494. No positive within-page serial structure is visible in this small sample.

## 5. Layout-boundary cross-check

The 86 equal-rune pairs were also re-counted from the page/line/word-marked transcription. Of these, 60 have no separator between the runes, 21 cross a printed word hyphen, 3 cross a line slash, 1 crosses a line slash plus word hyphen, and 1 crosses a period. The corresponding opportunity counts are 9,640 within-word transitions and 2,584 hyphen transitions; the event rates are 0.622% and 0.813%. This is a check of the repository's two derived representations, not an independent re-transcription of the JPEGs. It does not show an obvious word-boundary reset.

## 6. Research decision

- Retain T7 as a real global spacing anomaly; do not dismiss it as solely a page-boundary artifact.
- Do **not** interpret it as proof of a smoothly varying slip rate: the 1,000-rune block-count autocorrelation is negative, and within-page gap pairs show no positive serial structure.
- The unresolved discriminant is whether the joint page-local site-count / first-last-position arrangement is selected by the original artifact or is a consequence of a different generator. A follow-up should preregister a page-relative position test (including line/word layout) and a source-motivated positive plant.
- Do not run another global gap permutation or unconstrained filter-rate sweep; those repeat the existing statistic without identifying an operation or key.
- The doublet-site values, positions, and gaps remain unshown as plaintext or key material. No unknown plaintext, authentic key, or destination was recovered.

## Reproduction

From the repository root:

~~~sh
node sims/lp2_doublet_gap_page_conditioned_audit_sft.cjs
~~~

The script reads only:
- resources/liber-primus/lp2-corpus.json
- resources/lp2-transcription.txt

It verifies the 12,956/86/85 source counts, exact T7 autocorrelation, page-pair decomposition, global page-aware uniform null, both page-conditioned sensitivity nulls, block counts, and transcription-boundary counts.

## External source files audited

- Round 44 synthesis: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/SYNTHESIS.md
- B3 preregistration: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/PREREG.md
- B3 results: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md
- B3 implementation: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/b3lib.py
- Human-oracle queue note: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/ORACLE-T7-QUEUE.md
