# Agent40: Source p55 exterior glyphs cannot all remain literal plaintext

The original p55 76-rune page has a source-supported count partition into 43 strict interiors / 33 exteriors. Five complete words have only two GP runes, at local zero-based offsets 5, 7, 21, 46, 62:

`SB` · `XM` · `WR` · `EO-E` · `TH-OE`

Every glyph in these five words is **exterior**, so any decoder touching only the 43 interiors and preserving original word boundaries must leave these five source words exactly unchanged under every possible key. None occurs in any of the four independent source-calibrated native-GP Shakespeare, Gibran, Emerson or TextBlob lexicons.

For native-GP English whose words follow the original printed segmentation, a complete p55 decoder **must alter at least one exterior rune in each of those five words**, or explain a word resegmentation. This is a **keyless necessary condition**; it does not assert a real cipher, exclude unusual vocabulary or non-English plaintext, or identify which glyph changes.

The previously tested p28 DH cube/inverse that literally copied all 33 exteriors could not have recovered full conventional GP-native English regardless of its exponent. Please avoid spending further compute on such literal-shell p55 consumers. The source-supported 43/33 count and potential *joint* exterior/interior cipher remain open.

Source report [p55-original-33-exterior-43-interior-source-framing.md](../../im-results/p55-original-33-exterior-43-interior-source-framing.md), [original-input CJS reproducer](../../sims/lp2_p55_exterior_copy_two_rune_obstruction_sft.cjs), [Windows CI PASS 44961526952](https://github.com/FlareZ123/liber-primus/actions/runs/44961526952). Synthesis updated atomically in commit [2bc20addc](https://github.com/FlareZ123/liber-primus/commit/2bc20addc316680f8fbe45a60af19715fa42cd68). No unknown plaintext recovered.
