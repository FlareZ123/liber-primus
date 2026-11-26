# Second-order scalar GP29 receiver: exact projective-state capacity

**Agent20, 26 November 2026.** This is a finite-register key-independent exclusion of a new reversible architecture, not unknown plaintext or an authored cipher. The preceding first-order predecessor map gate and the prime-clock two-lag affine reachability gate are different scopes. This study asks whether allowing arbitrary nonlinear row substitutions selected by a linear combination of the previous **two ciphertext runes** rescues a compact, stationary feedback receiver. The p15 Fibonacci construction and GP29 arithmetic motivate testing two-tap state, but do not independently select this mechanism.

## Reversible family and exact quotient

Within each physical page, grant the first two plaintext runes entirely free. For every later rune let x=C[i-1], y=C[i-2], c=C[i] in GF(29). Consider every model

    s = u*x + v*y
    z = c + a*x + b*y
    P[i] = pi_s(z)

where (u,v) != (0,0), a,b are arbitrary field elements, and each pi_s is an independently secret permutation of all 29 runes. A state translation, scaling of state, nonzero coefficient on c, or output translation is absorbed into relabeling the secret rows. The receiver is lossless: given both previous ciphertext symbols and P[i], apply pi_s^-1 then subtract the residual. Printed word boundaries are irrelevant.

For u != 0 normalize s=x+t*y; remove a*s from z, since a state-dependent translation merely relabels the row's input, leaving z=c+k*y. For u=0 normalize s=y and remove b*s, leaving z=c+k*x. Thus 30 projective state choices and 29 residual classes, **870 classes**, cover every original coefficient tuple; all secret permutations are retained. In particular s=x+y and z=c-x-y (Fibonacci residual) is equivalent to (t,k)=(1,0). A zero state projection is a subclass with identical row maps.

Let M[s,z] be the original counts for a fixed class. For any set of j plaintext labels, each row can assign those labels to at most its j largest counts. Hence U_j = 2*number_of_pages + sum_s sum_j_largest(M[s,:]) bounds the total top-j plaintext count. The bound is sharp for a fixed class: rank-align every row and assign the free page heads to one common label. Coordinatewise maxima across classes may occur at different classes; using all maxima jointly is a relaxation, not a proof of joint attainability. The result covers arbitrary row maps rather than only additive feedback or particular secret keys.

## Original-input decision

The canonical p40–53 chapter (13 rune-bearing physical pages, p50 rune-free) contains 3,008 runes, 26 free page heads and 2,982 constrained symbols. The entire original p0–55 book contains 12,956 runes and 110 free heads. Exact enumeration gives:

| Top j | p40–53, all classes | p40–53, Fibonacci projection | Whole book, one shared class and table | Whole book, independent class and table per chapter |
|---:|---:|---:|---:|---:|
|1|274|254|844|1469|
|2|482|452|1492|2549|
|3|668|630|2116|3495|
|4|843|799|2714|4359|
|5|1005|958|3290|5156|

p40–53 top-two capacity is 482/3008 (16.02%). Native-GP control windows of that length, step 503, have minimum top-two counts 568 (119 Gibran windows) and 531 (426 Shakespeare windows). **All 545 fail the top-two bound alone**. All also fail each of top-three through top-five; two Shakespeare windows pass the top-one relaxation, which is insufficient. For 150 full-book controls (step1703), every one fails the globally shared receiver. The coordinatewise whole-book chapter-private relaxation excludes 149/150; one Shakespeare window passes this relaxation, not a feasible key. The p40–53 local exclusion is independent of other chapters and is the strongest decision. These are fixed finite donor samples, not independent draws or a universal language exclusion.

**Exhaustive contiguous-donor extension:** the complete stride-one scan of both native-GP tapes finds no p40–53-compatible interval among 59,485 Gibran and 214,099 Shakespeare windows (273,584 total). Their minimum top-two counts are 563 and 518, respectively, both strictly above 482. When the p40–53 interval is placed at its actual full-book offset 9,640, all 49,537 Gibran and 204,151 Shakespeare full-book starts fail the local bound as well. This eliminates the apparent whole-book chapter-private relaxation survivor without imposing shared chapter keys. The exclusion covers every contiguous window of these two pinned donor tapes, not every possible English text. [Stride-one SFT](../sims/lp2_two_cipher_lag_scalar_allwindow_sft.cjs).

Three source-native 3,008-rune plants with independent random 29-row tables and different projection/residual classes (including the Fibonacci class and the projective infinity class) recover all 3,008 plaintext runes each and satisfy the bound. Their true top-two counts are 605,615,613 and encrypted capacities 709,736,702. This is a known-key implementation control, not blind key recovery. No word-boundary assumption or linguistic score optimization was needed.

## Consequence

Retire a **stationary linear scalar projection of two ciphertext predecessors plus arbitrary linear residual and arbitrary secret row permutations** as a direct native-GP receiver for p40–53 under these controls. The previous one-lag cap did not cover these two-input states. A time-dependent clock, nonlinear projection, two independent state coordinates, plaintext history, F-transparent hidden consumption, changing cipher-state reset positions, changing rune order/length, or a different plaintext register escapes this result. The cipher need not be shared across chapters for the p40–53 conclusion. Do not launch a search over arbitrary row maps for this exact family.

**Reproduction:** [read-only Node CJS SFT](../sims/lp2_two_cipher_lag_projective_scalar_capacity_sft.cjs) · [raw counts and source blob identifiers](lp2-two-cipher-lag-projective-scalar-capacity-output.json). The complete experiment core was executed against the pinned repository inputs in the connected JavaScript runtime. The standalone Node wrapper was not separately run; no CI run is claimed.

Related: [previous-cipher-symbol receiver](lp2-firstorder-static-quasigroup-majorization-gate.md), [differential plaintext-history receiver](lp2-differential-history-affine-suffix-original-gate.md), [prime-clock affine two-lag receiver](lp2-prime-carry-two-lag-feedback-gate.md).
