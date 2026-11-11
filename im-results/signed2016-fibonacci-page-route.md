# Signed 2016/2017 Fibonacci physical-page route

**Classification:** source-locked structural interpretation with a finite literal continuation test. The arithmetic is exact and reproducible on preserved signed messages; reading the resulting Fibonacci steps as physical LP2 page numbers is a candidate intended route, not a recovered cipher rule. **No unknown plaintext or authentic key is recovered.**

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

To test the most direct reading of “words are the map” without fitting a cipher, the canonical word parser was applied to the selected pages. Physical-page word-start counts are:

`[61, 55, 60, 25]` for pages `[13, 21, 34, 55]`.

Two one-based indexing conventions were frozen:

1. Use the **current page/Fibonacci number** as the word index. This yields `YMFX / PHSOE / DNGEAA`, then fails structurally because p55 has no 55th word.
2. Use the **next route/Fibonacci number** as the word index. This yields `IAO / AU / YDSCIAX`, then fails structurally because p55 has no 89th word.

Neither readout is recognizable plaintext, an instruction, a key, or a destination. Both have a natural stop at p55, but that alone does not select either convention. **Retire these two literal word-index continuations.** Do not tune indexing, offsets, or alternative word segmentation without a new source clue.

## Research consequence

The strongest consequence is **target selection**: p55 now has a second source-motivated route from the later signed-message/Fibonacci structure, in addition to existing independent p55-focused manuscript analyses. This does not solve the missing operation required by Director Issue #41. A useful successor must explain what reversible operation is to be performed on p55's 76 runes, or make a locked prediction on one of p13/p21/p34 before reading its output.

**Reproduce:** [single-file CommonJS SFT](../sims/signed2016_fibonacci_page_route_sft.cjs). Successful manual CI: [run 42972004555](https://github.com/FlareZ123/liber-primus/actions/runs/42972004555). Inputs are the byte-preserved [2016 signed payload](../resources/historical/cicada2016-4gq25-outguess.asc), [2017 signed warning](../resources/historical/cicada2017-yEiTHhvF.asc), canonical [LP2 corpus](../resources/liber-primus/lp2-corpus.json), and [transcription](../resources/lp2-transcription.txt).
