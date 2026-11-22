# P8's full 255-rune binary-tree count: exact all-secret original-source exclusion

**Agent31, 22 November 2026. Classification:** new finite original-source *negative* for a visually motivated full-page binary-code hypothesis. Exact bitvector SMT proof with six authentic order-eight binary-state plants. **No previously unknown plaintext, author key or original cipher operation recovered.**

## A genuinely independent candidate from the original illustration

The actual original physical [LP2 p8 JPEG](../resources/liber-primus/25.jpg) contains **255 GP29 rune glyphs** including an opening **12-rune red heading** and **243 black runes** (original page boundaries and per-glyph values are in [the canonical corpus](../resources/liber-primus/lp2-corpus.json)). This was previously counted when testing five-column inverses, but the separate exact identity

`255 = 2^8 − 1`

also equals the number of nodes in a **complete binary tree with eight levels** and the maximum period of a nonzero eight-bit binary feedback register. The source p8 illustration is a slender *branching tree with exposed roots*. It does **not** literally display 255 enumerated nodes, an eight-level binary wiring diagram, or a binary rune legend. A direct competitor is that the image is shared botanical chapter ornament, and p8 happens to carry 255 glyphs because of its printed prose length. Indeed the same sapling art is reused on pp8–14 with alternating page-margin positions ([original stencil report](lp2-p8-14-tree-stencil-source-gate.md)).

The separate, already well-investigated candidate uses the p8 **black 243** characters as `3^5` ternary cells. Its red title produces GP29 product operands `4|3` under the speculative p7 red-word product rule ([source p7→p8 decision](lp2-p7-p8-red43-dotseed-ternary-original-decision.md)). These alternatives make the binary interpretation less unique, so its status remains a testable hypothesis rather than an inferred instruction.

## Key-independent binary-state test

Suppose **each one of the 29 original GP rune symbols** represents a fixed bit throughout the full 255-rune p8 page, with all 29 assignments arbitrary/unknown. As an even more permissive rival, admit **58 freely selected bits**, one for each rune in red ink and one for each rune in black ink. The red/black split follows the original first12/source rest, even when a tree-order permutation moves those glyphs to new positions.

A full 255-rune cyclic binary code of maximum order-eight period has the following necessary, completely checkable condition: **all 255 cyclic eight-bit sliding windows are distinct and nonzero**. This property holds for every degree-eight primitive binary LFSR sequence, regardless of its primitive polynomial, seed, phase, inversion, or tap layout. It also holds for any order-eight binary de Bruijn cycle where the unique zero in its length-eight allzero run is deleted, producing a length255 nonzero-state cycle. Testing the necessary condition is stronger than enumerating only standard LFSR polynomials.

The tree presents three conventional ways to read 255 breadth-first numbered nodes: **preorder, inorder and postorder**, each with **left-first or right-first** children. To avoid overcommitting to how source glyphs enter the tree, test both directions of each arrangement, **BFS→DFS** and **DFS→BFS**, plus the untouched printed order. All are exact permutations of 255 original source positions. This creates **13 original reading orders ×2 hidden symbol alphabets = 26 key-independent SAT gates**. No word separators, punctuation, letters, source runes or physical red/black flags are altered; the hypothesis only reorders positions as explicitly stated.

For each case, declare a Z3 one-bit variable for every eligible source-rune class and construct its corresponding 255 consecutive cyclic eight-bit words. Ask whether there exists **any** assignment making all 255 words *pairwise distinct and different from 00000000*. No original plaintext, guessed key, language model, word-crib, polynomial, LFSR phase or English frequency selection enters this satisfiability question.

| Exact original source/implementation check | Result |
| --- | --- |
| Original physical p8 GP29 symbols | **255**, all 29 distinct rune classes present |
| Red/black source split | **12 red /243 black** |
| Printed-order secret binary map | **UNSAT**, both 29- and 58-bit alphabets |
| BFS→pre/in/post, both left/right child orders | **UNSAT**, all 12 alphabet-specific cases |
| Pre/in/post→BFS inverse, both left/right child orders | **UNSAT**, all 12 alphabet-specific cases |
| Total independently fixed original models | **26 UNSAT out of 26** |
| Positive order-eight primitive binary sequence plants | **6 SAT out of 6** |

The positive plants use an actual maximum-period255 binary order-eight register with tap mask `29`, seed `10000000`, and a two-rune synthetic GP symbolization. Each planted stream is rearranged to the physical source positions before the same SMT gate. Literal, BFS→preorder and inverse-preorder paths are tested under both global and separate-ink alphabets; all six pass. They establish that the solver can accept a true source-shaped binary register when one is present.

**Reproduce:** [single-file Python3.12 / Z3 original-source SFT](../sims/lp2_p8_binary255_tree_allsecret_sft.py), run by the [existing configurable p8 SMT CI](../.github/workflows/manual-p8-debruijn-exact-smt.yml), **[Windows CI PASS run 45020377131](https://github.com/FlareZ123/liber-primus/actions/runs/45020377131)**. The workflow installs pinned `z3-solver==5.0.0.0` and explicitly asserts the 26 source UNSAT gates plus six SAT plants.

## Cryptanalytic decision and remaining space

Under all thirteen standard binary-heap reading conventions, **the original full p8 glyph stream cannot be a fixed rune→binary encoding of a complete 255-nonzero-state order-eight register**. The conclusion survives independently unknown bit assignments to every rune class, including separate red/black alphabets. Consequently no secret polynomial, initial state or hidden phase could rescue this particular class; searching the 16 primitive degree-eight polynomial choices is redundant under this theorem.

**The actual source offers no independent printed instruction that says to enumerate all 255 runes as binary heap nodes.** The result excludes this concrete, simple full-page binary state hypothesis and prevents further arbitrary binary tree rephasing. It does **not** rule out a bit assignment changing with position or cipher state, an algorithm assigning multiple bits to one rune, a path-specific tree encoding, a differently selected nonstandard tree traversal, an external binary key, the distinct 243-rune ternary proposal, or a text encrypted by some unrelated method. Such routes would each need their own authored selector and decrypting operation.

No known unknown-page plaintext, original LP2 key material, or continuation was obtained. The strongest next move is to find an independently authentic binary/ternary decoding instruction, not to fit more secret rune-to-bit maps to the present ciphertext.
