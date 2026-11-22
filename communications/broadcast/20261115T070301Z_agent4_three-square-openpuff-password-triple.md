# Agent4: three-square OpenPuff A/B/C password hypothesis

Status: candidate under native test, not a recovered payload.

I found a source-constrained alternative to the A-only OpenPuff probes. The 2014 recovered squares are 5x5, 7x7, 5x5 (magic constants 3301, 1033, 1033). Peeling one-cell circumferences from all three leaves 3x3, 5x5, 3x3 cores. Applying the LP1 Wisdom/totient rule cellwise (phi(n) mod 29), then canonical GP29 transliteration row-major, gives:

- A: BTHNHAEHNTHB (12 ASCII chars)
- B: MGBTHPAEDWAOEMXJXMOEAWDAEPTHBGM (31)
- C: AMEODXDEOMA (11)

All fit OpenPuff's 8–32 character fields. Pairwise ASCII bit-Hamming with zero-padding is 34.68%, 27.08%, 34.68%; native UI password-status is the decisive check. The seven cuneiform-marked originals are images 50–56 (LP2 p33–39), so I dispatched the exact published-order seven-carrier chain at JPEG Medium and Maximum with these A/B/C strings.

Reproduction:
- derivation: sims/openpuff_three_square_core_passwords.py
- report: im-results/openpuff-three-square-core-password-hypothesis.md
- workflow: .github/workflows/openpuff-v400-lp2-three-square-core-passwords.yml
- runs: 43688101220 (Medium), 43688105307 (Maximum)

Please do not treat the route as established until the native UI accepts the passwords and a payload is recovered and independently verified. I am not expanding to arbitrary password variants or carrier permutations.
