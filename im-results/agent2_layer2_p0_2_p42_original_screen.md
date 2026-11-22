# Two-layer LP2 original-source gate: opening, marked body and held-out p42

**Scope:** fixed historical number-stream/keyword two-layer families only; this is not a general LP2 decipherment.

## Source-locked inputs

- Complete opening: original LP2 p0-p2, reference window seg0.7, 729 runes, initial previous-ciphertext value -1.
- Independent holdout: complete single-block LP2 p42 paragraph, 272 runes; previous-ciphertext value is the final rune of p41.
- The p42 window begins 504 runes into the existing seg0.15 p40-p55 section, outside the earlier first-300-rune seg0.15 window.
- Reference source: pnotisdev/cicada3301@15200c67abee106913ba01ff504c5b6e88d16cc7.
- The periodic counter widening was checked against the unmodified reference at n=300; normalized screen TSVs were identical.

## Positive-control gate

- Serial fixed-keyword controls (both the 581-stream solved-key family and the 20-stream 30-keyword family): **PASS**.
- Combined one-pointer A1 order controls: **PASS**.
- Unknown-keyword period 2-14 with ordinary F consumption (litf=0) controls: **FAIL**.
- Unknown-keyword period 2-14 with literal-F bypass (litf=1) controls: **FAIL**.
- Positive windows were independently planted GP29 ciphertexts of 729 and 272 runes; verification used the unchanged reference whole-window bigram rule.

## Original versus equal-work randomized null

| Window | Family | Original best | Matched-null best | Original verified candidates | Null verified candidates |
|---|---|---:|---:|---:|---:|
| opening | solved | -6.1262 | -6.2291 | 0 | 0 |
| opening | words | -6.0261 | -5.9259 | 0 | 0 |
| opening | combined | -7.6502 | -8.0549 | 0 | 0 |
| p42 | solved | -3.7978 | -4.2831 | 0 | 0 |
| p42 | words | -4.3529 | -4.2169 | 0 | 0 |
| p42 | combined | -5.7794 | -5.1691 | 0 | 0 |

## Candidate adjudication

No original screen candidate passed the reference whole-window rule (score >= +2.0 per rune and >= its 20-offset matched-null maximum +5.0). No full-section expansion is justified.

## Original short-window periodic detector power limit

The original **p42-only 272-rune** standalone m2–14 detector failed native positive controls and remains underpowered; the bounded completed 729-rune p42–44 window below supplies a distinct powered source test. The original fixed-keyword family completed above is unchanged. The 729-rune opening's periodic experiment is independently powered for two planted m6/m9 cases and is summarized below.

## Completed powered periodic2–14 original inverses: long windows (17 November 2026)

The original short p42 length 272 lacked calibrated unknown-period power and remains unadjudicated on its own. A **source-exact 729-rune p42–44** window (p42 272 + p43 274 + p44 first183, original previous cipher rune11, GP-index SHA-256 `728115bbc13b381be31f0ba93dd193e3108e2af9534a97ffdb000011d6020b6e`) and the **complete source-exact p0–2 opening 729** instead have successful independently planted source-native **m6/m9 × ordinary-F/literal-F** controls. All returned zero original candidates on the unchanged 20-tape, periods2–14, two-multiplier/two-model detector with 20 independent whole-window verifier checks per cell. Equal-work null uses the same 20 preserved-length randomized tapes (seed3301002). The top20 original-screen outputs were genuine full-length rescored; all were noise.

| Original 729-rune window | Fehu handling | Historical best screen | Matched-null best | Verified original / null | Source Actions |
|---|---|---:|---:|---|---|
| p0–2 opening | ordinary F (litf0) | +11.2647 | +11.8893 | 0/20 / 0/20 | [44079282056](https://github.com/FlareZ123/liber-primus/actions/runs/44079282056) |
| p0–2 opening | plaintext-F bypass (litf1) | +16.5119 | +16.6657 | 0/20 / 0/20 | [44079282056](https://github.com/FlareZ123/liber-primus/actions/runs/44079282056) |
| p42–44 contiguous | ordinary F (litf0) | +12.0326 | +14.2157 | 0/20 / 0/20 | [pinned original report](agent30_layer2_p42_729_periodic0_original.md) |
| p42–44 contiguous | plaintext-F bypass (litf1) | +16.7350 | +16.5152 | 0/20 / 0/20 | [44085194074](https://github.com/FlareZ123/liber-primus/actions/runs/44085194074) |

The highest p42–44 Fehu-bypass original short score (+16.735) decodes to only −7.432 per rune at full length; the highest full-length score among twenty original hits is −7.060. The opening F-bypass historical/null best whole-window scores are −7.434/−7.423. Each is far below the required +2.0/rune. In the original full-length run, each ZIP contains a native TSV, independent verifier and JSON with SHA-256. Immutable artifacts: opening litf0 [real 14329900350](https://github.com/FlareZ123/liber-primus/actions/runs/44079282056/artifacts/14329900350), [null 14328467556](https://github.com/FlareZ123/liber-primus/actions/runs/44079282056/artifacts/14328467556); opening litf1 [real 14329630414](https://github.com/FlareZ123/liber-primus/actions/runs/44079282056/artifacts/14329630414), [null 14330600783](https://github.com/FlareZ123/liber-primus/actions/runs/44079282056/artifacts/14330600783); p42 litf1 [real 14331885393](https://github.com/FlareZ123/liber-primus/actions/runs/44085194074/artifacts/14331885393), [null 14331510810](https://github.com/FlareZ123/liber-primus/actions/runs/44085194074/artifacts/14331510810). All original 729 positive-control gates are powered for the two specifically planted m6/m9 cases; this cannot prove universal power for every m2–14 shape.

## Original 13-dot title/body separation: 716-rune source-boundary decision

Original p0 has thirteen red title runes in two 8+5 words. The physically marked 13-dot punctuation follows them; the remaining original p0–2 black-body stream has **716 GP29 runes**, source-byte SHA-256 **`3e6191f2f5ab96359d9dbc27b223bd17d565f0e2978254e4b63041b61b2ed689`**. [Builder](../sims/agent30_p0_red13_body716_source_sft.cjs) fixes this source and tests exactly two interpretations of previous-cipher state: continue from the last title rune **5** or reset to **−1** at the punctuated boundary. The historical period2–14 decoder, original 20 streams and equal-work null are unchanged, with **ordinary F** and **all four 716-rune independent positive controls** (m6/m9 under both states) validated against their true source, offsets and full-length plaintext. All four full original/null scans completed successfully after fixing the downloaded executable file permission (commit `b660ff9`) in [run 44120888255](https://github.com/FlareZ123/liber-primus/actions/runs/44120888255).

| Black-body state | Historical best screen | Matched-null best | Verified original / null | Original TSV SHA-256 | Original verifier SHA-256 |
|---|---:|---:|---|---|---|
| Continue previous5 | +11.1280 | +11.1235 | **0/20 / 0/20** | `60de513b44aaca9efbb8f464d237845fc7b4b845e0257e70ec1adcdc2418e4af` | `e483eab0d2c35f1b00fa8683d2bb006027f999e052a082c573919d2507826545` |
| Reset previous−1 | +11.1280 | +11.1235 | **0/20 / 0/20** | `c87cb35b6cbab1037c0e633a8e68c64d976806e71fad5083e06d677c2e5fd672` | `d842cf539c9d59dda297d8bd8707f56fff22b664fa7b17e5d09e7faeff04371f` |

The matched-null full 716 scores remain ordinary noise; both original boundary conventions share the same best candidate, with full-window worst-ranked short-hit score only −9.381/rune and best verified score only −7.711/rune. The source-native 716 plants' full-window scores are +7.712/+7.715/rune with true periods6/9 and offsets2000/5000. Artifacts: [four controls 14345221847](https://github.com/FlareZ123/liber-primus/actions/runs/44120888255/artifacts/14345221847), [continuity real](https://github.com/FlareZ123/liber-primus/actions/runs/44120888255/artifacts/14344783117), [continuity null](https://github.com/FlareZ123/liber-primus/actions/runs/44120888255/artifacts/14346195872), [reset real](https://github.com/FlareZ123/liber-primus/actions/runs/44120888255/artifacts/14346290723), [reset null](https://github.com/FlareZ123/liber-primus/actions/runs/44120888255/artifacts/14345377063).

**Decision:** Retire the finite, historical, period2–14 anti-repeat-LAST receiver under both original page/marker boundaries and tested stream families. The 13-dot boundary has no supported decoder role within this family. The test does not exclude a different source-selected first-stage operation, untested historical keys, or an encipherment not represented by ordinary GP29-English prose.


## Interpretation and limits

The search is bounded to the fixed source families: all exported number streams with the three solved-page keys; the 20 historically selected number streams with the 30 fixed keywords; the predeclared one-pointer A1 combination; and unknown keyword periods 2-14 on the same 20 streams. The matched-null KSBs preserve each family’s stream count and individual lengths.

A screen maximum is a ranking statistic, not plaintext. Only the unchanged independent whole-window re-decode is counted as a candidate. A surviving candidate would still need exact original forward replay and prediction on untouched material before being promoted.

No conclusion here excludes other keys, other source-selected operations, different section clocks, or other cipher families. A negative result closes only this finite tested historical two-layer family on the source-exact, source-powered original windows recorded above. No decoded unknown-page original plaintext was found.
