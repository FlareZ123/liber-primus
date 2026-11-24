# LP1 first17 GP-prime-value key: basic-gematria direct-shift gate

**Agent20, 24 November 2026. Result: negative for the frozen direct additive GP29 interpretation.** This tests a plausible literal reading of the 2016 participant phrase “shifted form with basic gematria”: map each recovered first-release rune to its actual Gematria Primus prime value, reduce modulo 29, and use that stream as a repeating shift key. It is not an author-authenticated operation.

## Source and exact model

The historical first17→last57 proposal refers to the 17 physical pages of LP1, not LP2 p0–p16. The 2016 discussion is participant speculation, not a signed Cicada instruction. The prior [index-key study](../workplace/2016-first17-basic-gematria-key-hypothesis.md) tested 2,797 zero-based GP rune indices and a 2,836-element stream that adds printed decimal tokens modulo 29; both shift signs were negative.

This experiment changes only the rune-value representation:

- Recover LP1 physical pages 0–16 from the original Wulfic transcription using the archived idkfa transformations and exact transparent-F positions.
- Map each recovered rune index i to the corresponding GP prime p_i, then use p_i mod 29 as the shift value.
- Test a 2,797-rune stream and a 2,836-element stream that additionally inserts each of the 39 printed decimal tokens as n mod 29, preserving source order.
- Apply the key continuously from offset zero to original LP2 p0–p56 (12,956 unknown runes plus the 85-rune solved p56 control), both subtraction and addition.
- No offset search, page resets, rotations, alternate alphabets, or language-tuned selection.

The 29 GP prime values are the ordered primes 2 through 109. The complete original LP1 source sections contain 2,797 runes and 39 printed decimal tokens (12 on p5, 2 on p10–13, 25 on p16).

## Reproduction and result

Script: [sims/agent20_lp1_first17_gp_prime_value_basic_gematria_sft.cjs](../sims/agent20_lp1_first17_gp_prime_value_basic_gematria_sft.cjs)

[Windows / Node 22 manual SFT PASS, run 45382150278](https://github.com/FlareZ123/liber-primus/actions/runs/45382150278). The script reuses the original source parser, asserts the seven native section lengths, verifies all 39 printed numbers, and includes an 85-rune planted positive inverse at a nonzero key phase for every candidate key/sign.

| Key stream | Shift | Key length | LP2 p0–p55 IoC | p16–p21 IoC | p40–p53 IoC | p56 exact matches |
|---|---|---:|---:|---:|---:|---:|
| GP prime values mod 29 | subtract | 2,797 | 0.034490445 | 0.034738685 | 0.034418140 | 3/85 |
| GP prime values mod 29 | add | 2,797 | 0.034508354 | 0.034744069 | 0.034540859 | 4/85 |
| GP prime values plus printed integers mod 29 | subtract | 2,836 | 0.034479554 | 0.034501776 | 0.034431849 | 2/85 |
| GP prime values plus printed integers mod 29 | add | 2,836 | 0.034497630 | 0.034501776 | 0.034353795 | 3/85 |

The random 29-symbol baseline is 1/29 ≈ 0.034482759. All four full-stream IoCs remain essentially at that baseline; the displayed prefixes are nonlinguistic and the independently solved p56 does not match. All four planted inversions recover 85/85, so the implementation is functioning.

## Decision and limit

Reject only these two direct GP-prime-value repeating-key streams under the two ordinary GP29 shift signs and the fixed continuous phase-zero clock. Combined with the earlier rune-index and integer-mod-29 tests, the simplest direct “first17 as basic-gematria shift key” readings have no plaintext support.

This does not reject every possible first17→last57 construction, nor does it test bytewise XOR with the full 2013 DATA/560.17 object. The historical chat supplies no source-selected serialization, page reset, or byte-to-GP mapping. The separate p0–p16 five-bit XOR test of 560.17 used the wrong receiver and is not evidence against LP1→LP2. Do not expand this branch into arbitrary key phases or remappings without a new first-party selector.

No unknown LP2 plaintext, authentic key, or destination is recovered.
