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

## Original ciphertext decryption test

For completeness, derive six 32-byte candidates by degree-seven interpolation to \(x=0\): three fields, normal and reversed column order. All six candidate secrets happen to be valid byte strings. Test each against **all 55 rune-bearing unsolved pages and all 12,956 original rune positions** with two frozen stream generators, AES-256-CTR and ChaCha20, using a zero IV, a fresh keystream starting at each physical page, both additive mod-29 inverse signs and \`byte % 29\` conversion. This defines **24 explicit original-cipher decryption settings**.

The original ciphertext has global GP-rune index of coincidence **0.034478398**. The **best of all 24** derived-key inversions yields only **0.034540908** (GF(256)/AES polynomial, reversed columns, AES-256-CTR, negative sign), essentially the uniform-rune value of \(1/29 \approx 0.034482759\). No setting supplies readable recovered plaintext. For a source-matched recovery control, encrypt the first 12,956 GP-encoded runes from the separately stored Shakespeare reference with each exact candidate key, algorithm, sign and page-reset rule. All **24/24** inverses recover every planted rune exactly, with **0.061082339** reference IoC. The positive control checks reversibility and scoring sensitivity to the stated additive transform; it does not establish detection power for other unknown renderings or ciphers.

### Decision

The table cannot be an **unmodified, low-degree 8-column polynomial share matrix** under the three specified fields and column coordinates. Interpolated eight-of-eight secrets do not restore normal GP-English statistics under the finite zero-IV, page-reset AES-CTR/ChaCha20 family. Consequently this exact reconstruction offers no key or decipherment and should not be retried without an independent share-coordinate/field clue or key-use mechanism.

This result does **not** exclude altered share coordinates, encrypted/salted shares, errors in the table, other finite fields, different cryptographic modes, IV derivation, unknown byte-to-rune mappings, stateful key consumption, non-English plaintext or plaintext transformed before encryption. The existing grid-source transcription includes a limited number of debated byte readings; this test uses the repository's current canonical byte table.

**Reproduce:** [sims/grid_shamir_rs_inverse.cjs](../sims/grid_shamir_rs_inverse.cjs), built-in Node.js 22, full 55-page exact input, field arithmetic, source SHA-256, and synthetic inverse assertions. The existing manual-only [grid-256-tests.yml](../.github/workflows/grid-256-tests.yml) now executes this experiment alongside the canonical token and SHA regression. [Successful GitHub Actions run 42787563432](https://github.com/FlareZ123/liber-primus/actions/runs/42787563432) generated the entire ranked 24-setting ledger and field-consistency counts. As a bounded negative, this investigation does not change [the authoritative manuscript status](../results/README.md).
