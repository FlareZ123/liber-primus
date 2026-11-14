# Seventh-onion HTML 133/331: earlier magic-square link and original p55 prime-ordinal test

**Status, 14 November 2026:** Archival original-release HTML preserves the unusual pair `133/331`; **331 is exactly the center of the solved 2014 7×7 magic square**, and `133` reverses its decimal digits. This makes a new human-observable cross-round pointer. One narrowly motivated original-p55 prime-ordinal inverse has been computed with the solved p56's transparent-F rule; it yields **no readable unknown plaintext**, and no authored instruction has been found selecting that consumer. No key or destination is recovered.

## Exact source and why a player might notice it

The archival directory [original-onion7](https://github.com/krisyotam/cicada3301/tree/main/liber-primus/original-onion7) contains the 58 numbered LP2 images, a signed delivery sidecar and 1,640-byte `index.html` (Git blob `303db130705f0ef9be2a738f4336d5cfcebde80c`). The HTML begins:

```html
<html>
<head><title>133</title></head>
<body>
<div id="331">
<img src="0.jpg" /><br />
```

Image tags continue through `57.jpg`. The same index is reproduced in the [2014 walkthrough](https://github.com/krisyotam/cicada3301/blob/main/puzzles/2014/WALKTHROUGH.md); the HTML is an archive copy, not itself a separately PGP-authenticated instruction. An earlier authentic-era solver operand is the [2014 OpenPuff square text](https://github.com/krisyotam/cicada3301/blob/main/puzzles/2014/assets/stage07/magicsquares.txt) (Git blob `0cff0a94f16a8603443619b6338def411c9f7bd5`). The **7×7** square has center (one-based row4,column4) **331**; its rows/columns each sum **1033**, and **133** is the decimal reversal of **331**. This exact correspondence merits preservation as a possible archival release-page clue, independent of any LP2 ciphertext fit.

The appealing further relation `133 = 7 × 19` and the terminal page lengths p55=76=4×19 and p57=95=5×19 was noticed only after the HTML pair; **it is not an independent selector for a 19-column decoder**. Previously published 19-block ciphers remain bounded negatives and should not be rerun for this observation alone.

## One direct source-conditioned original inverse (negative)

An earlier **authenticated** solved-page precedent is p56's consecutive-prime/totient GP29 shift with a plaintext-F skip. If the HTML numbers were key-clock cursors, their first affordable consumer would be the **133rd** or **331st** prime as the starting ordinal, read forward over p55's exact **76** original runes. The source-derived primes are 751 and 2221. With GP indices `0..28`, prime stream `q[n]`, and each possible transparent-F branch, decode non-F outputs as `P=(C+sign*(q[n]−1)) mod29` for `sign = ±1`; an actual plaintext-F always emits ciphertext F and **does not consume** the prime. This is a complete reversible model for each accepted branch, with no fitted phase, arbitrary offset or grammar repair.

| Frozen original p55 candidate | Result under exact F rule |
| --- | --- |
| Start prime ordinal 133, inverse sign − | 3 F-skip branches survive; GP29 IoC **0.037193 / 0.041404 / 0.040351**; all nonlinguistic |
| Start 133, sign + | **Forced non-F ciphertext → forbidden plaintext F at rune53**; zero surviving branches |
| Start 331, sign − | **Forced non-F ciphertext → forbidden plaintext F at rune60**; zero surviving branches |
| Start 331, sign + | 3 F-skip branches survive; GP29 IoC **0.034737 / 0.031930 / 0.036140**; all nonlinguistic |

Original ciphertext F occurs only at zero-based offsets **15, 25, 41**. All surviving branches recipher the unmodified **76/76** original p55 runes exactly. An independently enciphered **source-native solved-p57 first-76-rune plant**, with authentic F bypass, is recovered for every tested ordinal/sign. Original p55's IoC is **0.037895** and the same-size genuine clear p57 control's is **0.059649**. The exact original readouts, skipped-F choices, scores and source-native positive controls are reproducible with [single-file CJS SFT](../sims/lp2_onion7_html_133_331_primeordinal_original_sft.cjs).

**Decision:** The simple 133/331-prime-key transfer does not produce GP-native coherent plaintext; two of four tested clocks are algebraically inconsistent with the authentic F bypass. This is a local consumer test, not a disproof of every meaning of the archival HTML, or of a different unknown-page cipher. A further investigation is warranted only after an independent source chooses a *specific* register and reversible operation for 133/331, preferably with a withheld original-rune prediction. Numerical coincidences do not justify expanding parameter sweeps.
