# P15 source spiral as one Josephus read order over pp15–22

**Decision:** The one source-fixed, 16-step Josephus reading specified in [Director #574](https://github.com/FlareZ123/liber-primus/issues/574) does **not** recover native-GP prose or an instruction from the original 1,903 ciphertext runes. This retires only that exact reading. No LP2 unknown plaintext, key, cipher state, or destination has been identified.

## Independently visible input and fixed rule

The original p15 `32.jpg` prints the 16-cell clockwise outward square starting from red **3299**, already reconstructed in [the p15 source record](../results/fibonacci-prime-spiral.md). The exact steps, in native spiral order, are:

```text
3299 3298 3296 3294 3288 3278 3258 3222
3152 3038 2838 2472 1820  708 1206 4516
```

The source-visible top-level chapter consists of physical pp15–22, with lengths **159, 267, 273, 260, 271, 269, 273, 131 = 1,903 runes**. The already-known numerical spiral remains source-real; interpreting it as a transposition is the test's added, unproven premise.

Create a circular list containing the original chapter rune positions 0–1902. With cursor starting at zero, at output position `j` advance by `step[j mod 16] - 1` in the remaining list, emit and delete that position, and continue at the next surviving position. The exact first 40 selected input positions are:

```text
1395 888 381 1777 1265 745 207 1538 897 142
1092 1675 1603 413 1627 470 1893 1413 935 456
1875 1381 871 327 1616 887 1862 564 508 1224
548 1330 879 429 1883 1432 978 514 32 1417
```

All 1,903 input positions are selected exactly once. Inversion restores all original positions. A 1,903-rune planted passage taken from separately solved Cicada LP1 prose also decodes and re-encodes exactly. Keeping original printed word boundaries after moving individual glyphs is only a display convention, since the source contains no restoration rule.

## Original-input outcome and independent controls

The original chapter's rune index of coincidence is **0.03450194584564855**; a pure position permutation preserves the exact 29-symbol histogram and hence exactly the same IoC. That original-native register is already far below ordinary GP prose under independent matched source controls. A Gibran-trained GP29 trigram language model was applied to the source, fixed Josephus reading, reverse-spiral *wrong-order* control, and **17 independently solved-Cicada GP plaintext windows** each exactly 1,903 runes long.

| Input | Mean GP29 log score per rune |
| --- | ---: |
| Original unpermuted pp15–22 | −6.252428389 |
| Frozen clockwise Josephus output | **−6.219423807** |
| Reverse-spiral wrong-order control | −6.253432366 |
| 17 independent solved-Cicada control windows | **−2.518379939 to −2.418599084** |
| Source-native 1,903-rune positive plant | −2.463439183 |

The fixed Josephus output begins (transliteration without a speculative whitespace restoration):

```text
UOETGUTHAMTAEJLIAOWEANTPNEOSPOEPIUTHGJRDLDWPJNGEOIAOEXEAAHADFFYGOEGAMIRWNGUSWXNGEOEOEOEIAFBOFNGTOGOTHHAEJBMGUACCTDXCEOAEEOAEIUA
```

It is nonlinguistic and has the same near-uniform character inventory as the source. No pre-declared heading or second unfitted interval is opened by this output. The mechanism cannot rescue original language unigram statistics because it changes positions only. The result is a key-independent constraint, conditional on preserving the GP29 alphabet, with no general claim about other p15 interpretations.

## Reproduction and scope

[Single runnable test](../sims/p15_spiral_josephus_sft.cjs) uses the canonical `resources/liber-primus/lp2-corpus.json` and `resources/control/gibran_prophet_58585.txt`, as well as the editor-normalized solved-Cicada `resources/liber-primus/lp1-plaintext-reference.txt`. It constructs the fixed Josephus index permutation, checks exact original roundtrip, builds one source-native 1,903-rune positive plant, verifies the inverse, evaluates a reverse-spiral wrong-order control and scores heldout native passages.

**Conclusion:** The original p15 spiral is a genuine indexed-prime/Fibonacci arrangement. The specific conjecture that it prescribes the locked chapter-wide Josephus transport is unsupported by its original output. Do not broaden this rejection into alternate starts, phases, resets, signs, numerical lists or a new transposition search without an independently visible consumer.
