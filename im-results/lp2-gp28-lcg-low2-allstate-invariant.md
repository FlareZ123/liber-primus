# A key-independent exclusion of direct low-bit LCG 28-way step output

**Status (Agent23, 15 November 2026): exact original-cipher contradiction with four 32-bit-generator positive controls. No unknown LP2 plaintext, key or continuation recovered.** This decides a complete *arbitrary-seed and arbitrary-coefficient* generator class that the earlier [affine keystream study](affine-lcg-keystream.md) did not test. It is a direct-step model, distinct from that report's additive-GP29 plaintext mask. Source-reproducible [read-only CJS SFT](../sims/lp2_lcg28_low2_exact_invariant_sft.cjs), passed in [Windows Node22 Actions run 43669785831](https://github.com/FlareZ123/liber-primus/actions/runs/43669785831).

## Reversible-output hypothesis and exact low-bit obstruction

All 55 rune-bearing unknown LP2 pages have 12,956 canonical GP29 runes and only 86 equal adjacent ciphertext rune pairs across 12,901 within-page successor positions. One proposed *direct generator* emits a 28-way nonzero successor step

\[
D_i=(C_i-C_{i-1})\bmod29,\quad D_i\in\{1,\ldots,28\}.
\]

Suppose a hidden **arbitrary** 32-bit linear congruential state obeys

\[
X_{i+1}=aX_i+b\pmod{2^{32}},\quad Y_i=X_i\bmod28,
\]

with two source-compatible output interpretations:

1. **Ordinal step:** \(D_i=1+Y_i\).
2. **GF29 multiplicative step:** \(D_i=15^{Y_i}\bmod29\), where 15 generates all 28 nonzero residues. The original p15 source-red value provides a provisional historical cue for 15; the operation remains an unselected transfer.

In the first case define \(r_i=(D_i-1)\bmod4\), and in the second \(r_i=\log_{15}(D_i)\bmod4\). Since **28 is divisible by four**, both choices exactly give \(r_i=X_i\bmod4\). Every possible 32-bit seed, multiplier, increment and initial offset **must** therefore satisfy

\[
r_{i+1}=(a\bmod4)r_i+(b\bmod4)\pmod4.
\]

Only **16 coefficient pairs** cover the entire otherwise enormous parameter family. The test excludes every transition that touches a zero \(D_i\), so it permits zero steps to be opaque source-markers with arbitrary generator consumption. A separate word-internal test even permits **independent reseeding at every printed word** while retaining a global LCG transition rule. Page-local tests independently permit a page reset. The generator parameters may take any full-width 32-bit values; the modulus-4 obstruction is still mandatory.

## Untouched original results

| Source segmentation and exact nonzero adjacent-step pairs | Ordinal best of 16 | Multiplicative-log best of 16 |
|---|---:|---:|
| Physical pages, **12,676** pairs, 86 zero steps omitted | **3,256 / 12,676** (25.6863%) | **3,313 / 12,676** (26.1360%) |
| Complete original rune words, **7,152** pairs, 63 zero steps omitted | **1,862 / 7,152** (26.0347%) | **1,862 / 7,152** (26.0347%) |

No one of the 16 coefficient pairs agrees with every original transition. Even the best-fitting pairs miss **over 73%**. This is a deterministic violation of an exact necessary condition, not a p-value or an attempt to rank many unknown keys. The page test's best ordinal pair is (a,b)=(2,0); best multiplicative pair is (3,3). Both word-local best pairs are respectively (2,0) and (3,3).

**Independent real-generator positives.** The same CJS SFT generates four nontrivial original-shape ciphertext plants with the full-width update state = (1664525*state + 1013904223) mod 2^32, hidden initial state, and the precise original 86 page-local or 63 word-local zero-step marker locations. For both ordinal and exponent output rules, all **12,676/12,676 page-local** and **7,152/7,152 word-local** eligible transitions satisfy exactly the recovered (a,b)=(1,3) mod4. The positive controls preserve actual segmentation and test the complete inverse without giving it the plant's full seed or coefficients.

## Cryptanalytic consequence

**Do not brute-force 32-bit seeds for either direct-step 28-way low-bit LCG construction:** no seed, multiplier or increment can generate the published original differences under either frozen output rule. This conclusion also holds for LCG widths w≥2 with modulus 2^w, provided each emitted 28-way value is formed from the *low* state bits as specified.

This finding does **not** exclude high-bit rand()/mt_rand() implementations, a PRNG used **as a secret additive mask over unknown plaintext**, nonlinear output permutations, missing/suppressed nonzero steps, input-dependent key skips, changing coefficients inside page/word units, other 28-state transducers, or a different source register. The original source does not directly name an LCG, so this is an explicitly exploratory architecture elimination, not evidence that Cicada intended an LCG. A genuine solution still needs a source-selected keystream or output operation leading to independently recognizable plaintext.
