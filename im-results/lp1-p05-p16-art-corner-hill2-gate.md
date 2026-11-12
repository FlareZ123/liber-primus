# LP1 p05/p16 source-selected 2x2 corner Hill transfer to original illustrated LP2 pages

**Status:** finite, original-cipher negative under the GP29 native-English register. All proposed matrices are exact source values and all ciphertext runes are original. No unknown LP2 plaintext, key or destination recovered.

## Motivated source path

Original LP1 p05 SOME WISDOM supplies a 5×5/1033 square whose corners are `[[272,151],[151,272]]`, alongside the source-identical moth now printed at 2.33× on LP2 p53 and p55. Original LP1 p16 KNOW THIS supplies the 5×5/3301 square whose corners are `[[434,966],[966,434]]`. LP1 p16 is uniquely shared between the original LP1 source-page sets for the insect copied to LP2 p2 (LP1 pp9,13,16) and the reclining footer copied to LP2 p22 (LP1 pp14,15,16). These copied-art relations are independently anchored to original images in [the original-image census](lp1-lp2-crossrelease-artwork-raster-copies.md).

The two corner matrices modulo the canonical 29-rune alphabet are exact, symmetric, and invertible:

```text
M05 = [[11, 6], [ 6,11]]     det = 27 mod29
M16 = [[28, 9], [ 9,28]]     det =  7 mod29
```

The [independently proved sixth-power projective relation](lp1-lp2-fibonacci-mobius-conjugacy.md) shows that these two matrices are connected over F29. A natural inexpensive cipher-transfer hypothesis is a conventional **2×2 Hill pair cipher** on the original GP29 rune stream. The weak premise is explicit: the books identify squares but do not say that *their corners* form block-Hill encryption keys. This is a bounded operation check, with no fitted key phrase, cipher alphabet, orientation, matrix exponent, position-dependent phase or extra layer.

## Frozen original inverse

Pair successive original GP29 runes in reading order, starting from index zero of each page. Try the two historically simplest orientations for each source matrix: ciphertext `C=M*P` (decode `P=M^-1*C`) or ciphertext `C=M^-1*P` (decode `P=M*C`), with column vectors modulo29. The source-paired targets are LP2 p2/p22 → M16 and LP2 p53/p55 → M05. p55 has exactly **76 original runes**, so both inverses cover its entire ciphertext. On the odd-length pages p2 (201), p22 (131), and p53 (179), only their maximal even prefixes (200,130,178) are tested; the final symbol is explicitly omitted, with no invented padding or singleton rule.

| Target and source matrix | Original prefix IoC | P=M^-1*C IoC | P=M*C IoC |
| --- | ---: | ---: | ---: |
| LP2 p2, M16, 200 original runes | 0.035622 approximate whole-page | **0.03557789** | **0.03442211** |
| LP2 p22, M16, 130 runes | 0.035819 approximate whole-page | **0.03553965** | **0.03136553** |
| LP2 p53, M05, 178 runes | 0.033520 approximate whole-page | **0.03815146** | **0.03466006** |
| LP2 p55, M05, all 76 runes | **0.03789474** | **0.02947368** | **0.03333333** |

None produces sustained GP29 words. On p55, the two complete inverses start `OIAIATHNGJNGOPEIOIFOEBAEWDNUHFLLY...` and `RAHNGOERIANEDOERSXCGLXEOAAEUHEDJL...`, without credible readable text. For comparison, solved LP2 p57's first 76 native-GP runes are visibly nonuniform, whereas these candidates remain near a random 29-symbol distribution. The original p55 complete-word boundary information is retained in the input but is not made into an extra fitted key schedule.

**Reproducible positive controls:** the [single-file CJS implementation](../sims/lp1_square_corner_hill2_artlink_sft.cjs) checks each inverse against its exact forward matrix, reconstructs all source ciphertext positions and plants the first 76 independently solved p57 runes through both source matrices, recovering all 76 rune indices exactly. Its original exact numeric outputs are checked by assertions. The existing LP1 source [manual GitHub Actions run 43140928417](https://github.com/FlareZ123/liber-primus/actions/runs/43140928417) succeeded in Node22, including this SFT.

## Decision

Reject these particular **direct pair-block HilI GP29 key transfers** as whole-p55 (and even-prefix p2/p22/p53) decryptions. The artwork links identify a plausible **source square**, but do not select a different matrix readout, skip clock, two-rune alignment or nonstandard language. Other 5×5 Hill and additive square mechanisms had already been examined independently. This negative should not trigger further key/phase grids without an original image or text instruction that distinguishes a new operation.
