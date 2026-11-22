# Layer-two original-cipher decoder: literal-F bigram-state correction (17 November 2026)

## Decision and current scope

**No unknown LP2 plaintext or authentic new key has been recovered.** In the already published historical two-stage GP29 attack, the fixed-word **bigram** decoder carries a `last` (previous decoded plaintext rune) field but merges candidates whenever their **outer keystream pointer** `j` and **inner keyword phase** `ph` agree. With the historically genuine plaintext-F bypass enabled (`litf=1`), different paths can share `(j,ph)` while ending on different plaintext runes. Their next bigram scores differ. The original merger can therefore discard the globally higher scoring path. A sufficient correct merge key for this bigram receiver is **`(j,ph,last)`**, before the separately documented beam-size truncation. This is an implementation-level correction to a hypothetical cipher screen; neither the two-stage hypothesis nor its key source is first-party selected.

## Exact original-source counterexample

I held fixed the authentic terminal ninth-section **299 black-body runes**, physical p54 runes **9..231** followed by p55's **76** runes; initial previous ciphertext is physical p54 rune8, GP index **19**. The additive outer stream is the historical prime-totient stream `(prime-1) mod29`, offset **zero**. The inner keyword catalog is unchanged; for the two locked examples below, inner GP native tokens use the historical `KOAN` and `ENLIGHTENED`, phase zero and positive GP29 sign, no Atbash. Both historical outer collision models use the upstream code's own 0/1 definitions. The original 30×29 English rune-bigram table is unchanged. Scores are unscaled table weight divided by 299 (ordinary GP-English is positive; the original scores are deeply non-English).

| Original p54–55 input | Upstream merge `(j,ph)` | Correct merge `(j,ph,last)` | Gain / rune |
|---|---:|---:|---:|
| KOAN, model 0, literal-F on | -10.966555183946488 | -10.956521739130435 | +0.010033445 |
| ENLIGHTENED, model 1, literal-F on | -8.371237458193980 | -8.357859531772576 | +0.013377926 |

The original screen's stop-after-30 negative-score optimization was disabled **for both sides of each comparison**, with beam cap **2048**. The observed exact-path frontier was under 110 states at each step, so no beam pruning occurred. In the 12 original combinations of six frozen historical keywords × two original collision models under the one prime-totient outer key, ten combinations retain the same terminal optimum while two change as above. `litf=0` control with `KOAN`, model0, produced exactly the same score under either merge. This shows a real original-cipher score difference, **not** a credible decryption or an actionable key hit.

## Reproduction and code locations

- [Source exact test](../sims/lp2_layer2_terminal_zerooffset_sft.cjs): uses `resources/liber-primus/lp2-corpus.json` for the original 299 runes, the pinned 30×29 `BG` source table, existing 20-stream/30-word terminal search, and independent native 299-rune English plant. Its `decode` now accepts the optional `strictLast` and `abortEarly` flags, with the two original witnesses included in the SFT's machine-readable JSON under `strictStateWitness`.
- [Historical Rust reference](https://github.com/pnotisdev/cicada3301/blob/main/work/layer2/src/main.rs): `decode_known_bg` has `BSt.last` and merges only `cur[b].j == cur[a].j && cur[b].ph == cur[a].ph`. This also affects fixed-solved and fixed-word bigram screens when `litf=1`. `litf=0` and the distinct unknown-period column-statistic decoder have different correctness conditions.
- [Already committed original bigram campaigns](https://github.com/pnotisdev/cicada3301/tree/main/results/layer2) total more than nineteen billion candidate screens; they retain their **historical actual observations** but cannot be treated as a formally exhaustive best-path search for the literal-F branch. Existing planted positive controls demonstrate useful power yet do not resolve this state-merge issue.
- [Active complete-opening and held-out original receiver](https://github.com/FlareZ123/liber-primus/issues/1339): its separately pinned reference 729-rune and p42 source screens, native plants, matched nulls, and verification remain the correct finite test contract. The previous workflow-wide failure was a GitHub job-matrix scoping issue, now fixed in [commit 2638ba0](https://github.com/FlareZ123/liber-primus/commit/2638ba0c4b0429297933bdb4857583c5b3c67664).

## Research consequence

The correction is inexpensive for a *specific* short-key original-window recheck. Do **not** repeat the entire historic 19.6-billion grid solely because this small bounded difference exists. If a real source-selected key/window first survives the stronger score and coherent-original-plaintext gates, use exact `(j,ph,last)` and preserve both collision histories at least through the 150-rune held-out segment. On current two original witness cells, the fixed model yields no language recovery and does not change the cryptanalytic frontier.
