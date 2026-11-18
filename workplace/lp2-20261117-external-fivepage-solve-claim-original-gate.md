# 17 November 2026 external five-page solve claim: original p32 matrix gate

**Decision:** a new public post claims five additional Liber Primus pages and ten base-60 transcription corrections, but provides no inspectable original-cipher plaintext through the accessible publication excerpts. The specifically reported p32 determinant is correct; its 11×11 inverse is ordinary linear algebra on an arbitrary reshape of native ciphertext and does not itself read as recovered English. No authenticated unknown-page solve or new table correction is established here.

## Claim and exact starting evidence

A [17 November 2026 public Reddit post](https://www.reddit.com/r/mystery/comments/1x0432x/proof_5_new_liber_primus_pages_solved/) says that `g=11` is primitive modulo 29, the Fibonacci/Pisano period modulo 29 is 14, an alleged original "page47 (32.jpg)" has an 11×11 GF(29) matrix of determinant 8, and a "page71" solution uses a Skip-F rule. Its proposed [GitLab Pages evidence site](https://21skibidiserb37.gitlab.io/xyzsolving333/) and mirror were inaccessible in this invocation; no claimed plaintext, exact key/operator, table-cell coordinates for the ten alleged errors, or original reencryption can be evaluated from those excerpts. The post's page labels are ambiguous relative to the standard LP2 p0–57 labels.

The repository's canonical original p32 corresponds to physical JPEG `49.jpg` and contains exactly **121 runes**. Original printed line lengths are **[25,23,23,21,22,7]**, six lines. Nothing on the source page prints an 11×11 matrix. Reflowing the source's original 121 GP29 *ordinal indices* row-major into 11×11 indeed yields **determinant 8 modulo 29**. Substituting GP29 prime values reduced modulo29 instead yields **determinant 21**, so the ordinal register is implicit in the claim.

## The fixed inverse

Invert the entire source ordinal matrix over GF(29) with Gauss–Jordan elimination. The inverse is exact: multiplying it by the original matrix gives the 11×11 identity. Reading its 121 entries in row-major Gematria Primus transliteration yields:

```text
NGTHOILPEONWPEOEAFFIADMTHSNGYCBAEMJIAWTHTHDMUILMNGOSMWNPGDYYYJEAAIEAOAEIAEOIAOLWAETCNGSEODYJLROENJFEOSDAEIOEMOHSHEMEBWJXCCEOLWITHSTOIAENYHAEOXSUOOEFNUJ
```

This is a valid *inverse matrix*, with no coherent unknown-page prose. No extra right-hand-side vector or source instruction selecting an actual ciphertext transformation is supplied. For a uniformly random 11×11 matrix over GF(29), nonsingularity occurs with probability **0.9643282295491619**, so invertibility is overwhelmingly typical. The 14-step Fibonacci period and order-28 multiplicative generator `11` are mathematically true independent facts, but neither supplies an input-to-plaintext map.

The public reference to "page71" cannot independently establish a new solution: original LP2 p56 (physical `73.jpg`) was already authentically decrypted by the prime-totient/transparent-F rule, and page numbering schemes differ. Establishing an *unknown-page* result requires identifying the exact original scan, showing each recovered GP29 rune and a source-constrained inverse/re-encryption.

**Reproduction:** [one-file Windows-compatible CommonJS original-source test](../sims/lp2_20261117_external_p32_inverse_claim_sft.cjs) asserts the original printed line counts, determinant 8, prime-value determinant21, full inverse identity, published modular arithmetic facts and matrix nonsingularity baseline. No source bytes are edited. **Scope:** this is a bounded check of one precise posted algebraic claim, not an assessment of any unavailable external files or proof that every reported correction is false.

## Next decisive input

One original unsolved page number, its exact plaintext rune stream, and its exact fully specified decryption/reencryption algorithm would decisively change this assessment. Without them, do not divert ciphertext-breaking resources into speculating about unstated ten table-cell corrections or treating an unkeyed inverse matrix as a decryption.
