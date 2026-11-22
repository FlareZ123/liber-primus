# Red-rubric messages under the authentic p56 prime-totient inverse

**Agent33, 18 November 2026. Tested original-runic source; no new unknown LP2 plaintext.** The original colored passages are 18 independently identifiable red rune spans, with **225 physical red runes** in the complete 58-page source; **213** are on 16 passages of the 56 unsolved pages. Red ink does not by itself specify a single cipher: the known p56 red header is genuinely encrypted, whereas p57's first seven red runes literally spell PARABLE.

## One motivated, complete keyless test

Page 56 is a genuine example of a page whose **red heading** decrypts `AN END` using a consecutive-prime Euler-totient key, starting with prime2 and subtracting `phi(prime) mod29`. The original cipher also allows a literal plaintext F/GP0 to pass through as ciphertext F **without consuming a prime**. Thus an authentic F-correct inverse must retain both possible meanings of each ciphertext F, and **reject** a non-F ciphertext that would decrypt to plaintext F. Arbitrary F skipping would invalidate the gate.

This source-selected operation was applied **independently from prime2 to all 18 original red passages**, preserving the exact original order and every possible transparent-F branch. No fitted key, sign, start offset, normalized text, alternate alphabets or reordering were used. The full original p56 ciphertext **85 runes** was also decoded through the exact same branching procedure as an independent positive: one branch recovered the entire independently established 85-rune known plaintext, and the source p56 five-red-rune header decodes **ANEND**.

## Original outcomes

Three original red passages have **no legal ciphertext→plaintext path at all**, even before English likelihood is considered:

| Unknown page | Original red span starts at page rune | First impossible span-rune offset |
| --- | ---: | ---: |
| p23 | 0 | **0** (original first red U minus phi(2)=1 would have to become a forbidden plaintext F) |
| p33 | 91 | **1** |
| p53 | 128 | **12**, within the original **51-rune** moth-linked red passage |

Each other unknown red passage has one or two strictly legal branches, but their complete generated GP29 transliterations are nonlinguistic. Examples are p0's `XGXYAEWJFYRMLIA`, p3's `MNHTHJOESIAOEOSWYOPEA`, p40's `EAWSLAEJNM`, and p54's `DBBBBMIANGY`. These outputs do not constitute recovered plaintext. By contrast, **all original p56 85-runic plaintext is explicitly present among the decoder's 22 legal branch paths**, so the identical decoder can represent the authentic F-bypass method when it really applies. Source-literal p57 PARABLE is, as expected, not encrypted under p56's cipher and fails the artificial inverse at offset2.

**Decision:** independent colored passages across LP2 cannot all be separate p56-style prime-totient encrypted messages starting at prime2. The result is especially restrictive for the p53 red51 passage and the p23 heading. It does not exclude author-selected alternative keys, page clocks, a continuous key state, a different cipher for different chapters, or a separately specified visual receiver. No plaintext, key or onion destination has been recovered by this test.

[Exact source-read-only CommonJS SFT](../sims/lp2_red_rubric_p56_totient_source_sft.cjs) · [Windows Node22 successful CI with every original output and the entire solved-page positive](https://github.com/FlareZ123/liber-primus/actions/runs/44306070883). Source inputs are `resources/liber-primus/lp2-ink-annotations.json` and `resources/liber-primus/lp2-corpus.json`.
