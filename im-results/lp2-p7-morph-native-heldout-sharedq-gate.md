# LP2 p7: source-native morphology and all-secret five-tap key recovery

**22 November 2026, Agent37, Director #2133. Decision: a GP29-native morphological control recovers the only available solved 14-rune LP2 holdout without inserting that token, and correctly reconstructs two planted global keys. The seven original long ciphertext words share **no** five-component feedback key under either of the already fixed exact source-product models. No authentic unknown-page plaintext or key was recovered.**

## Causal hypothesis and missing information

The unchanged original p7 five red words have GP29 products **[11,26,8,15,2]**. If they encode a fifth-order feedback recurrence, the seven original intact words of 13/14 GP runes can eliminate hidden initialization and all constant affine offsets to recover a putative shared driver q. Earlier projective tests used a TextBlob lexicon that did **not** contain solved LP2 p57's authentic 14-rune **CIRCUMFERENCES**, then enlarged it to 29,229 long dictionary entries. One weak, postselected q-only coincidence remained among p16/p52; its different output multipliers a and null expectation prevent calling it a key. [Existing full-English fixed-equation report](lp2-p7-cipherdriven-fivetap-projective-original-gate.md).

The precise upstream weakness is incomplete native text vocabulary, especially Cicada's GP-specific IO and ING rune mergers. Use the already calibrated `encodeSourceNativeGP` spelling rule, previously exact on **181 aligned LP1 p10–13 words** and all **95 original clear p57 runes**. The only source-authenticated solved word of GP length 13 or 14 available to withhold is **CIRCUMFERENCES (14)** in original p57; there are **zero** other independent solved 13/14-rune words to run a multiword long-register recall holdout. That limitation prevents any broad English-coverage claim.

## Independent morphological source train and held-out observation

Train on previously pinned TextBlob token counts, source-transcribed Shakespeare, Emerson, Gibran, Blake, and solved LP1 translation excluding p57. Hold the exact lexical token `circumferences` out from **every input source**, with Windows CRLF-normalized section parsing. TextBlob does contain the singular **circumference**, count **2**, although it lacks its plural. The independently justified singular-to-plural noun morphology, calibrated on LP1 printed inflections PRIMES/ILLUSIONS/REALITIES, derives CIRCUMFERENCES. The exact 14-GP-rune result matches the original held-out p57 ciphertext-independent clear-runic substring. It is a valid original-source spelling check, with no claim to prediction of an unknown LP2 word.

The frozen union comprises **508 candidate GP13 words and 214 GP14 words**, of which **122** tokens enter through strictly defined noun morphology. This is far smaller and more source-focused than the prior **17,772 GP13 + 11,457 GP14 = 29,229** unfiltered DWYL control. Importantly, the earlier large corpus already included CIRCUMFERENCES; this work improves a TextBlob-based holdout, while its smaller family cannot supersede the larger lexicon's coverage.

## Exact feedback model and positive calibration

For each original word, solve the same published GF29 equations with ω=[11,26,8,15,2]:

    K_i = Σ_j ω_j K_(i−j) + Σ_j q_j D_(i−j) + r
    C_i = a P_i + b + K_i, a∈1..28,

with D=C (ciphertext-driven) or D=P (plaintext autokey). Differences of fifth-order innovations at positions 5+ cancel all five hidden initial K values and b,r. Each candidate plaintext of length n=13/14 gives n−6 linear equations in six unknowns (five q_j and a). Exact GF29 Gaussian elimination recovers a unique shared parameter vector whenever the matrix has full rank.

For both driver families, **four independent genuine encryption/recovery pairs** (two different solved-native GP words × two modes) recover planted q=[7,14,4,25,9] and a=7 exactly. A whole **722-word** source lexicon scan across the two encrypted words gives exactly **one** common q when both use this key, the true vector, and **zero** spurious common q. An independent different-q negative plant gives **zero** common q in either mode. These are controls on the test's capacity to recover an actual reused key rather than dictionary coincidences; they are not original plaintext.

## Unchanged LP2 original-seven result

| Physical LP2 page | GP word length | Ciphertext-feedback candidate native words | Plaintext-feedback candidate native words |
| ---: | ---: | ---: | ---: |
| 11 | 13 | 12 | 21 |
| 13 | 14 | 0 | 0 |
| 16 | 13 | 13 | 19 |
| 25 | 14 | 1 | 0 |
| 43 | 14 | 0 | 0 |
| 52 | 13 | 27 | 14 |
| 55 | 13 | 11 | 19 |

**Shared q across any two original words: zero under ciphertext feedback, zero under plaintext feedback.** Shared q+a also zero. Per-word compatible lexical forms above have been algebraically fitted to one word alone; none is authenticated plaintext. As the 722-entry lexicon is finite and narrower than the prior 29,229-source list, the original p13/p43 14-rune no-match rows are **dictionary-conditional**, never proof that an arbitrary English word or another cipher could not exist.

## Reproduction and research decision

[Standalone original-input SFT](../sims/lp2_p7_morph_native_sharedq_holdout_sft.cjs) reproduces GP spelling, held-out p57 word, five red products inherited unchanged from the published equation, synthetic positive/negative key census and all seven original words. [Windows Node22 independent PASS, run 44968608313](https://github.com/FlareZ123/liber-primus/actions/runs/44968608313), source scripts and repository originals only. This **does not** reopen the earlier p7 feedback family: the evidence still does not select the model as Cicada's original cipher, and expanding a dictionary solely to manufacture more single-word fits is not useful. A future decision would require first-party additional long plaintext, a source-selected q, or a ciphertext-independent key receiver with a multiword holdout.
