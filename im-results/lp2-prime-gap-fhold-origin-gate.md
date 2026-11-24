# LP2 prime-gap / plaintext-F hold origin gate

**Decision:** the declared prime-gap/F-hold origin law is rejected on the original p0–39 prefix. Both blinded native controls recover their hidden origins uniquely, including ciphertext-F events created by non-F plaintext, but none of the 3,301 allowed origins has a legal path through the original fit prefix. No language-model fit was run on the original, and the p40–53 continuation was not used.

## Frozen model and source scope

The sole key law is

\[
K_j = (p_{j+1}-p_j) \bmod 29,
\]

where the prime sequence is one-based and the hidden origin is s in {1,...,3301}. The first consumed plaintext symbol uses the gap beginning at prime ordinal s. Encryption is C=P+K_j mod29 for P≠F; plaintext F is emitted unchanged and does not advance the single cursor. The cursor is continuous across the p0–39 fit and p40–53 continuation. No multiplier, intercept, reset, reversal, alternate gap sequence, or origin-domain tuning is permitted.

The upstream motivation is a simple first-difference operation on the prime sequence already present in Cicada material: p56 uses successive primes minus one, while the p15 graphic combines prime and Fibonacci ordinals. Prime gaps are a plausible mathematical operation a human might try, but no source explicitly instructs the solver to difference adjacent primes. This remains a falsifiable hypothesis, not a source-established mechanism.

The canonical original transcription is checked byte-for-byte against the pinned corpus. The complete p0–55 tape has 12,956 runes, 2,896 printed words, and 83 singleton words. The training fit is p0–39: 9,640 runes and 68 singleton positions. The untouched continuation is p40–53: 3,008 runes and 13 singleton positions. The later p54–55 segment contributes 308 runes and two singleton positions and is not used. At a singleton word, the only allowed plaintext runes are A, I, or O.

## Prior exact-scope audit

No earlier LP2 test was found for this exact combination of adjacent-prime differences, one hidden origin, and authentic latent plaintext-F no-advance semantics.

- The prior prime-gap/half-gap additive-pad checks on the 2013 telnet-derived p53/p54Ac material did not use a latent plaintext-F clock: [2013 prime-gap difference report](2013-telnet-prime-gap-differences.md).
- The p0–39 affine-prime F-hold gate used a_n = a(p_n−1)+b, not p_(n+1)−p_n: [affine-prime/F-hold report](lp2-affine-prime-fhold-singleton-original-gate.md).
- The Stage-11 signed/A194954 F-transparent stream is a different source-derived sequence: [Stage-11 SFT](../sims/lp2_stage11_signed_prime_gap_phi_ftransparent_sft.cjs).
- The p32 prime-gap compass route and the terminal-title prime-ordinal bridge are geometric/ordinal interpretations, not this GP29 key stream: [compass SFT](../sims/lp2_2013_prime_gap_compass_route_sft.cjs), [terminal-title bridge](lp2-terminal-title-primegap23-original-bridge.md).

## Positive controls

The SFT uses the solved native Cicada GP29 section 0_koan_1 (780 runes, 208 words, 13 singleton words). Each plant encrypts it under a hidden prime-gap origin, fits on the first 680 runes with 12 singleton constraints, then predicts the final 100 runes. The language model excludes the donor section. The exact origin search sees only ciphertext, the alphabet, and the singleton constraints.

| Hidden origin | Recovered origins | Plaintext-F holds | Non-F plaintext encrypted to ciphertext F | Held-out exact | Forward replay |
| ---: | --- | ---: | ---: | ---: | --- |
| 73 | [73] | 13 | 14 | **100/100** | exact |
| 167 | [167] | 13 | 9 | **94/100** | exact |

Both hidden origins are recovered uniquely. Both plants include ambiguous ciphertext-F events: a ciphertext F can mean transparent plaintext F or an encrypted non-F rune. The exact gate retains multiple boundary hold counts; the language-model prediction sums over all of them rather than selecting a favorable hold count. In both plants the true prefix hold count is 9 and ranks second in the boundary distribution; the MAP boundary count is also 9. The second plant's six holdout symbol errors are language-decoding errors, not origin-recovery errors. The first plant demonstrates exact 100-rune continuation prediction under the declared state uncertainty.

## Original p0–39 exact gate

All 3,301 origins are propagated together through the original 9,640-rune prefix under the same latent-F transition and the 68 exact singleton constraints.

| Singleton offset | Live origins | Boundary states |
| ---: | ---: | ---: |
| 176 | 18 | 20 |
| 244 | 6 | 6 |
| 350 | 6 | 10 |
| 530 | 0 | 0 |

The six remaining origins after offset 350 all lose their final legal state at **offset 386**, a non-singleton ciphertext rune ᛇ (GP29 index 12). The gate therefore returns **0/3,301** origins and zero boundary states. It performs 308,509 reachability operations in 27 ms. The later singleton anchors are not reached by any candidate.

Because no eligible origin survives the exact prefix gate, the script deliberately does not build or run an original-language model. The p40–53 text and its 13 singleton positions remain blind; no holdout-based origin selection, reset, or rescue was attempted.

## Reproduction and decision

- [Source-native SFT](../sims/lp2_prime_gap_fhold_origin_sft.cjs)
- [Node 22 workflow run](https://github.com/FlareZ123/liber-primus/actions/runs/45363748797)
- The run uses the canonical corpus, canonical transcription, and solved native GP29 control file; all input counts are asserted in the script.

Retire the fixed K_j=(p_(j+1)-p_j) mod29, origin 1–3301, continuous plaintext-F-hold model on the tested p0–39 source scope. The positive controls show that the origin-recovery machinery handles ambiguous ciphertext F and prefix-state uncertainty, while the original exact gate has no surviving origin. This does not exclude other prime-derived sequences, source-selected page-local operations, or different alphabets/registers; each would be a new hypothesis requiring its own clue and blind controls. No original LP2 plaintext, key, or intended continuation was recovered.
