# Fixed zero→F surface inverse + all-secret per-word Caesar gate

**Agent18, 18 November 2026. Classification: exact source-motivated two-layer negative under Director issue #1422. No unknown plaintext, key or destination was recovered.**

## Why this composite was tested

The fixed p50 zero→F moving-exception inverse has one unusual property on the real ciphertext: it changes only **549/12,956** runes while raising same-page adjacent equalities from **86 to 478**, reducing the leading-zero repeat share from **33/86** to **114/478**, and retaining **99** within-word five-back equalities versus the original 104. The resulting stream remains near-uniform by IoC and is not plaintext.

That makes a second, low-description value layer worth one bounded test. The independent source motivation is the signed 2016 instruction that words are the map, their meaning the road, and their numbers the direction. A per-word alphabet shift is a direct finite interpretation of a word-number/direction instruction.

The composite was [predeclared on issue #1422 before evaluation](https://github.com/FlareZ123/liber-primus/issues/1422#issuecomment-6989672538).

## Exact all-secret invariant

First apply the already frozen zero→F surface inverse to the unchanged p0–55 ciphertext.

Then grant every one of the **2,896 complete printed words** an arbitrary unknown additive GP29 offset `k_w`:

`M[j] = P[j] + k_w mod 29`.

No key values need to be guessed. For each word, subtract its first rune from every rune modulo29. The resulting difference signature is invariant under all 29 possible shifts. Matching this signature against source-native dictionary words of the same GP rune length therefore tests **all 29^2896 possible independent word-key assignments simultaneously**.

The dictionary uses the repository's source-calibrated GP orthography and the existing 29,157-word TextBlob resource. Printed word boundaries and lengths remain exactly those of the original manuscript.

The prospectively frozen advancement criterion was at least **150 contiguous original runes** across complete words where every word has at least one compatible source-native dictionary candidate. Only after satisfying that necessary condition would a concrete word-number key rule be fitted.

## Original result

The key-independent gate fails strongly:

| GP word length | Original word slots | Shift-compatible with any native dictionary word |
| ---: | ---: | ---: |
| 1 | 83 | 83 |
| 2 | 448 | 448 |
| 3 | 720 | 450 |
| 4 | 513 | 38 |
| 5 | 317 | **1** |
| 6 | 256 | **0** |
| 7 | 216 | **0** |
| 8 | 156 | **0** |
| 9 | 78 | **0** |
| 10 | 52 | **0** |
| 11 | 32 | **0** |
| 12 | 18 | **0** |
| 13 | 4 | **0** |
| 14 | 3 | **0** |

Only **1 of 1,132** words of GP length at least five has any registered English preimage under any Caesar shift. No word of length 6–14 survives.

Across all 2,896 words, 1,020 short-word slots have some candidate, dominated by lengths 1–3 where Caesar-equivalent dictionary signatures are common. The longest contiguous run in which **every complete word** has at least one candidate spans only **18 runes**, at word indices 1461–1467. This is far below the frozen 150-rune gate.

The sole length-five survivor is an isolated event and provides no route to a paragraph.

## Positive control

A complete 12,956-rune source-shaped positive uses a genuine source-native dictionary word in every original word slot, adds deterministic independent secret shifts `k_w=(7w+13) mod29`, then wraps the shifted stream in the fixed zero→F outer transform.

The exact outer inverse recovers all shifted runes. The signature gate recognizes **2,896/2,896** planted words, including **1,132/1,132** words of length at least five, and the compatible span is the full **12,956 runes**. Applying the known planted word shifts recovers every original native-GP plaintext rune.

## Decision

The fixed zero→F surface normalizer does **not** reveal a hidden ordinary-English per-word Caesar layer, even when every printed word receives an independently arbitrary secret offset. This rejection is key-independent and leaves no word-number fitting problem to optimize.

Preserve the outer transform only as a structural clue: it prospectively explains the directions of three ciphertext anomalies and normalizes immediate repeat frequency, while a simple wordwise additive second layer is decisively absent. A successor needs a genuinely different source-selected inner operation that can change within-word difference signatures. Replacing the Caesar shift with arbitrary per-word substitutions or unrestricted high-entropy tables would lose the low-description causal path demanded by #1422.

The complete CommonJS reproducer is [`sims/lp2_p50_zeroF_wordshift_allsecret_sft.cjs`](../sims/lp2_p50_zeroF_wordshift_allsecret_sft.cjs). It asserts the original signature census, the 18-rune maximum compatible span, complete planted composite recovery and the full all-secret necessary-condition failure. [Windows Node22 run 44384799023](https://github.com/FlareZ123/liber-primus/actions/runs/44384799023) passed; the job log identifies `sims/lp2_p50_zeroF_wordshift_allsecret_sft.cjs` explicitly and prints the full 18-rune/positive-control decision.
