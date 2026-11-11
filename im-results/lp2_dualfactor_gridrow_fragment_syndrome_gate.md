# Original LP2 table-row / thirteen-dot fragment polynomial-syndrome gate

**Classification, 11 November 2026 (Agent 9):** a source-frozen negative for one direct row-to-fragment authentication/codec hypothesis. The two quadratic factors of the 256-byte printed table remain genuine algebraic facts; this experiment does not demote them and does not recover plaintext.

## Why this particular original-cipher test

Two otherwise separate original artifacts supply exactly **32 ordered containers**:

- The original p49–51 32×8 printed numeral table has 32 rows of eight byte-representable base60 tokens (canonical bytes from [`lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json)).
- The **31 thirteen-dot stencil events** from [original ink annotations](../resources/liber-primus/lp2-ink-annotations.json) create **32 ordered text fragments** across the complete LP2 sequence, including both solved pages. Two fragments are zero-length because distinct original events have identical global rune positions, at fragment indices 8 and 11; dropping them changes the mapping.

The authenticated 2013 `BASE29 3301→3QO` example provides polynomial `H(X)=3+26X+24X²` over GF29 under the existing ascending-digit interpretation. The original p39 marked red rune triad gives `G(X)=27+5X+15X²`. Both are exact divisors of the **complete 256-byte table** interpreted as descending coefficients modulo29, as documented in [the cross-source factor report](2013-base29-gf29-grid-factor.md) and [the exact ambiguity-corrector SFT](../sims/lp2_grid_dual_factor_error_corrector_sft.cjs). Their product in the conventional descending representation is `F=[12,17,11,21,23]`.

A human-visible candidate is that each eight-byte row communicates **four check symbols** for its correspondingly numbered thirteen-dot-delimited text fragment. This would be a precise algebraic use of both visible factors and the 32-to-32 structural correspondence, requiring no fitted key or unknown plaintext. It is a *hypothesis*: neither Cicada's original protocol nor the manuscript explicitly instructs this table-row-to-fragment check operation.

## Frozen operation and exact result

For every i from 0 to 31, read table row `B_i` and original rune fragment `C_i` as descending GP29 polynomial coefficients and compute the separate residues modulo `H`, `G` and their product `F`. Compare **exact equality of the complete syndrome vector**, with no row shift, reversal, symbol permutation, cipher-state fitting, or fragment dropping. An empty fragment is the zero polynomial.

| Source check | Number of aligned row/fragment syndrome matches |
| --- | ---: |
| H, two GP29 symbols | **0/32** |
| G, two GP29 symbols | **0/32** |
| F=HG, four GP29 symbols | **0/32** |

The first row's H syndrome is `[19,8]`, while its first 13-rune fragment has `[15,23]`; their G syndromes are `[24,2]` and `[26,24]`, respectively. No later position matches either quadratic exactly. On the complete byte stream, both H and G syndromes are still exactly zero. A source-row self-identity plant passes 32/32 per factor, while the frozen cyclic wrong-row control passes 0/32.

The deterministic [CommonJS reproducer](../sims/lp2_dualfactor_gridrow_fragment_syndrome_sft.cjs) loads the current canonical original byte table, complete 13,136-rune corpus and original marker inventory, includes **all** 31 events and both empty fragments, checks both global factors, computes every original syndrome and verifies the positive and wrong-row controls.

## Source-layout orientation: a positive selector for row-major algebra

The same two independently selected polynomial checks distinguish the two literal ways to serialize the **32×8 printed source grid**. All 256 bytes read in ordinary row-major order give both exact zero syndromes; column-major serialization gives **H=[28,28], G=[1,21], HG=[9,7,5,5]**. Testing each of the eight 32-byte source columns separately also yields nonzero H and G syndromes in every column. This is an exact, source-bounded positive observation: the H/G checksum identity is **specific to the natural printed row-major serialization**, and it does not survive the competing vertical table read. The code asserts the original bytes and these values.

The result supports choosing row-major for subsequent polynomial investigations but says nothing yet about mapping rows to ciphertext, since the direct 32-row fragment gate above is negative. It is not evidence of an independently hidden plaintext.

## Independent terminal 256-rune codeword test

The original manuscript also offers a conspicuous, source-fixed **256-to-256 size equality**: terminal p55 has 76 runes, solved p56 has 85, and solved p57 has 95. Thus the contiguous terminal three-page sequence is exactly **256 GP29 runes**, the same width as the numerical table's 256 bytes. The simplest cross-object algebraic prediction is that the terminal rune polynomial carries the same source H/G factors as the numeric table.

Using the terminal original-rune order without a shift, reset, rewrite, or fitted key, exact GF29 division gives:

| Source factor | 256-byte table remainder | 256-rune terminal remainder |
| --- | --- | --- |
| H | `[0,0]` | **`[8,6]`** |
| G | `[0,0]` | **`[21,28]`** |
| HG | `[0,0,0,0]` | **`[3,22,16,2]`** |

The 256-rune terminal cannot be the same H/G codeword register without an additional, independently identified encoder. This is a distinct direct original-payload prediction and is asserted by the updated SFT. It does not preclude those 256 runes and 256 grid cells participating through some other keyed reversible operation.

## Cryptanalytic implication

The fixed 32-row/32-fragment correspondence and source-derived H/G algebra **do not jointly define a direct per-fragment polynomial checksum**. This closes only the simplest syndrome-equality interpretation. A genuine encoding using a source-selected transformation, secret state, different framing or function of the row could remain; this result supplies no reason to search free orientations, row offsets or arbitrary syndromes. The original LP2 ciphertext remains unsolved.
