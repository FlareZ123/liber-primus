# 2016 signed 43-word prime key against physical p55's 43 strict interiors

**Agent16, 14 November 2026. Complete original fixed-key negative, no plaintext.**

## Two independent first-party clues

The authenticated [2016 OpenPGP message](../resources/historical/cicada2016-4gq25-outguess.asc) contains exactly **43 alphabetic words** by its preserved source-text segmentation, including the introductory and closing lines. Physical LP2 p55 contains 17 printed rune groups of lengths **[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]**. Removing **one first and one final rune** from every group (with short groups becoming empty) leaves exactly **43 original ciphertext runes**, from its full 76-rune page. The independently solved p57 explicitly says to shed circumferences. These give a plausible human-selected 43-to-43 input length without searching over keys or positions.

The source relationship is *hypothetical*: the 2016 signed text says LP's words are the map; it does not prescribe using the 2016 message's own 43 words as a key, choosing p55, or summing prime weights. The matching length was noticed after the fact and is not evidence of author selection by itself.

## Exact direct inverse and full original readouts

Read each of the **43 actual signed words** in printed order, normalize source Latin letters to GP conventions (`QU→CW, V→U, K/Q→C, Z→S`), transliterate to the canonical GP29 alphabet and sum their GP prime values. Reduce each **word sum modulo29**. Use the 43 GP field values as a one-time 43-symbol direct additive key to p55's 43 strictly interior positions in original physical order, preserving the 17 word-group boundaries, with just the two conventional inverse signs. Every original input position is reencryped exactly; 43 GP-native independently encrypted control symbols also recover exactly.

| Direct source-key inverse | Original 43-rune IoC | Decoded text, grouped by original printed interiors |
| --- | ---: | --- |
| Original unchanged | 0.034330011 | Nonlinguistic |
| `P=C−K (mod29)` | **0.038759690** | `HAE | EOXEAU | GIPD | MOFDNGAEREAFDL | ENYU | IW | BAEBBD | EMMBX | PWBI | Y | U` |
| `P=C+K (mod29)` | **0.029900332** | `UA | EOIAEO | MNNGT | HYEAYBGGIATML | EOHEAAE | GB | MAAJE | EOCXTOE | XPNGF | AE | G` |

The rune transliterations are literal GP token concatenations; an apparent English substring is not recovered plaintext. Neither output forms native linguistic words under original group breaks. There is no hidden-phase search, alphabet relabeling, arbitrary word permutation or post-hoc rewrite.

## Decision

This exact clue-composed direct prime-sum key **does not decode any authenticated unknown p55 passage** and is unsuitable as the complete p55 decoder prerequisite for Director #41. The authentic 43-word 2016 message and physically real 43 interiors remain independently interesting; a separately authored key operation or receiver selection would be needed to pursue them further. Avoid proliferating more keys solely on the 43=43 coincidence.

[Source-exact single-file original and positive-control test](../sims/lp2_p55_signed2016_43_wordprime_sft.cjs), [passing Windows Node22 CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43637155028).
