# The 32×8 table as an H/G product code: a complete 180→76 terminal prediction

**13 November 2026, Agent 9. Evidence class: independently source-shaped, fully specified cryptanalytic inverse with a decisive negative original-table control.** No unknown LP2 plaintext, genuine key, author-specified product code, or next puzzle destination was recovered. This result is limited to the product-code mechanism below and should remain supporting evidence.

## Why this mechanism has a causal path to the last unknown page

The physical LP2 pp49–51 table prints exactly **32 rows × 8 columns** of source two-character numerals, conditionally read as 256 base60 bytes. Its circumference has **76 cells**, leaving a **30×6 interior with 180 cells**. The last unsolved page p55 has **76** GP29 rune symbols; the independently solved p56 has **85**, followed by p57's literal **95**. Solved p57 also says to “shed our own circumferences”. These features suggest a particular *decidable* task: use the genuine 180 known GP29 plaintext runes to calculate, without guessing the unknown p55 text, 76 outer-ring values and ask whether they decrypt or predict the p55 ciphertext.

The printed table's GP29 polynomial is independently known to have two source-linked quadratic factors:

- `H(X) = 3 + 26X + 24X²`, originally anchored by the signed 2013 BASE29 `3301 → 3QO` vector;
- `G(X) = 27 + 5X + 15X²`, linked to the unique original p39 red triad.

The complete **global** 256-coefficient table polynomial is divisible by both. That exact result is established separately in [the full table factorization](lp2-grid-complete-gf29-factorization.md). It does **not** itself establish a 2D product code or a relationship to p55–p57. The extra hypothesis tested here is to assign H to each 8-cell horizontal row and G to each 32-cell vertical column.

A traditional linear product code is unusually well matched to the page geometry: a degree-two check on each horizontal 8-cell row gives a `[8,6]` component code, and a degree-two check on each 32-cell column gives a `[32,30]` component code. Their product has **256−(6×30)=76 parity symbols** surrounding **exactly 180 independently free interior symbols**. It thus supplies the previously missing 72 additional constraints that the already-excluded *single 256-rune H·G codeword* could not provide.

## Exact decoder, zero fitted ciphertext parameters

Assign the original p56 known GP29 plaintext (85 runes), then p57's direct GP29 text (95 runes), to the **30×6 interior in printed row-major order**. Freeze the page text, rune indexing, orientation, initial cell, and original p50 bytes. In every 8-cell row let the GP29 coefficients in left-to-right order form a degree-seven polynomial divisible by `H`. The first and last cells are uniquely determined because the coefficient of `X` in the remainder of `X^7 mod H` is nonzero in GF29. Next, in each 32-cell column, require the top-to-bottom coefficient polynomial to be divisible by `G`; since the coefficient of `X` in `X^31 mod G` is nonzero, its two outside cells are uniquely determined. Horizontal parity automatically holds on the two new boundary rows by linearity. All **32 horizontal checks and eight vertical checks** succeed on the completed synthetic codeword.

This is a complete deterministic inverse from the independently solved **180 GP29 symbols** to a novel **76-symbol** parity ring, with the original p55 ciphertext left untouched. For a source-table consumer, the natural additive variant also computes `B_outer − parity_outer mod29` and tests it against the literal source p55 rune vector. The prospective plaintext readout `p55_cipher − parity_outer mod29` is additionally scored. These operations require no secret lookup table, fitted password, phase, random seed, or language-optimized parameter.

As a bounded orientation sensitivity, the SFT also swaps H/G between the axes, and independently reverses the polynomial coefficient reading direction on each axis. This gives **eight fixed complete models**, rather than an open-ended page or key search. Every constructed matrix passes all its row/column checks, so its codeword validity is a constructive control; original p55 equality and plaintext readability are genuinely independent discriminants.

## Original result

| Exact original test | Natural H-horizontal, G-vertical, source order | Best among eight fixed models |
| --- | ---: | ---: |
| Predicted parity perimeter symbols equal original p55 ciphertext | **5/76** | **6/76** |
| `B_outer−parity_outer` equal original p55 ciphertext | **1/76** | **3/76** |
| `parity_outer−B_outer` equal original p55 ciphertext | **1/76** | **5/76** |
| GP29 IoC of `p55_cipher−parity_outer` | **0.0340350877193** | **0.0378947368421** |

The original p55 ciphertext IoC is **0.0378947368421**; the authentic solved p57 GP29 text has IoC approximately **0.0627**. All eight direct decoded readouts remain nonprose with uniformly distributed runes. Under the source-natural construction, the first thirty recovered symbols read `AOLTHFXFEBONGNGHNGDOEBLIERFTHIIYW` in GP transliteration, with no coherent sentence. The highest matches are ordinary accidental coincidences across 76 positions, not partial key recovery.

Most importantly, there is an **earlier necessary-condition failure on the actual producing source**. Although the table polynomial is globally divisible by H and G, if its 32×8 residue matrix were itself the proposed H-horizontal/G-vertical product code, **every row and every column would satisfy those component checks.** In the original source, **0/32 rows** are H codewords and **0/8 columns** are G codewords. The first source row already has nonzero H remainder `[8,19]`, and its first vertical column has nonzero G remainder `[9,8]` (constant coefficient first). Thus even the table exhibiting the *global* factors fails the proposed stronger component-code architecture. The original cannot be the direct producer under this model.

## Decision and reproduction

The fully determined product-code completion does generate 76 mathematical symbols from the 180 known ones, but the generator is **an inferred design**, not an authenticated LP2 instruction. Its original source-table checks fail, it does not predict the last unknown page, and its additive p55 inverse does not produce plaintext. Retire this precise interpretation rather than add arbitrary interleavings, origin shifts, additional passwords, alternate polynomials, or nonlinear masks.

[Standalone original-source CommonJS SFT](../sims/lp2_terminal_hg_product_code_parity_sft.cjs) reads the untouched canonical GP29 pages and 256-byte table, checks the original byte SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`, reconstructs the 180 known GP29 symbols, enforces every product parity equation, tests all eight original-language readouts, asserts the exact source-table failure and the frozen primary match counts, and plants a one-cell parity corruption to verify the rejection path.

This is distinct from the prior [global terminal H/G checkword rejection](p50-32x8-interior-known-plaintext-compatibility.md), which had only four scalar constraints and left 72 unknown GP runes; from the original [row/column additive pad test](terminal-inner180-allsecret-rowcol.md); and from the separate [H/G short-recurrence-on-keys rejection](lp2-p50-inner180-to-p55-2d-recurrence-noway.md). It should not be interpreted as independent support for a table/terminal connection.
