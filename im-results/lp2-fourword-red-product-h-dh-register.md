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

## Immediate black successor extends the same state channel

The exact source class also gives a black-text continuation without scanning for a favorable body word: take the **first complete black word immediately after** each of the only two four-word red spans, and reduce it by the same elementary descriptor grammar already used elsewhere in LP2, `(printed length, GP0 sum, GP0 product)`.

- p6 red span ends at82. Its immediate black word is start82, values `[6,9,28,25,6,21,23]`, with descriptor `(7,2,3)=[g+K,K,e]`.
- p23 red span ends at16. Its immediate black word is start16, values `[28,6,15,25,13,7,19,28]`, with descriptor `(8,25,16)=[A,-q,A*K]`.

Applying the same outside-in H convention to the complete successor words gives

~~~text
p6  H7 = [12,0,17,1,22,5,25]
        = [aK,F,K+b,1,p-1,g,-q]

p23 H8 = [0,27,16,25,8,22,12,9]
        = [F,-K,AK,-q,A,p-1,aK,A+1].
~~~

The state labels were recognized retrospectively and DH23 expression space is dense, so these equalities are **not** plaintext evidence or a calibrated coincidence probability. The causal gain is the receiver selection: both black words are fixed by immediate physical adjacency to the independently defined red source class before any state comparison.

A manuscript-wide control over the corrected **2,973** physical-page word fragments makes the elementary descriptor result exact. There are **218** seven-rune words; only p6 start82 has `(sum,product)=(2,3)`. There are **160** eight-rune words; only p23 start16 has `(sum,product)=(25,16)`. Thus both source-selected successors are unique under their complete `(length,sum,product)` descriptors.

**Decision:** the p6/p23 red register channel has a directly adjacent black-state continuation. Treat these two successor words as concrete candidate operands for a future authored consumer; do not infer a repeated body key or decoder merely from the state compression.

Reproduction: `node sims/lp2_fourword_red_black_successor_state_gate_sft.cjs`.

### Direct corridor-key consumer is rejected by the frozen checksum tape

The p6 successor's seven-rune arity makes it a concrete candidate operand for the still-missing p30–p42 coordinate serializer. Repeat the complete source-selected word over the fixed receiver arities `[4,3,3,4,2,5,4,4,6,5,4,6,7]` and require the independently frozen page-key sums `[20,9,4,0,0,25,10,7,0,28,0,5,18]` before any authenticated target rune is read.

Charge `raw`, `reverse`, `H`, `H(reverse)`, `H^-1(raw)`, `H^-1(reverse)`; both global signs; and continuous versus per-page-reset cyclic clocks. This is **24 complete serializers** with phase fixed at the visible first rune.

Result: **0/24** satisfies all thirteen page sums. Nineteen satisfy none and five satisfy exactly one; the global maximum is **1/13**. Thus the adjacent black state word is not the missing periodic corridor key under the direct/H family. This rejection is target-rune-blind and survives the stronger p6 receiver-address schedule from Director #3388.

Reproduction: `node sims/lp2_p6_black_successor_corridor_key_gate_sft.cjs`.


### Literal p6→p23 black-successor morphism is negative

The two immediate black successor words are source-selected, but a direct
extension of the red H morphism can now be rejected under a broad finite
presentation family.

Freeze the exact successor values:

- p6: `[6,9,28,25,6,21,23]` (seven runes);
- p23: `[28,6,15,25,13,7,19,28]` (eight runes).

The arity difference requires exactly one inserted field if the p6 object is
to become an eight-rune object. Restrict that inserted value to the nine
distinct p6-visible red state values already present in the same source page:

`{1,2,3,4,5,6,8,20,23}`

from the union of raw red lengths, adjacent-H(lengths), and
adjacent-H(word-products).

Charge:

1. six seven-rune source presentations:
   raw, reverse, outside-H, outside-H(reverse), outside-H^-1(raw),
   outside-H^-1(reverse);
2. all nine allowed inserted values;
3. all eight insertion positions;
4. twelve eight-rune target presentations:
   direct, reverse, outside-H, outside-H(reverse), outside-H^-1,
   outside-H^-1(reverse), adjacent-H, adjacent-H(reverse),
   adjacent-H^-1, adjacent-H^-1(reverse), half-swap, half-swap(reverse).

This is `6×9×8×12 = 5,184` exact constructions. **Zero** equals the p23
successor word.

Therefore the black-state continuation is real at the descriptor level, but
the natural literal interpretation “insert one visible p6 state field and
reuse the small red H presentation grammar to transport the full successor
word” is rejected. Any authored consumer for these successors must be a
different state/descriptor operation; do not tune insertion phase or H
orientation further inside this family.

Reproduction:
`node sims/lp2_p6_p23_black_successor_literal_morphism_gate_sft.cjs`.

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
