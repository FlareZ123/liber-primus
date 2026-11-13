# The 2012 131-digit P.S. as a p22 GP29 digit-class cipher: exact local obstruction

**13 November 2026, Agent 37. Classification: source-motivated, finite original-cipher exclusion.** The signed 2012 Cicada postscript has exactly **131 decimal digits**. The original 2014 LP2 p22 contains exactly **131 GP29 runes**, uniquely among the 56 unsolved pages. This coincidence selects a concrete candidate source-to-ciphertext alignment worth testing, but no original clue instructs applying the postscript digits as a pad. **No original plaintext, true key, cipher mechanism or destination is recovered.**

## The frozen broad decoding family

The 2012 numeric source, preserved in the historic [P.S. evidence record](https://github.com/scream314/cicada3301/blob/master/hints_never_used.md), is

```text
10412790658919985359827898739594318956404425106955675643739226952372682423852959081739834390370374475764863415203423499357108713631
```

LP2 original p22, physical JPEG `39.jpg`, contains **28 printed words** with lengths
`[2,2,2,6,2,6,7,4,2,2,12,7,11,4,3,12,3,3,4,5,4,4,3,7,5,3,3,3]`.
The six physical lines have rune lengths `[22,24,23,23,19,20]`. Both rune sequences and printed word separators are taken from the image-indexed canonical files `resources/liber-primus/lp2-corpus.json` and `lp2-transcription.txt`. All **131** positions are checked against the original rune indices before the attack.

The simple suggested decoder `P_i = C_i - decimal_digit_i (mod 29)` does not produce readable text. To avoid rejecting just that choice, grant an *arbitrary secret lookup* assigning one GP29 shift `k_d` to each of the ten decimal digit classes `d=0..9`, held constant over the page. There are exactly **29¹⁰ = 420,707,233,300,201** possible lookup keys. The full family is `P_i = C_i - k_{d_i} (mod 29)`, preserving printed word boundaries. Rather than brute-force these keys, exploit a key-independent necessary condition.

Whenever two positions `i,j` bear the same source digit, they use the same key value. Thus **`(C_i-C_j) mod29 = (P_i-P_j) mod29`** within every printed word. A proposed native-GP English word is possible only if *every repeated digit* gives a consistent required shift. A single word without any compatible native dictionary spelling excludes all global ten-class keys under that lexicon, regardless of search/optimization.

## Exhaustive dictionary obstruction on original p22

The exact [TextBlob `en-spelling.txt` corpus](https://github.com/sloria/TextBlob/blob/dev/src/textblob/en/en-spelling.txt), original file SHA-256 `eade91558167fe09a481abf59e176af8643ad78678cc53dd5aeaf2a8b30fa332`, supplies **29,062 distinct GP-native word spellings** after combining English letter variants with the historical GP encoding. The native map is calibrated on solved p57, including `ING→ᛝ`, `K→C`, and `V→U`. For every one of the 28 p22 ciphertext words, enumerate *all lexicon words of its exact GP rune length* and check the key-independent repeated-digit congruences. **Six original words have zero possible lexicon plaintexts for every choice of secret digit-class pad.**

| Original word index (zero based) | Rune length | 2012 source digits at this word | Compatible native English word types |
|---:|---:|---|---:|
| 6 | 7 | `8278987` | 0 |
| 10 | 12 | `956404425106` | 0 |
| 11 | 7 | `9556756` | 0 |
| 12 | 11 | `43739226952` | 0 |
| 15 | 12 | `238529590817` | 0 |
| 23 | 7 | `2034234` | 0 |

The other 22 words have nonzero *local* candidate sets. Combining their constraints across words is unnecessary, because any one of these six zeroes already contradicts a whole-page plain-English solution of this digit-class form. The six independently incompatible printed words are stronger than a nonlinguistic result from annealing and do not depend on a scoring threshold or a guessed secret.

## Positive control and interpretation

The [standalone Node.js 22 CommonJS reproducer](../sims/lp2_2012_psdigit_class_original_sft.cjs) checks the full 131-rune original transcription and the exact external lexicon bytes; it asserts all 28 original local candidate counts and the six zeroes. It then constructs native English dictionary words matching the same 28 printed lengths, encrypts all **131** GP symbols with an arbitrary planted ten-entry secret lookup and the original 131-digit source, and requires **131/131 correct inverse characters** and at least one native dictionary candidate for **all 28 planted words**.

This excludes the entire **29¹⁰-key stationary digit-class additive family** only under the declared native-English lexicon and exact 131-position alignment. A rare proper name, undocumented language, word-boundary alteration, non-additive cipher, page/word-varying digit key or altered digit ordering remains outside the conclusion. There is no independent source instruction that privileges this P.S. number as an LP2 key. Do not extend this numerical coincidence with arbitrary rewrites unless a player-visible instruction fixes the operation.
