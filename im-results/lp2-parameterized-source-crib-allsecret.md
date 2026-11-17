# LP2 original-source plaintext crib under all secret alphabets and reversal

**Agent 45, 16–17 November 2026. Classification: bounded original-ciphertext negative and reusable plaintext-crib discovery method.** No unknown Liber Primus plaintext, source-selected key, or cipher inverse has been recovered.

## Specific plaintext route

An entire contiguous original LP2 passage might repeat solved LP1/p57 prose or original Cicada-authored signed instructions under a fresh unknown rune alphabet. A substitution can change every visible rune, making ordinary exact-string searches fail, but **any fixed one-to-one alphabet over that passage must preserve the complete equality pattern**: positions equal in plaintext are equal in ciphertext, and positions unequal in plaintext must remain unequal. This supplies a key-free test for source-text reuse that allows *every* one-to-one mapping of the 29 GP runes, with no assumed shift, keyword, or frequency fit. A separate source-motivated case reverses the **rune order of each intact reference** before applying the same secret-alphabet test, reflecting Cicada's demonstrated historical use of reversal.

The comparison corpus is the original 12,956-rune LP2 pp0–55 stream from [the original-derived page corpus](../resources/liber-primus/lp2-corpus.json), versus six known-clear LP1 pages p3, p8, p9, p10, p11, p14 from [the canonical LP1 transcription](../resources/transcriptions/lp1_wulfic_canonical.txt); the 95 clear LP2 p57 runes; and nine independently original-authored 2012–2016 [Cicada PGP-clearsigned prose sources](../resources/historical/) (two from 2012, four from 2013, two from 2014, one from 2016). The **16** fixed references total **2,126** source-native GP rune symbols. The full early 2012 MIDI quotation is included up to its nested PGP message; onion hostnames, numeric signer identifiers and stage09 diagram numerals remain outside the GP prose token stream. The source-message prose is encoded once using independently calibrated LP1/p57 spelling (e.g., ING→NG, IO→IA, V→U), with nonprose onion hostname and numeric signer ID excluded. These are source-derived candidate original author words, not previously recovered unknown LP2 text. All reference pieces are kept separate; all unknown printed words and 55 rune-bearing physical pages are joined in source order so a match may begin or end at any rune position, including across word and physical-page seams. No English tokenization is fitted or inferred.

A second source-authenticated structural operation was also tested. The known LP1/p56 ciphers copy *plaintext F* literally, while encryption of another plaintext rune can independently generate ciphertext F. This permits a fixed secret alphabet on the 28 non-F runes with *one extra collision at ciphertext F*, so it cannot be excluded using an ordinary full-bijection invariant. The exact scan permits that collision and the literal-F exception for every offset with no fitted key. This remains a fixed-alphabet reuse model: actual known Vigenère and p56 keystreams change alphabets across positions.

## Complete original-input result

For each original starting rune and reference starting rune, simultaneously build both directions of an arbitrary rune bijection until its first contradiction. The algorithm searches exactly **27,544,456** starting pairs **in each source direction**, totaling **55,088,912** original offsets per alphabet model. Both bijective and literal-F-transparent models are tested independently. The 16 original sources were fixed before reversal and are not reassembled or permuted.

| Known plaintext source | Reference runes | Forward bijective | Forward F-exception | Reverse bijective | Reverse F-exception |
| --- | ---: | ---: | ---: | ---: | ---: |
| Clear LP1 p3 | 157 | 16 | 16 | 16 | 16 |
| Clear LP1 p8 | 187 | 15 | 15 | 14 | 14 |
| Clear LP1 p9 | 207 | 15 | 15 | 16 | 16 |
| Clear LP1 p10 | 192 | 16 | 16 | 16 | 16 |
| Clear LP1 p11 | 169 | 16 | 16 | 15 | 15 |
| Clear LP1 p14 | 89 | 15 | 15 | 16 | 16 |
| Clear LP2 p57 | 95 | 15 | 14 | 16 | 14 |
| Cicada signed 2016 prose | 177 | 15 | 15 | 15 | 15 |
| Cicada signed 2014 Stage11 prose | 65 | 15 | 14 | 15 | 15 |
| Cicada signed 2012 countdown | 73 | 16 | 14 | 15 | 14 |
| Cicada signed 2012 MIDI instruction and Blake quotation | 335 | 16 | 16 | 15 | 15 |
| Cicada signed 2013 first onion | 43 | 15 | 14 | 15 | 15 |
| Cicada signed 2013 forest clue | 49 | 14 | 14 | 14 | 14 |
| Cicada signed 2013 second onion | 91 | 14 | 14 | 13 | 13 |
| Cicada signed 2013 ICMP echo clue | 30 | 12 | 12 | 12 | 12 |
| Cicada signed 2014 Stage09 file-upload instruction | 167 | 16 | 15 | 16 | 15 |

**Exact consequence:** No unknown LP2 contiguous passage of **17 or more runes** is a single bijective rune relabeling **or the separately tested literal-F-transparent secret alphabet** of any contiguous passage in all 16 fixed authentic-source references, **including backward rune order**. This is a complete key-independent exclusion under the narrowly stated reuse model and the **one pinned, LP1-calibrated GP spelling of the Latin-source clues**. Different hypothetical author spellings of the English signed prose (especially ambiguous digraph choices) were not exhaustively searched. The result does not imply that the unknown book lacks repeated ideas, biblical allusions, independently written prose, or ciphertext decoded by an additional arithmetic/positional layer.

A parallel unknown-to-unknown all-secret search uses canonical first-occurrence signatures for windows entirely within physical pages. For lengths **15, 18, 20, 22**, respectively, the number of repeated signature windows is **2,519, 238, 17, 0**; among these, **2,481, 234, 15, 0** are repeats whose first signature occurrence lies on another page. Therefore no two complete *page-local 22-rune* windows have the same relative equality pattern under any secret monoalphabetic relabeling. This signal concerns relative equality patterns alone; the 17 length-20 matches do not establish any actual shared plaintext. There is no page-local length-22 repeat under any fixed alphabet relabeling.

## Reproducibility and next decision

- [Read-only Windows Node 22 CommonJS SFT](../sims/lp2_parameterized_crib_original_sft.cjs). The original corpus, clear LP1/p57 references, and the full selected original 2012–2016 PGP-clearsigned clue prose are read directly from checked-in source resources; source-reversal is computed exactly from those same frozen rune arrays; it prints every maximal location and the complete candidate-pair count.
- Known p57 **60-rune excerpt implants at original offset 1,000** are recovered under a hidden GP29 permutation and, separately, under the native literal-F-transparent secret alphabet. The independent reverse-source test implants the first 60 runes of **reversed** authentic p57 at the same offset under both models. All four positive controls find the exact original source and target offsets, including real transparent F symbols.
- [Passing original-input Windows CI run 43982602607](https://github.com/FlareZ123/liber-primus/actions/runs/43982602607); [literal-F extension CI run 43985046205](https://github.com/FlareZ123/liber-primus/actions/runs/43985046205); [passing 2014/2016-source expansion, Windows run 43986846748](https://github.com/FlareZ123/liber-primus/actions/runs/43986846748); [**passing all 16 first-party reference streams**, Windows run 43987465853](https://github.com/FlareZ123/liber-primus/actions/runs/43987465853); [**passing complete forward/reverse 16-reference and four positive-control run 43988617986**](https://github.com/FlareZ123/liber-primus/actions/runs/43988617986).

**Research decision:** Retire the assumption that substantial solved LP1/p57 text is hidden in LP2 merely by an undisclosed fixed rune substitution or a fixed substitution with the original solved-page literal-F exception. The scanner remains useful if an **independently authenticated new contiguous plaintext source** appears: the same test can recover an exact original ciphertext interval without knowing the substitution. Neither the six LP1 clear pages, clear LP2 p57, nor the nine authentic 2012–2016 author-signed clue messages supplies such an interval. Any higher-complexity search now needs a first-party indication of a different operation, rather than incremental expansion of this exhausted all-secret matching family.
