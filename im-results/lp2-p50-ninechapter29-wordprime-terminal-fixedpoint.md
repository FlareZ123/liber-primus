# Mixed-radix nine-chapter word-prime pointer: an original terminal fixed point

**Agent47, 15 November 2026. Classification: independently executable source-conditional navigation hypothesis, without authenticated authorial instruction or plaintext recovery.** The manuscript’s 256 original numeric-table bytes can be interpreted as addresses in its nine visible chapters and 29-symbol GP alphabet. Under one natural but still speculative word-selection rule, the *last physical table cell* is the only fixed point, and one historical 2014 number reaches it in four moves. The original ciphertext remains unsolved.

## Frozen original inputs and path hypothesis

The physical pp49–51 numerical rectangle contains **256** original conventionally base60-decoded bytes, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The original scan’s **nine red-heading chapter boundaries** partition LP2 ciphertext pages 0–55 into `0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53, 54–55`. Their counts of complete punctuation-delimited printed words, assigning a cross-page word to its start page, are **[158, 255, 383, 437, 224, 326, 378, 669, 66]**. All nine contain at least 29 original printed words. The 29 Gematria Primus runes have independent known prime weights.

The historical signed 2016 text instructs that the book's *words are the map* and *numbers are the direction*. The original 2013 BASE29 challenge supplies a historical reason to use radix29. These sources motivate this bounded **investigator-proposed** state machine on cell index `s=0..255`:

1. Read the original printed cell's decoded byte `v=B[s]`.
2. Interpret `v` directly in mixed radix **nine × 29**: chapter index `q=floor(v/29)`, zero-based complete-word ordinal `r=v mod29`. Because `v≤255`, all original cells address `q=0..8, r=0..28` except the five unavailable addresses 256–260.
3. Select the `r`-th complete printed word of visual chapter `q`. Take the sum of its **original GP prime values**, then reduce modulo256 to get the next cell `s'`.
4. Repeat. Use the independently printed 2014 Wisdom square sum **1033** or signed Cicada identifier **3301** as two fixed diagnostic seed addresses modulo256. Neither the selected byte radix, first-29-word restriction, sum-to-next-state convention, nor seed assignment is an authenticated LP2 instruction. This is a human-executable candidate for the signed map/direction clue.

Unlike previously studied **Q252 = 9×28** quotient-key ciphers, this uses every unmodified physical byte as a pair of **chapter/word coordinates** and then returns a GP-prime **word-sum**; it does not divide the table polynomial, decipher ciphertext, or guess a cipher key.

## Exact original result

The final physical table cell is zero-based index **255**, with original printed byte **80**, decomposing as `80=2×29+22`. The selected **23rd complete printed word** in original visual chapter 2 (physical LP2 p8) is the exact rune sequence `ᚣᛋᚻᚢᛚ`, transliterated **Y.S.H.U.L**. Its genuine chart-prime sum is **255**. Consequently the last table cell points back to itself:

`B[255]=80 → (chapter2, word22) → ᚣᛋᚻᚢᛚ → primeSum255 → cell255`.

Among **all 256** original table addresses, **255 is the only fixed point** under this precise rule.

The historical **1033** gives starting cell `1033 mod256=9`, whose full path before its first repeated state is

`9 → 27 → 44 → 37 → 255 → 255`.

Specifically, those five read states select the source words `X.A.C.W.IA`, `C.F.N`, `I.NG.Y.E.C`, `Y.S.H.U.L`, and `Y.S.H.U.L`. Their respective source GP prime sums mod256 determine the displayed successors. The signed **3301** seed instead gives `229 → 91 → 210 → 183 → 156 → 171 → 148 → 167 → 101 → 187 → 156`: it enters a different, multi-cell cycle. No ciphertext changes, guessed language substitution, or free key parameters are involved.

## Conditional calibration and its serious limits

An exact deterministic **100,000-shuffle** control holds all original nine-chapter words and their GP prime sums fixed, along with the complete multiset of original 256 table-byte values, while uniformly rearranging those byte values across the 256 original physical cells. It scans the resulting same predeclared state machine from source seed9:

| Source-conditioned event | Shuffles |
| --- | ---: |
| Final physical cell255 self-points | **1,529/100,000** |
| Source seed9 visits cell255 at any time | **19,887/100,000** |
| Both events occur | **249/100,000** |
| Both and seed9 reaches its repeated state in at most five visited cells | **78/100,000** |
| At least one fixed point anywhere | **63,489/100,000** |

The observed conjunction is relatively uncommon in **this conditional shuffle model**, but the nine×29 mapping, chart-sum update and short-path stopping condition were recognized after viewing the data. The 78/100,000 fraction is therefore **not a discovery-wide p-value or proof of deliberate construction**. Unconditioned random source words, alternative original book segmentation, word ordinal conventions, or independent ciphertext not selected by the model may change the comparison. The conditional null also does not justify treating the p50 polynomial factorization, byte-pointer 11-cycle, or other same-table patterns as independent events.

## Decision relevant to actual solving

This reveals a **specific potential numerical navigation route** that a human could execute using the original 256-byte table, all nine original chapters, the published rune-prime alphabet, and a historical author-chosen seed. The exact terminal source rune word `ᚣᛋᚻᚢᛚ` remains **ciphertext**, with no translated meaning or decipherment operation. No original LP2 unknown plaintext, authenticated key, off-book address, or final destination is recovered.

A meaningful continuation would need independent original text/art selecting **chapter+word from the byte** and a way to turn the selected word/terminal address into a **testable plaintext or external key**. Without that, this is a visually coherent but underdetermined reader model and should not spawn random key families. The previously established p50 byte-pointer 11-cycle is a **different graph** and must not be mistaken for an independent verification of this proposed word-map step.

**Reproducer:** [single-file Node22 original-source test](../sims/lp2_p50_ninechapter_29word_primepointer_sft.cjs) using the existing cross-page word parser, byte-hash guard, assertions on the full fixed-point census, both historical-seed paths, and a deterministic exact-byte-multiset permutation null. Source corpora: [original scans, table, and GP29 transcription](../resources/liber-primus/), [signed 2016 text](../resources/historical/cicada2016-4gq25-outguess.asc), and previously documented [historical 1033 pointer](lp2-grid-byte-pointer-11cycle.md).
