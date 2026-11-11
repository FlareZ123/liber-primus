# Seventh-onion HTML 133/331 and historical 7×7 center

**Classification:** exact source concordance with bounded original-input negative tests. No unknown LP2 plaintext, authentic decryption key, or historical instruction to apply these numbers has been recovered.

## Direct historical-source link

The seventh 2014 onion delivery page preserved in `resources/cicada2014-onion7-index.html` begins with `<head><title>133</title></head><body><div id="331">`, followed by the 58 original book-page images. Its contemporaneous 2014 archive is a surviving witness, without a raw HTTP packet capture or independent signature over the HTML.

The archived OpenPuff source `resources/cicada2014-openpuff-magic-squares.txt` has three ordered squares. Its **middle 7×7 square**, magic sum **1033**, has exact center **331**, matching the HTML `div id`. The HTML title **133** reverses the center's decimal digits. These features can be selected from historical source material before consulting LP2 unknown ciphertext.

Further exact arithmetic is **retrospectively noticed**:

- `133+331=464=16×29`, and prime number 464 is **3301**, the digit-reversed historical sum 1033;
- prime number 174 is **1033**, yielding the previously known difference `464−174=10×29`;
- reversing decimal digits in *all 49 cells* of the middle square preserves one diagonal sum **1033** and changes the opposite diagonal sum to **727**. The resulting square is no longer magic: its row sums are `[1627,1078,1528,511,1528,1078,1627]`.

None of these relationships supplies a documented operation or uniquely selects a key. Source-recognition is more plausible than an unrestricted numeric puzzle; the archive contains no signed instruction to add, reverse every cell, or apply a corresponding prime clock to LP2.

## Original text independently specifies 19 and 7

The solved PARABLE body has **exactly 19 printed words**: seven words in its first sentence, then six in each remaining sentence, yielding clause word counts **[heading: 1, body: 7, 6, 6]**. The opening sentence is **LIKE THE INSTAR TUNNELING TO THE SURFACE**. These are observable from original rune word separators with no cipher hypothesis or numeric factorization.

The two text counts provide an exact **source-first generative candidate**:

`[body_words², first_sentence_words × body_words, prime(prime(body_words))]`

`= [19², 7×19, prime(prime(19))] = [361,133,331]`.

These are exactly the three previously recognized PARABLE GP-prime body-clause remainders modulo heading sum **449**, in printed order. The last two match the later archived seventh-onion HTML title **133** and element id **331**. The first sentence's seven words directly provide the order of the unique historical 7×7 OpenPuff square, and 331 is its center.

This is a substantially more *source-constrained explanation of why 19 and 7 arise* than inferring them from 361 and 133 alone. Choosing the squared/product/nested-prime functions and the heading-sum modulus remains a retrospective mathematical model with no authenticated instruction. The arithmetic may reflect a designed cross-artifact clue; it has not yielded an unknown-page plaintext, key or destination.

A second, independently checkable number-to-text structure uses the **three** body sentences and the repeated **six-word** lengths of the final two sentences with the original GP alphabet size **29**: the **(3×29)th prime is 449**, exactly the heading's GP-prime sum, while the **(6×29)th prime is 1033**, exactly the historical middle 7×7 square's magic constant. This provides an additional source-first route to both the modulus 449 and the specific 1033 square. The factors three/six occur literally in the original text; multiplying by 29 before taking a prime is still a selected interpretation. These arithmetic matches are not evidence of a cipher key absent an explicit extraction rule. The consolidated standalone source test asserts both equalities from original word separators and the original square.

## The formerly unused PARABLE residual selects square order 7

A separate [original solved-p57 source check](../sims/parable_449_onion7_header_modulo_sft.cjs) establishes that the solved *PARABLE* heading's GP prime sum is **449** and the three printed body-clause prime sums are **1259, 1031, 1229**. Their remainders modulo the heading are exactly **[361,133,331]** in textual order. This explains why the **last two** results appear as the historical Onion7 HTML title/id, though author intent is still unproved.

The previously unexplained **first** remainder 361 has a further simple, fully source-constrained role **when the third residual is interpreted as the 7×7 square center**:

- **361 = 19 × 19**;
- **133 = 7 × 19**;
- the common factor **gcd(361,133)=19**, and **133/gcd(361,133)=7**;
- the resulting **order 7** picks the *middle* OpenPuff magic square from the three archived orders **5,7,5**, and the final remainder **331** is exactly its central cell.
- **19→67→331** under the explicitly used Cicada ordinal-prime operation: `prime(19)=67` and `prime(67)=331`. Therefore the three body residues have the compact source-generating form **[19², 7×19, prime(prime(19))]**. The nested-prime equality links the **19** factor to the **331** center without using the intermediate archive value to select that map.
- the original LP2 physical p0 first **13 red ciphertext runes** have GP-prime sum **662=2×331**, an additional exact header relation already reported in [Agent 42's source audit](../im-results/onion7-html-red331-source-inversion.md). This is independent original ciphertext, though numeric reuses of 331 cannot be counted as separate discoveries of an encryption key.

Thus all three PARABLE residues jointly specify **19, square order 7, center 331** through an elementary common-factor operation, while two residues also reproduce the archived HTML labels. **This is a new algebraic interpretation of the same already selected modulo-449 residues**, rather than another independent statistical confirmation; computing gcd and factoring the residuals were selected after knowing the answer candidate. There is still no source-specified cipher inversion that uses the factor 19 or a verified role for it as GP prime W.

The entire source relation is reproduced from original artifacts by [the standalone nested-prime/PARABLE SFT](../sims/onion7_parable19_nestedprime_sft.cjs) ([passed original-source CI](https://github.com/FlareZ123/liber-primus/actions/runs/42934735544)).

An intended human solve route might recognize `361=19²`, then factor `133=19×7`, locate the 7×7 prior square, and confirm its center331 against the HTML. The exact observations merit testing as an explicit source hypothesis; they do not authenticate the creator's intent or recover unknown plaintext.

## Correct original LP1 JPEG-05 construction

The complete original `resources/liber-primus/05.jpg` has SHA-256 `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7` and **673,066 bytes**. It consists of **336,353 JPEG bytes** ending `FFD9`, then **360 central bytes** (two newlines and 358 hexadecimal characters), then a reversed copy of *all 336,353 JPEG bytes*. Reversing the 358 hex characters and decoding gives a 179-byte text rendition of the historical **5×5 sum-1033 square**, center **91**.

This file structure had already been established by [the prior JPEG-05 source reproducer](../sims/jpeg05_hidden179_p53_direct_key_sft.cjs). An apparent final **72,700-byte** reversed prefix is only an arbitrarily truncated subset of the entire 336,353-byte reversal. It furnishes **no independent connection** to 727. The earlier proposed 72700-to-727 inference is rejected.

## Original LP2 source-prime inverse

The reproducible test fixes the **authentically solved p56 prime-totient cipher**, literal F / non-consuming convention, and a single independent GP29 trigram scorer trained on 324,926 runes of the archived Emerson text. The 85-rune solved p56 control uniquely recovers the published plaintext at F-mask 8 among its 32 visible-F masks, with score **−2.422103999** nats/rune.

On **original LP2 physical page 0**, containing 262 cipher runes and 14 F occurrences, all **16,384 visible-F masks** were checked for each of five original-source-constrained starting prime indices. The best scores are:

| Starting prime ordinal | Prime | Best F mask | GP trigram score, nats/rune |
| ---: | ---: | ---: | ---: |
| 1 (historical baseline) | 2 | 16382 | −4.069011461 |
| 129 (reverse-square diagonal) | 727 | 8007 | −4.057922796 |
| 133 (HTML title) | 751 | 16164 | −4.056566760 |
| 331 (HTML div) | 2221 | 10984 | −4.036288949 |
| 464 (title + div) | 3301 | 13056 | −4.148568837 |

Raw p0 under the same scoring model is **−4.185337102**. All five best outputs remain nonlinguistic, far below authentic p56. Every output exactly re-encrypts original p0, an implementation invariant true for arbitrary wrong keys in these bijective models. These tests fail to support *direct transplantation* of p56's prime-totient cipher using those starting indices. They do not exclude other cipher families, historical source instructions, or multilayer text.

**Reproduction:** [single runnable source-and-original test](../sims/onion7_magic_center_reversal_sft.cjs); [successful manual Node22 CI](https://github.com/FlareZ123/liber-primus/actions/runs/42932193081), existing `grid-256-tests.yml` `onion7-magic` probe.

## Digit-reversed 7×7 source matrix on the seven illustrated pages

A second source-constrained test interprets the HTML title's reversal as an instruction to reverse the **decimal digits of all 49 values** in the earlier 7×7 OpenPuff square. Both the historical and the digit-reversed 7×7 matrices are invertible modulo **29** (determinants 2 and 25 mod29). A candidate Hill-style decoder was run on the original, source-enclosed **1,589 = 7×227** GP29 ciphertext runes from p33 offset91 through p39, where the identical 1033/3301 cuneiform header appears on seven physical pages.

The exact finite experiment covers both matrices, four distinct D4 row/column/transpose orientations per matrix, adjacent seven-rune blocks versus seven interleaved lanes, and direct versus inverse matrix application: **32 unique settings**. Every original-input setting exactly re-encrypts the authentic ciphertext using the paired inverse. Independent Shakespeare-GP plants of the same length, encoded with the **digit-reversed square itself**, recover **1,589/1,589** symbols exactly under both layouts. The same Emerson-trained GP trigram model scores those native controls **−2.407645864** with IoC **0.0617810**.

Original input scores:

| Source matrix | Best trigram score, nats/rune | Best output IoC | Reading |
| --- | ---: | ---: | --- |
| Raw original ciphertext | −4.233558632 | 0.0343498 | Original random-like baseline |
| Unmodified 7×7 square | −4.215962218 | 0.0345408 | No plaintext |
| Digit-reversed 7×7 square | −4.203346862 | 0.0345091 | No plaintext |
| Source-key native planted control | −2.407645864 | 0.0617810 | Exact English restoration |

A slightly better score relative to raw ciphertext is insufficient to indicate a correct key. Decoded examples remain nonlinguistic and their coincidence stays near GP29 uniform. This retires the specific **fixed direct-GP29 Hill7 family on the seven-page passage**, including source-digit reversal. It does not address an evolving key, different plaintext alphabet, page-specific framing or non-Hill operations.

**Reproducer:** [source-driven original 7×7 Hill test](../sims/onion7_reverse_square_hill7_sft.cjs); [successful manual CI, both source experiments](https://github.com/FlareZ123/liber-primus/actions/runs/42933131705).

## Next useful question

The strongest new historical lead is the direct **HTML id331 → 7×7 square center 331** selection, with the HTML title supplying a reversal. Was this an intended human-solvable pointer to a particular earlier magic square or arrangement? Search first for an independently authenticated stage-six/stage-seven instruction that selects an **operation**, not only a number. Any new decoder should be specified from that source instruction and should make a specific original-cipher prediction before language-based model selection. The direct source-prime and reversed-square Hill interpretations above have already failed.

More arbitrary digit permutations, suffix-length matches, or unconstrained direct keys offer little additional discriminatory power.
