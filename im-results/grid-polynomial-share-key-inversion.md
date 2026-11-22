# LP2 32×8 grid as polynomial secret shares: full-byte reconstruction and original-cipher inverse

**Agent33 with Agent14, Agent32 and Agent50 extensions, 10–12 November 2026. Classification: bounded negatives of low-degree column-share, 13-of-31 and 23-of-31 row-share hypotheses.** No previously unknown Liber Primus plaintext, key, cipher method or destination was recovered.

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

**Source premise and why this differs from the excluded column-share orientation.** The 32×8 table also has a natural representation as **32 possible share records, each eight bytes long**, whereas the prior test above treated eight *columns* as shares of each row. The earlier conditional 13/31 reading partly relied on repeated five-slot side ornaments; the complete side margins are now established as a pixel-identical static page-frame template across physical pp40–55, not page-specific share data ([border-template audit](../im-results/lp2-floral-border-template-audit.md)). The p55/p57 red 13-dot core and the 32-row table still make 13-of-31 conceivable, but weak: neither the threshold nor the row-as-share mapping is a creator-authenticated instruction.

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


## Additional row-packed 64-bit 13-of-31 gate (Agent32, 11 November 2026)

The preceding 13-of-31 test treats each of the eight printed bytes in a row as an independent GF(256)/GF(257) share lane. A distinct natural representation treats the **entire eight-byte row as one 64-bit share value**. The 32×8 source table then supplies 32 evaluations: 31 nonzero share coordinates plus one \(x=0\) secret/evaluation row. This tests whether the earlier negative depended on splitting each row into independent byte lanes.

Pack each row's eight canonical bytes in printed left-to-right order as one big-endian 64-bit element. Use the single sparse irreducible polynomial

\[
f(x)=x^{64}+x^4+x^3+x+1
\]

for \(GF(2^{64})\). The implementation checks irreducibility with Rabin's criterion. The manuscript does **not** specify this field polynomial; it is one plausible fixed representation for an eight-byte share, not an authenticated key instruction.

Freeze three coordinate layouts:
1. \(x=0,1,\ldots,31\), with the first printed row as the secret row; interpolate from printed rows 2–14 (\(x=1,\ldots,13\)).
2. \(x=1,\ldots,31,0\), with the last printed row as the secret row; interpolate from printed rows 1–13.
3. The already documented five-bit de-Bruijn state sequence, with its single \(x=0\) row at printed row 15; interpolate from printed rows 1–13.

For each layout, the 13 training rows uniquely determine a degree-at-most-12 polynomial. Predict all 19 remaining original 64-bit rows, including the \(x=0\) row where applicable.

| Coordinate layout | Original exact predictions | Independent planted degree-12 control |
| --- | ---: | ---: |
| Monotonic, secret first | **0 / 19** | 19 / 19 |
| Monotonic, secret last | **0 / 19** | 19 / 19 |
| Five-bit de-Bruijn | **0 / 19** | 19 / 19 |

The first held-out comparisons are already decisive counterexamples:
- Secret-first: printed row 1 predicted 2c723604585073bb, actual cbe7a7ba61ed7eb7.
- Secret-last: printed row 14 predicted 32cb55cd49bc2f96, actual 7a3f1fda0eb82073.
- De-Bruijn: printed row 14 predicted 015983f1b45965e6, actual 7a3f1fda0eb82073.

The 64-bit packed-row representation therefore does not rescue the source-suggested 13-of-31 grid-sharing model under this field and these three fixed row clocks. The planted controls recover all 19 held-out values in every layout, validating the arithmetic and interpolation. This is a **bounded negative**: it does not exclude every possible \(GF(2^{64})\) polynomial, byte order, x-coordinate assignment, or other encoded sharing scheme. No alternate field polynomial, row permutation, or byte packing was searched. Reopen only if an independent source selects a different representation.

Reproducer: [sims/grid_31share13_gf64_packed_row_gate.cjs](../sims/grid_31share13_gf64_packed_row_gate.cjs), which asserts the canonical 256-byte table SHA-256, field irreducibility, all 57 original predictions, and all three 19/19 planted controls.

## Independent row-oriented 23-of-31 Shamir gate (Agent50, 12 November 2026)

**Human solve-path hypothesis.** The p57 terminal red mark has **23 dots** in a 5×9 arrangement, while the canonical p49–p51 numeric table has **32 rows × 8 bytes**. A plausible reading is one (x=0) secret/evaluation row plus 31 share rows, with threshold 23. This is not authenticated; the earlier p55/p57 13-dot core separately motivated the bounded 13-of-31 test above. The 23 threshold is frozen from the visible red-dot count rather than searched.

Three predeclared coordinate clocks are tested: (x=0) at the first row; (x=0) at the last row; and the recorded five-bit de-Bruijn sequence, whose (x=0) row is printed row 15. For each layout, use the first 23 nonzero-coordinate rows as training shares, predict the other eight nonzero rows, and also predict the (x=0) secret row.

### Eight independent byte lanes

Use standard degree-22 Shamir interpolation in GF(256)/0x11b, GF(256)/0x11d and GF(257), with the eight printed byte columns treated as independent secret lanes. Each layout/field combination has 8 columns × 9 predictions (eight held-out shares plus the secret row).

| Coordinate layout | GF(256)/0x11b | GF(256)/0x11d | GF(257) |
| --- | ---: | ---: | ---: |
| (x=0) first | 0 / 72 | 1 / 72 | 0 / 72 |
| (x=0) last | 1 / 72 | 0 / 72 | 0 / 72 |
| De-Bruijn | 0 / 72 | 2 / 72 | 0 / 72 |

Total: **4 / 648** exact original predictions. The chance expectation is approximately **2.53** (648/256; GF257 is effectively the same). The four matches are isolated across variants, with no complete byte lane or coherent held-out vector. All nine independent planted controls pass **72/72**.

### One 64-bit value per row

Pack each row's eight bytes in printed left-to-right order as one big-endian GF(2^64) value, using the fixed irreducible polynomial (X^{64}+X^4+X^3+X+1). Test both ordinary degree-22 Shamir and the historical monic degree-23 convention, under all three coordinate clocks.

| Coordinate layout | Standard degree 22 | Monic degree 23 |
| --- | ---: | ---: |
| (x=0) first | 0 / 9 | 0 / 9 |
| (x=0) last | 0 / 9 | 0 / 9 |
| De-Bruijn | 0 / 9 | 0 / 9 |

All six planted controls pass **9/9**. The GF64 polynomial is one fixed candidate; no alternate field, byte order, x map or row permutation was searched.

Reproducer: [`sims/grid_31share23_threshold_gate.cjs`](../sims/grid_31share23_threshold_gate.cjs). It checks the canonical 256-byte table SHA-256, all original held-out and secret predictions, and planted positive controls.

**Decision:** the p57 23-dot mark does not validate the direct 23-of-31 interpretation of the 32×8 table under these source-fixed row clocks and fields. The byte-lane matches are at chance level; the row-packed GF64 models fail every original prediction. This does not prove that the red mark has no other role, or exclude a different source-selected payload/operation. Do not search arbitrary thresholds, fields or x schedules to rescue this model.

## Original ciphertext decryption test

For completeness, derive six 32-byte candidate keys by degree-seven interpolation to \(x=0\): three fields in normal and reversed column order. All six candidates happen to be valid byte strings. Two additional natural eight-of-eight combinations are the bytewise XOR of the eight columns and their arithmetic sum modulo 256, each producing one 32-byte candidate key. Like degree-seven interpolation, neither reconstruction contains redundancy or proves the table intentionally encodes shares. Test all eight candidates against **all 55 rune-bearing unsolved pages and all 12,956 original rune positions** with two frozen stream generators, AES-256-CTR and ChaCha20, using zero IVs, keystream reset at each physical page, both mod-29 signs and \`byte % 29\` reduction. This defines **32 explicit original-cipher decryption settings**.

The original ciphertext has global GP-rune index of coincidence **0.034478398**. The **best of all 32** derived-key inversions yields only **0.034540908** (GF(256)/AES polynomial, reversed columns, AES-256-CTR, negative sign), essentially the uniform-rune value of \(1/29 \approx 0.034482759\). No setting supplies readable recovered plaintext. For a source-matched recovery control, encrypt the first 12,956 GP-encoded runes from the separately stored Shakespeare reference with each exact candidate key, algorithm, sign and page-reset rule. All **32/32** inverses recover every planted rune exactly, with **0.061082339** reference IoC. The positive control checks reversibility and scoring sensitivity to the stated additive transform; it does not establish detection power for other unknown renderings or ciphers.

### Decision

The table cannot be an **unmodified, low-degree 8-column polynomial share matrix**, the row-oriented **13-of-31** eight-byte share scheme, or the p57-red-23 **23-of-31** row-share interpretation under the specified fields and coordinate clocks. Neither degree-seven interpolants nor XOR/arithmetic eight-share combined secrets restore normal GP-English statistics under the finite zero-IV, page-reset AES-CTR/ChaCha20 family. Consequently these exact reconstructions offer no key or decipherment and should not be retried without an independent share-coordinate/field clue or key-use mechanism.

The strengthened coordinate-free test excludes even arbitrary **fixed** share coordinates within each physical page over the three declared fields. It does **not** exclude row-varying share coordinates, encrypted/salted shares, disputed byte readings, other finite fields or nonstandard byte encodings, nonlinear maps, different cryptographic modes, IV derivation, stateful key consumption, non-English plaintext or transformed plaintext. The existing grid-source transcription includes a limited number of debated byte readings; this test uses the repository's current canonical byte table.

**Reproduce:** [sims/grid_shamir_rs_inverse.cjs](../sims/grid_shamir_rs_inverse.cjs), built-in Node.js 22, full 55-page exact input, field arithmetic, source SHA-256, and synthetic inverse assertions. The existing manual-only [grid-256-tests.yml](../.github/workflows/grid-256-tests.yml) now executes this experiment alongside the canonical token and SHA regression. [Successful GitHub Actions run 42788348373](https://github.com/FlareZ123/liber-primus/actions/runs/42787563432) generated the entire ranked 32-setting ledger and field-consistency counts. As a bounded negative, this investigation does not change [the authoritative manuscript status](../results/README.md).
