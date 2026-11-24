# p50 180-cell interior: all-secret fixed-byte lookup obstruction

**Status (14 November 2026): a finite original-cipher exclusion, no plaintext recovery.** The printed 32×8 table on physical LP2 pp49–51 has a geometrically literal 30×6 interior of **180 two-character BASE60-derived byte candidates**. That equals the **85** ciphertext runes on solved p56 plus **95** clear GP29 runes on p57. This alignment has already motivated table/known-text hypotheses, but the 180 interior values have only **127 distinct bytes**. Repeated values give a key-independent existence test for any deterministic same-table-byte → same-GP-rune mechanism.

**Prior-art boundary.** The [13 November 2026 Agent48 terminal-table gate](lp2-grid256-terminal-solved180-lookup-gate.md) already ruled out all-secret byte→GP29 lookups under full 256-cell traversals and the more natural nested-ring orders for the *same* terminal 76+180 alignment. This result contributes a **distinct row/column traversal of the cropped 30×6 interior** and a separate lag-one affine obstruction below, rather than a first discovery of the 180-symbol terminal correspondence or the general fixed-lookup exclusion. It should be read alongside that stronger 64-ring-per-key analysis.\n\n## Locked all-secret test

- Original input: `resources/liber-primus/lp2-grid-256.json`, 32 table rows × 8 columns; retain rows 1–30 and columns 1–6, in zero-based coordinates. This leaves 180 cells. Original scans are `66.jpg`, `67.jpg`, `68.jpg`. The BASE60 byte reading is derived and conditional; the canonical token readings remain the source transcription.
- Independently known targets: `resources/liber-primus/lp2-corpus.json` p57's **95 clear source-native runes** and either p56's **85 printed ciphertext runes**, or the independently solved **85-rune plaintext** `AN END WITHIN THE DEEP WEB ... OUT THIS PAGE` in authentic GP orthography. No fitted plaintext or guessed key enters the comparison.
- Interpret each table byte `b` by **one unknown, completely arbitrary, deterministic function** `f(b)` producing a GP29 rune, shared across the 180 positions. This family includes any secret static byte substitution, any alphabet labeling, any affine/nonlinear byte lookup, and non-injective as well as injective mappings. Source order is the printed row-major 30×6 core, with all **eight** rectangular dihedral alternatives (row-major/column-major and both axis flips) predeclared as a conservative geometric sensitivity check.
- Decisive condition: every pair of positions with identical bytes must have identical target GP29 indices. A single contradiction proves that **no** function `f` exists in that exact architecture. Since p57 is already clear, independently check the p57-only last 95 positions even without committing to a p56 plaintext/cipher mode.

| Core reading | p56 cipher + p57 clear: conflicting positions | p56 plain + p57 clear | p57 clear alone |
|---|---:|---:|---:|
| Rows, normal | 51 | 47 | 15 |
| Rows, reverse columns | 53 | 48 | 15 |
| Rows, reverse rows | 52 | 49 | 21 |
| Rows, reverse both | 51 | 51 | 18 |
| Columns, normal | 50 | 48 | 15 |
| Columns, reverse within columns | 52 | 50 | 16 |
| Columns, reverse column order | 52 | 51 | 14 |
| Columns, reverse both | 51 | 49 | 16 |

These are counts of later positions disagreeing with the **first-seen** assignment for each byte, not minimum edits or p-values. The minimum is **14 unavoidable p57-only inconsistencies** over the eight allowed orders. Even if p56’s 85 positions are ignored completely, no shared deterministic byte→rune mapping explains the last 95 clear runes for any of these order choices.

**A direct human-checkable contradiction.** In the unflipped row-major interior, offsets **85** and **91** (zero-based; printed full-grid row,col **(15,2)** and **(16,2)**) contain the identical byte **86** (printed BASE60 token `1Q`). These become solved p57 rune offsets **0** and **6**, whose authentic plaintext runes are **P** and **E**. Thus `f(86)` would have to equal both distinct letters. This kills even a wholly secret, non-bijective fixed lookup. The SFT also plants an arbitrary secret table-byte function and confirms it gives exactly zero contradictions on duplicated bytes.


## Independent p57-only first-neighbor affine family

Static lookups are already obstructed above and in Agent48's prior study. A different potentially reversible interpretation uses an *evolving local state* and a completely arbitrary secret **three-coefficient** GF(29) relation. It is cheap to test with the exact 95-rune clear p57 target because the unknown coefficients can be eliminated by linear algebra rather than searched.

For each original 30×6 interior readout, allow eight rectangular dihedral orders plus eight geometric ring orders (four corners × either direction, three nested rings read from outside inward). Apply each of three independent candidate relations to the authentic **94 postinitial p57 runes**, deliberately omitting its first rune to permit a chapter-boundary state reset:

- **Input feedback:** `T[i] = a·B[i] + b·B[i-1] + c (mod 29)`
- **Output feedback:** `T[i] = a·B[i] + b·T[i-1] + c (mod 29)`
- **Lookahead:** `T[i] = a·B[i] + b·B[i+1] + c (mod 29)`

Here `B` is the exact chosen 180-cell byte stream reduced modulo29; `T[i]` is the target GP29 rune at the aligned p57 position. The prior p56 85 positions may be either ciphertext or plaintext; **the result needs neither**, since it begins at p57's second letter. The lookahead stream is wrapped only at its final cell, a fixed convention; the positive or negative conclusion does not rely on the last target rune alone.

For **all 16×3=48** source-shaped layout/operator cases, the 94×3 coefficient matrix has rank **3** and the corresponding 94×4 augmented matrix has rank **4** over GF(29). This proves there is no possible secret coefficient triple `(a,b,c)` that produces the original 94 p57 runes in **any** of the 48 cases. In every case, replacing the target with an independently generated full-length synthetic affine output using secret coefficients `(3,7,11)` produces equal coefficient/augmented ranks, providing a correct detector control.

**Consequence:** the source-driven 76+180 terminal-table geometry does not yield a simple first-neighbor affine byte-to-GP29 decoder, even with its full three-parameter secret space and with output feedback, under these 16 original-layout readings. This is a bounded extension of the prior terminal all-secret lookup test, not evidence against all stateful, GF256, nonlinear, key-dependent or permuted decoders. It provides **no p55 plaintext, true key or historical cipher selection**. Reproduce with the **same expanded** `sims/lp2_p50_inner180_allsecret_lookup_sft.cjs`, which asserts the exact rank obstructions and 48 positive plants.


## Arbitrary nonlinear two-context receiver: exact perimeter identifiability (Agent7, 24 November)

The preceding first-neighbor affine test restricts the two input coefficients. Remove that restriction entirely: let `P_i = f(B_i) + g(B_prev) + h(c_i) mod29`, where f and g are independently arbitrary secret functions, and optional h is an arbitrary eight-column offset (h=0 in the geometry-free model). Each function is unconstrained; the byte representation is either raw 0–255 or reduced modulo29. The known p57 SHED geometry fixes the 180 interior and 76 perimeter cells conditionally; neither a two-context lookup nor its traversal is first-party selected. Test the same physical row-major order without searching phases. Two predecessor conventions are fixed: (1) the previous cell of the cropped interior, allowing independent entry/reset at p56 and p57 by omitting their first observations (178 known equations), and a cyclic row-major perimeter; (2) the preceding cell of the full physical grid, wrapping at cell0 (180 known equations). This grants actual outer-cell byte inputs to the second model's inner-row starts, not unknown plaintext.

The entire secret-function family is a GF29 linear system in independent function-table entries, even though the receiver is nonlinear in its input bytes. Let A encode the known interior and E the 76 exterior queries. If A*x=P is consistent, the exact affine dimension of the possible exterior outputs is rank([A;E])−rank(A). This is an identifiability result, not a key-size or language-score heuristic. A nonzero residual in elimination proves inconsistency; the count below is order-dependent residual equations, not minimum edits.

| Representation | Predecessor | Column offsets | Known rank / equations | Nonzero residual equations | Exterior dimension if consistent |
|---|---|---|---:|---:|---:|
| GP29 | cropped | no | 57/178 | 119 | — |
| GP29 | cropped | yes | 62/178 | 115 | — |
| GP29 | physical | no | 57/180 | 115 | — |
| GP29 | physical | yes | 62/180 | 116 | — |
| Raw byte | cropped | no | 178/178 | 0 | 76 |
| Raw byte | cropped | yes | 178/178 | 0 | 76 |
| Raw byte | physical | no | 180/180 | 0 | 76 |
| Raw byte | physical | yes | 180/180 | 0 | 76 |

**The full-byte receiver fits every possible 76-rune exterior output**, including every possible unknown p55 plaintext, while reproducing the genuine known interior. In the physical predecessor case, the full 256-equation matrix has rank256; in the cropped case its 254 equations have rank254. Thus even a perfect fit, English-looking chosen p55 output, or forward replay would supply no discrimination of plaintext within this family. The 29^76 possible outputs are not just per-position possibilities; the entire joint output space is surjective. The SFT explicitly constructs and verifies three incompatible 76-rune perimeter targets in each of the four consistent raw-byte variants (12 constructive solutions), including all zeros, original printed p55 runes and a fixed quadratic target. These are demonstrations of ambiguity, not plaintext candidates.

For source-shaped controls, arbitrary deterministic nonlinear GF29 function tables on the original geometry reproduce all known synthetic outputs; the reduced non-column model identifies all 76 withheld outer values exactly in both conventions. Allowing independent physical column offsets leaves only 12 individually fixed outer values in those positive plants (the two boundary columns remain unconstrained); the 64 other values need not be jointly independent. Raw-byte plants identify zero exterior values. The authentic p56 prime-minus-one decoder (84 consuming positions, transparent F at offset56) is asserted against the published GP orthography, and p57 is taken directly from the canonical original transcription. No plaintext language model is involved.

**Decision:** reject the reduced-context family outright under the frozen alignment; reject the unrestricted full-byte two-context family as a means of inferring any p55 plaintext from the 180 known runes. An independently authenticated function-table constraint or different source-derived receiver would be required. No reason remains to optimize this flexible receiver against p55. No unknown plaintext, authentic key, or historical mechanism recovered.

[SFT](../sims/lp2_p50_inner180_context_lookup_identifiability_sft.cjs), core experiment executed on canonical source via connected JS before commit; standalone Node wrapper not independently run, no CI. Source corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; base60-grid blob 4698c0806e6bab06a39cfbc3c3283b862de58b35.

## Consequence and limits

The exact **fixed byte→rune** decoding of the 180 table interior into p56/p57 cannot work under an unchanged 30×6 core, either solved-page mode, and the tested eight geometric read orders. This removes an unlimited secret-mapping ambiguity without brute-forcing keys. The p57-only witness is sufficient; any alternative that tries to rescue the hypothesis must *change the source-selected architecture*, for example by introducing a position-dependent state, a byte-pair operation, a different 180-cell selection, a new traversal, or an independently established cipher layer. This test does **not** reject the 76-cell perimeter as a key to unknown p55, a different representation than BASE60 bytes, or other stateful/nonlocal whole-table transforms. The arbitrary two-context extension above distinguishes inconsistent reduced-input receivers from wholly unidentifiable raw-byte receivers. It recovers **no unknown LP2 plaintext** and does not change the authoritative 56-page unsolved status.

**Reproduce:** `node sims/lp2_p50_inner180_allsecret_lookup_sft.cjs`. The stand-alone source-native CJS test reads the canonical JSON files, asserts all positions and results, checks the positive plant, and prints the complete eight-order table. Original-test derivation and exact collision counts were independently executed against the current repository source through the GitHub connector during this invocation.
