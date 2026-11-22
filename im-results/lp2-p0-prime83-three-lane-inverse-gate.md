# P0 black-body three-lane 83-rune key cancellation and Shamir inverse

**Agent2, 21 November 2026. Evidence class: source-count congruence, key-independent mathematics, and original-cipher negative. No new LP2 plaintext.**

## Why a human could try this

Physical LP2 p0 (`17.jpg`) begins with exactly 13 red runes, followed by the original 13-dot marker; its untouched black body is **249** GP29 runes. The five p7 terminal red words independently point to the historical DH modulus **p=23** in prior research. The **23rd ordinary prime** is **83**. Therefore **249 = 3×83** exactly. Three 83-rune strips fit the complete p0 black body with no padding, while an earlier p7 five-dot source/Shamir experiment shows the creator-compatible (but unconfirmed) possibility of field interpolation. A later 2016 signed clue about words, numbers and direction gives a broad reason to consider transformations keyed by ordinal prime values.

**Crucial unsupported step:** there is no creator-signed instruction directing the p7 DH value 23 to the *23rd* prime83, pairing p7 with the opening p0 page, or breaking p0 into three 83-symbol lanes. These operations are prospective hypotheses based on available counts. The test below does not elevate numerical alignment into a discovered cipher.

A single **frozen row-major** split was chosen in advance, starting immediately after p0's 13 red runes:
`C₁=C[13..95], C₂=C[96..178], C₃=C[179..261]`, three consecutive 83-rune original spans.

## 1. Unknown additive pad cancellation

If the original **three** 83-rune strips were encrypted with exactly the same position-aligned GP29 additive pad (no hidden skips or different signs), then for each position and each pair `a,b`,
`C_a[i]-C_b[i] = P_a[i]-P_b[i] (mod29)`.
This removes **all unknown key variables**. Such plaintext differences should resemble the difference of two independently sampled GP-native English rune streams, even though no individual P is known.

The original three lane pairs contain **5, 4, and 5** equal ciphertext symbols respectively (total14 out of 249 pairwise comparisons), above uniform expectation 249/29≈8.59, but equality alone is misleading. The full 29-bin difference distribution supplies a much sharper test.

We estimated the 29 GP-native rune probabilities with Laplace smoothing on the **first 1,644** runes of a separately preserved, editor-normalized solved-LP1 text. This induces a theoretical 29-bin difference distribution `Pr[P₁−P₂=d]`. The observed 249 differences have log likelihood ratio **−6.91507** relative to uniform differences. This is **below** even the uniform-model mean around −5.60, whereas 800 deterministic sampled *held-out solved-LP1* 249-rune windows had mean **+6.49029**, with empirical 5th/50th/95th percentiles **[3.01515, 6.15274, 10.64711]**. The original score is below **all 800** sampled genuine-native windows. As a negative null comparison, 800 uniform GP29 windows had mean **−5.60442**, and **35.75%** scored at or below original.

The reproducer also encrypted each held-out native window with an independent random 83-symbol pad repeated exactly three times. The cancellation score matches the underlying plaintext for every plant. A second control applies an 81%-probability local ciphertext-doublet replacement, aligned with the measured anti-repeat phenomenon: its 800 planted scores have mean **+6.06837**, and still **0/800** score at or below the original. Thus the **particular synchronized, equal-sign, three-strip reused-pad** model fails a source-native language diagnostic even allowing a local collision rewrite. The controls are overlapping samples drawn from one reference work; the 0/800 observation is **not** a formal corpus-general p-value and cannot reject an arbitrary hidden-language plaintext, a different pad synchronization, or a key-skip machine.

## 2. Exact GF29 three-share Shamir secret

A second, genuinely **value-changing key-free** operation treats every aligned ciphertext triple `(C₁[i],C₂[i],C₃[i])` as shares of a quadratic over GP29 at canonical x-coordinates 1,2,3. The Shamir secret at x=0 is uniquely

`P[i] = 3*C₁[i] − 3*C₂[i] + C₃[i] (mod29)`.

The untouched p0 body yields one fully determined **83-rune output**, with native-GP29 IoC **0.0332060**, visually ciphertext-like and without a contiguous original plaintext clause:

`BEDYEAUAYWEOOXWEAGJXDCCNEGFEAMIYNGUWMOECOIAFEOWXEARNGAXTHIAFLSNGEEAFXHIRHSAEONSDLIAEARGNLCEOAEEEREAIAHHF`

A source-native **83-rune solved-p57** message was independently planted under random secret quadratic coefficients, evaluated at x=1,2,3 and recovered *exactly* by the same fixed interpolation. The planted native IoC is **0.0587717**. Thus failure on original is not caused by a broken polynomial inverse. The 83-rune secret is a tested hypothetical output; it cannot be relabeled as an encrypted second-stage clue without independent evidence.

## Decision

The factorization 249=3×83 is exact and can motivate a human-visible hypothesis, but the original data reject its two simplest mechanisms: (1) a synchronous 83-symbol pad shared across all three contiguous strips, and (2) three GP29 Shamir shares at x=1,2,3 directly encoding an English 83-rune secret. There is no recovered 150-rune or 83-rune authenticated plaintext, no derived body key, and no body cipher. More sign choices, x-coordinates, strip offsets or learned payloads require **an original source instruction** and must not be promoted because one tuned result looks English-like.

**Reproducer:** [Windows Node22/CommonJS SFT](../sims/lp2_p0_prime83_threepad_keycancel_sft.cjs). **Passing execution on original data and planted controls:** [GitHub Actions 44947684396](https://github.com/FlareZ123/liber-primus/actions/runs/44947684396).
