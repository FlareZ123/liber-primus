# Original whole-book Latin26 remainder is invariant under quotient-sidecar packing

**Agent34, 22 November 2026.** Bounded original-source result for [Director #2264](https://github.com/FlareZ123/liber-primus/issues/2264), extending the [exact 256-byte sidecar capacity study](lp2-p50-gp29-to-latin26-2042bit-sidecar-gate.md) without repeating its 16 raw-byte-order tests. No unknown LP2 plaintext, creator-authenticated opcode, key, or destination was recovered.

## Exact original input and a general negative theorem

The authentic 2013 Cicada BASE29 integer challenge and the printed Gematria Primus alphabet motivate converting the **complete unchanged 12,956-GP29-symbol** unknown tape into one big-endian base29 integer `X`. Source page order, printed words and all 32 actual cross-page carries are retained. For `N=12956`, `B=26^N`, define:

```text
Q = floor(X/B)
R = X mod B
X = Q*B + R,       0 <= R < B
```

A proposed sidecar stores `Q`, leaving `R` as exactly `N` base26 Latin letters A–Z with leading A permitted. The [previous study](lp2-p50-gp29-to-latin26-2042bit-sidecar-gate.md) discovered that the exact GP29→Latin26 capacity gap is 2,042 bits, fitting within the 256 printed base60-byte tokens across original p49–p51, but rejected direct table bytes in 16 literal original layouts because their first bytes are too large.

**Exact general constraint:** for fixed source `X` and frozen base26 modulus `B`, the quotient `Q` and remainder `R` are unique. Every *bijective storage representation of Q*, including all column rotations, bitplane transposes, byte orders, bit reversals, or custom recoverable packings, changes only how Q is *stored*. Such a storage transformation **cannot change the computed R, the candidate Latin26 text, or its original word-aligned statistics**. Therefore a new quotient packing by itself cannot recover Latin letters from the original ciphertext. Any claimed distinct decoded text needs a separately specified reversible transform of X, a source-selected quotient-dependent map acting on R, or a different intermediate/alphabet. None is yet independently supplied by the source. This theorem is conditional on the canonical full-register model and makes no impossibility claim for all mixed-radix ciphers.

## Fixed original Latin26 output

The exact original Q requires **2,041 bits** and its first eight 256-byte big-endian bytes are **01 22 6C 99 ED 00 A6 7C**. `Q_max = floor((29^N-1)/26^N)` has 2,042 bits. The unmodified original R decodes to a complete **12,956-letter** Latin26 stream beginning:

`PMXESCVUPLQQTNBWSBZZCGWIJDVINBJVTVCFEFFZIKIOGIVXVEEBZVOJQKCLIJZOQADZRLPJBGNBZXVFFRJOQWUBPXWXVEMJWOTOVDNVYLEBYCYGHEAFFMXKPPUFA`

| GP29 source-aligned region | Latin letters | Original Latin26 IoC | Top-five-letter share |
| --- | ---: | ---: | ---: |
| Whole original p0–p55 | **12,956** | **0.03846801972** | **20.5773%** |
| P3–p7 scroll | **1,145** | **0.03837450759** | **23.6681%** |
| Independent p16–p21 | **1,613** | **0.03846923031** | **22.5666%** |
| Independent actual Shakespeare Latin26 reference | **12,956** | **0.06456760280** | **43.4471%** |

The complete original output shows no 300-letter contiguous plaintext, and no coherent 200-letter independent holdout. Its whole-book frequency distribution is near uniform 1/26. R is **fixed independent of all quotient serializers**, so arbitrary byte reordering cannot improve these results.

## One genuinely new 32×8 source-typed sidecar transporter

The physical source table has **32 printed rows ×8 two-character cells**, spread p49/p50/p51 as 10|13|9. A historically simple new alternative to the sixteen tested direct byte traversals is an **8×8 bitplane transpose on each printed eight-byte row**, taking source `row[r][column c]` bit b to output `row[r][column b]` bit c. This freezes one fully invertible, lossless, source-layout motivated operation without scanning other packers. All 32 original rows pass exact transpose-twice identity.

The first original conventional-base60 row **CB E7 A7 BA 61 ED 7E B7** maps to **B7 CF E6 69 C8 FE 73 AF**. Treating the complete transformed 256 bytes as the big-endian quotient yields a **2,048-bit** integer, strictly greater than the legal **2,042-bit `Q_max`**. Hence **no GP29 message of the asserted length** can use this transport as the literal canonical full-book quotient, independently of language and of the original X. The original printed grid does not explicitly command bit transposition; this one source-visible receiver is tested and rejected, not authenticated.

## Native-control inverse and false control

The [Windows Node22 read-only reproducible SFT](../sims/lp2_p50_bitplane_quotient_invariance_original_sft.cjs) constructs a full **12,956-letter native Shakespeare** source, interprets its A–Z values as `R_english`, combines it with the *actual* original legal quotient `Q` as `Xplant = Q*26^N + R_english`, verifies this integer is strictly below `29^N`, packs it as exactly 12,956 GP29 digits, and decodes the precise original quotient and **12,956/12,956 native letters**. A one-bit alteration of the printed table does not match the unique actual Q. These checks establish codec correctness without authenticating the source route.

[Successful Windows/Node22 GitHub Actions #45022201201](https://github.com/FlareZ123/liber-primus/actions/runs/45022201201). Original stable input: [GP29 corpus](../resources/liber-primus/lp2-corpus.json), [adjudicated 256 source cells](../resources/liber-primus/lp2-grid-256.json). Previously covered 16 literal byte orders are not rerun.

## Decision for Director

**Retire this 8×8 bitplane sidecar** by exact magnitude impossibility. More generally retire *pure quotient-serializer searching as a way to change the canonical original Latin26 remainder*: its invariance is mathematical, and the original remainder is demonstrably nonprose. Preserve 2,042-bit/256-byte capacity as an intriguing but unselected source relation. A renewed sidecar hypothesis must present a **first-party typed operation changing the remainder** or the full 29-ary source representation and predict independent original plaintext. No further arbitrary Q packer, by itself, can satisfy the objective.
