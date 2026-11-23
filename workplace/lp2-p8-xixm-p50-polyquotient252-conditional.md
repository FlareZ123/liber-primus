# The p8 XIXM handoff and the p50 degree-four quotient: one exact source-framed receiver, no plaintext

**Agent 7, 23 November 2026. Conditional cross-object exploration, not an established decoder.**

## Why this is a distinct, physically readable proposal

The original LP2 p8 starts with the four red runes `X-I-X-M`, whose first three spell Roman XIX and whose final M has GP29 ordinal19. The page contains exactly **255** GP runes, and the first GP rune on p9 continues a genuine printed word that crosses the page seam. This gives one unchanged **256-rune continuous p8→p9 packet**. Excluding the physically distinguished initial four-rune red word leaves **252** original runes, comprising p8 runes4–254 plus the first p9 rune.

Independently, the source-original p49–51 table contains **256** physical base-60 byte values. Under the existing, already independently documented GF29 polynomial-factor interpretation, the exact 2013 signed BASE29(3301) coefficient polynomial `H(x)=3+26x+24x²` and original p39 red-triad polynomial `G(x)=27+5x+15x²` both divide the source table polynomial `T`. Their degree-four product yields a **252-coefficient quotient Q**. The quotient has precisely the same native-GP length as the 252-rune recipient after the printed Roman XIXM. This is an original-artifact count equality; it does not demonstrate that Cicada instructed solvers to divide polynomials or use this source as a key.

The proposed minimal operation reads all 256 table coefficients high-degree-first in original row-major order, divides `T/H/G` over GF29 with H and G in ascending coefficient order, then subtracts the 252 quotient coefficients, *still high-degree-first*, from the exact physically contiguous p8-after-XIXM / p9-first source packet.

## Decisive original-input observations

- Original p8 page has **255** runes; first four red runes **X I X M**. Exactly `255−4+1=252` runes remain when the first rune of p9 is included.
- Exact GF29 long division gives **`T mod H = [0,0]`** and **`(T/H) mod G = [0,0]`**, yielding **Q length252**.
- With printed-order quotient `Q`, the frozen **subtract** inverse `C−Q mod29` has original GP29 IoC **0.0329159552267122** and opens `U TH I G F B N AE N I A J Y C E C AE P I EO M L R TH E`, not prose.
- The reverse arithmetic `C+Q mod29`, retained only as a same-input sign control, gives IoC **0.03582495415164738** and also no readable native text.
- The source table polynomial and the entire p8→p9 256-rune polynomial are **coprime over GF29**; so are the p8 packet and each H/G source factor. The two 252-coefficient vectors have unequal GP29 symbol-frequency multisets (sorted L1 difference20), excluding a simple fixed alphabet-permutation identification.

## Interpretation and stop condition

The length pairing supplies a *plausible source-selected receiver* if an author-specified polynomial operation independently exists; it supplies no decipherment. The fixed elementary additive consumer fails. **Do not vary quotient rotations, ASCII decoders, degree orientation, p8 endpoint, or manuscript-wide key schedules** merely to optimize language fit. Next action requires a first-party indication to consume the division quotient differently, or a successful frozen receiver predicting an untouched original paragraph.

Canonical inputs: `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-grid-256.json`. Source factor identity and history: `im-results/lp2-2014-3301-square-base29-spectral-original-gate.md`. Original p7→p8 title arithmetic: `im-results/lp2-p7-p8-original-red-polynomial-fixedpoint.md`.
