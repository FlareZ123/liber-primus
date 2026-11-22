# P22 historical EAR stanza: exact 13-dot / 118-rune suffix inverse, rejected

**Agent8, 22 November 2026; Director #2226. Classification: source-limited negative.** No new LP2 unknown-page plaintext, author-selected key, original cipher, or destination was recovered. The already established corpse / EA EA / Rune Poem association remains a historical visual hypothesis, and has not yielded an author-prescribed decoding operation.

## A genuinely new finite alignment distinct from the earlier first-118 key

The unaltered p22 JPEG `39.jpg` prints exactly **131 GP29 runes** and a **13-dot red mark after rune131**. Its illustration depicts a supine corpse, while the last of the historically available Old English Rune Poem's **29** stanzas names **EAR**, GP rune **ᛠ**, and evokes a body entering the grave. Original p22 has exactly one adjacent-identical rune event, also `ᛠᛠ`, at offsets100–101. See the independently established [visual / historical source study](lp2-p22-ear-name-unique32-p50-row-gate.md) and the first-party original art. The original corpse drawing was reused on three LP1 solved pages, reducing the uniqueness of the iconographic clue.

Under the **fixed** historical transcription of the complete 1915 Dickins EAR stanza, including the word EAR, standard GP29 English-orthography normalization produces **118 source runes**. The p22 length difference **131−118=13** happens to match the page's original closing dot count. This suggests a sharply bounded possible consumer unlike the earlier first-118 cyclic stanza key: *let a 13-rune leading header pass unchanged; use the complete EAR stanza once, in original source order, to decode exactly the remaining 118 runes*. The 13-dot mark is printed at the **end**, and does not actually say to leave the **beginning** unchanged. This is a conditional numeric-handoff test, deliberately marked as an inference.

The [frozen receiver](../workplace/agent8-2226-ear-stanza-13dot-suffix-frozen.md) was committed before observing its decoded output. Decode the unmodified original `C[0..130]` in GP29 indices using `P[i]=C[i]` for i0..12 and `P[13+j]=(C[13+j]-K[j]) mod29` for j0..117, with precisely one 118-rune historical key cycle, no extra phase, spelling changes, skipped runes, cipher-word padding, or adjustable key. The opposite sign is a fixed diagnostic orientation rather than a key search. All original punctuation and glyph ordering are preserved.

## Independent original-text obstruction before language scoring

A literal quotation of the EAR stanza preserving original manuscript printed word boundaries would necessarily begin a new plaintext word at original rune offset13 after the proposed 13-rune header. But the source-image-visible fifth p22 fragment is `ᚣᚠ` (GP transliteration YF), spanning positions **12–13**. Thus offset13 **splits a printed two-rune word**. The old-English stanza cannot begin at that source position in a word-boundary-preserving plaintext representation, independently of any unknown key or language statistics. It would require a different input segmentation or an explicit start-within-word instruction absent from the source.

The word/graphic association alone neither authenticates that this page quotes the EAR stanza nor identifies a byte codec, cipher orientation, per-rune update, initialization or continuation into adjacent pages. The original 13-dot marks are common in LP2 and the physical p22 mark closes a passage, so the apparent 131=13+118 coincidence is weak as authorial instruction.

## Full original-cipher inverse and positive plant

The [standalone Windows Node22 test](../sims/lp2_p22_ear_suffix13_exact_source_inverse_sft.cjs) reads only the original 131-rune canonical source, original raw printed word fragments, source p22 13-dot ink register, complete literal 1915 EAR stanza and native solved-LP1 scoring model. It checks every original glyph, exact 131/131 reencryption in both fixed sign directions, the exact fragment straddling the proposed header boundary, and full **95/95** authentic solved p57 GP-native ciphertext-plant inversion. [Successful original-source Actions run 45013474712](https://github.com/FlareZ123/liber-primus/actions/runs/45013474712).

| P22 candidate | Whole-page GP29 IoC | Native LP1-model trigram mean, nats/rune | Complete readable passage |
|---|---:|---:|---|
| Original 131-rune ciphertext | **0.03581914** | Not used to select key | No |
| Frozen `P=C−K` on last118 | **0.03335291** | **−3.413545** | No |
| Opposite `P=C+K` on last118 | **0.03570170** | **−3.384034** | No |
| Genuine solved p57 plaintext, 95 runes | 0.06270997 | **−2.468145** | Yes |

The source-keyed suffix output is nonprose in both directions. Its unchanged 13-rune header is also nonlinguistic. The success of exact cipher reencryption and genuine source-native plants validates implementation only. Neither alignment uncovers authentic plaintext, a second-page prediction, or the source's missing cipher law.

## Decision and next research fork

Retire **only** the direct p22 original `13-header + 118-EAR-stanza-key` GP29 Vigenère receiver, and exclude a word-boundary-preserving *verbatim* stanza starting at offset13. The [previous first-118 cyclic-ear-pad gate](lp2-p22-ear-name-unique32-p50-row-gate.md) already excludes the other most literal source-key origin; this test does not rerun it. The historical EAR stanza and corpse correlation remain recognizable *possible* navigation clues, but the manuscript does not provide the stanza-to-cipher operation, distinct key/nonce, prefix-header bypass or adjacent-page handoff. Further variations of stanza offset, punctuation counting, key wrapping, or nonlinear cipher selection would have no independent author clue, and should not be pursued as if proven.

A genuinely different path would first recover an independently datable image-specific source inscription or a first-party Cicada instruction choosing a Rune Poem transformation before decoding p21/p23. Without that new operand, move research capacity to independent source-defined operators elsewhere in LP2 rather than manufacturing variants of this conditional length coincidence.
