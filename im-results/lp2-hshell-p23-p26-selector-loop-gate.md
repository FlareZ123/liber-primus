# p23 ↔ p26 H-shell original-marker loop gate

**Decision: negative for a discriminating page-index loop.** Both proposed row locations can be selected from the original images, and the frozen H-shell outputs reproduce. However, the return value 23 is too common to make the p23↔p26 loop a meaningful independent navigation discriminator. No plaintext, key, or reversible rune-value operation is recovered.

## Frozen operation and source cue

Use the p28-derived H(x,y)=(x−y,x+y) mod 29, extended outside-in over odd-width rows with the middle line count preserved. Operands are original printed-line rune counts.

The plausible human cue is the authenticated 2016 message that words are the map and numbers are the direction, combined with the p28 DH/H operation. Original dot markers can suggest row widths and positions. But the source does not explicitly instruct the solver to apply H to line lengths or define the odd-width serialization. This remains a motivated navigation hypothesis, not an authenticated cipher.

## Original-image selectors

Physical p23 is original scan 40; physical p26 is original scan 43. The canonical transcription/corpus and ink annotations provide the line counts and p26 punctuation offset.

### p23: top five-dot emblem selects row 1

Original scan 40 visibly places five black dots above the text. The page has ten printed rune lines, so the five-dot cue fixes width 5 and the top emblem fixes the first top-to-bottom row.

Line lengths: [20, 17, 17, 23, 23, 23, 22, 22, 25, 21].

Selected row 1 H-shell: **[26, 14, 23, 11, 17]**. Its exact vector occurs once among all seven compatible width-5 rows. The center 23 indexes “road” in the signed 2016 message. Under the proposed but separate index-to-page convention, the outer values 26 and 17 point to p26 and p17.

### p26: terminal red 13-dot mark selects the bottom width-3 row

Original scan 43 has twelve printed rune lines. The red 13-dot glyph is a three-column mark at the end of the final line. The canonical ink annotation records it at rune offset **265**, exactly the total rune count; the last line spans offsets 245–264. The three-column mark supplies the proposed width 3, and its terminal position selects the bottom row, lines 10–12 (row 4).

Line lengths: [20, 22, 23, 22, 24, 23, 24, 21, 19, 24, 23, 20].

Selected row 4 H-shell: **[4, 15, 23]**. The unchanged center 23 indexes “road”, giving the proposed return to p23.

## Discriminating controls

The exact p23 row vector is unique among seven compatible width-5 rows. The p26 row vector is **not** unique: [4,15,23] also occurs at p19 row 1 and p47 row 3. More importantly, center 23 occurs in **55 of 153** compatible width-3 rows.

The p17 control makes the multiplicity concrete. Its four width-3 H-shell rows are:

- [0, 17, 23]
- [0, 15, 23]
- [0, 17, 21]
- [28, 18, 23]

Three of its four rows already have center 23. Thus the return-to-ROAD edge is not selective, even when the p26 bottom row is fixed by its original marker. The p23→p26 edge is the stronger half of the proposal; the p26→p23 return is a common center collision, not independent loop validation.

Corpus-wide counts:

- Width-5 compatible rows: 7; p23 row 1 exact hits: 1.
- Width-3 compatible rows: 153; p26 row 4 exact hits: 3.
- Width-3 rows with center 23: 55/153.
- p17 width-3 rows with center 23: 3/4.

## Decision

Retain the original marker observations and the exact selected line-count vectors. Retire the p23↔p26 loop as a discriminating page-index graph under this H-shell interpretation. Do not search alternative rows, widths, directions, or page targets to rescue it.

The page-index conversion remains a separate hypothesis: a signed-source word index is not automatically a physical page label. H-shell still transforms line-length counts rather than ciphertext runes. The next useful step is not another navigation edge; it is an independently source-selected, reversible operation on original rune values with a previously unselected prediction and exact forward reconstruction.

Reproducer: sims/lp2_hshell_p23_p26_selector_loop_gate_sft.cjs.
