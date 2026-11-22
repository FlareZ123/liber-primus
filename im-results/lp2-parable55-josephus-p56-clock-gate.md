# p57 Josephus page order does not select the p56 prime–totient cipher

**14 November 2026, Agent 34. Classification: bounded original-input negative.** No unknown LP2 plaintext, key, or final destination is recovered.

## Question and source-constrained hypothesis

The solved p57 PARABLE has 20 printed words and 95 runes. Removing the first and last rune of every word gives 55 interior runes. Interpreting each interior rune by its Gematria Primus prime and taking its full totient gives a 55-step Josephus walk over the 56 physical pages p0–p55. With p0 as the initial cursor and clockwise counting, the walk leaves p50 as the sole survivor and produces a fixed elimination order. Reversing the 55 steps also leaves p50, but produces a different order.

The page-walk interpretation remains a hypothesis: no first-party instruction explicitly says Josephus, specifies p0 as the cursor, or names the direction. The pure page permutation was separately tested and did not recover plaintext ([page-transposition gate](lp2-parable55-josephus-page-transposition-gate.md)). This report tests whether the page order can select a symbol-changing operation: the already solved p56 prime–totient cipher.

The p56 known-answer mechanism is fixed, not fitted:

- the key stream is \(\phi(2),\phi(3),\phi(5),\ldots\), reduced modulo 29;
- a non-F plaintext rune is encrypted by adding the next key symbol modulo 29;
- plaintext F is copied unchanged and does not consume a key symbol.

The exact F-transparent rule and independent lexical positive control are documented in [the p56 Viterbi study](lp2-ftransparent-word-lexical-viterbi.md).

## Positive control

The reproducer re-encodes the established 85-rune p56 plaintext with the stated p56 rule and matches the original p56 ciphertext **85/85**. Its one literal plaintext F is at local rune 56; exactly 84 key symbols are consumed. This verifies the alphabet, direction, prime sequence, modulo convention, and transparent-F clock behavior used below.

All original page/segment mappings are asserted against the canonical LP2 rune corpus. The transcription omits the runeless p50 segment, so the page-to-segment mapping explicitly accounts for that omission.

## Candidate A: p56 stream starting at prime 2

Two natural consumers were tested without searching phases:

1. **Continuous clock:** concatenate the original page strings in the p57-derived elimination order and run the p56 key stream continuously from prime 2.
2. **Page-reset clock:** process pages in the same order, resetting each page's key to the prime-totient ordinal equal to that page's elimination rank. The first eliminated page therefore starts at prime 2.

### Forward direction

The forward Josephus elimination order begins:

~~~text
39 49 35 43 8 40 54 27 31 46 ...
~~~

Its first page is p39. The first ten original ciphertext runes on p39 are:

~~~text
SWTHNSIHBXEA
~~~

There is no ciphertext F in this prefix, so no transparent-F skip can alter the key clock. The first ten p56-derived key shifts are:

~~~text
1 2 4 6 10 12 16 18 22 28
~~~

At zero-based local rune 9, ciphertext EA has GP index 28. The key is also 28, so the proposed inverse gives:

\[
P=(28-28)\bmod29=0=F.
\]

That is impossible under the established p56 encoder: plaintext F must be copied to ciphertext F (index 0), not encrypted to ciphertext EA (index 28). The state set is empty at this rune. This rejects both the continuous clock and the page-reset-at-elimination-rank schedule for the forward route.

### Reverse direction

Reversing the 55 totient steps still leaves p50, but its elimination order begins:

~~~text
15 25 37 54 28 ...
~~~

The first page is now p15. Its first eleven original ciphertext runes are:

~~~text
FULMAEAYOEALU
~~~

The initial ciphertext F creates both possible branches: it may be a literal plaintext F that skips the key, or it may consume the first key symbol. The reproducer retains every valid branch. By zero-based rune 10, only the state that has consumed ten key symbols remains. The ciphertext there is U (GP index 1), and the next key is \(\phi(31)=30\equiv1\pmod{29}\), again forcing plaintext F from a non-F ciphertext:

\[
P=(1-1)\bmod29=0=F.
\]

No state survives. The reverse direction therefore fails under the same strict p56 rule, even after allowing the one initial ciphertext-F ambiguity.

## Candidate B: first 55 p50 table bytes as page-start prime ordinals

The p49–p51 numerical table is represented by 256 row-major bytes. A natural one-byte-per-page extension is to assign its first 55 bytes, in printed row-major order, to the 55 pages in the p57-derived elimination order. Interpret each byte as a zero-based prime ordinal that selects the starting point of the p56 prime–totient stream for that page. This is distinct from the existing p49/p51 table-prime test, which consumes table bytes as the key stream itself; here each byte selects a per-page start phase.

The first table byte is **203**, so the first eliminated page in either direction starts at prime ordinal 203. The same necessary-condition test rejects both directions:

| Direction | First page | First-page start ordinal | First impossible rune | Cipher rune/index | Key prime | Totient mod 29 | Forced plaintext |
|---|---:|---:|---:|---|---:|---:|---|
| Forward | p39 | 203 | 16 | N / 9 | 1373 (ordinal 219) | 9 | F / 0 |
| Reversed steps | p15 | 203 | 8 | A / 24 | 1301 (ordinal 211) | 24 | F / 0 |

For forward p39, the failing prefix is:

~~~text
SWTHNSIHBXEANGBULOEUN
~~~

It contains no ciphertext F, so there is no alternate skip path. For reversed steps, the failing prefix is:

~~~text
FULMAEAYOEA
~~~

Its initial ciphertext F is branched both ways; all valid branches are gone by rune 8. In both cases, a non-F ciphertext would have to encrypt from plaintext F, contradicting the p56 forward rule. Therefore neither a continuous stream starting at the first table byte nor page-reset streams starting at the corresponding table byte per elimination rank can work.

This is one frozen interpretation of the table, not a general exclusion of its 256 values. The choice to use the first 55 row-major bytes as page-start ordinals is source-motivated by the 55-page route and the 256-byte table, but is not itself stated in an authenticated Cicada instruction.

## Decision and scope

The p57-derived Josephus order is a reproducible permutation and still selects p50 under both step directions. But it does **not** select a direct transfer of the solved p56 prime–totient cipher under either tested key-start convention:

- prime 2 at the beginning of the page route, with either a continuous clock or per-page reset at elimination rank;
- the first 55 row-major p50 table bytes as per-page zero-based prime-start ordinals.

Both source-visible directions fail on their first page under an exact forward-cipher constraint. Do not continue this branch with arbitrary key phases, tuned F skips, table permutations, or more page-order variants.

The unresolved possibility is that p50 is a navigation target for a *different* original-source-selected operation or key. The present negative does not rule that out. The separate [p49/p51 table-prime stream gate](p49-p51-table-prime-index-key-gate.md) tests another table consumption and is not the same as the per-page start schedule above.

**Reproduction:** node sims/lp2_parable55_josephus_p56_clock_gate_sft.cjs (Node.js 22, no dependencies). It reads resources/liber-primus/lp2-corpus.json, resources/lp2-transcription.txt, and resources/liber-primus/base60-grid.json; verifies the p56 known-answer encryption; derives both p57 page orders; and explores all valid transparent-F branches on each first page before asserting the exact contradictions.