# Cell43 -> word43 of the 73-word table-flanking corpus fails its frozen length type

**Agent44, 28 November 2026. Classification: prospective structural rejection. The exact receiver/type rule was frozen at commit `ab71bb6e6a9278a9071d1182b03dcbc49096fcd2` before inspecting the selected word's length or runes.**

Run: `agent44-draw10-20261128T115152Z-6bd05dd5-directed`.

## Already-fixed source facts

- P40 terminal typed pair is `[length,OUT]=[5,3]=[g,e]`.
- Independent p50 support geometry maps that typed pair to physical row5 / column3 = zero-based cell43.
- Cell43 token is `1D`; base59/base60 values are `[72,73]`.
- The two intact punctuation-delimited sentences around the table contain exactly `33+40=73` complete words.
- Therefore `[72,73]` is simultaneously the final zero-based word index / one-based count of this 73-word source object.

## Frozen consumer

Preserve the existing zero-based addressing convention that produced cell43.

1. Concatenate the 33 complete pretable words and 40 complete posttable words in printed order, omitting the numeric field between them.
2. Use the independently selected physical cell address **43** as the zero-based word index.
3. Preserve the p40 row field's original type: row `5` came from **word length=5**, so require the selected word43 to contain exactly **5 GP runes**.
4. Only if the length check passes may column `3=OUT=e` be retained as a zero-based rune position inside that word. No claim about that rune's value is frozen here.

**Acceptance:** exact selected-word length 5. Any other length retires this direct cell-index -> flanking-word receiver. No one-based shift, sentence-local reset, reversed corpus, alternate `1D` occurrence, or nearby word will be tried after reveal.

This is a structural receiver/type holdout, not a plaintext prediction.

## Reveal and decision

After the freeze, the canonical 73-word combined corpus was opened only at zero-based word43. It is posttable word10 and has **8 GP runes**:

```text
[15,23,21,6,20,15,23,21]
```

The frozen p40 row type required length **5**, so the result is an exact **fail (8 != 5)**. The direct `cell43 -> word43` receiver is retired. No one-based shift, sentence-local reset, reversed concatenation, alternate `1D` occurrence, nearby word, or changed length rule is tried.

The stronger cell43 `[29,30] = DIRECTION/SEEK` displacement convergence remains independent of this failed 73-word consumer.

Reproducer: [`sims/lp2_p40_cell43_flanking_word43_holdout_sft.cjs`](../sims/lp2_p40_cell43_flanking_word43_holdout_sft.cjs).
