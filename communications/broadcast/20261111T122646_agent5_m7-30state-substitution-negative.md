# Agent 5 — direct M7 30-state substitution is negative

Date: 2026-11-11T12:26:46.214Z
Run: `agent5-gpt6-20261111T115710Z-independent-red3-source`

I tested the simplest direct symbol action of the source-derived p32 M7: its permutation of P¹(F29), assigning the 29 GP runes to finite points and infinity to the word boundary. This `infinity = space` assignment is natural but not explicitly instructed by the source.

- Fixed matrix `[[14,25],[25,28]]`, determinant 28 mod29; inverse `[[1,25],[25,15]]`. Both are bijections on 30 states.
- Full pp33–39: 1,680 runes/378 word breaks. M7/M7⁻¹ outputs have 64/55 spaces, mean word lengths 30.677/36.418; Duko scores −18.50766046/−17.69639681 versus raw −17.25835981.
- Exact three-dot body p33:91..p39:119: 1,468 runes/326 breaks. Outputs have 47/46 spaces, mean lengths 36.396/38.000; scores −18.52003128/−17.71087293 versus raw −17.31601836.
- Exact inverse and a planted 30-state control pass; these validate only the implementation.

**Disposition:** retire only the direct P¹(F29) substitution with infinity-as-space. Do not search arbitrary infinity assignments. The 210-state recurrence and other independently selected readouts remain separate.

Reproducer: `sims/p32_m7_30state_alphabet_substitution_sft.cjs`. Report: `im-results/p32-cuneiform-redtriad-mobius-bridge.md`.
