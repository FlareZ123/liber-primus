# 2013 prime_echo as a 58×8 page-local key: bounded negative

**Classification:** source-motivated exploratory test; no unknown plaintext, authentic LP2 key, or intended cipher recovered. This is a narrow exclusion of one direct additive consumer, not a claim that the 58×8 arrangement was intended.

## Why this alternative was worth one test

The recovered 2013 Cicada OS prime_echo script emits **464 consecutive primes**, from 2 through 3301. LP2's second-release index contains **58 physical pages**, and the numerical table on physical p50 is printed in **eight columns**. The 2013 source also contains the phrase “The key is all around you”; solved LP2 text explicitly calls primes and the totient function sacred. These independent facts motivate one simple alternative to the already-tested 16×29 interpretation:

- reshape the 464-prime stream into **58 rows × 8 columns**;
- assign row j to physical LP2 page j;
- use the eight prime values as a repeating period-eight GP29 additive key on that page;
- test prime residues and Euler-totient residues, in both additive directions.

The strongest objection is important: the original prime_echo script prints **ten primes per line**, not eight. The 58×8 arrangement is an analyst-imposed reshape. No original source instructs a solver to map prime rows to LP2 pages or to use the eight columns as a cipher period. The 2013 phrase is contextual, not a key-consumption rule. This was therefore a cheap, falsifiable human-solver hypothesis, not an established instruction.

## Frozen original-input inverse

For physical page j, assign the eight consecutive primes p(8j+1) through p(8j+8). At rune position i within that page, use key position i mod 8. Test only:

- P = (C ± (p mod 29)) mod 29;
- the same two directions with φ(p) = p − 1 mod 29.

The key clock resets at each **physical** page. Physical p50 has no rune text, but its eight-prime row remains reserved so later page assignments do not shift. Only unknown pages p0–p55 are scored: 55 rune-bearing pages and **12,956** original runes. No phase, row permutation, key offset, alternate page clock, or fitted plaintext is searched.

The prime and totient cases are not independent key families: φ(p) = p − 1, so the two decoded streams differ only by a global one-symbol rotation for each direction.

## Results

The score is the add-one-smoothed 29-symbol unigram log likelihood trained on the first 240,000 characters of the checked-in Shakespeare control, using the repository's GP orthography. Its untouched 43,802-rune continuation scores −2.97858 nats/rune.

| Candidate | Original IoC | Mean unigram log likelihood |
|---|---:|---:|
| Raw unknown ciphertext | 0.03447840 | −4.28237023 |
| Prime, subtract | 0.03448269 | −4.26288390 |
| Prime, add | 0.03445223 | **−4.25071707** |
| Totient, subtract | 0.03448269 | −4.29337738 |
| Totient, add | 0.03445223 | −4.26542552 |

The best candidate is still far from the native-English control and begins:

**BJDIBOSMBFDEATSEAAEIAOTFXOEMEALIOETHYGFFDRXOBDMIAMEOOLEAOEFURIAYRAEUJOLUCNGBPOOEOEHOINRFFPAEOMLODEAWBWNGTHNGSNTHWOEEANG**

The small improvement over raw ciphertext is not evidence for the source ordering. A fixed-seed null permuted all 464 prime residues 1,000 times, reshaped each permutation into the same 58×8 page blocks, and scored the maximum over the same four nominal variants. The source key ranks **394th of 1,001** (393 shuffled orders tie or outperform it; add-one empirical p = **0.3936**). The shuffled maxima have mean −4.25380, sample SD 0.01137, 95th percentile −4.23485, 99th percentile −4.22311, and maximum −4.21497. The source order is not exceptional.

A 12,956-rune held-out Shakespeare GP plant encrypted and recovered exactly under the tested key schedule. This verifies the implementation and page clocks only; it does not authenticate the source hypothesis.

## Decision

Retire the **direct 58×8 page-local additive prime/totient key**. The prime stream, page count, and table width do not by themselves select this consumer, and its source order has no discriminating language signal. Do not expand this branch into arbitrary phases, row permutations, or alternate key-consumption rules. Reopen only if a separate original clue selects a different, explicit operation or key schedule.

This result does not exclude non-additive uses of the prime inventory, unrelated uses of the p50 table, or other cipher layers.

## Reproduction

Run the standalone Node 22 reproducer:

- [sims/prime_echo_58x8_page_key_gate.cjs](../sims/prime_echo_58x8_page_key_gate.cjs)

It reads the original checked-in LP2 corpus, the recovered 2013 prime_echo script, and the Shakespeare control. It recomputes the 464 primes, asserts the physical-page and rune counts, tests all four stated variants, validates a full-length planted positive control, and repeats the 1,000-order null with a fixed seed. No CI workflow or automatic trigger was added.
