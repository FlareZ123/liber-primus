# Source-locked fold of the p55 43-rune circumference interior

**Agent 8, 11 November 2026. Classification: bounded original-input negative.** The test applies the same mirror-pair GP29 addition used in the provisional signed-2016 word-end fold to the independently extracted 43-rune p55 interior. It also tests the distinct operation of folding both the p55 interior and the signed-word endpoint sequence before combining them. No unknown plaintext, key, cipher architecture, or destination is recovered.

## Why this operation was worth one test

Three source-linked observations make a 43-unit fold a reasonable, finite next experiment:

1. The signature-verified 2016 message has 43 alphabetic words and says that its words are a map.
2. The provisional GP-prime-sum / 58-page address reconstruction maps the 43 words to 42 rune-bearing LP2 words and one rune-free p50 table cell. The final GP rune of each addressed word yields 43 endpoint positions; mirror-adding these endpoints in GF(29) gives a conditional centered **END** at pair positions 9–11. The p50 slot is not needed for that END.
3. The solved p57 Parable says to “shed our own circumferences.” Correctly carrying the cross-page word, physical p55 has 17 printed words, 76 runes, and a 43-rune interior after removing the first and last rune of each page-local word.

The address formula and interpretation of the signed message are provisional, not stated in the signed text. The source selects neither a specific p55 cipher nor a reversible fold. The experiment therefore tests only the simplest matching mirror-fold operation, not an established decryption.

## Original inputs and fixed construction

The reproducer reads the unchanged `lp2-corpus.json`, `lp2-transcription.txt`, `lp2-grid-256.json`, and signed 2016 OpenPGP message.

- The 43 source words are encoded with the corpus GP transliteration and prime weights, then addressed by the already documented candidate rule: page = prime sum mod 58; word = floor(prime sum / 58).
- Their selected terminal runes form 43 GP indices. The one `lies` address is p50 cell3, token `3D`; because p50 has no rune word, its endpoint remains **unknown** rather than guessing that the token's final Latin character is a GP rune.
- Mirror-adding the known endpoint pairs gives 20 known symbols and one erasure at pair index3. The key-fold sequence is:

```text
Y NG EA ? R J J EA G E N D TH P W U OE IA C U E
```

Its center is **O**; the known centered pair indices 9–11 are **E N D**.

- The p55 interior is reconstructed from the 17 original page-local words, removing each word's first and last rune. It contains exactly 43 original GP symbols. The other 33 p55 runes are boundary runes and are not silently folded into this test.

For a 43-symbol sequence (X), the fixed fold is (F_i=(X_i+X_{42-i})\bmod29), for (i=0,ldots,20), with the center (X_{21}) retained separately. A left-minus-right fold is included only as an orientation control. The folded key is applied to the folded p55 sequence with both GP29 additive signs; the unknown key position remains an erasure.

## Results

The p55 interior's direct mirror folds are:

| Operation | 21 pair symbols | Center | IoC |
|---|---|---|---:|
| Symmetric addition | `H NG B AE R U T Y M B X G EA T F M B NG NG M X` | S | 0.052381 |
| Left minus right | `U EA W T P O N OE S OE P D F R N EO OE C A D Y` | S | 0.028571 |

Combining the folded p55 symbols with the 20 known folded signed-word endpoints gives:

| p55 fold | Key operation | 20 known pair outputs | Center output | IoC |
|---|---|---|---|---:|
| Symmetric addition | (C-K) | `J F E ? F M C IA P EA C EO Y O OE E A D T E AE` | EO | 0.026316 |
| Symmetric addition | (C+K) | `C P T ? H EO IA AE AE G D F U F W L I M Y L O` | E | 0.015789 |
| Left minus right | (C-K) | `R W H ? N NG IA D N R R F IA L TH J F W M OE H` | EO | 0.042105 |
| Left minus right | (C+K) | `IA L G ? B X L NG NG J OE B TH B T P S O F A S` | E | 0.031579 |

None is recognizable plaintext. The IoCs are descriptive only: these are 20–21-symbol outputs, far too short for meaningful language-significance claims. In particular, the higher 0.05238 IoC of the unkeyed symmetric fold is not evidence of English or a recovered message.

## Decision and scope

This rejects the following small, source-motivated family on the original p55 interior:

- direct mirror-addition or left-minus-right folding;
- mirror-folding the provisional 2016 endpoint key and p55 interior separately, then combining them with (C-K) or (C+K);
- retaining the unknown p50 key position as an erasure rather than inventing its value.

It does **not** refute the conditional centered-END correspondence, the p55 43-interior extraction, other source-selected operations, or the possibility that boundary runes carry state. It does not justify trying arbitrary phases, permutations, encodings, or additional cipher layers. No update to the authoritative solved-state synthesis is warranted.

**Reproduction:** run `node sims/p55_43_interior_fold_source_gate.cjs` from the repository root (Node.js built-ins only). The script asserts the original 43-word map, the single p50 erasure, the 43-rune p55 interior, and the exact fold outputs. No CI run is claimed for this checkpoint.
