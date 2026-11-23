# P28/P29 DH-framed 269-rune paired-page inverse: all-secret affine-scaled shared pad fails intact GP-native words

**Agent41, 23 November 2026. Supporting finite negative decision, not recovered plaintext.** The known Cicada DH arithmetic and the original p29 page frame make a same-clock two-page key hypothesis worth one source-exact attempt. This study finds no unknown LP2 plaintext, authenticated key or complete page cipher. It closes the entire original-word-preserving **affine-scaled** shared-pad law with arbitrary secret pad and arbitrary nonzero relative multiplier, leaving nonlinear, independently keyed, different-register and resegmented constructions open.

## Why these two original pages

The original GP29 transcription supplies **269 p28 runes** and **277 p29 runes**. An independently reported p29 edge construction gives prefix GP0 **[2,23]** and suffix **[5,18,12,6,8,19]**, matching the known 2013 miniature DH parameters under a provisional source mapping. Removing those exactly nominated two plus six frame glyphs leaves **269 p29 interior runes**, aligned one-for-one with p28. The frame and the prior p29 polynomial G(X) divisibility are separate arithmetic/source facts, with no authenticated instruction that a shared stream pad is intended. See the pre-existing [p29 frame SFT](../sims/lp2_p29_dhframe_p28_original_sft.cjs) and [p28/p33/p29 polynomial syndrome follow-up](lp2-p28-p33-p29-dh-cubic-syndrome-gate.md).

A historically plausible symmetric-key handoff would encrypt two plaintext messages under the same per-position pad in a DH-derived session. This is a concrete rival, rather than an assumption that p29's body is known plaintext.

## Fully secret pad eliminated before language optimization

Write the original unchanged GP29 indices as C28[t] and C29[t], 0 ≤ t < 269, after stripping the p29 frame. Test both explicit laws:

~~~
C28[t] = s*P28[t] + K[t] + a  (mod 29)
C29[t] = s*P29[t] + K[t] + b  (mod 29)
s ∈ {+1,-1}; a,b ∈ GF(29); K[t] completely arbitrary.
~~~

Subtracting eliminates the entire secret 269-rune pad for either orientation:

~~~
Δ[t] = C28[t] - C29[t]
P29[t] = P28[t] - s*Δ[t] + s*(a-b)  (mod 29)
~~~

Thus a possible complete solution must select **one of only 29 relative offsets** that works for every exact overlapping pair of independent printed source words.

Source word offsets are reconstructed character by character from the original transcription and checked against both canonical corpus arrays. Undecidable first/last page fragments are excluded. The remaining word sets contain **57 p28 words**, **67 p29 interior words** and **20 distinct aligned overlaps of at least four runes**, four of width six. The bounded test uses both exact GP conversions of the checked-in English frequency dictionary (standard longest-prefix runes and an additional historical ING/IO contraction treatment). Distinct lexicon types by length: **5,217 GP6**, **5,451 GP7**, **1,886 GP11**. All types for the required full word lengths are admitted, not only high-frequency candidates.

For each original overlap, enumerate every matching dictionary-word pair for both original full-word lengths and their exact partial overlap, **all 29 relative shifts**, and both s values. At original zero-based aligned starting offsets:

| start | overlap width | original word GP lengths | admissible offsets, s=+1 | admissible offsets, s=−1 |
|---:|---:|---:|---:|---:|
| **20** | **6** | 7 and 6 | **none** | **none** |
| **45** | **6** | 6 and 11 | **none** | **none** |
| 65 | 6 | 7 and 6 | [7] | none |
| 219 | 6 | 11 and 6 | [11] | [18] |

The first two untouched six-rune overlaps already exclude **every** shared K[t], both arithmetic signs and all fixed relative page shifts in this stated model, **if** the original printed word breaks represent source-native GP29 English words within the tested vocabulary. Additional independent overlaps cannot rescue a rule requiring every span simultaneously.

### All-secret nonzero-scaling extension: every GF29 multiplier excluded

A natural follow-up is that two DH-associated pages need not use the exact same pad value at each position. Grant a completely unknown **invertible scalar gain** independently connecting their pads:

~~~
C28[t] = s*P28[t] + K[t]   + a  (mod29)
C29[t] = s*P29[t] + λ*K[t] + b  (mod29)
λ ∈ {1,2,...,28} any fixed secret nonzero field element.
~~~

The pad again disappears algebraically:

~~~
P29[t] = λ*P28[t] + s*(C29[t] - λ*C28[t]) + s*(λ*a - b).
~~~

For each **all 28 nonzero GF29 gains**, **both signs**, **all 29 relative affine shifts**, evaluate the four untouched six-rune source-word overlaps at zero-based offsets [20,45,65,219]. The four spans suffice: **zero of the 56 gain/orientation combinations admits a single shift common to all four source-vocabulary overlaps.** In 54 of 56 cases, one of the four spans has **no** compatible word pair even when its page offset is chosen separately; for the two exceptional candidates (gain5,+) and (gain26,+), each span has one individually possible shift, but those four shifts disagree. This is an exact finite-dictionary elimination for a whole **all-secret** 28×2×29 family; the same language and intact-boundary caveats apply. It also covers the source-DH-shaped gains 2,5,6,8,15,19,23 without asserting that a DH operand is an authored field multiplier.

A distinct additional positive controls this stronger inverse. Two freshly planted original-word-template pairs use **non-unit gains 2,5,19**, both orientations, unequal page offsets 7 and 11, and independent arbitrary 269-rune pads. **All 240/240 word-overlap shift predictions pass**; the synthetic ciphertexts recover exactly under the chosen gain and arbitrary pad. This extension ran successfully under Windows Node22 ([45169848279](https://github.com/FlareZ123/liber-primus/actions/runs/45169848279)). The earlier 120/120 pure shared-pad and 6,000 donor window checks remain positive as before. The χ² donor rank measures the *unscaled λ=1* difference only; it is not an empirical null probability for the all-gain family.

## Positive checks and English contrast

The standalone SFT first constructs three independent GP-English-dictionary planted messages for each original page-word template, adds a wholly arbitrary common 269-rune pad, tests both signs with unequal page offsets 7 and 11, and verifies **120/120** shared-pad word-overlap predictions, plus every symbol's exact inverse. Thus the missing original word matches are not caused by a page-slicing or pad-cancellation mistake.

Without a vocabulary, the original 269-position difference has **29-way Pearson χ² = 20.676579925650554** (28 degrees of freedom) and nine zero differences. A source-independent contrast draws **6,000 frozen GP29 English paired windows** of the same length from checked-in Gibran, Shakespeare and Emerson texts. Their difference χ² median is **40.728624535315994**; only **74/6,000 (1.2333%)** lie at or below the original. This is an empirical matched-donor rank for the unscaled λ=1 case, not an unconditional hypothesis p-value: language, GP spelling and source page selection may matter. It independently disfavors the direct two-time-pad story, without pretending finite donor controls enumerate all prose.

A further paired-stream Viterbi test found no sustained page prose, but its withheld native-English positives recovered only roughly 15–25% of their letters under a weak second-order model. This is an **underpowered language-recovery experiment**, not the basis for the negative conclusion. Stronger language models would not repair the two exact vocabulary-overlap incompatibilities without changing the assumed word/lexicon register.

## Decision and next original-input fork

The 2|269|6 frame remains an original-source observation. It does not authorize more arbitrary pad searches. Under the tested **all-secret affine-scaled** common-pad family, the unknown keystream cancels exactly, and four disjoint original six-rune word overlaps have no consistent source-native dictionary solution for any allowed gain, sign or offset. A future attempt needs a creator-visible instruction for a **different receiver**: a nonadditive/nonstationary operation, explicit changing of printed word boundaries, or a meaning of the frame as control instructions instead of paired ciphertext. Do not infer plaintext from the length coincidence or from a key that perfectly round-trips its own output.

## Reproduction

- [Read-only Windows Node 22 SFT](../sims/lp2_p28_p29_dhframe_twotimepad_original_sft.cjs)
- Original [corpus](../resources/liber-primus/lp2-corpus.json) and [transcription](../resources/liber-primus/lp2-transcription.txt)
- English donors and dictionary from resources/control/
- **Verified source and planted SFT PASS:** [Windows Node22 scaled all-gain run 45169848279](https://github.com/FlareZ123/liber-primus/actions/runs/45169848279), [original unscaled run 45167621494](https://github.com/FlareZ123/liber-primus/actions/runs/45167621494)
- [Manual Windows workflow](../.github/workflows/lp2-p28-p29-twotimepad-original-manual.yml)

Classification: new **scoped all-secret relative-gain exclusion** of a source-prompted paired-message architecture under fixed GP-native English words; zero authenticated unknown LP2 plaintext runes recovered.
