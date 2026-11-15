# Original LP2 typed punctuation: nine-chapter phi-prime clock transfer

**Decision, Agent 38, 15 November 2026, Director #1085.** One straightforward author-era **two-level state rule** has a complete reversible original-rune inverse, but fails to reveal any unknown plaintext. The first-level state is a continuous GP29 prime-totient key within each physically marked chapter, reset only when a new original red-heading chapter begins. The second-level state treats the distinctly printed four-dot stops, comma zigzags, inline 10/13-dot ornaments and the 256-cell numeric table as nonconsuming punctuation. This borrows solved p56's consecutive prime-minus-one shifts, but **omits its historically essential plaintext-F bypass**. The tested ordinary additive clock is narrower than the solved cipher. The 2014 author never expressly orders extending p56's cipher to earlier chapters, so the transfer is a candidate rather than an authenticated instruction.

## A finite source-specified clock

The original 58-page ink annotation supplies nine red-heading starts at physical p0,3,8,15,23,27,33,40,54. The associated nine unknown text groups have lengths **729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308** GP29 runes. Every start has actual red ink at page-local offset zero; none is fitted to ciphertext. The original punctuation inventory distinguishes **138 visible four-dot diamond stops, 5 three-dot zigzags, 1 ambiguous detached square, and 31 large 10/13-dot marks** across unknown p0–55. Some large marks lie inside a chapter; p49's red 10-dot mark leads into the rune-free 256-byte grid, and chapter p40–53 resumes on p51.

The independently solved p56 cipher consumes consecutive shifts **prime(j)−1** per **non-F plaintext rune**; plaintext F is emitted verbatim and does not advance the key. Its four-dot stop, internal 13-/10-dot ornaments, and printed 64-byte digest do not consume key positions. A shift reset after p56's initial four-dot stop would decode its sixth true rune as E rather than **W**. This is a real source-calibrated reason to let *small stops and inline large ornaments pass*, rather than a postselected convenience.

Freeze for each complete nine-chapter source interval (clock zero at the first colored rune):

```text
P[j] = (C[j] − (prime(j+1) − 1)) mod 29
C[j] = (P[j] + (prime(j+1) − 1)) mod 29
```

No punctuation consumes an extra prime. Printed hyphens, line wraps and physical page boundaries inside a chapter preserve the running key index, including the real p54→55 continued word and the p49→51 numeric interruption. This has no guessed seed, pagewise fitting or key-alphabet fitting. It intentionally **advances on every ciphertext rune**, thereby excluding p56's source-authenticated F exception from the tested model.

## Original and positive-control outcome

| Original physical pages | Original GP runes | Cipher-inverse IoC |
| --- | ---: | ---: |
| 0–2 | 729 | 0.033988303 |
| 3–7 | 1145 | 0.034282530 |
| 8–14 | 1729 | 0.034388857 |
| 15–22 | 1903 | 0.034485369 |
| 23–26 | 1021 | 0.034837049 |
| 27–32 | 1433 | 0.034537069 |
| 33–39 | 1680 | 0.034338750 |
| 40–53 | 3008 | 0.034336327 |
| 54–55 | 308 | 0.035428741 |
| **All unknown** | **12956** | **0.034463968** |

The original cipher baseline is **0.034478398** and the genuine solved p57 GP runes have native IoC **0.062709966**. Frozen withheld physical p40–55 (3,316 runes) decodes to IoC **0.034330191**, with no native words in its beginning. The very first decoded original chapter begins `X G X Y AE W J J OE IA B X D E D...`, not a readable GP paragraph. An exact 12,956-rune source-native solved-p57 repeat plant encodes and recovers under the **same nine actual original lengths and same punctuation rule**; all original ciphertext runes reencrypt identically. The first six historical p56 runes independently reproduce **AN END W**, which validates only four-dot nonreset **before** the page's plaintext-F bypass at local rune offset 56. On the complete 85-rune p56 page, this all-rune-consuming inverse differs from the authentic F-transparent inverse at **29 offsets (56–84)**. The prefix test is therefore not a full historical-cipher positive; see [the source-native known-key gate](lp2-ftransparent-word-lexical-viterbi.md).

[Self-contained Node22 CJS source](../sims/lp2_typed_punctuation_chapter_phi_sft.cjs) reads original GP corpus, original ink and image-audited mark inventory. The exact original decoded values above were also computed independently from the source indices; the committed Node program has not separately executed in CI this invocation.

**Decision:** retire **this specific all-stops-pass, red-heading-chapter-reset, all-rune-consuming prime-minus-one additive model**, without generalizing to all possible punctuation ciphers. The physical ink supplies valid record boundaries and p56 supplies a working per-rune clock, but **no independent creator instruction selects p56's key for the unknown chapters or gives a different typed-mark key update**. Additional punctuation-specific mode shifts, fixed-key allocations and mark-value KDFs would require another independently sourced instruction. The authentic plaintext-F skip is a distinct known mechanism, but its nine-chapter branch-aware inverse is not tested here. The 2016 “words are the map” text does not specify such a grammar. No unknown LP2 plaintext, key or destination recovered.
