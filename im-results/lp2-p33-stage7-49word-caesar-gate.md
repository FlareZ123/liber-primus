# LP2 p33: Stage7 7×7 square as a 49-word Caesar key

**Decision (22 Nov 2026, Agent37): bounded original-input negative.** Original LP2 p33 has 214 GP runes and two red spans [0,10] and [91,8]. The preserved Rain source at resources/external/Liber Primus 57.txt shows **49 black printed fragments, 21 upper and 28 lower**. Their 196 runes equal the canonical p33 black body exactly. The 2014 Cicada Stage7 OpenPuff output (resources/cicada2014-openpuff-magic-squares.txt) independently supplies an original **order-seven magic square with sum1033**, matching the p33 cuneiform. The previously tested square transforms acted on contiguous runes; this investigation assigns one square entry to each actual printed black *word*.

The operation shifts every GP29 rune in word i by plus or minus square-cell i modulo29. Eight matrix orientation choices and two signs yield 16 tests; the square's half-turn symmetry leaves **eight unique outputs**. All source word boundaries are preserved; there is no fitted phase, skipped rune or postselected crib.

The [stand-alone original-source SFT](../sims/lp2_p33_stage7_49word_caesar_sft.cjs) asserts 49 word boundaries, 21/28 sections, and all 196 canonical rune values, then tests the 16 variants. It uses the repository's source-native GP29 trigram language model and a 346-type dictionary of solved words of at least 3 GP runes.

| Outcome | Original p33 | Best candidate | Worst candidate |
| --- | ---: | ---: | ---: |
| Mean GP source-trigram log score | -3.4439765254 | **-3.3935184160** | -3.4425894774 |
| Exact solved GP word types length >=3 | 0 | **0** | 0 |

All 16 encoder/inverse pairs reconstruct independently planted, exact-length-matched 49 solved-GP words, including the full source square. **Node22 CI PASS:** [run 44967086430](https://github.com/FlareZ123/liber-primus/actions/runs/44967086430) (22 Nov 2026 00:32Z).

The slight trigram increase and absence of any solved native word indicate no candidate plaintext. This only retires the precisely specified **original p33 printed black word → Stage7 square cell → uniform per-word GP29 Caesar** receiver for the source-native English register. The 49-word/7×7 correspondence remains a plausible navigation clue. No first-party instruction selects a separate decoder, key or original unknown-page plaintext.

## Source-selected nonadditive receiver check (23 November 2026)

The pinned first-party clear-signed Stage7 page authenticates the 99-number GEB book-code/ONION handoff. The fifth-onion README initially says the extracted squares' use is unknown, but that statement is superseded by the subsequent sixth-onion material: its outguess instructions explicitly tell solvers to create a Tor hidden service with CGI file upload and submit the three magic squares plus the service URL. The signed Stage8 form specifies the upload script path `/cgi-bin/upload`, the file field `file`, and a GnuPG public key at `/key.asc`; the HTML form has fields for the three squares (`53301`, `71033`, `51033`) and the onion URL. The archive then records three further LP pages returned after submission (107, 167, 229). Thus the square's authenticated historical role is a **submission payload**, not a 7×7 cipher key.

On original LP2 p33 image `resources/liber-primus/50.jpg`, the 49 black word units are split **21 upper / 28 lower** across **12 prose lines**. They are not printed as a 7×7 grid: there are no cell coordinates, row/column labels, or prescribed reading order. The cuneiform numerals 1033/3301 echo figures in the Stage7/OpenPuff chain, but specify no operator or word-to-cell mapping for p33.

Therefore the 49-word/49-cell and 1033-sum correspondences do not define an executable p33 decoder. The earlier 16 direct per-word Caesar variants remain negative. No source-selected nonadditive operation can be responsibly instantiated; the historical submission receiver must not be confused with a p33 cipher receiver. Do not run more square orientations, row/column permutations, eigenvalue/phase sweeps, or alternate word transforms without a new source instruction.

Prior source crosswalk and rune-stream matrix tests: [p33 Stage10 square key gate](lp2-p33-stage10-order7-1033-square-key-gate.md). Original operands: resources/external/Liber Primus 57.txt; resources/liber-primus/lp2-corpus.json; resources/liber-primus/lp2-ink-annotations.json; resources/cicada2014-openpuff-magic-squares.txt.
