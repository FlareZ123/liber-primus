# Prime-driven quadratic feedback: exact all-coefficient recovery, original negative

**Decision.** Under a continuous physical-rune prime clock, no invertible member of the following family fits the original 68 training singleton words with at most four exceptions to two arbitrary dominant plaintext symbols:

```
P_i = a C_i + sum b_j C_(i-j) + sum q_jk C_(i-j) C_(i-k)
      + sum d_j (prime[i+s-j]-1) + e   (mod 29)
j=1..3 for ciphertext lags; 1<=j<=k<=3 for quadratic terms;
j=0..3 for prime drive; a != 0; s=0..463.
```

Zero-based prime list, zero padding at negative indices. The 464 starting ranks are motivated by the actual 2013 prime_echo stop at 3301 (rank 464), and the drive by the authentic p56 decoder. The latter is reproduced exactly on all 85 original runes using its actual plaintext-F hold (84 consumed primes); the tested family deliberately uses the simpler physical clock, and does not claim to cover that authentic hold.

## Exact recovery

The ciphertext feature row has 15 entries. At 68 genuine printed singleton positions in physical pp0–39 (9,640 runes), partition the sites into six groups of 11 or 12. Every pair of groups yields an independent 15-row basis for every tested origin. At most four exceptional sites can contaminate four groups, so at least two clean groups remain. The 15 pair bases cover every admissible key. Normalize the dominant plaintext pair to 0/1; enumerate 2^14 assignments per basis modulo complement; recover coefficients by GF29 inversion and check all remaining sites with at most four exceptions. Require nonzero current coefficient. All affine labels are then considered on training only, with independent Gibran native-GP bigram scoring. Decode the sealed suffix only after key selection and replay forward.

## Executed results

| | Original pp0–55 | Independent contiguous Gibran plant |
|---|---:|---:|
| Origins | 464 | 464 |
| Enumerated normalized assignments | 114,032,640 | 114,032,640 |
| Unresolved rank/cover cases | 0 | 0 |
| Surviving normalized keys | 0 | 1 |
| Exact recovered clock | — | 137 |
| Exact recovered coefficients | — | 15/15 |
| Recovered plaintext | — | 12,627/12,627 |
| Sealed continuation | 3,316 unscored; no key | 1,906/1,906 |

Plant key [13,2,17,9,18,7,22,15,5,3,11,6,14,8,4], learned exactly; true normalized pair hits all 15 bases. Forward replay exact. Original: zero hits, no candidate to score. This is conditional exclusion, not a recovered LP2 plaintext. Does not cover plaintext-F clock skips, other prime origins, unconstrained singleton types, changed word segmentation, different recurrence structures, or pagewise resets.

Reproduce with `node sims/lp2_prime_driven_quadratic_inverse_sft.cjs original` and `node sims/lp2_prime_driven_quadratic_inverse_sft.cjs plant`. Both actually executed in V8 against the repository source corpus.
