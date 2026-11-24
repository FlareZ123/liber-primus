# LP2 p0–2: responsorial Orthodox litany constraint

**Decision for Director #2507:** the specific liturgical register selected by the original Eastern/Russian Orthodox cross artwork and the standard English response **LORD HAVE MERCY** cannot occur in the source-marked opening chapter under intact GP word lengths, even once. The expanded repeated-refrain structure is distinguishable from matched native solved prose, but has no original alignment to supply a crib/key. No unknown plaintext/key recovered.

## Independent clue, form and exact prediction

Original p0–2 archive17–19 contain repeated mirrored Orthodox triple-bar crosses ([original-image study](lp2-p0-p2-orthodox-cross-source-plate-gate.md)). A pre-2014 independent liturgical witness, *Orthodox Daily Prayers*, St. Tikhon's Seminary Press 1982, Project Gutenberg #34981 (first released 2011), explicitly calls for the response Lord, have mercy, repeated 3, 12 or 40 times. Use repository-pinned `resources/control/orthodox_daily_prayers_pg34981.txt`, blob a887fa2d3d1246de61e9e6ee4e7f08a72e9764f6. This is a clue-motivated proposed register, not an authenticated Cicada instruction.

Under native GP spellings LORD = L O R D, HAVE = H A U E, MERCY = M E R C Y, the fixed word-length triple is **4,4,5**. It is invariant under any length-preserving cipher, including nonlinear private-state substitution. The usual fully recited triple repetition requires 4,4,5 three consecutive times. A single written refrain with an implied repetition still needs one 4,4,5 sequence. Grant any position in the chapter and ignore phrase punctuation for this necessary condition; any position restriction only weakens the rival.

This differs from the [earlier literal contiguous quotation gate](lp2-p0-orthodox-prayers-sourceword-crib-gate.md): it does not ask whether the words between responses quote a particular text. It tests the recurrent response structure even with arbitrary original petitions. Prior literal quotation failure is not evidence against all liturgical forms.

## Actual result and matched controls

The canonical physical p0–2 transcript, preserving printed cross-line/page word carries, has 158 complete words and 729 GP runes. The nine title/sentence intervals have respectively 13,141,121,22,53,44,40,97,198 runes and 2,33,25,4,15,10,7,26,36 words. None contains the triple, and the continuous word-length tape also has zero triples, even allowing matches spanning punctuation.

For each of the 25 explicit refrain instructions in the frozen prayer text, select a 158-word window beginning 70 words before the response (clamped only to source bounds). For the printed control, retain one actual response and remove its parenthetical repetition rubric; for the recited control expand the explicitly stated number of repetitions. Across these 25 directives, the named response is specified to be spoken 194 times. Negative controls are all 73 158-word windows wholly within a single genuine solved native section, not cross-section concatenations. These overlapping windows are diagnostic examples, not independent population samples.

| 158-word tape | Windows | At least one 4,4,5 | Three consecutive triples | Min–max triple occurrences |
|---|---:|---:|---:|---:|
| Authentic prayer text, printed refrain | 25 | 25 | 0 | 1–3 |
| Authentic prayer text, prescribed recitation | 25 | 25 | 25 | 3–29 |
| Solved native LP prose | 73 | 22 | 0 | 0–1 |
| Original LP2 p0–2 | 1 | 0 | 0 | 0 |

The fully recited pattern separates these frozen controls exactly. The original fails even the weaker one-occurrence gate. There is therefore no eligible refrain-based known plaintext position, and no justified key inference or held-out inverse. This excludes only this selected English refrain with unchanged word lengths, not Orthodox theology, paraphrased or other-language liturgy, a different refrain, altered segmentation, or verse generally. Do not tune additional prayer phrases after inspecting ciphertext word lengths without a genuinely independent selector.

## Reproduction

`node sims/lp2_p0_orthodox_responsorial_refrain_sft.cjs` from repository root. Equivalent computation executed on fetched repository inputs in connected V8; no CI claim. The test uses only GP word lengths, never unknown rune identities or language-score optimization.
