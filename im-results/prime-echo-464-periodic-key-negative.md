# 2013 `prime_echo` as a repeating 464-symbol GP29 key: bounded negative

**Classification:** a finite, source-motivated original-cipher negative. No unknown plaintext, authentic key, complete cipher mechanism, or destination was recovered.

## Why this was worth testing

The recovered 2013 live-ISO `prime_echo` program emits the complete ordinary-prime sequence through **3301**, exactly **464 primes**. The pinned source is [`prime_echo`](https://github.com/neuroretransmit/cicada/blob/main/2013/002-3301/rootfs-contents/usr/local/bin/prime_echo), archived Git blob `65a569cf1b3eecb0f7c17ffc569a54ed8ecdf649`. The count is **464 = 16×29**, and the archived March 2013 TCP test vectors record the pair `BASE29 1033` and `DH 3301`; those values are the 174th and 464th primes respectively ([test-vector manifest](../resources/external/2013-tcp-live-test-vectors.json)). The original 2013 `0_wisdom` page explicitly calls primes and the totient function sacred ([transcription](../resources/external/2013-0-wisdom.txt)). The solved p56 prime/totient method supplies a further historical precedent for examining φ(p).

These clues motivate—but do **not** prescribe—a simple direct key: use the prime stream itself, or its totient stream, reduced into the 29-symbol GP alphabet. Since the source list ends after 464 values, the most economical full-book interpretation is to repeat it. Repetition is an explicit hypothesis, not a source-established instruction.

This test is distinct from the existing [16×29 prime-table inverse](prime464-fibonacci-page-table-original-inverse.md), which indexes a 16×29 table by prior ciphertext/plaintext rune state. The present test uses the prime list as a **linear position-clocked stream**. It is also distinct from the participant-recorded first-onion telnet omission of primes 73–1223; `prime_echo` is the separate live-ISO program that emits all 464 primes.

## Frozen operation

Generate the first 464 primes (p_1,ldots,p_{464}), in increasing order, and assert (p_{174}=1033), (p_{464}=3301). Flatten the original physical pages 0–55 in their canonical order, preserving every rune and omitting the rune-free p50 table. The input is exactly **12,956** GP29 symbols.

For (i=0,ldots,12955), use one continuous clock and the repeating key:

[
K_i=p_{(i\bmod464)+1}\bmod29
]

or

[
K_i=\varphi(p_{(i\bmod464)+1})\bmod29
=(p_{(i\bmod464)+1}-1)\bmod29.
]

Test only the two natural additive orientations:

[
P_i=(C_i-K_i)\bmod29
\qquad\text{and}\qquad
P_i=(C_i+K_i)\bmod29.
]

The start is phase zero at the first rune of p0. No page reset, offset search, key reversal, column/row permutation, alternative modulus, or fitted parameter is used.

## Original-cipher result

<badge color="danger">Bounded negative</badge>

| Fixed key | Direction | Original GP29 IoC |
|---|---:|---:|
| Unmodified ciphertext | — | **0.0344783979** |
| Prime residues (p_i\bmod29) | Subtraction | **0.0344780881** |
| Prime residues (p_i\bmod29) | Addition | **0.0344834263** |
| Totient residues ((p_i-1)\bmod29) | Subtraction | **0.0344780881** |
| Totient residues ((p_i-1)\bmod29) | Addition | **0.0344834263** |

All four outputs remain at the original near-uniform ciphertext IoC and show no GP-English recovery. Representative initial rune transliterations:

- Prime subtraction: `PCPAEAGIINGYTPOEBOEJAYTHNBBGWHOEUROEAEUAFWCMDNGNNEOTHIDDPRLWIALMCIAIAJIBPDPYIANGOETHUEOOEAETOHUGJESHI`
- Prime addition: `BJDIBOSMNYLFBTFUYOLGEUIAJEANGRSHMDAEPAPTHEEAAWOETSOJCLTHYNGOERDWMSYHTCEAOOCIIAAEMLIAYAEBOEIDPYIAT`

The prime/totient cases are not four independent keys: because φ(p)=p−1, the totient-subtraction output is exactly the prime-subtraction output shifted by +1 throughout the GP29 alphabet; the totient-addition output is the prime-addition output shifted by −1. They therefore reduce to two global alphabet relabelings.

The reproducer also checks exact forward re-encryption of each original output and exact recovery of a repeated-p57 source-native plant under every fixed model. These are implementation controls, not evidence for the historical key.

## Decision

The direct, repeating, period-464 prime/totient additive stream is **rejected** as an English-like GP29 decoder for the original 12,956 unknown runes. This closes one natural serialization of the 2013 prime inventory; it does not invalidate the prime-list source observations or exclude a different stateful, nonlinear, table-indexed, or key-derivation role.

Do not expand this branch with arbitrary phases, resets, reversals, or KDF menus. A successor requires an independent Cicada clue that selects a different reversible operation or key/state and predicts previously unexplained original ciphertext.

## Reproduction

Run from the repository root with Node.js 22:

```sh
node sims/prime_echo_464_periodic_key_sft.cjs
```

The standalone script reads the canonical original GP29 corpus, regenerates the 464 primes, asserts the source marker ordinals and 12,956-rune input, tests the four frozen models, verifies exact original re-encryption, checks a source-native positive plant, and asserts the prime/totient alphabet-shift equivalence. No external dependencies or CI workflow are required.
