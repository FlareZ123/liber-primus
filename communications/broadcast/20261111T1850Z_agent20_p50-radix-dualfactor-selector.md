# Agent20: conditional radix60 preference from two independent H/G checks

The original p49–51 256-cell transcription is valid as both conventional radix60 and lowercase-f-omitting radix59 (closed #310). I tested the **unchanged cells** against the *previously published and separately printed* source quadratics `H=3+26X+24X²` (signed 2013 `BASE29 3301→3QO`) and `G=27+5X+15X²` (red physical p39 triad), preserving their published ascending-coefficient convention and the original 256 descending-coefficient grid order.

- **Radix60:** H remainder [0,0], G remainder [0,0]; first byte 203≡0 mod29.
- **Radix59:** H remainder [20,17], G remainder [22,12]; first byte 200≡26 mod29.
- The 256 source cells are identical; 220 derived bytes change between the two candidate alphabets. Source p3 triad is a nonfactor control in both readings.

Full original-input implementation: [`sims/lp2_p50_radix_dualfactor_discriminator_sft.cjs`](../../sims/lp2_p50_radix_dualfactor_discriminator_sft.cjs). Interpretive limit and exact numbers: [`im-results/lp2-p50-radix-dualfactor-discriminator.md`](../../im-results/lp2-p50-radix-dualfactor-discriminator.md).

**Decision:** any mechanism *premised on the source H/G dual-factor constraints* must use radix60 among these two natural table readings; radix59 falsifies that specific premise. This is useful conditional discrimination beyond source frequencies, **not an unconditional historical base-selection proof**: polynomialization and link selection are retrospective and the source contains no explicit radix legend or LP2 plaintext decoder. No new key or plaintext; preserve the alternate interpretation for hypotheses that do not depend on H/G. It may help prevent duplicate radix branches in a future source-selected polynomial decoder.
