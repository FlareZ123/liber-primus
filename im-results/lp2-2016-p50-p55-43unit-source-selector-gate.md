# The 2014 / 2016 / p50 / p55 43-unit bridge: source-selector gate

**Classification:** a source-grounded 43-unit selector candidate has now been found, but no reversible square-to-p55 or p50-to-p55 operation is established. The three 2014 prior-puzzle squares (5×5, 7×7, 5×5) were explicitly required before the LP2 pages were returned. Their inner cells total 43, their perimeters 56, their rows 17, and all cells 99. This aligns with p55's 43 interior runes, 33 boundary runes, 17 words, and p57's 23-dot mark: 43=43, 33+23=56, 76+23=99, and 17=17. The p57 Parable's instruction to shed circumferences is a plausible literal selector for the square interiors. Direct mod-29, prime-count, spiral, and prime-count-difference interpretations tested here fail; the 99-unit placement and reversible operation remain unknown. Earlier p32-compass and 2016/p50 direct-key gates remain negative.

## Fixed source observations

### The authenticated 2016 message

The archived extraction record reports a good OpenPGP signature under key ID 7A35090F, linked to the historical Cicada public key. The signed text contains 43 alphabetic words and says:

> Its words are the map. Their meaning is the road, and their numbers are the direction.

It also warns against false paths and instructs readers to verify the signature. This is a high-level semantic instruction. It does not state a radix, page/word address formula, table-byte ordering, rune ordering, byte-to-rune encoding, cipher operation, key, or initial state.

### The p50 table interval

The original 32×8 numerical table contains 256 source bytes. At row-major byte offsets 83 and 127, the printed token is 3D, whose base-60 value is 193. The 43 bytes strictly between those markers, offsets 84–126, are:

[173, 28, 111, 65, 211, 220, 198, 49, 236, 84, 56, 35, 222, 150, 72, 34, 83, 229, 32, 206, 122, 63, 31, 218, 14, 184, 32, 115, 73, 143, 197, 247, 54, 171, 35, 184, 42, 237, 86, 54, 13, 20, 163]

The later signed-message word-map hypothesis sends the word “lies” to p50 token 3D. That singles out one table cell; it does not define a one-to-one mapping from all 43 signed words to all 43 interior bytes.

### Ornament-derived 44/193/43 bracket selector

The p55 fold artwork now supplies a separate conditional selector for the same p50 interval. Its ordinary five-position ornaments read **13** and **31**; the left filled cells are exactly positions 2,3,5, while 13 and31 are reversed primes. Their difference **18** reproduces the fold-selected fragment18. The left value13 is GP index P, and fragment18's sole equal folded pair is P/P, whose GP prime is **43**.

The archived 2013 `NUMBER` service would answer either 13 or31 with **`+`**, because each prime reverses to the other prime. Reading that historical response as an addition cue gives **13+31=44**; prime(44)=**193**. Under base60, 193 appears only at p50-global cells **83 and127**, exactly **44** apart, leaving **43** enclosed cells. Exhaustively checking all prime-valued base60 bytes finds this as the only pair with separation equal to the byte's prime ordinal. Under base59, cells83/127 equal190, value193 moves to cells61/234, and there is no such self-indexed prime-distance pair.

This is stronger selector evidence for the physical interval and a conditional discriminator in favor of base60. The unresolved premise is the semantic use of the historical `+` response as an instruction to add the later ornament values; the original server used it as a classification marker. It still does not provide the reversible 43-unit cipher operation.

### The p55 interior and p57 instruction

The p55 transcription contains 17 printed words with rune lengths:

[1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]

That is 76 page-local runes. The leading one-rune segment is the final boundary rune of an 11-rune word that begins on the preceding physical page; it is not a standalone singleton. Carrying that cross-page word correctly, the p55 page contributes 43 interior runes and 33 boundary runes. The interior sequence, represented as exact zero-based GP rune indices, is:

[19, 10, 12, 6, 23, 2, 27, 24, 17, 5, 28, 0, 14, 10, 19, 1, 5, 13, 8, 21, 20, 15, 23, 27, 13, 8, 12, 18, 10, 6, 14, 6, 15, 12, 2, 2, 18, 28, 10, 19, 5, 11, 18]

The solved p57 Parable says, “We must shed our own circumferences. Find the divinity within and emerge.” Under the lossless cross-page-aware stripping above, this yields a concrete internal marker geometry. GP index23 is D, and the 43 interiors contain D exactly at one-based positions **5 and23**. There are **17 runes strictly between**, their position difference is **18**, and the inclusive D…D span has **19 runes**. Historical `NUMBER(193)` independently yields **391=17×23**, so both factors are realized without choosing a new key. The D…D span folds to **100000000₂=256** and its center is I, whose GP prime is31.

This supports the interior-extraction convention substantially more strongly than cardinality alone. It does not fix the p50-byte mapping or whether boundary symbols should later be reinserted. A separate direct pairing of the 43 signed-message words with these interiors, using word GP-prime sums as shifts, is tested below and fails.

### The 2014 5/7/5 squares: a new source-grounded 43/56/99 selector

The pinned historical archive contains the three squares in 2014/007-fifth-onion/magicsquares.txt. The next-stage 2014 sixth-onion instructions explicitly tell solvers to submit the three squares from previous puzzles; after successful submission, three additional Liber Primus pages were returned. The 2014 seventh-onion archive contains the LP2 material. Thus these are not numbers selected retrospectively from an unrelated source: the solver was required to possess these exact prior-puzzle artifacts before receiving LP2.

The square orders are 5×5, 7×7, and 5×5:

- Total cells: 25+49+25 = **99**.
- Total rows: 5+7+5 = **17**.
- Removing each outer ring leaves 3×3, 5×5, and 3×3: 9+25+9 = **43** inner cells.
- The three perimeters contain 16+24+16 = **56** cells.

This gives a much stronger structural match to the LP2 pages:

- p55 has **76** runes, split into **43 interior** and **33 boundary** runes under the cross-page-aware word stripping above.
- p55 has **17** printed word segments, matching the squares' 17 rows.
- p57 has a terminal red punctuation mark annotated as **23 dots**.
- Therefore 43 square-inner cells = 43 p55 interior runes; 33 p55 boundary runes + 23 p57 dots = 56 square-perimeter cells; and 76 p55 runes + 23 p57 dots = 99 total square cells.
- The solved p57 Parable says, “We must shed our own circumferences. Find the divinity within and emerge.” This now has a plausible literal target in the three square perimeters and their 43 inner cells.

A positive historical control survives the stripping: the inner-square centers remain **809, 331, 91**. Their prime counts are **140, 67, 24**, whose successive differences are **73, 43**, the previously established LP signature. The p55 red 13-dot mark is also preserved in the ink annotations, but it is not used in the 43/56/99 arithmetic.

This changes the earlier assessment: the 43-unit selection is no longer supported only by a cardinality match between p50 and p55. The 2014 squares provide a plausible source-derived selector for the p55 interior. It is still a hypothesis about intended cross-stage use, not a recovered cipher.

### Frozen direct tests of the square interiors

The 43 inner square values were extracted in the original file order (row-major within each square, squares in source order) and compared with p55's 43 interior runes. The following direct operations were tested in both additive directions:

1. Raw square value modulo 29 as a 43-symbol additive key.
2. Prime-count value π(n) modulo 29 as a key.
3. Prime-count difference relative to each inner square's center, modulo 29.
4. Clockwise and counterclockwise spiral order of the 3×3 / 5×5 / 3×3 interiors, paired with p55's interior sequence.
5. Placing p55's 43 interior runes into 3×3 / 5×5 / 3×3 matrices and reading those matrices in either spiral direction, paired with row-major or same-spiral square keys.
6. A 42-step chain model using adjacent differences of π(n) from the square interiors against adjacent differences of p55's 43 interior runes; row-major and both spiral orders, both signs, and all 29 initial offsets were tested.
7. A cumulative direction walk using the square values modulo 43 over the 43 p55 interior positions; row-major and spiral orders, both directions, and read-before/read-after variants were tested. These walks visit only 28 or 29 distinct positions, so they do not define a 43-position permutation.

None of these direct mappings yields recognizable plaintext. They are negative gates, not evidence that the 2014 squares are irrelevant. The 99-token placement—76 p55 runes plus the 23 p57 dots into 99 square cells—has **not** been tested, because the source does not yet specify where the dots go or how to order the cells. Do not invent that placement or expand into arbitrary transforms.

Reproduction: run sims/lp2_2014_square_inner43_p55_gate.cjs from the repository root. The derived square transcription and pinned provenance are preserved in resources/derived/historical-2014/.

### The earlier historical instructions

- The archived 2013 telnet NUMBER operation reverses decimal digits and factors the result. Applied to 193, it gives 391 = 17 × 23. Under the project's established factor-index reduction, 17/23 map to GP signature **X**, uniquely matching solved p57 word **DIVINITY**. On p55 the same 17/23 pair is independently realized as the 17 runes strictly between the D markers and the second D's interior position23. This is strong navigation evidence, while it still does not define a 43-unit reversible cipher.
- The 2013 wisdom/folly material says primes and the totient function are sacred and that all things should be encrypted. It supplies no 43-unit selector.
- The 2014 Onion7 index has title value 133, div identifier 331, and 58 page links. The 2013 reversal operation relates 331 and 133, but the index does not prescribe any 43-unit correspondence.
- The 2014 May message provides an onion destination and an enlightenment prompt, not a byte/rune alignment.
- The 2017 signed warning repeats “Beware false paths” and PGP verification; it adds no mapping rule.

## p32 M7 pole → rune-free p50 → `lies` cell3 (provisional bridge)

A separate p32 branch supplies a candidate reason to continue from the Möbius pole to the p50 numerical table:

- The signed-2016 base-58 hypothesis maps `Beware` to p32 word5 `IARTTHF` at local offset25. The red 13-dot annotation motivates a 13-rune span through offset37; that span ends with the `HOMEX` marker at p32 indices33–37, the terminal X independently reached by the [2016 43-word compass SFT](../sims/lp2_2016_43word_compass_sft.cjs).
- The 13-rune window's prime sum is **413≡7=W**. The horizontal-corner p32 M7 candidate has pole7, so **M7(7)=∞**. The 2016 phrase “The path lies empty” is consistent with this endpoint.
- The corpus has exactly one physical page with `runic_count=0`: **p50**. The signed word `lies` has GP-prime sum **224=58×3+50**, selecting p50 cell3; the original table token there is **`3D`**.
- Base60 makes `3D=193`; the existing `NUMBER(193)=391=17×23` / p55 D…D interior relationship above supplies a continuation to the Parable's divinity instruction. Independently, p32's residue7 endpoint word sum442 addresses p36 word7=386=2×193, and φ(386)=φ(193)=192≡18=E.

The 13-rune span also supplies an exact checksum: selected p32 word `IARTTHF` sums184; its unique 8-rune suffix `FOTHHOMEX` sums229; and **229=193+36**, with 193=base60(`3D`) and 36=φ(108) from p55. Thus the whole window sum is **413=184+193+36**. Among 19 eligible p32 word starts, only the selected offset25 has suffix sum229. The suffix sum229 is the 50th prime, another conditional pointer to p50.

This is a useful cross-round navigation bridge, not a solution of the 43-unit cipher. The base-58 word-address rule, 13-dot→13-rune interpretation, M7 corner convention, and infinity→p50 identification remain hypotheses. The M7 intermediate states8 and2 are absent on p32, so the orbit is not a literal word-to-word traversal; no reversible 43-byte/rune correspondence or unknown plaintext has been recovered. See the [integrated p32 report](lp2-2016-signed-message-base58-word-map.md) and [p32 13-rune SFT](../sims/p32_13runic_w_infinity_route_sft.cjs).

## Direct p32 compass output ↔ p55 interior bridge (bounded negative)

The existing [2016 43-word compass SFT](../sims/lp2_2016_43word_compass_sft.cjs) takes the source-bracketed p50 bytes at offsets **84–126**, starts at p32 grid coordinate **(row 3, column 0)**, and visits 43 p32 runes, ending at **(3,4)**. The p55 interior extraction above independently yields 43 runes. This makes a direct one-to-one GP29 relation the cheapest reversible bridge worth testing before inventing a key schedule.

Only six fixed variants were tested: natural and reversed alignment, each under \(C-K\), \(C+K\), and \(K-C\) modulo 29. No phase, shuffle, permutation, or key search was performed. The exact token outputs and all inputs are emitted by [the reproducer](../sims/p32_p55_43symbol_additive_bridge.cjs).

| Alignment | Operation | IoC | Shakespeare-GP trigram log mean |
|---|---:|---:|---:|
| Forward | \(C-K\) | 0.035437 | −5.504694 |
| Forward | \(C+K\) | 0.034330 | −6.325720 |
| Forward | \(K-C\) | 0.035437 | −7.128081 |
| Reverse | \(C-K\) | 0.035437 | −5.577572 |
| Reverse | \(C+K\) | 0.034330 | −6.204847 |
| Reverse | \(K-C\) | 0.035437 | −6.140020 |

For scale, the first 43 body runes of solved p57 (after its seven-rune PARABLE heading) score IoC **0.056478** and trigram log mean **−2.571630** under the same model. A synthetic p57 segment encrypted by addition with the p32 stream is recovered exactly by \(C-K\), so the arithmetic implementation passes its positive control. The six real outputs remain near-uniform and substantially less English-like than the solved-page control.

**Decision:** reject the direct stationary additive/Beaufort pairing between the conditional p32 compass output and p55's 43 interiors. This does not falsify the p32 route as a selector, nor does it test nonlinear/stateful transforms or a separately source-selected alignment. Do not expand this into arbitrary 43-way permutations or phases.


## Signed 2016 word initials → p55 interior (exact keyless obstruction)

The signed message's **43 alphabetic words** also offer a simpler human-facing mapping to the **43 p55 interior runes**: take the *first GP rune* of each signed word, preserving source word order. Every ordinary monoalphabetic cipher, including an arbitrary secret and even a non-injective stationary lookup, must give one fixed plaintext rune to each repeated input ciphertext rune. This produces a source-level contradiction **without selecting a key or scoring language**.

Specifically, at one-based interior positions **1 and 15**, the actual p55 ciphertext rune is **M** at both positions. The corresponding signed words are **Hello** (initial **H**) and **Its** (initial **I**). A stationary map would require **f(M)=H=I**, impossible in GP29. Across the whole 43-position source alignment, the ciphertext has **21** distinct rune symbols; **30 of 31** same-cipher position pairs request different signed initials. Even allowing an arbitrary 29-to-29 function selected after viewing the proposed plaintext, the optimal stationary assignment must misread at least **21 of 43 positions**. The result is independent of additive keys and of p50 radix59/radix60.

The appended exact test in [the existing p32/p55 43-symbol SFT](../sims/p32_p55_43symbol_additive_bridge.cjs) derives the signed initials from the original clear-signed source, recomputes the p55 interior with physical-word boundaries, and asserts the witness, collision counts, and minimum contradictions. The only first-letter spelling normalization needed here is **V→U** for Verify; the explicit H/I collision does not depend on it.

**Decision:** retire only the one-initial-to-one-interior *stationary GP29 substitution* reading. The signed message does not prescribe those initials as p55 plaintext; it could be a navigation instruction or a key for a separate stateful method. This counterexample supplies no general exclusion of nonstationary, polyalphabetic, or multi-symbol ciphers.

## Direct signed-2016 word-prime-sum key → p55 interior (bounded negative)

The signature-verified 2016 clear-signed message contains **43 alphabetic words**, matching the 43 p55 interior runes. A simple reading of “their numbers are the direction” is to encode each word in GP, sum its rune prime weights, reduce modulo29, and use that 43-value sequence as a one-symbol-per-rune shift key in source order. This is a motivated test, not an authenticated cipher instruction: the message does not explicitly prescribe prime sums, modulo29 reduction, or Vigenère.

The exact GP encoding uses the corpus transliteration and prime arrays, greedily consuming TH/NG/EO/OE/AE/IA/EA; the equivalent-letter map supplies K=C, V=U, and Z=S. The numeric token 3301 and mixed alphanumeric key ID 7A35090F are not words; OpenPGP is retained as the 43rd alphabetic word. The fixed key modulo29 is:

[11,14,0,21,24,1,21,14,4,11,9,26,14,16,27,5,1,14,8,27,0,26,14,1,12,27,5,1,14,18,26,12,26,22,12,14,4,15,3,2,24,14,17]

Only the natural-order C-K and C+K directions were tested on the source-derived p55 interiors; no reversal, phase, key permutation, or alternate word encoding was searched.

| Stream | IoC | Shakespeare-GP trigram log mean |
|---|---:|---:|
| Raw p55 interiors | 0.034330 | −6.351839 |
| C-K | 0.038760 | −5.520948 |
| C+K | 0.029900 | −7.435180 |
| Solved p57 first 43 body runes | 0.056478 | −2.571630 |

The C-K output is HAE EOXEAU GIPD MOFDNGAEREAFDL ENYU IW BAEBBD EMMBX PWBI Y U when split by the original p55 interior word boundaries; C+K is likewise incoherent. The modest C-K score increase is not distinctive: **10,000** Fisher–Yates permutations of the same 43 key values (xorshift32 seed 0x45c1d0) put the source order at the **91.54th percentile**, with empirical add-one upper tail **0.084692** (shuffle q05/median/q95/q99 = −6.956251/−6.186647/−5.382346/−5.066929). It does not reach a 5% tail and remains far below the solved-p57 control.

A synthetic positive control encrypts the first 43 solved-p57 body runes by adding this same key and recovers them exactly with C-K. This validates the arithmetic only; it cannot authenticate the historical key. **Decision:** reject this specific direct prime-sum-as-additive-shift reading. It does not rule out every semantic use of the signed words, but no further 43-way phases or transformations are justified without a new source-visible rule. The existing [combined reproducer](../sims/p32_p55_43symbol_additive_bridge.cjs) now emits both the p32-compass and signed-word-prime-sum results.

## Two-stage signed-message book-map key → p55 interiors (bounded negative, Agent30)

**A genuinely different direct consumer from the signed-word-sum key above:** Apply the independently published *provisional* base-58 book address to each of the 43 alphabetic words of the authenticated 2016 message, treating original GP-prime sum `S` as `page=S mod58; printed-word index=floor(S/58)`. Use the ING-aware GP spelling for **MEANING**. Under that hypothesis the known signed words **THEIR** and **MEANING** still point to independently solved p56 words **END** and **DEEP**, respectively. **LIES** points to page50, original p50-local cell3; this is printed global grid index83, base60 byte **193** (`3D`), **not** row-major global cell3. The remaining 42 selections address exact original LP2 printed rune words, including encrypted unknown words. This candidate does not require inventing their plaintext: compute each selected ciphertext word's sum of original GP prime weights modulo29; at LIES use the original byte `193 mod29=19`. The resulting **43-number** key is uniquely fixed by the two-stage hypothesis and is aligned, in authenticated signed-message order, with p55's **43 strict cross-page-correct word interior runes**, as motivated by the solved p57 PARABLE.

The source does not authenticate the base-58 address grammar, or using *ciphertext* prime sums as the word's “numbers,” or stationary GP29 Vigenère; the tested model is a cheap reversible gate on an independently constructed candidate, not an explanation of Cicada's signed prose. Directly subtracting or adding these 43 source-mapped values modulo29 gives:

| Stream | p55 interior IoC | Shakespeare GP trigram mean log score |
| --- | ---: | ---: |
| Original p55 interior, no transform | 0.034330 | −6.404211 |
| Original minus mapped selected-word key | **0.036545** | **−6.695708** |
| Original plus mapped selected-word key | **0.039867** | **−6.666670** |
| 43 native GP-English source runes | 0.063123 | −2.129356 |

The two original outputs are nonlinguistic, including when separated at source p55 word-interior boundaries; the plus output contains `IAWWAEEOOIANGNPPWJJIATHAEICDTOELGWITHNWOTHFCUHOTHLAECGTH`, with no coherent word sequence. Both signs recover **43/43** planted authentic-source p57 plaintext runes. The exact original key, source positions and transformed GP tokens are printed by the self-testing script, executed successfully on the complete repository in [manual original-input CI 43123300295](https://github.com/FlareZ123/liber-primus/actions/runs/43123300295): [`sims/lp2_2016_signed_bookmap_p55_inner_key_sft.cjs`](../sims/lp2_2016_signed_bookmap_p55_inner_key_sft.cjs).

**Decision:** the two-stage original-ciphertext-word-number pad does not decrypt p55's 43 interiors. Retire only its exact stationary +/-GP29 consumer. It does not refute a map to actual **plaintext meanings**, nonlinear navigation, or an unknown original key; those require distinct evidence and cannot be inferred from this negative.

## Full-book 43×301 / 7×43² source-shape gate (bounded negative)

The 55 rune-bearing LP2 pages contain 12,956 runes. The p0 red heading is the first **13** runes (two words of lengths 8 and 5); the next black line is **7** runes (two words of lengths 4 and 3), with GP indices **[2,11,6,25,0,11,22]**. Removing only the red heading leaves **12,943 = 43×301 = 7×43²** runes. Removing the following seven-rune line as a putative key leaves **12,936 = 7×1,848 = 7×(43²−1)**. The 2016 signed message contains **43 alphabetic words**. These are exact source counts, and they motivate a 43-position clock and a seven-layer reading; they do **not** establish that the text is a 43×43×7 tensor or that either preamble is a key.

The source-derived GP prime-sum key is the same 43-value vector recorded above. I tested it as a continuous additive key over every rune after p0's 13-rune red heading, with no page resets and no phase fitting. This differs from the earlier p55-only test: p55 begins at global rune offset 12,880, so its phase under this clock is **10**, not zero. A word-internal GP trigram model trained on the first 80% of the Shakespeare control file and evaluated on its last 20% gives the following results:

| Candidate | Direction | IoC | Shakespeare-GP trigram mean |
|---|---|---:|---:|
| Raw post-heading stream | — | 0.034479 | −4.396689 |
| 43 prime sums, source order | C−K | 0.034491 | −4.379136 |
| 43 prime sums, source order | C+K | 0.034477 | −4.357244 |
| 43 prime sums, ascending numeric order | C−K | 0.034463 | −4.420824 |
| 43 prime sums, ascending numeric order | C+K | 0.034455 | −4.375215 |
| 43 prime sums, descending numeric order | C−K | 0.034464 | −4.379009 |
| 43 prime sums, descending numeric order | C+K | 0.034452 | −4.384874 |

The held-out native Shakespeare-GP control scores **−1.839432**. None of these outputs approaches English; the slight score changes are not plaintext evidence. The obvious word-number residue map also fails to supply a 43-column permutation: the 43 prime sums have only **26 distinct residues modulo 43**, omitting 17 residues.

A second source-shaped reading treats p0's first black seven-rune line as a repeating key for the 12,936 runes that follow it. Both signs were tested under the GP-index, GP-prime-weight, and prime-totient encodings. Scores remain between **−4.419905 and −4.359501**, versus the same native holdout at −1.839432. A combined 43-word/7-layer reading, \(K_i=\text{firstBlack}[S_i\bmod7]\), where \(S_i\) is the signed word's GP-prime sum, also fails in both signs (−4.401832/−4.415428). The 43 prime sums modulo 7 occupy only six residues, omitting 6.

The exact arithmetic makes this a worthwhile human-solve-path observation, but the natural additive interpretations do not decrypt the book. Do not escalate to arbitrary tensor orientations, row/column permutations, phases, or state rules without an independent instruction selecting them. The runnable, source-frozen test is [the full-book SFT](../sims/lp2_signed2016_43period_fullbook_key_sft.cjs); it derives the 43 words and key from the clear-signed source, checks the original LP2 counts, and includes exact p57 arithmetic round-trip controls.

## Source-native OutGuess ARC4 bridge between the two 43-rune streams (bounded negative)

The 2016 carrier's signed payload authenticates OutGuess as a source technology, and its original ARC4 implementation uses \(MD5(\text{type}\,\|\,\text{password})\) followed by the ARC4 state/key schedule. The 43-rune p32 compass output is a source-derived candidate password; the 43 p55 interiors are the source-derived target. This is a plausible next operation after the direct additive/Beaufort bridge failed, but the use of the p32 stream as the password is still an inference.

The [reproducer](../sims/p32_p55_43symbol_outguess_bridge.cjs) freezes only two password encodings (literal GP-Latin transliteration and the base29 integer), the two documented OutGuess roles (**Encryption** for carrier data and **Seeding** as a wrong-role control), and the two GP29 additive signs after reducing each ARC4 byte modulo 29. It tests eight variants, with no phase, shuffle, offset, or key search. A synthetic p57 plaintext segment encrypts/decrypts exactly under the same derived pad, so the arithmetic control passes.

| Password | OutGuess role | Operation | IoC | Emerson-GP language score |
|---|---|---|---:|---:|
| Literal GP-Latin | Encryption | \(C-K\) | 0.034330 | −6.433788 |
| Literal GP-Latin | Encryption | \(C+K\) | 0.028793 | −6.781229 |
| Literal GP-Latin | Seeding | \(C-K\) | 0.053156 | −6.362082 |
| Literal GP-Latin | Seeding | \(C+K\) | 0.035437 | −5.994985 |
| Base29 integer | Encryption | \(C-K\) | 0.035437 | −6.433803 |
| Base29 integer | Encryption | \(C+K\) | 0.036545 | −6.926513 |
| Base29 integer | Seeding | \(C-K\) | 0.029900 | −7.401898 |
| Base29 integer | Seeding | \(C+K\) | 0.032115 | −6.198025 |

None of the outputs is plaintext. Even the best language score (the wrong **Seeding** role with literal GP-Latin and \(C+K\)) remains strongly non-linguistic. More literally, OutGuess encrypts carrier bytes by XOR: direct XOR of the p55 rune ordinals with the same ARC4 bytes leaves only **3–6 of 43** outputs inside the valid GP29 range across the four password/role combinations. A direct byte-XOR plaintext must produce 43/43 valid rune ordinals, so the literal OutGuess byte operation also fails without an additional, unsourced transform. The source-authenticated OutGuess generator therefore does not rescue this particular 43↔43 key/target pairing.

### Seven-rune p32 word-center output as an alternative OutGuess password (bounded negative)

The separate [p32 word-center route](p32-wordcenter-compass-route.md) produces the seven-rune sequence **W A B X NG M O**, transliterated **WABXNGMO**. This is another source-derived candidate password, distinct from the 43-rune compass output above. The same OutGuess KDF/ARC4 was tested with the literal GP-Latin password and its base29 integer (**4668414261**), both documented roles, and both GP29 additive signs.

| Password | OutGuess role | Operation | IoC | Emerson-GP language score | Direct XOR values in GP29 range |
|---|---|---|---:|---:|---:|
| WABXNGMO | Encryption | \(C-K\) | 0.036545 | −6.214672 | 3/43 |
| WABXNGMO | Encryption | \(C+K\) | 0.029900 | −6.845121 | 3/43 |
| WABXNGMO | Seeding | \(C-K\) | 0.038760 | −5.322053 | 8/43 |
| WABXNGMO | Seeding | \(C+K\) | 0.031008 | −7.297088 | 8/43 |
| Base29 integer | Encryption | \(C-K\) | 0.025471 | −5.471394 | 5/43 |
| Base29 integer | Encryption | \(C+K\) | 0.035437 | −6.882319 | 5/43 |
| Base29 integer | Seeding | \(C-K\) | 0.033223 | −6.778547 | 3/43 |
| Base29 integer | Seeding | \(C+K\) | 0.032115 | −6.476995 | 3/43 |

No variant recovers plaintext. The best score, −5.322053, uses the wrong **Seeding** role and remains non-linguistic. Direct byte-XOR also produces at most 8/43 valid GP29 symbols, rather than the 43/43 required. This rejects only these two representations of the seven-rune word-center output as an OutGuess password.

### Reverse key direction: p55 interiors as the OutGuess password (bounded negative)

The 43 p55 interior runes can also be read as the password, with the p32 43-rune compass output as target. This is a distinct key direction: the phrase "shed our own circumferences" selects the p55 interiors, while the p32 route supplies the map-derived stream. The same literal GP-Latin and base29-integer encodings, OutGuess roles, and signs were tested.

| Password encoding | OutGuess role | Operation | IoC | Emerson-GP language score | Direct XOR values in GP29 range |
|---|---|---|---:|---:|---:|
| p55 literal GP-Latin | Encryption | \(C-K\) | 0.032115 | −6.572163 | 6/43 |
| p55 literal GP-Latin | Encryption | \(C+K\) | 0.049834 | −6.886027 | 6/43 |
| p55 literal GP-Latin | Seeding | \(C-K\) | 0.031008 | −6.070723 | 6/43 |
| p55 literal GP-Latin | Seeding | \(C+K\) | 0.027685 | −5.949500 | 6/43 |
| p55 base29 integer | Encryption | \(C-K\) | 0.032115 | −6.504939 | 6/43 |
| p55 base29 integer | Encryption | \(C+K\) | 0.027685 | −5.859426 | 6/43 |
| p55 base29 integer | Seeding | \(C-K\) | 0.033223 | −6.264670 | 4/43 |
| p55 base29 integer | Seeding | \(C+K\) | 0.038760 | −6.196218 | 4/43 |

No variant recovers plaintext. The best score, −5.859426, remains non-linguistic; direct byte-XOR yields only 4–6/43 valid GP29 symbols. This closes the reverse password direction for the same two fixed encodings and roles.

**Decision:** retire the 24 tested OutGuess ARC4-derived GP29 variants across compass-key, word-center-key, and reverse p55-key directions. This does not falsify the p32 route as a selector, the p55 interior extraction, or other source-selected key representations/operations. Do not expand into arbitrary password encodings or phases. The direct additive and OutGuess results together leave no supported reversible operation between these two 43-rune streams.

## p55 interiors as compass numbers on the p32 map (bounded negative)

A separate reading of the 2016 instruction ("numbers are direction") is to treat the 43 p55 word-interior rune ordinals themselves as direction/distance values, using the already source-derived p50 encoding \(d=v\mathbin{\&}7\), \(r=v\mathbin{\gg}3\), and walk the p32 11×11 map. This uses the p55 "shed our own circumferences" clue to select the interior sequence, rather than using the p32 route as a password. The walk is forward and wraps modulo 11. Five source-visible origins were checked: the p32 map center, the two 2016-dimension-selected EN cells, the 2014 7×7 square center, and the existing p50 compass-route origin.

| Origin | Distinct output runes | IoC | Emerson-GP language score |
|---|---:|---:|---:|
| p32 map center (5,5) | 19 | 0.050941 | −6.182700 |
| 2016-selected EN first cell (9,3) | 18 | 0.060908 | −5.675726 |
| 2016-selected EN second cell (9,4) | 18 | 0.064230 | −6.687181 |
| 2014 7×7 square center (3,3) | 16 | 0.063123 | −7.200982 |
| p50 compass-route origin (3,0) | 20 | 0.039867 | −6.610085 |

None of the five outputs is plaintext; even the best score, −5.675726 from the EN-first origin, remains strongly non-linguistic. Reproducer: [p55_interior_compass_on_p32.cjs](../sims/p55_interior_compass_on_p32.cjs).

**Decision:** reject this exact p55-interior-as-direction encoding at these five source-visible origins. Do not expand into arbitrary origins or direction permutations without a new clue.

## Direct p50 43-byte interval → p55 43-interior byte/GP29 tests (bounded negatives)

The source-selected 43-unit bridge offers a simple direct test before inventing a more elaborate selector: take the 43 raw p50 bytes strictly between the two byte-193 / base60-`3D` markers (row-major offsets 84–126), reduce each byte modulo 29, and use that sequence as a GP29 key for the 43 p55 interior runes. The p55 interior is extracted with its original word boundaries; the leading one-rune fragment is a cross-page word boundary, not a singleton. The 43-byte and 43-rune sequences are therefore aligned in their source order. A reversed-key alignment is included as the only orientation control.

| Alignment | Direction | IoC | Result |
|---|---|---:|---|
| Forward | C−K | 0.0299003322 | No readable English |
| Forward | C+K | 0.0354374308 | No readable English |
| Forward | K−C | 0.0299003322 | No readable English |
| Reversed key | C−K | 0.0321151717 | No readable English |
| Reversed key | C+K | 0.0354374308 | No readable English |
| Reversed key | K−C | 0.0321151717 | No readable English |

For the 43-symbol sample, IoC is only descriptive; the word-break-preserving outputs are also nonlinguistic. The script includes an arithmetic positive-control round-trip and pins the exact Git blob SHAs of the p50 grid, GP29 corpus, and page transcription. Reproducer: `sims/p50_43byte_to_p55_interior_mod29_gate.cjs`.


A direct byte-level alternative was tested on the same fixed alignment: XOR each raw p50 byte with the corresponding p55 GP29 index. Forward XOR yields `be166347c4dedd29fd512423d09c5b2356e828db6e3008c103b02c614389cbf139a721ba38f15c25081fb1`; only 20/43 bytes are printable ASCII and 7/43 are letters. Reversing the p50 byte sequence yields `b01e013041ef31a032ae2af7cb855a7225b506cf0b306dd52ded5f304290d0253758ee33d4c0d9526a17bf`; again only 20/43 bytes are printable and 8/43 are letters. Neither is readable text. The script reproduces both byte-level outputs.

This rejects the direct `raw_byte mod 29` additive/Beaufort pairing and the direct raw-byte XOR pairing only. It does not reject a separately source-selected use of p50 bytes as base-60 digits, directions, or another representation; no such mapping is currently selected by evidence.

## Exact missing selector

The 2014 squares now provide a plausible source-grounded selector for the p55 43 interior units, but the complete reversible mapping remains unresolved:

1. The 5/7/5 square source and p57 Parable plausibly select the 43 inner square cells and 43 p55 interior runes. They do not yet establish whether those sequences pair row-major, spiral, center-out, or by another traversal.
2. The 99-unit relation (76 p55 runes + 23 p57 dots = 99 square cells) and the perimeter relation (33 p55 boundary runes + 23 dots = 56 square-perimeter cells) are count-level matches. No source instruction currently places the 23 dots into specific perimeter cells.
3. The square values' role is unknown: raw shifts, prime-count values, differences, directions, transposition ranks, or a multi-stage operation. The direct mod-29, prime-count, and tested spiral/chain interpretations are negative.
4. Which signed-message word corresponds to which p50 byte remains unknown. The fixed natural-order word-prime-sum shift to p55's 43 interiors is negative and does not establish a three-way p50/message/p55 mapping.
5. Whether the p50, 2014-square, signed-message, and p55 43-element sequences are paired in natural order, reversed, permuted, or grouped another way remains unresolved.
6. The reversible transform, key material, key/state initialization, and any skip or carry rule are not established.
7. The 33 boundary p55 runes may be discarded, preserved as plaintex## Decision

The 2014 5/7/5 squares materially strengthen the 43-unit bridge: they were required prior-puzzle inputs before LP2 release, and their 43 inner cells / 56 perimeter cells / 17 rows align with p55's 43 interior / 33 boundary / 17 words plus p57's 23-dot mark. The p57 Parable supplies a plausible human instruction to remove the square circumferences. This supersedes the earlier claim that no source-grounded selector for p55's 43 interior units was known.

No decryption has resulted. Direct square-value mod-29 shifts, prime-count shifts, center-relative prime-count shifts, spiral additive pairings, prime-count-difference chain variants, and simple modulo-43 direction walks all fail. The p50 compass-byte interpretation on p32, signed 2016 word-prime-sum keying on p55, raw p50-byte-mod-29 and XOR pairings, continuous period-43 prime-sum key, and simple p0 period-7 keys remain negative. The exact 43×301 = 7×43² relation remains a count observation, not a decoder. The fold/END observation remains conditional and is not a decryption.

The next valuable decision is a source-constrained test of the 99-cell structure or a traversal rule grounded in p54's spiral and p57's circumference instruction. In particular, determine whether the 76 p55 runes and 23 p57 dots have a historically plausible placement into the three 5/7/5 squares, and whether the 43 interior correspondence then specifies a reversible operation. Do not search arbitrary byte maps, shifts, phases, offsets, or permutations. The new square alignment justifies reopening this branch for a bounded investigation; it does not justify unconstrained key search.
