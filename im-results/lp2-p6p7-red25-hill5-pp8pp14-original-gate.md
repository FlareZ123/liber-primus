# Original red p6/p7 25-symbol key as a Hill-5 receiver for pp8–14

**Agent 47, 21 November 2026. Classification: bounded original-cipher negative, independently executed on Windows Node 22. No unknown plaintext, genuine key, cipher identification, or Cicada continuation was recovered.**

## Distinct source-shaped hypothesis

Physical p6's eleven-red-rune segment (offset 71, following a red 13-dot mark) and p7's final fourteen-red-rune segment (offset 194, ending at another red 13-dot mark) form **25 original GP29 symbols**, the exact length of a 5×5 square. They are separated in book order but share rubrication. A natural hypothetical key is their concatenation in printed order as a 5×5 Hill-cipher matrix over GF(29). A **different key matrix**, the historical 2014 5×5/3301 magic square, was already tested on the next chapter in [the earlier gate](lp2-p7-3301-hill5-gate.md); the present red-ink key is materially different.

P7's source-visible five-dot column order is **[2,4,0,3,1]**. The following pp8–14 chapter contains **1,729 original rune symbols** and one literal inline Arabic numeral **7** at zero-based chapter offset692. Including this numeral as GP index7 yields **1,730=5×346** positions and supplies an exact five-column interleave. The dot-selected interleave puts the printed 7 first. This makes the shape of the candidate operations source-driven, although the manuscript never identifies Hill-5 or instructs combining these two red spans.

The exact red concatenation, checked against both original ink annotations and the canonical rune corpus, is:

```
p6 offset71 length11: 24 16 14 17 19 6 27 15 17 14 12
p7 offset194 length14: 23 3 22 16 2 25 5 7 11 14 28 6 28 19

K =
24 16 14 17 19
 6 27 15 17 14
12 23  3 22 16
 2 25  5  7 11
14 28  6 28 19

det(K) mod29 = 12
```

Because 12 is invertible in GF(29), the proposed direct Hill transform is lossless. Retain all printed ciphertext indices unchanged except for explicitly inserting the nonrunic printed numeral7 to make the proposed five-column register. Exact source-derived variant set: source sequence as printed, five-dot interleave, or inverse placement; row-major or transposed K; standard Hill decryption or the inverse operation's rival orientation, **3×2×2=12** deterministic receivers. No secret key, phase, IV, word-level crib or plaintext-fitted transposition was searched.

## Complete untouched original-cipher result

The independent source-native GP29 trigram reference scores solved LP1 prose at **−2.2607280** mean log likelihood and the authentic clear p57 at **−2.4681447**. The untouched pp8–14 input scores **−3.4213569**. Every proposed Hill receiver remains at the encrypted/random-like floor:

| Criterion | Complete twelve-variant observed range |
|---|---:|
| Source-native GP29 trigram mean log likelihood | **−3.42468849 to −3.40327469** |
| GP29 letter index of coincidence | **0.03426352 to 0.03481046** |
| Uniform 29-way reference IoC | approximately **0.034483** |

The best trigram score **−3.40327469** comes from the five-dot-column deinterleave, transposed K, and standard inverse. It remains roughly 0.935 nats per trigram below the solved p57 control. Its small ranking improvement over the source baseline does not yield readable GP29 text. Across all alternatives the IoC is near the random reference; no long native-language segment emerges.

The standalone reproducer asserts the complete 25 original red GP indices, determinant, 1,730 original source-shaped positions, the five-dot order and numeral7 location; it also checks forward/inverse Hill round-trips on planted GP29-native text for both matrix orientations. All twelve receivers were executed successfully on an untouched original corpus in [Windows Node22 manual GitHub Actions run 44942591862](https://github.com/FlareZ123/liber-primus/actions/runs/44942591862).

## Decision and boundary

Retire the **literal p6 red11 + p7 red14 → GF29 Hill5 → original pp8–14 five-dot interleave** candidate. The causal clue stops at the 25-value source shape: neither p6 nor p7 says to use these spans as matrix coefficients, Hill5 has no independent signed selector, and the complete fixed decoder is nonlinguistic. The exact red register and the five-dot/7 chapter length are authentic structural source facts. They do not supply a key or decryption merely by fitting matrix dimensions.

No extended searches over unhinted orientations, new matrix construction, word resets, or secret affine whitening are warranted from this failure. A new author-side operation or key selector would define a separate hypothesis.

**Reproduce:** [one-file CJS original-source SFT](../sims/lp2_p6p7_red25_hill5_pp8pp14_sft.cjs) · [manual-only Windows workflow](../.github/workflows/agent47-red25-hill5-manual.yml) · [PASS log](https://github.com/FlareZ123/liber-primus/actions/runs/44942591862).
