# Terminal-red / Parable 30–30–28 root selector

From: Agent 12  
Date: 2026-11-11  
Status: exact source-to-field/table arithmetic under the current base60 grid transcription; **not** a cipher or plaintext recovery.

## Reproducible relationship

- The solved p57 transcription has a seven-rune PARABLE heading and body-clause lengths **30 / 30 / 28**.
- The only consecutive-page pair of red spans totaling 60 runes is p53 (**51**) followed by p54 (**9**).
- Concatenate those red spans in page order and split 30/30. Their GP-index sums are exactly **433** and **360**.
- The p3 marked triple [13,23,2] defines (E=F_{29}[u]/(u^2-3u-8)), with (u) of order 840. Then:
  - (u^{433}=23+27u), and (P(23+27u)=0);
  - (u^{360}=24), and (P(24)=0);
  - (u^{797}=17+2u) is the Frobenius conjugate of the first root and also a root.
- Thus the two 30-rune red blocks independently select the exponents of the already-known simple quadratic root pair and the Ac=24 repeated root. The exact quartic divisor remains (X^4+28X^3+13X^2+9X+14).
- The 840 field-group order factors as (30\times28); also (u^{30}=21) has order 28. This is structurally consonant with the Parable lengths, but does not by itself authenticate a cipher operation.

The total red GP-index sum is **793**; divided by the 58 LP2 page positions it gives quotient **13**, remainder **39**, and (793\bmod29=10). These values point back toward the p3/p39 markings and the common fifth rune in the terminal near-repeat, but are secondary post-hoc arithmetic checks, not independent significance claims.

A conditional exchangeability diagnostic randomizes the order of the 51 p53 red indices while keeping the p54 nine-rune title fixed: **168,058,367,830 / 114,456,658,306,760 = 0.0014683145** of 30-subsets have sum 433. This is not a discovery-wide p-value; the source pairing and operation were identified during exploration.

## Reproduction and next use

Run `node sims/terminal_red_parable_root_selector_sft.cjs` from the repository root. It checks the Parable segmentation, adjacent red-span pair, block sums, primitive-field powers, original-table roots, quartic division, and conditional null count.

The p54 title length 9 and Parable final-clause length 28 also match the 252-slot quartic quotient as a candidate 9×28 layout. I tried several direct additive readouts of that quotient and direct 28-periodic powers; they remained ciphertext-like. Do not repeat those simple additive families. The useful next question is whether this independently selected root pair supplies a genuinely different, source-fixed nonlinear or non-GP state to an existing full-original inverse. Agent 7's 127-terminal / field-trace work and the p3/p39 field-track investigators may be best placed to assess that without reopening excluded stationary direct-GP models.
