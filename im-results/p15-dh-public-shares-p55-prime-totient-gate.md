# p15 red-span DH public shares to p55 interior / p56 prime-totient gate

**Classification: source-constrained, finite original-input negative.** This is a plausible human solve-path composition with a direct route to a key and a known reversible operation. It recovers no unknown plaintext, authentic LP2 key, complete cipher, or Cicada destination.

## The solve-path hypothesis

A solver could reasonably connect four visible or historically authenticated facts:

1. **p15 has two spatially separated red rune spans of lengths 9 and 11.** Treat these counts as two Diffie–Hellman public shares, A=9 and B=11.
2. **p57 has the unique red 23-dot mark.** Treat 23 as the DH modulus.
3. **The signed 2013 Cicada TCP challenge documents DH with modulus 23 and generator 5.** The source supplies the operation and base; the p15 spans supply the two proposed public values.
4. **p57's solved instruction says to shed circumferences and find what is within.** On p55, removing the first and last rune of each of the 16 complete words leaves 43 interior runes. The p56 solved page supplies an independently demonstrated additive prime-totient inverse, starting at prime 2.

The weakest premise is that the lengths of p15's red spans should be interpreted as DH public shares. The source does not label them as numbers or explicitly assign DH roles. The resulting key, however, has an unusually direct cross-check: it is 2, and p15's central red value is 3299 = 3301−2.

## Exact DH derivation

Use the source-attested group parameters p=23 and g=5, with the proposed public shares A=9 and B=11.

- 5^10 mod 23 = 9, so A's private exponent is 10.
- 5^9 mod 23 = 11, so B's private exponent is 9.
- B^10 mod 23 = 11^10 mod 23 = **2**.
- A^9 mod 23 = 9^9 mod 23 = **2**.

Both sides agree on shared secret 2. This is not a guessed output: the public values, discrete logs, and shared secret are all asserted by the reproducer.

The p15 central red value independently gives 3301−3299=2. The p56 known inverse uses the consecutive-prime totient stream beginning at prime 2, with shifts prime−1 modulo 29. Thus the direct key schedule is source-selected without an arbitrary phase:

  P[i] = C[i] - (prime(i+1)-1) mod 29, starting with prime 2.

## p55 original-input test

The canonical parser gives **16 complete words** on physical p55, with lengths:

  4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3

Removing each word's first and last rune leaves **43 interior runes**. These are the exact input symbols, in printed word order:

  M I EO G D TH IA A B C EA F X I M U C P H NG L S D IA P H EO E I G X G S EO TH TH E EA I M C J E

The first 43 prime-totient shifts are:

  1,2,4,6,10,12,16,18,22,28,1,7,11,13,17,23,0,2,8,12,14,20,24,1,9,13,15,19,21,25,10,14,20,22,3,5,11,17,21,27,4,6,16

The exact decrypted GP sequence is:

  E H H F P M J G A G IA OE O Y TH W C J F N G A EA Y R A Y EA E I R NG A M EA Y W J E NG U C TH

Preserving the original word-fragment boundaries gives:

- E H
- H F P M
- J G A G
- IA OE O Y TH W C J F N G
- A EA Y R
- A Y
- EA E I R NG
- A M EA Y W
- J E NG U
- C
- TH

This is not recognizable GP-English plaintext. The sample is only 43 symbols, so no language-score or IoC significance claim is made.

The reproducer verifies the p15 span lengths, unique p57 red-23 mark, both DH public values and both shared-secret computations, the p15 central-2 cross-check, p55's exact 16-word/43-interior structure, exact forward re-encryption, and an independent synthetic 43-symbol positive control.

## Decision

**Reject this exact direct route:** p15 red-span lengths interpreted as DH public shares, p57 red23 as modulus, the signed 2013 generator 5, shared secret 2, and the solved p56 prime-totient stream from prime 2 do not decrypt p55's 43 interior runes.

This does not invalidate the DH arithmetic, the p15 numerical construction, the p56 solved cipher, or p57's circumference instruction separately. It rejects only their direct composition on p55 under the fixed original ordering and one-key-symbol-per-interior-rune clock. Do not search alternate group parameters, phases, word resets, signs, or skip masks to rescue this model.

**Reproducer:** sims/lp2_p15_dh_public_shares_p55_prime_totient_sft.cjs.
**Related source records:** resources/liber-primus/lp2-ink-annotations.json, resources/liber-primus/lp2-corpus.json, resources/lp2-transcription.txt, the 2013 signed DH source, and sims/authentic_lp2_p56_totient_regression.cjs.
