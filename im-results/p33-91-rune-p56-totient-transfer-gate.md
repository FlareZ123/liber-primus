# p33 91-rune interlude: fixed p56 prime-totient transfer (negative)

**Status:** intermediate negative; Issue #358. This tests one fixed transfer and does not exclude other cipher families.

## Input and source cue

Use the first titled unit on original physical p33 (scan `50.jpg`), source-local rune interval **[0,91)**: 91 GP29 runes, 23 source words, with a 10-rune red heading at local offset 0 and a 13-dot red separator at offset 10. The same red-title/13-dot layout appears on solved p57's seven-rune `PARABLE` title. This makes a transfer of the solved p56 prime-totient stream a plausible single human experiment, but the typography selects the unit boundary, not the cipher family.

The unit's first 91 GP29 indices have SHA-256 `b1b5e2158180d53991b59b4063955f9dd29b36c273d6bc96c14d766934ed7b2a`. The first 10 runes are the red title. The next titled unit begins at p33 local offset 91; the cuneiform illustration is below that second heading and is outside this test.

## Frozen operation

Transfer the solved p56 rule exactly at the unit start:

\[P_i=(C_i-(p_i-1))\bmod 29,\]

where `p_i` is the i-th prime beginning with 2. The clock begins at p33 local rune 0 and advances continuously through title and body; it does not reset at the 13-dot mark, spaces, or printed lines. No p33-specific literal-F skip is applied: the p56 skip at local position 56 is a page-specific exception, not a general selector. The p33 input has literal-F runes at local positions `[4,12,48]`.

The one wrong-key control uses `p_i` rather than `p_i−1`, with the same start and no skips. Both transforms are inverted exactly by their corresponding forward encoder; round-trip success is a code check, not evidence for either key.

## Controls and readout

- **Authentic positive control:** the solved p56 85-rune page, with its independently established single literal-F skip at local position 56, decodes to `AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE`. The reproduced English-quadgram score is **−4.46164858** mean log10 frequency per quadgram.
- **p33 raw input:** **−7.51426045**.
- **p33 fixed φ(prime) transfer:** **−7.35058202**; the first 10 red-title runes read `OE I I EA M IA H E S W` (not a word or phrase). The 91-rune output hash is `b55966c2dc495696707a4204f060c8d914d493a3f297e5bdf4bf5f07773ade73`.
- **p33 wrong-prime control:** **−7.46420716**.

The last 23 runes (local offsets 68–90) were frozen as the held-out readout before their quadgram score was computed. The predicted sequence is `P AE TH T U EO OE H T EA B C G T P I E O TH R I P E` (GP29 indices `13252161122281628175616131018324101318`). Its score is **−6.62864739** over 26 quadgrams, versus **−7.57811946** for the wrong-prime control and **−8.33517026** for the raw segment. This modest relative improvement does not produce readable words and remains far below the authentic p56 control. The score model is `resources/control/duko_round27_english_quadgrams.txt`, using mean `log10((count or 0.01)/total)`.

Reproducer: [`sims/p33_91_p56_totient_transfer_sft.cjs`](../sims/p33_91_p56_totient_transfer_sft.cjs). It asserts the original interval, p56 positive control, exact round trips, p33 input/output hashes, and reports the frozen holdout plus raw/wrong-key/positive-control scores. It performs no start, sign, phase, F-mask, or key search.

## Decision and missing input

Reject only the direct p56 φ(prime) transfer to p33 local `[0,91)` with a clock beginning at rune 0 and no p33-specific skip. The shared title/13-dot typography is not a source-authenticated cipher selector. No second reversible operation is justified: the p32 map, p15 spiral, 2013 `BASE29` protocol, and 1033/3301 cuneiform pair do not prescribe an operation on this first 91-rune unit. The exact missing input is a source-authenticated cipher/key-state selector or a plaintext crib for the p33 interlude. Keep the source segmentation; do not expand arbitrary prime starts, affine keys, word resets, or F masks.
