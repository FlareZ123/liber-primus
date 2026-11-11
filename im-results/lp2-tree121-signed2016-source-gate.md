# The 2016 tree's 11×11 rune route: an exact affine selector and a failed full-book inverse

**Status: original-image/source geometry with a retrospective cipher interpretation.** This result supplies a newly explicit way to read the known affine operator from an original manuscript page and the independently dated signed 2016 clue. It does **not** recover unknown Liber Primus plaintext, a cipher key, a control-event mask, or the intended route. The separate full-book lossless inversions below are a bounded negative, and the selected affine interpretation has not been independently predicted.

## Source-derived finite reading

The signed January 2016 image includes the blurred leafless tree also printed on original Liber Primus **49.jpg, LP2 physical p32**. The relationship was already recorded by contemporary 2016 observers and by the repository's [2016 source audit](2016-image-dimensions-lag6-source-derivation.md). A sharper tree appears on **72.jpg, LP2 physical p55**; the direct p32→p55 visual relationship is independently analyzed in [the blur study](tree-outline-blur-crosspage.md). These are historically source-visible pointers, with no page obtained from fitted plaintext.

Original LP2 **p32 has exactly 121 GP29 ciphertext runes = 11²** and ends immediately with **one red thirteen-dot punctuation mark at local rune offset 121**. No line, word, rune, or punctuation is inserted or omitted. These source coordinates give a concrete, though conjectural, 11×11 row-major rune square. Its last punctuation supplies the number 13.

The authenticated 2016 JPEG canvas is **563×569** pixels. Reducing its dimensions modulo the visually selected page's *actual rune count* gives `563 mod 121=79`, `569 mod 121=85`. In the 11×11 reading these are **row7 column2** and **row7 column8** (zero-based), a **six-cell eastward displacement without crossing a row**. The two original p32 runes are **H** and **S**, respectively **GP ordinal 8** and **GP ordinal 15**, with GP prime values **23** and **53**.

The original page's thirteen-dot ending gives a finite arithmetic candidate: treat H=8 as the stationary origin, S=15 as a multiplier, and 13 as its exponent in GF(29). Exactly

\[
15^{13}\equiv 27\equiv-2\pmod{29},\qquad
8+15^{13}(x-8)\equiv24-2x\pmod{29}.
\]

Thus this **image-selected 8/15/13 tuple** reproduces precisely the independently discussed lag-six affine map `T6(x)=24−2x (mod29)`. All the input glyph indices and offsets are fixed before consulting any of the known **80/1,290** word-internal T6 hits. The *interpretation as a centered exponentiation* was conceived after the T6 operator had already been identified and must be regarded as post-selected. It cannot serve as independent validation of that operator.

The pair H→S at six-rune distance is **unique among all 121 circular starting positions of the unchanged p32 stream**: it appears only at original local offset **79**. Random cyclic source rotations would retain that pair once and place it at position 79 in **1/121** cases; the target pair was selected after the operator was known, so this is a conditional alignment count, not a discovery-wide significance level.

## A frozen original-cipher prediction and one reversible key family

A simple, testable **event-location prediction** follows from the same 79→85 six-step reading: use that physical-page-local offset pair on every unsolved page containing at least 86 runes. Among **53** eligible physical rune-bearing pages, only **pp8,33,40** satisfy `C[85]=T6(C[79])`, versus `53/29≈1.83` equality matches under an idealized uniform GP29 null. This is weak enrichment; the original tree page **p32 does not satisfy** the affine relation on its own selected H/S pair. There is no discovered source-selected sparse event mask that accounts for the existing 80 hits.

To test a direct key hypothesis beyond numerical coincidence, follow the visual six-step path around the entire 121-cell square starting at 79:

[
w_i=(79+6i)\bmod121,\qquad K_i=C_{32}[w_i].
]

Since `gcd(6,121)=1`, the first **121 positions are distinct** and this is a complete source-fixed permutation of the 121 actual original p32 runes. We evaluate the **whole original 12,956-rune unsolved LP2 ciphertext** using this fixed repeating key, with no fitted phase or source rotation, in 16 exact reversible settings: two source values (rune ordinal or its GP-prime weight), two signs, book-global versus physical-page-reset key clocks, and either direct additive GP29 or the preceding-ciphertext-excluding GP28 register with GP-EA represented by a repeated cipher rune. In the latter case each physical page's first rune is openly transmitted as an IV. The source p32 remains unchanged; target p55 is included in the original full-book test.

The **original decoded IoCs range from 0.0344587964 to 0.0352989407**, compared with untouched ciphertext IoC **0.0344783979** and independent source-native Latin Vulgate GP IoC **0.0722922902**. The best whole-book IoC is the EA-register, ordinal-valued, positive-sign, page-reset mode; its first 48 runes begin `S G G A NG T A N U O I P EO W H O R A D N H OE F M` and remain nonlinguistic. All **207,296** original-rune inverse/forward comparisons exactly reconstruct the supplied ciphertext, and all **207,296** independently generated Latin native-rune encrypt/decrypt comparisons recover their source plaintext. Exact reversibility proves the code's mechanics, while the native-language gap rejects this *particular* direct use of the tree walk as a GP-English decryptor. It does not rule out a byte register, an independently keyed nonlinear update, a direction-selected sparse mask, or a different role for the source pixels.

## Decision and transfer

This offers a **more manuscript-local coordinate reading** of the 2016 canvas dimensions than immediately reducing them against the unrelated 256-byte table: the 2016 visual tree independently selects p32, the exact 121-rune count selects 11×11, the two coordinates read H/S, and the page itself supplies the thirteen-dot number. The operator's algebraic interpretation is nonetheless retrospective, and the direct reversible inverse fails.

The productive question for the existing [Director Issue #18](https://github.com/FlareZ123/liber-primus/issues/18) is whether the **11×11 p32 grid or its actual printed word/line coordinates** independently defines **where** in the rest of LP2 the transformation should apply. Any new mask must be frozen before examining its ciphertext matches, and an actual solution still requires recognizable unknown plaintext and original-cipher forward reconstruction. Do not repeat the six-step direct global pad tested here or re-count the 80 previously discovered T6 matches as independent evidence.

**Reproduction:** [single-file Node.js 22 source, native positive controls, and exact assertions](../sims/lp2_tree121_signed2016_sft.cjs). Inputs: tracked `resources/liber-primus/lp2-corpus.json`, `lp2-ink-annotations.json`, source JPEGs 49/72, archived signed 2016 image, and `resources/control/latin-vulgate-heldout-gp.json`. Every numerical assertion above is printed or checked by the SFT.