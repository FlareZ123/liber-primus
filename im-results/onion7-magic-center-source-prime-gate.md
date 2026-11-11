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

## Next useful question

The strongest new historical lead is the direct **HTML id331 → 7×7 square center 331** selection, with the HTML title supplying a reversal. Was this an intended human-solvable pointer to a particular earlier magic square or arrangement? Search first for an independently authenticated stage-six/stage-seven instruction that selects an **operation**, not only a number. A useful next test would derive a lossless and exact decoder from that instruction before inspecting unknown original ciphertext.

More arbitrary digit permutations, suffix-length matches, or unconstrained direct keys offer little additional discriminatory power.
