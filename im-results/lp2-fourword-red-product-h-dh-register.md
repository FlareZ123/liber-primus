# LP2 p6/p23 four-word red product→H DH-register relation

## Classification

**Intermediate source-coherent algebraic result; no unknown plaintext, body decoder, or terminal continuation.**

This file corrects the first version from commit `78c24b5`. `resources/lp2-transcription.txt` omits the rune-free physical p50, so physical p51–p57 map to transcription segment `page-1`. The first version failed to apply that shift and therefore parsed p55 word boundaries as p54. The corrected reproducer asserts every physical page rune count against `lp2-corpus.json` before using red spans.

The corrected result is narrower: **p6 and p23 are the only red spans with exactly four complete printed words.** Their common product→H structure survives. The former p54 four-word witness and the derived 23→11→5 sequence are withdrawn.

## Fixed inputs and operation

Canonical inputs are `resources/lp2-transcription.txt`, `resources/liber-primus/lp2-corpus.json`, and `resources/liber-primus/lp2-ink-annotations.json`.

The independently authenticated DH23 state is
`p=23, g=5, a=6, b=15, A=8, B=19, K=2`.
The established p7 red five-word GP29 product packet is
`[11,26,8,15,2]=[A^-1,B^-1,A,K^-1,K]`, independently motivating whole-red-word multiplication modulo29.

Use the already recurring forward adjacent transform
`H(x,y)=[x-y,x+y] mod29` on the two printed word pairs.

## Correct four-word source class

| page | word lengths | word products mod29 | pairwise H(product) |
|---|---|---|---|
| p6 | `[4,1,4,2]` | `[13,19,14,23]` | `[23,3,20,8]` |
| p23 | `[2,6,3,5]` | `[24,13,18,13]` | `[11,8,5,2]` |

The raw products have compact DH identities:

- p6: `[13,19,14,23]=[b-K,B,-b,p]`
- p23: `[24,13,18,13]=[-g,b-K,p-g,b-K]`

The fixed H operation gives:

- p6: `[23,3,20,8]=[p,e,4g,A]`, with p7's literal `e=3`
- p23: `[11,8,5,2]=[A^-1,A,g,K]`

No per-page orientation, sign, word order or arithmetic is fitted.

## Correct p54 observation

Physical p54's red heading is **two** words, lengths `[1,8]`, with products `[24,10]`. Its single H pair is
`[14,5]=[-b,g]`.
This is a separate, weaker state echo in the broader two-word red-span class and is not used to extend the p6/p23 relation.

## Exact corpus control

With the physical p50 omission handled correctly, the parser yields **2,973** page-local word fragments and **2,802** page-local consecutive four-word windows across p0–p57.

The two target vectors are exact singletons:

- `[23,3,20,8]` occurs only at p6 offset71.
- `[11,8,5,2]` occurs only at p23 offset0.

This is an exact corpus statement, not a discovery p-value.

## Decision

The only two exact four-word red spans share one independently motivated word-product→adjacent-H grammar and both collapse into compact fields of the authenticated DH23 state. That materially strengthens a red-state-register interpretation, but still does not type a black-cipher receiver or recover plaintext.

Do not restore the withdrawn p54 witness with a sliding four-word window. A useful successor must keep the operation fixed and obtain an address/opcode/receiver role from an independent source cue.

Reproducer: `node sims/lp2_fourword_red_product_h_dh_register_sft.cjs`.
