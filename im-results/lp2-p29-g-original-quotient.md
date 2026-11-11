# Original physical p29: source-derived GF29 polynomial quotient

**Status: reproducible direct plaintext inverse with a negative original result.** No unknown Liber Primus plaintext, key, authenticated encryption mechanism or final destination has been recovered by this test. The literal polynomial-multiplication interpretation is closed for the specified page, alphabet and printed coefficient order. More elaborate or externally keyed mechanisms are outside its scope.

## Intended human path and independent source inputs

An independently reported original-source relation identifies the p39 red three-rune GP ordinal polynomial `G(X)=15X²+5X+27` and shows that physical LP2 p29 is the **only nonempty unknown page** whose original 277 rune indices form a polynomial exactly divisible by `G` over GF(29). This is a potentially actionable page-specific cue: multiplication by a degree-two source polynomial would add two cipher runes to a 275-rune native GP plaintext while providing a direct reversible quotient decoder.

The divisor is selected by p39's original red triad. The choice of **page 29**, in contrast, came from scanning the original page polynomials for zero remainder, and is postselected. Nothing in the original evidence independently instructs a human solver to divide p29 by the p39 polynomial. This is an affordable test of the most literal available consequence, not a proven solve path.

Original input is `resources/liber-primus/lp2-corpus.json`, Git blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, physical `pages[29].indices`, with rune indices 0..28 in printed order. GP symbols are polynomial coefficients from highest degree to constant. No symbol permutation, offset search, page rotation, alternate spacing or fitted key is used.

## Frozen inverse, original result and negative control

In GF(29), divide the original 277-coefficient polynomial `C(X)` by `G(X)` using the unique inverse of leading coefficient 15. The exact result is a **275-rune** quotient `Q(X)` with remainder `[0,0]`. Re-multiplying `Q·G` reconstructs all 277 original rune coefficients identically; this is an implementation check, not independent identification of an authentic key.

| Quantity | Original result |
| --- | --- |
| Physical original page | p29, 277 GP rune coefficients |
| Source divisor | `[15,5,27]` (highest degree first) |
| Quotient | 275 GP rune coefficients |
| Remainder | `[0,0]` |
| Original p29 index of coincidence | **0.03369434416** |
| Quotient index of coincidence | **0.03405441274** |
| Adjacent equal pairs | original **4**, quotient **11** |
| Separate signed-2013 H divisor `[24,26,3]` | nonzero remainder **[16,20]** |

The first ninety quotient runes, transliterated with the repository's unmodified GP29 convention, read:

`RGYIAJNSAESNGWFEYHEAWCDEOGUEFOETHEAGXPCPIAYWAESTHFFFJWHOBGDXOEAEGIDAIAIAOUBEAAXEAWLRYIBTYLUHNJHRRWADTLYXOEIF`

This does not resemble ordinary GP English. The nearly uniform quotient symbol collision index is inconsistent with a straightforward natural-language readout and does not reveal any recognizable instruction. The distinct signed-2013 polynomial H (from authenticated `BASE29 3301 → 3QO`) fails the same zero-remainder check for this page.

A **source-native positive implementation control** forms a 275-rune GP stream by repeating the already solved p57 original GP symbols, multiplies it by the same `G`, and divides the 277-rune synthetic cipher. The inverse recovers all **275/275** original-source control symbols exactly; multiplication restores the planted 277 coefficients. This confirms the implemented method would recover authentic GP data when such data had actually been encoded by the proposed operation.

## Decision and reproducibility

The finite hypothesis `C_p29(X)=G(X)·P_GP(X)`, with the source G and the published coefficient order, fails as a **direct natural-language GP29 decipherment** despite its exact divisibility. The zero remainder might be a deliberate code/checksum, an intermediate transform or a coincidence. A source-fixed outer key, state, decoding register or independent page selector would be required before further interpretation. Do not salvage a readable output by trying arbitrary GP symbol permutations, text shifts or layouts after seeing the quotient.

Reproduction: [single runnable CJS control](../sims/lp2_p29_g_polynomial_quotient_sft.cjs) using the existing canonical JSON and solved p57. The first bounded original-cipher test was independently executed by Agent31 and handed to Agent21, who reported the factor relation, in [its research mailbox](../communications/agent21/20261111T1409Z_agent31_p29-g-quotient-source-gate.md).

This is supporting research in `im-results/`. It does **not** change the established manuscript-state synthesis in `results/README.md`.
