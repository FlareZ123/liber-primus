# Original 2013 missing 180 primes versus LP2 table interior: all-alphabet obstruction

**Status (13 November 2026, Agent 1): two exact, source-motivated conditional exclusions. No plaintext, decryption key or author-prescribed handoff recovered.**

## Independent source objects and candidate route

A contemporaneous 2013 participant source preserves a 180-prime omission from the `prime_echo` list: ordinary primes of inclusive ordinals 21 through 200, values **73 through 1223**. The original 2014 LP2 printed numerical grid (physical pp49–51) has **32×8 = 256** cells, leaving an exact **30×6 = 180**-cell interior and **76** perimeter cells. This motivates asking whether the omitted 2013 prime residues were placed into the 2014 table's interior, and the table's 76 perimeter cells transferred to the **76 original ciphertext runes of physical p55**, perhaps in rearranged order under secret 29-symbol alphabets. The historical artifact does **not** instruct this transfer; the size match was noticed retrospectively.

The primary branch fixes the source-first **base60** parse in [`resources/liber-primus/base60-grid.json`](../resources/liber-primus/base60-grid.json) and the ordinary prime list described in [the 2013 original-primes study](2013-first-onion-primes-xGY4pbHV-original-source.md). Treat a prime value `q` as `q mod 29`, and each original table byte `b` as `b mod 29`, in the Gematria Primus field. The source also permits a conditional **base59** reading under the same 2013 F-skip convention: remove lowercase \`f\` from the original 60-character alphabet and read the same 256 printed two-digit tokens with radix59. All original tokens remain valid byte values. The candidate class allows any one fixed, completely unknown mapping `f:{0,…,28}→{0,…,28}`, including a noninvertible function, **and** any rearrangement of the 180 source positions. No cipher language model, crib or manually selected codebook is needed to reject this family.

## Complete original-symbol support obstruction

| Fixed original data | Source size | Distinct GF29 values | Occurrences of residue zero |
| --- | ---: | ---: | ---: |
| 2013 missing primes p21–p200 mod29 | 180 | **28** | **0** |
| 2014 printed 30×6 interior bytes mod29 | 180 | **29** | **4** |
| 2014 printed 32×8 grid perimeter bytes mod29 | 76 | **24** | **3** |
| Original physical p55 ciphertext indices | 76 | **25** | **3** |
| Alternative base59 30×6 interior bytes mod29 | 180 | **29** | **7** |
| Alternative base59 76 perimeter bytes mod29 | 76 | **27** | **2** |

Every omitted prime exceeds 29, so none is divisible by 29. In this complete 180-prime interval all other residues 1–28 appear. By contrast the **180 original interior cells represent all 29 possible residues**, including four multiples of 29. For any stationary deterministic substitution `f`, the output-symbol support cannot exceed the input-symbol support. Position permutation preserves symbol support. Therefore **no such substitution can reproduce the complete source table interior**. The conclusion holds for any hidden 29-symbol bijection and even any many-to-one stationary map. Under base60 the **second direct transfer also fails**: the original table's 76 perimeter cells represent only 24 of the 29 possible residues, while the unchanged physical p55's 76 ciphertext indices include 25 distinct values. No one fixed deterministic map from perimeter residues to p55 GP symbols can create a new 25th symbol, regardless of any rearrangement. A reversible affine relabeling is strictly contained in the rejected family.

A nontrivial source-native positive plant applies `f(x)=(7x+3) mod29` to all 180 missing-prime residues and reverses their order. It correctly retains 28 distinct symbols. The actual 2014 table has 29. A separate planted affine map \`(3x+5) mod29\` of the perimeter, in reversed order, likewise preserves its 24-symbol support rather than producing the 25 classes seen on p55. Both obstructions depend on untouched sources rather than a chosen hidden permutation or a language score. The conditional F-skip radix59 parse does not rescue a **fixed bijective alphabet** on either branch: the interior again has all 29 residues while the omitted primes have 28, and its perimeter has 27 residues while p55 has 25. The 180-prime → interior obstruction remains valid for **any** stationary deterministic map in both radices. Under radix59, a noninjective function from 27 perimeter classes to 25 p55 classes is not excluded by support alone.

### Free-alphabet and free-order edit lower bounds

The mismatch survives much stronger concessions. Give a proposed *bijective* codebook **every one of 29! alphabet mappings** and allow **any ordering of all 180 or 76 positions**. For two symbol multisets of equal length, the exact smallest number of symbol edits still required is half the L1 distance between their sorted 29-entry frequency-count vectors. Sorting and matching counts minimizes absolute mismatch, and the remaining unmatched occurrences must be edited. The complete original data give:

| Proposed source transfer | Base60 minimum edits | Conditional F-skip base59 minimum edits |
| --- | ---: | ---: |
| 180 omitted-prime residues → 180 table interior cells | **20 / 180** | **17 / 180** |
| 76 table perimeter residues → 76 p55 rune indices | **4 / 76** | **6 / 76** |

This is an exact lower bound for **arbitrary secret reversible alphabets and arbitrary position permutations**, stronger than merely finding a support mismatch. It does not bound position-dependent substitution states or transforms combining multiple source symbols. The SFT independently asserts all four original-input bounds.

**An independent 180-symbol terminal check** uses the literal original p56 ciphertext85 and p57 clear95, together exactly 180 GP29 symbols. These cover **all 29** GP indices, while the 180 omitted-prime residues cover 28. No one fixed deterministic symbol map from those omitted residues can produce the complete printed p56+p57 sequence, regardless of the 180-position order. Even allowing every fixed bijection and arbitrary reordering requires **at least 29/180 symbol edits** by the same exact count-spectrum bound. This does not test the actual solved p56 plaintext in place of its original ciphertext and does not establish any common cipher across the two terminal pages, which have different authenticated states.

## Decision and boundary

**Retire the fixed bijective-symbol version of both transfers under either base60 or F-skip base59**: the 2013 omitted-prime residues → inner-180-cell grid, and the 76 grid perimeter residues → p55's 76 ciphertext runes, regardless of position order. The stronger arbitrary-stationary-function exclusion also applies to the **180-prime → interior** direction under both radices, and to the **base60 perimeter → p55** direction. Separate unknown fixed maps for each branch cannot rescue either necessary-condition failure. The 180/180 and 76/76 source-size relationships remain exact but do not select an encryption operation. This test does not exclude indexing into the full primes, position-varying keying, arithmetic combinations of multiple primes, binary serialization, or other independent sources and operations. The opposite noninvertible directions (interior→prime residues and p55→perimeter), and **base59 noninjective perimeter→p55**, remain outside the exact source-direction obstructions. Any reversible one-to-one map fails in both directions for either radix because the distinct-class counts differ. No unknown LP2 rune plaintext has been recovered.

The [self-contained CommonJS original-input SFT](../sims/lp2_missing180_gridinner_support_sft.cjs) reconstructs the first 200 primes, asserts historical omission boundaries, the exact unmodified 256-byte base60 table SHA-256, the conditional base59 token conversion, all four source-support sizes, residue counts and two positive plants. It uses only Node.js standard libraries.
