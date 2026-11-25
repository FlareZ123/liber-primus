# Dual parity-space GP27+2, consuming q8: exact finite capacity exclusion

Issue #2712. Agent 13, 2026-11-25. Original scope: physical p54 black-body indices [9,232) followed by all 76 indices of physical p55; 299 positions. Ignore every printed separator. Freeze GP29 residue indices 12 (EO) and 22 (OE) as odd/even preceding-word-length space codes, respectively; all other symbols are letters. Every symbol consumes the key. All signs and phase offsets are represented by arbitrary eight-digit additive keys modulo 29. No F hold.

## All-key bound

At position i, key digit k[i mod 8] determines whether the decoded symbol equals 12 or 22. For each phase p and each of 29 possible residues k, count space events W[p,k]. The sum of independent maxima is an exact upper bound for every one of 29^8 keys. Original per-phase maxima: 6,6,5,7,8,6,6,5, total **49**.

Use also a necessary near-delimiter condition. For two space events separated by distance d:
- d=1 is impossible (empty word).
- d=2 forces the later code to 12, since the intervening word has one rune.
- d=3 forces 22 (two runes).
- d=4 forces 12: either three intervening letters or two one-letter words separated by an intermediate space at distance 2.
These statements hold even when the observation window starts in a word. For every phase pair, intersect these binary compatibility constraints over all source position pairs at distances 1–4. Maximize W[p,a]+W[q,b] over the compatible 29×29 digit pairs. For each perfect matching of eight phases, sum the four pair maxima; minimize over all 105 matchings. This gives a stronger **44-space upper bound**, without assuming independence of overlapping phase constraints or enumerating all keys. No claim that the bound is attainable. The first space's parity is unrestricted; the final word can be incomplete.

## Native controls and power

In all nine sections of resources/external/relikd-solved-gp29-native-v1.json, neither EO nor OE occurs as a letter. Split exact source strings into contiguous GP rune runs; append the appropriate parity space after every run. This normalizes punctuation to word separators and is a stated model, not an assertion that Cicada used such encoding. Enumerate every 299-symbol window within each long enough section:

| Section | Windows | Minimum | Maximum |
|---|---:|---:|---:|
| 0_welcome | 341 | 53 | 63 |
| 0_koan_1 | 690 | 59 | 67 |
| 0_loss_of_divinity | 638 | 58 | 69 |
| jpg107-167 | 109 | 63 | 68 |

The finite native floor is 53 (1778 windows). Even the grammar-free 49 bound falls short; the joint 44 bound misses it by 9. This rejects the hypothesis that this ciphertext decodes under the frozen model to an encoded passage with a native-reference-compatible space count. It does **not** prove impossibility for arbitrary artificially long-word language or different cipher clocks, and does not exclude H-decoy generally.

For positive controls, seed 2712 selects an independent 299-symbol native window and eight residue key digits per section. The solver receives ciphertext positions 0–222, the parity grammar, and the minimum 223-symbol window space count from other sections only. Exhaustive capacity branch-and-bound intersects phase-pair domains, prunes by sum of remaining phase maxima, and validates full consecutive-delimiter parity at each surviving complete key. Maximizing decoded space count uniquely recovers the true key in all four plants. Freeze the recovered key before decoding positions 223–298; require exact plaintext and forward replay.

| Control | Fit floor | Fit max | Optimal keys | Held-out exact |
|---|---:|---:|---:|---:|
| welcome | 41 | 44 | 1 | 76/76 |
| koan_1 | 38 | 49 | 1 | 76/76 |
| loss_of_divinity | 38 | 50 | 1 | 76/76 |
| jpg107-167 | 38 | 50 | 1 | 76/76 |

The plants are algorithmically blind (key and held-out plaintext are not used in the fit), not independent human blind tests. The tested finite corpus is not a universal bound on English. No original key or plaintext recovered.

## Reproduction

`node sims/lp2_dual_parity_space_q8_capacity_sft.cjs`

Actual experiment executed in the connected V8 runtime against fetched repository JSON bytes; the CommonJS wrapper itself was not executed in Node CI. Script commit e7918f5aa73617a399425482adf338802ede444a. No original key search is necessary after the proven joint upper bound.
