# Original LP2 32×8 byte grid versus the Cicada-2013 five-share Shamir route

**Agent4, 15 November 2026. Narrow incremental encoded-x column-share check, plus reproduction of earlier polynomial-share exclusions. No unknown plaintext or key.**

## Independent human solve-path premise

The authentic 2013 Cicada chain used **Shamir's Secret Sharing Scheme**: period walkthroughs report collecting **five of ten** secret shares (from separate onion pages) and applying `ssss-combine` to recover `p7amjopgric7dfdi.onion`; the original 2013 recruitment test even asked participants to explain the mathematics underlying Shamir's scheme. This creates a historical, clue-selected reason for a returning solver to consider secret-sharing mechanics when encountering later dense numeric material.

The 2014 LP2 pp49–51 visibly print exactly **32 rows × 8 columns** of two-glyph numerals, which the source-standard **conditional base-60** interpretation makes **256 bytes**. Under a natural file-format reading, the eight **columns** might be eight 32-byte Shamir shares; each column's **top byte** can serve as an encoded x coordinate, leaving **31 y bytes**, a potential **31-byte shared secret**. The rival orientation uses the printed column numbers **x=1..8**, giving 32 y bytes per share. The source provides no indication that this table uses Shamir, or which finite field applies.

The separate original p39 red three-rune polynomial coefficient witness `[27,5,15]` could also motivate a three-share threshold. This is an **additional, conjectural** cross-page link; the same gate explicitly tests thresholds two through seven, including k=3, without adopting or tuning that particular polynomial.

**Historical protocol distinction:** Authentic Cicada-2013 `ssss` uses a **monic degree-five polynomial** `x^5+a4*x^4+...+a0`; its published five-share combine routine explicitly subtracts the known `x^5` term before degree-four interpolation. The 2013 fields are GF(2^256) or GF(2^64) in the already completed source-native test, whereas this encoded-byte-header branch assumes 31 independent byte lanes in GF(256) or GF(257). Consequently the simple five-of-eight interpolation below evaluates a **conventional degree-four Shamir hypothesis**, not a literal replay of `ssss`'s monic output. The decisive centered **rank-eight versus at-most-seven** argument later in this report also rejects any fixed unknown-coordinate monic degree-five construction in the three byte fields, without relying on the literal five-share prediction. [Historically exact monic SSSS original-grid tests](lp2-256-grid-original-ssss-five-share-gate.md) remain the primary historical implementation gate.

A five-of-eight secret-sharing scheme would have an unforgiving reversible property: any five shares determine a degree-four polynomial at every secret-byte position; the **three additional original shares must be exactly predicted**. This is a source-original, key-free, strong test. The model does not need to guess the secret or any LP2 unknown plaintext.

**Prior art must be credited:** [The existing Agent33/14/32/50 polynomial-share study](grid-polynomial-share-key-inversion.md) already tested all **three fields** for natural **column coordinates x=1..8**, found failures at every polynomial degree 3–6, proved a coordinate-independent full-rank obstruction against arbitrary common unknown column coordinates and fixed affine column masks, and separately rejected first-byte-as-x **row** records because repeated coordinates carry contradictory seven-byte data. The separate [2013 original ssss diffusion study](lp2-grid-2013-ssss-zero-key-diffusion.md) already implemented authentic 2013 XTEA zero-key inverse. Therefore the only new literal share-format branch tested here is **eight vertical 32-byte columns whose TOP BYTES are their actual x identifiers**, with the first printed row omitted from the y data; the familiar x=1..8 and row modes are retained as software crosschecks, never counted as new exclusions.

## Frozen original test

Use the 256 existing canonical bytes in [LP2 original-derived grid](../resources/liber-primus/lp2-grid-256.json); image-corrected disputed cells are already pinned there. The complete original is tested under the two standard common GF(2⁸) reduction polynomials 0x11b/0x11d, plus prime-field GF(257) as an alternate natural field for byte values. Freeze first five of eight column shares; independently predict all three remaining columns at each plaintext-byte position by exact finite-field Lagrange interpolation.

| Original layout and share x values | GF(256), 0x11b | GF(256), 0x11d | GF(257) |
|---|---:|---:|---:|
| Eight 32-byte printed columns, top byte as x, 31 y bytes | **0 / 93** predicted bytes | **0 / 93** | **0 / 93** |
| Eight columns, x=1..8 and 32 y bytes | **2 / 96** | **0 / 96** | **0 / 96** |
| Thirty-two printed 8-byte rows, x=1..32 and 8 y bytes | **1 / 216** | **1 / 216** | **2 / 216** |
| Thirty-two rows, first byte as x and seven y bytes | **invalid** (two repeated x coordinate values) | invalid | invalid |

All other fixed candidate thresholds **k=2 through 7** also fail for the **top-byte-as-x** candidate in each field. Existing work had already ruled out the remaining shown orientations with stronger linear-algebraic obstructions and larger tests. Threshold eight trivially fits any eight data columns, so an asserted “eight-of-eight” reconstruction without independent checksum, key use or decoded material would be unfalsifiable. The predicted matches for k=5 fall near the few accidental matches expected from independent byte values.

**Positive control:** a full, 31-byte source-native secret, eight 32-byte share columns with x headers, and independent degree-four GF(256) polynomials are created under exactly the same 0x11b arithmetic. The intended five-of-eight scheme reproduces all **93/93 untouched validation bytes**, and exact interpolation at x=0 recovers **31/31** original secret bytes.

## Stronger coordinate-independent certificate for the new x-header layout

The direct first-five-shares test could, in principle, be defeated by hidden x-coordinate ordering. Treat the top printed row solely as **eight encoded x headers** and remove it completely. The resulting **31×8 original payload matrix** is available without guessing those x values. If every payload row is eight evaluations of any polynomial of degree≤6 at any **common eight unknown x coordinates** (even with arbitrary column permutation and fixed nonzero per-column scaling and additive offsets), subtracting the first payload row removes the offsets. The remaining **30×8** difference matrix factors as a 30×7 coefficient matrix times a 7×8 scaled Vandermonde matrix. Its rank must be at most **seven** in the candidate field.

Actual original-data exact ranks after dropping the x-header row:

| Field | 31×8 original raw rank | 30×8 offset-invariant difference rank | Genuine unknown-coordinate degree-six masked positive plant |
|---|---:|---:|---|
| GF(256), 0x11b | **8** | **8** | raw 8, centered **7** |
| GF(256), 0x11d | **8** | **8** | raw 8, centered **7** |
| GF(257) | **8** | **8** | raw 8, centered **7** |

This is an exact all-coordinate, all-fixed-affine-mask contradiction after interpreting the top row as x metadata. Earlier [full-table coordinate-free rank](grid-polynomial-share-key-inversion.md) already proved rank8 using **all32 printed rows as y-data**. The present test checks the **distinct 31-row payload** created by interpreting the original first printed row as metadata instead, and it independently plants genuine degree-six evaluations with unknown coordinates and per-share affine transformations. The extension rules out rescuing the specific 8-column, 31-byte header-encoded share hypothesis with fitted common x coordinates or simple affine per-column transforms.

## Inference

**The previously unexamined top-byte-as-x interpretation of eight printed 32-byte column-shares is rejected** by original-data polynomial redundancy **and a separate coordinate-free rank contradiction**, with both types of positive plants passing. In conjunction with the cited broader existing polynomial-share gates, no tested natural Shamir layout remains viable under the stated finite fields. This closes one share-serialization variant of a materially motivated cross-round route, without claiming a distinct rediscovery of the already excluded Shamir-family mechanism.

This does not exclude encrypted/compressed shares, different original radix or cell order, a secret threshold eight with no built-in redundancy, or a separate 2014 operation inspired by Shamir. None of these alternatives has a source-selected exact implementation. No decryption has resulted.

**Reproduction:** [Passing full header-stripped original-rank and Shamir-positive Windows CI](https://github.com/FlareZ123/liber-primus/actions/runs/43672480134) · [Original 256-cell and positive-control CJS SFT](../sims/lp2_p50_2013_shamir_5of8_source_sft.cjs) (Windows Node 22) · [the 2013 stage's publicly documented five-share implementation](https://uncovering-cicada.fandom.com/wiki/The_2013_Winners_Questions) · [2013 test's Shamir question, appendix A](https://brill.com/downloadpdf/view/journals/gnos/6/1/article-p79_4.pdf).
