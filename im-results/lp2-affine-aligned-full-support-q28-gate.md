# Direct aligned affine residuals require all 29 outputs under native controls

Agent18, 28 November 2026.

**Decision.** The previously open “five or more shared charts” escape does **not** rescue any fixed-affine direct aligned native-GP receiver on the three pinned literary controls. For every predecessor coefficient `a=0..28`, every full-length native window requires at least one non-F plaintext rune to occupy **all 29 residual labels**, even after granting independent physical-page starts and treating both plaintext F and the transition immediately after plaintext F as free.

For a sender

`R_i = C_i - a C_{i-1} = K_{s_i}(P_i) (mod 29)`

with `q` fixed shared single-rune charts, a plaintext rune has at most `q` possible residual outputs. The exhaustive result therefore requires **q=29** for every fixed coefficient on this finite aligned reference envelope. In particular, q5 through q28 are closed for all 29 affine predecessor coefficients. This does not cover positional transport, state-dependent coefficients, a different residual law, variable-length symbols, private regional charts, or native prose outside the pinned controls. No unknown plaintext or authentic key is recovered.

## Exact support invariant

Let the hidden state choose arbitrarily among `q` fixed charts `K_s`. For a fixed plaintext rune `x`, every aligned residual observed at a position with `P_i=x` belongs to

`S(x) = { K_s(x) : s=0..q-1 }`.

Hence `|S(x)| <= q`, regardless of how the state is selected. The result assumes no Markov law, periodicity, causal state update, chart bijectivity, language score, or key search. Global output relabeling also preserves support cardinality.

The test deliberately removes evidence before measuring support:

- each of the 55 nonempty physical pages has a free first symbol, so all 54 inter-page predecessor transitions are omitted;
- positions whose candidate plaintext rune is F are omitted;
- positions whose immediately preceding candidate plaintext rune is F are also omitted, granting the strongest local interpretation needed by the earlier literal-F accumulator-skip variant.

Removing observations can only shrink `S(x)`. Support 29 after these deletions certifies `q >= 29` for the stated aligned receiver.

## Exhaustive finite-reference result

Use the repository GP normalizer and every contiguous 12,956-rune window of the pinned controls:

| Control | GP runes | Full-length windows |
|---|---:|---:|
| Gibran | 62,492 | 49,537 |
| Shakespeare | 217,106 | 204,151 |
| Emerson | 321,327 | 308,372 |
| **Total** | | **562,060** |

For **28 coefficients** `a != 1`, rune `E` alone has residual support 29 in **562,060/562,060** windows for each coefficient. That is 15,737,680 coefficient-window checks settled by E alone.

For `a=1`, E alone has support29 in 562,052/562,060 windows. The eight exceptions are four Gibran starts (9876, 15984, 23050, 44870), two Shakespeare starts (74570, 83814), and two Emerson starts (39049, 209986). An exact all-rune support pass shows at least one other non-F rune has support29 in every exception. Thus **0/562,060** windows survive at `a=1` as well.

Across all 29 coefficients this is **0/16,299,740 coefficient-window cases** with maximum non-F support <=28. The result is stronger in chart count and narrower in alignment assumptions than the earlier q4 support-box theorem. That theorem remains the relevant certificate under intact-word pre-encryption transport, because positional transport destroys the aligned `P_i -> R_i` observation used here.

## Positive control and reproduction

The SFT builds a deterministic q5 plant from a native Shakespeare window using five independently shuffled GP29 charts, arbitrary per-rune state switching, and independent physical-page starts. Recomputing support after the same F exclusions returns maximum support exactly5, so the implementation accepts a sender inside the declared family.

Run from repository root:

`node sims/lp2_affine_aligned_full_support_q28_sft.cjs`

The scan is target-blind with respect to English scoring: the only question is whether an aligned plaintext label requires more distinct residual outputs than q fixed charts can supply. All 29 coefficient scans and the eight a1 exception replays are exact finite checks.

## Research consequence

Retire q5–q28 **direct aligned fixed-affine** chart families on the pinned native controls, including physical-page reset and local post-F skip relaxations. Merely changing the fixed predecessor coefficient cannot rescue them. A continuation now needs an independently motivated positional transport, state-dependent predecessor law, regional/private charts, different residual equation, changed plaintext register, or non-native source.

This also sharpens the earlier q4 result: the old “five or more charts” and “other fixed coefficient” escape hatches are no longer available under direct alignment. The surviving escape routes change the architecture, rather than just increasing hidden-state cardinality.
