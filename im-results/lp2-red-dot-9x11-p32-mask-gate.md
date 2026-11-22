# 9×11 red-dot mask / p32 extraction gate

**Status:** structural correspondence established from source counts and image geometry; proposed p32 one-time-pad extraction rejected.

## Construction

The original p55/p57 images have three large red-dot clusters in page order:

- p55 terminal: 13 dots, nine rows with counts 1,2,1,2,1,2,1,2,1
- p57 early: 13 dots, the same nine-row pattern
- p57 terminal: 23 dots, nine rows with counts 3,2,3,2,3,2,3,2,3

The image-derived row geometry is documented in [Agent32's red-dot addendum](../communications/broadcast/20261112T215329Z_agent32_red-dot-geometry.md); the normalized punctuation locations and counts are in `resources/liber-primus/lp2-ink-annotations.json`.

Putting the clusters in historical square order 5/7/5 requires the cyclic sequence **p55 terminal 13, p57 terminal 23, p57 early 13**. This uses the parable's "The end is only the beginning" as an ordering clue. Concatenating the three row patterns gives a 9×11 binary mask:

- band widths 3,5,3, matching the inner widths of the 5×5 / 7×7 / 5×5 historical squares;
- 9 rows and 11 columns;
- 49 marked cells and 50 blank cells.

The 50 blanks exactly match **43 p55 word-interior runes + the seven-rune p57 heading PARABLE**. The 49 marked cells plus those 50 payload positions fill 99 positions. Independently, the square circumferences have 16+24+16=56 cells, while 13+23+13=49 dots leave 3+1+3=7 positions, exactly the length of PARABLE. Also, p55's 33 word-boundary runes equal 13+13+7.

These are exact structural counts. They do **not** yet establish that the 9×11 mask is the intended cell placement or that the 49 dots map one-to-one to square-perimeter cells.

## Decisive test: use the mask to select p32

A source-constrained follow-on hypothesis was that the 9×11 mask aligns to p32's 11×11 rune map after shedding its first and last rows. The 50 blank positions then select a 50-rune p32 key, paired in row-major order with the 43 p55 interior runes followed by PARABLE.

The exact test was:

1. Build the 9×11 mask in 13/23/13 order.
2. Select p32 rows 1–9 at blank mask positions.
3. Pair those 50 GP indices with p55-interior + PARABLE.
4. Test both additive directions modulo 29.
5. Repeat in the transposed orientation, selecting p32 columns 1–9.

**Result:** neither orientation produced recognizable plaintext. The selected p32 strings and all four outputs are preserved by the reproducer. This rejects the direct additive one-time-pad interpretation of this particular mask-to-p32 alignment; it does not reject the mask geometry or other operations.

## Remaining useful question

Can the original dot coordinates, together with the 3/5/3 inner widths, uniquely map the 49 marked positions and seven PARABLE letters onto the 56 perimeter cells of the three historical squares? Until that placement is source-fixed, do not launch a permutation or cipher-family search.

## Reproduction

Run from the repository root:

```sh
node sims/lp2_red_dot_9x11_p32_mask_gate.cjs
```

The script reads only `lp2-transcription.txt` and `lp2-corpus.json`, asserts the 43/7/49/50 counts, and prints the exact masks, selected p32 keys, and four tested outputs.