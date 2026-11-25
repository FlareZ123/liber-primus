# Positional BASE29 carry feedback at lags five and six

**Decision:** a fixed, fully reversible all-digit base29 carry recurrence with two lag coefficients and a repeated-digit affine constant does not recover unknown LP2. This is a new scoped key-recovery experiment, not an author-selected cipher or an established plaintext. The motivating evidence is the authenticated 2013 BASE29 conversion and reported LP2 lag-five/six echoes; neither authenticates this recurrence. Prior all-key GF29 feedback work removes the carry entirely; the ordinary whole-word end-around-carry gate uses a different modulus and resets. Here the integer carry crosses printed groups and physical page boundaries inside each of the two original chapter intervals.

For each original chapter independently reset missing predecessor digits and carry to zero. In arithmetic order (either natural reading order as low-to-high digits, or the literal big-endian BASE29 direction), encrypt with

    s_i = k + carry_i + a*C[i-5] + b*C[i-6]
    C_i = (P_i + s_i) mod 29
    carry_(i+1) = floor((P_i + s_i)/29)

Decode with P_i=(C_i-s_i) mod29 and the same carry formula. The exact integer identity is (1-a*29^5-b*29^6) C = P + k*(29^N-1)/28 (mod29^N); the multiplier is a unit modulo 29^N. Unlike GF29 feedback, all digits, including F=0, consume state. No boundary/key/lag/clock tuning. Each direction searches **24,389 keys**; fit p0–2 (729) by native bigram score trained on Gibran, freeze key and independently decode p54–55 (308); the two intervals have prior collective exposure. Matched Shakespeare and Emerson native-GP plants require recovery of the exact key and all runes, not just replay.

| Direction | Original best (a,b,k) | Train nats/rune | Max all-key train IoC | Frozen hold nats/rune | Hold IoC |
|---|---|---:|---:|---:|---:|
| left-to-right | 15,1,24 | -4.451061 | 0.036197 | -4.817488 | 0.034371 |
| right-to-left | 1,7,17 | -4.456700 | 0.036148 | -4.991059 | 0.034371 |

Controls: left-to-right hidden 7,19,11 recovered exactly, 729/729 fit and 308/308 held; fit -2.675998, hold -2.699803 nats/rune, held IoC 0.059436; right-to-left hidden 23,4,17 recovered exactly, 729/729 fit and 308/308 held; fit -2.634533, hold -2.510390 nats/rune, held IoC 0.066818. All original candidates replay exactly, as all bijective keys must. Full integer congruence checked on controls and original candidates. Original candidate texts and indices are included in raw output; neither reading direction produces coherent prose. This is a calibrated finite key-search negative for this fixed all-digit carry family, not a general exclusion of arbitrary integer multipliers, private chapter states, other lags, F-holding clocks or non-native plaintext. Retire the exact model rather than expand coefficients or carry rules without an independent selector.

## Reproduction

- [SFT](../sims/lp2_base29_lag56_carry_sft.cjs), Node 22, CommonJS; the computational core ran in the connected JavaScript runtime, standalone wrapper not separately run.
- [Raw original and control output](lp2-base29-lag56-carry-output.json).
- Inputs: `resources/liber-primus/lp2-corpus.json` blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; `resources/control/gibran_prophet_58585.txt` blob `df260a07d56bf5998d40a6360b6132c35c252d10`; `resources/control/shakespeare_first300k.txt` blob `94c677ad9dd50771c6670e0c4e4dad9052b46d85`; `resources/control/emerson_essays_2944.txt` blob `a92be8ba5b3511a003a22ba31523c14397aaa83a`. Shakespeare first 300 lines only.
