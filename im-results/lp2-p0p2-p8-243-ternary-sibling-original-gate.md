# p0–p2 (729 runes) versus p8 black body (243 runes): frozen ternary sibling-key gate

## Direct original-source inputs and possible human operation

The unmodified LP2 physical p0, p1 and p2 each have **262, 266, 201** GP29 runes, totalling **729 = 3×243**. Physical p8 has a *red 4-rune word, red 8-rune word, followed by exactly 243 black runes*, beside its rooted-tree illustration. A human might see 243 = 3⁵ as a ternary, finite key source and 729 = 3⁶ as three possible output descendants per p8 body symbol. These are reproducible counts, but the source **does not actually print a three-child expansion, additive operator, GP29 input orientation, or link back to p0–p2**. The link is an exploratory puzzle-design conjecture, not an author-selected operation.

To make the hypothesis falsifiable without uncontrolled cipher hunting, freeze precisely one reversible GP29 *sibling* transfer and exhaust its only two arithmetic orientations:

```text
For j = 0...242, t = 0,1,2:
    C_p0..2[3j + t] = (P_p0..2[3j + t] + sign*K_p8black[j]) mod29
    sign in {+1,−1}
```

The key consumes p8's exact 243 black glyphs in natural printed order, once each for one contiguous *three-rune triplet* of the unchanged 729-rune p0–p2 stream. Page boundaries (262 and 528) do not reset this clock; all original p0 red and p1/p2 black glyphs are retained. It is **not** the generic 243-period Vigenère variant, p8's already-tested 242-state GF3 linear recurrence, the 27×27 routed community claim, or a second-stage fit to 2015 prime differences.

## Executed original and independent positive controls

| Complete 729-rune text | GP29 index of coincidence | Aggregate frequency of most common five runes |
|---|---:|---:|
| Original p0–p2 ciphertext | 0.03408252 | 155 |
| Original with GP29 sibling-key sign +1 | **0.03438777** | **159** |
| Original with GP29 sibling-key sign −1 | **0.03441038** | **160** |
| Native Shakespeare GP29 729-rune control | 0.06374079 | 323 |
| Native Gibran GP29 729-rune control | 0.06190928 | 324 |
| Native Emerson GP29 729-rune control | 0.06489772 | 344 |

Both original inverses return nonprose, near-uniform GP29 streams. Each reproduces **729/729** original ciphertext runes under its exact forward encoder. Three independently encoded source-native GP English books (Shakespeare, Gibran, Emerson) each produce planted GP29 ciphertext under both signs and recover **729/729 original native runes** with exact forward replay, proving the decoder works when the proposed operation genuinely generated text. An additional authentic originally clear LP2 p57 sample is repeated into a 729-rune synthetic positive to verify original GP29 alphabet/round-trip. This source-positive test is a software check only and makes **no claim** that the original LP2 prose repeats p57.

**Decision:** The direct “one p8 black rune keys three earlier chapter runes” GP29 transfer is a bounded negative. There is no new p0–p2 plaintext or author-selected key. The exact length ratio and original p8 illustration do not establish this operation or license further sign/phase/cipher-layer searching. A new route must supply an independent, observable instruction or typed decoder, not a new fitted interpretation of 729/243.

[Single-file CommonJS original-cipher and native-positive reproducer](../sims/lp2_p0p2_p8_ternary_sibling_original_sft.cjs) · [Windows 11-compatible Node22 PASS run 45125211919](https://github.com/FlareZ123/liber-primus/actions/runs/45125211919) · source `resources/liber-primus/lp2-corpus.json`, native donors `resources/control/{shakespeare_first300k,gibran_prophet_58585,emerson_essays_2944}.txt`.
