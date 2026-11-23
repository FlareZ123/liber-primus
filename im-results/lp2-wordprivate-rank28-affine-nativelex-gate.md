# Original LP2 word-private predecessor-exclusion rank28: all 336 affine keys fail native English long words

**Agent39, 23 November 2026. Evidence class: exact finite original-ciphertext/English-lexicon exclusion of a specified reversible mechanism, with independent solved-source positives. No unknown plaintext or authentic key recovered.** The authoritative overall state is [results/README.md](../results/README.md).

## The source-motivated inverse and its concrete rival

All 55 rune-bearing original LP2 unknown pages contain **12,956 GP29 runes and 2,896 complete printed words**. Only 86 successive pairs of runes are identical. The manuscript already names prime numbers and the Euler totient sacred, and GP29 has the natural multiplicative group of order 28; this motivates testing whether the author used **a 28-choice emission alphabet that cannot repeat the preceding printed rune**, with the 29th source symbol reserved for literal echoes. It does not authenticate that hypothesis.

This test offers the proposed decoder extraordinarily favorable degrees of freedom: the **first plaintext rune of every printed word is unknown and wholly unconstrained**; every remaining rune uses one of two standard reversible ways of indexing the 28 nonrepeating successors, followed by an **independently arbitrary invertible affine function modulo 28 for each word**. There are φ(28)·28 = **12·28 = 336 secret keys for each word**. Neither a shared key nor a known word-initial cipher state is required.

For each original ciphertext rune Cᵢ and the preceding original source rune Cᵢ₋₁, define a reserved plaintext EA=28 if Cᵢ=Cᵢ₋₁. Otherwise the raw rank 0..27 is one of:

- **Difference rank:** ((Cᵢ−Cᵢ₋₁) mod 29)−1.
- **Ordinal-skip rank:** Cᵢ−1[Cᵢ>Cᵢ₋₁], numbering the original GP29 order while omitting the previous ciphertext rune.

For every complete word, allow an entirely independent secret a∈{1,3,5,9,11,13,15,17,19,23,25,27} and b∈{0,…,27}. For each nonreserved rank r, the corresponding putative plaintext rune is (ar+b) mod 28; for the reserved rank, EA remains EA. The actual first plaintext rune does not participate in the lexical test. The **entire unknown original ciphertext rune stream** determines Cᵢ₋₁, including every printed word and page transition. This test preserves exactly the book's printed word boundaries.

The rival remains arbitrary word-private secret 28! permutations, other changing-state functions, alternative word segmentation, raw Latin or non-GP plaintext, and different escape handling; the present exclusion does not reach those models.

## Exact original observation

Using repository [canonical GP29 indices](../resources/liber-primus/lp2-corpus.json) and [complete original printed word transcription](../resources/liber-primus/lp2-transcription.txt), enumerate all 336 independent (a,b) possibilities for every original word, comparing the **suffix of that word** to a native-GP29 transliteration of the repository's separately preserved [TextBlob English frequency lexicon](../resources/control/english_wordfreq_textblob.txt). Orthography uses the explicit GP29 tokens including TH, NG, EO, OE, AE, IA, EA, plus the source's ING→NG, IO→IA, QU→CW and C/U/S folds. The experiment includes 28,166 dictionary entries of 4–16 GP29 runes and retains the highest-frequency word for a shared suffix. Because the first rune is ignored, lexicon words are deliberately conflated wherever their suffixes match. This makes the test more permissive.

| Printed complete word length | Original words | Difference-rank: any lexicon word under 336 keys | Ordinal-skip: any lexicon word under 336 keys |
| ---: | ---: | ---: | ---: |
| 5 | 317 | 204 | 201 |
| 6 | 256 | 18 | 13 |
| 7 | 216 | 0 | 0 |
| 8 | 156 | 0 | 0 |
| 9 | 78 | 0 | 0 |
| 10 | 52 | 0 | 0 |
| 11 | 32 | 0 | 0 |
| 12 | 18 | 0 | 0 |
| 13 | 4 | 0 | 0 |
| 14 | 3 | 0 | 0 |
| **7–14 total** | **559** | **0** | **0** |

**Necessary-condition verdict:** Under either named invertible rank map, 559 of 559 long source words cannot be ordinary words in this English lexicon for *any* of their independently private 336 affine GP28 keys, even granting the first rune arbitrary. This is an exact finite-alphabet dictionary exclusion for these stated words, orthography and mechanisms. It is not an asymptotic probability or an exhaustive exclusion of GP29 plaintext alternatives.

## Source-native positives and reproducibility

The read-only [single runnable test](../sims/lp2_wordprivate_rank28_affine_nativelex_sft.cjs) reconstructs the original 12,956-rune stream and all 2,896 printed words, verifies the solved p57 PARABLE GP-native first word, constructs both forward encoders, and checks inverse recovery against native plaintext from **eight solved p57 word/key/mode planted tests per word class (16 total)**, plus **80 independent lexicon-word source-shaped controls**. It enumerates all 336 secret keys per original word without fitting to or replacing any original rune. It asserts every table count above and fails closed on any new original long-word match.

**[Windows-compatible Node22 SFT, GitHub Actions PASS 45152675481](https://github.com/FlareZ123/liber-primus/actions/runs/45152675481)**. Commit for script: [627b1c3](https://github.com/FlareZ123/liber-primus/commit/627b1c3b8517f8afd58cc4baeb508b9e89560cd2).

## Decision for further decryption

Retire further guesswork on **word-private invertible affine maps of fixed predecessor-exclusion rank28** as a direct recovery of native GP English with intact printed words. The architecture cannot recover any of the 559 long original words in the tested dictionary, even with all 336 keys independent at every word. A genuinely novel next step needs a **source-selected changing-state rule, non-affine mapping, alternate plaintext register, or boundary-changing inverse** that escapes this exact obstruction and generates an uninterrupted original plaintext prediction. Do not claim a plaintext solution from the solved-source positive controls.
