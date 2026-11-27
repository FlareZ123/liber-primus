# 2014 whitespace channel reconstructs the p56 clue chain; A194954 itself is not an LP2 running key

**Agent1, 27 November 2026. Historical clue recovery + bounded original-cipher exclusion.**

## New source constraint recovered from the period handoff

The earliest public solver snapshot that acquired the seventh 2014 onion is commit `6c3421a4d245596e403c88e037509d162a2afd17` (11 May 2014 18:33:43Z) in `micheloosterhof/cicada-2014`. It adds exactly the 58 release JPEGs, `index.html`, and `stage11/message.txt.asc`; the later `56.bin` and decoding files are solver products, not additional server siblings.

Two days later the solver repository commit `5431b03eacf15d27c5f02eae860efcfdb7f1917b` is literally titled **"preserve spaces"** and restores the whitespace carrier in that signed message. Reading the nontrivial runs in order, including the five-space indentation before the onion hostname, gives:

`2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37`.

That is exactly the first eleven terms of **OEIS A194954**, a prime sequence defined before Cicada 2014. More importantly for the actual solve path, it is conspicuously the ordinary prime sequence with **19 missing** at the first divergence.

Archived 13 May 2014 solver discussion independently records the intended human observation: the missing 19 prompted the prime shift. The already-solved Wisdom page supplies the other half of the instruction: **THE PRIMES ARE SACRED / THE TOTIENT FUNCTION IS SACRED**.

The historical p56 decoder then makes the clue chain explicit:

`P_i = C_i - (prime_i - 1) mod 29 = C_i - phi(prime_i) mod 29`

with one literal interrupter at rune index 56 that does not consume a prime. This reproduces **AN END / WITHIN THE DEEP WEB ...**.

This is a useful creator-design fact: a deliberately malformed familiar sequence can carry the missing operand, and outer handoff whitespace is cryptographic material. The local repository previously had the historical p56 decoder but did not index A194954 or the preserved-space handoff as a source-selected clue.

## Decisive follow-up: is A194954 itself the hidden LP2 prime family?

Because the whitespace exactly selects A194954, the cheapest non-arbitrary test is whether its own terms, rather than ordinary primes, form a running phi stream elsewhere in LP2.

Frozen family:

- sequence: exact A194954 recurrence, no fitted terms;
- key: `phi(p)=p-1 mod 29`, source-selected by Wisdom;
- directions: subtract (historical) and add control;
- state conventions: continuous chapter, page reset, and whole-book global;
- interrupter convention: all-rune consumption or literal ciphertext-F hold;
- chapter boundaries: the canonical nine LP2 section groups;
- score: solved-LP GP29 trigram model; no key/phase/plaintext fitting.

Positive control on the 85 p56 ciphertext runes:

| stream | mean solved-LP trigram log score | result |
|---|---:|---|
| ordinary primes, historical phi | **-1.7931** | exact readable p56 plaintext |
| A194954, same phi/skip | **-5.5838** | noise |

Across the unsolved p0-55 corpus, every frozen A194954 convention remains in the noise regime. The best section is p54-55 under add/F-hold at **-5.4344**, with visibly nonlinguistic output. No section approaches the positive-control regime.

## Decision

**Reject A194954 as a direct phi running-key family for LP2 under the authentic simple state conventions.** Do not expand this into offsets, affine wrappers, or arbitrary sequence transforms: that would abandon the clue-selected operation.

Preserve the actual historical lesson instead: Cicada deliberately used a missing term in a prime-looking whitespace sequence to select the p56 ordinary-prime/totient operation. Future "missing term" work should require an independently visible almost-sequence in an original artifact before applying a repair/key rule.

Reproducer: `sims/lp2_2014_whitespace_A194954_phi_sft.cjs`.
