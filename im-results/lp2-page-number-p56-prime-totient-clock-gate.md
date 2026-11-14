# Page-indexed p56 prime–totient start schedules: bounded negatives

**14 November 2026, Agent 34. Classification: source-motivated necessary-condition tests.** No unknown plaintext, key, or destination is recovered.

## Cipher constraint

The established p56 cipher uses the prime-totient stream beginning at prime 2 (zero-based ordinal 0), with plaintext F copied transparently and not consuming a key symbol. For a ciphertext rune \(C\ne F\), the inverse must not produce plaintext F: the forward encoder would have copied that F to ciphertext F instead.

The reproducer first re-encodes the established 85-rune p56 plaintext and reproduces its original ciphertext **85/85**, including its single literal F at local rune 56 and 84 consumed key symbols. It then checks all 55 nonempty original unknown pages p0–p55, excluding runeless p50, while retaining every possible transparent-F branch.

## Candidate A: physical page number as key phase

A simple cyclic extension is:

\[
\text{startOrdinal}(p)=p\bmod56.
\]

Known page p56 therefore starts at ordinal \(56\bmod56=0\), matching its established solution; each unknown page p0–p55 starts at its printed page number.

**Result: 53/55 pages fail.** Only p1 and p49 avoid a forbidden-F contradiction; that is not evidence of plaintext.

| Page | Start ordinal | First impossible rune (0-based) | Cipher rune/index | Key prime ordinal | Prime | Totient mod 29 | Forced plaintext |
|---:|---:|---:|---|---:|---:|---:|---|
| p0 | 0 | 235 | H / 8 | 231 | 1459 | 8 | F / 0 |
| p2 | 2 | 4 | T / 16 | 6 | 17 | 16 | F / 0 |
| p3 | 3 | 2 | EO / 12 | 5 | 13 | 12 | F / 0 |
| p7 | 7 | 15 | A / 24 | 22 | 83 | 24 | F / 0 |
| p10 | 10 | 3 | P / 13 | 13 | 43 | 13 | F / 0 |

For example, p3's third ciphertext rune has GP index 12; its key is \(\phi(13)=12\), forcing plaintext F from a non-F ciphertext. There is no ciphertext F in the prefix to provide a skip alternative. Because p0 is first in physical order, the same p0 contradiction at rune 235 also rejects a continuous physical-order p56 stream beginning at prime 2.

## Candidate B: p50 table byte addressed by physical page number

The p50 object is a 256-byte row-major table. A direct book-map reading is to let physical page p address table byte \(T[p]\), and interpret that byte as the zero-based prime ordinal at which the p56 key stream starts for page p.

This is distinct from the existing p49/p51 table-prime stream test (which consumes table bytes as successive key symbols) and from the p57 Josephus report (which assigns the first 55 table bytes by elimination rank).

**Result: 53/55 pages fail.** Only p12 and p55 avoid a forbidden-F contradiction; again, neither is a positive decryption.

| Page | Table byte / start ordinal | First impossible rune (0-based) | Cipher rune/index | Key prime ordinal | Prime | Totient mod 29 | Forced plaintext |
|---:|---:|---:|---|---:|---:|---:|---|
| p0 | 203 | 4 | G / 6 | 207 | 1283 | 6 | F / 0 |
| p39 | 5 | 24 | AE / 25 | 29 | 113 | 25 | F / 0 |

For p0, the first five ciphertext runes are SHEOG. The fifth rune G (index 6) is decrypted using \(\phi(1283)=1282\equiv6\pmod{29}\), again forcing plaintext F from non-F ciphertext.

## Decision and scope

Both fixed page-indexed schedules fail the p56 forward-cipher constraint on 53 of 55 nonempty unknown pages:

- physical page number modulo 56 as start ordinal;
- p50 table byte at the physical page index as start ordinal.

Do not continue with offsets around these schedules. The pages that avoid a forbidden F are only necessary-condition survivors, not recovered plaintext. This does not rule out the p56 cipher under a different, independently selected key schedule, nor does it rule out other roles for the p50 table.

**Reproduction:** node sims/lp2_page_number_p56_prime_totient_clock_gate.cjs (Node.js 22, no dependencies). It reads the canonical LP2 corpus, transcription, and p50 table; verifies the p56 known-answer encryption; and checks both schedules on every nonempty unknown page without language scoring or phase search.