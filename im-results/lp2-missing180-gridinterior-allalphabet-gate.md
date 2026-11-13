# Original 2013 missing 180 primes versus LP2 table interior: all-alphabet obstruction

**Status (13 November 2026, Agent 1): exact, source-motivated conditional exclusion. No plaintext, decryption key or author-prescribed handoff recovered.**

## Independent source objects and candidate route

A contemporaneous 2013 participant source preserves a 180-prime omission from the `prime_echo` list: ordinary primes of inclusive ordinals 21 through 200, values **73 through 1223**. The original 2014 LP2 printed numerical grid (physical pp49–51) has **32×8 = 256** cells, leaving an exact **30×6 = 180**-cell interior and **76** perimeter cells. This motivates asking whether the omitted 2013 prime residues were placed into the 2014 table's interior, perhaps in a rearranged order or under a hidden 29-symbol alphabet. The historical artifact does **not** instruct this transfer; the size match was noticed retrospectively.

Freeze the existing source-first **base60** parse in [`resources/liber-primus/base60-grid.json`](../resources/liber-primus/base60-grid.json) and the ordinary prime list described in [the 2013 original-primes study](2013-first-onion-primes-xGY4pbHV-original-source.md). Treat a prime value `q` as `q mod 29`, and each original table byte `b` as `b mod 29`, in the Gematria Primus field. The candidate class allows any one fixed, completely unknown mapping `f:{0,…,28}→{0,…,28}`, including a noninvertible function, **and** any rearrangement of the 180 source positions. No cipher language model, crib or manually selected codebook is needed to reject this family.

## Complete original-symbol support obstruction

| Fixed original data | Source size | Distinct GF29 values | Occurrences of residue zero |
| --- | ---: | ---: | ---: |
| 2013 missing primes p21–p200 mod29 | 180 | **28** | **0** |
| 2014 printed 30×6 interior bytes mod29 | 180 | **29** | **4** |

Every omitted prime exceeds 29, so none is divisible by 29. In this complete 180-prime interval all other residues 1–28 appear. By contrast the **180 original interior cells represent all 29 possible residues**, including four multiples of 29. For any stationary deterministic substitution `f`, the output-symbol support cannot exceed the input-symbol support. Position permutation preserves symbol support. Therefore **no such substitution can reproduce the complete source table interior**. The conclusion holds for any hidden 29-symbol bijection and even any many-to-one stationary map. A reversible affine relabeling is strictly contained in the rejected family.

A nontrivial source-native positive plant applies `f(x)=(7x+3) mod29` to all 180 missing-prime residues and reverses their order. It correctly retains 28 distinct symbols. The actual 2014 table has 29; the obstruction depends on untouched source data, not a chosen hidden permutation or a language score.

## Decision and boundary

**Retire a direct omitted-prime-residue → inner-180-cell codebook under one stationary symbol map**, regardless of position order. The 180/180 and 76/76 source-size relationships remain exact but do not select an encryption operation. This test does not exclude indexing into the full primes, position-varying keying, arithmetic combinations of multiple primes, binary serialization, or other independent sources and operations. The base59 alternative parse is outside its stated scope. No unknown LP2 rune plaintext has been recovered.

The [self-contained CommonJS original-input SFT](../sims/lp2_missing180_gridinner_support_sft.cjs) reconstructs the first 200 primes, asserts historical omission boundaries, the exact unmodified 256-byte table SHA-256, both support sizes, all residue counts and the positive plant. It uses only Node.js standard libraries.
