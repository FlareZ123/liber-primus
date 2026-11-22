# Quadratic two-rune triangular transducer: exact all-secret second-channel obstruction

**Agent 8, 22 November 2026. Classification: independently executable new nonlinear-family exclusion; no new Liber Primus plaintext, key or authored decipherment.** [Source-native all-secret test](../sims/lp2_pair_quadratic_two_secret_allkey_source_sft.cjs) executed with every assertion against the exact GitHub source files. This finding supports [Director exploration #2295](https://github.com/FlareZ123/liber-primus/issues/2295) without claiming or preempting its active owner.

## A low-description, genuinely nonlinear and fully invertible register

Instead of rerunning fixed p3/p39 red-polynomial Feistel [#867](lp2-p3-p39-twoquad-feistel-original-gate.md) or five-page fixed-p7-product source shears [#2263](lp2-five-scroll-nonlinear-product-shear-original-gate.md), grant an entirely unknown key to this independent two-rune quadratic triangular mixer. For a GP29 plaintext pair `(P0,P1)`, select arbitrary secret parameters `a,b,k,l ∈ GF(29)` and encode:

```text
C0 = (P0 + a*P1² + k) mod29
C1 = (P1 + b*C0² + l) mod29
```

Its **exact complete inverse** is:

```text
P1 = (C1 - b*C0² - l) mod29
P0 = (C0 - a*P1² - k) mod29
```

The transform is nonlinear for nonzero `a,b`, survives ciphertext doublets, permits **all 707,281 = 29⁴ secret keys**, and only needs a two-rune register. The two natural continuous pair phases are measured independently. Where a run has an unmatched first/last rune, that symbol is passed transparently; all original source characters and their printed boundaries can be reproduced exactly. This is a proposed 2014-implementable family, **without an authored clue selecting pair pairing, quadratic shears, a secret key or a target page**.

## Key-independent theorem removes the entire family without a 29⁴ password sweep

The recovered **second plaintext coordinate** is solely `P1 = C1−b*C0²−l (mod29)`. Thus coefficients `a,k` vanish outright from this coordinate. The remaining `l` is just a constant translation of all 29 potential symbols and **cannot change any sorted frequency statistic**. Only **29 values of b** and **two original pair phases** need inspection to compute the exact maximum possible top-12-symbol frequency for *every* secret key, regardless of how its first plaintext coordinate is manipulated. This is an exact algebraic all-secret necessary condition rather than a low-score observation after optimizing one key.

Use two predesignated unaltered LP2 GP29 receivers, each a complete six-page interval, one for discovery and another disjoint holdout. Original runes and p40–45's 1,593 symbols are unchanged. Compare with genuine GP29 literary prose encoded from the unchanged Gibran edition, 47,983 native GP rune symbols after exact canonical digraph handling. Each native reference is an unmodified contiguous full-length window split into the **same six original page lengths**. Both continuous pairing phases and all 64 independent page-reset masks are compared on exactly matched second-pair positions.

| Independent original input | Original runes | Absolute upper bound for decoded second-coordinate top 12, among **every** secret key | Minimum of native GP literary control windows |
|---|---:|---:|---:|
| p16–p21 discovery | 1,613 | **417/806 = 51.737%** at phase0,b24 | **604/806 = 74.938%** among 58 independent control windows |
| p40–p45 untouched | 1,593 | **408/796 = 51.256%** at phase1,b27 | **584/796 = 73.367%** among 60 independent control windows |

For the first interval every key is at least **187 common-symbol observations below** the *least concentrated* native control. The second interval's lower-bound gap is **176 such observations**. Both are absolute source-derived bounds on one half of the resulting plaintext stream, unaffected by any secret assignments to `a,k,l` and by hidden renaming of the decoded output alphabet. The source-native control comparison intentionally tests ordinary direct English GP29 prose; other language registers, compression and additional cipher stages fall outside this inference.

**Even allowing a fresh pair phase independently on each original physical page**, the first six-page original interval has a maximum **427/803 = 53.176%** (shared b22, page-reset mask62) and the disjoint second interval has maximum **414/794 = 52.141%** (shared b0, mask8). The most weakly concentrated original-length-matched native GP control across **1,856** six-page phase configurations contains **594/803 = 73.973%** on the first region; the minimum among **1,920** analogous second-region controls is **582/793 = 73.392%**. These are true source-native reference controls, with original p16–21 page lengths [267,273,260,271,269,273] and p40–45 lengths [231,273,272,274,273,270]. This stronger per-page reset test excludes all **29 × 64** second-channel choices and hence all 707,281 shared four-secret coefficient assignments for every such mask. No resetting at every printed word or further unobserved state is claimed.

The SFT exhausts all 58 combinations of `b` and global pair phase for each original receiver, directly checks invariance over all 29 possible `l` translations, exhausts all 64 page-phase masks for each original six-page interval, and performs exact complete original re-encryption of **1,613/1,613** and **1,593/1,593** runes with an arbitrary sample key. A separately encoded native Gibran positive plant roundtrips perfectly in both phases on both target lengths, and its recovered second-coordinate histogram matches the genuine literary source.

## What this changes

The entire **four-secret quadratic triangular pair-cipher family** is incompatible with ordinary native-GP English on both unchanged original pages under either continuous pair phase or any of the 64 source-page reset patterns; fitting another quadratic coefficient or shifting a secret key cannot rescue its decoded second channel. This is a stronger conclusion for the named family than evaluating a finite set of published squares or visually selected constants.

It does **not** rule out a larger two-round invertible mix that feeds the decoded second coordinate through additional unknown transformations, dynamically changing parameters, transposition/resegmentation, or a non-GP text register. Those are separate, greater-complexity architectures requiring independent source selection. An unbounded extension has no specific causal path to authentic manuscript plaintext.

**Research decision:** retire direct two-rune triangular quadratic shearing as a complete decoder of p16–p21 and p40–p45. Preserve the exact second-coordinate proof as a reusable obstruction whenever a future proposed cryptosystem exposes a known ciphertext coordinate through an arbitrary secret affine/permutation-only transformation.
