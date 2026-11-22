# Original ABAAB floral positions as a local GP29 self-key: finite negative

**Agent18, 14 November 2026. Intermediate result, no unknown LP2 plaintext, authentic key, historical decoder or destination.** This tests one new, compact *value-changing* consumer of the independently observed floral five-position address. It is deliberately distinct from the previously closed literal A/B pickups and all-secret two-substitution gate. Its source premise is incomplete: the historical participant selected `ABAAB`, but nobody has authenticated the proposed additive **preceding-A self-key** as a Cicada instruction.

## Human solve-path hypothesis and source constraints

The original p40–55 illustrations reuse an identical bilateral five-dot floral template on all sixteen physical pages. A surviving [16 February 2016 #cicadasolvers participant statement](lp2-2014-2016-original-irc-later-witness-gate.md) explicitly reads berry colors clockwise as `ABAAB` and names Beatty addresses `floor((5N−1)/3)`. The statement discussed XOR and addition to out-of-band material, without providing a GP29 decoding opcode. The prior [direct floral lane gate](lp2-abaab-floral-direct-lane-consumer-decision.md) ruled out literal A-only, B-only and full-rune reordering as source-native GP prose; those are frequency-preserving operations.

Here the **analyst-imposed**, no-secret-value-changing reading treats each B site (within a five-rune group, positions 1 and 4 zero-based) as a GP29 message rune and the immediately preceding A site (positions 0 and 3) as the local key. The candidate is `P[B]=C[B]−C[preceding A] (mod29)` or the historical inverse sign `+`. The two fixed clocks are (1) restart `ABAAB` on every physical page, and (2) an uninterrupted floral-section rune clock, including across original physical page breaks. Under the uninterrupted clock, a B at the first rune of a later page correctly takes its key from the preceding page. Rune-free p50 does not advance either clock. No phase fitting, alphabet permutation, per-word reset, new key, nonce, or word-segmentation change is permitted.

The p40–48 opening (2,408 original ciphertext runes) and the complete p40–55 decorative section (3,316 runes) are tested. Each B output is fully reversible when its A-key rune is retained; all original ciphertext is reconstructed exactly. As a positive, complete genuine Shakespeare GP29 text is planted in every B position and recovered exactly using the original A keys. This validates the operator, **without authenticating it historically**.

## Original ciphertext results

The table reports normalized GP29 IoC; `1/29 = 0.03448276` is the uniform reference. Literal GP E is index18. For comparison, the same existing source-native GP converter gives **at least 66 E in every contiguous Shakespeare window** of lengths 961–963 and at least **98 E in any Shakespeare window** of lengths 1,323–1,326; Gibran minimums are **76** and **110** respectively. The B tape must change rune values under the proposed operator, so these are proper comparisons of decoded candidates rather than merely ciphertext subgroup counts.

| Original source range | Clock | B runes | `C[B] − C[A]`: IoC / E | `C[B] + C[A]`: IoC / E |
| --- | --- | ---: | --- | --- |
| p40–48 | Physical-page reset | 961 | 0.035160857 / 43 | 0.034603711 / 34 |
| p40–48 | Continuous | 963 | 0.035127147 / 45 | 0.035219979 / 32 |
| p40–55 | Physical-page reset | 1,323 | 0.035231440 / 59 | 0.034727154 / 48 |
| p40–55 | Continuous | 1,326 | 0.035348758 / 59 | 0.035028885 / 41 |

All eight fixed B-channel decryptions remain near uniform, contain substantially fewer E runes than every same-length window of either existing literary control, and begin with nonlinguistic GP29 sequences. In the p40–55 page-reset subtraction result, for example, the first forty GP tokens are `N N TH E EO T S W M IA C C J P I P EA IA P B N TH R OE IA L E EA H W X N M OE S C L C E U`.

This is a strong **negative for that exact two-operation consumer under the source-native English register**. It does not exclude the historical binary pattern itself, a different independently selected byte-domain XOR consumer, later value-changing layers, other plaintext languages, a different clock fixed by future source evidence or a genuine one-time pad. The self-key operation was chosen on plausibility, not signed by Cicada; there is no basis for freely fitting new phases/pairings after this outcome.

## Reproduction and causal decision

[Single-file Windows Node22 CommonJS SFT](../sims/lp2_flower_abaab_precedingA_selfkey_sft.cjs) reads the pinned original corpus and preexisting Shakespeare/Gibran controls, asserts both source ranges and all B-site counts, calculates all eight original outputs, checks full ciphertext reencryption, and plants/recovers full B-channel GP-native controls. The mathematics was independently calculated on the canonical repo corpus through its GitHub connector, giving the exact counts and IoCs above. The exact original-corpus SFT also **passed Windows Node22 manual CI** in [run 43635772613](https://github.com/FlareZ123/liber-primus/actions/runs/43635772613), independently of the preceding GitHub-connector calculation.

**Decision:** The observed `ABAAB` mask alone has not identified a usable decoder, and adjacent preceding-A GP29 self-keying does not extract source-native prose. Additional variants would need a *new* author-origin addressing or value-changing instruction, rather than another self-selected lane mapping.
