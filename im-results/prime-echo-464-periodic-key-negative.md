# 2013 `prime_echo`: direct key and forest-edge prime-position tests (bounded negatives)

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

## Forest-edge / prime-position test

A second, source-motivated use of the 2013 prime inventory was tested without tuning parameters. The 2013 TCP source's “You can't see the forest when you're looking at the trees” clue is recorded in `resources/external/2013-tcp-server-signed-source.md`; the prime_echo endpoint 3301 is recorded in `resources/external/1033-3301-historical-operator-chain.json`. Together they motivate (but do not prove) examining the botanical-border block LP2 pp40–55. Excluding table-only p50 leaves 15 text pages (pp40–49, 51–55), containing **3316** runes. Treating each page's final rune as a provisional “root” and deleting one terminal rune per page leaves **3301** runes. The 2013 prime sequence through 3301 contains **464** primes; one-based sampling at those prime positions therefore yields 464 runes.

The 15 terminal roots are GP29 values `[27,11,25,16,15,21,25,25,0,23,0,8,9,26,10]`, transliterated `IAJAETSNGAEAEFDFHNYI`. The prime-position sample has IoC **0.0341196842** and no GP-English plaintext. Its first 120 transliterated symbols are:

```text
NMGAEXHENGTECNEUGXYUJAESDXPSNGNTJBYDLXNHAEHDEOMAEOEIAOGXTIAASDRFMPPIHEOYOCAOEFFAOCTWEEEABWUIAEUREOYCEAFGSJWTHOEDJAEUAEWLICACNHNETHRYTHAEEOBHG
```

A first-edge deletion control (remove the first rune of each of the same 15 pages) also leaves 3301 runes and produces a 464-symbol prime-position sample with IoC **0.0342034706**. Thus the length match alone does not uniquely select terminal roots.

The terminal-root sequence was also tested as a repeating GP29 key over the 3301-rune body, with phase zero at the first body rune. The prime-position sample preserves the original body phase `(p−1) mod 15`, rather than resetting the key at the sampled stream's start:

| Direction | Body IoC | Inherited-phase prime-sample IoC |
|---|---:|---:|
| C−K | 0.0343653438 | 0.0333842258 |
| C+K | 0.0343893953 | 0.0344734490 |
| K−C | 0.0343653438 | 0.0333842258 |

All remain near-uniform; none recovers English. The first-edge control and terminal-root key results are reproduced by `sims/prime_echo_forest_edge_index_gate.cjs`, pinned to the canonical corpus Git blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`.

## Decision

The direct repeating period-464 prime/totient additive stream is **rejected** as an English-like GP29 decoder for the original 12,956 unknown runes. The forest-edge / prime-position composition is also a **bounded negative**: the 464-symbol prime sample and all three inherited-phase terminal-root key variants remain near-uniform and nonlinguistic. The first-edge deletion control also produces the 3301 length, so that length match is not independent evidence for terminal-root selection.

These tests close two direct serializations only. They do not invalidate the 2013 prime-list source observations or exclude a different stateful, nonlinear, table-indexed, or key-derivation role. Do not expand these branches with arbitrary phases, resets, reversals, permutations, or KDF menus. A successor requires an independent Cicada clue that selects a different reversible operation or key/state and predicts previously unexplained original ciphertext.

## Reproduction

Run from the repository root with Node.js 22:

```sh
node sims/prime_echo_464_periodic_key_sft.cjs
node sims/prime_echo_forest_edge_index_gate.cjs
```

The first script reads the canonical original GP29 corpus, regenerates the 464 primes, asserts the source marker ordinals and 12,956-rune input, tests the four frozen models, verifies exact original re-encryption, checks a source-native positive plant, and asserts the prime/totient alphabet-shift equivalence. The second script reproduces the 15-page forest-edge selection, 3301-rune body, 464 prime-position sample, first-edge control, and inherited-phase terminal-root key tests. Both require only Node.js 22 and no external dependencies.
