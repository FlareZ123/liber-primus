# Cuneiform digit-sum 86 ↔ LP2 adjacent-repeat count

**Agent 19, 18 November 2026. Evidence class: exact cross-artifact arithmetic/structure observation with a direct receiver negative. No unknown plaintext or key is recovered.**

## Exact source arithmetic

The repeated cuneiform-style header on LP2 pp33–39 is conventionally read as the four sexagesimal components

[
17, 13, 55, 1,
]

forming the two visible base-60 values (17cdot60+13=1033) and (55cdot60+1=3301).

The four literal components have two immediate, parameter-free sums:

- total: **17 + 13 + 55 + 1 = 86**;
- row sums: **17 + 13 = 30**, **55 + 1 = 56**.

Across the entire unsolved LP2 ciphertext p0–p55, there are exactly **86 adjacent-equal rune transitions**. The count is the same whether pages are treated separately or concatenated because no physical page seam is itself an equality.

This exact numerical bridge was not present in the existing cuneiform reports inspected during this invocation.

## Direct 86-rune payload test

Taking one rune from every doubled pair in source order gives exactly 86 GP symbols:

`THXEAJLAESNGGAENOEJFYGXUAEGIAOMHWDXJEAAEGIAOSNXULSELOERCFEOAEMTHEOFNTDHRATHJTAEFXWIOEWEANOEIAEOEXEOEPWWWYNGGTH`

Its GP29 IoC is **0.03365253**, close to uniform. Reading the four component-sized groups (17|13|55|1) in source order, reversing each group, reversing group order, or doing both does not produce readable GP prose.

The four cumulative group boundaries also give no obvious instruction:

- repeat 17: p10 local 182, rune X;
- repeat 30: p23 local 127, rune AE;
- repeat 85: p54 local 155, rune G;
- repeat 86: p55 local 58, rune TH.

The direct ordinal selection (17,13,55,1) gives X, J, D, TH. No source instruction identifies either readout as a key or message.

## Row sums 30 and 56: authentic p56 consumer fails on p30

The row sums are both valid LP2 page numbers, and p56 is the authentic solved prime/totient example. This supplies a much stronger test than treating 30 and 56 as arbitrary constants.

Freeze the solved p56 inverse unchanged:

[
P=C-(p-1)pmod{29},
]

starting with the first prime, with the authentic literal-plaintext-F non-consuming branch. Apply it to original p30.

The inverse state machine has **no legal branch beyond zero-based rune 40**. The live prime-counter set never exceeds one state and is empty at the contradiction. Thus the most direct interpretation "row 30 points to a page that should use p56's solved mechanism" is structurally impossible.

## p50 literal-value bridge also fails

Treating 17, 13, 55, and 1 as conventional numeric values in the p50 printed table does not supply four cells. Only 13 occurs among those conventional low values; 17, 55, and 1 do not. This blocks the simplest cuneiform-components → p50-cell receiver.

## The 86 repeat events as a period-86 key (Agent1, 26 November 2026)

The exact 86-event sequence can be tested as a key, not only read as a payload. The cuneiform components sum to 86, the repeated-run symbols form a fixed 86-symbol sequence, and additive GP29 Vigenère is a simple, recognizable consumer. I applied a global period-86 key from the first rune of p0 through the last rune of p55; no page reset or phase search was introduced.

Three direct key derivations were frozen:

1. **Repeated rune values:** the same one-rune-per-equal-pair sequence already printed above.
2. **Absolute repeat positions modulo 29:** use the zero-based position of the second rune in each repeated pair.
3. **First position plus inter-repeat gaps modulo 29:** use the first absolute position, then each successive gap, giving exactly 86 key symbols.

For each key, both additive signs were tested over the complete 12,956-rune p0–p55 stream. All six readouts are nonprose, and their IoCs remain essentially at the ciphertext baseline:

| Period-86 key | Subtract key | Add key |
|---|---:|---:|
| Repeated rune values | 0.03448270 | 0.03451058 |
| Repeat positions mod 29 | 0.03448086 | 0.03450858 |
| First position + gaps mod 29 | 0.03450956 | 0.03447367 |

The input IoC is 0.03447840. The exact readout prefixes, tails, key strings, byte hashes and round-trip assertions are emitted by the extended SFT. This closes only these three fixed, source-derived period-86 Vigenère keys at global phase zero; it does not exclude using the repeat events as some other form of side information or as part of a separately specified state machine.

## Decision

Preserve **17+13+55+1 = 86 = the complete unsolved adjacent-repeat count** as an exact structural lead. It has a plausible human-puzzle character because both sides are directly observable and require only addition/counting.

Current direct consumers fail:

- the 86 selected runes and natural four-group reversals are nonlinguistic;
- the row-sum page pair (30,56) does not transfer the authentic p56 cipher to p30;
- the four literal components do not map cleanly to p50 conventional values;
- the repeated-rune, repeat-position, and repeat-gap sequences do not decrypt the full p0–p55 stream as direct period-86 additive GP29 keys.

Do not turn the equality into a broad key search. A useful successor needs an independent clue explaining why the doubled-rune events should be segmented, transformed, or used as side information.

Reproduction: **sims/lp2_cuneiform_digits_repeat86_p30_p56_gate_sft.cjs**. Windows Node22 manual SFT passed (run 45768485592).
