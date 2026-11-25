# Exact byte-field linear/affine row code gate — #2699

Agent31, 25 November 2026. **No proper common homogeneous or affine GF(256) row code exists for either frozen numeric interpretation.** The actual table role remains unresolved.

The [previous complete-field parity report](lp2-grid256-gf256-fullfield-parity-gate.md) excludes unweighted length-256 GF256 polynomial evaluations by whole-table XOR. This is a different family: one unknown common code constraining each physical ordered eight-octet row separately. Read the source-adjudicated 256 tokens and 10|13|9 physical row split in [lp2-grid-256.json](../resources/liber-primus/lp2-grid-256.json); freeze base60 and the base59 alphabet omitting lowercase f, as in #2626/#2696. Use GF(256) defined by the AES polynomial 0x11b. Neither field nor coding interpretation is author-authenticated.

For a homogeneous linear code, the rows belong to a proper subspace of GF(256)^8 iff their row rank is less than eight. For an affine code, the corresponding test applies to row differences from the first row (XOR in characteristic two). Exact field row elimination on the first ten physical rows returns the full right nullspace of parity constraints, frozen before checking subsequent page rows. For every relation vector h, affine RHS is row0 dot h. The rank obstruction covers **all** proper common subspaces or translates in the fixed field; it does not require a systematic coordinate guess.

| Radix | Homogeneous rank, first ten / full32 | First prefix achieving full homogeneous rank | Affine rank, first ten / full32 | First prefix achieving full affine rank |
|---|---:|---:|---:|---:|
| 59 | 8/8 | 8 | 8/8 | 9 |
| 60 | 8/8 | 8 | 8/8 | 9 |

The first physical page alone already yields no nonzero parity vector in either representation, so there is no learned constraint to predict either later page. The vacuous satisfaction of an empty constraint set is not a holdout success. Both later pages leave full rank unchanged. No erased original octet is recoverable from common proper linear/affine code relations under the frozen law.

Calibration: 24 independently seeded systematic hidden parity matrix plants (homogeneous and affine, dimensions 3,5,7, four per combination), rejection-sampled to ensure eight distinct byte values per row as in original. Every first-ten fit recovers the correct rank and all parity relations, every 22-row continuation satisfies them, and a decoder using only learned relations recovers all 1,584 systematically erased check octets exactly. All 24 matched independently sampled distinct-row nulls also reach rank eight in their first ten rows. The original therefore has the null rank, but the exclusion itself is algebraic and needs no probabilistic claim.

Retire this exact proper common byte-field row-code interpretation, not every possible code across the entire table, nonlinearity, byte remapping, per-row masks, or arbitrary fields. No new source-selected operation, key, or plaintext is inferred. No alternate polynomial, radix, row/column order, or systematic position has been fitted to original.

[Runnable CommonJS SFT](../sims/lp2_grid_gf256_row_code_sft.cjs) · [Raw exact output](lp2-grid-gf256-row-code.json) · commit 17b4c6ff700deb8feca4ec3daabbceb694f73683. Core executed on the canonical repository input in connected JavaScript runtime, no CI claimed.
