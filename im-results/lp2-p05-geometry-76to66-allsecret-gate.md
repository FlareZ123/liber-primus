# LP1 p05 geometry to LP2 p55/p49: exact 76→66 erasure and symbol-class obstruction

**Agent33, 15 November 2026, Director Issue [#1176](https://github.com/FlareZ123/liber-primus/issues/1176).** Classification: original-source geometry and a universal exclusion for one specified cross-page cipher family. **No unknown LP2 plaintext, creator-selected key, decoder, or destination was recovered.** This is a bounded original-rune decision, not evidence that p49 and p55 encode the same plaintext.

## Independent original clues and proposed human action

The original LP1 p05 mixed 5×5 magic square prints thirteen GP29 rune-word cells and twelve numbers. Applying the first-party GP prime weights to each word reconstructs all 25 numeric cells, with every row, column, diagonal totalling 1033 and the numeric square exhibiting 180° rotational symmetry. The first-party word/numeral mask is `00100 / 11110 / 01101 / 01111 / 00100`. These facts and the 2014 submission role were established before this test in [the p05 word-number source gate](lp1-p05-word-number-direction-source-gate.md).

The thirteen printed rune cells contain exactly 76 runes; first-occurrence deduplication omits the later `UOID` (4) and `AETHEREAL` (6) cells and retains eleven cells / 66 runes. The original LP2 p55 has 76 ciphertext runes, and the original physical p49 fragment directly above the 256-cell numeral field has 66 runes. These count matches were previously established and its direct additive, table-byte and 6×11 columnar consumers rejected in [the complete p05 source-key gate](lp2-p05-unique66-p49-sourcekey-gate.md). A human might reasonably test whether *printed square cell geometry* defines a ten-rune deletion/reordering, potentially explaining both lengths; a rival is coincidence plus unrelated p49 and p55 ciphertexts.

## Actual square geometry and missing selector

Printed row-major rune cell order is `SHADOWS, AETHEREAL, BUFFERS, UOID, CARNAL, OBSCURA, FORM, MOBIUS, ANALOG, UOID, MOURNFUL, AETHEREAL, CABAL`, with rune lengths `7,6,7,4,6,7,4,6,6,4,8,6,5`. The duplicated cells occur at zero-based (row,column) coordinates **(3,2)** for UOID and **(3,4)** for AETHEREAL; their first occurrences are **(1,2)** and **(1,0)**. The first-occurrence erasure on the 76-position printed row-major tape would delete zero-based offsets **53–56 and 65–70**.

Crucially, source-legible **row-major** and **column-major** first-occurrence readings both leave eleven cells and 66 GP29 runes, yet produce different tapes. The rotated numerical square gives no independently attested author instruction favoring either; reversal, center-out and number-magnitude routings supply additional unfixed alternatives. The original LP2 p49 and p55 word boundaries are 20 and 19 printed fragments respectively, so the eleven source cells cannot be equated with target words without changing physical segmentation. Neither the LP1 source's actual historical use as a submitted 5×5 numerical square nor the signed 2016 generic words/map dictum supplies a specific erasure, insertion, state, or clock selecting a reversible p49/p55 operation.

## New original-cipher necessary condition

The unchanged `resources/liber-primus/lp2-corpus.json` input contains:

| Physical LP2 ciphertext | Total GP29 rune positions | Distinct GP29 rune values |
| --- | ---: | ---: |
| p55 | **76** | **25** |
| p49 | **66** | **28** |

Every deterministic operation of the proposed form

`p49 = substitution(permutation(erasure10(p55)))`

can output at most **25 distinct symbols**, no matter which ten positions are removed, which of the **66!** permutations is selected, or which fixed function from source rune values to target rune values is chosen. The source p49 requires **28**. Therefore **all possible ten-position removals, arbitrary routed permutations, and arbitrary global static monoalphabetic substitutions** are mathematically incompatible with this exact p55→p49 transport. The prohibition is key-independent and does not rely on assuming linguistic plaintext, fitting a key, IoC, source row-major ordering, or a sampled null.

For the more literal p05 scheme, erasing the ten later-duplicate cell positions from original p55 in printed row-major order leaves 66 runes, but even an all-secret invertible 29-rune substitution contradicts original p49 by output offset **8**: the same source rune would need two different output runes. The broader **25 versus 28** distinct-symbol obstruction already excludes every such static erasure/permutation route and subsumes this specific conflict. It **does not** exclude a position/state-dependent substitution, arithmetic key stream, different source sentence, insertion of novel symbols, a non-symbolwise codec, or independent messages with unrelated encryption; those require an actual original clue selecting the new operation and an independently withheld prediction.

## Reproducibility and task decision

The [self-contained Node22 CommonJS SFT](../sims/lp2_p05_geometry_allsecret_76to66_sft.cjs) reads the preserved LP1 runic 5×5 square and LP2 original ciphertext corpus, checks every magic sum and coordinate/count, computes both source-legible distinct-cell streams, checks the full **25→28** obstruction, verifies the first conflicting direct literal-erasure mapping, and tests a deliberately planted erasure+GP29-bijection positive that recovers all **66/66** runes. The existing **manual-only** Agent33 Windows workflow checked the source and all assertions successfully: [GitHub Actions run 43763587974](https://github.com/FlareZ123/liber-primus/actions/runs/43763587974), specifically its final “Check LP1 p05 geometry versus original p49/p55 alphabets” step.

**Decision for #1176:** The printed p05 geometry does not independently fix a unique 76→66 coordinate map, and any static symbolwise erasure/routing relation between the two specific original ciphertexts is impossible, irrespective of secret keys. Retire this geometry-specific same-message model without trying arbitrary column/path/state variants. Reopen only if an independent first-party instruction supplies a concrete **position-varying**, **non-symbolwise**, or **different-message** original-cipher decoder whose exact original p48–49 whole-sentence prediction can be checked against withheld p51–52; a row-major count resemblance alone is insufficient. No alteration of the [authoritative overall research synthesis](../results/README.md) is justified because no LP2 plaintext or key is recovered.
