# p33 and the 2014 Stage7/Stage10 square reference

**Decision (21 November 2026): historical navigation/context is supported; no further LP2 cipher operation is selected.** The original LP2 p33 artwork plausibly points a solver back to the 2014 Stage7/Stage10 magic-square sequence. The surviving source material takes that solver to three historical squares and then to LP1 pages 14–16. It does not specify how to transform p33's 196 non-rubric runes, and no unknown LP2 plaintext or key is recovered.

## Original p33 evidence and why the historical connection is plausible

The canonical LP2 page number is not the archive filename: LP1 occupies archive images 00–16, and LP2 p0–p57 occupies images 17–74. Thus **LP2 p33 is archive image 50.jpg**, not 33.jpg. The original p33 artwork carries the two cuneiform values conventionally read as **1033** and **3301**.

The canonical transcription has 214 runes. Removing the two marked red spans (offset 0, length 10; offset 91, length 8) leaves two black-text bodies of **81** and **115** runes, for **196 = 4 × 49 = 28 × 7**. P33 is the only nonempty page whose non-rubric rune count is divisible by 49. This is a distinctive order-7 size correspondence and makes the historical square a reasonable lead, but it does not itself specify a cipher.

## Source-constrained historical route

### 1. Stage7: signed carrier to three squares

The pinned 2014 Stage7 page verifies under Cicada fingerprint 6D854CD7933322A601C3286D181F01E57A35090F. Its 13,303,746 hexadecimal characters decode to the exact 6,651,873-byte MP3 (Git blob SHA-1 09fe068192b76a3697c47ec1d604b527703db798). The same MP3 was supplied to original OpenPuff v4.00. The reproduced successful settings use password A 33011033, B/C disabled, MP3 mode and Maximum (1/2), yielding the exact 745-byte three-square file, SHA-256 9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f.

The extracted matrices are, in order:

- Order 5, magic sum 3301.
- Order 7, magic sum 1033.
- Order 5, magic sum 1033.

The password and OpenPuff settings are part of the reproducible historical solve path, not a literal cipher instruction in the signed Stage7 text. The original signed page authenticates its carrier; the extraction is a reproducible result from that carrier.

### 2. Stage10: explicit submission, but not an LP2 cipher instruction

The earliest surviving participant capture is the micheloosterhof/cicada-2014 repository, commit 3b15257c5a9efada85b8ccfdb876e2ec934d5b90, dated 13 February 2014. Its Stage10 form embeds a Cicada-signed message asking the player to paste the magic squares and provide a Tor hidden-service URL. The surrounding HTML and field labels are not covered by that signature.

The form is plain HTML with no script or custom client transform. Its POST fields, in document order, are:

1. 53301 — Order 5 Square, 3301.
2. 71033 — Order 7 Square, 1033.
3. 51033 — Order 5 Square, 1033.
4. onion — the participant's hidden-service address.

The archived static confirmation body says “Thank you for you submission” and links to 107.jpg, 167.jpg and 229.jpg. Those files are byte-identical, in that order, to original LP1 pages 14, 15 and 16. The third image, LP1 p16, visibly contains the exact first extracted 5×5 / 3301 square. The image identities are exact source-object matches, not visual analogies.

This establishes a plausible human route from the p33 values to the 2014 square material and back to LP1 pp14–16. The archived response is a static 152-byte body, not a preserved HTTP transaction; the original Cicada-side /cgi-bin/squares handler, exact POST body and acceptance predicate are unavailable. Do not infer a square-to-image mapping or server validation rule from the static response alone.

## Three-square cross-page crosswalk

The Stage10 field order has a notable three-page alignment:

- **Order 5 / 3301** (first field) matches the 5×5 square on **LP1 p16** cell for cell. The Stage10 response's third image, 229.jpg, is byte-identical to that LP1 page.
- **Order 7 / 1033** (second field) has 49 cells. **LP2 p33** has 196 non-rubric runes, exactly four times 49, and carries the 1033/3301 cuneiform pair. This is a label-and-size correspondence, not a cell-for-cell match or an instruction to apply the matrix. A separate word-boundary audit rules out calling this a 49-word grid: the transcription has 61 word groups, and the two red spans cover four complete groups, leaving 57 black-text words (24 in the first section and 33 in the second).
- **Order 5 / 1033** (third field) matches the 5×5 Wisdom square on **LP1 p5** cell for cell, as documented in the Stage10 source-boundary report.

Thus the three submitted squares plausibly cross-reference LP1 p16, LP2 p33 and LP1 p5, in the form's order. The first and third links are exact matrix matches; the middle link is only the distinctive 7×7 / 49-cell size match plus the page's cuneiform values. This is stronger than treating 1033/3301 as isolated numbers, and it is a plausible intended navigation map. It still does not specify how to transform p33's 196 runes. In particular, four consecutive 49-rune chunks are not visibly delimited and one chunk would cross the page's 81/115 body boundary.

## What the route does—and does not—select

The only explicit next action in the historical Stage10 material is to submit the three already-obtained squares and the participant's onion address to the Stage10 form. The preserved response points to **LP1** pp14–16; it does not identify a next LP2 page or coordinate.

A competing reading of the cuneiform values writes them as base-60 pairs 17;13 and 55;1. Treating the four digits as LP2 page indices visits p17, p13, p55 and p1; their original images show, respectively, text, a tree, a tree/butterfly and cross/infinity artwork, with no common visual instruction or ordered readout. Treating the pairs as page/word coordinates (0-based LP2 page numbers, 1-based word positions) selects p17 word 13 = NGDJ and p55 word 1 = NG in the transcription; treating them as page/rune coordinates under the same page/position convention selects M and NG. Other natural 0/1-based conventions change the selected symbols. No source selects page pointers versus page/word or page/rune coordinates, the indexing convention, or a subsequent readout. This is a bounded rival interpretation, not a plaintext recovery.

The 196-rune length makes four 49-rune blocks conceivable, but no four-block layout is marked on p33. Its two visible text bodies have lengths 81 and 115. If the 196 runes are simply concatenated and cut into four consecutive 49-rune blocks, the second block crosses the visible boundary between those two bodies (32 runes from the first body and 17 from the second). No original instruction selects that concatenation, those block boundaries, a row/column traversal, a mapping from square entries to GP29 symbols, a modulus, a sign, a key clock, or a reset rule.

The first underdetermined step is therefore exact: **after recognizing the 1033/3301 historical square reference, what operation—if any—should be applied to p33's 196 runes?** Neither the signed Stage7 carrier nor the Stage10 form specifies one. The 2014 form asks for square submission, not for encrypting or decrypting Liber Primus.

## Existing direct-consumer gate (not repeated)

The existing original-input test already covers the natural direct uses of the 7×7 / 1033 matrix. Reducing the square modulo 29 gives determinant 2, so the key is invertible. The tested families are:

- One-dimensional Hill-7: K and K inverse, row- and column-vector conventions (4 cases).
- Two-dimensional 7×7 actions: the four natural K/K-transpose and inverse orientations on four consecutive blocks.
- Repeated 49-cell additive key: row-/column-major serialization, v mod 29 or (v−1) mod 29, addition/subtraction, and continuous/reset phase (16 cases).

A separate, narrowly motivated structural check tested the literal four-square reading: concatenate the 196 body rune indices in source order, reshape them row-major as 14×14, and split into four 7×7 quadrants. If those were four magic squares keyed by the Stage7 constants, each quadrant's seven row and column sums would all equal 1033 mod 29 = 17 (or the other printed constant 3301 mod 29 = 22). None does. The row residues by quadrant are Q1 [2,0,28,4,6,22,8], Q2 [19,3,21,11,19,12,6], Q3 [19,22,26,21,15,11,25], Q4 [8,18,8,18,1,21,5]; the column residues are Q1 [0,3,10,2,19,20,16], Q2 [15,5,23,16,20,8,4], Q3 [6,16,3,22,15,3,16], Q4 [1,24,16,1,11,22,4]. This retires only the straightforward four-quadrant magic-sum interpretation; the 14×14 reshape itself is not selected by the page layout and crosses the 81/115 visible-body boundary.

None produces coherent GP29 plaintext. The best language score remains close to the raw p33 score and far below solved p57; the positive controls recover planted native-GP streams exactly. These tests retire only the listed direct consumers, not every imaginable use of the square. Do not reopen them with fitted rotations, offsets, padding or extra layers absent a new original selector.

## Cold-start status and decision

A source-only cold-start packet is prepared at workplace/lp2-p33-stage7-stage10-coldstart-packet.md. It lists only the original page images and the historical Stage7/Stage10 artifacts, with a neutral task prompt; it deliberately omits later analyses. **No independent unexposed human/worker executed the packet in this invocation**, so the route above is a source-constrained reconstruction, not a claimed blind human result.

**Decision:** retain p33 → 2014 Stage7/Stage10 → LP1 pp14–16 as a plausible historical navigation/reference route. Stop at the missing p33-to-square operation. No LP2 cipher, unknown plaintext, key, next LP2 coordinate or final destination follows.

Reopen only if an original Cicada instruction, recovered handler/transaction, or other independent source explicitly selects a reversible operation and input boundaries for p33's 196-rune body.

## Reproduction and source pointers

- Original p33 transcription and ink boundaries: resources/liber-primus/lp2-corpus.json, resources/liber-primus/lp2-ink-annotations.json; original image resources/liber-primus/50.jpg.
- Page-number mapping and original-image archive: resources/liber-primus/README.md.
- Stage7 signed-page / exact OpenPuff reproduction: im-results/cicada2014-stage7-chain-reproduction.md; extracted matrices: resources/cicada2014-openpuff-magic-squares.txt.
- Stage10 participant form/response: resources/external/cicada2014-onion6-magic-form-and-response.json; static response body: resources/external/2014-stage10-post-square-response.html.
- Exact Stage10 image-to-LP1 identity: im-results/2014-stage10-three-images-lp1-source-handoff.md.
- Existing direct-key gate and executable: sims/lp2_p33_stage10_order7_1033_square_key_gate_sft.cjs.
