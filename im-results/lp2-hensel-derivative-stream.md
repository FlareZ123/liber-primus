# Source-derived 29-adic derivative stream: bounded original-input negative

**Classification:** reproducible source-constrained negative; no unknown LP2 plaintext, authentic key, or intended mechanism recovered.  
**Agent:** Agent 2 · 10 November 2026

## Why this was tested

The original LP2 red inscriptions provide a compact algebraic solve-path hypothesis:

- p3's red triad at local rune 119 is GP [13,23,2], defining the irreducible quadratic presentation u²=3u+8 of GF(29²).
- The exact 256-byte p49–51 base60 table, read in its printed forward row-major order as descending coefficients, defines P(X) in GF(29)[X].
- The p3 seed z ≡ 23+27u (mod 29) is a simple root of this polynomial in the quadratic extension and Hensel-lifts in Z_29[u].
- Independently, p39's red triad [27,5,15] is exactly [P(15),P'(15),15] (mod 29). This is a visible reason to consider the first-order Taylor jet, not an arbitrary choice of an algebraic operation.

The question was whether the lifted root's derivative P'(z) supplies a source-derived two-rune register/key.

## Exact first-jet block map is impossible in the tested framing

Pair the 12,956 original unsolved runes consecutively into 6,478 GF(29²) symbols, using the p3 quadratic basis. The literal first-order Taylor map at the lifted root is

    C_i = P(z) + P'(z)_i M_i = P'(z)_i M_i,

because the Hensel root satisfies P(z)=0 to the full 6,478-digit precision. The derivative digit pairs are the block multipliers.

Exactly **6 of 6,478** derivative blocks are zero in GF(29²), at pair offsets:

| Pair | Global rune offset | Physical page | Page-local rune | Required ciphertext | Actual ciphertext |
|---:|---:|---:|---:|---:|---:|
| 1778 | 3556 | 14 | 90 | (0,0) | (23,13) |
| 2016 | 4032 | 17 | 3 | (0,0) | (23,2) |
| 2581 | 5162 | 21 | 60 | (0,0) | (10,26) |
| 3218 | 6436 | 26 | 174 | (0,0) | (28,16) |
| 3429 | 6858 | 28 | 97 | (0,0) | (19,15) |
| 3807 | 7614 | 31 | 44 | (0,0) | (20,27) |

At a zero multiplier, **every** possible plaintext block must encrypt to (0,0). None of the six original blocks does. This is a key-independent contradiction; no language model, fitted key, or inverse implementation is involved.

This rejects the exact direct, book-continuous, zero-offset GF(29²) first-jet block transform. It does not reject other pair offsets, page-local block framing, nonlinear Taylor terms, extra layers, or a different intermediate register.

## Derivative digits as a direct additive GP29 pad

A second, separately reversible reading treats the two base-29 coordinate expansions of P'(z) as a 12,956-symbol additive key. I tested the full small source-natural set:

- coordinate interleaving AB or BA;
- decode sign +1 or −1;
- book-continuous or physical-page-reset key clock.

No offset, phase, key fitting, or language-driven parameter choice was used.

The source ciphertext baseline and best candidate scores are:

| Measure | Original | Best of 8 derivative-pad variants |
|---|---:|---:|
| IoC | 0.03447840 | 0.03450689 |
| Shakespeare GP trigram | −6.296569 | −6.257302 |
| Emerson GP trigram | −6.433127 | −6.432176 |

The best Shakespeare-scoring candidate is BA, sign −1, book-continuous. Its modest improvement is not source-specific evidence: a deterministic null that shuffled the **6,478 derivative coordinate pairs** (preserving each pair's two coordinates), and took the best of the same eight order/sign/clock variants, produced:

- 200 replicates, xorshift32 seed 0x3301c0de;
- null mean best score −6.262131, SD 0.017218;
- 77/200 null maxima at least as good as the actual best;
- plus-one empirical p = 0.38806.

The Emerson score likewise shows no meaningful improvement. The best output remains non-linguistic. The score is a bounded native-GP-English diagnostic, not a claim about every possible plaintext language.

The additive implementation has an exact positive control: the first 94 known cleartext runes of solved p57 were encrypted and recovered exactly under the same AB derivative stream.

## Reproduction

Run:

    node sims/lp2_hensel_derivative_stream_sft.cjs

The self-contained SFT reads only the repository's original lp2-corpus.json, base60-grid.json, lp2-ink-annotations.json, and pinned Shakespeare/Emerson control texts. It asserts the original 256-byte grid SHA-256, both red triads, the p39 value/derivative identity, every Hensel precision step, the full root equation, the zero-multiplier contradiction, the eight additive variants, the deterministic pair-permutation null, and the solved-p57 positive control.

Supporting source identities:
- resources/liber-primus/base60-grid.json — original normalized 256-byte table; byte-stream SHA-256 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290.
- resources/liber-primus/lp2-corpus.json — canonical source-indexed 55-page unsolved corpus.
- resources/liber-primus/lp2-ink-annotations.json — source red-span coordinates and glyphs.
- resources/control/shakespeare_first300k.txt and resources/control/emerson_essays_2944.txt — independent language-scoring controls.

## Decision

Do **not** expand this exact derivative-stream family with arbitrary phases, offsets, or extra permutations. The direct first-jet block map is contradicted at six original positions; the additive derivative pad is indistinguishable from pair-permuted keys under the same eight-variant scoring gate. This is useful boundary evidence, not a decryption. The still-open Newton-orbit schedule from p3's finite singular trajectory is a distinct hypothesis and was not tested here.
