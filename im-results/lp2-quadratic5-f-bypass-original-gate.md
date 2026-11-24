# Five-back quadratic feedback with the historical literal-F bypass

## Decision

The prior full quadratic causal inverse excluded a common five-back quadratic law on the printed rune stream, but did not allow the first-party plaintext-F clock exemption demonstrated by solved Cicada pages. This experiment closes that exact loophole, conditional on intact printed words and two dominant plaintext singleton types with at most four exceptions among 57 eligible training sites. **No original key or unknown plaintext recovered.**

Define the five-symbol history h from previously consumed ciphertext, not the previous five physical positions. For an enciphered non-F rune,

```
P = a C + sum_j b_j h_j + sum_{j<=k} q_jk h_j h_k + d (mod 29)
a != 0
```

and shift C into h. A literal plaintext F emits ciphertext F and leaves h unchanged. An enciphered non-F can also emit ciphertext F; its interpretation is unknown. A non-F ciphertext cannot come from a literal plaintext F. Arbitrary initial state is allowed. This is a testable family combining the observed historical exception with the previous five-back nonlinear inverse, not a claim that the author specified quadratic feedback.

## Original decisive test

Use canonical 12,956-rune, 2,896-word tape. Training pp0–39 (9,640 runes), sealed pp40–55 (3,316). Of 68 training singleton positions, 57 have six consecutive non-F ciphertext symbols including themselves. At each such site, the five consumed predecessors are exactly the five physical predecessors, **regardless of every previous ambiguous F interpretation**. Thus the corresponding 22-variable linear feature equations are exact under this model.

Normalize the two dominant plaintext singleton values to 0/1, regardless of their actual identities. Partition 57 rows into seven groups of sizes 9,8,8,8,8,8,8; every triple union contains an independent rank-22 basis. With at most four exceptional sites at least three entire groups are clean, so one of the 35 bases must consist exclusively of normalized 0/1 outputs. Enumerate every one of its 2^21 binary assignments modulo output complementation; check all remaining equations with a budget of four exceptions. The sole passing assignment for each basis is constant output, with a=0. All **73,400,320** enumerated assignments completed, zero invertible candidates. No IV or F-mask guess can rescue the family under the singleton assumption.

## Blind recovery control

Use a fixed independent GP conversion of Gibran's second-half corpus. Secret coefficients and five-symbol initial state are generated with the frozen script seed. Encode with plaintext-F clock exemption. Stop training at the 57th safe singleton (11,174 physical runes); actual two dominant singleton types are A/I and there are no exceptions. Train bigram/vocabulary model on first-half text only.

The same complete search produces one normalized invertible key; select its affine label using safe training positions, where enciphered plaintext F is forbidden. All 22 coefficients are exactly recovered. Freeze them for 21,375 withheld ciphertext symbols. Decode by exact Viterbi over five-symbol consumed history and previous decoded rune, enumerating both possible meanings of ciphertext F at each position; merge states at actual word boundaries after fixed vocabulary bonus. Resynchronize using the first five consecutive non-F ciphertext symbols, so no IV is fitted. Maximum state width 8. The decoder's selected path re-encrypts exactly, including every F decision.

| Control | Correct / total |
|---|---:|
| coefficients | 22 / 22 |
| post-resynchronization plaintext | 32,517 / 32,544 |
| untouched continuation plaintext | 21,356 / 21,375 |
| literal-F decisions | 32,531 / 32,544 |

27 plaintext errors remain, 19 in withheld text; do not describe mask recovery as exact or equate exact forward replay with a unique plaintext. The original exclusion is exact under the defined constraints, independently of the approximate language-based choice between ambiguous F paths.

Actual V8 execution: original 33.020 s, control 36.619 s, same single-file source. No speculative new coefficients or phases. Retire this F-bypass extension of the five-back quadratic receiver under its stated assumptions. Do not expand polynomial order absent an independent first-party selector or strong structural receiver.

- [Standalone CJS](../sims/lp2_quadratic5_f_bypass_cover_inverse_sft.cjs), run with argument original or plant.
- [Original exhaustive output](lp2-quadratic5-f-bypass-original-output.json).
- [Blind control output](lp2-quadratic5-f-bypass-plant-output.json).
- [Earlier non-bypass inverse](lp2-quadratic5-singleton-cover-original-gate.md).
