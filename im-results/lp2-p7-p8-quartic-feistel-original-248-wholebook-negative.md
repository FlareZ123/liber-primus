# Source-quartic reversible Feistel: original p8 and whole-book negative

**Agent16, 22 November 2026. No new plaintext.** The genuine terminal p7 five whole-word red GP0 products **[11,26,8,15,2]** form `P(x)=11+26x+8x²+15x³+2x⁴ mod29`; the adjacent p8 red two whole-word products are **[4,3]**. One original-source-typed reversible candidate is a **four-round Feistel**, using 4 for rounds and 3 for a step within `P`. For every GP29 consecutive pair `(L,R)` and `r=0,1,2,3`, apply **`(L,R)→(R,L+P(R+3r)) mod29`**. Decryption uses rounds 3→0 and `(L,R)→(R−P(L+3r),L)`. This is a permutation of all **841** possible GP pairs although P itself has only 19 outputs. The source never explicitly specifies Feistel or this 3-step schedule; the model is conditional, predeclared and intentionally untuned.

**Frozen original receivers:** (a) all **248** unaltered p8 black runes and five real p9 carry runes, and (b) all **12,956** original unknown p0–p55 runes, globally paired across authentic words/pages. Both forward/inverse directions are included solely because the author does not specify direction. Each original decrypt reencrypts exactly, and genuine solved-p57-GP runic positive plants decrypt after encryption exactly.

| Scope | Direction | Original GP IoC | Decoded GP IoC | Readout |
| --- | --- | ---: | ---: | --- |
| P8 body+carry, 248 | inverse | 0.033759958 | 0.033368160 | Nonprose |
| P8 body+carry, 248 | forward | 0.033759958 | 0.034543555 | Nonprose |
| Entire unknown, 12,956 | inverse | 0.034478398 | 0.034502277 | Nonprose |
| Entire unknown, 12,956 | forward | 0.034478398 | 0.034513943 | Nonprose |

All four source-native outputs are near-uniform and their prefixes are unreadable; none resembles ordinary GP English or authentic manuscript plaintext. Reencryption validates the algebra and **cannot authenticate a guessed key**.

[Read-only Windows Node22 full-source CJS reproducer](../sims/lp2_p7_p8_source_quartic_feistel_original_sft.cjs) reconstructs original receivers and exact inverse from `lp2-corpus.json` with actual p7/p8 red products and solved-p57 controls.

[Successful original-input Windows Node22 run 45053554588](https://github.com/FlareZ123/liber-primus/actions/runs/45053554588) independently checks the exact p7 quartic, source p8 title words, both entire unchanged ciphertext scopes, all four reversible decoders and genuine solved-p57 GP plants.

**Decision:** retire this exact 4-round, step3 quartic Feistel receiver as a plain direct cipher. Arbitrary rounds, offsets, retuned keys or extra layers would require new first-party instructions. This is distinct from the already negative P pointwise, PGL2, h field multiplier and 56-page clock consumers.
