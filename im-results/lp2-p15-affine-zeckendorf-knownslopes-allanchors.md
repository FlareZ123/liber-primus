# P15 noncommuting affine Zeckendorf inverse with fixed source slopes and all singleton anchors

**Decision:** calibrated negative search, not an all-key language theorem. Over both digit-composition orders, every A/I/O-compatible 17-coefficient intercept key is enumerated and sample scored: 26,721,486 original keys. No original plaintext recovered.

## Typed hypothesis and exact parameter elimination

Let F_k=1,2,3,5,...,1597, and z_k(n) be the unique nonadjacent Zeckendorf digits of the p15-body-relative rune clock n. The source spiral gives V(F)=abs(3301-prime[F+1]) mod29, including V(0)=22. All 17 samples (16 printed and one extrapolated) are nonzero. Define T0(x)=22*x+b0 and Tk(x)=(V(F_k)/22)*x+b_k in GF29. Apply T0 outside the product of active digit maps, in either increasing or decreasing digit order. The slopes are fixed by the source construction under this hypothesis; the 17 offsets are unrestricted secret field elements. The source-fixed special case uses intercepts B(F)=prime[F+1] mod29 at the single-digit samples. The artifact supplies the numbers, not the affine type or composition rule.

The combined map is C_n=A_n P_n+H_n*b, where A_n is the public product of active slopes and H_n is a known row of 17 field coefficients. This reduces the general noncommuting-offset inverse to a linear system, even when none of the digit maps commute.

Original physical p15 offset20 through p22 contains 1,883 runes. The 18 complete printed singleton anchors in the p15-body through p21 fit portion (1,752 runes) occur at offsets 115,160,258,383,519,525,553,594,610,735,851,1010,1076,1128,1171,1630,1696,1713. The source words are parsed across physical page and line carries. Assume each singleton is native A/I/O (indices 24/10/3); this is a conditional intact-word premise, not established original plaintext. For each composition order the 18x17 anchor matrix has exact rank17. RREF yields 17 key equations and one scalar syndrome constraint. Enumerate the 3^18 possible label patterns exactly by a 9+9 meet-in-the-middle syndrome join. All consistent label patterns determine unique intercept keys, and the map from compatible key to label pattern is injective. No key phase, alternate clock, or OOV singleton allowed.

## Original key ranking and controls

All compatible keys are scored on the same fixed 16 disjoint four-rune fitting blocks (64 samples, no anchors). Precompute sample plaintext contributions for both halves of the label pattern; sum them modulo29 at the syndrome join. Each block is scored by the smoothed native/literary unigram, bigram and trigram model, quantized to milli-nats. Retain 4,096 top sample keys, score full p15-body through p21, then freeze the fit winner before decoding physical p22. No original p22 rune enters key selection. This is exhaustive candidate enumeration plus a finite sample-ranked screen; it is not exhaustive full-text scoring of the entire candidate set.

| Order (outer to inner, after T0) | Original compatible keys | Full fit winner | Frozen p22 gain | Fixed source fit / p22 |
|---|---:|---:|---:|---:|
| Low digit first | 13,359,921 | -2.831789 | -3.486315 | -3.191284 / -3.377709 |
| High digit first | 13,361,565 | -2.774084 | -3.347445 | -3.148109 / -3.270009 |

All gains are natural-log likelihood ratios against uniform GP29 per rune. Neither original output is readable; exact forward replay of each winner confirms the inverse implementation, not authentic key recovery.

Two disjoint unseen Emerson spans are used for matched plants; 18 positions per plant are overwritten with randomly chosen A/I/O so they meet the source singleton premise. These are deliberately modified literary controls, not untouched continuous prose or independently solved pages. Both hidden 17-coefficient keys rank uniquely first among 13,358,574 and 13,357,329 compatible keys at the 64-rune sample stage, and both remain first on full fit. All 34 key coefficients, 3,766 runes and 262 held-out runes recover exactly; held gains +1.103860 and +1.215762. Two distinct planted keys and donor spans. Exact replay. No original key.

## Reproduction and decision

[CommonJS SFT](../sims/lp2_p15_affine_zeckendorf_knownslopes_allanchors_sft.cjs) · [low-first raw](lp2-p15-affine-zeckendorf-knownslopes-lowfirst.json) · [high-first raw](lp2-p15-affine-zeckendorf-knownslopes-highfirst.json). Run from repository root with Node22, optional mode 0/1 for a single order. Executed connected V8, not standalone Windows CI. Input blob IDs included in raw files. Source commit 3f6612d5, orientation-specific seed correction 3af5a806, raw bc5fe053/e48f5614.

Retire these two fixed-slope models under the tested singleton/ranking premise. This includes arbitrary noncommuting intercepts, not arbitrary secret slopes, other affine compositions, changed word segmentation, OOV singleton alphabets or moving clocks. No independent source selector for more slope/clock fitting. No unknown LP2 plaintext, authenticated key or destination.
