# Original p55's 75 complete-word runes under the LP1 Wisdom-square inverse

**Decision:** The specific [Director #581](https://github.com/FlareZ123/liber-primus/issues/581) model yields a reversible nonlinguistic 75-rune output on the **original** p55 and leaves its inherited first rune undecoded. The exact source matrix and original input are frozen; no authentic unknown plaintext or historical key is recovered. No broader 5×5 matrix or offset search is warranted from this failure.

## Human-visible premise and uncertainty

The original LP2 p55 has a moth illustration also seen on solved LP1 p05 **SOME WISDOM**, where the authentic 5×5 GP-prime square sums to **1,033** per row. The moth also appears at LP2 p53, so it does not uniquely designate p55 or a cipher operation. At original p55 one initial rune **ᛝ** is the continuation of a word from p54; the remaining 75 runes form 16 complete printed words of lengths **[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]**. The **75 = 15×5** match is source-constrained, while excluding the inherited rune and applying a Hill matrix are hypotheses.

The original LP1 p05 source matrix, in printed row-major order, is

```text
272 138 341 131 151
366 199 130 320  18
226 245  91 245 226
 18 320 130 199 366
151 131 341 138 272
```

Its determinant is **3 mod29**. Its exact modular inverse is

```text
23 22 15  2 17
24 25  4  2 24
20 28 12 28 20
24  2  4 25 24
17  2 15 22 23
```

Starting with p55 rune index1, apply the inverse to successive **15 five-rune column vectors**, without phase, shift, guessed key or row reordering. Keep rune index0 as the unchanged p54 fragment. The authentic other LP1 square (5×5/3301) is a wrong-source control.

## Original result and controls

The original p55 75-rune source, without its inherited ᛝ, is

```text
AEMIWSBXMSEOGDTHAEFIAABCUWRBEAFXIMUCPHNGLEOMSDIAPFBHEOCEOEEAEIGXGSESEOTHTHESTHOECEAIMCXDJUBEI
```

The proposed Hill inverse yields the following **complete 16-word output**, displayed with exactly the original word boundaries:

```text
LIAA / IF / NGAE / SMEADNJ / OITIXAE / NS /
OETEOSUBYPMAEEAJNG / APREAAED / NGOEOEJ / OEA /
SAITHDUB / WNGTHORPT / LS / THNJILJ / EJA / AENY
```

Gibran-trained GP29 trigram scores (mean log score per rune):

| Test | Score |
| --- | ---: |
| Original p55 75 runes | −6.178724221 |
| Fixed Wisdom 1033 inverse | **−5.773447379** |
| Wrong authentic 3301-square inverse | −5.925491918 |
| 151 separate 75-rune solved-Cicada LP1 controls | **−3.811507205 to −1.977153780** |
| One real 75-rune solved-Cicada native positive plant | −2.327503356 |

The proposed output is below **every** compared native solved passage; its 16 words lack coherent GP-language content. All 75 original ciphertext runes reconstruct exactly after forward multiplication by the frozen matrix, and the unchanged first rune reproduces all **76** source runes. A separate 75-rune positive plant from editor-normalized solved LP1 text survives encryption and the same inverse with **75/75 exact recovery**. This demonstrates algorithmic invertibility, not that the source p55 used this operation.

## Reproduction, scope and next decision

[Self-contained CommonJS SFT](../sims/p55_wisdom5_hill75_sft.cjs) consumes the original `resources/liber-primus/lp2-corpus.json`, literal p05 square values from the authenticated 2014 magic-square source, and heldout GP control passages. The script constructs GF29 matrix inversion, exact forward reencryption, the other-square control, word-boundary display and complete solved-native positive plant.

**Conclusion:** The literal artwork-to-p05 5×5 Hill inverse is a bounded negative. The visible 75-rune divisibility and cross-round moth remain observations; neither supplies a complete decoder for 76 runes or a withheld p54 prediction. Further work should require a source-selected transform rather than tune five-symbol block starts.
