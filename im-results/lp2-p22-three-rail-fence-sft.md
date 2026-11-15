# p22 three-rail fence test — completed negative

## Scope and visual clue

The original p22 scan is `resources/liber-primus/39.jpg` (512,143 bytes; Git blob SHA-1 `0270e099f35a00dc24a9dc673ce13d4a0a843802`). The central engraving contains three parallel vertical bars/posts ordered left-to-right across a horizontal beam. They are part of the main figure, not a repeated marginal ornament. The structure is real, but it is not an unambiguous picture of a conventional horizontal rail fence; the rail-fence reading is a plausible clue, not a textual instruction.

The canonical transcription gives p22 **131 runes**, six printed rune lines with lengths **22, 24, 23, 23, 19, 20**, and **25 printed words** with rune lengths **2, 2, 2, 6, 2, 6, 7, 4, 2, 14, 7, 11, 4, 3, 12, 3, 3, 4, 5, 8, 3, 12, 3, 3, 3**. The complete visual chapter p15–22 is **1,903 runes** across page lengths **159, 267, 273, 260, 271, 269, 273, 131**, with **421 printed word runs and 18 singleton words**, matching the current `results/README.md` synthesis. I used all 1,903 runes, including the initial p15 heading; I did not silently trim the first nine.

## Fixed operation

I removed word separators/punctuation and applied exactly two standard three-rail transformations to the continuous GP rune stream:
1. **Zig-zag then row-wise:** write the stream down/up across three rails, then concatenate the rails.
2. **Exact inverse:** partition the ciphertext into the three row lengths and read back along the zig-zag path.

No other rail counts, offsets, rotations, per-word/per-line variants, or added transformations were tested. Both implementations pass exact forward re-encryption on both scopes.

## Results

| Scope | Runes | IoC | Top-12 mass | Zig-zag → rows bigram score | Inverse bigram score | Same-length source-control windows |
|---|---:|---:|---:|---:|---:|---:|
| p22 | 131 | 0.03582 | 0.611 | -8.617 | -8.804 | 2953; both below min -5.672 |
| p15–22 | 1,903 | 0.03450 | 0.463 | -8.724 | -8.689 | 1181; both below min -5.365 |

The source-native GP29 control is the solved LP1 text plus LP2 p56 and p57: **761 words / 3,083 runes**, IoC 0.06229, top-12 mass 0.780. The p56 and p57 controls are 85 and 95 runes, with IoCs 0.07003 and 0.06271. The same-length control windows number 2953 for p22 and 1181 for the chapter. Both candidate readouts score below **every** corresponding control window. The three-rail operation also preserves the candidate's low unigram IoC and top-12 mass exactly, so it cannot turn these near-uniform streams into the source-native English distribution.

## Decision

**Reject the standard three-rail fence on both the original p22 page and the complete p15–22 chapter.** The visual three-bar clue is genuine but does not select a successful rail-fence readout. No plaintext or key was recovered. Do not expand this into alternate rails, offsets, per-word transforms, or rotations without a new independent source clue.

Full inputs, both complete output strings (runes and GP transliteration), counts, round-trip checks, and scores are in `im-results/lp2-p22-three-rail-fence-sft.json`; regenerate them with `node sims/lp2_p22_three_rail_fence_sft.cjs`.
