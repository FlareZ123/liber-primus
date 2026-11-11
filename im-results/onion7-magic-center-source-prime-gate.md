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

## Historically specified decimal reversal and the 16-cell ring (Agent 45, 11 November 2026)

A specific 2013 puzzle operation narrows the otherwise retrospective PARABLE arithmetic: the documented original telnet `count parable` response was **`449*`**. The star denotes a prime whose decimal reversal is composite; the same server's `number` operation reverses a prime input and lists its factors (for example, `number 283` produces the factors of 382). Therefore the source-defined operation on the later red heading PARABLE is **449 → 944 = 2⁴×59**, with full divisor list **[1,2,4,8,16,59,118,236,472,944]**. The factor **16** matches the inner 5×5 perimeter of the historical middle 7×7 square, a natural object under PARABLE's wording “shed our own circumferences”. Selecting 16 from the possible divisors and choosing that particular ring remain hypotheses: the 2013 server never instructed solvers to apply NUMBER to the later manuscript.

The 2014 Onion7 title/id **133 and 331** are decimal reversals. Under the same original telnet `number` behavior, entering the prime **331** returns the divisors of its reversal **133**, namely **[1,7,19,133]**. The nontrivial factors **7 and 19** are exactly the source-visible opening-sentence word count and entire-body word count of solved p57, giving a contemporaneously demonstrated arithmetic operation for the already known 7×19 relation. This is a more historically motivated way to *recognize* the Parable/Onion7 coincidence, but there is still no authenticated later instruction or new ciphertext plaintext.

An executable consequence of choosing the **16-cell** square circumference is less encouraging: its clockwise printed values are **[223,14,47,293,98,23,65,232] repeated twice**, so any literal numerical key has effective period **eight**. Twelve frozen direct GP29 additive inverses use those same original values, their decimal reversals, or their cumulative prime counts, with both signs and continuous/physical-page clocks. On all **12,956** original unsolved runes the resulting IoC ranges **0.03445557–0.03449451**, versus ciphertext **0.03447840**, and every output remains nonlinguistic. Exact native-Cicada synthetic round trips pass. This excludes only those direct fixed-period uses of the ring; it does not exclude a source-prescribed stateful or nonlinear transform.

The three body-clause sums [1259,1031,1229] and their reversals [9521,1301,9221] are all prime. This should *not* be treated as independent high-significance evidence: **25 of 43** ordinary primes from 1000 through 1299 also have prime reversals, and the sentence sums were already selected by the earlier source correspondence. No authentic unknown-page key or destination has been recovered.

**Sources:** [2013 telnet commands and original responses](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md), original corpus and 2014 magic squares already cited above. **Reproducer:** [2013 reversal / inner-ring original inverse SFT](../sims/cicada2013_parable_reversal_ring_sft.cjs).

## p57 red “PARABLE” explicitly selects the 449 modulus (Agent 42, 11 November 2026)

The p57 ink annotation marks the seven-rune word **PARABLE** in red at offset 0. Its GP-prime weights are **[43, 97, 11, 97, 61, 73, 67]**, summing to **449** exactly. This is the same 449 heading sum used as the modulus in the 19-word Parable body-clause reduction that yields **[361, 133, 331]**. The red word has seven runes, matching the seven words in the first body clause.

This turns the earlier numerical correspondence into a much more plausible human solve path: a solver sees the red word “PARABLE”, converts its runes using the manuscript's prime-weight convention, obtains 449, and is thereby directed to the historical Parable's 19-word structure and the 449-modular clause sums. The resulting 331 is the center of the seven-by-seven magic square and the Onion7 HTML div id; 133 is the HTML title and the 7×19 term. This is source-derived clue evidence, not a decryption of LP2.

The historical continuation also exposes the two square constants **3301** (5×5) and **1033** (7×7). Their natural source-order concatenation is **33011033**, a candidate OpenPuff password now being tested by the JPEG-steganography investigation against its historical MP3 positive control and the LP2 carriers. This is a solve-path hypothesis, not a verified password or extracted payload.

The updated reproducer asserts the red word, exact prime-weight vector, and equality with the 449 heading/modulus: [\`sims/onion7_parable19_nestedprime_sft.cjs\`](../sims/onion7_parable19_nestedprime_sft.cjs).

## Terminal p57 stipple count: apparent Onion7 pointer is GIMP-confounded

**Measurement (Agent 31, 11 November 2026).** On original LP2 p57 image 74.jpg (2400×3600; SHA-256 1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b), 8-connected components in the lower illustration crop x=350..2049, y=1900..3449 total **574** for every integer grayscale threshold from **40 through 200**. The two largest components have areas **12,821** and **1,027** pixels. Excluding those two leaves **572** small stipple components, split at the exact page midline x=1200 into **241 left / 331 right**. The two large components are excluded from the split but included in 574. SECRA describes the dotted insect as a mayfly; this report uses “p57 stipple” to avoid relying on the species label.

**Retrospective numeric matches (low confidence).** **241 is the 53rd prime.** The archived 2014 Onion7 HTML contains 58 image files numbered 0.jpg through 57.jpg; image **53.jpg** exists and is LP2 physical **p53**. The same HTML contains **div id=331**. The right count **331** is also the 67th prime and the exact center of the historical 7×7 / 1033 OpenPuff square. These matches create an apparent route **241 → prime ordinal 53 → Onion7 image 53 / p53**, **331 → div id / square center**, but the numbers were derived from a rendered dot field and the correspondence is retrospective. They are not an authenticated selector.

**Strong external rendering confound.** SECRA's 15 October 2026 report, [Inside Liber Primus](https://secra.tech/research/liber-primus-strongest-findings/), reports that p57's dot positions strongly match the deterministic legacy GIMP Dissolve threshold field: a 268,435,456 offset/orientation/polarity search, **96.0% whole-image F1**, **93.9% held-out F1**, and **166 residual cells** after refinement. Its [supporting measurements](https://secra.tech/research/liber-primus-strongest-findings/evidence/index.html) report 100,000 within-tile randomizations with no comparable alignment. The report identifies the historical GIMP 2.8.10 default seed 314159265 as software behavior, not a puzzle-selected π key. This is evidence for an artwork-rendering fingerprint, not a recovered cipher. The exact 574 component count and 241/331 split have **not** yet been recomputed from SECRA's predicted mask; the external result therefore confounds, but does not by itself prove, that those exact counts are rendering artifacts. Existing repository analysis of GIMP source-field use is in [the source-pad gate](gimp-dissolve-source-pad-gate.md).

**Index-base caveat.** The Onion7 HTML has no image 67: its indices stop at 57. The separate full original image bundle contains 75 files 00.jpg–74.jpg, with LP2 p0–p57 at files 17–74. Under that different numbering, file 53 maps to p36 and file 67 maps to p50; the p53 page is full-bundle file 70. Do not conflate the full-bundle 53/67 lookup with the historical Onion7 HTML's 53/id331 route.

**Exact cross-artifact counts, not yet evidence of intent.** The p57 PARABLE's first body sentence has **7 words**; physical p53 has **51 red runes**; the manuscript has **31 thirteen-dot marks** (30 red and one black). Therefore **574 = 7 × (51 + 31)**. Separately, the two ten-dot marks at p36 offset 99 and p38 offset 186 enclose **553 = 7 × 79** runes across the five numbered passages [139, 91, 98, 96, 129]. With the PARABLE's **3 body sentences**, the same total also satisfies **574 = 7 × (79 + 3) = 553 + 21**. The 553=7×79 text relation is independent of the image rendering; equations that use 574 inherit the GIMP confound.

**Decision and next test.** Preserve the component count as a reproducible measurement, but do not use 241/331, their prime ordinals, the image53/div331 match, or 574=7×82 as an author-selected key/state. The decisive follow-up is narrow: compare the exact crop, component count, midline split and residual components against the SECRA-reconstructed GIMP field. If the field predicts them, retire the page-selector interpretation; if a structured residual survives, analyze only that residual. Do not repeat the 268-million-configuration search or expand raw-dot ordering/selector sweeps.

**Reproducer:** [component-count and numbering audit](../sims/lp2_cicada_stipple_prime_index.py). It reproduces the measured counts and arithmetic; it does not model GIMP Dissolve or establish intent.

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

## The instruction-like circumference language and a sixteen-cell ring

The second six-word PARABLE body sentence reads **WE MUST SHED OUR OWN CIRCUMFERENCES**. The third reads **FIND THE DIVINITY WITHIN AND EMERGE**. One natural reading is to remove concentric square borders from the identified 7×7 OpenPuff square to find its central cell, 331. The 7×7 source has four nested shells with precise cell counts **[24,16,8,1]**, outermost to center. The second shell is the circumference of the inner 5×5 square, containing **16 cells**.

Independently, the 2014 HTML's title/id **133+331=464=16×29**, and the **464th prime is 3301**, exactly the magic sum of the separately delivered **first 5×5 OpenPuff square**. Thus a 7×7-to-5×5 circumference peeling operation motivated by printed words gives an independent geometric way to see the same factor 16 that recovers the first historical square's magic constant. The ring's **16** cell count is a property of any 5×5 perimeter; the motivation to use *that* ring, add the HTML attributes, and select prime indexing remains interpretive. This still supplies no historical encryption operation or newly decrypted LP2 passage.

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

## Root-24 red-span selection and 29-rune candidate key (Agent 42, 11 November 2026)

The p0 red-span prime-weight sum already recorded above is **662 = 2×331**. A further exhaustive check over all **18 annotated red spans** finds exactly three whose GP-prime-weight sum is congruent to the independently anchored p54 Ac / p39 repeated root **24 modulo 29**:

| Page | Red-span start | Rune count | GP-prime sum | Residue |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 0 | 13 | 662 | 24 |
| 15 | 9 | 11 | 430 | 24 |
| 56 | 0 | 5 | 285 | 24 |
| **Total** | — | **29** | **1,377** | — |

The spans are ordered by physical page and by position within page. Their lengths sum exactly to the 29-symbol GP alphabet, and their prime sums total \(1{,}377=27\times51\). The residue distribution across all 18 spans is \(24:3,\ 0:3,\ 17:2\), with the remaining ten residues appearing once each; thus 24 is not the only repeated residue. What distinguishes this triple is the independent root-24 anchor and its exact 29-rune total. The other three residue-zero spans have lengths 9, 8 and 51 (total 68).

This gives a plausible human clue chain: marked red spans → GP prime weights → reduction modulo the alphabet size 29 → root 24 → the p39 grid factor \((X-24)^2\). It also yields a 29-rune sequence by concatenating the three selected spans. The GP-index sequence has 20 distinct symbols; the prime-weight-mod-29 sequence has 18, so neither is a permutation of the alphabet.

I tested the simplest direct use as a repeating Vigenère key: both key representations (GP indices and prime weights mod29), global versus per-page clocks, both additive signs, and either including or preserving the initial two-rune p0 header (16 variants). Every variant exactly recovers a same-length native-GP plant. On original LP2, IoCs remain **0.03446313–0.03454757** and trigram scores **−13.31350 to −13.25674**. The best is **4.8564 nats/rune below** the weakest minimum among 300 same-length native-GP windows (Shakespeare −7.94684; Gibran −8.39546; Emerson −8.40037). The 29-rune sequence is therefore **not** a direct repeating key under these source-fixed readings.

A second conventional use of the same 29-rune key was tested as a stable-tie **columnar transposition**: GP-index versus prime-mod-29 ordering, ascending versus descending, global versus per-page scope, and with versus without the initial two-rune header (16 variants). Each source-derived transposition exactly inverts a same-length native-GP plant, but original trigram scores remain **−13.31539 to −13.26614** with unchanged IoC **0.03447840** (full-book permutation). The best is **4.8658 nats/rune below** the weakest same-length native-GP control-window minimum. The standard keyed-columnar reading therefore also fails.

Reproducer: [\`sims/red_span_prime_residue24_columnar_sft.cjs\`](../sims/red_span_prime_residue24_columnar_sft.cjs).

The residue-24 alignment remains a source-derived clue hypothesis, not a recovered key or plaintext. Its next useful role would need to be selected by an independent instruction (for example, a specified ordering, state update or operation); further unconstrained key transforms would not be justified.

Reproducer: [\`sims/red_span_prime_residue24_key_sft.cjs\`](../sims/red_span_prime_residue24_key_sft.cjs).

## Root-24 selected 29-rune circulant inverse (Agent 32, 11 November 2026)

The same **29 source-selected red runes** have GP-index values `15,8,18,3,6,19,27,0,15,26,18,21,5,20,1,21,9,5,1,17,9,16,0,21,25,11,22,15,4`. Their ordinary **GP-index sum is 378 ≡ 1 (mod 29)**. Their GP-prime residues sum to **14 (mod 29)**. Thus both fixed 29-rune encodings make invertible cyclic-convolution keys over GF(29): in characteristic 29, `X^29−1=(X−1)^29`, so the 29×29 circulant is invertible if and only if its key coefficients have nonzero sum. The index key has circulant determinant 1. These are exact postselection-dependent arithmetic properties; a sum-one result is not independently specified by any known original clue.

A finite original-input test applied the fixed keys as **29-symbol circular convolutions and inverse convolutions**, using original/reversed key order, GP-index/GP-prime-residue keys, whole-book/physical-page clocks and block offsets **0, 2, 13** (the origin, two-rune header and p0's thirteen-rune red heading). Across **48 fully reversible variants**, the decoded original 12,956-rune IoCs were **0.03445057–0.03452897** (raw original **0.03447840**), and decoded adjacent repeats ranged **371–464**. No authentic unknown prose or key was recovered. All **48** original ciphertexts re-encode exactly; four independent deterministic GF(29) plants also invert exactly. Re-encoding establishes implementation fidelity and cannot identify the authentic cipher.

The result **retires these specific direct 29-block cyclic transports**, under the stated unmodified-tail and clock rules. An evolving state, historical prescribed permutation, or a different plaintext register is outside this test. The root-24 span-selection coincidence remains a clue hypothesis rather than a verified decoder.

**Read-only SFT:** [root-24 29-rune circulant gate](../sims/red_span_root24_circulant29_original_sft.cjs). The complete three-step workflow, including this SFT, [passed in manual GitHub Actions run 42948043076](https://github.com/FlareZ123/liber-primus/actions/runs/42948043076).
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

Can the published GIMP Dissolve reconstruction predict the exact p57 crop's 574 connected components and 241/331 split? Obtain or reproduce the predicted threshold mask, run the same component extraction, and isolate the 166-cell residual. If the count and split are predicted by the software field, retire the prime/index and 7×82 interpretations; if not, inspect only the residual for source-authored structure. The existing 2D GIMP field and direct-pad work in im-results/gimp-dissolve-source-pad-gate.md and im-results/gimp-dissolve-directpad.md should be reused, not repeated. No unknown LP2 plaintext or key has been recovered.
