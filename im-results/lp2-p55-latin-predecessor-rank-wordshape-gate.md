# Physical p55 stationary Latin26 predecessor-rank code: source word-shape gate

**Agent14, 13 November 2026. Director #741 decision:** The proposed stationary 25→28 predecessor-relative rank substitution is incompatible with native Latin26 English drawn from the four independently checked reference texts. The exact reversible hypothesis and 75-rune source segmentation are preserved. **No unknown LP2 plaintext, authentic key, or decoded instruction was recovered.** This excludes only the specified stationary cipher on the checked language controls, not changing-state keys, homophonic transformations, or invented words.

## Original source and key-independent invariant

The canonical [physical p55 transcription](../resources/liber-primus/lp2-transcription.txt) has one incoming p54 rune (GP index21) and 75 body runes in 16 complete words with lengths **[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]**. With previous original ciphertext index H, convert the next ciphertext index C into rank 28 if C=H (hypothetical literal Latin letter K), or otherwise rank R=C−1[C>H] in 0…27. All 28 nonrepeat successors are the ordinary 29 GP runes with H removed. A secret, stationary *injective* 25-Latin-letter→28-rank map cannot change equality or inequality of non-K plaintext letters.

The original p55 **seventh body word** occurs at zero-based body offsets **22–34**, wholly inside the first45 training region. Its source ranks are:

    [16,27,0,13,10,18,1,4,12,8,20,20,12]

They contain no literal-K marker (rank28) and have the exact mandatory Latin13 within-word equality shape:

    [0,1,2,3,4,5,6,7,8,9,10,10,8]

That demands **11 distinct plaintext letters**, with positions 10=11 and 8=12 and all other symbol classes unequal. Every possible secret alphabet injection preserves this shape. It can therefore be checked against full Latin words before guessing any key.

| Original-control native Latin register | Word tokens | 13-letter tokens | Exact shape matches |
| --- | ---: | ---: | ---: |
| Gibran, The Prophet | 15,733 | 18 | 0 |
| Shakespeare control | 55,407 | 29 | 0 |
| Emerson, Essays | 77,932 | 241 | 0 |
| Solved Cicada LP1 reference | 875 | 3 | 0 |

An independent pronunciation-dictionary screen of **1,578 distinct 13-letter CMU words** also found **zero exact shape matches**. The only word meeting the two specific repeat equalities without satisfying the other necessary inequalities is *MASSACHUSETTS*. This supplementary dictionary census is illustrative, not a proof that a suitable obscure or invented English word does not exist.

## Planted positives and selection-matched controls

[Exact original-input CommonJS SFT](../sims/lp2_p55_latin_rank_wordshape_sft.cjs) implements both predecessor-rank directions with the unchanged incoming p54 carry and an arbitrary nontrivial 25-to-28 injective key. It reconstructs **75/75 source-length-matched native Latin plant symbols** from each of the four control corpora; a forced-K plant separately exercises the repeat event. It asserts every original p55 rune, rank, word length, and the 13-letter pattern above.

Independently sample **100,000 sixteen-word planted plaintexts per reference**, with replacement from its authentic words, preserving the original 16 word lengths. The SFT freezes a reproducible 32-bit LCG seed of 0x741a14 plus the corpus index times 0x10101. Compare the key-invariant number of distinct letter classes and the maximum symbol frequency. Original source p55 has **23 distinct ranks, max frequency3** in the first45 and **25 distinct ranks including K, max frequency5** over all75. All 400,000 genuine-prose plants fit the original segmentation and could be losslessly encrypted by a stationary map.

| Corpus / 100,000 plants | First45 distinct≥23 | First45 max≤3 | Both first45 conditions | Both full75 conditions |
| --- | ---: | ---: | ---: | ---: |
| Gibran | 4 | 0 | **0** | **0** |
| Shakespeare | 3 | 1 | **0** | **0** |
| Emerson | 5 | 0 | **0** | **0** |
| Solved LP1 reference | 0 | 0 | **0** | **0** |

This conditional control is deliberately generous in allowing independently sampled words without requiring coherent sentence transitions. It is not a language-independent impossibility proof or a manuscript-wide chance measure. The literal p55 original 13-word constraint offers a more specific failure than the aggregate histogram alone.

The source p55 having only **24 occupied nonrepeat ranks** is in itself ordinary for a short ciphertext. Conditional on 74 nonrepeat steps being iid uniform on 28 ranks, an exact finite occupancy recurrence gives probability **0.09524737506390421** for at most 24 occupied ranks. This rejects inferring a special 25-letter code merely from its combinatorial *capacity* on p55.

## Decision

Do **not** run a huge unconstrained secret-permutation search or change the predeclared seventh-word spelling to rescue this model. In the stated stationary family, every original rank equality is a plaintext equality and cannot be adjusted by key search. An actual solution would need an independently sourced changing codebook, a distinct reversible operation, or an authenticated plaintext containing the unusual seventh word. Neither source-selected mechanism nor original unknown plaintext has emerged.

**Reproduction:** [Source SFT](../sims/lp2_p55_latin_rank_wordshape_sft.cjs); [manual Windows workflow](../.github/workflows/lp2-p55-latin-rank-source-gate.yml); [passing original-source Windows run 43412641162](https://github.com/FlareZ123/liber-primus/actions/runs/43412641162). The complete source-rank, plant, word-shape and occupancy assertions also passed the later [Windows run 43413206644](https://github.com/FlareZ123/liber-primus/actions/runs/43413206644).
