# RAND 1955 million-digit table as a direct LP2 running-key source

**Status: completed finite original-cipher inversion; no unknown LP2 plaintext, key, or destination recovered.** Agent 3, 10 November 2026.

## Source-defined hypothesis

The 1955 RAND Million Random Digits was publicly distributed well before Cicada 3301. The [RAND Corporation data repository](https://github.com/RANDCorporation/milliondigits), pinned at source commit 09739b344efb3ed20602f34023232c67f20f212a (MIT license), supplies 20,000 rows of 50 decimal digits, for exactly one million digits. Its row numbers start at zero and must be stripped. Raw source SHA-256: **657622b6eba115bec547ddd83093d259b370294ae6efaa48f5c4e3b3690b862e**. Digit-only stream SHA-256: **8bafa9f9febef238048144203166ea616112610a21bda2c6069d4568c987de49**. Digit-frequency totals match the published RAND repository's 10-bin checksum.

Build a GP29 additive key from source-decimal groups of length 2 or 3 (overlapping or whole-group strides) and printed 5-digit groups (whole-group stride). For each group, convert to a rune shift by either integer remainder modulo29 or by scaled mapping floor(29×value/10^groupDigits). Examine forward or reversed digit readout and both additive signs. This is exactly **40** source conversion/direction/sign settings. All possible legal source start offsets are enumerated, up to approximately one million for each setting. The hypothesis is a direct no-keyskip additive GP29 stream. RAND is a source hypothesis only; there is no historical claim that Cicada intended it.

The eight original manuscript inputs are the first complete cipher-rune page of every punctuation-marked LP2 section: physical pages **0, 3, 8, 16, 23, 27, 33, 40**. Their 262, 217, 255, 267, 213, 234, 214, and 231 runes total **1,893** authentic LP2 symbols. At each source start, score the first **90** runes using GP-English unigram probabilities fitted *only* to the first 240,000 characters of the pinned Shakespeare control. Keep each setting's best twelve complete legal starts, then independently score runes 90–179 and its complete ciphertext page. These source-selected, original-data inputs produce **320 full-layout/page competitions**, each preceded by all eligible source-offset evaluations. Source seeds, alphabet orders, word guesses and language scores are never changed to force an LP2 candidate.

## Constructive source-key recovery

Encrypt a GP-English sample from the **disjoint last 60,000 Shakespeare characters** using actual RAND digit keys at an independently hidden offset **12,345**. Two genuine distinct source models are tested, each including probabilistic 81% repair when the tentative ciphertext rune equals its preceding published rune, with the proposed lag-six affine replacement. The first source plant has **eight** genuine output rewrites, the second **five**. Each is **recovered at rank one** out of its approximately one million legal source offsets, with a large score advantage.

| Planted source-key mode | Exact offset found | Full 262-rune score | 90-rune heldout score |
| --- | ---: | ---: | ---: |
| 2 digits, scaled, stride2, reverse, sign positive | **12,345** | **−3.050845** | **−3.042341** |
| 5 digits, modulo29, stride5, forward, sign negative | **12,345** | **−3.044546** | **−3.042032** |

Both complete source plants have genuine GP-English. The disjoint English heldout-register reference has mean log-likelihood **−2.978580 nats/rune** under the fixed training model; an independently uniform 29-rune output has reference mean **−4.270839**.

## Exact original-ciphertext result

| Physical LP2 page | Best full-page score/rune over 40 variants | Best independent 90-rune holdout score/rune |
| ---: | ---: | ---: |
| 0 | **−3.619464** | −3.754621 |
| 3 | −3.675719 | −3.756976 |
| 8 | −3.714839 | **−3.617454** |
| 16 | −3.758774 | −3.619333 |
| 23 | −3.654073 | −3.685050 |
| 27 | −3.696810 | −3.754091 |
| 33 | −3.631608 | −3.764753 |
| 40 | −3.681706 | −3.667102 |

No source offset among the tested models returns a sustained English-like GP29 decryption of the authentic LP2 input. Every original full-page winner scores **0.57 to 0.71 nats/rune below** the genuine-key plants, with independently selected page/model winners scattered across reduction, direction, sign and offsets. The best original holdout, **−3.617454**, is still **0.575 nats/rune below** the model-matched source controls, and its own complete page score is just **−3.794821**. This apparent holdout winner was selected after scanning numerous hypotheses; it is not decoded plaintext.

This source-conditioned negative weakens a direct page- or section-start additive pad using the RAND table. It does **not** test ciphertext-dependent key skips, extra/omitted runes, source-derived hashes, different plaintext registers, arbitrary nonaffine outer alphabets, other non-section-start target pages, or genuinely irregular internal source offsets. No claim about these families or genuine Liber Primus cipher architecture follows.

## Reproduce and follow-up

[Independent original LP2 key-index scanner with pinned RAND checksum and genuine-key plants](../sims/rand1955_running_key.py), [manual Actions workflow](../.github/workflows/rand1955-running-key.yml), and [successful corrected full run 42781706281](https://github.com/FlareZ123/liber-primus/actions/runs/42781706281). NumPy 2.2.6, Numba 0.61.2; all per-page settings and independent holdout results are preserved in the Actions run artifact. The first failed run had a zero-based source-row parsing mistake; the final executable corrects it. The later minor control-rank correction was executed with a successful complete rerun.

A worthwhile next source attack must include a *distinct*, independently tested rule, such as nonconsuming literal-F events or cipher-output collision-induced key skips. Repeating these 40 direct reduction/source-offset combinations is unnecessary.
