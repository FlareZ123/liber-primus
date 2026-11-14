# p57 Josephus page order does not carry the p56 prime–totient cipher

**14 November 2026, Agent 34. Classification: bounded original-input negative.** No unknown LP2 plaintext, key, or final destination is recovered.

## Question and source-constrained hypothesis

The solved p57 PARABLE has 20 printed words and 95 runes. Removing the first and last rune of every word gives 55 interior runes. Interpreting each interior rune by its Gematria Primus prime and taking its full totient gives a 55-step Josephus walk over the 56 physical pages p0–p55. With p0 as the initial cursor and clockwise counting, the walk leaves p50 as the sole survivor and produces a fixed elimination order. Reversing the 55 steps also leaves p50, but produces a different order.

The existing page-walk interpretation is still a hypothesis: no first-party instruction explicitly says Josephus, specifies p0 as the cursor, or names the direction. The pure page permutation was separately tested and did not recover plaintext ([page-transposition gate](lp2-parable55-josephus-page-transposition-gate.md)). This experiment asks a different question: might the p57-derived page order select the already solved p56 prime–totient cipher as the symbol-changing operation?

The p56 known-answer mechanism is fixed, not fitted:

- the key stream is \(\phi(2),\phi(3),\phi(5),\ldots\), reduced modulo 29;
- a non-F plaintext rune is encrypted by adding the next key symbol modulo 29;
- plaintext F is copied unchanged and does not consume a key symbol.

The exact F-transparent rule and independent lexical positive control are documented in [the p56 Viterbi study](lp2-ftransparent-word-lexical-viterbi.md).

Two natural page-level consumers were considered without searching phases:

1. **Continuous clock:** concatenate the original page strings in the p57-derived elimination order and run the p56 key stream continuously from prime 2.
2. **Page-reset clock:** process pages in the same order, resetting each page's key to the prime-totient ordinal equal to that page's elimination rank. The first eliminated page therefore starts at prime 2.

The reverse step order is the source-visible opposite-direction control. In both directions, the first page has rank zero and must decode from the established prime-2 start.

## Positive control

The reproducer re-encodes the established 85-rune p56 plaintext with the stated p56 rule and matches the original p56 ciphertext **85/85**. Its one literal plaintext F is at local rune 56; exactly 84 key symbols are consumed. This verifies the alphabet, direction, prime sequence, modulo convention, and transparent-F clock behavior used in the test.

All original page/segment mappings are also asserted against the canonical LP2 rune corpus. The transcription omits the runeless p50 segment, so the page-to-segment mapping explicitly accounts for that omission.

## Exact forward-direction contradiction

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

That is impossible under the established p56 encoder: plaintext F must be copied to ciphertext F (index 0), not encrypted to ciphertext EA (index 28). The state set is empty at this rune. No language model, skip-mask search, or alternative reading of later pages can repair this first-page contradiction.

This single necessary condition rejects both the continuous clock and the page-reset-at-elimination-rank schedule for the forward route.

## Exact reverse-direction contradiction

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

## Decision and scope

The p57-derived Josephus order is a reproducible permutation and still selects p50 under both step directions. But it does **not** select a direct transfer of the solved p56 prime–totient cipher, either as one continuous stream or as a page-reset stream starting at each page's elimination rank. Both source-visible directions fail on their first page under an exact forward-cipher constraint.

Do not continue this branch with arbitrary key phases, tuned F skips, or more page-order permutations. The unresolved possibility is that p50 is a navigation target for a *different* original-source-selected operation or key. The present negative does not rule that out.

**Reproduction:** node sims/lp2_parable55_josephus_p56_clock_gate_sft.cjs (Node.js 22, no dependencies). It reads only resources/liber-primus/lp2-corpus.json and resources/lp2-transcription.txt, verifies the p56 known-answer encryption, derives both p57 page orders, explores all valid transparent-F branches on each first page, and asserts the exact contradictions above.