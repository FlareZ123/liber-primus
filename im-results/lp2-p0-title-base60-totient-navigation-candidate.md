# Conditional base-60 page/word coincidences (unverified; no decryption)

**Status: provisional numerical/semantic pattern, not a source-selected navigation rule.** No unknown plaintext, key, or reversible operation has been recovered. Do not promote this to `results/`.

## Candidate convention and exact arithmetic

The exploratory convention was (n=60p+w), with printed LP2 page labels zero-based and word ordinals one-based. Words were assigned to the page on which their first rune occurs, using `resources/liber-primus/lp2-transcription.txt` and `resources/liber-primus/lp2-corpus.json`.

Under that convention:

### p0 red title

The two p0 red-title words `SHEOGMIAF` and `SYENGC` have GP-prime sums **347** and **315**. Their mean is **331** and difference **32**.

| Input | Candidate address | Selected word | GP prime sum | Totient |
|---:|---|---|---:|---:|
| 315 | p5:w15 | `REO` | 52 | 24 |
| 331 | p5:w31 | `CEAA` | 219 | 144, then 48 under a second totient |
| 347 | p5:w47 | `TD` | 148 | 72 |

The second totient on the midpoint is an extra, target-guided step, not a source-selected operation.

### cuneiform numbers

The cuneiform section's source numbers **1033** and **3301** give candidate addresses:

| Input | Candidate address | Selected word | GP prime sum | Totient |
|---:|---|---|---:|---:|
| 1033 | p17:w13 | `AEP` | 144 | 48 |
| 3301 | p55:w1 | `AEMIW` | 222 | 72 |

The two totients have mean60 and difference24.

### p50 token 3D

If p50 token `3D` is read as base60 value193, then (193=60\cdot3+13) selects p3:w13: `DEO`, rune indices `[23,12]`, prime sum130, and (arphi(130)=48). The complete word list contains exactly two `DEO` tokens, p3:w13 and p33:w1.

This is **not a valid independent held-out confirmation**: although #337 found exact pre-2014 base60-alphabet prior art in the 2007 MIRACL manual and 2002 Sendmail documentation, no examined Cicada source links p50 to either implementation. Base60 is the preferred conventional reading, but the f-omitting base59 alternative is not disproved; the 2016-message mapping of “lies” to this token is also provisional. Under base59 the token is190 and the address changes. The page/word address formula remains unsourced.

## Why the pattern initially looked interesting

The selected p5 positions15,31,47 are centered on31. The totient values24,48,72 can be made into an arithmetic progression by applying a second totient to the center's144. The five selected words p17:w13, p55:w1, p5:w15, p5:w31, p5:w47 contain13 runes total, matching the p0 red title; their first totients (48,72,24,144,72) sum to360.

Other numerical correspondences include:

- 24: p54's first red rune has GP index24.
- 48: (7\times7-1), the noncentral cells of the 2014 7×7 square.
- 72: p55 is original scan/image72 (`72.jpg`).
- 331: p0 title mean and center of the 2014 7×7 square.
- 1033: cuneiform endpoint and the 2014 square's magic constant.
- 32: p0 title difference and p50 table row count.
- The existing p55 center-five candidate has prime sum401=(13\times29+24), echoing the p0 title length and p54's red-rune index.

These are observations, not proof of a common mechanism. In this corpus, (arphi(	ext{word prime sum})=24) occurs48 times, =48 occurs11 times, =72 occurs20 times, and =144 occurs twice. The totient values are therefore not rare on their own. The extra midpoint iteration and selection of several matching markers add degrees of freedom.

## Strongest objections from existing research

1. **The address grammar is not source-selected.** The existing `im-results/lp2-2016-p50-p55-43unit-source-selector-gate.md` says the authenticated 2016 message does not specify a radix, page/word formula, or indexing convention. The fact that cuneiform numbers are sexagesimal does not by itself prove that arbitrary GP sums or p50 tokens are page/word addresses.
2. **The p50 radix is explicitly unresolved.** Issues [#310](https://github.com/FlareZ123/liber-primus/issues/310) and [#337](https://github.com/FlareZ123/liber-primus/issues/337) preserve base59/base60 ambiguity and prohibit choosing a branch from downstream coincidences. Issue [#116](https://github.com/FlareZ123/liber-primus/issues/116) further distinguishes the cuneiform base60 evidence from the p50 table's unresolved alphabet/radix.
3. **The DEO semantic echo is not independent.** Issue [#46](https://github.com/FlareZ123/liber-primus/issues/46) already records an inner-shell `DEO` readout from the 2014 7×7 square and the p57 “divinity within” wording. The p3:w13 `DEO` address is an additional conditional coincidence, not a new independent semantic selector.
4. **The 193/D-within route is already bounded elsewhere.** Issue [#112](https://github.com/FlareZ123/liber-primus/issues/112) audits the conditional 193 → D-within navigation chain and its missing selectors. Do not restart that work through a new address interpretation.

## Negative consumers

The obvious direct consumers tested in this invocation did not decrypt p54/p55: p56-style (arphi(p_n)\bmod29) streams starting at prime ordinals24 and72; 24/72 and72/24 start/stride variants; affine use of24/72; the 13-rune concatenated selected-word key on p0's title and p55; and simple totient-derived/DEO Vigenere consumers. A separate p175–p464 prime-interval address attempt produced41 out-of-range addresses. A speculative 48-symbol square-key/central-p55 test also failed. These are bounded negatives, not evidence for a different decoder.

## Decision

Retain the arithmetic in this note only as a **conditional coincidence record**. Do not launch further base-60 offset, key, shell, or totient searches. Reopen only if an original, human-visible source independently fixes the exact page/word address convention and the p50 radix without consulting these outputs. Otherwise retire the branch. No plaintext or key claim is warranted.
