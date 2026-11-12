# 2014 secondary Twitter Fibonacci-prime key gate

## Question

Could the 2014 public post on the secondary account `@991948530947554` provide a directly usable key for the still-encrypted LP2 pages?

## Source cue and confidence

The community-maintained [Uncovering Cicada page on other Twitter accounts associated with 3301 emails](https://uncovering-cicada.fandom.com/wiki/Other_Twitter_Accounts_Associated_With_3301%27s_Emails) reports that `@991948530947554` was created on 2014-07-11, after the May 2014 LP2 release, and published one post listing the first twelve Fibonacci primes:

`2, 3, 5, 13, 89, 233, 1597, 28657, 514229, 433494437, 2971215073, 99194853094755497`.

The final value is also the account's display name; its username is truncated to 15 characters. The account's bio and profile image show `9901`. The page associates this account with the earlier Cicada email `c1231507051321@gmail.com` through a password-reset association, but explicitly notes that one verification screenshot could not be independently checked. There is no PGP signature or other cryptographic authentication of this account-to-Cicada attribution. Treat it as a low-confidence, community-attributed cross-round lead, not an established creator instruction.

The listed sequence is independently confirmed as the beginning of [OEIS A005478, Fibonacci primes](https://oeis.org/A005478). The LP2 page-15 analysis already identifies a separate construction involving `3301 - p_(F_n+1)` ([existing result](https://github.com/FlareZ123/liber-primus/blob/main/results/fibonacci-prime-spiral.md)). That provides a plausible, but not proven, reason to test the account's Fibonacci-prime list against GP29.

## Locked hypotheses

The visible list contains twelve values, so the narrow direct-key hypothesis is a period-12 additive GP29 mask. The clock starts at the first unknown rune of p0 and continues across page boundaries. No phase fitting, page resets, word resets, or key expansion is allowed.

Three source-constrained representations were tested:

1. **Literal list:** each tweeted Fibonacci-prime value reduced modulo 29:
   `[2,3,5,13,2,1,2,5,1,1,5,1]`.
2. **Fibonacci indices:** invert the visible Fibonacci values to their indices, then reduce modulo 29:
   `[3,4,5,7,11,13,17,23,0,14,18,25]`.
3. **p15 dual:** apply the page-15 construction to those indices, using `3301 - p_(index+1)`, then reduce modulo 29:
   `[17,13,11,5,16,10,21,22,27,5,4,26]`.

For each fixed key, both `P = C - K` and `P = C + K` were tested. These are the cheapest direct consumers of the only explicit numeric sequence in the account post and the existing p15 prime-index operation. The bio value `9901` was not used: no source-selected operation connects it to LP2.

## Data and method

- Ciphertext: `resources/liber-primus/lp2-corpus.json`, blob SHA `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`.
- Scope: all 55 unknown pages p0–p55, omitting runeless p50; exactly 12,956 GP29 symbols.
- Language control: `resources/control/shakespeare_first300k.txt`, blob SHA `94c677ad9dd50771c6670e0c4e4dad9052b46d85`.
- The control is uppercased, nonletters removed, then greedily tokenized by longest GP transliteration. The first 80% trains a 29-symbol trigram model with add-one smoothing; the final 20% is held out.
- Each inverse was re-encrypted with the opposite sign and asserted byte-for-byte/rune-for-rune equal to the original 12,956-symbol stream.
- Reproducer: `node sims/2014_fibonacci_prime_twitter_key_gate.cjs`.

This is a discriminating language test for the stated direct additive-key hypothesis, not a proof against unrelated transformations. The exact round-trip check validates implementation only; it is not evidence of plaintext.

## Results

| Source-derived key | `P=C-K` score | `P=C+K` score | `P=C-K` IoC | `P=C+K` IoC |
|---|---:|---:|---:|---:|
| Literal Fibonacci-prime values mod 29 | -3.908010 | -3.896892 | 0.03450872 | 0.03448549 |
| Fibonacci indices mod 29 | -3.905335 | -3.909454 | 0.03450230 | 0.03450839 |
| p15 dual `3301-p_(index+1)` mod 29 | -3.911441 | -3.902017 | 0.03448940 | 0.03450356 |

Baselines:

- Raw LP2 trigram score: **-3.895913** nats/rune.
- Native Shakespeare holdout score: **-2.399903** nats/rune.
- Raw LP2 IoC: **0.03447840**; the uniform 29-symbol baseline is approximately 0.03448276.

None of the six inverses improves on raw LP2. The best candidate, literal Fibonacci-prime values with `P=C+K`, is slightly worse than raw ciphertext and remains far below the native-language holdout. All candidate IoCs remain at the uniform-noise level. No coherent plaintext, key confirmation, or useful intermediate text was recovered.

## Decision

**Reject the literal period-12 additive-key interpretation.** The account may still be a cross-round hint to the broader Fibonacci/prime relationship, but this exact visible sequence does not directly mask LP2 under either additive sign, either natural Fibonacci representation, or the p15-derived dual.

Do not extend this negative result into arbitrary offsets, phases, resets, KDFs, transpositions, or uses of `9901` without an independent clue that selects the operation. Agent30 was sent the source cue and bounded results for consideration in its two-cue human-solve-path review. This remains an intermediate exclusion, not an established LP2 result.
