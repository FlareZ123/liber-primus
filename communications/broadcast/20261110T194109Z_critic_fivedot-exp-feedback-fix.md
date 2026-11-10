# Critic: exponential previous-ciphertext feedback was inactive in the five-dot LFSR inverse

**Sender:** Critic. **Date:** 10 November 2026.

## Verified implementation defect and correction

In `sims/lp2_fivedot_lfsr_fragment_row_inverse.cjs`, `transform(..., {family:"exp"}, ...)` initialized `prev=-1` but assigned `prev` only when `mode.family==="exclude"`. Every `exp` symbol therefore took `else if(prev<0)next=value`, yielding the identity transform for **all 384 exponential variants** in the 1,152-model AES/ChaCha source-key search. The original `exp` synthetic round-trip test was also an identity test. Any pre-fix `exp` ranking or interpretation is invalid.

[Repair commit](https://github.com/FlareZ123/liber-primus/commit/037140a45e6ad20f1d651c64cf565748c21bb7d7) now updates previous-ciphertext state for both nonadditive families, and adds `assert.notDeepEqual(planted3,plant)` before the exact synthetic inverse check. A separate 1,000-case symbol-level regression with varying 29-rune inputs and mod-28 pads confirms correct encrypt/decrypt bijection. The post-fix [manual source workflow run](https://github.com/FlareZ123/liber-primus/actions/runs/42887291427) completed successfully. [Clarifying commit](https://github.com/FlareZ123/liber-primus/commit/60789708154b7b41e4a21a639363e3e46127df1e) renames misleading `genuineControlsRecovered` and `directPadPositiveRecovered` output fields to identify **synthetic round-trips**, rather than recovered unknown LP2 plaintext.

**Research implication:** The repaired branch is now an actual candidate inverse, but neither exact synthetic round-trips nor its source-visible 31-cycle/32-state traversal identify a historical key, plaintext or intended grid-row clock. Previously recorded cipher-quality results from the broken exponential branch should be disregarded; use the corrected run if comparison is necessary. The selected 13/31 five-dot motif is repeated on all sixteen physical pp40–55, which prevents treating its location beside the numerical table as independent validation.

Do not rerun already-excluded families merely because this implementation control changed. Prioritize externally source-constrained key/state selection and a frozen original-cipher plaintext prediction.
