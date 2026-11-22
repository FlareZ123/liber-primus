# LP2 doublet 1,000-rune block profile: source-conditioned decision

**Decision, 12 November 2026 (Agent6, Director #666).** The independently reported 13-bin block counts do **not** establish a smoothly changing doublet generator. Under a flat, fixed-total 86-event site null the original block dispersion is ordinary, and it remains ordinary after fixing each original physical page, printed word length, and rune position role. The well-known +0.380 doublet-gap correlation is a separate event-*ordering* statistic. It survives this particular source partition but, as shown in the existing stronger word-identity analysis, is largely inherited from the selection of which **85 printed words** carry the 86 events. No reversible encoder, authentic key, or new plaintext follows.

## Exact original source and external claim

Use the complete 12,956 GP29 ciphertext runes from physical LP2 pages 0–55, with runeless physical p50 excluded from the rune stream. The **2,896 canonical printed words** and their line/page-spanning lengths are read from `resources/transcriptions/liber_primus_master.txt` using the existing canonical delimiter parser; original physical page boundaries, rune identities and page numbers come from `resources/liber-primus/lp2-corpus.json`. Only the 12,901 positions with an earlier rune on the *same physical page* are eligible for a doublet. Exactly **86** are repeated-rune positions.

The external Dukotah Round44 statistic uses 12 consecutive 1,000-rune blocks plus a terminal 956-rune block, not source-visible manuscript chapters. We independently reproduce the 13 block counts **[8,3,7,2,6,9,10,8,11,2,9,6,5]** and 85 gap-pair Pearson correlation **+0.38001968924**, with no ciphertext correction, chosen offset or key.

The local per-block GP29 symbol marginals imply 32.659–34.782 adjacent equal pairs *if each block's rune order were uniformly shuffled*. Original observations instead span 2–11, with 86 total across the entire book. Thus an anti-repeat effect is real relative to uniform within-block shuffling; **its 13-bin variation is a different question**. A 5.5× ratio between observed bin extremes is insufficient evidence of statistically nonstationary event *rates* when the expected event total per block is only about 6.6.

## Frozen tests

The statistic is the fixed-total Pearson dispersion `Σ (O_b−E_b)²/E_b`, with `E_b=86×(eligible source sites in block b)/12901`. The exact original eligible-site inventory across 13 blocks is **[995,996,996,996,996,995,997,995,996,996,996,997,950]**. On this basis the observed statistic is **15.70730647**. Using plain 1,000-rune bin lengths instead gives **15.71222711**.

| Comparison | Source-preserved structure and fixed controls | Original test | Null result |
| --- | --- | ---: | --- |
| Flat event sites | 86 distinct events among 12,901 eligible original page-local sites; no changes to block lengths | χ² 15.7073 | 50,000 fixed-seed Monte Carlo draws; empirical upper tail **0.197516** |
| Physical page × exact printed word length × role | Fix the exact original event count in each of **1,438** eligible page/word-length/initial-final-interior strata, of which 81 have events. Shuffle event sites only inside their own strata. | χ² 15.7122 | 20,000 xorshift32 draws on the corrected canonical word parse, mean χ² **15.80016**, **10,079** at least original, add-one tail **0.503975** |
| Same source-conditioned site null, event gap order | Use the same 20,000 site realizations and original 86 events | Lag-one gap ρ **+0.38002** | Mean ρ **+0.25565**, **244** at least original, add-one upper tail **0.012249** |

The corrected strict stratum null conditions on complete canonical source-printed word lengths (including words crossing physical lines/pages), within-word initial/interior/final roles and physical pages. An earlier page-local chunk parser split 32 canonical words into 2,928 fragments; that affected source-conditioned calibration only, not the observed 86 event sites or flat-site null. It respects the actual 13-bin geometry but is an **event-label randomization**, so its sampled positions need not correspond to valid output from any particular bijective cipher. It is a calibration of *site ordering*, not an independent simulation of source-native English plaintext or a decoder. Its new correlation tail is consistent in scope with the earlier page×13-dot×word-length conditional result p=0.00770. Neither is evidence of a specific state machine without a corresponding cipher/crib prediction.

### Independent smooth-rate positive plant

The same SFT generates 1,000 fixed-total, **86-site** planted event tapes drawn without replacement at the original 12,901 eligible positions with predeclared smooth intensity

`w(t)=1+0.95 sin(2πt/2600)`,

with phase zero at the first original rune, independent of the original event locations. The flat event-site test's empirical 95th percentile is used as the cutoff. **947/1,000 (94.7%)** of these deterministic smooth-intensity plants exceed it, with planted mean chi² **34.74464**. This shows the 13-bin statistic can detect strong *global* smooth rate changes. A page-conditioned null necessarily discards some page-rate information by fixing page counts; no unsupported cross-page causal claim is extracted from its p-value. The synthetic plant specifies an event generator only, not a lossless original-cipher transformation or source-authenticated historical seed.

## What the external +0.380 correlation now means

Source events occupy 85 printed words, 84 with one event and one with two. Their **word-index gap** lag-one correlation is **+0.3854505**, almost the full rune-gap value. The already completed stronger word-identity null fixes *which 85 words* have events and randomizes eligible offsets only within each word/page group: 20,000 draws have mean rune-gap ρ **+0.378553**, and **5,182** exceed observed, upper tail **0.259137**. See [consolidated word-identity analysis](lp2-doublet-gap-source-boundary-conditional-gate.md). The event-gap anomaly is predominantly a property of **word selection**, not independent evidence for time-varying anti-repeat generator memory.

**Cryptanalytic decision:** Preserve the severe *overall* suppression of adjacent-equal GP29 runes as a property that a proposed lossless original-cipher inverse must explain. Retire a fluctuating global doublet-rate interpretation based on the arbitrary 1,000-rune block profile; it is not significant in the new source-aware block test. No authentic original image, PGP-signed 2014 clue or known solved method selects a changing slip rate, a secret state or a reversible code for the event sites. A future proposal must derive the encoder/key independently and predict an untouched original interval. Do not enlarge T7 into new unconstrained lag, block-size or fitted-rate sweeps.

## Reproduction and sources

- [Original-input single-file Node.js 22 test](../sims/lp2_doublet_1000block_source_strata_sft.cjs), deterministic seeds `0x33016666` (source strata), `0x33016665` (flat fixed-total site null), and `0x33016667` (smooth positive plant); all checks passed in [manual Node 22 CI run 43313704119](https://github.com/FlareZ123/liber-primus/actions/runs/43313704119).
- [Independent earlier local-marginal census and exact counts](../sims/lp2_doublet_marginal_expectation_sft.cjs).
- [Existing source word-identity conditional gate](lp2-doublet-gap-source-boundary-conditional-gate.md).
- [Pinned external Round44 source](https://github.com/Dukotah/cicada3301/blob/df1865a8e6f8326067584bb1e3b63da920cf6f2c/liber-primus/PICKUP-HERE.md) and [Round44 doublet-sites result](https://github.com/Dukotah/cicada3301/blob/e928e51f5bc4069502e1f17210f31dbbcd792037/liber-primus/analysis/round44/W2-B3-doublet-sites/results.json).
