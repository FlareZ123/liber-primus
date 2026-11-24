# Progressive and independently translated GP29 key cycles with authentic F holds

**Agent 8 · 24 November 2026. Decision:** an exact all-key lexical inverse rejects both the progressive period-8 family and the strictly broader arbitrary-common-cycle-pad period-8/13 families on original p54–55, conditional on native printed-word segmentation and the declared finite lexicon. A separate spacing-free all-mask collision bound rejects the common progressive slope for the long original p40–53 chapter, but does **not** reject independently translated cycles. No unknown LP2 plaintext or authenticated key has been recovered.

## Human-visible premise and precise models

Authentic LP1 WELCOME and second KOAN use periods 8 and 13 with a plaintext-F hold: P=F emits C=F without consuming the clock. An observed C=F may also be ordinary encrypted non-F. The p50 table has eight columns, so changing a shift once per key cycle is a simple candidate, although no original instruction selects this operation or assigns the numeric table this role.

Let t be the count of consumed non-F plaintext runes (plus an optional initial phase), L=8 or 13, s=t mod L, j=floor(t/L). For P!=F:

`C = P + K[s] + G[j] (mod 29)`, then advance t.

For P=F, emit 0 and keep t. The common progressive subfamily is G[j]=d*j with all 29 slopes d and completely unknown K. The broader model permits each G[j] independently arbitrary. One gauge degree is removed by setting the first used G to zero and absorbing its actual value into K. Both use the original GP29 alphabet and are reversible when the hold path and state are supplied. Neither is an authenticated original cipher.

## Exact progressive key recovery

The standalone [lexical CSP](../sims/lp2_progressive_cycle_fhold_q8_csp_sft.cjs) uses 38,920 GP sequences from the pinned TextBlob word-frequency lexicon, all GP spelling variants, and the solved native words. It searches every slope, key assignment, and legal F path using a trie. An unknown key digit is fixed by an ordinary candidate plaintext rune; subsequent encounters must agree. The future state consists of the active clock modulo 232 and the partially assigned key. Identical future states merge without pruning. A five-million-node limit is explicitly reported as a cap, not an exclusion.

| Input | Fitting scope | Result |
|---|---|---|
| Authentic original LP1 WELCOME | 154/515 runes | Unique d=0 and exact DIUINITY key. Complete lexical continuation exists; one arbitrary representative scores 513/515, since more than one legal lexical path merges. Do not confuse exact key recovery with unambiguous plaintext. |
| Native KOAN1 layout-selected suffix, hidden key [4,27,15,8,21,0,12,19], d=7 | 151/292 | Unique key and slope; 292/292 exact and 141/141 withheld, unique path, exact replay. |
| Original p54–55, all eight key digits and all slopes unknown, arbitrary opening singleton | First 1+8+8 runes | All 29 slopes fail at word 3; 4,346–5,416 states survive word 2, zero survive word 3. All searches terminate naturally, using 510,212–516,459 trie nodes each. |

The exact input/output is in [progressive lexical output](lp2-progressive-cycle-fhold-q8-csp-output.json). The original suffix was not used for fitting or scoring; no original key survived to predict it.

## Spacing-free all-slope necessary condition

For two active positions separated by mL (m=1,2,3), under common slope d:

`P'[i]=P'[i-mL] iff C'[i]-C'[i-mL]=m*d (mod 29)`.

For equal bigrams, both aligned predecessor differences must also equal m*d. This holds for all K and any initial active phase. Retain every possible deletion subset of visible C=F, even those impossible for a particular key. For a history of the latest 3L+1 consumed symbols, future collision increments are determined by that history and the next symbol. A 58-component DP (29 rune and 29 bigram maxima) computes the exact scalar maxima for every slope. Componentwise maxima may arise from different masks; the joint test is a safe relaxation. Toy exhaustive enumeration checks all slopes; authentic LP1 WELCOME/KOAN exact replays and nonzero-slope plants preserve the invariant.

The [all-slope spacing-free SFT](../sims/lp2_progressive_fhold_spacingfree_lag_bound_sft.cjs) uses the same frozen 96 native-GP windows per scope as [the original fixed-period gate](lp2-ftransparent-hidden-pause-lag-collision-gate.md).

| Original scope | Period | Max rune / bigram across slopes and F paths | Native minimum rune / bigram (all three sources) | Native windows passing a common slope |
|---|---:|---:|---:|---:|
| p40–53, 3,008 runes | 8 | 431 / 28 | 493 / 38 | 0/96 |
| p40–53 | 13 | 439 / 35 | 464 / 34 | 0/96 |
| p0–55, 12,956 runes | 8 | 1,685 / 88 | 2,252 / 204 | 0/96 |
| p0–55 | 13 | 1,759 / 112 | 2,197 / 204 | 0/96 |
| p54–55, 308 runes | 8 | 45 / 4 | 35 / 0 | 6/96 |
| p54–55 | 13 | 50 / 10 | 30 / 0 | 33/96 |

All nine chapter scopes and each individual slope are retained in [all-slope output](lp2-progressive-fhold-spacingfree-lag-bound-output.json). The p40–53 result does not require plaintext word boundaries or a guessed key. It rules out the declared ordinary native control register with a single continuous progressive clock in that chapter. It is not a theorem about every conceivable English text.

## Arbitrary common cycle translations survive the spacing-free rectangle test

For the more general arbitrary G[j], within-cycle differences between phases cancel G. For two active cycles separated by mL, the aligned differences D_s=C'[i_s]-C'[i_s-mL] satisfy D_s=P'[i_s]-P'[i_s-mL]+G[j]-G[j-m]. Therefore all equal-difference pairs, triples and quadruples among the phases of the same cycle pair are invariant. An exact dynamic program over all initial phases and all visible-F deletions computes componentwise maxima with 4L-1 consumed history symbols. The toy brute-force and nonlinear-cycle plants reproduce the invariant exactly.

This broader relaxation **does not exclude** native controls: p40–53 admits 78/96 (L8) and 85/96 (L13) by the necessary rectangular bounds; continuous p0–55 admits 58/96 and 79/96 respectively. These are relaxed necessary passes, not feasible keys or evidence that the author used the model. See [rectangle SFT](../sims/lp2_cyclewise_common_shift_fhold_rectangle_sft.cjs) and [raw output](lp2-cyclewise-common-shift-fhold-rectangle-output.json).

## Constructive inverse for the surviving broader model

The [cycle-pad lexical SFT](../sims/lp2_cyclewise_common_shift_fhold_lexical_csp_sft.cjs) tracks all unknown K digits, active phase, and current common cycle pad. It sets the first G to zero as a gauge, then sets each later G from an ordinary rune if K at that phase is known. If both are unknown, every G is enumerated and the corresponding K digit fixed. A completed cycle forgets its G; all future-equivalent states merge. A word-frequency score from the pinned external word-frequency list ranks representative paths, while feasibility uses all 38,938 GP sequences, including the native controls. No heuristic pruning; a node cap is reported separately.

| Input | Unknown initial phase | Fitting scope | Result |
|---|---:|---:|---|
| Native KOAN1 suffix, L8, independent nonlinear G | All 8 | 151/292 | Unique initial phase 3 and 8/8 gauge-rebased key digits; highest-ranked held-out continuation 141/141, total 292/292, exact replay. Six terminal states survive, so path uniqueness is not claimed. |
| Native LOSS OF DIVINITY suffix, L13, independent nonlinear G | All 13 | 152/737 | Unique initial phase 5 and 13/13 gauge-rebased key digits; 585/585 withheld, 737/737 total, unique complete path, exact replay. |
| Original p54–55, L8, start at second printed group (two length-8 words) | All 8 | 150-rune frozen prefix | Seven phases die by word 2; phase 5 dies at word 3. No cap, 218,315–2,499,621 nodes. |
| Original p54–55, L13, start at the unique longest printed group, index 56 (length 13) | All 13 | 32/53 runes of suffix | Twelve phases die by word 3 (13+6+4 runes), phase 5 by word 4 (25 runes). No cap, 29,760–384,066 nodes. |

Both original tests are suffix restrictions of a putative complete chapter solution. Allowing every start phase and absorbing the first G into K is necessary, so the exact lexical contradiction on these intervals excludes the whole chapter under the declared model and dictionary assumptions. The original opening singleton does not enter either test. All cycle pads after the first are completely unrestricted; thus this encompasses every possible progressive slope, many periodic row schedules, and nonlinear per-cycle common pads. The two genuine-text plants recover the gauge-fixed keys and held-out native plaintext, not merely a synthetic round-trip. The native control vocabulary is included, so they are calibration plants rather than independent discovery. Full details and per-phase counts: [cycle-pad output](lp2-cyclewise-common-shift-fhold-lexical-csp-output.json).

## Research decision

Do not expand progressive slopes or arbitrary common-cycle pad searches that assume original printed groups are intact native words. They now have an exact conditional all-key exclusion at both historical periods, with successful constructive controls. The spacing-free rectangle relaxation remains feasible for arbitrary common-cycle translations; pursuing this architecture further requires a genuinely distinct latent-segmentation/key recovery method or independent source evidence selecting the common-pad operation and its schedule. A learned private G for every cycle alone is not an authenticated key and cannot supply a prospective prediction without an external pad law. No unknown plaintext or key has been recovered.

All programs were executed against exact repository inputs in the connected JS runtime; no independent Windows CI run is claimed. From repository root, execute the four linked CommonJS SFTs with Node 22.