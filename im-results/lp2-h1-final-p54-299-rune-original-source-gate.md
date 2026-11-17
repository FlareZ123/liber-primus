# H1 source-locked p54–p55 terminal 299-rune original screen (17 November 2026)

**Decision:** The exact additional final-chapter start omitted by the historical eight-window H1 campaign yields **zero surviving original-cipher screen candidates** in the frozen short-key H1 envelope. This is a narrow calibrated screen result, **not** an LP2 decipherment, a full H1 exclusion, or proof that the final heading authorizes an H1 restart.

## Physical-source receiver and independent premise

The original p54–p55 passage contains 232+76=308 GP29 ciphertext runes. The visually separate red p54 heading occupies nine runes, ending in GP index **19**; the proposed black-body receiver is the **223 p54 body runes + all 76 p55 runes = 299 contiguous runes**. This follows the already-published H1 p15/p33 red-heading-exclusion precedent and retains p55's complete last repeated words. The independent rival is that chapter art/ink serves editorial formatting and H1 has no source-selected initial clock, keyword, or stream.

Original input: [canonical corpus](../resources/liber-primus/lp2-corpus.json), source equality / heldout construction [agent16 H1 original-input SFT](../sims/agent16_h1_gap_sft.cjs). Decoder: unmodified reference Rust `h5rs` pinned to [pnotisdev/cicada3301 15200c67](https://github.com/pnotisdev/cicada3301/tree/15200c67abee106913ba01ff504c5b6e88d16cc7/work/h5rs), two original anti-repeat models, and 581 historically fixed flat-library streams. Window preceding rune = 19. The known p56/LP1 F-transparent solution is a separate authentic method; H1's synthetic reference positive does not demonstrate transfer of that method.

## Full finite original/null screen

[Source-locked manual workflow](../.github/workflows/agent16-h1-keyword-gap.yml), [run 44018577432](https://github.com/FlareZ123/liber-primus/actions/runs/44018577432), eight separately successful `p54 (0..7)` shards, each scanning disjoint 250-offset bands. **All eight original and matched-null TSV artifacts were downloaded and independently counted before adjudication**. Each shard holds exactly 1,162 `best` rows (581 source streams x two models) for real and null, plus the per-shard authentic reference synthetic plant: `primes / offset1300 / L13 / skip model / seg0.8 / IoC1.850136`, observed in all eight. One real and one null TSV hit cross the deliberately permissive recording floor 1.5; no candidate crosses the predeclared actual gate. Short streams lacking enough key bytes have `best offset=-1` records and are not counted as evaluated.

Nominal search per side: **581 streams x 2,000 offsets x L2–13 (12 lengths) x 2 models = 27,888,000 cells**, with shorter keystream/decoder abort exclusions. Real and matched null each cover the same nominal grid.

| Model | Best original H1 IoC | Best matched-null IoC | Frozen required floor | Survivors |
|---|---:|---:|---:|---:|
| 0, skip | 1.440890 (md5-ctr reject :29; offset568; L11) | 1.543218 (rand-9368; offset1591; L12) | max(1.6,1.543218+0.15)=**1.693218** | **0** |
| 1, coin | 1.570573 (sha256-chain mod :1033; offset1356; L11) | 1.376567 (rand-9438; offset477; L12) | **1.600000** | **0** |

The model-1 maximum is the **only** real record >=1.5; it is below 1.6, not a predeclared candidate, and no source selects this stream/offset. The null model-0 maximum is its only record >=1.5. A source-selected complete original inverse, 150 coherent runes, and untouched independent-chapter prediction are therefore absent.

## Interpretation and limits

This closes the **exact terminal 299-rune H1 L2–13 short-key screen** and avoids repeating its 27.9-million-cell null comparison. The unchanged external eight-window L2–13 campaign was already completed separately with zero candidates. The distinct eight-window L14–20 campaign subsequently completed all 20 original/null shards, with no verified plaintext or surviving 10-EM/heldout candidate; see [the consolidated original H1 gate](lp2-h1-l20-somewisdom-original-heldout-gate.md). The terminal p54 L14–20 case was **not** tested here.

The published [independent 6,000-plant H1 power map](https://github.com/pnotisdev/cicada3301/blob/main/results/analysis/h5_power_map.txt) finds that even an authentic synthetic planted key has recall only 19.3% at L13 under a 1.6 floor, and lower at stricter matched-null floors. Accordingly, the screen negative gives limited exclusion power, especially for long-key, wrong-clock, different original stream, or other cipher hypotheses. The repeated reference positive is a **300-rune** plant; a matched native **299-rune** plant would strengthen calibration if this exact envelope ever needed a recheck. Re-running the original screen without an independent clue or better-power inverse is not warranted.

Reproduction inputs and unmodified output TSVs are accessible as [workflow artifacts](https://github.com/FlareZ123/liber-primus/actions/runs/44018577432). Source strings may contain nonprinting control characters: parse TSV rows by literal newline `\n`, never Python's broad `str.splitlines()`, which also splits a vertical-tab byte within one stream name. The existing Node adjudicator correctly splits on `/\r?\n/` and remains valid; no encoder or original-source correction is needed.
