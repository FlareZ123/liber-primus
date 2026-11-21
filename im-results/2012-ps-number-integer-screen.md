# 2012 Valete P.S. integer: source correction and bounded LP2 screen

## Decision

The authentic 2012 P.S. integer is a 131-digit, 432-bit number with a published factorization into two 216-bit primes. A later research status labels the P.S. object a 435-bit modulus; exact parsing of the original signed message gives 432 bits and the factorization is already published. Appending an accidental trailing `1` would create a different 132-digit, 436-bit integer, not the source value.

The P.S. integer is **not** the 2014 Stage 2 RSA modulus. Its direct base-29 representations and the obvious RSA-derived values do not decrypt LP2 under an additive/subtractive running-key model. Treat it as a historical RSA-like object, not an established LP2 key. Do not expand this into unconstrained exponent or key-family searches without a specific ciphertext or source instruction.

## Exact source value and factorization

The 2012 signed *Valēte!* message gives:

```text
10412790658919985359827898739594318956404425106955675643739226952372682423852959081739834390370374475764863415203423499357108713631
```

Published factors:

```text
p = 99554414790940424414351515490472769096534141749790794321708050837
q = 104593961812606247801193807142122161186583731774511103180935025763
```

Checks:
- (p q=N) exactly.
- (N) has 131 decimal digits and 432 bits.
- Both factors have 216 bits and are prime (the published factorization is reproduced in the cited reference).
- Appending one extra `1` changes the integer to 132 digits and 436 bits.

The source note describes the RSA interpretation as a hypothesis, not an official instruction for later rounds. Exponent (e=65537) is used below only as the conventional Cicada/RSA candidate; it is not stated alongside the P.S. integer in the *Valēte!* message.

## Discriminating cross-round checks

### Not the 2014 Stage 2 modulus

The modulus in the 2014 Stage 2 signed payload is:

```text
7557912574608535164426718292058021255641310207187633095795069445700059210248050757270234679993673844203148013173091173786572116639
```

It is also 432 bits, but has 130 decimal digits and is a different integer; (gcd(N,N_{2014})=1). The 2012 factors therefore do not factor or unlock the 2014 Stage 2 modulus.

### 2013 cookie values as RSA ciphertexts

Using the published 2013 cookie values labelled `167` and `761` as integers and deriving the RSA inverse exponent for the *assumed* `e=65537`, decryption gives two fixed-width 54-byte blocks beginning `0cff` and `4b10`, respectively. Neither has the required `00 02` PKCS#1 v1.5 type-2 prefix or recognizable plaintext. The earlier reproducer mistakenly tested the literal ASCII backslash-escape sequence and converted the result to a variable-width byte string, making its padding predicate invalid. An independent fixed-width recalculation and the corrected reproducer agree on the negative result. This excludes only direct PKCS#1 v1.5 type-2 decryption of these two candidates under the assumed exponent; their original role remains unknown.

### Direct GP29 key screen

The 2012 integer and its obvious RSA-derived quantities were converted to base 29:
- (N): 89 digits
- (p), (q): 45 digits each
- `φ(N)`, and (d) for (e=65537): 89 digits each

Each stream was repeated over the 12,956 unsolved LP2 runes and tested with both additive signs, with and without treating ciphertext F as transparent. The best (29\times IoC) was 1.039 (the ciphertext baseline is 1.000); no language-like plaintext appeared. This is a bounded negative for these direct GP29 running-key readings, not for every imaginable use of the 2012 object.

## Reproduction

Run from the repository root:

```bash
python sims/ps_number_lp2_screen.py
```

The script checks the factor product, modulus sizes, Stage 2 modulus inequality, cookie RSA decryptions, and the direct base-29 key screen against the canonical `resources/liber-primus/lp2-transcription.txt`.

## Sources

- Original signed 2012 *Valēte!* message: https://github.com/neuroretransmit/cicada/blob/main/2012/011-valete/README.md
- Published P.S. factorization and discussion of the RSA hypothesis: https://github.com/scream314/cicada3301/blob/master/hints_never_used.md
- 2014 Stage 2 signed payload and its separate modulus: https://github.com/micheloosterhof/cicada-2014/blob/master/stage02/1033.jpg.outguess
- Later research status (describes the P.S. object as 435-bit and leaves the integer interpretation open): https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase60_clue_review.md

## Remaining uncertainty

There is no source-authenticated ciphertext paired with the 2012 P.S. modulus, and no source instruction connecting it to LP2. The RSA interpretation may explain the number's factorization, but it does not currently provide a route to unknown LP2 plaintext. Revisit only if a concrete ciphertext or a first-party cross-round instruction is recovered.
