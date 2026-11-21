# The p0 13-dot marker as a 2014 square central-diagonal mask: an exact original-cipher obstruction

**Agent 29, 21 November 2026. Classification:** newly bounded source-visible geometric possibility; decisive negative for its most direct key-transfer class, with no unknown-page plaintext recovered. This complements the already documented red13 DH-state serializer and the independently investigated 2014 5–7–5 square / terminal 99-unit geometry. It is specifically a **p0 title receiver** test, not another p55 square-count proposal.

## Why a solver would consider this

The original p0 red title ends with a 13-dot ornament. Pixel inspection and the existing original-mark SFT establish nine staggered rows containing

```
1,2,1,2,1,2,1,2,1
```

dots, and the three physical vertical columns hold **4|5|4** dots. The historical 2014 OpenPuff source `resources/cicada2014-openpuff-magic-squares.txt`, distributed before the May2014 LP2 pages, contains two complete **5×5** numerical squares (first and third source groups), separated by a 7×7 square.

Take any 5×5 original square, retain its **three adjacent main diagonals** `|row−column|<=1`, and rotate those thirteen cells by45 degrees using the invertible coordinate transform

```text
display_row = original_row + original_column
display_column = original_row − original_column
```

The output has exactly the original marker's nine-row pattern and the same physical **4|5|4** columns. This is a concrete geometric construction from a period-available original artifact; it does not require choosing a plaintext phrase. It does **not** prove the creator intended the source square as a p0 key.

## Exact no-secret obstruction

Both actual 5×5 source squares are invariant under a180-degree rotation. Reading their diagonal bands as left4 / center5 / right4, each resulting 13-integer packet is a palindrome, regardless of which of the two source squares is chosen. Therefore **every stationary rule mapping each square integer to one GP29 shift**, including an unknown arbitrary nonlinear function `f(number)`, necessarily yields a palindromic 13-rune key under the same natural physical dot order.

The original p0 title's first13 GP29 ciphertext indices are:

```
C = [15,8,18,3,6,19,27,0,15,26,18,21,5].
```

The already published, explicitly **conditional** signed-2016 candidate `EPIPHANY SEEKS` is GP29 `EPIPHANY SEECS`:

```
P = [18,13,10,13,8,24,9,26,15,18,18,5,15].
```

Any additive decoder of that candidate requires the exact original residual:

```
K = C − P mod29
  = [26,24,8,19,27,24,18,3,0,8,0,16,19].
```

All **six** mirror pairs `K[i]` and `K[12−i]`, for i=0..5, **differ**, while a stationary key extracted from either square band would require all six equal. This key-independent contradiction excludes *every source-value-only per-cell key*, no matter how the historical integers were secretly mapped to 0..28. It is conditional on the original `EPIPHANY SEEKS` plaintext candidate and on the particular physical 13-dot mapping.

An independent previously published p0 **raw title** candidate, `SECUENDI RATIO` in the one-rune-per-Latin-letter branch (`sims/lp2_p0_red_heading_raw13_register_geometry_sft.cjs`), provides a second explicit conditional control. Its GP29 candidate and required pad are:

```text
P_raw = [15,18,5,1,18,9,23,10,4,24,16,10,3]
K_raw = [0,19,13,2,17,10,4,19,11,2,2,11,2].
```

**Five of six** mirrored key pairs differ. Thus the same no-secret source-square symmetry also excludes the stationary per-value additive mapping if this distinct raw title is correct. These two cribs are incompatible interpretations of the original ciphertext; neither is asserted as verified plaintext.

Four direct source operations for each of the two 5×5 groups are additionally executable: raw-number mod29 or Euler φ(number) mod29, and ± additive sign. None produces that candidate from untouched p0 ciphertext; no coherent 8+5 GP-native plaintext is recovered. The exact positive control encrypts and decrypts an independently clear 13-rune p57 slice using each same source-derived key. All eight direct candidate inversions fail both conditional title readings.

## What this changes

The geometric match alone is insufficient to promote a title decipherment. A source-defined **position-dependent state update, an outside-in H transform, a different readout order or different text receiver** might break the palindrome; the 2014 original squares supply no instruction selecting one such operation. The previous conditional red13 DH-state serializer in [this report](lp2-p0-square-state-rise-key-serializer.md) uses distinct side-column packets and a retrospective rise grammar, so its case is **not** eliminated by this narrower argument.

**Result:** the 5×5 diagonal-band shape is exact and independently visible, and the most direct stage10-square numerical-key interpretation is excluded for the published title. Do not open arbitrary coordinate or permutation menus to rescue the model.

[Windows Node22 original SFT PASS, CI run 44937394995](https://github.com/FlareZ123/liber-primus/actions/runs/44937394995); the updated second-crib assertion is validated in the successor execution. A new first-party clue must independently select a nonstationary transformation before this geometric branch deserves further work.

**Run:** `node sims/lp2_p0_dot13_stage10_three_diagonals_sft.cjs` with Node22 on Windows. The original 2014 square file and unchanged original p0 ciphertext are read directly; no private parameters or fitted phases are used.
