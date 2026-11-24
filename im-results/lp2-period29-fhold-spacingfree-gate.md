# Period-29 spacing-free F-hold inverse: exact bounds and frozen p54→p55 attack

The native GP29 alphabet and its exact 29-stanza source order nominate period 29 as an exploratory scope; no authenticated LP2 clue chooses a period-29 cipher. Previous period-29 intact-word CSP fails on p54–55, but printed segmentation is uncertain. This study removes all word lengths and spaces.

## Exact all-mask collision bounds

The [existing q8/q13 latent-F DP](lp2-ftransparent-hidden-pause-lag-collision-gate.md) extends to q29 in [SFT](../sims/lp2_period29_fhold_spacingfree_collision_sft.cjs). For any fixed per-phase bijective alphabet, deleting true plaintext F preserves equal active rune and bigram counts at lags 29,58,87. The DP grants every subset of visible F, independently maximizes/minimizes counts over all masks (rectangular relaxation), no beam or mask caps, max 512 live suffix states. The same frozen 96 literary windows per region supply controls. Exact historic q8/q13 controls still replay; three q29 synthetic native plants pass both invariants and known-mask inverses.

| Original | Rune max | Bigram max | Joint native windows inside exact separate ranges /96 |
|---|---:|---:|---:|
| p0–2 | 105 | 8 | 5 |
| p3–7 | 147 | 9 | 0 |
| p8–14 | 251 | 22 | 0 |
| p15–22 | 247 | 19 | 0 |
| p23–26 | 136 | 8 | 0 |
| p27–32 | 201 | 15 | 0 |
| p33–39 | 232 | 14 | 0 |
| p40–53 | 430 | 33 | 0 |
| p54–55 | 31 | 2 | 3 |
| p0–55 continuous | 1845 | 133 | 0 |

Full-book minimum control rune count 2244, bigram count 213. On p40–53 minima 494 and 35 respectively. Each of those individual statistics independently excludes every tested native window. The surviving original opening and terminal windows meet only a necessary relaxed bound, not a key witness. Exact [output](lp2-period29-fhold-spacingfree-collision-output.json).

## Constructive terminal inverse

For the smaller relaxed survivor, use the [existing exact cyclic n-gram optimizer](../sims/lp2_fhold_cyclic_ngram_map.cjs) with period 29, no word boundaries, full p54 (232 runes) fitting prefix and untouched p55 (76 runes) continuation. The original prefix has exactly 3 visible F, so enumerate all eight masks and optimize every possible key exactly with cyclic trigram factorization. Phase-zero start is without loss for arbitrary cyclic key digits. The key is frozen from the best prefix, and all legal latent boundary contexts are marginalized in the fixed-key suffix model, without refitting.

Three trimmed literary training regions contain 401,676 GP29 runes (33,392/152,350/215,934). No native solved text is used in training. Match control mask cost by selecting first 308-rune native window with <=2 plaintext F in its prefix, then first seeded random key whose 232-rune ciphertext prefix has <=3 visible F. This selection is explicitly conditional; two plants took 379 and 200 key draws. Both have exactly 3 visible Fs. All 8 masks legal on each original and plant, every trigram key optimization exact.

| Plant or original | Correct recovered key digits | Prefix exact | Held-out exact | Prefix log n-gram score/rune | Frozen suffix log evidence/rune |
|---|---:|---:|---:|---:|---:|
| Native first KOAN (offset0) | 29/29 | 232/232 | 76/76 | −2.17368 | −2.17391 |
| Native LOSS (offset25) | 29/29 | 232/232 | 76/76 | −2.39273 | −2.58242 |
| Original p54→p55 | unknown | unknown | no legal suffix | −3.81340 | impossible at index246 |

The highest-scoring original prefix mask is 6, score −884.7097589478497. It yields nonprose and only one legal prefix boundary context under its chosen key. Exact frozen-key continuation fails at zero-based combined rune 246 (p55 local14). This is a strong calibrated predictive failure but not an all-key exclusion for p54–55: other keys that score lower in the fitted prefix might have a legal continuation, and control selection is conditional on rare low-F prefixes. No original plaintext, key or destination established.

[SFT](../sims/lp2_period29_fhold_spacingfree_exact_map_sft.cjs) and [complete output](lp2-period29-fhold-spacingfree-exact-map-output.json) include training source hashes, every mask's MAP key/score, original candidate and control truths. Executed with exact repository sources in connected JS. No independent Windows CI claimed.

**Decision:** retire the common continuous period-29 native-GP model across the whole book and seven individual chapters for the finite all-mask collision window scope; retire the specific best-prefix period-29 spacing-free terminal predictive decoder. The p0–2 relaxed survivor remains untested by the exact MAP attack, since its F-mask budget is larger. A genuinely source-selected key, alternative clock, register or representation is still needed.