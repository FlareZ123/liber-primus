# Legacy PHP Mersenne Twister: complete LP2 opening-word crib domain

**Evidence class:** fully enumerated, tightly conditional cryptanalytic negative. Agent 39, 2026-11-10. No unknown LP2 plaintext, key, or decryption algorithm recovered.

## Exact source-to-plaintext hypothesis

The canonical unsolved LP2 opening has three ciphertext rune words of lengths **8, 5, and 4**, or 17 runes in all; the baked first-17-rune array in `sims/php_mt_wordscan.c` matches the first 17 GP symbols of `resources/lp2-transcription.txt`. Test whether their plaintext is a sequence of three English GP-encoded words under the **historical PHP 5.2.1–7.0 `mt_rand()`**, initialized with one unsigned 32-bit integer.

For each seed, the instrument tests five reductions of 31-bit random outputs to modulo-29 digits (uniform scale into 0–28, remainder 29, uniform scale into 1–28, remainder 28 + 1, low-byte remainder 29), additive and previous-ciphertext-chained ciphertext constructions, and signs ±1. Each word allows at most one intervening consumed draw, globally at most two. A discarded draw is legal only if it would have produced the preceding ciphertext rune, modelling collision-triggered key rejection. The initial key offset is **zero**. This is an explicit hypothesis, never an established LP2 cipher.

The finite dictionary is generated from `resources/control/shakespeare_first300k.txt` with `sims/php_wordlist.cjs`: original occurrence words and five suffix forms, GP grapheme encoding, all restricted to the specified rune lengths. It has **5,443 8-rune words, 3,431 5-rune words and 1,532 4-rune words**. The source UTF-8 SHA-256 is `8a73136f699d7ed17260b916b0797fafdfe6213bbbcf1914ba5327134b7c863e`; binary dictionary SHA-256 is `7e1befb52a0a77512d7a7eddf0de1173877a4a705886e2eeff12a61b4802402d`.

## Exact full-domain outcome

[Full search workflow run 42756938529](https://github.com/FlareZ123/liber-primus/actions/runs/42756938529) split `[0,4294967296)` into **128 nonoverlapping intervals of 33,554,432** seeds. Every shard finished successfully. [Independent reconciliation workflow run 42760231024](https://github.com/FlareZ123/liber-primus/actions/runs/42760231024) downloaded each original shard artifact and asserted its exact interval width, the single summary record, candidate seed ranges and candidate-line counts, and the total across the 32-bit domain.

| Search counter | All 4,294,967,296 tested seeds |
| --- | ---: |
| First-word dictionary candidate paths | **1,107** |
| First two consecutive word candidates | **0** |
| All three word candidates | **0** |

The 1,107 counter is *candidate paths* across reductions, signs and possible draws, not necessarily 1,107 different seeds. Because the second word never matched after the first, no third-word candidate exists. Search logging was exhaustive for all paired and three-word hits, and their aggregate lists were empty.

Positive controls guard actual key recovery: six historical PHP 31-bit MT seed reference vectors are bit-exact, and an artificial seed **777** enciphering the GP words `DIUINITY LIGHT HOLY` (equivalent to English `DIVINITY LIGHT HOLY` under GP V→U conversion), chained, sign +1, scale reducer, produces an exact decoded three-word **HIT**. The successful [100,000-seed pilot run 42756748219](https://github.com/FlareZ123/liber-primus/actions/runs/42756748219) also proved the reconciliation pipeline by a subsequent successful aggregate run 42758738783.

## Scope and decision

The declared **PHP integer-seed / English 8–5–4 crib / zero-start / constrained rejection** family has no candidate consistent with its first two LP2 ciphertext words. This is a concrete key-recovery exclusion under its dictionary and cipher assumptions. It does not eliminate PHP-based generators with different seed derivation, starting offsets, alphabet/register, nonlinear outer bijection, rewrites that replace rather than reject ciphertext, different key consumption or an English opening absent from the dictionary. An unknown language may also be outside the model.

Tools: `sims/php_mt_wordscan.c`, `sims/php_wordlist.cjs`, `sims/aggregate_php_mt_crib.cjs`. On-demand workflows: `.github/workflows/php-mt-crib-sweep.yml` and `.github/workflows/php-mt-crib-aggregate.yml`. All intermediate candidate data is tied to workflow artifacts. Do not re-enumerate the same finite seed domain unless a new, source-justified hypothesis changes the actual tested model.
