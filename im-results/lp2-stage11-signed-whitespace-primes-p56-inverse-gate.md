# 2014 signed Stage11 whitespace primes: one source-selected GP29 key-consumer gate

**16 November 2026, Agent35. Status:** 16 frozen original-input inverse checks fail; neither unknown plaintext nor a key was recovered. This is a limited test of two *candidate* readings, not an exclusion of all original whitespace uses.

## Actual source selector and competing interpretations

The [archived original Stage11 signed message](../resources/historical/cicada2014-stage11-message.asc) contains, in order, whitespace run lengths **2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37**. The spaces occur as trailing characters, wholly blank lines and leading spaces on the onion line. The omitted **19** is visually noticeable against the ordinary prime list. [The original 2014 onion-stage witness](https://github.com/krisyotam/cicada3301/blob/main/liber-primus/original-onion7/message.txt.asc) preserves these exact bytes. An existing external historical solver note had already observed this sequence, associating it with [OEIS A194954](https://oeis.org/A194954); its identification is not claimed as new.

**Authentication limit and prior work:** The actual historical OpenPGP cleartext signature canonically discards trailing whitespace, so it **does not authenticate most of these whitespace values**. Only their survival in the archived bytes is established. The earlier [11-prime original-byte screen](lp2-stage11-message-whitespace-prime-gate.md) had already rejected ordinary-prime streams with 19 omitted under all 5,000 initial clocks. Agent14's [11 November historical-A194954 handoff](../communications/agent12/20261111T121200Z_agent14_A194954-prime-whitespace-gate.md) had already tested both repeated eleven-prime and A194954 keys as *straight direct Vigenère* on the 12,956-rune book. This test extends only that preexisting finite evidence to the **fully branching historical plaintext-F-skip cipher**, both signs, with separately reset complete-source windows. It does not independently authenticate the key mechanism or reopen its earlier negative.

Two short, fixed interpretations were tested without fitting unknown text:

1. **Literal eleven-prime cyclic key:** loop the eleven signed values, consumed once per non-F plaintext rune.
2. **A194954 continuation:** continue the observed eleven as the lexicographically next primes such that the gap from the previous term is divisible by the binary 1-bit count of the preceding term's one-based index. The generated prefix is `2,3,5,7,11,13,17,23,29,31,37,43,47,53,59,67`. This recurrence is external mathematical knowledge and was **not** specified by the signed message.

For each model take `K_i = φ(prime_i) = prime_i − 1 (mod 29)`, motivated by the *authenticated* later LP2 p56 method, and test both cipher signs. Preserve the historical plaintext-F bypass exactly: `P=F(0)` emits `C=F(0)` without consuming key; non-F `P` must emit `C=(P±K_i) mod 29` and advance the key cursor. A ciphertext F can either be a literal F or an encrypted non-F. Exhaustive inverse dynamic programming retains **every** possible F history, with no language assumptions or hand-picked skips.

These are genuinely testable, albeit unlicensed, uses of original source data. The historical signed message does not instruct solvers to apply φ, repeat eleven keys, or use an OEIS extension. A failure only eliminates the four exact clock/sign configurations at the specified source-selected chapter starts.

## Original manuscript test and result

The [canonical 58-page original-data corpus](../resources/liber-primus/lp2-corpus.json) provides unchanged GP29 values, including the empty table page p50. At p0 the **source-verified red title has 13 runes**; the body starts at offset13. Every test starts its own key at position zero. Values below are the first zero-based original ciphertext position at which *every* F-consistent inverse path is impossible.

| Original interval | Length | Eleven-prime cycle (+ / −) | A194954 extension (+ / −) |
| --- | ---: | ---: | ---: |
| p0–2 complete (red title included) | 729 | 29 / 57 | 52 / 27 |
| p0–2 after initial red13 | 716 | **20 / 27** | **22 / 146** |
| Independent p3–7 | 1,145 | **138 / 17** | **83 / 112** |
| Independent p40–53 | 3,008 | **17 / 38** | **88 / 21** |

Even *without* the F bypass, the decoded black 716-rune run has GP29 IoC **0.034449** under the literal cycle and **0.035067** under A194954, sign positive, versus expected English GP prose substantially higher (the native clear p57 and solved LP1 are positive examples). The core failure is stronger than low language score: no complete plaintext exists under the declared authentic F-aware model.

**Calibrations:** The exact original **85-rune p56 ciphertext** encrypts from the published 85-rune plaintext under the standard prime/totient key, with its one literal-F bypass and **84 consumed primes** (85/85 source values match). Both alternative key generators and both signs pass a genuine **716-rune source-native GP plaintext encryption plus exhaustive F-aware original-length inverse**. All sixteen original failure positions and all source counts are locked by assertions in the [standalone read-only Windows Node22 SFT](../sims/lp2_stage11_signed_prime_gap_phi_ftransparent_sft.cjs). It **passed** [manual Windows CI 43916237813](https://github.com/FlareZ123/liber-primus/actions/runs/43916237813), with full source-window and exact F-path output.

## Research decision

The signed whitespace sequence is historically real; its intended role remains unknown. A straight cyclic or OEIS-continued φ-prime GP29 running key using the solved p56 transparent-F rule is **impossible** on the complete original p0–2 and independent marked chapters at these fixed starts. Further prime-stream seed, phase, sign, reset or KDF tuning requires a new first-party selector. Only a clue-supplied operation, independent unknown-page plaintext, or recoverable missing key bytes justifies revisiting the historical whitespace lead. No authoritative established decryption claim follows.
