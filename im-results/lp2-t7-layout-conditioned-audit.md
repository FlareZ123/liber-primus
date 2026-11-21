# LP2 repeated-rune gap autocorrelation: page/line-conditioned audit

**Status:** intermediate statistical audit. No plaintext, key, or cipher mechanism recovered.

## Question

Dukotah's Round44 W2-B3 analysis reports 86 adjacent-equal rune pairs in the 12,956-rune unsolved stream, with lag-1 Pearson autocorrelation \(r_1=+0.3800\) in the 85 inter-site gaps. Its global site-matched shuffle reports \(p=0.0010\) and treats the result as a possible localized change in the repeat-suppression or keystream process. T7-void and T7-mechanism remain open in that project's frontier.

The global null treats site positions as exchangeable over the flattened stream. This audit asks how much of the signal remains when the original manuscript's physical page and line partition is respected.

## Independent reproduction

Using only this repository's resources/liber-primus/lp2-corpus.json and lp2-transcription.txt:

- Concatenating physical pages 0–49 and 51–55 gives exactly **12,956 runes**.
- Recomputing adjacent equal values gives **86 sites**, with the exact same 86 positions as Dukotah's published real_sites_U86.
- The raw gap autocorrelation reproduces as **\(r_1=+0.3800196892\)**.
- The 86 sites fall between printed separators as follows: **60** with no separator, **21** across a word hyphen, **1** across a clause period, **4** across a line boundary, and **0** across a page boundary. This agrees with the external continuous-stream treatment; the separator split below is only a sensitivity analysis.

The local transcription maps the stream to **55 rune-bearing physical pages and 594 printed lines**. The four line-crossing site starts are positions 8195, 8308, 10507, and 11343.

## Layout-conditioned diagnostics

All Monte Carlo tests use 10,000 draws, deterministic xorshift32 streams, and a two-sided add-one p-value. The reproducer is sims/lp2_t7_layout_conditioned_null.cjs.

| Diagnostic null | What is held fixed | Null mean \(r_1\) | Null SD | Observed \(r_1\) | Two-sided \(p\) |
|---|---|---:|---:|---:|---:|
| Page-conditioned | Exact site count on each physical page; four line-crossing sites fixed; nonadjacent starts randomized within each page | 0.23572 | 0.06056 | 0.38002 | **0.01520** |
| Line-conditioned | Exact within-line site count on every printed line; four line-crossing sites fixed; nonadjacent starts randomized within each line | 0.37101 | 0.00884 | 0.38002 | **0.31117** |

These are conditional diagnostics, not replacement global nulls:

- The page-conditioned null removes page-to-page rate variation by fixing the observed page counts. It asks whether *within-page placement* adds evidence beyond those counts. The resulting \(p=0.0152\) is materially weaker than the published global \(p=0.0010\), and does not meet that report's seven-family Bonferroni threshold of approximately 0.00143.
- The line-conditioned null additionally fixes the exact count on each line. It asks whether the positions *inside lines* add evidence. They do not: \(p=0.3112\). The line-count distribution is 511 zero-site lines, 80 one-site lines, and 3 two-site lines.
- The simple lag-1 autocorrelation of the page-count sequence is \(+0.124\) (permutation \(p=0.286\)); for the line-count sequence it is \(-0.044\) (\(p=0.286\)). These checks do not show simple first-order clustering of the counts, although they do not rule out higher-order or smoothly varying line-level rates.

The implication is not that T7 is false. Rather, the published \(r_1\) is strongly mediated by **which physical lines contain sites**. Fixing those line counts makes the observed gap statistic ordinary. A line-level rate change remains a possible explanation, but the raw global p-value alone does not establish it.

## Separator sensitivity

The full 86-site stream remains the primary series: Dukotah's structure dossier argues that the stream continues across word, clause, line, and page joins, and the observed boundary-site counts are compatible with that treatment.

As a diagnostic only, the 60 sites with no printed separator have gap \(r_1=+0.13449\); their uniform within-word-position null gives \(p=0.23458\). The 26 across-separator sites have gap \(r_1=-0.03763\). This does **not** justify resetting the cipher at word or line boundaries. It does show that the raw gap statistic is sensitive to how distinct printed-boundary classes are mixed.

## Where the largest gaps land

The principal T7-void run is reproducible in physical coordinates:

- Gap 400: p11 line 4, column 11 → p12 line 10, column 13.
- Gap 712: p12 line 10, column 13 → p16 line 4, column 22; it crosses p13–15.
- Gap 537: p16 line 4, column 22 → p18 line 4, column 20; it crosses p17.
- Another large gap, 662, runs p36 line 11, column 11 → p39 line 11, column 22; it crosses p37–38.
- Gap 553 runs p4 line 5, column 5 → p6 line 8, column 13; it crosses p5.

Visual spot-checks of the original scans show that some of these spans include distinctive material: p5's ornamental frame, p13–14's tree/insect illustrations, p15's red numeric grid, and p37–38's red numerals/cuneiform-like marks. This is qualitative only: other gaps of at least 300 runes cross ordinary pages as well. No visual cause is established.

## Research decision

Do **not** treat T7 as a verified stateful filter, keystream reset, or generator. This audit does not falsify the broader OTP-class/continuous-stream hypothesis and does not recover plaintext.

The next discriminating experiment should be an **unconditional line-aware null** that preserves the original line/page lengths and boundary locations but does *not* preserve the observed per-line site counts. It should include planted homogeneous, smoothly varying, and step-change rate controls, and should be evaluated under the same seven-family correction. This tests whether the manuscript's line structure alone can generate \(r_1\approx0.38\), and whether the statistic has power to distinguish a genuine rate change. Gate expensive T7-mechanism simulations on that result.

## Sources

- Local inputs: resources/liber-primus/lp2-corpus.json; resources/liber-primus/lp2-transcription.txt; original scans in resources/liber-primus/.
- External Round44 [W2-B3 preregistration](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/PREREG.md), [results](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md), and [T7 queue](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/ORACLE-T7-QUEUE.md).
- External context: [SOLVERS-DOSSIER](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/SOLVERS-DOSSIER.md), [STRUCTURE-FINDINGS](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/STRUCTURE-FINDINGS.md), and [OPEN-LANES](https://github.com/Dukotah/cicada3301/blob/master/docs/OPEN-LANES.md).
