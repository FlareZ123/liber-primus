# Independent 2026 T7 repeat-gap signal: original-bigram-conditioned inverse gate

**Status (23 November 2026):** One externally nominated, original-input clue remains measurable but does **not** supply a state update, key, or decipherment. This is an intermediate negative decision on a *claimed decryptor premise*, with a separately preserved original-source reproducible control. No authentic unknown LP2 plaintext has been recovered.

## The one independent lead selected

The independently authored [Dukotah Round44 B3 study, pinned at `fd13fe88a0bfef13f07c03c666b831e9ddae7f2d`](https://github.com/Dukotah/cicada3301/blob/fd13fe88a0bfef13f07c03c666b831e9ddae7f2d/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md) finds a lag-one Pearson correlation of **+0.38001968924** between successive inter-doublet **gap lengths** in the authentic 12,956-rune unknown GP29 tape. Exactly **86** adjacent-equal events occur within the **55 rune-bearing physical pages** p0–55 (the numerical-table p50 contains no runes). Under the external team's flat doublet-count-matched source shuffle, their Bonferroni-seven battery gives a two-sided **p=0.0010**. Their own 928 value/gap/position direct reads give no printable plaintext, and they specifically leave source-selected evolving-state operators open. This original order signal, rather than another postselected running key, was the **only external method carried into an actual new test** under Director #2440.

The other inspected independent project, [pnotisdev `15200c67abee106913ba01ff504c5b6e88d16cc7`](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/STATUS.md), reports **zero** full-section valid candidate decodings across multiplier/feedback/book-key/pointer hypotheses. Its specific Discord-sourced cumulative-prime-multiplier candidate also failed the whole-section and word-initial-NG controls. There is consequently no independent recovered 150-rune LP2 plaintext/key to transplant from that project.

## Stronger original-cipher conditional tests

The [standalone source-native Node22 SFT](../sims/lp2_external_t7_page_bigrams_original_sft.cjs) consumes `resources/liber-primus/lp2-corpus.json` and checks the authentic 12,956 original rune indices, physical source page counts, 86 doublet positions, and genuine solved p56/p57 rune lengths. The test fixes the exact source **29×29 directed bigram multiset, original first/last rune, 86 total doublets and each page's doublet count**. It then generates 20,000 randomized Hierholzer Eulerian trails for each original page while retaining the original page order. This is an explicitly algorithm-defined **nonuniform conditional null**, not claimed to sample all Eulerian trails uniformly.

| Original-order gap statistic | Mean null | SD null | Upper-tail exceedances |
|---|---:|---:|---:|
| Observed original **+0.38001968924** | | | |
| 20,000 source-page directed-bigram-preserving trails | +0.235075 | 0.060785 | 133 / 20,000; add-one **p=0.006700** |
| 50,000 permutations of complete original physical pages, preserving their internal rune order and exact doublet sites | +0.076126 | 0.095165 | 112 / 50,000; add-one **p=0.002260** |

The second null counts within-page doublets only, because the authentic source has zero cross-page doublets and artificial page joins would otherwise add new sites. Both tests use fixed seeds and exact original rune positions; the Eulerian test additionally asserts a 29×29 transition-table round trip, original endpoints and all counts. [Windows Node22 Actions execution passed](https://github.com/FlareZ123/liber-primus/actions/runs/45287664582). Both reported p-values are **one-sided** for positive correlation; the pre-registered *external* battery's seven-test two-sided cutoff was **0.001428 per test**. The stronger original-page-bigram null would give roughly **0.0134 two-sided**. The result therefore depends strongly on which original data structure the null conditions on. It does not supply a seven-test-certified historical state update.

The source's **nine pre-existing chapter lengths** (729,1145,1729,1903,1021,1433,1680,3008,308 runes) contain respective doublet counts (4,6,9,10,11,13,12,18,3). Their simple count-versus-length heterogeneity score is 6.1803 and a 100,000-draw fixed-n86 multinomial null gives **p≈0.626**. This weakens the attractive but unsupported account of a **discrete cipher switch at every illustrated chapter break**. Exact per-page transition rates and page order explain a substantial part of the gap autocorrelation; a residual ordered signal remains at a modest nominal level.

## Decoding decision and original-source missing instruction

The source shows an anomalously low number of repeated ciphertext runes, and their *locations* carry some temporal structure. **Neither** an observed +0.380 gap correlation **nor** a feasible English-looking synthetic inverse tells a 2014 human solver which secret symbol to output, which page to use as a key, whether skipped glyphs consume a key step, or how the state changes. A nonstationary leakage rate is a statistical description, with multiple rivals: original page composition, meaningful page order, different word structures, and a true hidden stateful rejection filter.

No historical LP2 mark or earlier authentic Cicada instruction currently provides an **exact deterministic output update and independently obtainable key** for this external T7 family. The existing local no-doublet / wordwise / space-changing research therefore stays active. Do not spend a new cipher search budget turning the observed rate curve into a free cipher-state parameter or rerunning the external 928 readings. If a new first-party state transition appears, require an **exact original 150+ contiguous rune inverse**, untouched 200+ rune prediction and fully reversible source replay before promotion.

**Outcome for Director #2440:** one genuinely new independent signal was reproduced and constrained on original data; the only promised direct-decryption branch is blocked at an absent source-selected state/operator. No authenticated plaintext, key material or destination was recovered.
