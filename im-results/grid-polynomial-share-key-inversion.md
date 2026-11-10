# LP2 32×8 grid as polynomial secret shares: full-byte reconstruction and original-cipher inverse

**Agent 33, 10 November 2026. Classification: bounded negative of a source-grounded key hypothesis.** No previously unknown Liber Primus plaintext, key, cipher method or destination was recovered.

## Concrete mechanism and original source

The canonical LP2 page-49–51 base-60 table has **32 rows × 8 columns**, equivalent to eight vertically organized 32-byte objects. This could represent eight shares of one 256-bit key. To make that interpretation falsifiable, treat each row as eight evaluations of one polynomial in a finite field, with column coordinates \(x=1,\ldots,8\). Test two standard binary fields, GF(256) reduced by the AES polynomial \`0x11b\` or the Reed–Solomon polynomial \`0x11d\`, and the nearby prime field GF(257). The original grid bytes are unchanged and SHA-256 of its row-major raw bytes is \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`.

For each row, interpolate from its first \(d+1\) shares and predict every remaining original share, for degrees \(d=3,4,5,6\). A literal Shamir-style sharing construction with threshold at most seven requires **all 32 rows** to obey the relevant degree bound, using exactly the stated coordinates and field. The observed numbers of rows passing this exact test are:

| Field | degree ≤3 | degree ≤4 | degree ≤5 | degree ≤6 |
|---|---:|---:|---:|---:|
| GF(256), polynomial \`0x11b\` | 0/32 | 0/32 | 0/32 | **0/32** |
| GF(256), polynomial \`0x11d\` | 0/32 | 0/32 | 0/32 | **0/32** |
| GF(257) | 0/32 | 0/32 | 0/32 | **1/32** |

The lone degree-six fit among GF(257) rows is ordinary accidental consistency under this narrow model. Thus the table is inconsistent with a literal error-free threshold-7-or-lower sharing scheme using these three fields and the eight natural column coordinates.

An **eight-of-eight** (degree-seven) polynomial can interpolate *every* eight-byte row over any field, regardless of whether shares were intended. It therefore gives one 32-coordinate evaluation at \(x=0\), but the resulting 32-byte candidate key is a mathematical consequence of interpolation, without evidence of intentional encoding.

## Hidden-coordinate, affine-column-invariant exclusion

**Agent 14 extension, 10 November 2026.** The first test held share
coordinates fixed at `1,2,...,8`. The [coordinate-free rank
test](../sims/grid_coordinate_free_share_rank.cjs) removes that assumption
without searching candidate coordinates. Suppose each of the 32 printed
rows is eight evaluations of some degree-six-or-lower polynomial
`f_r(x)`, at **any eight common, unknown** column coordinates
`x_1,...,x_8` in the field. Allow an unknown fixed nonzero multiplier
`a_j`, fixed additive mask `b_j`, and arbitrary permutation for each
column. The observed grid would have the form

```
G[r,j] = a[j]*f_r(x[j]) + b[j]    (field arithmetic).
```

For each row r>0 subtract the first row coordinatewise.
Writing the polynomial differences as seven coefficients factors this
31×8 centered matrix as a **31×7 coefficient matrix times a 7×8
Vandermonde-and-scale matrix**. Consequently its rank can never exceed
**seven**, for any column coordinates, masks, scales, or polynomial
coefficients, without ever guessing them.

The **actual 31×8 row-difference matrix has rank eight** in every
tested field: GF(256) polynomial 0x11b, GF(256) polynomial 0x11d, and
GF(257). This contradiction remains inside each of the **three
separate original printed grid pages** (10, 13 and 9 rows): the
within-page row-difference rank is **eight in all nine field/page
combinations**. Even allowing a new coordinate system, column scales,
or additive column mask at each page cannot rescue degree≤6. Raw
unmodified grid rank is also eight in all three fields, and the
first eight original rows have full-rank 8×8 determinant **13, 138, 86**
in the respective fields. Four disjoint 8-row blocks each have rank
eight; in the **unshifted** model at least four different printed rows
must be altered to make global rank at most seven. This latter row
alteration bound does not automatically apply once unknown fixed
column shifts are permitted, for which the centered rank is the
appropriate invariant.

The crucial planted control creates 32 independent random
degree-six rows at genuinely *unknown* common x coordinates, followed
by fixed per-column nonzero scaling and additive masks. Its **raw
rank is eight**, illustrating why raw rank alone cannot exclude masked
sharing, whereas its **centered rank is exactly seven** in all three
fields, as proved. All field inverses are exhaustively checked, and
each original centered grid rank is reproduced in
[successful manual CI 42788914550](https://github.com/FlareZ123/liber-primus/actions/runs/42788914550).

This is an exact algebraic exclusion **only for ordinary polynomial
degree≤6 evaluations over those specified fields with common coordinates
per page**, even after arbitrary fixed affine column masks. Row-varying
coordinates, nonlinear byte mappings, unknown field encodings, altered
source bytes, or degree-seven eight-of-eight interpolation remain outside
its reach; no manuscript plaintext or key is recovered.

## Original ciphertext decryption test

For completeness, derive six 32-byte candidate keys by degree-seven interpolation to \(x=0\): three fields in normal and reversed column order. All six candidates happen to be valid byte strings. Two additional natural eight-of-eight combinations are the bytewise XOR of the eight columns and their arithmetic sum modulo 256, each producing one 32-byte candidate key. Like degree-seven interpolation, neither reconstruction contains redundancy or proves the table intentionally encodes shares. Test all eight candidates against **all 55 rune-bearing unsolved pages and all 12,956 original rune positions** with two frozen stream generators, AES-256-CTR and ChaCha20, using zero IVs, keystream reset at each physical page, both mod-29 signs and \`byte % 29\` reduction. This defines **32 explicit original-cipher decryption settings**.

The original ciphertext has global GP-rune index of coincidence **0.034478398**. The **best of all 32** derived-key inversions yields only **0.034540908** (GF(256)/AES polynomial, reversed columns, AES-256-CTR, negative sign), essentially the uniform-rune value of \(1/29 \approx 0.034482759\). No setting supplies readable recovered plaintext. For a source-matched recovery control, encrypt the first 12,956 GP-encoded runes from the separately stored Shakespeare reference with each exact candidate key, algorithm, sign and page-reset rule. All **32/32** inverses recover every planted rune exactly, with **0.061082339** reference IoC. The positive control checks reversibility and scoring sensitivity to the stated additive transform; it does not establish detection power for other unknown renderings or ciphers.

### Decision

The table cannot be an **unmodified, low-degree 8-column polynomial share matrix** under the three specified fields and column coordinates. Neither degree-seven interpolants nor XOR/arithmetic eight-share combined secrets restore normal GP-English statistics under the finite zero-IV, page-reset AES-CTR/ChaCha20 family. Consequently this exact reconstruction offers no key or decipherment and should not be retried without an independent share-coordinate/field clue or key-use mechanism.

The strengthened coordinate-free test excludes even arbitrary **fixed** share coordinates within each physical page over the three declared fields. It does **not** exclude row-varying share coordinates, encrypted/salted shares, disputed byte readings, other finite fields or nonstandard byte encodings, nonlinear maps, different cryptographic modes, IV derivation, stateful key consumption, non-English plaintext or transformed plaintext. The existing grid-source transcription includes a limited number of debated byte readings; this test uses the repository's current canonical byte table.

**Reproduce:** [sims/grid_shamir_rs_inverse.cjs](../sims/grid_shamir_rs_inverse.cjs), built-in Node.js 22, full 55-page exact input, field arithmetic, source SHA-256, and synthetic inverse assertions. The existing manual-only [grid-256-tests.yml](../.github/workflows/grid-256-tests.yml) now executes this experiment alongside the canonical token and SHA regression. [Successful GitHub Actions run 42788348373](https://github.com/FlareZ123/liber-primus/actions/runs/42787563432) generated the entire ranked 32-setting ledger and field-consistency counts. As a bounded negative, this investigation does not change [the authoritative manuscript status](../results/README.md).
