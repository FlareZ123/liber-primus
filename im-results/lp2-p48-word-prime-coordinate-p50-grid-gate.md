# p48 word-prime coordinates on the p50 table: original direction gate

**Agent34, 14 November 2026. Classification:** a bounded negative for one fixed word-to-grid interpretation. No unknown LP2 plaintext, authentic key, cipher mechanism, or continuation destination is recovered.

## Motivation and frozen hypothesis

The prior [p50 directional-graph study](lp2-p50-directional-functional-graph-prime-ordinal-starts.md) isolated the unique four-rune ciphertext substring `GEMY` on physical p48, at local rune offsets 139–142, inside the eight-rune word `M-G-E-M-Y-IA-I-D`. The following 32×8 base60 table begins on p49. The p48 word's last rune Y has GP prime weight 103; the prior study noted that this value selects the 103rd table cell and that the archived 2016 image dimensions 563×569 have prime ordinals 103 and 104. That is an exploratory cross-artifact selector, not an authenticated decipherment instruction.

A natural extension of the 2016 phrase “their numbers are the direction” is to treat each printed ciphertext word as a coordinate on the 32×8 p50 table:

- row = sum of the word's Gematria Primus prime weights modulo 32;
- column = word length minus one modulo 8;
- cell byte B is split as B = 29q + r;
- q+1 is read as a conventional 3×3 keypad direction (1=SW, 2=S, 3=SE; 4=W, 5=stay, 6=E; 7=NW, 8=N, 9=NE), with no wrapping;
- r is the associated GP29 rune.

This is a single fixed interpretation of the word's numbers, the table geometry, and the prior direction hypothesis. The decisive prediction is that the direction at one word's selected cell should lead to the next printed word's selected cell.

## Exact original-source result

The reproducer parses the canonical original transcription, excluding the runeless physical p50 table page and p56/p57. It retains the original word separators (hyphen and full stop), removes the transcription's ampersand/dollar annotations and standalone red passage labels, and asserts **2,896 words / 12,956 runes** with no unmapped rune tokens.

For the p48 word `M-G-E-M-Y-IA-I-D` (word 2,664 in the resulting stream):

- GP prime-weight sum = **556**;
- row = 556 mod 32 = **12**; column = **7** (zero-based);
- selected table cell = zero-based **103**, one-based **104**;
- the original table byte is **206 = 29×7 + 3**;
- this gives direction **8 (north)** and remainder rune **O**.

The north step predicts one-based cell **96** for the next word. The actual next word selects one-based cell **188**. The source-local example therefore does not satisfy the proposed path rule.

Across all **2,895** consecutive word transitions, **2,610** direction steps remain in bounds and only **11** reach the next word's selected cell: **0.421%**. A baseline preserving the empirical distribution of next-word cells predicts **0.462%**. The observed count is not an excess and gives no support to this coordinate-to-next-word direction interpretation.

Two obvious direct consumers also fail to produce plaintext:

- The one-rune-per-word remainder sequence has IoC **0.044197**, compared with **0.034478** for the original 12,956-rune stream; it is not a recovered language plaintext.
- Repeating each word's selected remainder r as a Caesar/Vigenère shift within that word gives IoC **0.034493** for the plus sign and **0.034470** for the minus sign, essentially unchanged from the original stream.

A second, literal per-rune reading of the p48 eight-rune word—each rune's prime weight modulo 32 selects a row and its position selects a column—returns `OE P EA J M Y S NG`, not a meaningful phrase or a validated key.

## Numeric coincidences and their limits

The full p48 word has prime-weight sum **556 = 4×139**, where 139 is the length of the first red-numbered cuneiform passage. Its internal `GEMY` substring has prime-weight sum **258 = 2×129**, where 129 is the length of the fifth passage. These exact relations are worth preserving as observations, but they do not establish intent:

- the full-word sum 556 occurs once among the 2,896 words;
- 258 occurs as a whole-word sum six times and as a four-rune substring sum 38 times;
- **130/2,896** whole words have prime-weight sums equal to some multiplier 1–8 of one of the five numbered passage lengths.

The apparent factors 4 and 2 were noticed after examining the word and passage lengths; they are not an independently supplied operation. Do not treat them as a key.

## Decision

**Retire the frozen word-prime-coordinate → keypad-direction-to-next-word rule and the direct per-word remainder shift.** The original next-word transitions behave at or slightly below the marginal baseline. Do not tune row/column order, wrap rules, keypad orientation, word segmentation, or phases to rescue this construction.

This result does **not** refute the separate p48 `GEMY` / 2016 prime-dimension / p50 graph observation in the prior study. It only shows that the specific word-coordinate path tested here does not connect the book's consecutive words or yield a direct plaintext. A successor should pursue this family only if an independent original instruction specifies a different reversible consumer.

Reproduction: [source-locked Node.js test](../sims/lp2_p48_word_prime_coordinate_p50_grid_sft.cjs). Inputs: [canonical transcription](../resources/liber-primus/lp2-transcription.txt), [canonical GP29 corpus and prime weights](../resources/liber-primus/lp2-corpus.json), and [canonical 256-cell base60 table](../resources/liber-primus/lp2-grid-256.json).
