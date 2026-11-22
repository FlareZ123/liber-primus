# Signed 2016/2017 Fibonacci physical-page route

**Classification:** source-locked structural interpretation with a finite literal continuation test. The arithmetic is exact and reproducible on preserved signed messages; reading the resulting Fibonacci steps as physical LP2 page numbers is a candidate intended route, not a recovered cipher rule. **No unknown plaintext or authentic key is recovered.**

## 2016 signed word-map source-correction and original p55 inverse

**Result: the apparent 16/59/43 match depends on two source-unselected rune aliases, and the direct signed-word keys fail.** The original signature-verified central 2016 sentence has **16 ordinary words** and **61 Gematria Primus symbols** when tokenized using the literal 29-symbol manuscript labels plus uncontroversial K=C/V=U spelling replacements. Its length becomes **59** only after applying the disputed additional ING→NG and IO→IA substitutions, which are **not explicitly instructed by Cicada**. This is an important correction to an earlier report in this file and follows the existing source-critical [three-by-59 selector audit](signed2016-59prime-p29-selector.md). Under the alias interpretation the sentence's first five words contain 16 GP runes and its remaining eleven contain 43, while under the stricter transcription the central sentence has 61, not 59.

Independently of 2016 spelling, original physical p55 begins with one incoming p54 word-continuation rune and then has **16 complete words totaling 75 runes**. Their 43 strict interiors and 59 first-through-penultimate runes are exact source facts. The conditional numerical 16/59/43 correspondence, even if one chooses the aliases, does not select an operation: the signed sentence says *Liber Primus's* words are the map, and the signed/p55 word-length sequences do not match, even as multisets. It is therefore weak as evidence of a designed direct key. Preserve the conditional alignment as a failed lead rather than using it to justify more numeric searches.

An independent original-cipher reproducibility check tested **five** fixed 75-rune direct inverse interpretations, without optimized phase, exceptions, moving words, fitting letter mappings or decrypting the incoming p54 carry. All reverse transformations exactly reconstruct original glyphs, and all native original-shaped GP planted controls recover 75/75:

| Source key spelling | Original operation (GP29 subtraction) | Candidate IoC | Result |
| --- | --- | ---: | --- |
| **Literal/canonical, 61 GP runes** | Per-word Vigenère using repeated runes of the corresponding signed word | **0.03063063** | Nonlinguistic |
| **Literal/canonical, 61 GP runes** | Constant GP-prime-sum-mod29 shift for each corresponding complete word | **0.03603604** | Nonlinguistic |
| Optional ING/IO aliases, 59 runes | Corresponding signed-word Vigenère | **0.02990991** | Nonlinguistic |
| Optional ING/IO aliases, 59 runes | Corresponding signed-word GP-prime-sum shift | **0.03855856** | Nonlinguistic |
| Optional ING/IO aliases, 59 runes | Full 59-rune key on each p55 complete word's first-through-penultimate positions; preserve all 16 terminal runes | **0.03243243** | Nonlinguistic |

Original 75-rune ciphertext body's IoC is **0.03855856**. The source-native GP text plant and re-encryption checks confirm executable inverses only; no plaintext, historical key, command or destination was recovered. A sixth 61→59 direct-key alignment would need an independently justified deletion rule for two GP tokens, which is absent; it was not invented.

**Reproducer and validated result:** [CommonJS SFT](../sims/signed2016_p55_words59_key_sft.cjs), [successful manual original-input CI](https://github.com/FlareZ123/liber-primus/actions/runs/43259304466). The source report also retains the preexisting p32 signed-tree 11×11 width/height relation, which fixes one page orientation but no traversal, and the 2016/2017 prime/Fibonacci p13→p21→p34→p55 page route below, whose natural continuations were already negative.

**Decision (Director #594):** these exact source-phrase-to-word consumers fail, and the numerically attractive 59 alignment is source-dependent. Do not commission further signed-word key variations without an independently authored mapping instruction and withheld original-cipher prediction.

## Exact source chain

The preserved 2016 OutGuess payload is a 1,136-byte OpenPGP clear-signed message whose signature verifies under the archived Cicada key ending `7A35090F`. The preserved 2017 warning independently verifies under the same archived key. The repository source records distinguish that cryptographic continuity from original-delivery provenance.

Under the historical Gematria Primus spelling convention already used by `sims/2016_message_prime_layers.py` (`TH`, `EA`, `ING`, and `IO` as GP tokens; `K=C`, `V=U`; digits and punctuation ignored), the three 2016 sections contain exactly **59 GP runes each**. Their raw GP-prime sums are **2999, 2819, 2581**. Moving the terminal `F` of `7A35090F` from the third section to the first, the documented historical convention, gives **3001, 2819, 2579**. The 2017 warning has **45 GP runes** and GP-prime sum **2131**.

The ordinary-prime walk starting at `p_464 = 3301` and subtracting successive Fibonacci values from the prime **index** is:

`464, 463, 462, 460, 457, 452, 444, 431, 410, 376, 321, 232, 88`

with prime values:

`3301, 3299, 3271, 3257, 3229, 3191, 3119, 3001, 2819, 2579, 2131, 1459, 457`.

Therefore the four signed-message sums land exactly at the transitions whose Fibonacci decrement values are:

| Signed source | GP-prime sum | Prime ordinal | Fibonacci decrement |
| --- | ---: | ---: | ---: |
| 2016 section 1, adjusted | 3001 | 431 | **13** |
| 2016 section 2 | 2819 | 410 | **21** |
| 2016 section 3, adjusted | 2579 | 376 | **34** |
| 2017 signed warning | 2131 | 321 | **55** |

The first three arithmetic matches were already represented in repository source-analysis code. The new consequence tested here is to read the **Fibonacci decrement values themselves as physical LP2 pages**.

## Candidate physical-page route

All four values are valid unsolved physical pages:

`p13 → p21 → p34 → p55`.

Their original ciphertext lengths are respectively **272, 273, 261, and 76 runes**. The next Fibonacci decrement in the same walk is **89**, which exceeds the complete physical LP2 range 0–57. Thus the candidate route has a source-fixed stopping rule. It ends at **p55, the final unsolved physical page immediately before solved p56 and p57**.

This interpretation has a plausible human-puzzle path: LP2 p15 already supplies an explicit Fibonacci-indexed-prime construction, while the later signed messages say that Liber Primus's words are the map and its numbers the direction. The route still requires an interpretive step, namely treating the matched Fibonacci decrements as physical page numbers. The signed messages do not explicitly say “page,” so this is prioritized structural evidence rather than an established instruction.

The 2017 contribution is useful because it extends the 2016 sequence by the next Fibonacci value, **55**, and terminates exactly on the final unsolved page. It does not independently authenticate the page-reading convention because it shares the same GP/Fibonacci arithmetic family.

## Literal word-number continuation: bounded negative

To test the most direct reading of “words are the map” without fitting a cipher, the canonical word parser was applied to the selected pages. Canonical page-local **word-start** counts are:

`[61, 55, 60, 16]` for pages `[13, 21, 34, 55]`. Physical p55 begins with one printed fragment that continues a word started on the preceding rune-bearing page, so its 17 printed fragments correspond to 16 canonical word starts.

Two one-based indexing conventions were frozen:

1. Use the **current page/Fibonacci number** as the word index. This yields `YMFX / PHSOE / DNGEAA`, then fails structurally because p55 has no 55th word.
2. Use the **next route/Fibonacci number** as the word index. This yields `IAO / AU / YDSCIAX`, then fails structurally because p55 has no 89th word.

Neither readout is recognizable plaintext, an instruction, a key, or a destination. Both have a natural stop at p55, but that alone does not select either convention. **Retire these two literal word-index continuations.** Do not tune indexing, offsets, or alternative word segmentation without a new source clue.


## One 76-rune p55 key consequence: bounded negative

A postselected but unusually exact length identity is
`8 + 13 + 21 + 34 = 76`, matching p55's complete ciphertext length. To give that observation one finite test, take the **first N runes of physical page N** for the four consecutive preceding Fibonacci pages `[8,13,21,34]`, concatenate them in forward order, and use the resulting 76 GP indices as a direct additive p55 key. Only the two reversible orientations `P=C−K` and `P=C+K (mod29)` were tested. No suffix, phase, alternate projection, page permutation or fitted clock was searched.

The stronger of the two original candidates scores **−11.61165742 nats/trigram-rune** under a fixed native-GP trigram model; the other scores **−11.98175332**. Across **1,000** independent 76-rune native-GP control windows, the worst control is **−8.87918067**, median **−7.89832242**. Thus **0/2** original candidates reach even the lowest native-GP control score. Their transliterations are nonlinguistic. An exact forward emitter recovers a 76-rune native-GP plant under both signs, with recovered score **−7.85654664**.

**Decision:** retire this direct Fibonacci-prefix additive key. The length identity is worth recording because it could still be framing evidence, but it supplies no direct GP plaintext under the single operation most naturally implied by a same-alphabet 76-rune key. Do not multiply projections or orientations without a new source selector.

**Reproduce:** [single-file SFT](../sims/signed2016_fibonacci_p55_prefix_key_sft.cjs); successful manual CI [run 42972354667](https://github.com/FlareZ123/liber-primus/actions/runs/42972354667).



## Terminal red-mark Fibonacci framing on p55: direct additive family negative

Physical p55 has a source-annotated **red 13-dot punctuation mark at local offset 76**, immediately after all 76 ciphertext runes. Its four printed rune lines have lengths **24, 22, 22, 8**, so the final printed line itself is exactly the preceding Fibonacci value **8**. Reading from that marked end permits a source-anchored 76-rune partition with consecutive lengths **8, 13, 21, 34**.

That boundary evidence justified one end-aligned direct family beyond the weaker forward-prefix test. For each Fibonacci length `N∈{8,13,21,34}`, take the **last N runes of physical page N**. Align p8's suffix to the final 8-rune p55 block, p13 to the preceding 13, p21 to the preceding 21, and p34 to the first 34. In forward p55 order the key is therefore `suffix34 || suffix21 || suffix13 || suffix8`.

Three source-linked additive projections were tested, each under the two global signs `P=C±K mod29`:

- canonical GP rune indices;
- each source rune's assigned **GP prime weight modulo29**, motivated directly by the signed-message GP-prime arithmetic;
- the Fibonacci values themselves as constant block shifts, i.e. forward blocks of lengths/shifts `34,21,13,8`.

Across all **6** original variants, the best fixed native-GP trigram score is **−11.01380950**. The worst of **1,000** matched native-GP 76-rune controls is **−8.87918067**, so **0/6** candidates enter the native reference range. Exact planted controls recover for every projection/sign pair.

The two literal marked-end traversals were also tested without a key. Reversing only the four Fibonacci block order gives score **−11.88437075**; reading every p55 rune backward from the terminal mark gives **−12.01288030**. Neither approaches the same native-GP control range.

**Decision:** retain the terminal 76/13-dot/8-rune-line geometry as source structure, but retire the tested direct additive and literal marked-end traversal interpretations. Any further use of the Fibonacci blocks requires a separately indicated operation.

**Reproduce:** [terminal-key/readout SFT](../sims/signed2016_fibonacci_p55_terminal_key_sft.cjs); final successful CI [run 42973198290](https://github.com/FlareZ123/liber-primus/actions/runs/42973198290).


## Prime-ordinal starts for the solved p56 clock: bounded negative

The 2016/2017 signed-message route gives page/prime-ordinal pairs **p13/#431**, **p21/#410**, **p34/#376**, and **p55/#321**, corresponding to primes **3001, 2819, 2579, 2131**. A natural, locked extension is to start the solved p56 clock at the matching one-based prime ordinal on each selected page, using the established operation \(P_i=C_i-(p_{n+i}-1)\pmod{29}\).

The test covered the full rune streams on p13, p21, p34 and p55. For p55 it also tested both orders suggested by “shed circumferences”: strip to the **43 interior runes before** decryption, or decrypt the full 76-rune page and then select those same 43 positions. The optional p56-style Möbius exception was tested separately: a ciphertext F (GP index 0) passes through without consuming a prime only where the zero-based Möbius function is zero. No nearby start offsets or fitted phases were searched.

Both implementation controls pass: the established p56 clock recovers its exact known plaintext with the known offset-56 literal-F skip, and a planted 43-rune stream encrypted under the p321 clock is recovered exactly.

| Target | Start prime | F handling | Score | Native q05 | Native q95 |
|---|---:|---|---:|---:|---:|
| p13 full | 431 / 3001 | none | −6.08515 | −2.38086 | −2.09771 |
| p13 full | 431 / 3001 | Möbius-F | −6.23153 | −2.38086 | −2.09771 |
| p21 full | 410 / 2819 | none | −5.92522 | −2.36459 | −2.08799 |
| p21 full | 410 / 2819 | Möbius-F | −6.36402 | −2.36459 | −2.08799 |
| p34 full | 376 / 2579 | none | −6.16395 | −2.37266 | −2.08470 |
| p34 full | 376 / 2579 | Möbius-F | −6.34380 | −2.37266 | −2.08470 |
| p55 full | 321 / 2131 | none | −6.53752 | −2.47101 | −2.01891 |
| p55 full | 321 / 2131 | Möbius-F | −6.65014 | −2.47101 | −2.01891 |
| p55 interior-first (43) | 321 / 2131 | none | −5.59876 | −2.56024 | −1.97253 |
| p55 interior-first (43) | 321 / 2131 | Möbius-F | −5.59876 | −2.56024 | −1.97253 |
| p55 full-then-strip (43) | 321 / 2131 | none | −6.37983 | −2.56024 | −1.97253 |
| p55 full-then-strip (43) | 321 / 2131 | Möbius-F | −6.39012 | −2.56024 | −1.97253 |

Scores are mean native-GP trigram log probabilities; each length has **800 deterministic native Shakespeare-GP control windows**. Every candidate falls far below even its matched native fifth percentile. The best is p55 interior-first at −5.59876, still 3.04 nats/rune below its native q05. The Möbius-F skip positions are p13 [36,50,60,90,125], p21 [84,160], p34 [44,162,212], p55 full [25]; the 43-symbol p55 interior has no such F positions.

**Decision:** reject the exact **route-prime-ordinal = p56-clock-start** hypothesis. This does not reject the 2016/2017 route as a page-selection clue, nor the p56 clock on its solved page; it shows that these route ordinals do not provide a usable start schedule for that clock. Do not expand into an arbitrary prime-offset sweep.

**Reproduce:** [single-file SFT](../sims/signed2016_fibonacci_prime_clock_start_sft.cjs). Inputs are the canonical [LP2 corpus](../resources/liber-primus/lp2-corpus.json), [transcription](../resources/lp2-transcription.txt), and fixed [Shakespeare control text](../resources/control/shakespeare_first300k.txt).

## Research consequence

The strongest consequence remains **target selection**: the signed-message/Fibonacci route still terminates at p55, but the source-derived prime ordinals do not select the solved p56 prime-totient clock as its decoder. The direct word-index, Fibonacci-prefix additive, terminal-block additive, and prime-clock-start readings are now bounded negatives. A successor must supply a different source-selected reversible operation; arbitrary offsets, phases, and key searches are not justified.

**Reproduce:** [page-route SFT](../sims/signed2016_fibonacci_page_route_sft.cjs) and [prime-clock-start SFT](../sims/signed2016_fibonacci_prime_clock_start_sft.cjs). The route inputs are the byte-preserved [2016 signed payload](../resources/historical/cicada2016-4gq25-outguess.asc), [2017 signed warning](../resources/historical/cicada2017-yEiTHhvF.asc), canonical [LP2 corpus](../resources/liber-primus/lp2-corpus.json), and [transcription](../resources/lp2-transcription.txt).
