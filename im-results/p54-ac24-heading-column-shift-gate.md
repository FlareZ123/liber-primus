# p54 red-heading keyed column shifts: bounded original-cipher negative

**Classification:** intermediate, reproducible negative. No unknown plaintext, authentic key, or verified LP2 mechanism.

## Source-constrained hypothesis

Physical p54 (original scan `resources/liber-primus/71.jpg`) contains 232 runes. Its enlarged red initial is GP index 24, so the page count plus initial index is exactly 256, matching the printed p49–51 numeric table. p54 is the only rune-bearing unknown page with this exact count-plus-initial equality. Removing the first 24 table cells leaves 232 cells, naturally shaped as 29×8. The eight red runes following the enlarged initial are `[19,21,23,27,2,14,10,19]`, matching the eight columns.

A solver might therefore test the eight red runes as one cyclic row-shift amount per column of the 29×8 table tail, then use the shifted tail as a GP29 key for p54. This is more specific than an arbitrary table search, but the source does **not** explicitly instruct the solver to skip 24 cells, reshape the tail, or shift columns. It remains a bounded hypothesis, not an intended mechanism.

## Frozen inverse and controls

- Ciphertext: the 232 original p54 GP29 runes, including its printed heading.
- Table input: original p50 256-cell sequence, row-major, cells 24–255.
- Shape: 29 rows × 8 columns.
- Shift key: the eight red p54 heading runes after the enlarged A.
- Operation: shift each table-tail column by its corresponding heading rune index, modulo 29 rows; test both orientations only.
- Byte→GP29 readouts: byte mod 29, floor(29·byte/256), and byte mod 28.
- Additive directions: C−K, C+K, and K−C.
- Total: 2 × 3 × 3 = **18** fixed models. No phase, arbitrary permutation, or score-driven parameter selection.
- Every original candidate re-encrypts exactly under its declared inverse. Each of the 18 models also recovers a 232-rune native-GP positive plant exactly. As with any bijective additive model, round-trip correctness alone does not identify the key.

## Result

The raw p54 stream has IoC **0.03313927** and GP-English trigram score **−11.76473968**. The best candidate is shift direction −1, byte mod 29, K−C; it scores **−11.55819743**, IoC **0.03306464**, and begins `J IA I NG A IA H E AE W R B X E E S D E F M P T L EO`.

The weakest of **2,154** native-GP Gibran 232-rune holdout windows scores **−8.65110581** (median −8.01373942). No candidate enters the native range: **0/18**. The best candidate remains about 2.91 nats/rune below even the weakest native-GP window and is not plaintext.

**Decision:** reject this exact per-column shift/additive table-tail interpretation. This does not reject other nonlinear or source-selected mechanisms and does not authenticate the 24+232 alignment as an instruction.

## Reproduction

Run `node sims/p54_ac24_heading_column_shift_sft.cjs` from the repository root. The script reads the original normalized corpus, numeric grid, and fixed Emerson/Gibran controls; asserts the p54 and table dimensions; runs the 18 frozen models; verifies original round trips and native-GP planted recovery; and checks that no output reaches the worst native-GP holdout score.

**No change to `results/README.md` is warranted:** this is a bounded intermediate negative, not an established plaintext or mechanism.
