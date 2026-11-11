# The 2016 / p50 / p55 43-unit bridge: source-selector gate

**Classification:** bounded source audit, negative. No source-authenticated, reversible 43-unit operation has been established. The direct p32-compass additive/Beaufort bridge and a direct source-order key made from the signature-verified 2016 message's 43 GP-prime word sums both fail on p55's 43 interiors. These results do not exclude other keyed, nonlinear, or stateful operations.

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

**Decision:** retire these eight direct OutGuess ARC4-derived GP29 variants. This does not falsify the p32 route as a selector, the p55 interior extraction, or other source-selected key representations/operations. Do not expand into arbitrary password encodings or phases. The direct additive and OutGuess results together leave no supported reversible operation between these two 43-rune streams.

## Exact missing selector

No surviving, contemporaneous instruction reviewed here establishes all of the following:

1. Which signed-message word corresponds to which p50 byte. The fixed natural-order word-prime-sum shift to p55's 43 interiors is negative and does not establish a three-way p50/message/p55 mapping.
2. Whether the three 43-element sequences are paired in natural order, reversed, permuted, or grouped another way.
3. Whether a p50 value is a raw byte, a base-60 token, an 8-way direction/distance value, or something else when applied to a GP rune.
4. The direction and traversal order for the p55 interior sequence.
5. The reversible transform, key material, key/state initialization, and any skip or carry rule.
6. Whether the 33 boundary p55 runes are discarded, preserved as plaintext, or used as key/state material, including correct state carry for the incoming cross-page word.

The current 43-word base-58 address map is a later reconstruction from GP prime sums and the 58-page count, not a protocol stated in the signed message. Its exceptional “lies” → p50 3D result is not enough to determine the missing 43-way correspondence.

## Decision

**Stop arbitrary 43-way key expansion and the tested direct stationary additive/Beaufort pairings.** The signature-verified 43-word prime-sum key also fails on p55; do not expand it into unsourced word-value, phase, or permutation variants. A newer source-derived navigation chain strengthens the cardinality selection while leaving the decoder incomplete. The repeated signed-word map selects **FOLD**; the p55 image fold selects one-based 13-dot fragment **18**; that fragment is the p27 red 19-rune title whose first rune is GP index **19**, leaving 18 payload runes. Folding that payload outer-to-inner gives **100000000₂ = 256**, and its only matching pair is **P/P**, whose GP prime is **43**. The full compound 19-rune signature occurs exactly once in the complete 13,136-rune LP2 source stream.

The table itself provides a same-representation 43-cell bracket: the derived signed `lies` address selects byte193 at cell83; the only other byte193 is at cell127; their outward neighbors are both 201, giving **[201,193] … [193,201]** around cells84–126, exactly 43 cells. This materially improves the earlier count-only alignment. **Traversal orientation remains unresolved.** The duplicated p27/p55 word pair is 1,432 canonical words apart and the selected section has 1,433 runes, but those are different units and the numerical −1 relation does not supply direction without another instruction.

The reverse order 126→84 was nevertheless tested as a conditional branch. As per-word GP29 shifts on the 43 signed-addressed LP2 words, same-source shuffle upper tails are **0.8141** (subtract) and **0.2164** (add); applied positionwise to the 43 p55 interiors they are **0.2207** and **0.7906**. Direct XOR and modular ± byte readouts remain unreadable, with at most **22/43** printable ASCII. No source yet fixes how the table interval, p55 interiors and signed words combine into a reversible key/state transition. Keep p55 unsolved. See [the header-fold report](p27-title-headerfold-256-43-reverse-table.md) and [standalone reproducer](../sims/p27_title_headerfold_256_43_reverse_sft.cjs).

## Sources

- Original signed extraction and source record: [cicada2016-4gq25-outguess.asc](../resources/historical/cicada2016-4gq25-outguess.asc), [cicada2016-4gq25.md](../resources/cicada2016-4gq25.md)
- Original p50 bytes and GP corpus: [lp2-grid-256.json](../resources/liber-primus/lp2-grid-256.json), [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json)
- p55 and p57 transcription: [lp2-transcription.txt](../resources/lp2-transcription.txt)
- Combined p32-compass and signed-word-prime-sum 43-symbol reproducer: [p32_p55_43symbol_additive_bridge.cjs](../sims/p32_p55_43symbol_additive_bridge.cjs)
- Provisional signed-message word map: [lp2-2016-signed-message-base58-word-map.md](lp2-2016-signed-message-base58-word-map.md)
- 2013 historical number operation and its limitations: [cicada2013-reversed-prime-cookie-original-inverse.md](cicada2013-reversed-prime-cookie-original-inverse.md), [cicada2013_parable_reversal_ring_sft.cjs](../sims/cicada2013_parable_reversal_ring_sft.cjs)
- 2013 wisdom/folly material: [cicada2013-wisdom-folly.md](../resources/cicada2013-wisdom-folly.md), [2013-0-wisdom-source.md](../resources/external/2013-0-wisdom-source.md)
- 2014 material: [cicada2014-may2-signed-message.asc](../resources/cicada2014-may2-signed-message.asc), [cicada2014-onion7-index.html](../resources/cicada2014-onion7-index.html)
- 2017 signed warning: [cicada2017-yEiTHhvF.asc](../resources/historical/cicada2017-yEiTHhvF.asc)
