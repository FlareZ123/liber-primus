# LP2 mixed-visibility gate: source-visible instruction rubrics do not select identity decoding

**Decision for #2496 (Agent44, 24 November 2026):** no verified within-prose clear island or source-visible rule selecting one was found. The most closely matched authentic controls give the *same decoded instruction heading and same visible heading/body architecture* in both encrypted and clear text. This is a stronger counterexample than comparing unrelated p56 and p57 titles. Do not infer an identity-decoding island from a large red initial, red title, 13-dot rubric boundary, insect separator, or numeric adjacency alone. No unknown plaintext/key is claimed.

## Source-selected test and actual result

Use original archive images 09, 13, 16 (all LP1), the canonical LP1 transcription and solved native GP29 controls. The images were inspected directly from the maintainer-supplied original JPEG ZIP. The 09.jpg terminal instruction is visually introduced by an insect, giant red first glyph, small red rubric glyphs and a red large dot mark followed by ordinary black prose. The terminal instruction in 13.jpg and opening instruction in 16.jpg use the same red heading/black prose convention. All three decoded titles are literally AN INSTRUCTION in native GP, length 12.

| Original archive image | Printed GP heading without punctuation | Decoding | Body runes |
|---|---|---|---:|
| 09.jpg | ᚹᛟᛝᛟᛏᛋᛡᚢᚣᛋᚱᛟ | shifted reflection P=(2−C) mod29 | 26 |
| 13.jpg | ᚪᚾᛁᚾᛋᛏᚱᚢᚳᛏᛡᚾ | identity | 28 |
| 16.jpg | ᚪᚾᛁᚾᛋᛏᚱᚢᚳᛏᛡᚾ | identity | 70 |

All three exceed the minimum **24 body runes** required for a useful clear-island claim, even excluding the title. The matched rubric architecture would misclassify the encrypted 09.jpg block as clear (1/3 of these matched examples; not a population false-positive estimate). The earlier insect on 13.jpg likewise introduces a clear SOME WISDOM block, while the insect on 09.jpg introduces the encrypted instruction. The invariant is section formatting, not visibility. The continued reclining figure on 14–16.jpg also spans both encrypted and clear material, so the shared illustration is insufficient to locate a clear interior.

## Exact positional control

For each available solved unit, compare original GP indices and known plaintext at every aligned rune, ignoring punctuation only. The known LP1 koan shifted reflection provides its own exact-position plaintext because the independent solved native text has two extra runes in that unit. No unknown ciphertext or language score is used to fit a control. This measures literal fixed points, not merely plausible short words.

| Solved unit | Source runes | Equal C=P | Longest consecutive equality |
|---|---:|---:|---:|
| LP1 warning | 184 | 2 | 1 |
| LP1 welcome/wisdom | 515 | 11 | 2 |
| LP1 some wisdom/table | 157 | 157 | 157 |
| LP1 koan/terminal instruction | 778 | 34 | 1 |
| LP1 loss of divinity | 755 | 755 | 755 |
| LP1 second koan | 319 | 100 | 1 |
| LP1 final instruction/table caption | 89 | 89 | 89 |
| LP2 p56 AN END | 85 | 4 | 1 |
| LP2 p57 PARABLE | 95 | 95 | 95 |

There is no 3-rune contiguous literal identity interval in the five encrypted control units under their solved alignment. The 100 equal positions in the second koan are isolated; they do not constitute a clear prose island. Conversely the known clear units are entirely identity-coded. The solved examples demonstrate whole-unit changes and isolated cipher fixed points, not an authenticated arbitrary within-prose switch. This does not exclude a new unknown mixed cipher; it removes the inference that known solved material already supplies a within-prose selector.

## Numeric-caption rival

The original 05.jpg and 16.jpg both have the exact clear 7-rune KNOW THIS caption immediately above a square, separated from earlier prose by an insect. This is a narrower common visible cue than generic numeric adjacency. It selects only seven runes in each solved control, below the 24-rune minimum. LP2 physical p15 (32.jpg) has a standalone red caption immediately above its 4×4 decimal spiral; its exact two words, 4+5 runes, are ᚠᚢᛚᛗ / ᚪᛠᚣᛟᚪ (GP tokens F U L M / A EA Y OE A). It does not reproduce KNOW THIS literally, and the separately headed prose below the spiral cannot be counted as an adjacent clear continuation. The p49–51 panel lacks the discrete red caption architecture, and p56 provides an encrypted prose/hex/prose control against generalized numeric adjacency. No long qualifying unknown interval follows this narrow rule. Do not extend the short caption into a new shift/key sweep; p15's numerical construction is already solved as a graphic in the established results.

## Next decision

The gate fails **before** unknown prose scoring: no calibrated rule distinguishes a clear island and selects a long original interval plus an independent adjacent clear continuation. Testing arbitrary word windows would violate the upstream source-selection condition and cannot establish the intended operation. Reopen only upon a first-party marker with independent evidence that it explicitly selects literal GP text within an otherwise encrypted passage, or a complete long exact GP instruction at a source-fixed position with an independently predicted adjacent interval. This scope is narrower than the red-rubric cipher grammar (#2423), key-bearing page classification (#2491), and register-switch survey (#816).

Reproduction: [SFT](../sims/lp2_clear_island_solved_boundary_sft.cjs), using repository source controls. The identical numeric comparisons were executed against current GitHub source files during this invocation. Image judgments are directly inspectable in the five named original JPEGs. The script does not perform speculative decoding or an arbitrary lexical search.
