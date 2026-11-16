# Source-visible terminal 308-runic chapter against 308 known closing symbols

**Status (16 November 2026): independently noticed exact length equality; bounded additive gate negative. No unknown plaintext/key recovered.**

## Two original-source inputs and the proposed route

The final encrypted manuscript section contains **physical p54=232 and p55=76 rune glyphs**, together **308**. Beyond it, the fully solved portion comprises **physical p56=85 rune glyphs**, **physical p57=95 original clear runes** and the **128 hexadecimal characters of the visibly printed p56 deep-web target hash**. Their total is also **308**. The hash is printed *after the first 45 GP29 runes of p56's authentic decrypted sentence* and before its final 40 runes; the known printed order is exactly 45 rune ordinals + 128 hexadecimal characters + 40 rune ordinals + 95 rune ordinals.

This exact 308/308 relation suggests a direct source-selected **known-key register** to decrypt the adjacent 308 unknown runes. However the visible hash is described as a page locator/digest, not as a key, and no first-party statement instructs a reader to combine it with the solved verse. Separately, past work established a *different* 308-rune equality between text immediately before/after the p50 table and p54+p55; its no-key two-time-pad tests are not evidence that the known-text bridge works.

For a finite and reproducible first gate, represent the printed hash characters by their standard hexadecimal digits 0…15, retaining the original GP29 symbol ordinals of p56 and p57. Probe the only directly motivated register/placement alternatives: authenticated p56 **plain** vs source-printed p56 **cipher**; hash **after the actual p56 prefix** vs before the closing text vs after both solved pages; and arithmetic **addition or subtraction mod29** at exact unrotated position zero. Each candidate is a complete 308-symbol map and has no fitted key, page offset, regex selection, word realignment or plaintext candidate.

## Exact original-input result

All **12** combinations return uniformly distributed looking text:

| Statistic | Observation |
| --- | ---: |
| p54+p55 original ciphertext GP29 IoC | 0.0338212276 |
| Combined 180 genuine solved source runes GP29 IoC | 0.0675356921 |
| Best recovered IoC among 12 exact direct-key candidates | **0.0363805576** |
| Lowest recovered IoC | 0.0334616524 |
| Genuine native GP29 text recovered | **0** |

The top-IoC candidate uses p56 native plain, 128 hash digits inserted at original position 45 and subtraction, but its opening output is uninterpretable (`FIOXRARHNENGAIAEOEJEOIAWMOIANEUIAAEIEEOJYUHFTHANGNG...`). No one-letter translation or *single global bijective rune relabeling* can fix the exceptionally low IoC, because equality rates remain invariant under such substitutions. A genuinely varying-state or nonadditive operation is still logically possible; the source currently supplies no authenticated one.

The test pins the actual 85-rune p56 prime-totient inversion, including its literal non-key-consuming F at offset56, and confirms its first 45 solved runes spell `AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO`. A planted GP29 stream encrypted with the unchanged source register decrypts **308/308**, verifying the complete inverse. All 12 variants successfully forward-reencrypt.

**Decision:** The appealing whole-terminal known-308 relationship has **no positive decipherment evidence under the direct hex-digit/Gematria-ordinal additive family**. Do not launch unbounded hash reinterpretations, offsets, cipher chaining or target-plaintext search from the count alone. Preserve it only as a conditional authored-operation lead.

Reproduce with [Node22 CJS SFT](../sims/lp2_terminal308_knownhash_gp29_pad_gate_sft.cjs) · [passing Windows Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/43980281734). Exact corpus: [LP2 58-page rune data](../resources/liber-primus/lp2-corpus.json). Related distinct historical 308/308 route: [shared pad gate](../sims/lp2_flank308_terminal308_sharedpad_delta_sft.cjs).
