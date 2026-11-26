# p22 three-rail fence: direct and source-grid composition decisions

**Current decision (26 November 2026):** neither the direct three-rail readout nor its reversible composition with the exact p15 Fibonacci-prime spiral's 16 printed values recovers native plaintext. The literal-F variants of the composition have zero legal paths; ordinary variants are nonprose. Both are bounded negatives, not evidence against all transpositions or all uses of the p15 table. No new plaintext or authenticated key.

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

**Reject the standard three-rail fence on both the original p22 page and the complete p15–22 chapter.** The visual three-bar clue is genuine but does not select a successful rail-fence readout. No plaintext or key was recovered. Do not expand this into alternate rails, offsets, per-word transforms, or rotations without a new independent source clue. The fixed p15-grid composition below is a separate conditional joint-source test, not a change to the direct result.

Full inputs, both complete output strings (runes and GP transliteration), counts, round-trip checks, and scores are in `im-results/lp2-p22-three-rail-fence-sft.json`; regenerate them with `node sims/lp2_p22_three_rail_fence_sft.cjs`.


## Fixed p15 spiral-key / p22 rail composition (Agent7, 26 November)

The two original graphics motivate a conditional compositional decoder: the p15 [source-exact 16-value spiral](p15-fibonacci-prime-spiral-historical-source-gate.md) supplies a repeating GP29 additive shift vector, while p22's three bars suggest the conventional three-rail fence. Neither illustration independently specifies this cryptographic role or layer ordering. This was a bounded direct plaintext recovery attempt; no free phase, alphabet, rail count, fitted offset, or extra layer was introduced.

Use the printed clockwise spiral values `22,21,19,17,11,1,10,3,20,22,25,7,22,12,17,21` after reduction mod29, with phase zero and continuous state. Test the standard three-rail transformation and its inverse, each before or after additive encryption, both signs, both ordinary and historical plaintext-F transparent clocks. The original scopes are p15 black body after 20 red runes through p22 (1,883), and p16–22 (1,744). The scopes overlap and are not independent heldouts. For literal F, every consuming/holding alternative is counted exactly with a 16-phase integer DP; decoding uses the correct inverse of the rail permutation. All extant complete paths up to 10,000 are exhaustively scored in recovered plaintext order; none exist on either original scope. Ordinary outputs exactly replay.

| Scope | Ordinary variants | GP29 IoC range | Native bigram log gain per transition | Literal-F variants | Zero-based first dead key-stage position |
|---|---:|---:|---:|---:|---:|
| p15-body-through-p22 | 8 | 0.03430041–0.03472989 | -0.749741–-0.622544 | 8/8 impossible | 2–167 |
| p16-through-p22 | 8 | 0.03437011–0.03464250 | -0.702864–-0.616931 | 8/8 impossible | 5–134 |

A fixed add-half conditional bigram model trains on the first seven native solved sections only, score \(\log(29p(P_i\mid P_{i-1}))\). The two held solved records p56 and p57 yield +0.689659/+0.756681 nats per transition. Encrypting each through all eight frozen layer/sign combinations gives 16/16 exact ordinary recoveries and 16/16 exact best-scoring transparent-F recoveries (1–70 legal paths; all enumerated). These are held authentic plaintext records but short (85/95 runes), not matched full-chapter-length plants. Transparent-F rejection on original is algebraic and does not depend on language calibration. Ordinary nonprose is a finite direct-readout negative.

[Single-file CJS reproducer](../sims/lp2_p15_p22_spiral_rail_composition_sft.cjs) · [raw candidates, counts and source blob IDs](lp2-p15-p22-spiral-rail-composition-output.json). The exact core was executed in connected V8 on the pinned repository JSON inputs; the standalone Node wrapper was not separately run. Freeze commit 72a99ef8ceb61af661648b8f71ee37b932d2401f preceded original scoring; raw commit 2b928d2706d83fb46ef216a1056128ae7e1f814e. Do not escalate to arbitrary rail counts or keys from this negative. A genuinely selected new source operation is needed.
