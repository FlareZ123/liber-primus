# LP1 Möbius rank-differential register: bounded original-LP2 negative

**Classification:** A source-motivated, reversible non-GP register was tested against the original LP2 ciphertext with native-GP planted controls. It preserves the 86 adjacent doublets exactly but does not recover language. The doublet correspondence is a property of differencing a bijective symbol rank, not evidence that this is the intended cipher. No unknown plaintext or key is recovered.

## Source-visible construction

LP1 page 05 contains the word **MOBIUS**. Its opposite-corner matrix is

[
M_{05}=egin{pmatrix}272&151\\151&272end{pmatrix}
equivegin{pmatrix}11&6\\6&11end{pmatrix}pmod{29}.
]

The p05 MOBIUS cell is 226, so the source seed is (226mod29=23). The projective action has order 28; using the established projective completion that replaces the omitted fixed coordinate 1 by infinity gives a 28-symbol cycle over GP indices 0–27, with EA (index 28) as the remaining fixed symbol.

For each non-EA ciphertext rune (C_i), let (r_i) be its position in that source-defined cycle. The candidate register is the cyclic rank difference

[
D_i=(r_i-r_{i-1})mod m,qquad r_{-1}=0.
]

Two natural EA treatments were frozen:
- **transparent28:** EA passes through and does not advance the rank state; (m=28).
- **full29:** EA is assigned rank 28 and participates in the state; (m=29).

Both directions of the source matrix (M05 and its inverse) and the two natural clocks (continuous book stream or reset at each physical page) were tested: **eight total variants**. The plaintext candidate is the direct canonical GP-index interpretation of (D_i); no additional fitted substitution, offset, or key is used.

## Original-source results

The input is all **12,956** canonical runes from 56 physical page records (55 rune-bearing pages plus the grid-only page). The source has **460 EA symbols** and **86 within-page adjacent doublets**.

| Measurement | Original | GP-English reference | Best candidate |
| --- | ---: | ---: | ---: |
| IoC | 0.03447840 | 0.06238554 | 0.03525983 |
| Top-12 symbol mass | 0.42976227 | 0.78029175 | 0.44079963 |
| Emerson-GP trigram mean log score | −14.00447 | −7.74692 | −14.01567 |

The best candidate is the **M05-inverse, global, full29** variant. It is slightly worse than the raw ciphertext on the same trigram model and remains far from native GP-English. All eight original inverses are random-looking; none produces a sustained readable passage.

The full29 within-page differential contains exactly **86 zero transitions**, matching the 86 adjacent equal ciphertext pairs. This is expected algebraically: any bijective rank map sends adjacent equal symbols to equal ranks, whose difference is zero. It therefore does **not** explain why the source has only 86 doublets. The page-reset variants add four page-start zero transitions; the transparent28 variants produce 96 global / 100 page-clock zero transitions because equal non-EA symbols separated by EA also collapse to zero.

## Cross-round 79/78 cyclic-order test

The p05 MOBIUS cell's prime sum 226 gives seed 23, and the p05 corner matrix yields a 28-cycle over GP indices 0–27 with EA/index28 fixed. This suggests a natural cross-round use: append fixed EA to the cycle to form the 29-symbol cyclic rune order required by the phase35 78-base29-to-79-base28 packet model. Both orientations were tested on the 95 repeat-free phase35 packets. The forward order is capacity-valid on **48/95** packets; the reverse on **55/95**. Their decoded streams score **−5.30233** and **−5.41627** under the frozen Shakespeare GP bigram model, worse than raw ciphertext (**−5.19290**) and far below held-out English (**−2.66335**). Exact 12-packet synthetic controls recover for both orientations.

M16 is the six-step action on M05's 28-cycle; since gcd(6,28)=2, M16's orbit from seed23 has length14, not28, and it supplies no independent 28-symbol order. The 28-cycle-plus-EA hypothesis is therefore a bounded negative for the strict phase35 packet model, not a recovered key. Reproducer: `sims/mobius28_order_prime79_packet_gate.cjs`; full packet synthesis: `im-results/prime79-radix29-packet-gate.md`.

## Reproducibility and interpretation

Run from the repository root:

```sh
node sims/lp1_mobius_rank_differential_sft.cjs
```

The script checks the source-derived 28-cycle, tests all eight frozen variants, verifies exact forward re-encryption of the original, and plants known Emerson-GP text under the same EA-position mask and page lengths. All eight planted controls recover exactly; the opposite-orientation decoder fails to recover the corresponding plants. These are implementation controls, not evidence of authorial intent.

**Decision:** The p05 Möbius orbit supplies a legitimate alphabet ranking, but both its simplest adjacent rank-differential register and its natural 29-symbol cyclic-order extension for the phase35 79/78 packet model fail on original LP2. Do not expand this family with arbitrary offsets, custom output substitutions, masks, or extra reset rules. Any future use needs a different source-fixed state or a reversible explanation of the original 86 adjacent doublets. No key or plaintext is handed to #5/#16.
