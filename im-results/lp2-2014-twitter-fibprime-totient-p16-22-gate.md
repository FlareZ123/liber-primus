# 2014 Fibonacci-prime tweet through the p56 totient rule: p16–22 gate

**Agent 42, 18 November 2026. Classification: bounded cross-round negative; no unknown plaintext recovered.**

## Human solve-path hypothesis

The community-archived 2014 account post lists twelve Fibonacci primes:
2, 3, 5, 13, 89, 233, 1597, 28657, 514229, 433494437, 2971215073, and 99194853094755497. The account's attribution to Cicada is not cryptographically authenticated; the existing source audit explicitly classifies it as a low-confidence cross-round lead.

The list is nevertheless related to the original p15 Fibonacci/prime construction. A simple, historically motivated composition is to apply the exact prime operation established by solved p56 to the twelve listed primes: use \(\phi(q)=q-1\pmod{29}\), repeat the resulting twelve-value key, and preserve p56's plaintext-F non-consuming rule. The immediate continuation after p15 is physical pp16–22, so it is the first bounded target.

**Weakest premise:** no first-party source says that the 2014 tweet is a key, that its values should be totiented, or that the twelve-value sequence should repeat. The account attribution itself is low confidence. This is a cheap test of a plausible cross-round composition, not an assertion of author intent.

## Frozen test

- Key source: the twelve Fibonacci-prime values in the archived 2014 post.
- Operation: \(K_i=(q_i-1)\bmod29\), using the p56 prime-totient operation.
- Resulting period-12 key: **[1, 2, 4, 12, 1, 0, 1, 4, 0, 0, 4, 0]**.
- Clock: continuous across physical pp16–22, beginning at the first rune of p16. No page reset, phase shift, reversal, offset, or key tuning.
- Inverse: \(P=(C-K)\bmod29\) for ordinary symbols. Plaintext F emits ciphertext F without consuming the key. Ciphertext F may therefore be either a transparent F (no advance) or an ordinary encrypted non-F symbol (advance).

The direct additive uses of the tweet's literal values, Fibonacci indices, visible 9901 reduction, and p15-derived dual are already covered by the separate [2014 Twitter Fibonacci-prime direct-key gate](2014-secondary-twitter-fibonacci-prime-key-gate.md). This test is distinct: it applies the p56 totient transform and the exact F-bypass semantics.

## Original result

The target is the original **1,744-rune** p16–p22 continuation. The exact inverse has **no legal path by rune offset 28 of p16** (zero-based).

At that position:

- Ciphertext is **U**, GP29 index 1.
- The only reachable key phase is 4.
- Phase 4 corresponds to the listed Fibonacci prime **89**, giving \(\phi(89)=88\equiv1\pmod{29}\).
- Ordinary inverse subtraction requires plaintext index \(1-1=0\), namely **F**.
- This is impossible: a plaintext F must bypass the key and therefore emit ciphertext F, whereas the original ciphertext is U.

This is a local mathematical contradiction. Later symbols, language scoring, or alternate F interpretations cannot repair it.

## Positive control

The same encoder and exact inverse were tested on a **1,805-rune synthetic plant** made by repeating the solved p57 plaintext nineteen times and encrypting it under this period-12 key with the p56 F-bypass rule. The inverse retained a legal path (**1/1**). The early original failure is therefore not caused by a decoder that mishandles the transparent-F rule.

Reproduce from the repository root with:

    node sims/lp2_2014_twitter_fibprime_totient_p16_22_sft.cjs

The script verifies the key, original page selection and length, first impossible transition, and the synthetic p57 positive control.

## Decision

Reject this exact **period-12 Fibonacci-prime-totient / p56-F-bypass** receiver on pp16–22. It recovers no plaintext or authentic key. This does not rule out other uses of the archived tweet, another interpretation of the p15 relationship, or other cipher mechanisms. Do not rescue this model with new offsets, page resets, alternate phases, or extra skips without an independent source clue.
