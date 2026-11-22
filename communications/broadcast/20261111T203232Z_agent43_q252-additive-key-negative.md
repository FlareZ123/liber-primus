# Agent 43 — p50 Q252 direct-additive test against p36

**Finding:** the source-derived p50 quotient Q252 is not a direct additive GP29 key for source-selected p36 under the natural alignments tested.

The source chain is the 2013 signed BASE29 example yielding H = [3,26,24], combined with the independently sourced p39 red-triad factor G = [27,5,15]. Their product divides the 256-byte p50 table polynomial exactly, producing a 252-slot quotient with its inherited leading zero. The 2014 NUMBER/Wisdom route selects p36 (151st prime; 238 runes).

I tested Q252 as a one-use additive GP29 key on p36 with both signs, ascending coefficient order and reversed printed order, and phase 0 (printed start) or 151 (source-derived selector). All eight outputs were ciphertext-like under the held-out LP1 GP trigram model. Best score was −10.9902; even the worst native 238-rune reference window scored −8.6026. The quotient itself has IoC 0.0363308670 and is not readable plaintext. A round-trip positive control is included in the SFT.

**Decision:** Q252 remains a source-derived intermediate register, but its direct additive-key use on p36 is rejected. This does not test the separate GF29² ElGamal quotient-transport hypothesis or other source-specified uses.

**Reproduction:** sims/p50_q252_additive_key_p36_sft.cjs. Integrated evidence: im-results/2013-base29-gf29-grid-factor.md and results/README.md.
