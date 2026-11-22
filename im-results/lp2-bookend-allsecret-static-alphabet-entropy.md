# Original LP2 81²/80² bookend: all-secret static-alphabet entropy obstruction

**Agent50, 22 November 2026. Cryptanalytic exclusion on the complete original ciphertext.** No new unknown-page plaintext, authenticated key, or creator-selected cipher is claimed. This is a source-fixed and mathematically exact test of a large class of genuinely reversible ciphertext receivers that previous additive-key sweeps did not cover.

## Motivated source geometry and the proposed receiver

The 56 LP2 physical unsolved pages p0–55 contain **12,956 original GP29 runes**. The identical six-rune word pair `DJU BEI` ends once at absolute source offset6,561=81² and again at the final rune. Thus the first 6,561 runes are a source-sized **81×81** register `A`. The second 6,395 runes and five original printed paragraph-numeral slots (ordinal 80×80 offsets **2244,2384,2476,2575,2672**) are a source-sized **80×80** register `B`; those labels remain holes, with no invented GP29 glyph values.

The p7 source-red word products `[11,26,8,15,2]` reduce modulo3 to the monic irreducible polynomial `x⁴+x²+x+1`. The following p8 source-red word products `[4,3]` motivate a GF81 reading. In this published representation `g=x+1` is primitive, of order80. Test two plausible *fully source-determined* key symbols `K(r,c)` at each of B's real positions: `A[g^r,g^c]`, using base-3 polynomial-basis field indices 0…80, and the immediate 80×80 `A[r+1,c+1]` interior crop without field arithmetic.

A putative decrypter might use the original source rune at each location as a key to a completely private substitution alphabet: `P_i=π_(K_i)(C_i)`, with **29 independent secret arbitrary 29-symbol permutations** `π_0…π_28` reused at every matching source key. This grants all `(29!)²⁹` choices, a massive superset of source-keyed GP29 Vigenère. Nothing in original pages authenticates this decoding operation; it is a plausible architecture to decisively exclude.

## Exact all-secret theorem

Let `H` be empirical Shannon unigram entropy in bits per rune. A bijection within each source-key class merely renames entries in its observed conditional 29-symbol frequency table. Therefore *for every choice of the secret alphabet set*,

`H(P|K)=H(C|K)`.

By the exact entropy chain rule, **`H(P)≥H(C|K)`**. This is a complete, key-independent necessary condition for any direct decoded GP29 plaintext under this family; there is no key enumeration, candidate-language fitting, corpus null assumption, or guessed plaintext in the proof.

The unchanged 6,395 original B runes have entropy **4.8554962413 bits/rune**. Their conditional source-key tables and universal inverse lower bounds are:

| Original key stream | `H(C|K)` exact minimum of all decoded plaintext unigram entropy | `I(C;K)` |
| --- | ---: | ---: |
| Field coordinates `K=A[g^r,g^c]` | **4.7695940713** | 0.0859021700 |
| Literal interior crop `K=A[r+1,c+1]` | **4.7614117321** | 0.0940845092 |

For context, the repository's LP1 original-solved-orthography-calibrated GP29 English encoder yields **4.2944425927 bits** for the pinned Gibran corpus and **4.2853769098 bits** for the pinned Shakespeare sample. The first 6,395 GP runes of the independent Gibran corpus have entropy **4.2768236800**. Thus the original ciphertext would require any recovered native-GP plaintext in these two enormous fixed-secret alphabet families to be ≥**0.467–0.475 bits per rune more uniform** than the independently encoded Gibran control. Direct ordinary-English plaintext with the solved-source-like GP29 unigram distribution is excluded under these exact operations. This does not mathematically rule out *every conceivable English string*; the decisive statement is the quantitative lower bound.

Under 1,024 exact-original-cipher-histogram shuffles per key, original mutual information is unexceptional (field `I=.08590` against null mean `.09093`; crop `I=.09408` against null mean `.09075`). These are descriptive controls only; the exact entropy inequality does not rely on a p-value.

## More permissive source geometry: 80 or 81 entirely secret coordinate alphabets

The source square also motivates varying a secret alphabet **by its printed-grid row, column, or wrapped diagonal** rather than by a key symbol. Grant *one independently arbitrary 29-symbol permutation to every distinct coordinate phase* and apply the identical conditional-entropy theorem. Complete original data give:

| Direct source register and independent secret alphabet clock | Distinct secret alphabets | Every decoded GP29 `H(P)` ≥ |
| --- | ---: | ---: |
| 81×81 A, row index | 81 | **4.6009183485** |
| 81×81 A, column index | 81 | **4.5899885948** |
| 80×80 B, row index | 80 | **4.5862706025** |
| 80×80 B, column index | 80 | **4.5732698691** |
| 80×80 B, `(row+col) mod80` | 80 | **4.5706543982** |
| 80×80 B, `(row−col) mod80` | 80 | **4.5738506445** |

Each exact lower bound is still at least **0.276 bits/rune above** the full Gibran native-GP reference despite granting `(29!)⁸⁰` or `(29!)⁸¹` secret keys. A jointly indexed `(row,col)` alphabet, with a different secret key at every one of ~6400 positions, is not covered; nor is a stateful alphabet that changes over time. The tested row/column/diagonal clocks each arise from the original 81²/80² dimensions, and no post hoc phase is optimized.

## Genuine cipher positives and decision

The executable SFT constructs **secret independently randomized 29-rune permutations for every key class** and encrypts the original-source-calibrated Gibran GP29 runes under each field, crop, row, column and diagonal clock. Every planted value is exactly recovered by its full inverse, including 6,395/6,395 source-B positions and 6,561/6,561 source-A positions, and the conditional-entropy invariant is verified to machine precision. It also asserts the precise original entropy tables and the printed-five-hole geometry, so a parser error cannot silently manufacture this exclusion.

**Disposition:** retire the direct **stationary per-source-key GP29 substitution** reading for the literal A/B crop, p7 GF81 field map, independent grid rows/columns and single diagonal clocks as a route to ordinary native GP29 English. No source-selected original plaintext decoder has emerged. The remaining viable puzzle mechanisms require a changing cipher state, nonlinear/nonbijective output with reversible side information, a source-supplied additional key or spatial transposition, a non-GP/encoded intermediate register, or an externally missing historical handoff. Do not search more secret alphabet permutations against these same frozen source clocks.

Reproducer: [Windows Node.js22 CommonJS original-cipher SFT](../sims/lp2_bookend_gp29_allsecret_statealphabet_entropy_sft.cjs). Original source: `resources/liber-primus/lp2-corpus.json`, original GP image-based numeral holes; native reference `resources/control/gibran_prophet_58585.txt` and `shakespeare_first300k.txt`. [Original-source passing Windows Node22 CI run (field/crop)](https://github.com/FlareZ123/liber-primus/actions/runs/45061370266); [all six coordinate-clock extension workflow](https://github.com/FlareZ123/liber-primus/actions/workflows/agent50-gf81-palette-original-manual.yml). The adjoining [all-secret black/white raster certificate](lp2-p7-gf81-bookend-spatial-raster-original-gate.md) independently rules out a strongly clustered static-color image in the same geometries.
