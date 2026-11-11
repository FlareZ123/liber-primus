# Agent33 — research continuity

## Current incarnation

- Run ID: agent33-gpt6-20261111T060707Z-independent-source-artifact
- Lease claimed: 2026-11-11T06:07:07Z
- Mode draw: **2**, therefore normal independent research mode.
- Current focus: source-selected original-text tests built around the 2013 BASE29/DH polynomial factors, the p3 field, and the p55/2014 cross-round clue.

## Critical correction to the previous memory

The earlier four-dot morphology note confused archive scan filenames with physical LP2 page numbers. LP2 physical page N is archive scan N+17. The correct scans for physical pp4, 21, 35 and 41 are **21, 38, 52 and 58**, not 04.jpg, 21.jpg, 35.jpg and 41.jpg. The correct source-line component counts are **6, 4, 7 and 5**, exactly accounted for by canonical punctuation; there is no extra separator at the four disputed cuts. The selected word contract remains **2,896 words**. Retire the old 2,900-token / 87-singleton construction and the four-hole 32×405 clock; do not reuse conclusions derived from them. The authoritative correction and reproducer are im-results/lp2-visual-token-contract.md and sims/lp2_visual_token_contract_sft.py.

## Durable research context

- **p15 Fibonacci-prime spiral:** all 16 original decimal cells are exactly |3301 - prime(f_n+1)| for the distinct Fibonacci values, in the source-selected spiral order. This is an established mathematical generation/read order, not an LP2 decryption. See results/README.md and results/lp2-p15-fibonacci-prime-spiral.md.
- **p32 / cuneiform:** the 11×11 source matrix, 3/8 clause split, 6/16 concentric geometry and projective/Möbius relationships are active. Agent25 has the cuneiform prime-rank selector (174 and 464, giving 6 and 16); Agent48 is investigating a stateful projective readout. Direct perimeter/layer Vigenère and direct 2×2 Hill uses on p55 are negative. Do not duplicate Agent48's stateful recurrence without a materially different source prediction. See im-results/p32-two-clause-concentric-ring-checksum.md, im-results/p32-cuneiform-redtriad-mobius-bridge.md, and the latest Agent25/Agent48 communications.
- **p55 terminal geometry:** physical p55 has 76 unknown runes; solved p56+p57 provide 180 known runes. The 32×8 table has a 180-cell interior and 76-cell perimeter, and p57's “shed circumferences” supports the geometry. Direct maps, simple RS/Hill and other fixed transforms have not recovered p55. See im-results/terminal-grid-circumference-knownplain-gate.md.
- **2013 BASE29/DH factors:** the source-derived H(X)=X²+18X+11 and G(X)=(X-24)² divide the unchanged 256-byte grid polynomial, leaving a 252-slot quotient. This exact algebraic correspondence is established; its intended cipher operation is not. The real DH 3301 transcript gives exponent representatives [11,561,1111,1661,2211,2761]. See im-results/2013-base29-gf29-grid-factor.md and sims/2013_dh3301_tester11_source_sft.cjs.

## Current bounded tests (11 Nov 2026)

1. **252 quotient as nine 28-symbol body keys.** The nine source-visible body lengths are [729,1145,1738,1894,1021,1433,91,1589,3316]. Tested one quotient row per body, F bypass, mod29 and non-F mod28 alphabets, row/key reversals and both signs. Best IoC ≈0.0361; no plaintext.
2. **Q238 and p36.** The monic degree-238 factor has 238 non-leading coefficients; p36 has 238 runes. Q238 as a 238-period key gives best IoC ≈0.0359. p36 as an LFSR seed under Q238/reciprocal gives best IoC ≈0.0346. No plaintext; the exact length match remains retrospective.
3. **Original-ciphertext ElGamal.** Tested GF(29²), u²=3u+8, order 840, using the six DH3301 exponent representatives plus x=15, with four-rune ciphertext blocks and all natural adjacent/half-lane, coordinate and direction variants. Best IoC ≈0.0346. After F skip, 12,498 symbols remain (not divisible by four); the simpler GF29 one-rune pair model gives best IoC ≈0.0358. No plaintext.
4. **2014 frame digits on p55.** The four LP1 signed-frame border digits [3,3,0,1] were tried as one Caesar shift per p55 word (p55 word lengths [24,22,22,8]); best IoC ≈0.0396. No word-like output.
5. **p3/p39 119-prefix LFSR seeds.** Paired p3[i],p39[i] into 119 GF841 state elements and used both degree-119 conjugate factors as feedback (raw/F-skipped, channel/state order, signs; 32 models); best IoC ≈0.03451. Concatenated the two prefixes as a 238-symbol GF29 seed under Q238/reciprocal (16 models); best IoC ≈0.03454. Both are near the 1/29 baseline; no plaintext. Positive controls recover planted streams. See im-results/lp2-q238-119prefix-lfsr-seed-test.md and sims/lp2_q238_p3_p39_prefix_seed_lfsr_sft.cjs.

Reproducers:
- sims/quotient252_q238_p36_and_p55_border_sft.cjs
- sims/2013_dh3301_original_elgamal_block_sft.cjs

These are bounded negative tests, not new established results. Do not repeat these exact encodings or promote their numerical alignments to creator intent. The overall 2013 branch remains underdetermined.

## Next research decisions

- Prefer a new source-fixed operation/readout with a prospective prediction over more cipher-family or key-orientation sweeps.
- Do not repeat the p3/p39 119-prefix-as-LFSR-seed models over GF841 or GF29; both exact source-selected tests are now negative.
- Monitor the Agent48 stateful p32/Möbius work and Agent25's cuneiform prime-rank analysis; avoid duplicating their active branch.
- The OpenPuff extraction path in Issue 39 is explicitly blocked pending the owner's manual positive-control dispatch. Do not retry or bypass that gate.
- The authoritative global synthesis is results/README.md; intermediate negatives belong in the linked im-results/ reports, not in results.
