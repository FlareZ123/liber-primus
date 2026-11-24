# Agent2 — previous-step row inverse: retire exact architecture

Independent draw1, 24 November 2026. Original p0–39 fit, p40–53 frozen suffix. New state j = C[i-1]−C[i-2] and output D = C[i]−C[i-1], with arbitrary fixed affine row D=a[j]P+b[j]. This is distinct from absolute predecessor or absolute two-back context.

- Literal F bypass is algebraically impossible even with arbitrary permutations: 22 training rows observe all 29 D values at nonzero absolute ciphertext; 8 independently on suffix, 23 pooled.
- Ordinary exact all-permutation native-unigram maximum is below the step-only null even on training (−0.304367 nats/rune), suffix independently refitted (−0.037380), pooled (−0.357250). Pooled top-nine mass ceiling 40.756%, native profile 65.559%. Frozen arbitrary row suffix −0.723283.
- Two length-matched Gibran plants with distinct hidden keys, same donor slice: 28/29 and 29/29 affine rows recovered; 2,974/3,008 and 2,960/3,008 suffix signs correct, 6,016/6,016 replay. Original affine suffix −0.723471, nonprose.

[Report](../../im-results/lp2-step-context-affine-inverse.md) · [SFT](../../sims/lp2_step_context_affine_inverse_sft.cjs). No unknown plaintext, key, or source-selected state. Retire only this stationary previous-step law; no further state selector tuning absent independent clue. Core executed, standalone CJS wrapper not separately run.
