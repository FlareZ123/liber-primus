# Authenticated p56 prime-totient cipher: exhaustive direct-iteration inverse gate

**Decision (22 November 2026, Agent 7):** Iterating Euler's totient function on the solved page's consecutive-prime key is a naturally motivated, fully specified GP29 operation. Applied directly with the author's demonstrated transparent-F rule, it **does not decipher the original unsolved manuscript**. This is an exact inverse-possibility exclusion for a bounded cipher, independent of guessed plaintext or a fitted key. It is not a recovered unknown message.

## Exact source clue and receiver

Solved LP2 physical p56, *AN END*, uses successive prime numbers `2,3,5,7,...`, whose totients supply a GP29 modular additive key. The genuine solved LP1 admonition states that **the primes** and **the totient function** are sacred. On solved p56, plaintext F (GP29 index zero) is passed literally as ciphertext F **without consuming a key symbol**; other plaintext symbols always consume their next key, and may themselves encrypt to ciphertext F. This specific conditional operation is essential. The source is the unchanged `resources/liber-primus/lp2-corpus.json` and the solved p56 GP transliteration.

The source-derived candidate for the next conceptual pass is to apply the same operation with `K_j = φ(φ(p_j)) mod 29`, where `p_j` is the `j`th consecutive prime. A third iterate `φ(φ(φ(p_j)))` is a bounded adjacent alternative. Every printed unknown rune-bearing page begins with `p_0 = 2`; this clock reset is a declared hypothesis, **not** an inferred author instruction.

Exact p56 known-plaintext positive: the canonical GP29 spelling of the source text uses **85 original runes** and encodes back into the **85/85 unchanged p56 ciphertext runes**, with exactly **one literal plaintext F at rune offset 56 (zero-based)** and **84 consumed consecutive-prime totients**. Its ciphertext has **five F runes**, at offsets **35, 47, 51, 56, 74**: treating all five as transparent would be erroneous.

## Exhaustive inverse, allowing every ambiguous F

At unknown ciphertext rune `c`, hold a state `j` (prime keys already consumed). For **any** current key `K_j`, the only possible inverse choices are:

- If `c = F = 0`: literal plaintext F, **keeping j unchanged**.
- If `P = (c-K_j) mod 29` is nonzero: plaintext P and **advance j**.

A non-F ciphertext cannot be literal F. A zero plaintext from the encrypted branch is prohibited. Dynamic programming enumerates **every** legal transparent-F mask as distinct paths; if the state set empties, every possible direct decryption for that original ciphertext has already failed. No language model or prose-frequency threshold enters this test.

The original p0–p55 corpus has 12,956 GP29 rune symbols on **55 rune-bearing physical pages** (p50 is the numerical panel and has no runes). The exact model results with the page-start `p_0=2` clock are:

| Key expression | Original pages with any fully legal inverse | Pages with no legal inverse | p0 first impossible symbol |
| --- | --- | ---: | --- |
| `φ(p_j)`, one iteration | p1, p49 | **53 of 55** | zero-based p0[235] |
| `φ(φ(p_j))`, two iterations | p43, p51, p53, p55 | **51 of 55** | zero-based p0[239] |
| `φ(φ(φ(p_j)))`, three iterations | p0, p55 | **53 of 55** | p0 is mathematically possible, though no readable text |

For the actual original φ² survivors, the complete inverse returns **one** F-choice for p43, **four** for p51, **four** for p53, and **three** for p55. All complete witnesses forward-encrypt exactly to the unchanged original source. The sole p43 witness begins GP tokens `W I H T EO D IA R OE Y Y E`, not continuous English.

This **direct** family does not solve p0–p55: the opening page itself cannot decode under the proposed φ² operation even with arbitrary F selections. The third iterate is likewise inconsistent on most original pages. This test does not eliminate another initial prime, a distinct page/chapter reset, iterative totients used as an operand inside a different reversible transducer, secret key material, altered word boundaries, or a separate layer between the source and English. None of those extensions is established by these data.

## Separate blind-prime-start stress test of the authentic *single* totient

A direct cipher might start from a **noninitial prime ordinal** instead of p=2. To give that alternative a strong chance without fitting plaintext, an additional test holds the solved p56 transform itself fixed, permits **all 50,000 initial prime ordinals 0–49,999**, and carries its key continuously through original ciphertext p0, p1, p2, p3 (**946 runes**). It allows **every** legal F-bypass pattern at each candidate starting ordinal. Source word and page boundaries remain unchanged; neither hidden substitutions nor a new state machine are assumed.

| Exact prefix required from prime start | Number of all 50,000 phases completing it |
| --- | ---: |
| p0, 262 runes | 2,738 |
| p0–p1, 528 runes | 210 |
| p0–p2, 729 runes | **1** |
| p0–p3, 946 runes | **0** |

The single three-page candidate is initial prime ordinal **11,840** (not a source-selected key). It fails at book-global offset **865** in p3; this is the longest legal prefix in the entire frozen 50,000-ordinal scan. Its example decrypted symbols start `A P S P TH H EO F D EA G C I Y Y Y`, with no authentic plaintext. Thus **none of those 50,000 public-prime starts reproduces the original complete four-page opening**, despite full F-branch freedom. This result is bounded by the tested ordinal range and the unchanged p56 transform. It does not exclude an arbitrarily distant prime ordinal, a chapter restart, another key source or a different cipher.

The 2,738 → 210 → 1 → 0 progression also illustrates why preserving *some* legal F path through one page would be insufficient evidence of a solution. An independently authored starting-prime selector and a complete intelligible original plaintext would still be needed.

## Reproduction and implication

[Windows Node.js single-file original-input test](../sims/lp2_prime_iterated_totient_ftransparent_original_sft.cjs) reads the checked-in corpus, asserts the source counts, exactly reencrypts solved p56, tests all original pages with the finite-state mask enumerator, records the first impossible position, asserts survivor counts, and reencrypts every surviving witness. Only Node.js built-ins are required.

**Research action:** do not infer that repeating the solved prime/totient operation another time automatically reveals the unknown pages. If a later first-party clue selects a different clock or gives a key register, apply this exhaustive inverse without using ciphertext-F as an unconditional skip. The missing author-selected operation is the reason to seek new puzzle instructions rather than additional unconstrained φ variants.
