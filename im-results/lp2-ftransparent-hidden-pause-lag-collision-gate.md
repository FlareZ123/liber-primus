# Exact hidden-pause collision bounds for the authentic plaintext-F clock (#2521 and #2606)

**Decision:** In physical LP2 p40–53 (one continuous chapter clock, arbitrary starting phase), the original ciphertext is incompatible with every one of the 96 frozen native-GP control windows for **all periods 2–32** even permitting every possible subset of ciphertext F to be transparent. #2521 established q8/q13; #2606 covers the other 29 periods. Each statistic independently separates the other 29 periods even after conservative active-length normalization. The same invariants pass both authentic encrypted LP1 controls and four additional independent random-key plants including harmonics. This is a finite-register all-key obstruction, not a proof about all conceivable prose or a recovered LP2 key.

## Model and theorem

The authentic solved LP1 WELCOME and second KOAN encryption rule is
```
P_i = F  => C_i = F, k does not advance
P_i != F => C_i = (P_i + K[k mod L]) mod29, k advances
```
A ciphertext F is not necessarily a transparent F. Delete the actual transparent positions, producing active streams (P') and (C'). For any pair of active indices separated by an integer multiple of L, their phase is identical. Thus
```
P'[i] == P'[i-d] iff C'[i] == C'[i-d], d = L,2L,3L.
```
For the same reason equal length-2 blocks at these distances are preserved. This remains true under any fixed bijection for each phase, not merely an additive shift. It is independent of the key digits, initial phase, and printed word boundaries. It allows an arbitrary key per tested chapter, but not an unmodelled reset inside the chapter.

For a given ciphertext, permit deletion of **any** subset of its visible F runes, not just subsets compatible with a particular key. Compute exact minima/maxima of each invariant over these relaxed paths by dynamic programming on the most recent (3L+1) consumed rune values. At F, both consume and skip branches are retained; every other rune consumes. The future increment to either count depends only on this suffix. Therefore merging states with the same suffix while keeping componentwise minima and maxima is exact for each scalar statistic. Joint bounds are a safe rectangular relaxation; passing the bounds is not a feasible-key witness. A compatible key/clock is necessarily in the relaxation.

A toy sequence with five optional F deletions was exhaustively enumerated and matches the DP exactly: equal-rune range 3–7; equal-bigram range 0–2.

## Frozen experiment and authentic positive controls

The target, periods, statistics and comparison domain were frozen in [#2521 comment 7124769127](https://github.com/FlareZ123/liber-primus/issues/2521#issuecomment-7124769127) before the target results. Primary target p40–53 (3008 runes, 125 visible F). Supplementary scopes are the other eight physical chapters and the whole 12956-rune continuous tape. For each scope, select 32 evenly spaced, contiguous windows of identical **visible** length from each of the existing Shakespeare, Emerson and Gibran native-GP controls. Remove all actual plaintext F in each window. There is no reliance on printed word lengths or any ciphertext-derived word segmentation. Windows overlap and are descriptive finite controls, not independent significance trials.

Replay exact original WELCOME (515 runes, period 8 DIUINITY) and second KOAN (319 runes, period 13 FIRFUMFERENFE) with the already pinned native solved sources, requiring every ciphertext rune to agree.

| Authentic original | Period | Printed Fs | Actual transparent Fs | True rune count | DP rune range | True bigram count | DP bigram range |
|---|---:|---:|---:|---:|---:|---:|---:|
| WELCOME | 8 | 25 | 11 | 88 | 68–102 | 9 | 6–11 |
| KOAN | 13 | 5 | 2 | 65 | 57–69 | 10 | 8–11 |

Both active plaintext statistics equal their exact active ciphertext statistics. WELCOME has 14 ordinary encrypted F outputs and KOAN has 3, confirming that a fixed visible-F deletion rule would be invalid.

## Primary original result

Counts aggregate the three frozen active distances L, 2L and 3L. Each displayed native minimum is the minimum of that source's 32 windows.

| Period | Exact original rune range | Native minima S/E/G | Exact original bigram range | Native minima S/E/G | Joint native passes |
|---|---:|---|---:|---|---:|
| 8 | 220–391 | 493 / 520 / 500 | 5–19 | 44 / 38 / 46 | 0/96 |
| 13 | 223–425 | 464 / 497 / 499 | 6–24 | 34 / 41 / 50 | 0/96 |

Thus each statistic independently rejects every primary control window, even before enforcing the common unknown additive key. The peak number of live distinct history states was 64 in both searches. No beam, mask cap or heuristic pruning.

## Remaining periods 2–32 (#2606)

The target and comparison register are unchanged. The original q8/q13 experiments are not rerun. For each other period (q=2,3,\ldots,32), the exact suffix DP uses the last (3q+1) active runes and counts collisions aggregated at (q,2q,3q). The native window's active length is fixed by its plaintext F holds. For an additional conservative rate comparison, divide the original maximum count by the minimum possible number of opportunities, (3(3008-125)-6q) for rune pairs and three fewer for bigrams. Divide each native count by its actual opportunity count (3(3008-H)-6q) (and minus three for bigrams). This upper bound relaxes the dependence between collision count and number of holds and cannot reject a valid match spuriously.

All 29 new periods reject all 96 windows separately on both raw counts and normalized rates. Peak live history size is 1,024. The narrowest conservative normalized rune gap is 0.001935146 at q28; the narrowest bigram gap is 0.000142683 at q27. No surviving period justifies an original key recovery sweep.

| Period | Rune: original max / native min | Bigram: original max / native min | Peak states | Windows passing |
|---:|---:|---:|---:|---:|
| 2 | 345 / 409 | 13 / 20 | 8 | 0 |
| 3 | 354 / 481 | 16 / 31 | 9 | 0 |
| 4 | 358 / 460 | 14 / 29 | 21 | 0 |
| 5 | 379 / 492 | 22 / 30 | 37 | 0 |
| 6 | 367 / 496 | 17 / 36 | 63 | 0 |
| 7 | 370 / 493 | 16 / 28 | 64 | 0 |
| 9 | 375 / 493 | 20 / 36 | 64 | 0 |
| 10 | 389 / 495 | 27 / 37 | 64 | 0 |
| 11 | 401 / 482 | 25 / 42 | 64 | 0 |
| 12 | 399 / 495 | 20 / 35 | 64 | 0 |
| 14 | 427 / 491 | 27 / 36 | 86 | 0 |
| 15 | 419 / 482 | 23 / 44 | 127 | 0 |
| 16 | 399 / 487 | 15 / 38 | 128 | 0 |
| 17 | 420 / 479 | 20 / 39 | 128 | 0 |
| 18 | 410 / 498 | 26 / 44 | 128 | 0 |
| 19 | 418 / 483 | 19 / 41 | 136 | 0 |
| 20 | 442 / 493 | 31 / 45 | 227 | 0 |
| 21 | 426 / 475 | 30 / 34 | 256 | 0 |
| 22 | 406 / 501 | 22 / 32 | 256 | 0 |
| 23 | 431 / 476 | 28 / 46 | 256 | 0 |
| 24 | 441 / 501 | 33 / 38 | 418 | 0 |
| 25 | 432 / 490 | 20 / 28 | 511 | 0 |
| 26 | 442 / 484 | 25 / 35 | 512 | 0 |
| 27 | 437 / 482 | 36 / 38 | 512 | 0 |
| 28 | 440 / 464 | 29 / 37 | 512 | 0 |
| 29 | 430 / 494 | 33 / 35 | 512 | 0 |
| 30 | 444 / 485 | 40 / 43 | 605 | 0 |
| 31 | 450 / 511 | 39 / 41 | 978 | 0 |
| 32 | 426 / 495 | 34 / 37 | 1024 | 0 |

Four independent random-key plants test the identical key-free bound (no key passed to the DP): Shakespeare q2 (3008 runes), Emerson q17 (3008), Gibran q32 with primitive q16 (1200), Shakespeare q30 with primitive q15 (1200). The genuine active plaintext and ciphertext counts agree, and all four counts lie inside the respective exact relaxed bounds. Twenty-four random toy tapes independently exhaust all F masks and match the DP minima/maxima. The initial original computation used the already established DP; the new plants were subsequently checked before publishing. No key inference is claimed on these controls.

[New SFT](../sims/lp2_fhold_period2to32_exact_gate_sft.cjs) and [complete 29×96 count, rate and control data](lp2-fhold-period2to32-exact-gate-output.json). Actual repo data and exact algorithm executed in connected V8; no CI execution claimed.

## Supplementary original scopes

| Pages | Runes | Period8 max rune / bigram | Period13 max rune / bigram | Joint passes 8 / 13 (each /96) |
|---|---:|---:|---:|---:|
| 0–2 | 729 | 94 / 3 | 101 / 1 | 0 / 0 |
| 3–7 | 1145 | 139 / 7 | 141 / 9 | 0 / 0 |
| 8–14 | 1729 | 210 / 10 | 218 / 14 | 0 / 0 |
| 15–22 | 1903 | 254 / 9 | 256 / 14 | 0 / 0 |
| 23–26 | 1021 | 128 / 4 | 145 / 11 | 0 / 1 |
| 27–32 | 1433 | 176 / 8 | 210 / 7 | 0 / 0 |
| 33–39 | 1680 | 208 / 6 | 186 / 8 | 0 / 0 |
| 40–53 | 3008 | 391 / 19 | 425 / 24 | 0 / 0 |
| 54–55 | 308 | 42 / 1 | 35 / 4 | 0 / 2 |
| 0–55 continuous | 12956 | 1657 / 68 | 1749 / 96 | 0 / 0 |

Whole-book period8 source rune minima are 2252/2362/2399 and bigram minima 204/238/235; period13 minima are 2197/2378/2288 and 204/231/247. The three surviving supplementary control windows at period13 merely fall inside both independent scalar intervals; they are not actual feasible key/clock assignments.

## Research decision

Retire the fixed period **2–32** F-transparent continuous-chapter route for the frozen p40–53 native register, and treat whole-book q8/q13 reuse as very strongly disfavored under the same register. The result expands the fixed-phase theorem by allowing latent plaintext-F pauses exactly, and is independent of the previous all-secret period8 digit enumeration. Do not repeat a heuristic key search for these same assumptions. It does not exclude a distinct non-native register, different period, state-dependent bijection, transposition or independently source-selected internal reset. For the original q8/q13 supplemental experiment, the only unresolved small-scope windows are period13 p23–26 and p54–55; a surviving relaxed window is not a basis for speculative extra reset tuning.

For a genuinely different hypothesis, an observed reset schedule or alternate register independently selected before comparing the ciphertext would change the model. Nothing here recovers unknown LP2 plaintext or key.

Reproduction: [standalone Node22/CommonJS SFT](../sims/lp2_ftransparent_hidden_pause_lag_collision_sft.cjs), commit b2aafba4884fc6e149d3618168ec6b11ab7d67c1. Run from repository root with `node sims/lp2_ftransparent_hidden_pause_lag_collision_sft.cjs`. Actual original data, exact authentic positive replays and toy brute-force comparison were executed in connected V8; no independent Windows CI claim.
