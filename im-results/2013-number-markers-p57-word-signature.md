# 2013 NUMBER whitespace markers select two p57 word signatures

**Classification:** source-derived cross-stage selector hypothesis. This is a reproducible alignment, not a decryption or proof of intended continuation.

## The corrected 2013 inputs

The archived first-onion README and reconstructed `server.py` place the two double spaces **after primes 29 and 3257** (between 29/31 and 3257/3259). The whitespace therefore selects **29 and 3257**, not the following values 31 and 3259. See:

- [2013 first-onion README](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md)
- [Reconstructed server.py](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/server.py)
- [Agent 3's source correction](../communications/agent39/20261111T065008Z_agent3_telnet-double-space-marker-correction.md)

Under the documented NUMBER behavior:

| Selected input | NUMBER operation | Prime-factor signature |
|---:|---|---|
| 29 | Reverse to 92; 92 is composite, with divisors 1, 2, 4, 23, 46, 92 | Distinct prime factors 2 and 23 |
| 3257 | Reverse to 7523; 7523 is prime | `+` |

The project already uses a downstream **factor-index reduction** for 2014 square cells: take the distinct prime factors of the NUMBER result and sum their GP alphabet indices modulo 29 (see `sims/onion7_parable19_nestedprime_sft.cjs`). For 29, primes 2 and 23 have GP indices 0 and 8, so the reduction is 8, the GP rune **H**. For 3257, the result remains **`+`**. This H/+ signature is an analytic reduction, not the literal text returned by the 2013 server.

## Exact match in the 19 p57 body words

Using the existing GP prime weights, the 19 human-readable body-word sums on p57 are:

| Position | Word | Prime sum | NUMBER/factor-index signature |
|---:|---|---:|---|
| 1 | LIKE | 184 = 2³×23 | H |
| 2 | THE | 72 | F |
| 3 | INSTAR | 280 | O |
| 4 | TUNNELING | 339 | U (with factor 113 outside GP29) |
| 5 | TO | 66 | R |
| 6 | THE | 72 | F |
| 7 | SURFACE | 246 | J |
| 8 | WE | 86 | P |
| 9 | MUST | 186 | I |
| 10 | SHED | 232 | N |
| 11 | OUR | 21 | U |
| 12 | OWN | 55 | R |
| 13 | CIRCUMFERENCES | 451 | R |
| 14 | FIND | 151 | `+` |
| 15 | THE | 72 | F |
| 16 | DIVINITY | 376 | X |
| 17 | WITHIN | 115 | H |
| 18 | AND | 215 | P |
| 19 | EMERGE | 300 | U |

The two 2013 marker signatures therefore occur **uniquely and in the same order** in the p57 word list:

- `NUMBER(29)` → H, matching **LIKE** at body-word position 1. Its word sum 184 is exactly twice 92, and shares the same distinct prime factors {2, 23}.
- `NUMBER(3257)` → `+`, matching **FIND** at body-word position 14. The word sum 151 is prime and reverses to itself, so it also returns `+`.

This is independent of the unselected 5×19 rectangle hypothesis. It uses the 19 source-visible p57 words, their GP-prime sums, the corrected 2013 marker inputs, and the already-used factor-index reduction.

## Why it may matter

The selected words are not arbitrary labels: the parable reads “LIKE THE INSTAR ... FIND THE DIVINITY WITHIN AND EMERGE.” The marker order H then plus selects LIKE then FIND in the same order. The 2016 signed message's “words are the map” / “numbers are the direction” language is compatible with a word-level map interpretation, but it does not itself specify the factor-index reduction or the next operation.

## Limits and next discriminating question

- The 2013 server returns all divisors for composite results; H is obtained only after applying the project's downstream distinct-prime-factor/index reduction. Keep this distinction explicit.
- The match selects two words; it does not yet give a route, destination, plaintext for an unsolved page, or a key.
- Do not revive the unsupported 3259→D·IA→LP chain: 3259 is not selected by the double-space marker.
- The next useful decision is whether an independent clue fixes a continuation from the selected word positions (1 and 14), their prime sums (184 and 151), or the ordered H/+ signature. Do not search arbitrary shifts or mappings until such a selector is identified.

**Status:** retain as a candidate source-derived human solve-path lead for Director review; no dependent cipher search is justified yet.
