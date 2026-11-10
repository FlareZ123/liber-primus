# 10-dot page-gap lags: exhaustive three-tap feedback test

## Source observation

The original LP2 ink annotations contain four 10-dot marks:

| Physical page | Rune offset | Offset / 3 | (offset / 3) mod 29 |
|---:|---:|---:|---:|
| 36 | 99 | 33 | 4 |
| 38 | 186 | 62 | 4 |
| 49 | 66 | 22 | 22 |
| 56 | 45 | 15 | 15 |

All four page-local offsets are divisible by 3. Consecutive page gaps are **2, 11, 7**, all prime. The last two offset-thirds, 22 and 15, also match the p15/p40 red-span triangle quotients. In addition, 49 + 22 = 56 + 15 = 71.

This is an exact source observation, not evidence by itself that the values are cryptographic lags. The 10-dot mark on page 56 is in the solved-page control; the three marks on pages 36, 38, and 49 are in the target pages.

## Hypothesis tested

Interpret the three consecutive page gaps as tap lags in a fixed three-tap recurrence over the 29-symbol GP alphabet:

\[
P_i = C_i - (aP_{i-2}+bP_{i-11}+dP_{i-7}) \pmod{29}
\]

and the ciphertext-feedback analogue with previous ciphertext symbols in place of previous plaintext symbols.

The lag order is fixed as [2, 11, 7], derived from the 10-dot marker page sequence. Coefficients a,b,d are exhaustively searched over F29, giving 29^3 = 24,389 models per feedback type. The target input is the 12,956 rune sequence from physical pages 0-55, concatenated in page order. The first 11 symbols are used as seeds for plaintext feedback; ciphertext feedback begins decoding at offset 11. The exhaustive search is continuous across page boundaries. No word or page reset is fitted.

The red-span triangle coefficient candidate [15, 22, 20] and the all-ones candidate [1, 1, 1] were also checked directly; neither gives language-like output. The fixed-key readings [2,11,7] and [4,4,22,15] likewise leave the output near uniform.

## Results

Reproduce with:

```sh
node sims/ten_dot_gap_lag_3tap_search.cjs
```

The raw 12,956-rune ciphertext IoC is 0.0344784.

| Model | Coefficient models | Minimum IoC | Mean IoC | Maximum IoC | SD |
|---|---:|---:|---:|---:|---:|
| Ciphertext feedback | 24,389 | 0.0344302 | 0.0344828 | 0.0345901 | 0.00001995 |
| Plaintext feedback | 24,389 | 0.0344284 | 0.0344828 | 0.0346202 | 0.00001970 |

The highest plaintext-feedback IoC occurs at (a,b,d) = (1,3,21), but its decoded preview remains non-linguistic and its frequency profile is close to uniform. The best ciphertext-feedback model (0,17,17) is similarly uninformative. The best scores are ordinary extrema from a 24,389-model search, not evidence of plaintext recovery.

## Conclusion and scope

The attractive 10-dot geometry does **not** support the simple interpretation that the prime page gaps [2,11,7] are fixed linear three-tap lags in a continuous mod-29 feedback cipher. The source observation remains valid, but this particular cipher family is not a solution.

This does not exclude a marker-triggered/nonstationary state update, another interpretation of the 10-dot positions, different lag derivation, nonlinear feedback, or a different intermediate alphabet. Do not promote the coordinate arithmetic to an established cryptographic mechanism.

Supporting implementation: `sims/ten_dot_gap_lag_3tap_search.cjs`.
Source inputs: `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-ink-annotations.json`, and `resources/transcriptions/liber_primus_master.txt`.
