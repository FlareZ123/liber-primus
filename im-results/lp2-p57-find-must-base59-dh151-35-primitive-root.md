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


## Original-scan qualification

The original scan set for this table is JPEGs 66–68 (LP2 pages 49–51), with **10, 13 and 9** complete rows of eight tokens respectively. The source resource declares the 60-character alphabet `0–9, A–Z, a–x`, but the **256 printed tokens use exactly 59 of those 60 characters: lowercase `f` is absent**. This is the concrete reason to test the alternate 59-symbol alphabet with `f` removed. It is not proof that the creator intended radix 59: the existing resource labels its conventional interpretation as a base-60 byte table, and both readings remain hypotheses until an independent instruction selects one.

The p49 scan has a **red ten-dot punctuation mark arranged in three columns of 3/4/3 dots** immediately after its third runic line and before the numeric rows begin. It is the already-censused p49 ten-dot mark (original scan 66.jpg, approximate center x=1710,y=1106), not a 3×3 nine-dot square or an additional selector. The identical ten-dot stencil also occurs on original physical pp36,38,56 (see `im-results/lp2-original-dot-punctuation-physical-census.md`); the known p56 cipher does not reset its prime-totient clock at this punctuation type. The p49 placement visibly marks the transition to the numerical insert, but no first-party cipher rule for it has been found.

## Historical DH operation: which party owns which values?

The **PGP-authenticated 26 January 2013 TCP challenge** requires a connecting client to send `DH [p]` and thus **select modulus p**. The server chooses its own **base b and private exponent**, replies with the base and server public share, receives a **client public share**, and replies with the resulting shared value. The original signed *illustration* is `DH 23 → 01 OK 5 8 → 19 → 03 DATA 2`. A separate March 2013 participant-test log shows `DH 3301` with **participant-selected** base2757 and secret331, public share1264, remote-client share2800 and result1067. The log does not authenticate these generated values as an author-selected 2014 key. No signed Cicada source identifies `DH 151`, base35, a participant/client key for later LP2, or a 76-rune receiver. The same signed challenge's `BASE29 3301 → 3QO` illustrates a conventional *alphanumeric numeral*, never a Gematria Primus rune encoder. `NEXT` simply accepts participant-selected text. [Verified signed-source report](../resources/external/2013-tcp-server-signed-source.md) · [original challenge as published](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/other/2013_TCP_Server.md) · [independent participant log witness](../resources/external/2013-tcp-live-test-vectors.json).

The proposed source arithmetic makes **(p=151,g=35)** a valid finite-field DH *parameter candidate*. Its multiplicative group order is `150`, of which exactly **φ(150)=40** nonzero residues are primitive roots (**26.67%**). Thus the primitive-root condition is compatible with DH, without being a rare independent confirmation. **29, 60 and 76 do not divide 150:** none can be a subgroup order. Stronger, because `gcd(150,29)=1`, **every homomorphism of this DH group to additive GP29 is constant**. A reversible 29-rune DH output needs an independently selected, nonhomomorphic byte/rune conversion; the prime pair alone cannot furnish a full 29-symbol group-preserving alphabet or 60-/76-cycle. This does not exclude explicitly authored key derivation or output conversion.

## A conditional private-exponent candidate: OUR = 21

The original 60-cell inner ring (selected by `φ(MUST)=60`) contains **60 two-digit source numerals**. Concatenate their digits into one 120-digit base-59 integer and reduce modulo the candidate DH group order `150`. Clockwise and counterclockwise from original cell149 both give **21**. The independently printed p57 word **OUR** has GP-prime sum21. One possible speculative private/public pair is `a=21, A=35^21 mod151=107`. Value107 is also a GP prime weight (rune IA) and appears **exactly once** on the numeric table's outermost ring at original zero-based cell24. The source gives no instruction to concatenate all ring tokens, select OUR as a private exponent, or interpret that outer cell as a DH public-share message. Agent23's already executed direct a21 consumers produce no p55 plaintext, and the obvious `q^21 mod151 mod29` symbol map reaches only 16 of the 29 GP values, so it is not a reversible 29-symbol substitution.

**Exact conditional-null correction to the apparent two-direction corroboration.** Each source table *token* is two base59 digits. Concatenating tokens modulo150 therefore applies `59² ≡ 31 (mod150)` per token, and `31^k ≡ 1+30k (mod150)`. The 60 original inner-ring token **values sum to 6,951**, so their sum mod150 is **51** and mod30 is **21**, irrespective of reading order. Let `E_forward` be the 60-token 120-digit numeral modulo150 and `E_backward` the reversed ring traversal keeping the source-selected first cell149 in place. For **every permutation of the same source tokens**, an algebraic identity gives

`(E_forward + E_backward) mod150 = (92×6951) mod150 = 42`.

Both outputs must equal 21 modulo30, limiting each to **{21,51,81,111,141}**. Thus **`E_forward=21` if and only if `E_backward=21`**, independently of the token order. The two observed 21 outputs are *one* event, not two independent hits. In exact matched 200,000-trial deterministic permutations of all source ring tokens, the dual-21 result occurs **39,807 times (19.9035%)**. Holding the original first cell fixed and shuffling only the remaining 59 values gives **40,176/200,000 (20.088%)**. The sole distinct p57 printed word-sum below150 congruent to the source-invariant 21 mod30 is **OUR** (other distinct eligible sums:55,66,72,86,115). This specific start/word equality is therefore a low-discrimination conditional checksum, although it could in principle still be an intentional selector.

The [exact algebraic original-input SFT](../sims/lp2_p57_our21_ring120digit_orientation_null_sft.cjs) establishes the identity for **all 400,000** shuffled original arrangements with exact source-retention, distinguishes a single 1-in-5 match from two apparent corroborations, and uses no unknown ciphertext score. This downgrades the `OUR21` exponent clue's independent strength. It does not change the earlier direct consumer negatives or disprove another independently authenticated LP2 DH operation.

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

**Missing input:** neither the signed 2013 DH example nor the original LP2 images supplies a p55 DH public share, a reversible GP29 output decoder, or a 76-position key clock. The provisional OUR21 exponent coincides with a modulo30 source checksum and its two traversal matches are algebraically dependent, so the count correspondence cannot substitute for the missing operator.

Do not launch an unconstrained DH/key search from this observation. The next useful investigation is to find an independent clue in the original manuscript or an earlier Cicada instruction that selects the missing key schedule or BASE29 mapping. If no such instruction appears, retain this as a notable base-59 structural lead but retire it as a decryption route. No claim of recovered plaintext is made.

## Reproduction inputs

- `resources/liber-primus/base60-grid.json` — original two-character p50 tokens.
- `resources/liber-primus/lp2-corpus.json` — rune indices, transliterations, and prime weights.
- `resources/liber-primus/lp2-transcription.txt` — p57 word boundaries.
- `resources/external/2013-tcp-server-signed-source.md` — historical BASE29/DH protocol transcription.
- `sims/lp2_p57_find_must_dh151_gate.cjs` — self-contained arithmetic and direct-consumer reproduction.
