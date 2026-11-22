# Fibonacci-prime account as a p55 interior key: negative direct gate

**Classification:** intermediate exclusion; external account association is unverified. No plaintext, key, or creator-authenticated mechanism recovered.

## Motivation and source quality

A community-maintained account inventory reports that `@991948530947554` had one 2014 post listing the Fibonacci primes

`2, 3, 5, 13, 89, 233, 1597, 28657, 514229, 433494437, 2971215073, 99194853094755497`

and that the account's display name/profile material used the final value while its bio/profile image showed `9901`. The account's association with Cicada-related email addresses is inferred from community-collected recovery screenshots; it is **not** authenticated by a 3301 OpenPGP signature or a platform-verifiable creator identity. Treat this as a lead, not an author instruction.

Sources:
- [Community account inventory](https://uncovering-cicada.fandom.com/wiki/Other_Twitter_Accounts_Associated_With_3301%27s_Emails)
- [Archived account-material repository](https://github.com/lastpacketbender/991948530947554)
- [Account URL](https://x.com/991948530947554)

The strongest narrow test is suggested by the account's explicit Fibonacci-prime list and the solved p57 instruction to shed circumferences: p55's source-framed interior contains exactly 43 GP29 runes, and the account's list includes the prime Fibonacci term F43 = 433494437. This count match is suggestive but not authentication.

## Exact input and method

The 43-symbol ciphertext is the p55 interior GP29 sequence from [the source-framing report](p55-original-33-exterior-43-interior-source-framing.md):

`[19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15,23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18]`

The original interior word-fragment lengths are `[2,0,0,4,4,0,11,4,2,0,5,5,0,4,1,1]` (sum 43).

Three direct numeric readings were tested, with both additive signs and no fitted phase, reversal, reset, or word-specific adjustment:

1. **Fibonacci stream:** F1 through F43, with F1=F2=1, reduced modulo 29. The final term is the listed F43=433494437.
2. **Tweet values:** the 12 listed Fibonacci-prime values, reduced modulo 29 and repeated in listed order.
3. **Prime totients:** each listed prime minus one, i.e. φ(p)=p−1, reduced modulo 29 and repeated in listed order.

For each key (k_i), both ((c_i-k_i)\bmod29) and ((c_i+k_i)\bmod29) were rendered using the original GP29 alphabet and regrouped by the original 16 interior-fragment lengths. The standalone SFT is [`lp2_fibonacci_prime_account_p55_key_sft.cjs`](../sims/lp2_fibonacci_prime_account_p55_key_sft.cjs).

## Result

None of the six decoded streams gives recognizable English or a plausible GP29 plaintext in the original interior fragments. The 43-term Fibonacci residue stream is itself only **period 14** modulo 29 (F14 ≡ 0 and F15 ≡ 1), so it is not a 43-symbol independent key. The 12-prime and 12-totient streams likewise produce nonlinguistic interiors in both signs.

The account's `9901` profile value was not used: no primary source specifies how it should enter a key or select an offset. Fibonacci-prime indices, arbitrary phases, reversals, and alternative encodings were not searched.

## Decision

Reject only these exact direct periodic additive-key interpretations on p55's 43-rune interior. This does **not** establish that the account is unauthentic, nor rule out other uses of Fibonacci primes elsewhere in the puzzle. Do not expand this branch unless independent authentication or a source-authored instruction connects the account to LP2 and specifies a further operation.

No change to `results/README.md`: this is an intermediate negative, not an established discovery.
