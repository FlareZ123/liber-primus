# LP2 32×8 grid as polynomial secret shares: full-byte reconstruction and original-cipher inverse

**Agent 33 with Agent14 and Agent32 extensions, 10–11 November 2026. Classification: two bounded negatives of source-grounded Shamir-key hypotheses (eight-column shares and 31-row shares).** No previously unknown Liber Primus plaintext, key, cipher method or destination was recovered.

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

## Independent row-oriented 13-of-31 Shamir gate (Agent32, 11 November 2026)

**Source premise and why this differs from the excluded column-share orientation.** The 32×8 table also has a natural representation as **32 possible share records, each eight bytes long**, whereas the prior test above treated eight *columns* as shares of each row. The original repeated five-slot ornaments admit the conditional binary values **13** and **31**, and historical 2013 Cicada used Shamir secret sharing. Thus one specific, economical source hypothesis is **31 shares at threshold 13 plus one secret/evaluation row**, with each of the table's eight columns an independently shared secret byte. The ornaments' binary reading and the identification of table rows as shares remain conjectural; neither is a creator-authenticated instruction.

For each of the three finite fields **GF(256) with polynomials 0x11b and 0x11d, and GF(257)**, freeze two source-natural coordinate clocks: (1) printed row number x=1…32; (2) the previously documented five-bit de-Bruijn row states `[31,30,28,25,19,6,13,26,20,9,18,4,8,16,0,1,2,5,10,21,11,23,14,29,27,22,12,24,17,3,7,15]`, whose single x=0 position can be interpreted as the one secret row. For **each** of eight independent byte columns, fit the unique degree≤12 polynomial to the **first 13 printed rows** and predict the **remaining 19 original rows**. No unknown ciphertext, language fit, polynomial coefficient, extra threshold, or row order is searched.

| Field | Row coordinate assignment | Correct held-out values across 8 × 19 = 152 |
| --- | --- | ---: |
| GF(256), AES 0x11b | printed x=1…32 | **0 / 152** |
| GF(256), AES 0x11b | documented 5-bit state x | **1 / 152** |
| GF(256), RS 0x11d | printed x=1…32 | **0 / 152** |
| GF(256), RS 0x11d | documented 5-bit state x | **1 / 152** |
| GF(257) | printed x=1…32 | **1 / 152** |
| GF(257) | documented 5-bit state x | **0 / 152** |

**Even more general explicit-x obstruction:** suppose each printed eight-byte row consists of its first byte as the Shamir x coordinate and its remaining seven bytes as y values. Original x=**122** repeats at printed rows 8 and 13, while x=**142** repeats at rows 10 and 27 (zero-based). In each pair, the remaining seven printed bytes are **different**, so no single deterministic sharing polynomial of **any degree**, over any deterministic field representation, can generate both rows at one x coordinate. The SFT asserts both original conflicting duplicate records. This rejects the direct encoded-x record model independently of threshold, the choice of field polynomial, or a secret key. It does not reject x coordinates inferred from row numbers or an independent permutation, for which the degree-12 held-out tests above apply.

Across all six original-input variants, **not one of the eight columns is a valid degree≤12 share polynomial**. Each original column disagrees with its own held-out evaluations at least 18 times. The GF(256) de-Bruijn x=0 cell at zero-based printed row14 is also inconsistent with the first 13 share rows; no embedded eight-byte x=0 secret record is recovered. By contrast, for each field/coordinate convention an independently generated degree12, eight-lane synthetic share matrix correctly recovers **32/32 evaluations in each column** and the polynomial's x=0 secret in every case, validating the interpolation implementation.

**Decision:** reject the source-suggested **13-of-31, eight parallel Shamir secret-byte** interpretation with either original coordinate map and all three declared fields. This is a distinct bounded negative from the above eight-column threshold≤7 gate. It does not reject Shamir with a source-specified alternative x-coordinate schedule, altered/encoded shares, different field, or nonstandard secret-sharing scheme. Inventing one solely to fit the observed bytes would forfeit the human-solve-path motivation. A source-selected operation remains missing; no LP2 key or plaintext is recovered.

[Independent source-only CommonJS reproducer](../sims/grid_31share13_threshold_gate.cjs) reads the original checked-in 256-byte table, asserts every held-out exact count, and tests independent true-share plants for all fields/coordinate maps.

## Original ciphertext decryption test

For completeness, derive six 32-byte candidate keys by degree-seven interpolation to \(x=0\): three fields in normal and reversed column order. All six candidates happen to be valid byte strings. Two additional natural eight-of-eight combinations are the bytewise XOR of the eight columns and their arithmetic sum modulo 256, each producing one 32-byte candidate key. Like degree-seven interpolation, neither reconstruction contains redundancy or proves the table intentionally encodes shares. Test all eight candidates against **all 55 rune-bearing unsolved pages and all 12,956 original rune positions** with two frozen stream generators, AES-256-CTR and ChaCha20, using zero IVs, keystream reset at each physical page, both mod-29 signs and \`byte % 29\` reduction. This defines **32 explicit original-cipher decryption settings**.

The original ciphertext has global GP-rune index of coincidence **0.034478398**. The **best of all 32** derived-key inversions yields only **0.034540908** (GF(256)/AES polynomial, reversed columns, AES-256-CTR, negative sign), essentially the uniform-rune value of \(1/29 \approx 0.034482759\). No setting supplies readable recovered plaintext. For a source-matched recovery control, encrypt the first 12,956 GP-encoded runes from the separately stored Shakespeare reference with each exact candidate key, algorithm, sign and page-reset rule. All **32/32** inverses recover every planted rune exactly, with **0.061082339** reference IoC. The positive control checks reversibility and scoring sensitivity to the stated additive transform; it does not establish detection power for other unknown renderings or ciphers.

### Decision

The table cannot be an **unmodified, low-degree 8-column polynomial share matrix** or the independently tested **row-oriented 13-of-31 eight-byte share scheme** under the specified fields and coordinate clocks. Neither degree-seven interpolants nor XOR/arithmetic eight-share combined secrets restore normal GP-English statistics under the finite zero-IV, page-reset AES-CTR/ChaCha20 family. Consequently this exact reconstruction offers no key or decipherment and should not be retried without an independent share-coordinate/field clue or key-use mechanism.

The strengthened coordinate-free test excludes even arbitrary **fixed** share coordinates within each physical page over the three declared fields. It does **not** exclude row-varying share coordinates, encrypted/salted shares, disputed byte readings, other finite fields or nonstandard byte encodings, nonlinear maps, different cryptographic modes, IV derivation, stateful key consumption, non-English plaintext or transformed plaintext. The existing grid-source transcription includes a limited number of debated byte readings; this test uses the repository's current canonical byte table.

**Reproduce:** [sims/grid_shamir_rs_inverse.cjs](../sims/grid_shamir_rs_inverse.cjs), built-in Node.js 22, full 55-page exact input, field arithmetic, source SHA-256, and synthetic inverse assertions. The existing manual-only [grid-256-tests.yml](../.github/workflows/grid-256-tests.yml) now executes this experiment alongside the canonical token and SHA regression. [Successful GitHub Actions run 42788348373](https://github.com/FlareZ123/liber-primus/actions/runs/42787563432) generated the entire ranked 32-setting ledger and field-consistency counts. As a bounded negative, this investigation does not change [the authoritative manuscript status](../results/README.md).
