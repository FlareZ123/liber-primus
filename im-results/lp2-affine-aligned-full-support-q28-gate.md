# Direct aligned affine residuals require all 29 outputs under native controls

Agent18, 28 November 2026.

**Decision.** The previously open “five or more shared charts” escape does **not** rescue the direct aligned native-GP receiver for first difference, nor for the two affine predecessor coefficients `a=16,19` that survived longest in the q4 support-capacity audit. Across every full-length contiguous window in the three pinned literary controls, at least one non-F plaintext rune is paired with **all 29** residual labels even after granting independent physical-page starts and treating both plaintext F and the transition immediately after plaintext F as free. Therefore any direct aligned sender of the form

`R_i = C_i - a C_{i-1} = K_{s_i}(P_i) (mod 29)`

with fixed shared single-rune charts needs at least **q=29** charts for `a in {1,16,19}` on this finite native reference envelope. This closes q5 through q28 for that aligned family. It does not cover positional transport, other predecessor coefficients, state-dependent coefficients, a different residual law, variable-length symbols, or native prose outside the pinned controls. No unknown plaintext or authentic key is recovered.

## Exact support invariant

Let the hidden state choose arbitrarily among `q` fixed charts `K_s`. For a fixed plaintext rune `x`, every aligned residual observed at a position with `P_i=x` belongs to the set

`S(x) = { K_s(x) : s=0..q-1 }`.

Hence `|S(x)| <= q`, regardless of how the state is selected. No Markov law, periodicity, causal state update, chart bijectivity, language score, or key search is needed. Global output relabeling also preserves the cardinality.

The test deliberately deletes evidence before measuring support:

- each of the 55 nonempty physical pages has a free first symbol, so all 54 inter-page predecessor transitions are omitted;
- positions whose candidate plaintext rune is F are omitted;
- positions whose immediately preceding candidate plaintext rune is F are also omitted, granting the strongest local interpretation needed by the earlier literal-F accumulator-skip variant.

Removing observations can only shrink `S(x)`. A surviving support of 29 under these deletions therefore certifies `q >= 29` for the stated aligned receiver.

## Exhaustive finite-reference result

Use the repository GP normalizer and every contiguous 12,956-rune window of the pinned controls:

| Control | GP runes | Full-length windows |
|---|---:|---:|
| Gibran | 62,492 | 49,537 |
| Shakespeare | 217,106 | 204,151 |
| Emerson | 321,327 | 308,372 |
| **Total** | | **562,060** |

For `a=1`, rune `E` alone has residual support 29 in 562,052/562,060 windows. The eight exceptions are four Gibran, two Shakespeare and two Emerson starts; an exact all-rune pass shows at least one other non-F rune has support 29 in every one of those eight. Thus **0/562,060** windows admit support <=28.

For `a=16` and `a=19`, `E` alone has support 29 in **all 562,060 windows for each coefficient**. These are the two coefficients that required the shared-support follow-up in the earlier q4 affine audit. The aligned direct family is therefore closed through q28 at exactly the coefficients where merely adding a fifth chart looked most worth testing.

The result is intentionally stronger in chart count and narrower in transport assumptions than the earlier support-box theorem. The support-box theorem remains the relevant certificate when intact words may be moved before encryption, because positional transport destroys the aligned `P_i -> R_i` support observation used here.

## Positive control and reproduction

The SFT builds a deterministic q5 plant from a native Shakespeare window using five independently shuffled GP29 charts, arbitrary per-rune state switching and independent physical-page starts. Recomputing the residual support after the same F exclusions returns maximum support exactly 5, so the implementation accepts a sender inside the declared family.

Run from repository root:

`node sims/lp2_affine_aligned_full_support_q28_sft.cjs`

The original scan is target-blind with respect to English scoring: the only question is whether a fixed plaintext label requires more distinct residual outputs than `q` charts can supply. The finite controls establish a sharp direct-alignment decision, not a universal theorem about all possible plaintexts.

## Research consequence

Do not spend further compute on q5–q28 **direct aligned** first-difference charts for these native controls, including page-reset and local F-skip variants. A larger-chart continuation is only meaningful if a source independently motivates positional transport, a different predecessor law, state-dependent coefficients, regional/private charts, or another plaintext register. For direct alignment at `a=16,19`, the ordinary letter `E` already forces the full 29-symbol output alphabet in every tested window.
