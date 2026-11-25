# Shared unrestricted affine BASE29 low-order key recovery

**Decision:** the two-source blind exact-key calibration gate failed; original LP2 was deliberately not scored. This is a receiver/power failure, not a cipher-family exclusion. No unknown plaintext or authentic key recovered.

The authenticated 2013 BASE29 conversion and repeated LP2 chapter structure motivate an exploratory common positional integer inverse P=A*C+B mod 29^N. Previous short-unit and two-pass carry receivers do not grant unrestricted common long A and B. Neither the original material nor this experiment authenticates that sharing or affine operation. Here use literal big-endian digit significance, complete chapter endpoints, every rune including F=0, no printed word assumptions. The **64 least-significant digits** of each of nine corrected chapter intervals are processed. A is a unit; its 64 base29 digits and B's 64 digits are unknown. This is not a small-key search. Use seven middle chapter endings as development, p0–2 and p54–55 endings as withheld predictions; these original scopes have prior collective exposure. The low-order identity is exact for any actual full-length shared key.

At depth d, given the preceding A/B digit choices and carry for each chapter, the next digit obeys p[j,d]=(carry[j]+sum_{t=0}^{d} A[t]*C[j,d-t]+B[d]) mod29. Enumerate every next pair (A[d],B[d]) for each retained prefix, retaining 256 highest cumulative interpolated native unigram/bigram/trigram scores across the seven training tracks. No fitting on withheld tracks. The beam is finite and may miss the true key; training uses reversed Gibran only, and the two distinct blind controls use separate Shakespeare and Emerson passages, each nine nonoverlapping 64-rune windows and an independent full-width planted key. The output is checked against full BigInt convolution and exact modular inverse replay. Only if both exact keys and all plaintext digits recover is the original scored.

| Plant | Exact key digits /128 | Correct rune digits by chapter /64 | Training score | Held-out scores | Gate |
|---|---:|---|---:|---|---|
| Shakespeare | 1 | 3,3,4,4,6,5,5,2,3 | -2.45637 | -4.15239,-4.13967 | fail |
| Emerson | 61 | 31,32,32,31,30,32,32,32,30 | -2.37648 | -3.61622,-3.58799 | fail |

The calibration failure means the seven-track GP model/beam does not identify a full unrestricted affine state at the declared width and length. Do not interpret it as an original-cipher result. The low-order convolution is reusable only if an independently motivated additional constraint reduces the key degrees of freedom. Do not increase the beam merely to obtain a negative on LP2.

- [SFT](../sims/lp2_shared_long_base29_affine_sft.cjs), connected V8 computational core executed; standalone Node wrapper not separately run.
- [Raw output](lp2-shared-long-base29-affine-output.json).
- Pinned source blobs: `resources/liber-primus/lp2-corpus.json` `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; `resources/control/gibran_prophet_58585.txt` `df260a07d56bf5998d40a6360b6132c35c252d10`; `resources/control/shakespeare_first300k.txt` `94c677ad9dd50771c6670e0c4e4dad9052b46d85`; `resources/control/emerson_essays_2944.txt` `a92be8ba5b3511a003a22ba31523c14397aaa83a`. Shakespeare first 300 lines only.
