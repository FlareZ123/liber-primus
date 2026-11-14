# Physical page number as the p56 prime–totient start ordinal: bounded negative

**14 November 2026, Agent 34. Classification: source-motivated necessary-condition test.** No unknown plaintext, key, or destination is recovered.

## Hypothesis

The established p56 cipher uses the prime-totient stream beginning at prime 2 (zero-based ordinal 0), with plaintext F copied transparently and not consuming a key symbol. A simple cyclic extension to the full 56-page LP2 sequence is:

\[
\text{startOrdinal}(p)=p\bmod56.
\]

This makes known page p56 start at ordinal \(56\bmod56=0\), exactly matching its established solution, while each unknown page p0–p55 starts at its printed page number. It is a natural, parameter-free page-index schedule worth testing before more elaborate key hypotheses.

The test is per-page reset: page p starts at prime ordinal p. A continuous stream in physical order also begins at p0 with ordinal 0, so its first page is covered by the same necessary-condition test.

## Method and positive control

For every nonempty original page p0–p55 (excluding runeless p50), the reproducer applies the p56 inverse from start ordinal p. It tracks every possible interpretation of ciphertext F: it may be a literal plaintext F that does not advance the key, or it may encrypt a non-F plaintext and consume the next key. Any non-F ciphertext that would decrypt to plaintext F invalidates that branch, because the established forward cipher would have copied F unchanged.

The known p56 plaintext is re-encoded first. The implementation reproduces the original p56 ciphertext **85/85**, including its single literal F at local rune 56 and 84 consumed key symbols. Original page/segment associations are asserted against the canonical corpus.

## Result

<badge color="danger">Rejected</badge> **53 of 55** nonempty unknown pages have no valid transparent-F path under the page-number start schedule. Only p1 and p49 avoid an F contradiction; this is merely a necessary condition and does not establish plaintext.

Representative exact failures:

| Page | Start ordinal | First impossible rune (0-based) | Cipher rune/index | Key prime ordinal | Prime | Totient mod 29 | Forced plaintext |
|---:|---:|---:|---|---:|---:|---:|---|
| p0 | 0 | 235 | H / 8 | 231 | 1459 | 8 | F / 0 |
| p2 | 2 | 4 | T / 16 | 6 | 17 | 16 | F / 0 |
| p3 | 3 | 2 | EO / 12 | 5 | 13 | 12 | F / 0 |
| p7 | 7 | 15 | A / 24 | 22 | 83 | 24 | F / 0 |
| p10 | 10 | 3 | P / 13 | 13 | 43 | 13 | F / 0 |

The failures are exact algebraic contradictions, not poor language scores. For example, p3's third ciphertext rune has GP index 12; its key is \(\phi(13)=12\), forcing plaintext F from a non-F ciphertext. There is no ciphertext F in the prefix to provide a skip alternative.

Because p0 is the first page in physical order, the same p0 contradiction at rune 235 also rejects a continuous p56 stream beginning at prime 2 and running through physical page order.

## Decision and scope

Do not continue with page-number start ordinals or search offsets around them. The simple 56-periodic page-index schedule is rejected on 53 pages under the exact p56 forward-cipher constraint. The two pages that do not hit a forbidden F are not positive decryptions.

This does not rule out the p56 cipher under a different, independently selected key schedule, nor does it reject the p57 Josephus route or the p50 table's other possible roles.

**Reproduction:** node sims/lp2_page_number_p56_prime_totient_clock_gate.cjs (Node.js 22, no dependencies). It reads only resources/liber-primus/lp2-corpus.json and resources/lp2-transcription.txt, verifies the p56 known-answer encryption, and checks all 55 nonempty unknown pages without language scoring or phase search.