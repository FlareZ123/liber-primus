# Original p39 T6 six-phase rotor with independent per-word alphabets: exact all-key word-pattern gate

**18 November 2026 · Agent18 · new bounded original-cipher decision.** No unknown LP2 plaintext or creator key recovered. Six specifically defined, plausible enlargements of the earlier p39 T6 rotor are ruled out for a 29,088-entry *source-native GP English* plaintext register. The model allows **an unrelated arbitrary GP29 alphabet permutation for every one of the 2,896 printed words**. Its only shared secret is a six-phase rotor setting, whose full 28^5 effective space is covered exactly. The test therefore rules out more than global or per-page frequency obstructions.

## Source-selected motive and key objection

The existing original-word lag-six match is T(x)=24−2x (mod29), 80/1,290 within-word pairs; T is a fixed point on index8/H plus one 28-cycle on the other symbols. The red p39 polynomial factors around its index24 relation, but the T6 map was found computationally *before* that historical link. An imagined cipher could apply a T rotor once every six runes while concealing each word through a different secret initial alphabet. This explains why a correct rotor could give 80 six-back echoes despite globally near-uniform ciphertext frequencies. A static single-alphabet or per-page-alphabet version has already been excluded in [the earlier p39 rotor source test](lp2-p39-sixback-affine-split-source-gate.md).

The strongest unsupported premise remains the **unauthored six-slot rotor opcode**. This SFT is a necessary-condition check on a motivated, fully specified family; it does not authenticate p39 as a key instruction or imply that an English lexicon covers the unknown text.

## Exact complete family tested

For every original printed word w with GP plaintext P and original ciphertext C, permit

    C[w,i] = T^(sign * (floor(n[w,i]/6) + k[n[w,i] mod 6]))( S[w](P[w,i]) )

where sign is +1 or −1, the position n uses (a) word-local, (b) continuous book-global or (c) physical-page-local counting, and S[w] is **any independently secret permutation of all 29 GP runes**, differing freely between words. Six phase offsets k[0..5] are shared across the book. One global T power can always be absorbed into every S[w], so k[0]=0 without loss and the effective space has **28^5 = 17,210,368 assignments** for each of six clock/sign combinations.

After undoing a phase key, S[w] preserves every repeated-letter equality pattern within that word. Equality patterns are thus **independent of all 2,896 unknown permutations**. For a candidate original 14-rune ciphertext word to be a valid native-GP English word, its decoded first-occurrence equality shape must match one of the **159 distinct GP equality shapes** of the **162 actual length-14 words** in the pinned 29,088-entry TextBlob English reference register. The reference uses the repository's existing GP-native spellings and source corpus parser, not an improvised Latin26 substitution.

The original LP2 length-14 ciphertext words occur at printed word indices **754, 1353, 2341**, starting at global rune offsets **3405, 6035, 10453**. Their cipher indices, word boundaries, and page positions are read directly from the unchanged source. All three must fit *under the same shared six-phase offsets*.

An exact modular constraint graph is formed for each possible native shape of the first word. If source positions i,j are equal in the hypothesized plaintext, the 28-cycle logs require a specific difference k[phase(j)]−k[phase(i)] mod28; H/index8 remains a fixed point. Contradictory equations and fixed-point patterns are rejected analytically. Every remaining free graph component is enumerated over all 28 possibilities; candidate keys undergo full equality-shape checks on the first, second and third source 14-rune words. This is a **complete algebraically pruned search**, rather than a sample of the 17 million possible phase keys.

## Original-input outcomes

| Clock | T exponent sign | Consistent graph assignments enumerated | First 14-rune word matches | First two match | All three match |
|---|---:|---:|---:|---:|---:|
| Printed word | + | 786,249 | 6,419 | 20 | **0** |
| Printed word | − | 741,531 | 46,003 | 101 | **0** |
| Global rune | + | 786,249 | 6,419 | 24 | **0** |
| Global rune | − | 741,531 | 46,003 | 67 | **0** |
| Physical page | + | 786,249 | 6,419 | 11 | **0** |
| Physical page | − | 741,531 | 46,003 | 140 | **0** |

The first-two survivor counts are useful for proving that the final word is a real independent gate; these are not prospective plaintext candidates. The result is absolute relative to the declared reference lexicon and original characters: not one shared six-phase key is compatible with all three 14-rune English word patterns, even when every word gets its own unrelated full 29! alphabet.

The [single-file CJS SFT](../sims/lp2_p39_t6_sixphase_anywordalphabet_sft.cjs) reads only committed source data. It includes independently encrypted native GP14 synthetic plants under three different per-word affine alphabets (strict subsets of the allowed arbitrary secret permutations), tests the generated 14-rune words against the same full key-search algorithm, asserts the six frozen original count rows above and prints machine-checkable results.

## Research decision

The specified T6 six-phase cipher is **not** a native GP-English decoder for the manuscript with unchanged printed word boundaries, whatever six shared offsets and whatever independently secret word alphabets are supplied. The simpler static-base and one-base-per-page versions had already failed; this advances the all-secret exclusion without tuning more source-less rotor variants.

This does **not** exclude word-dependent rotor offsets, a non-six-phase evolving alphabet, nonlinear state feedback, an external unknown vocabulary, altered original word placement, non-English plaintext, or actual cipher clues independent of the postselected T6 statistic. It gives no decrypted unknown rune, key or destination. A further T6 extension requires an independent authored source rule or an exact original plaintext readout capable of distinguishing itself from the many freely keyed alternatives. Existing [integrated original-cipher challenge](../workplace/integrated-original-inversion-challenge.md) remains the broader decision frontier.
