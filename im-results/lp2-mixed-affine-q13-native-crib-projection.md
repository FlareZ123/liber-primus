# Agent 6: exact lag-13 mixed-affine source-crib projection

## Problem and scope

The prior [mixed-affine consuming feedback gate](lp2-mixed-affine-consuming-fhold-exact-gate.md) rules out continuous single-tap nonstatic models at q=1..8, but its q=13 reachability attempt capped. The independently solved LP1 KOAN's thirteen-rune key is a reason to test q=13, not evidence selecting this feedback law. Instead of repeating the capped unknown-primer search, exploit an independently known plaintext phrase to *recover* all four coefficients, then predict the remaining ciphertext. The nine published solved GP29 plaintext records are a finite source register, not an exhaustive dictionary of LP2's possible prose.

For native non-F plaintext P and consuming lag q=13, write C_t=u P_t+v P_{t-q}+b C_{t-q}+d (mod 29), v=u a, u nonzero. Plaintext F emits C=0 and holds the queue. A known plaintext window determines the exact consuming clock; the first q consuming symbols are unconstrained by the unknown prior queue. Three source-only linearly independent rows of (P_t,P_{t-q},1) give a matrix M. For any other row R, let w=R M^-1. Eliminating (u,v,d) yields A=b B, where A=C_t-w C_piv and B=C_{t-q}-w C_{piv-q}. Nonzero B fixes b; B=0 requires A=0. All remaining b values are explicitly enumerated, and u,v,d recovered from the pivot equations; a=v/u. No guessed primer, language score, or approximate F alignment is needed.

## Experiment

- Original 12,956 runes, physical pages 0–55, in their preserved order.
- Every 42-rune contiguous window within the nine source-native solved sections; 2,610 windows, no rank-deficient source matrices.
- First 26 physical runes are the fit, remaining 16 a frozen exact-prediction holdout. All possible original 42-rune placements (including cross-page) were granted.
- 33,708,150 source/target pairs; 22,847,461 satisfied the training F-position constraint.
- **Zero** survived the projected affine equations; zero fitted coefficients and no 42-rune original match.
- Six deterministic seeded native-phrase controls with independent primers and key tuples: **6/6** true alignments and full coefficients recovered, including controls with 1 and 2 literal-F holds. Five controls had exactly one full match; the a=0 control admitted 14 full matches because several neighboring windows share the same constrained suffix and the first q consuming symbols are unconstrained. This does not prove global uniqueness. All six predict the held-out 16 runes exactly at the true alignment.

## Decision

Reject this exact long contiguous reuse of the solved Cicada plaintext register under the continuous lag-13 stationary mixed-affine feedback law. This is a constructive key-recovery attack with a finite original null, **not** a rejection of arbitrary unknown plaintext, other registers, other lengths, or general lag-13 feedback. The prior q13 reachability cap remains unresolved.

Reproducer: [lp2_mixed_affine_q13_native_crib_projection_sft.cjs](../sims/lp2_mixed_affine_q13_native_crib_projection_sft.cjs). Run via Node from the repository root; no dependencies. Experiment function executed against the actual pinned repository contents in the connector's JS runtime. Source corpus is externally transcribed solved material, not an original-byte authentication claim. No unknown LP2 plaintext, key, or destination recovered.
