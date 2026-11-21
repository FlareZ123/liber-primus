# P29 G-quotient → 2013 Wisdom 5×5 word/number grille: frozen original-source gate

**Agent6 · 2026-11-21, source selection committed before evaluating the extracted original runes.** Independent hypothesis discovery after completing Director #2049 and #2063. This is a candidate for previously unseen LP2 plaintext, **not** an established cipher.

## Period-authentic source objects and pre-committed operation

1. The 2013 Cicada original `resources/external/2013-0-wisdom.txt` says “all things should be encrypted”, then prints the source-ordered **5×5** square of mixed rune **words** and decimal **numerals**. In each row, word slots are respectively positions `[2]`, `[0,1,2,3]`, `[1,2,4]`, `[1,2,3,4]`, `[2]` (zero-based columns). Thus its exact **13-word** vs **12-numeral** geometry is fixed before seeing LP2 output. In row-major 0-based 25-slot coordinates, the word positions are `[2,5,6,7,8,11,12,14,16,17,18,19,22]`, numeral positions are the complement. This original square was used in the 2014 signed magic-square challenge, so a 2014 player could have seen it.
2. Physical p39's original three-rune red marked source `[27,5,15]` interpreted in the established ascending GF29 orientation is `G(X)=27+5X+15X²`, which divides the full untouched **277-rune physical p29** (high-degree-first). The exact quotient has **275** GF29 symbols and zero remainder. The G decoding step is independently documented; its authorship as an opcode remains provisional.
3. The original P50 32×8 base60 byte successor graph has an exact source-authenticated **11-cycle**. Arithmetic aligns **275 = 11×25** with eleven 2013 `5×5` square templates, without pad, omissions or fractional cells. The missing link is an explicit first-party instruction connecting these three objects; the alignment is a hypothesis.

**Frozen decoder before inspecting source output:** divide full p29 GP29 polynomial by literal red-triad `G`; retain all 275 quotient GP indices in printed order. Split as **eleven consecutive 25-symbol tiles**, each embedded **row-major** into the 2013 original 5×5 template. Read the 13 original **word** positions per tile in 2013 printed order, concatenating tiles in physical p29 order: a single **143-rune** channel. Separately read its 12 numeric slots per tile, concatenating in the same order: a **132-rune** complementary channel. No fitted phase, key, transposition, alphabet or sparse skip is permitted, and the two channels together must exactly reassemble the 275 quotient symbols, then multiply by G to reconstruct every one of 277 printed p29 glyphs.

**Locked success test:** If either of these two literal channels is visibly coherent sustained native-GP English (at least 100 contiguous meaningful runes) and exceeds the solved-p57 native plaintext baseline in an independent bounded score, freeze its direct positive and test any held-out receiver only on a new source-selected operand. A native-language plant using solved p57 text in the marked cells, independent non-language symbols in the other cells, must be recovered exactly by the same full encode/decode path. If neither fixed channel recovers authentic plaintext, close this exact original-source candidate and do not add secret shifts, change the 5×5 mask, reorder tiles by fitted graph positions or salvage an arbitrary fragment.

**Competing explanation:** the congruent lengths and stencil are retrospective numerical coincidences; the original 2013 square was a different 2014 task and has no printed link to p29. A positive would need independent plaintext verification, while a negative retires only this literal word/numeral grille, not other p29 uses.

## Original-source execution and decision

The frozen readouts were executed *after* committing the source-only operation above as GitHub commit `c5411935a6ead546ed6dc45f3a87db1dde028ebe`. The original p29 source is `resources/liber-primus/lp2-corpus.json`, `pages[29].indices`; no original glyph or word boundary was altered. The original 2013 word/number mask was read directly from `resources/external/2013-0-wisdom.txt`.

Divide the complete original p29 277-symbol high-first GF29 polynomial by the exact original p39 red factor `G=[15,5,27]` high-first. The result is **275 quotient symbols** and exact remainder **[0,0]**. The frozen 13-of-25 word mask extracts **143** symbols; the complementary 12-of-25 numeral mask extracts **132**. The first 20 extracted rune transliterations in original tile order are:

- Word-marked: `Y N S AE S F E H W C D EO E G C P IA Y S TH`.
- Numeral-marked: `R G IA J NG W Y EA G U F OE TH EA X P W AE F F`.

Neither 143-symbol nor 132-symbol complete output contains sustained coherent native-GP prose. Their original-symbol index of coincidence is:

| Source-frozen channel | Rune count | GP29 index of coincidence |
| --- | ---: | ---: |
| Original physical p29 ciphertext | 277 | 0.03369434416365824 |
| Unsplit G quotient | 275 | 0.034054412740544125 |
| 2013 **word** stencil, original tile order | 143 | **0.032699694671525656** |
| Complementary **numeral** stencil, original tile order | 132 | **0.03261623872310895** |
| Independently clear p57 original GP prose | 95 | **0.06270996640537514** |

These near-uniform channels fail the precommitted visible-prose threshold. The measure alone is not a universal language test, but complete transliterations show no meaningful contiguous reading. Exactly recombining the two channels recovers all **275/275** source quotient symbols; multiplying by the same G reconstructs **277/277** source ciphertext glyphs. For a source-native positive plant, the **143 word-marked slots** were filled by repeated independently clear p57 runes, while the remaining **132 original quotient positions** retained their original values as background. After multiplying the planted 275-symbol quotient by G and re-dividing, the fixed mask recovered **143/143** planted clear rune symbols in their exact original order, with **275/275** total quotient recovery. This confirms the complete and fixed transport detects native prose when it is genuinely present.

**Decision: negative for the literal 2013 5×5 word/numeral grille on the 11×25 original p29 G quotient.** The previously undocumented 275=11×25 alignment is source-derived, and the original 2013 mixed word/number mask is authentic, but their joint use is **not** a verified 2014 author operation. The direct two-channel readout recovers no unknown plaintext, key or destination. Honor the frozen stop: no rerouting the 11 tiles, retuning this mask, adding a fitted Caesar key, or post-selecting readable fragments. Reopening requires a distinct contemporary instruction selecting a nontrivial source key/state or consumer.
