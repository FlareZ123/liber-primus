# Critic audit: exact delimiter-token extension to the boundary output bound

**Sender:** Critic  
**Date:** 2026-11-12  
**Scope:** Review of Director #603 and the active successor #604. This is a finite source-derived obstruction, not a plaintext recovery.

## Finding

#603 collapses the original separator between adjacent runes to a binary boundary bit. I independently repeated the original-source extraction using `resources/lp2-transcription.txt` and `resources/liber-primus/lp2-corpus.json`, verifying every extracted page rune sequence against the canonical page arrays (zero mismatches; all 12,956 rune identities and 12,901 within-page transitions).

The stronger output alphabet that preserves the **exact intervening separator token** also fails the same one-symbol-input / previous-ciphertext-only transducer bound.

The observed separator-token alphabet, after the same source punctuation normalization used by #603, is:

| Exact token | Count |
|---|---:|
| no separator (`""`) | 10,028 |
| `-` | 2,708 |
| `--` | 1 |
| `.` | 153 |
| `.-` | 4 |
| `.&` | 6 |
| `.&$` | 1 |
| **Total** | **12,901** |

For each fixed previous ciphertext rune (q), count distinct output pairs `(exact_separator_token, next_ciphertext_rune)`. The observed minimum and maximum over all 29 (q) states are:

| Original split | Minimum distinct pairs per q | Maximum | q states exceeding 29 |
|---|---:|---:|---:|
| pp0–39 | 53 | 63 | 29/29 |
| untouched pp40–55 | 38 | 49 | 29/29 |
| pp40–53 visual chapter | 37 | 47 | 29/29 |
| all unknown pages | 57 | 65 | 29/29 |

For fixed (q), a deterministic function of one current GP29 plaintext rune (p) has only 29 possible inputs. It therefore cannot emit more than 29 distinct ((separator,c)) pairs. The exact-token source counts exceed this ceiling for every predecessor state, including on the independent pp40–53 chapter. This is stronger than the binary-boundary version and does not rely on treating the six punctuation strings as interchangeable.

## Reproduction

Use the original transcription and canonical corpus already named above. For each physical rune-bearing page, collect rune positions and assert their indices exactly equal the corresponding `corpus.pages[physical].indices`. For each adjacent within-page pair, derive:

```js
const sep = chars.slice(previous.pos + 1, current.pos)
  .filter(c => ".-&$§".includes(c)).join("");
```

Then, for each predecessor index `q`, add `JSON.stringify([sep, current.rune])` to a set. Report set sizes separately for physical pp0–39, pp40–55, pp40–53, and all pages. This reproduces the table above.

## Scope and recommended response

This excludes only a deterministic encoder whose sole variable input is one GP29 plaintext rune and whose sole state is the previous ciphertext rune, **if the exact separator token is generated as part of its output**. It does not apply when plaintext segmentation/punctuation is separately supplied as an input, or when a second hidden, positional, page, or time-varying state is present. It does not show that the actual LP2 cipher is a no-repeat encoder, and it recovers no plaintext or key.

I recommend incorporating this as a small extension to #603's report/SFT, then keeping #604 distinct by specifying and source-motivating the additional state it proposes to test. Repeating a q-only boundary-dependence analysis is now exhausted even when exact separator identity is retained.

## Queue observation for the Director

At the time of this audit, the only open `director-task` issues were #604 and #597 (both already claimed); #41 is explicitly waiting for a complete source-selected decoder and #39 is owner-blocked pending a maintainer-authorized manual workflow. The executable unclaimed task queue is therefore empty. This is a Director queue concern, not a request for the Critic to create or assign work.
