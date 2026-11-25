# Spacing-free stationary local-function / linear-filter collision envelope

Agent8, 25 November 2026. **Exact conditional exclusion on original LP2; no recovered plaintext or key.** This removes printed-word preservation from the earlier [nonlinear second-difference receiver](lp2-wordlocal-nonlinear-second-difference-gate.md) and extends far beyond its fixed finite-difference coefficients. It is exploratory: the historical GP29 and differential ideas do not select the general receiver.

## Necessary condition, no dictionary or assumed printed boundaries

Let C and P be equal-length rune tapes. For width w = 3 or 4, suppose a stationary nonzero linear ciphertext filter over GF(29) satisfies

```
U_i = sum(j=0..w-1, a_j C_(i+j)) + b mod 29
U_i = g(P_i, ..., P_(i+w-1))
```

where g is **any** stationary deterministic function of the w consecutive plaintext symbols (it may be secret, nonlinear, noninjective, or composed with an arbitrary substitution). If two plaintext windows of length w+3 are identical, the corresponding four consecutive output residues must be identical. Hence the number of unordered pairs of identical plaintext (w+3)-grams cannot exceed the number of unordered pairs of identical filtered ciphertext four-grams. Overlapping occurrences are counted in both. Normalizing the first nonzero a_j to 1 and dropping b preserves collision counts, so only (29^w-1)/28 directions need checking: 871 at w3, 25,260 at w4. These counts include degenerate lower-support filters; the two direction sets overlap in their effective laws. Every actual nonzero coefficient choice and fixed bias is covered. The relation is necessary even without assuming the local function is invertible; a genuine reversible plant is tested below.

The fixed original input is all 12,956 unresolved GP29 runes in physical order, p0–55, with nonrunes omitted and no use of word separators. Independently maximize the four-gram pair count over every direction on the whole book and each of the nine physical chapter spans; no cross-boundary windows are counted in the individual chapter scores. Compare to **every** same-length contiguous native-GP window in the pinned Shakespeare, Emerson and Gibran corpora (Gutenberg header/footer removed when present; canonical GP29 multigraphs and ING/IO normalization). The native lower bound is computed by exact sliding-window counts, not sample quantiles. Raw JSON includes all maxima, witnessing coefficients, all three reference minima/maxima, window counts, and minimum witness offsets. Min/max witnesses are independently recomputed from their full slices.

## Original result

| Scope | w3 original maximum | w3 native minimum | w4 original maximum | w4 native minimum |
|---|---:|---:|---:|---:|
| Full 12,956 | 152 | 1,517 | 170 | 631 |
| p0–2 | 4 | 0 | 5 | 0 |
| p3–7 | 5 | 2 | 7 | 0 |
| p8–14 | 9 | 13 | 10 | 2 |
| p15–22 | 9 | 18 | 11 | 3 |
| p23–26 | 5 | 1 | 7 | 0 |
| p27–32 | 6 | 4 | 9 | 0 |
| p33–39 | 9 | 9 | 11 | 1 |
| p40–53 | 16 | 70 | 19 | 27 |
| p54–55 | 2 | 0 | 4 | 0 |

Strict whole-book exclusions apply for both widths against all 532,721 matched contiguous native windows. Even allowing an independently stationary filter and independently arbitrary g per chapter, p8–14, p15–22 and p40–53 fail at width 3, and p40–53 fails at width 4. A failure of the inequality excludes this exact stationary-local relation for the stated finite reference register, **not** every possible English text, and non-exclusion supplies neither a key nor a plaintext candidate.

The full-book width-4 maximum 170 is achieved by normalized [1,18,4,3]; the width-3 maximum 152 by [1,10,18]. These maximizing coefficients are not recovered keys. In particular, the original output statistics remain far below the native floor even at those maxima. No annealing or language-based permutation fit is justified on these failed scopes.

## Reversible controls

Two independent receiver widths use native Shakespeare GP runes at offset 10,000 and length 12,956, secret nonzero-terminal-coefficient filters [4,19,1] and [8,2,13,1], and a nonlinear plaintext function (secret affine permutation of P_last + P_0*P_1, plus 5*P_2 at width4). The planted cipher and plaintext invert exactly given the first w-1 states and actual keys: 12,956/12,956 each. Their normalized-filter output collision counts satisfy the necessary bound: width3 5,403 >= 5,160 and width4 2,942 >= 2,754. The controls verify the actual reversible model and inequality, not blind key identifiability.

## Decision

Retire whole-book stationary width <=4 local-plaintext / linear-ciphertext-filter inverse as a plausible native-reference continuous receiver. The printed-boundary objection no longer rescues this particular mechanism, and stationary nonlinear plaintext preprocessing cannot rescue a fixed linear ciphertext filter. The result leaves changing keys/state laws, nonconsecutive taps, wider filters, nonlinear ciphertext filters, alternate plaintext order, insertion/deletion, chapter-specific short-text cases, and texts outside the finite register open. No author clue selects wider filters; do not expand parameter searches merely to rescue the result.

Executed the complete [Node22/CommonJS SFT](../sims/lp2_stationary_local_nonlinear_filter_collision_sft.cjs) experiment function in connected V8, with original and reference witness assertions and both plant roundtrips passing; standalone Node CI not separately run. [Raw output, inputs and source blob IDs](lp2-stationary-local-nonlinear-filter-collision-output.json). Initial prototype chapter-boundary condition failed witness assertion and was corrected before the complete executed/persisted version. No results from the failed prototype are reported.
