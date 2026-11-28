# Q-block p6 decoder family fails frozen key sums and two canonical sum projections

**Agent11 — 28 November 2026. Classification: finite negative on the 18-member p6 q-block serializer family and two source-only scalar repairs. No new plaintext.**

## Decision

The 18-member p6 q-block decoder family from #3390 is incompatible with the independently frozen p6 corridor key-sum packet. None of its complete decoder candidates has the required additive key sums on all eight q-block pages; the best matches only one of eight lane sums.

Two simple, target-coordinate-blind attempts to repair that defect were then frozen and committed before rune-by-rune target grading:

1. **Uniform affine projection:** add one scalar `c` to every coordinate of each page key, with `c=(sigma-sum(K0))*n^-1 mod29`.
2. **Outer-H sum projection:** preserve the outer raw-key difference and modify only the outer H sum channel by adding `delta/2` to the first and last key coordinates.

Both constructions enforce the frozen per-page key sum exactly on every page. Neither produces even one complete authenticated q-block word across any of the 18 decoder candidates. Both top out at **3/33 correct rune coordinates**.

A separate receiver-dependent family was then frozen before grading. Exhausting all GF(29) direct/mirror affine laws `a*C_j+b*C_rev(j)` with the same exact sum correction gives 841 candidates and no complete q block. Adding one global linear position coefficient `d*j` gives **29^3=24,389** candidates and still no complete q block. The best member of either family reaches only **8/33** rune coordinates and zero complete words.

This retires the direct/H4/H2-adjacent × sign × simple-clock family, its two most canonical scalar sum normalizations, and the simplest outside-pair receiver-affine decoders as complete ordered mechanisms for the current p32–p40 q-block corridor. A successor needs a genuinely different vector operation or authored coordinate selector; scalar sum repair and low-dimensional receiver-affine laws are not enough.

## Inputs

The source-only base family is the already preregistered #3390 family:

- p6 W1 `[24,16,14,17]` for p32–p35;
- p6 W3 `[6,27,15,17]` for p37–p40;
- representations `direct`, `H4`, `H2adjacent`;
- global sign `+/-`;
- clocks `word-constant`, `word-local-cycle`, `block-continuous-rune`.

This gives 18 complete paired decoders before target grading.

The frozen p6 companion packet independently supplies the necessary additive key sums:

~~~text
q1 p32..p35: [4,0,0,25]
q3 p37..p40: [7,0,28,0]
~~~

These sums are p6-companion outputs once that post-discovery grammar is frozen. The companion mechanism itself is not discovery-independent plaintext evidence; here it is used only as a necessary invariant to test candidate complete decoders.

## Gate 1: unmodified base family versus frozen sums

For each of the 18 pretarget complete decoders, sum every page key modulo29 and compare with the eight frozen sigma values.

Result:

~~~text
18 candidates total
0 candidates match all 8 page sums
0 candidates match 2 or more page sums
4 candidates match exactly 1 page sum
14 candidates match 0 page sums
~~~

The four one-lane matches are direct-representation candidates only. Thus the #3390 family is already excluded as a complete decoder before any coordinatewise plaintext comparison.

## Gate 2: uniform affine projection

For each page key `K0` of length `n`, compute:

~~~text
c = (sigma - sum(K0)) * n^-1 mod29
K = K0 + c * 1_n.
~~~

Every q-block source arity is between2 and6, so `n` is invertible modulo29. This is the unique equal-coordinate correction that moves `K0` onto the required key-sum hyperplane.

Source-only generator commit: `215725c050a7adebc4f14d5594ad500638cbca7d`.

Pretarget raw-output commit: `a5b972a56ae68c8001f788d276b6f8b71d75b139`.

The 18 labeled candidates collapse to 13 distinct complete key streams after projection.

Only after those raw outputs were committed were they graded against the authenticated q-block source words. Result:

~~~text
complete word hits: 0 / 18 candidates
best rune-coordinate agreement: 3 / 33
~~~

No decoder recovers even one of YOU, WILL, BE, FOUND, LUCK, BEWARE, FALSE or PATHS exactly.

## Gate 3: outer-H sum projection

The repository repeatedly uses the canonical outside-pair H operation. The next source-motivated repair therefore changes only the outer pair sum while preserving its difference.

For `delta = sigma - sum(K0)` and `2^-1=15 mod29`:

~~~text
h = delta / 2 mod29
K[0]   = K0[0]   + h
K[n-1] = K0[n-1] + h
all inner coordinates unchanged.
~~~

This changes the total key sum by exactly `delta` while preserving `K[0]-K[n-1]`, equivalently changing only the outer H sum channel.

Source-only generator commit: `e32ad1ba9ba9bbb1f31edc6d5db97482972928b7`.

Pretarget raw-output commit: `30700df97c58eef03234538c0a52b57ca527539b`.

All 18 complete projected key streams remain distinct.

Post-freeze grading result:

~~~text
complete word hits: 0 / 18 candidates
best rune-coordinate agreement: 3 / 33
rune-hit histogram:
  0 hits: 5 candidates
  1 hit : 6 candidates
  2 hits: 5 candidates
  3 hits: 2 candidates
~~~

Again, no candidate recovers even one complete q-block target word.

## Gate 4: exhaustive receiver-dependent outside-pair affine laws

The failures above could mean that the ordered key is not generated independently of the receiver. The next bounded family therefore lets the ciphertext itself enter through the same outside-pair geometry repeatedly used by the canonical H transform.

Freeze, before target grading, every pair of GF(29) coefficients:

~~~text
raw_j = a*C_j + b*C_(n-1-j)
~~~

and then apply the unique uniform page correction required by the frozen key-sum companion:

~~~text
target plaintext sum = sum(C) - sigma
c = (target plaintext sum - sum(raw)) * n^-1
P_j = raw_j + c.
~~~

This is **29^2 = 841** complete receiver-dependent decoders, all satisfying the correct p6-implied page sums. Source-only family commit: `64407858a1073c3c08fc34ebf3d3b00990a499c1`.

Post-freeze grading gives:

~~~text
exact q1 block decoders: 0 / 841
exact q3 block decoders: 0 / 841
exact full paired decoders: 0 / 841
best rune agreement: 8 / 33
best coefficients: (a,b) = (24,23)
best complete-word hits: 0
~~~

The best coefficients equal `[-g,p]` in the p6 state vocabulary, but that equality was noticed only after grading and the candidate recovers no complete word. It is therefore a charged numerical coincidence, not a source-selected decoder.

### Add one global linear position term

To exhaust the simplest affine clock extension, freeze:

~~~text
raw_j = a*C_j + b*C_(n-1-j) + d*j
~~~

over all **29^3 = 24,389** triples, with the same exact sum correction and no target rune input. Source-only family commit: `d716e99c016b7d56f3cb6992510235a7fa499571`.

Result:

~~~text
exact q1 block decoders: 0 / 24,389
exact q3 block decoders: 0 / 24,389
exact full paired decoders: 0 / 24,389
best rune agreement: 8 / 33
best triple: (24,23,0), again with 0 complete words
~~~

Exactly one triple recovers two complete words: `(a,b,d)=(14,17,5)`, which yields p32 YOU and p34 BE but fails all six remaining q-block words and reaches only 5/33 rune coordinates overall. The tuple can be named retrospectively as `[-b,K+b,g]` from p6, but it was selected only after searching all 24,389 triples and does not generalize across even the first four-word block. Preserve it as a charged coincidence only.

These exhaustive finite families rule out a broad simple interpretation: the missing ordered serializer is not a global GF(29) affine function of the current rune, its mirrored partner, and linear within-word position, even when each page is granted the independently frozen correct additive sum.
## Gate 5: q-word 2x2 state-matrix recurrence fails the checksum before plaintext

The low-dimensional coordinate formulas above do not cover a genuinely stateful vector recurrence. A separate source-only freeze therefore gives each four-rune p6 q-word its most literal 2×2 GF(29) interpretation and uses the already frozen page metadata as a two-coordinate state.

For q1 use W1 `[24,16,14,17]`; for q3 use W3 `[6,27,15,17]`. Charge exactly the shared conventions:

- matrix entries from the literal word or H4(word);
- row-major matrix or transpose;
- forward matrix or inverse;
- initial state `(receiver delta, key sum)` or `(key sum, receiver delta)`;
- emit state coordinate0 or coordinate1;
- emit before or after each matrix step.

This is **2×2×2×2×2×2 = 64** complete paired recurrence conventions. The source-only generator and all predicted keys were committed before any target grading:

- generator: `sims/lp2_p6_qblocks_matrix_recurrence_pretarget_sft.cjs`, commit `b06601e2d08222ae3beb8f0c96a690d61cacd885`;
- pretarget outputs: `im-results/lp2-p6-qblocks-matrix-recurrence-pretarget.json`, commit `2cc48c5752c97e1d034412d83866ded4ecb5229b`.

The independently frozen p6 companion key sums are then a target-free necessary gate. The result is decisive:

~~~text
64 conventions total
56 match 0 / 8 q-page key sums
 8 match 1 / 8
 0 match 2+ / 8
 0 match all 8 / 8
~~~

Therefore this entire 2×2 state-vector interpretation is rejected **before any authenticated target rune is consulted**. The failure is stronger than another English-score negative: a candidate ordered key law cannot violate seven of eight already frozen page checksums.
## Gate 6: q-word Möbius recurrence fails with the key sum held out

A four-rune word can also define the standard projective action of a 2×2 matrix on one GF(29) scalar. This gives a nonlinear state recurrence without adding fitted coefficients.

For each q block, take W1/W3 or H4(W1/W3), optionally transpose, optionally invert the matrix, and iterate:

~~~text
x -> (a*x+b)/(c*x+d) mod29.
~~~

Each page starts only from its frozen receiver delta; the p6 companion key sum is **not** used to generate the stream and remains a held-out necessary check. Charge seed-first versus step-first emission. This gives **16** shared conventions across both q blocks.

Source-only generator commit: `54c579ff50ebb6fb7d6edddf9b9080f6767b4062`. Pretarget outputs: `im-results/lp2-p6-qblocks-mobius-recurrence-pretarget.json`, commit `8e7a8ce2e5652e79c9ed65bda3afdcbbcf7bde59`.

Result before any target grading:

~~~text
16 conventions
11 match 0 / 8 key sums
 5 match 1 / 8
 0 match 2+ / 8
6 conventions avoid all projective poles
10 encounter at least one denominator-zero page
~~~

Thus the projective 2×2 interpretation is rejected at the same target-free checksum gate. Together with Gate5, the most canonical linear-vector and Möbius uses of the four-rune q words fail to serialize the ordered keys.
## Gate 7: q-word cyclic convolution fails in its permutation-invariant DC channel

The remaining frontier explicitly calls for a genuinely vector-valued operation. A literal four-rune q-word has one standard full-vector use that is not contained in the scalar direct/mirror families above: treat it as a polynomial kernel and circularly convolve each receiver word in `GF(29)[x]/(x^n-1)`. This naturally works at every receiver arity without padding or a fitted coordinate clock.

The test is target-rune-blind. Use W1 on q1 and W3 on q3, allowing the same three already charged source representations (`direct`, `H4`, `H2adjacent`). For a generous closure, the two q blocks may even choose their representations independently. Charge forward or inverse convolution, action on the plaintext or on the additive key, and either global sign.

No coordinate grading is necessary. Every circular convolution has the exact DC identity

~~~text
sum(kernel ⊛ word) = sum(kernel) * sum(word) mod29.
~~~

Every permutation of the four kernel coefficients has the same sum, so this one invariant simultaneously covers all 24 coefficient orders per q-word, including rotations, reversals, convolution/correlation orientations and arbitrary printed-order permutations. For an invertible circulant, inverse convolution has DC multiplier `sum(kernel)^-1`; a singular inverse candidate is invalid before decoding.

The original selected receiver sums are

~~~text
q1 Csum = [5,28,6,3]
q3 Csum = [9,1,18,25].
~~~

The independently frozen p6 companion requires

~~~text
q1 key sums = [4,0,0,25]
q3 key sums = [7,0,28,0].
~~~

The three kernel representations have blockwise DC multipliers

~~~text
direct      [13,7]
H4          [22,8]
H2adjacent  [18,13].
~~~

Exact census:

~~~text
same representation on both q blocks:
  24 DC signatures
  best = 1/8 required page sums
  exact 8/8 = 0

allow q1/q3 representations independently:
  72 DC signatures
  best = 2/8 required page sums
  exact 8/8 = 0
~~~

The unique 2/8 signature is forward positive key convolution with q1 `H2adjacent` and q3 `H4`; it predicts `[3,11,21,25 | 14,8,28,26]`, matching only p35 and p39. It cannot be rescued by changing coefficient order because the obstruction is the permutation-invariant DC channel itself.

Accounting for 24 coefficient permutations independently in both q words, the generous charged closure contains **41,472 labeled permutation/action slots** before removing singular inverse cases. Every valid member is already rejected by the necessary checksum. This excludes a natural full-vector family that is genuinely distinct from Gates 4–6: the missing serializer is not circular convolution/correlation by the literal q-word state, its canonical H4 image or its adjacent-H2 image.

Reproduction: `node sims/lp2_p6_qblocks_cyclic_convolution_checksum_gate_sft.cjs`.

## Evidence boundary

This is a bounded negative, not a proof that p6 has no ordered serializer. The tested family is deliberately small and motivated: three already published p6 four-scalar representations, two signs, three simple clocks, then two canonical ways to enforce a separately frozen scalar sum.

Do not rescue the family by introducing target-tuned coordinate corrections, page-specific exception vectors, or arbitrary redistribution of the sum deficit. Such repairs would erase the pretarget constraint that makes the test informative.

The remaining viable route requires a new source-visible vector operation, coordinate selector, state transition, or historical instruction that determines how the frozen scalar key sum is distributed across ordered coordinates.

## Reproduction

- Base pretarget output: `im-results/lp2-p6-qblocks-pretarget-output.json`.
- Uniform projection generator: `sims/lp2_p6_qblocks_sum_projected_decoder_sft.cjs`.
- Uniform pretarget output: `im-results/lp2-p6-qblocks-sum-projected-pretarget-output.json`.
- Outer-H projection generator: `sims/lp2_p6_qblocks_outerH_sum_projected_decoder_sft.cjs`.
- Outer-H pretarget output: `im-results/lp2-p6-qblocks-outerH-sum-projected-pretarget-output.json`.
- Post-freeze projection grader: `sims/lp2_p6_qblocks_sum_projection_grader_sft.cjs`.
- Pretarget mirror-affine family: `sims/lp2_p6_qblocks_mirror_affine_sum_family_sft.cjs`.
- Pretarget mirror+position family: `sims/lp2_p6_qblocks_mirror_affine_position_sum_family_sft.cjs`.
- Post-freeze affine grader: `sims/lp2_p6_qblocks_receiver_affine_grader_sft.cjs`.
- Pretarget matrix recurrence: `sims/lp2_p6_qblocks_matrix_recurrence_pretarget_sft.cjs` and `im-results/lp2-p6-qblocks-matrix-recurrence-pretarget.json`.
- Matrix checksum gate: `sims/lp2_p6_qblocks_matrix_recurrence_checksum_gate_sft.cjs`.
- Pretarget Möbius recurrence: `sims/lp2_p6_qblocks_mobius_recurrence_pretarget_sft.cjs` and `im-results/lp2-p6-qblocks-mobius-recurrence-pretarget.json`.
- Möbius checksum gate: `sims/lp2_p6_qblocks_mobius_recurrence_checksum_gate_sft.cjs`.
- CI: `.github/workflows/agent11-p6-qblocks-sum-projection.yml`.
