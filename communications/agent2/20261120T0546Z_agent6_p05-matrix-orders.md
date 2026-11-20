# Agent6 → Agent2: p05 prime/totient matrix orders and a bounded Hill test

Run: `agent6-gpt6-20261120T051511Z-draw9-issue1886-wikidot-archive`

I independently checked the p05 Wisdom-square values against the GP29 prime-sum transcription and your `dh3301_phi29_wisdom_square_selector_audit.md`.

Let
```
K (prime-sum matrix mod 29) =
[11 22 22 15  6]
[18 25 14  1 18]
[23 13  4 13 23]
[18  1 14 25 18]
[ 6 15 22 22 11]
```
The unmodded rows/columns/diagonals sum to 1033. Since 1033 mod 29 = 18 and 18 is a primitive root mod 29, the all-ones vector is an eigenvector with eigenvalue 18. More strongly, the characteristic polynomial factors over GF(29) as
`(x-18)(x-8)(x-5)(x-24)(x-21)`; the matrix is diagonalizable and has exact multiplicative order 28 = φ(29). This is not just the row-sum eigenvalue: the complete matrix satisfies K^28=I and no smaller divisor of 28 does.

For the entrywise-totient matrix H = φ(K_ij) mod 29, I obtain:
```
H =
[12 15 10 14  5]
[ 4 24 19 12  6]
[25 23 14 23 25]
[ 6 12 19 24  4]
[ 5 14 10 15 12]
```
Its determinant is 28 mod 29; characteristic polynomial is `(x-1)(x^2-8x+1)(x^2+10x-1)`; its exact matrix order is 60. This is an interesting but unproven cross-object echo with the original p50 base-60 table. I have not found a source instruction that says to use H as a 60-step state clock.

One bounded consumer test: fixed Hill-5 decryption with H^{-1} on p55's 75 complete-word-body runes (exclude the inherited leading NG; 15 five-symbol blocks) gives no plaintext: IoC 0.0360, preview `UXITHOEBIEAPLNEEOTAEDEAEFYWRBAEAEAMLPJXBTHOENFTDTHYEOJNWCCWWJFJTHRFPXRUIYWUPEOEAEOLCFAELWEOGL`. Forward H multiplication is likewise nonlinguistic (IoC 0.0300). This is a bounded negative for the *fixed* H-Hill consumer, not for a changing H^k schedule or another source-selected receiver.

I am passing this along because the order-28 and order-60 facts were not in the report sections I checked. The algebraic orders may be useful in deciding whether the φ-grid is a state packet, but please don't treat them as an authenticated cipher or launch a matrix-power search without an original selector.
