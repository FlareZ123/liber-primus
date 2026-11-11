# p15 Fibonacci-prime spiral as a paired page/word map: bounded negative

**Classification:** exact original-source navigation experiment with a finite negative result. The p15 Fibonacci-prime construction is real and reproducible; neither paired address reading below yields an independently useful plaintext route or key. **No unknown LP2 plaintext or authentic cipher key is recovered.**

## Source-fixed input

The original p15 square (physical LP2 page 15, archive image 32.jpg) is already established as a clockwise spiral from the red 3299 cell. Its 16 printed values are:

3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516.

For each value v, the established construction is p = |3301 − v|, with one-based prime ordinal n = π(p). The resulting primes and ordinals are:

| Spiral | F | Prime p | Ordinal n = F+1 |
|---:|---:|---:|---:|
| 1 | 0 | 2 | 1 |
| 2 | 1 | 3 | 2 |
| 3 | 2 | 5 | 3 |
| 4 | 3 | 7 | 4 |
| 5 | 5 | 13 | 6 |
| 6 | 8 | 23 | 9 |
| 7 | 13 | 43 | 14 |
| 8 | 21 | 79 | 22 |
| 9 | 34 | 149 | 35 |
| 10 | 55 | 263 | 56 |
| 11 | 89 | 463 | 90 |
| 12 | 144 | 829 | 145 |
| 13 | 233 | 1481 | 234 |
| 14 | 377 | 2593 | 378 |
| 15 | 610 | 4507 | 611 |
| 16 | 987 | 7817 | 988 |

The two values above 3301 are handled by the already published absolute-difference rule; they are not exceptions. The question tested here is whether the two source-native coordinates p and n−1=F can act as page and word addresses in the 56 unsolved physical pages 0–55.

## Exact physical-page word model

Addresses use zero-based physical page numbers and one-based printed word numbers. The parser is the existing physical-page parser used by the signed-2016 base58 map: remove line wraps, split at printed delimiters, and retain the original physical page slots. There are **2,973 printed page-local rune words** over the 58 original pages; page 50 is the numerical grid and has no rune words. This is deliberately distinct from the 2,896-word stream that joins words across physical page boundaries. A page-local word address must use the former.

Two direct pairings were frozen, with no offset, page rotation, alternate modulus, or fitted direction:

1. **Prime value as page; prime ordinal as word:** page = p mod 56, word = ((n−1) mod 56)+1.
2. **Fibonacci index as page; prime value as word:** page = F mod 56, word = ((p−1) mod 56)+1.

### Reading A: prime value → page, ordinal → word

| Spiral | Address (page, word) | Selected rune word |
|---:|---:|---|
| 1 | (2, 1) | OEM |
| 2 | (3, 2) | EOHNGCTHTAEJTXH |
| 3 | (5, 3) | CNGD |
| 4 | (7, 4) | LCJ |
| 5 | (13, 6) | U |
| 6 | (23, 9) | NGWURS |
| 7 | (43, 14) | FOE |
| 8 | (23, 22) | FAOIANGBEATHCA |
| 9 | (37, 35) | IAEOE |
| 10 | (39, 56) | out of bounds |
| 11 | (15, 34) | BHAEJIAI |
| 12 | (45, 33) | LWCJWX |
| 13 | (25, 10) | NGXXAE |
| 14 | (17, 42) | EOGHEM |
| 15 | (27, 51) | OERIANCCT |
| 16 | (33, 36) | TJ |

**15/16** addresses exist. The only invalid address is p39 word56 (p39 has 55 printed words). The selected tokens do not form a direct plaintext instruction.

### Reading B: Fibonacci index → page, prime value → word

| Spiral | Address (page, word) | Selected rune word |
|---:|---:|---|
| 1 | (0, 2) | SYENGC |
| 2 | (1, 3) | OEAAENGSDPT |
| 3 | (2, 5) | EARB |
| 4 | (3, 7) | PNYASMB |
| 5 | (5, 13) | EEADR |
| 6 | (8, 23) | YSHUL |
| 7 | (13, 43) | EATHML |
| 8 | (21, 23) | RYIU |
| 9 | (34, 37) | OE |
| 10 | (55, 39) | out of bounds |
| 11 | (33, 15) | STHEAWJ |
| 12 | (32, 45) | out of bounds |
| 13 | (9, 25) | GPIC |
| 14 | (41, 17) | BTHOEEOYOEIB |
| 15 | (50, 27) | rune-free numerical grid |
| 16 | (35, 33) | JRIA |

**13/16** addresses exist. The invalid addresses are p55 word39, p32 word45, and p50 word27. No source clue in the p15 construction chooses an alternative word offset or a different modulus, so these failures are not repaired by tuning.

## Fixed recursive continuation through the signed-2016 word map

The 2016 signed-message interpretation already tested in the [base-58 word-map report](lp2-2016-signed-message-base58-word-map.md) assigns a printed word with GP-prime sum S to page S mod 58 and zero-based word index floor(S/58). This is provisional navigation, not an established cipher. To test whether the p15-selected words continue under that same fixed operation, I applied it to every valid start above without changing the rule.

The known solved endpoint is physical p56, zero-based word index 1: OESR, independently decrypted as **END** by the established p56 totient-prime cipher.

| Start set | Valid starts | Paths reaching END | Expected hits from exact END basin | Baseline probability |
|---|---:|---:|---:|---:|
| Reading A | 15 | 1 | 0.9687 | P(≥1)=0.63354 |
| Reading B | 13 | 0 | 0.8396 | P(0)=0.41907 |

The exact directed-pointer graph over all 2,973 printed words has **192** starting nodes whose deterministic walk reaches the END node, a basin fraction of **6.4581%**. Under a uniform sample without replacement of 15 or 13 starts, the probabilities above follow from the exact hypergeometric no-hit probability. The observed one hit in Reading A and zero in Reading B are ordinary outcomes, not evidence that the p15 route selected the intended continuation.

Reading A's only hit begins at spiral position 16, p33 word36 TJ, and reaches the known endpoint in three transitions:

p33/w36 TJ → p38/w2 IAAETECF → p1/w7 OEI → p56/w2 OESR (END).

Most other paths enter existing cycles; the recursive map does not yield a new unknown plaintext or a distinctive route. The one END hit is explained by the size of END's pre-existing basin.

## Decision and scope

Retire these two direct paired-coordinate readings and their immediate recursive signed-2016 base58 continuation as plaintext/key routes. This is a finite exclusion of the two natural pairings only. It does **not** disprove the p15 Fibonacci-prime construction, nor every possible page-navigation use of it. It does not justify trying arbitrary offsets, rotations, alternate moduli, or word-index conventions without a new independent source instruction.

The strongest remaining use of the p15 square is its established Fibonacci-indexed prime generator. A successor should proceed only if an independent artifact specifies what the generated prime/ordinal sequence does to original ciphertext or to a withheld page.

**Reproducer:** [sims/p15_fibonacci_page_word_address_gate.cjs](../sims/p15_fibonacci_page_word_address_gate.cjs). The script asserts the original 16 values, generated prime ordinals, all 32 direct addresses, physical printed-word count, exact END basin, and positive source-navigation anchor.
