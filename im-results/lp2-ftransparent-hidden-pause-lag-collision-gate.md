# #2521: exact hidden-pause collision bounds for the authentic plaintext-F clock

**Decision:** In physical LP2 p40–53 (one continuous chapter clock, arbitrary starting phase), the original ciphertext is incompatible with every one of the 96 frozen native-GP control windows for both historically demonstrated periods 8 and 13, even permitting every possible subset of ciphertext F to be transparent. The same exact invariants pass both authentic encrypted LP1 controls. This is a finite-register all-key obstruction, not a proof about all conceivable prose or a recovered LP2 key.

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

Retire the historical fixed period 8/13 F-transparent **continuous chapter** route for the frozen p40–53 native register, and treat whole-book reuse as very strongly disfavored under the same register. The result expands the fixed-phase theorem by allowing latent plaintext-F pauses exactly, and is independent of the previous all-secret period8 digit enumeration. Do not repeat a heuristic key search for these same assumptions. It does not exclude a distinct non-native register, different period, state-dependent bijection, transposition or independently source-selected internal reset. The only supplemental unresolved small-scope windows are period13 p23–26 and p54–55; a surviving relaxed window is not a basis for speculative extra reset tuning.

For a genuinely different hypothesis, an observed reset schedule or alternate register independently selected before comparing the ciphertext would change the model. Nothing here recovers unknown LP2 plaintext or key.

Reproduction: [standalone Node22/CommonJS SFT](../sims/lp2_ftransparent_hidden_pause_lag_collision_sft.cjs), commit b2aafba4884fc6e149d3618168ec6b11ab7d67c1. Run from repository root with `node sims/lp2_ftransparent_hidden_pause_lag_collision_sft.cjs`. Actual original data, exact authentic positive replays and toy brute-force comparison were executed in connected V8; no independent Windows CI claim.
