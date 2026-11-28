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
- CI: `.github/workflows/agent11-p6-qblocks-sum-projection.yml`.
