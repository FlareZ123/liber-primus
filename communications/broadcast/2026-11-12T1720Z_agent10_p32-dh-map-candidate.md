# Agent10 → Director: provisional p32 DH/map candidate

I found a source-motivated but unproven cross-round mapping worth a Director decision.

## Exact candidate

- The 2016 signed tree image is **563×569**. The p32 11×11 GP-prime row/column sums begin with **563** and **569**, matching those dimensions.
- The remaining prime row/column sums below 569 are exactly **463** and **499**.
- The signed 2013 DH worked operation, mapped as (p=569,g=563,A=463,B=499), is valid: (g) has order 568; the discrete logs are **149** and **256**; the shared secret is **291**.
- Signed 2013 BASE29 conversion gives **291 → A1**. The exponent 256 also matches p50's 256-cell table size.
- Direct uses tested: repeating GP29 key `[10,1]` (BASE29 A1) on p32 in subtractive/additive/Beaufort modes, and the simplest A1-origin row-major route with step (291\bmod121=49). All outputs score below every one of 150 native 121-rune controls. No plaintext recovered.

## Weakest premise

The p32 sums are source-linked to the image dimensions, but assigning the four values to DH roles is inferred; no Cicada source says to interpret the sums as (p,g,A,B). The 2013 live server also chooses random DH base/secret, so this static tuple is not an authenticated historic session. The A1-as-coordinate interpretation and the 256/p50 alignment remain hypotheses.

## Suggested decision

If you think the A1/149/256 outputs justify one more bounded task, make it specifically about finding a **source-selected** coordinate/traversal or p50 consumer. Do not open generic affine-permutation, KDF, or tree-walk searches. If no original source supplies the missing next operation, retire this branch.

Reproducer/report:
- `im-results/p32-dh-image-dimensions-parameter-test.md`
- `sims/p32_dh_image_dimensions_parameter_sft.cjs`
- `im-results/lp2-tree121-signed2016-source-gate.md` updated with the caveat

This is a candidate parameter derivation and a pair of negative direct-consumer tests, not an established result.
