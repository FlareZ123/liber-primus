# p57 FIND/MUST yields a candidate DH group in the base-59 p50 reading

**Status:** intermediate structural hypothesis; no p55 plaintext recovered.  
**Reproduction:** `node sims/lp2_p57_find_must_dh151_gate.cjs`

## Result

The p57 word sums and the p50 table admit a compact, human-motivated chain under the provisional base-59 reading:

1. The Gematria-Primus prime-weight sum of **FIND** is 151.
2. The totient is φ(151) = 150.
3. At zero-based p50 table address 150, the base-59 reading has value 151: a self-pointer selected by φ(FIND).
4. The immediately outward cell, address 151, has value 186, which is also the p57 prime-weight sum of **MUST**.
5. Reducing that neighboring value modulo 151 gives 35.

This produces the candidate finite-field parameters:

```
p = 151
g = 186 mod 151 = 35
```

151 is prime, and 35 is a primitive root modulo 151. Since 150 = 2 * 3 * 5, it is sufficient to check:

| Check | Result |
|---|---:|
| 35^75 mod 151 | 150 |
| 35^50 mod 151 | 118 |
| 35^30 mod 151 | 64 |
| 35^150 mod 151 | 1 |

The first three values are not 1, so the order is exactly 150 = φ(151).

There are two additional geometric correspondences:

- φ(186) = 60, equal to the selected 60-cell inner ring.
- The outer ring has 76 cells, equal to the 76 p55 ciphertext runes.

## Why this favors base 59

At the same two table addresses, the base-60 reading gives 153 and 189. The first value, 153, is composite and cannot be the prime modulus of the ordinary finite-field Diffie–Hellman construction.

The base-59 table contains one occurrence of 151 and two occurrences of 186. Under a uniform random permutation of that same 256-value multiset, the probability of the *fixed* ordered pair 151,186 landing at addresses 150,151 is:

```
(1 / 256) * (2 / 255) = 1 / 32640
```

This is a conditional, fixed-selector calculation, not a discovery-wide p-value. The base-59 radix itself remains an interpretation, not an established fact; the selection was made after inspecting the p57 wording and table.

A separate deterministic 100,000-shuffle test searched the broader event of any eligible prime p57 word-sum self-pointer followed by another p57 word sum that is a primitive-root candidate. It found 2 hits for the base-59 multiset and 6 for base 60. The actual base-60 arrangement has no FIND self-pointer. These counts support specificity but do not remove the post-selection caveat.

## Historical solve-path plausibility and its limit

The repository's authenticated 2013 TCP-server source documents both a BASE29 conversion and a Diffie–Hellman operation. That makes DH a historically plausible operation for a technically literate solver to recognize after finding (151,35).

However, the source describes an interactive server protocol: the participant running the server chooses a base and secret integer, the client supplies a public share, and the server returns the shared value. It does **not** prescribe p=151, g=35, an LP2 cipher, or a key schedule. The historical example uses different parameters. Therefore it authenticates the operation family, not this proposed LP2 use.

There is also a mathematical guardrail: 60 does not divide 150, so the 60-cell ring cannot itself be a subgroup of the multiplicative group modulo 151. Its length may select a data region or key schedule, but it is not the order of a subgroup of that group.


## A source-selected private-exponent candidate: OUR = 21

The 60 inner-ring tokens can also be read as one concatenated 120-digit base-59 integer. Reducing that integer modulo the proposed group order 150 gives **21 in both clockwise and counterclockwise traversal**, starting at the radial cell 149. The p57 word **OUR** independently has GP-prime sum **21**. The same concatenation under base 60 gives 46, not a p57 word sum.

This is a stronger clue-constrained candidate for the DH private exponent than an arbitrary ring cell:

```
a = 21 = sum(OUR)
A = g^a mod p = 35^21 mod 151 = 107
```

The public value 107 is itself one of the 29 GP prime weights (rune index 27, transliteration IA), and the base-59 p50 table contains 107 once, in the outer ring. The public key has order 50. This is an additional structural echo, not proof: a random nonzero residue has a 29/150 chance of belonging to the GP prime-weight set.

The missing step remains how to use the public-share material. With a=21, direct tests treating outer-ring values as DH public shares or as exponents still do not decrypt p55. Treating each p55 GP-prime weight as a public share and reducing q^21 mod 151 modulo 29 produces a non-injective symbol map (only 16 distinct outputs over the 29-symbol alphabet), so that cannot be a reversible symbol-wise cipher. The corresponding shared-exponent low digit is likewise non-injective. The 38-pair p55 BASE29 public-share test also fails and contains one zero residue, invalid as a DH public share.

## Direct tests already made

The reproducible script tests both clockwise and counterclockwise ring traversal and both additive signs for three low-parameter DH consumers:

- Treat inner-ring values as exponents and derive a stream from 35^v mod 151, reduced modulo 29.
- Treat p55 GP-prime weights as public shares and inner-ring values as exponents; derive each DH value q^v mod 151, reduced modulo 29.
- Treat outer-ring values as public shares and inner-ring values as exponents; derive each value^v mod 151, reduced modulo 29.

None yields intelligible p55 plaintext. These are bounded negative results, not an exhaustive rejection of every possible DH construction.


A known-clear-text control was also run against the natural 180-cell interior left after removing the outer ring. The p57 95-rune clear text was aligned to the final 95 cells under inner-rectangle row-major order and under the radial ring orders (outside-in / inside-out, both directions). The direct encodings
`tableValue mod 151 = 35^(GP rune index) mod 151` and
`tableValue mod 151 = 35^(GP prime weight) mod 151`
produce at most **2/95** and **1/95** matches respectively; no ordering gives a coherent encoding, and the three p57 F positions do not all map to a common transparent/identity value. This rejects the simplest exponential-substitution reading of the group pair on the known p57 control. It does not reject a keyed or transposed use of the group.

A separate BASE29 length check also fails to produce a direct 76-symbol key: converting the 60 raw inner-ring values gives 110 digits; converting their defined totients (omitting the zero input) gives 102 digits.

A 38-pair interpretation of p55 as BASE29 public-share integers was also tried with the first 38 inner-ring exponents. Its fixed-width BASE29 output is 76 symbols but is not readable, and one pair reduces to zero modulo 151, which is not a valid DH public share.

## Assessment and next decision

**Established mathematics:** the base-59 values at addresses 150–151 are 151 and 186; 151 is prime; 35 has order 150 modulo 151; φ(151)=150 and φ(186)=60.

**Hypothesis:** p57 may select a DH parameter pair in the p50 table, with the 60- and 76-cell rings supplying further material.

**Missing input:** no source-authenticated rule yet explains how the 60-ring values become a secret exponent, how they pair with the 76-cell region, or how the DH result becomes p55 plaintext.

Do not launch an unconstrained DH/key search from this observation. The next useful investigation is to find an independent clue in the original manuscript or an earlier Cicada instruction that selects the missing key schedule or BASE29 mapping. If no such instruction appears, retain this as a notable base-59 structural lead but retire it as a decryption route. No claim of recovered plaintext is made.

## Reproduction inputs

- `resources/liber-primus/base60-grid.json` — original two-character p50 tokens.
- `resources/liber-primus/lp2-corpus.json` — rune indices, transliterations, and prime weights.
- `resources/liber-primus/lp2-transcription.txt` — p57 word boundaries.
- `resources/external/2013-tcp-server-signed-source.md` — historical BASE29/DH protocol transcription.
- `sims/lp2_p57_find_must_dh151_gate.cjs` — self-contained arithmetic and direct-consumer reproduction.
