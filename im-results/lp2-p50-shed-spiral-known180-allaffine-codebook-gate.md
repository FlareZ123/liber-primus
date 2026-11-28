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

## Further all-secret original known180 gate: 32 free row offsets

The initial tests allow either a stationary secret two-character-token→GP29 lookup or that lookup plus any affine cell-coordinate term \(a\cdot r+b\cdot c\). An especially important remaining human-solve route is to use an *unpublished row key*: even if the table has 32 entirely unrelated row offsets, could p56+p57's **180 genuine plaintext runes** teach an exact numeric table decoder for p55's outer76? This has a direct payoff if it works, unlike tuned English scoring.

Grant every distinct original table token \(t\) a **completely arbitrary secret GP29 value** \(f(t)\) and every printed row \(r=0,\ldots,31\) a **completely independent GP29 secret offset** \(h_r\). The model is

\[
P_{r,c}=f(T_{r,c})+h_r\pmod{29}.
\]

Construct a bipartite constraint graph with 161 original token nodes and 32 printed row nodes. Every known inner180 GP29 plaintext symbol fixes a difference between one token-node and one row-node. A graph cycle whose required modulo29 differences do not sum to zero is an **exact contradiction for all secret codebooks and all 32 row shifts simultaneously**. All **16** original rectangular spirals (four corners×two directions×two authentic solved-page orders) contain such a contradictory original-source cycle. The executable gate preserves the first actual cycle with its individual source table coordinates and already-solved plaintext rune indices for each of the 16 variations.

A planted secret global token dictionary plus a deliberately nonlinear **32-value row clock** on the same real original numeric table is accepted, reproducing all **180** inner and **76** outer synthetic positions exactly. The test independently reconstructs true p56 prime-minus-one/F-hold and asserts **85/85 original ciphertext symbols**.

This **strictly strengthens** the affine-coordinate result: the 841 linear \(a,b\) combinations are replaced with the entire \(29^{32}\) family of independently chosen row offsets, without restricting even one secret token mapping. No additional row-key value can repair the contradictory cycles.

[Complete original-source all-secret graph-cycle code and 16 source-path witnesses](../sims/lp2_p50_shed_spiral_known180_allsecret32row_cycle_gate_sft.cjs).

## Decision: what is and is not excluded

The 76 outer / 180 inner source geometry survives as a potentially intended *layout*, but the natural decoder route **fails for every one of the 16 fixed source spirals even under a fully free 32-row secret additive clock and a completely free token dictionary**. A hidden nonlinear position-dependent state machine, secret token permutations within rows, additional private side input, or a different source-selected ring interpretation could escape this model; none is selected by the original clues at present.

There is no consistent calibrated inner180 decoder from which to predict p55, so outputting majority-voted unknown runes would **manufacture false plaintext**. Before expanding this branch, require an original authored operation that specifically changes the token/row dependence, then prospectively reproduce solved original plaintext before attempting the 76 unknown runes.

[Single-file source-only Node22/CommonJS SFT](../sims/lp2_p50_shed_spiral_known180_allaffine_codebook_sft.cjs) prints every 16-case exact maximum, audits the full 256-cell spiral path, verifies the 85/85 p56 known decryption and both positive plants. The original sources are the canonical LP2 corpus and unmodified p50 32×8 numeric table.
