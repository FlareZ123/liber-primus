# Can the solved p56+p57 teach a decoder for p55 via p50's literal spiral?

**Agent10, 28 November 2026; original-image / known-plaintext test. Classification: exact family-wide negative for a plausible source-specified 256-token transport, not a decryption.**

## The shortest human route from source to unknown plaintext

The visibly printed p49–p51 LP2 numeric table has 32 rows and 8 columns: **256** two-character numeral tokens. The original readable p57 PARABLE says **SHED OUR OWN CIRCUMFERENCES**. A single literal rectangular outside-in spiral of the table has exactly **76 outer cells** and **180 cells after that first circumference**. This matches the adjacent original physical runes exactly: p55 unknown **76**, followed by p56 **85** cipher runes with completely verified English plaintext and p57 **95** clear runes, so **85+95=180** independent authentic plaintext symbols.

This suggests a real solution route rather than a numerology-only match: use **the known inner180 labels to learn a byte→GP29 decoder**, then apply the learned decoder to the outer76 to recover the unknown p55. The weakest assumption is that the original table *encodes* those pages' plaintext with any common reversible label rule. Nothing in PARABLE expressly commands that this table is such a map. However, the available 180 authentic plaintext symbols make a strict *model-identifying* test possible without guessing p55.

Straight row/column lookups already failed in [the original-inner180 secret-codebook audit](lp2-p50-inner180-fullbyte-codebook-known180-gate.md). The present test changes the **source-motivated traversal** to all natural ways of literally shedding **rectangular rings**, and allows a stronger decoder with independently unknown affine coordinate drift.

## Complete, source-aligned finite family

Reconstruct the genuine complete p56 GP29 plaintext **AN END ... SEEK OUT THIS PAGE** from every unchanged source ciphertext rune using the original consecutive-prime-minus-one rule, literal plaintext-F at zero-based rune56, and zero-based prime start2; the script requires exact **85/85** replay. Append **all 95** originally legible p57 GP29 runes. No unknown LP2 glyph enters learning.

There are **four corners** of the 32×8 table for starting the outer ring, **two** clockwise/counterclockwise directions, and **two** chapter order readings (p56 then p57, or reversed as full page blocks)—**16** completely specified codebook calibrations. Every route traverses every original table cell exactly once, with the outer ring first, then each successively inner rectangular ring in the same direction. No row/column phase is optimized on language. The source GP29 runes are never altered, deleted or inserted.

**Secret decoder family 1:** let every original two-character printed number token (equivalently its one-to-one base59/base60 byte value) have an arbitrarily chosen 29-rune output \`f(token)\`. This grants **all 29^161 possible full-table codebooks**, including noninjective and unpublished keys. A repeated original token requires the same GP29 output. The exact best possible fit to all known180 pairs is

\`M = Σ_t max_v count(token=t, true_plaintext_rune=v)\`.

**Secret decoder family 2:** grant an additional completely arbitrary GF29 cell-coordinate drift

\`P(r,c) = f(token(r,c)) + a·r + b·c (mod29)\`

with any of **29×29 = 841** original-row/column slopes \`(a,b)\`, and a completely arbitrary function f. For each a,b compute the same exact per-token majority ceiling after subtracting a·r+b·c. There is no heuristic or incomplete key search: all 841 slopes and each globally optimized codebook are exhausted for each of the sixteen fixed source traversals. Constant intercept is already subsumed into f. This model covers additive row/column clocks with any secret stationary token label and all single-coordinate affine GP29 shifts, but not nonlinear position schedules, row-specific codebooks, secret transpositions, or changing the original physical page segment labels.

## Original known-plaintext outcomes

| All orientations (16) | Best known180 recoverable | Unavoidable mismatches | Any complete known180 codebook? |
|---|---:|---:|:---:|
| Unlimited secret stationary token→GP29 lookup | **134/180** | **at least 46** | No |
| Unlimited lookup **plus arbitrary a·row+b·col** | **137/180** | **at least 43** | No |

Each inner180 uses exactly **127 distinct original table tokens** (the same multiset, only order changes), thus 53 duplicate-byte observations provide severe all-secret consistency tests. The best no-affine reading is **BL corner / counterclockwise / p56 then p57**: 134 matches, 46 unavoidable contradictions. The best affinity-corrected scores are 137/180 at **TR / counterclockwise / p57 then p56** with one maximizing slope (4,3), and **BR / clockwise / p57 then p56** with example slope (7,25). The exact highest-scoring codebooks are *fitted in the most favorable way possible*; even granting them all remaining freedom, none can generate the known true English symbols in one consistent table-clock receiver.

The 76 outer cells contain 37 positions with tokens that have been seen inside the table. Had a compatible inner180 codebook existed, those 37 positions would have been direct provisional unknown-p55 predictions, with 39 unlearned positions left. But there is **no exact consistent inner180 calibration** under the tested models. Therefore using a majority map to print p55 letters would produce invalid manufactured “plaintext”; this report intentionally makes **no unknown-rune claim**.

A deterministic synthetic fully secret byte-codebook with source-coordinate drift \`7·row+11·col\` reproduces **180/180 inner** and **76/76 outer** when measured by the same testing code. The genuine p56 85/85 is an independent, authentic successful cipher replay—not synthetic.

## What is and is not excluded

The one-ring 76/180 geometry survives; **the simplest genuine-plaintext use of it does not**. This entire rather broad class of **stationary byte-label plus any affine row/column correction** is excluded for every source-natural rectangular-spiral orientation and either natural order of the two independently solved adjacent pages. A hidden nonlinear position-dependent cipher, an *independently* source-selected key, or a different segmentation could still exploit the table; none follows automatically from the observed counts. This prevents promoting circumference arithmetic into an invented recovered message.

To turn this back into a solution route, require an authentic instruction specifying a different **reversible** table operator with learnable state and at least one predicted, independently withheld original known-clear rune. The route should first reproduce the complete authentic 180-rune known page suffix before consuming p55.

[Single-file source-only Node22/CommonJS SFT](../sims/lp2_p50_shed_spiral_known180_allaffine_codebook_sft.cjs) prints every 16-case exact maximum, audits the full 256-cell spiral path, verifies the 85/85 p56 known decryption and both positive plants. The original sources are the canonical LP2 corpus and unmodified p50 32×8 numeric table.
