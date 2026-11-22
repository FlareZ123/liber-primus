# P28→p29 prospective G-quotient outer-H plaintext test

**Agent 27, 22 November 2026; Director #2159. Classification: negative original-input test of one source-motivated reversible two-layer receiver.** No unknown plaintext, original key or final destination recovered.

## Why this receiver was selected

The preceding source chain had already identified p28's candidate `READ OUT THE`, a four-complete-word numerical readout `THEIR NUMBERS ARE THE`, and the unique continuation `DIRECTION` at authenticated 2016 word index29. Under the existing zero-based index-to-physical-page proposal, that continuation conditionally selects original physical p29. Independently, the physical p39 red triad yields `G(X)=15X²+5X+27=15(X-24)² mod29`, which divides the original high-first 277-rune p29 polynomial. The solved p57 instruction to shed circumferences and the fixed original-p28 H operator `H(x,y)=(x-y,x+y) mod29` give a possible source-readable second stage.

The weakest premise is combining polynomial division **and then** an outward whole-register H-shell read. No authenticated instruction unambiguously supplies that ordering, and the factor was initially found by a page scan. This is a bounded attempted route to a complete unknown passage, not proof of creator intent.

## Locked operation and original ciphertext

Before examining any decoded p29 output, [the precommit](../workplace/agent27-2159-p29-gfactor-outerh-prospective-precommit.md) fixed the entire operation, its one page, direction and success threshold (commit [0c383d2](https://github.com/FlareZ123/liber-primus/commit/0c383d2d176d05bc439bb6b2a253a067fb41f8ff)).

Input: unmodified `resources/liber-primus/lp2-corpus.json`, physical `pages[29].indices`, 277 GP29 ciphertext indices in printed order.

1. Long-divide the high-first 277-coefficient polynomial by high-first `G=[15,5,27]` over GF29, using `15⁻¹=2`. The exact two-symbol remainder is `[0,0]`. Quotient `Q` has 275 GP symbols.
2. For 137 steps `i=0..136`, take `(Q[i],Q[274-i])` and output `(Q[i]-Q[274-i],Q[i]+Q[274-i]) mod29` in that order. Append the unpaired center `Q[137]` to produce exactly 275 symbols.
3. Reverse the H shells with `H⁻¹(d,s)=[15(d+s),15(s-d)] mod29`, then multiply the restored quotient by G. This reconstructs all **277/277** original ciphertext symbols exactly.
4. Compare the entire unspaced output with original cipher, original quotient, independently solved native-GP p57 and source-calibrated LP1 trigram statistics. Do not select alternative phases, H orientations, residue alphabets, punctuation or inserted spaces.

## Result

| Original input or decoded register | Native-GP trigram log-score, nats per rune | IoC |
| --- | ---: | ---: |
| p29 original ciphertext, 277 | -3.4362408478 | 0.0336943442 |
| p29/G quotient, 275 | -3.4079307126 | 0.0340544127 |
| **Frozen 275-rune H-shell readout** | **-3.4240689504** | **0.0339216987** |
| Solved p57, 95 | -2.4681447142 | 0.0627099664 |
| Source-native LP1 training, 3510 | -2.2607280127 | reference |

The decoded stream starts (GP source-native readable transliteration, spaces intentionally absent):

`EANEOFINGTHOEOEADTHTEEORBGAGWHGOEWYIEAAMYXPOEINGWOMIOPJYSWADPMIFSOEJJTWCEAFUAEOEBROEINGRPIEOTHINGFHOEDIRAEXSHINGFOEAEEAINGWEAGEAXIOJGTEOXUHPAETXGCEONIJXAEFOEPTSGEAUYGPDCNERIBDDXOLRTTE`

No complete meaningful 150-GP-rune unknown passage appears. The output's near-random native-GP score and collision index remain unlike solved source-native prose. The operation is perfectly reversible, but invertibility does not authenticate the key, source interpretation or plaintext. The source-native comparison is a language/register test; it does not eliminate every possible foreign-language or deliberately random intermediate plaintext.

The [read-only CommonJS SFT](../sims/lp2_p28_p29_gfactor_outer_h_prospective_sft.cjs) asserts exact [0,0] original remainder, full forward reconstruction, exact H inversion, and a solved-native 275-symbol planted ciphertext recovery. The original input and language statistics were independently evaluated directly against the current GitHub corpus using the same public source-native encoding and trigram counts. No CI run is claimed for this new script.

## Decision

Reject the exact p29/G plus outward-H whole-register composition as a native-GP plaintext decoder. The existing p28 local `READ OUT THE` and `THEIR NUMBERS ARE THE` readouts remain candidate-level; none selects a full-bodied reversible cipher with an authenticated key/clock. Prior prospective p28→pp30–33 consumers are already negative under their own fixed rules. Do not add another arbitrary G quotient postprocessing layer merely to improve the output.

**Fork:** The p28 word clues would become actionable with a new first-party instruction fixing an operation on the p29 quotient or a genuinely independent long plaintext receiver. Otherwise prioritize independent LP2 routes over further short p28 English echoes.
