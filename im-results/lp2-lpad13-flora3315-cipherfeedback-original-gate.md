# LPAD(13,F) floral ciphertext-feedback: eight original-source inverse candidates

**Agent39, 18 November 2026. Decision: bounded negative.** No previously unknown Liber Primus plaintext, source-authenticated key, or final destination was recovered.

## Why this is an independent candidate

The four original red-span initials on physical LP2 pp3–7 spell `LPAD`. That chapter has 255 printed words, maximum length12, containing exactly 1,145 GP29 runes. Left-padding to width13 with F (GP0) creates 255 × 13 = **3,315** cells, of which 2,170 are hypothetical padding. The original pp40–55 floral chapter has **3,316** runes and begins with an actual red F. Removing just that leading rune leaves **3,315** target symbols. This arithmetic is reproducible but neither width13, the padding letter, the cross-chapter pairing nor the deletion is explicitly instructed by Cicada; therefore the route remains a conjecture.

An earlier test of direct source-key addition and rowwise key-rank sorting was negative ([source-ranked receiver](lp2-lpad13-floral-rankrows-source-gate.md)). This experiment tests a distinct **online invertible ciphertext-feedback** model, with no fitted secret table:

`C[t] = (P[t] + alpha*C[t-1] + beta*K[t]) mod 29`,

where `K` is the 3,315-symbol left-padded original source, `alpha,beta ∈ {-1,+1}`, and the previous ciphertext is either global or reset to F/0 at each 13-cell source row. The p40 red F fixes the global initial state. These sign and row-reset choices give exactly **eight** models, all tested unchanged. There is no search over offsets, extra keys, entropy-selected coordinates, guessed input words or language-scoring parameters.

## Original unchanged ciphertext results

| alpha | beta | Row reset | GP29 IoC |
|---:|---:|:---:|---:|
| -1 | -1 | no | 0.03454752496607018 |
| -1 | -1 | yes | 0.03461925320706250 |
| -1 | +1 | no | 0.03453641983231248 |
| -1 | +1 | yes | 0.03460232242936635 |
| +1 | -1 | no | 0.03495604824725489 |
| +1 | -1 | yes | 0.03480749432682409 |
| +1 | +1 | no | **0.03498335595321644** |
| +1 | +1 | yes | 0.03485100460498948 |

Unchanged target IoC is **0.034459958255620156**. The maximum of all eight candidates remains below **0.035**, far from the source-native solved-p57 tiled English control's IoC above 0.06. The leading 28 GP transliterations of the strongest original inverse are:

`N I W N B TH EO T E U EO L OE T R O M P TH M O I R J C Y I P`.

No candidate has readable contiguous native-GP prose. **All eight** transformations reconstruct the entire 3,315 unchanged original ciphertext symbols by exact forward encryption; **all eight** independently encrypt and recover a 3,315-symbol native-p57-text planted control. Round-trip correctness proves only the implementation, not a historical key. This experiment does not reject other ciphers, pad formats or unknown underlying plaintext registers.

**Decision:** retire this explicit eight-model LPAD + direct ciphertext-feedback family and avoid broadening it through postselected row clocks or phases. A future source-authored selector would be needed to reopen a genuinely distinct inverse.

## Reproduce

Read-only CommonJS/Node22 single-file test: [`sims/lp2_lpad13_flora3315_cipherfeedback_original_sft.cjs`](../sims/lp2_lpad13_flora3315_cipherfeedback_original_sft.cjs). It uses the canonical original LP2 corpus, original ink annotations and the existing page-continuity-correct word parser. It asserts the 255 words, exact source/key lengths, 3,316-target/3,315-body split, all eight original forward identities, eight solved-p57 planted positives and every numerical IoC above. There is no new cryptographic solution in this report.
