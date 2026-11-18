# Original doublet-triggered prime-totient resets: complete F-branch obstruction

**Status (Agent29, 18 November 2026): scoped original-cipher negative, no unknown plaintext recovered.**

## Intended-solver route

The original 12,956-rune unknown LP2 stream has only **86 adjacent-equal rune pairs**, distributed across the 55 rune-bearing physical pages. These unusually rare, source-visible pairs are potential state-change markers. The independently authenticated original p56 **AN END** provides a directly executable and reversible cipher: successive Euler totients of primes 2,3,5,… modulo 29, with literal plaintext GP-index-zero **F** emitted as an unchanged F and **not consuming a key step**. A human solver might infer that LP2 uses the familiar operation, restarting its prime clock at the exceptional repeat marks.

The proposed operator is much more constrained than fitting 86 secret keys: the marker positions are fixed by the unchanged printed ciphertext and every reset starts with the actual known p56 first prime. No key fitting, dictionary scoring, or source-unknown plaintext assumption is required to decide mathematical viability.

## Exact original-input inverse and eight frozen conventions

Read original p0–55 physical pages from `resources/liber-primus/lp2-corpus.json`; omit the runeless numerical p50. Detect each second rune in an identical adjacent pair, yielding 86 original events and 87 segments. The first six positions in the continuous p0–55 tape are `[122,207,456,653,782,909]`.

Consider four literal treatments of each equal-rune pair: retain both and reset **before the second**; retain both and reset **after the second**; **omit the second as a marker** and then reset; or **omit both as a marker** and then reset. Each convention is tested under the historically genuine additive phi-prime direction and its arithmetic reversal, with prime2 as the fixed start for every segment. These eight alternatives are a bounded set of natural marker positions, not an exhaustive theory of doublet use.

At ciphertext F, the inverse must allow *both* legal source modes: a literal plaintext F leaving the prime counter unchanged, or an encrypted non-F mapping to ciphertext F and consuming a prime step. At any non-F ciphertext, a candidate inverse giving plaintext F is forbidden. A dynamic program retains every reachable consumed-key count; if it has no states at a character, no choice of hidden F-skips can rescue the model.

| Treatment of adjacent-equal pair | GP29 additive +, impossible segments /87 | Reverse sign, impossible segments /87 |
| --- | ---: | ---: |
| Reset before second, retain both | 66 | 65 |
| Reset after second, retain both | 54 | 66 |
| Remove second, reset afterward | 53 | 66 |
| Remove pair, reset afterward | 51 | 66 |

The four treatments retain respectively **12,956**, **12,956**, **12,870**, and **12,784** real ciphertext runes; all original signals are held at their published positions. Every interpretation has dozens of complete inverse path extinctions, often inside the first few dozen runes of a segment. This is an **exact impossibility** for each specified full-book model. No language model, scorer calibration, hidden key choice, or guessed plaintext was used.

## Genuine solved positive and scope

The standalone SFT encodes the complete **85-rune original p56 AN END** plaintext from `resources/liber-primus/lp1-plaintext-reference.txt`, omitting the printed 128-hex digest, and verifies that the real F-transparent prime/totient forward cipher reconstructs **85/85 original p56 ciphertext runes**, including its one literal plaintext F. The complete p56 inverse also survives under the same dynamic program. The negative original results thus cannot be attributed to using ordinary modulo29 Vigenère in place of the historically true F-skip rule.

**Decision:** retire only a p56-style prime/totient cipher **restarting at prime2 on the observed LP2 repeat-pair markers**, for the four explicitly defined marker treatments and both arithmetic signs. The 86 doublets could play another structural role, and this experiment does not constrain secret prime starts, an alternative clock generator, nonlinear/feedback operations, transposition, or an independently provided key. Nor does it establish that the doublets were designed as resets. The accidental numerical equality of 85 inter-doublet gaps and 85 p56 cipher runes supplies no direct decoding: the literal 85 gap values modulo29 match only 3/85 p56 ciphertext symbols in natural order.

### Reproduce

From the repository root, execute the standalone Node22 CommonJS test `sims/lp2_doublet_prime_totient_reset_sft.cjs`. It reads only two committed text resources and the canonical original GP29 corpus, checks the authenticated solved positive and all eight exact original full-book exclusions, and prints source positions and dynamic-program counts.
