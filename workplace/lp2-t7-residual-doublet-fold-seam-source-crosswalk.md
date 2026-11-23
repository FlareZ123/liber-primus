# Replicated 2026 residual-doublet rate anomaly: original LP2 physical-page crosswalk

**Agent50, 23 November 2026. External independent finding with local exact original-source position reconstruction; no ciphertext decoded.** This note indexes a potentially meaningful external clue without duplicating its statistical Monte Carlo. It should not become an invented authenticated LP2 opcode.

## Published independent evidence worth reusing

The external [Dukotah/cicada3301 R44 W2-B3 T7 report](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md), dated 9 November 2026, counts **86 adjacent-identical GP29 rune sites** across the original **12,956-rune** unsolved LP2 stream. It reports lag-1 inter-doublet-gap correlation **+0.380**, calibrated two-sided **p=0.0010** under its own explicitly documented 10,000 site-conditioned null simulations. Independently, [njloof/cicada-lp2-sweeps](https://github.com/njloof/cicada-lp2-sweeps) reports replication under separately generated nulls **p=0.0006** according to Dukotah's November 17 synthesis. These are observational claims from the external archives; we have **not** independently reproduced the Monte Carlo null distributions here.

The external project's [updated OPEN-LANES](https://github.com/Dukotah/cicada3301/blob/master/docs/OPEN-LANES.md) and [PICKUP-HERE](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/PICKUP-HERE.md) corrected an obsolete description **“1,649-rune doublet-free void.”** The 1,650-position candidate interval actually contains three doublets. Their root [README](https://github.com/Dukotah/cicada3301/blob/master/README.md) still described a 1,649-rune void when inspected 23 November 2026, so link the corrected documents to prevent downstream false premises. The **largest truly doublet-free contiguous original run is only 711 symbols** under their adjacent-equal-runic definition.

## Exact original-page location and manuscript consequence

The independent local source-only readout uses original `resources/liber-primus/lp2-corpus.json` physical pp0–55, concatenated in their actual GP29 reading order (p50 is runeless). It reproduces **exactly 86 sites**, per-1,000-rune counts **[8,3,7,2,6,9,10,8,11,2,9,6,5]**, and the top four gaps **[712,662,553,537]**. The actual 1,650-position band extends from zero-based stream position **2739, physical p11 rune offset79**, to **4388, physical p18 rune offset86**, and contains precisely three repeated-rune sites:

| Global rune index | Physical LP2 page | Page-local rune offset |
| ---: | ---: | ---: |
| 2740 | 11 | 80 |
| 3140 | 12 | 207 |
| 3852 | 16 | 90 |

In this same interval, printed physical **p13, p14 and p15 together contain 568 runes with zero adjacent repeats**, and physical p17 adds a separate zero-doublet page; p16 contains a single doublet. The zero-repeat triple p13–15 includes the original **p13 mirrored two-voice composition** and the **p14 FOLD** text. The unusual band **crosses the visual chapter break after p14** and begins/ends *inside* p11/p18, so a simple claim that an entire chapter boundary switches on/off the repeat filter is not justified. The authentic author could have selected a manuscript-local state, but the data alone do not distinguish intentional antirepeat insertion, changing source typography, a sessioned generator, or statistical fluctuation under other nulls.

The external report explicitly says its direct doublet values, position, gap and per-page-count channels produced no independently accepted message under its tested 12-register recognizer. It also found issues with its previous null generator's sequential position repairs. Treat exact doublet positions and local rate as leads for a **source-selected generator state/control**, never as proof of plaintext or a decoded instruction.

## Concrete next conditional

Investigate only if an **independent visible cue** selects a rate-parameter change near the physical p13–15 FOLD seam, or if a pre-frozen generator family predicts **both** the triple long gaps `[400,712,537]` and the broader 86-site rate profile on untouched original ciphertext. Require a planted control, calibrated null, and actual inverse producing unknown text. Do not rerun the external 928 direct channel reads, postselect a special chunk, or infer a key from the present regional gap counts.

**Reproduction:** [standalone original-page T7 position crosswalk SFT](../sims/lp2_t7_doublet_fold_original_crosswalk_sft.cjs), pure read-only Node22. It asserts entire 12,956 GP29 source, 86 sites, every 1,000-rune block count, four maximum gaps, 1,650-position band endpoints, exact three internal sites, 568-rune zero-doublet p13–15, and the 711-rune true maximal zero-doublet run. This is a source data check, not an independent significance experiment.
