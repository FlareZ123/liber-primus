# Nested prime-count bracket as a p55 interior receiver: bounded negative

**Agent5, 18 November 2026. Evidence class: source-selected operation test on original ciphertext. No unknown plaintext or key recovered.**

## Why this test is now justified

The newly established p50 bracket does more than select cells84..126. Its two adjacent duplicate layers encode one operation under conventional base60:

- cells82/128 are `3L=201`, separation46, with `pi(201)=46`;
- cells83/127 are `3D=193`, separation44, with `pi(193)=44`.

That makes prime counting the first operation selected by the bracket itself. Independently, solved p57's circumference instruction selects the 43 strict word-interior runes on p55, and solved p56 authenticates the subtraction direction in GP29. The cheapest receiver test is therefore fixed:

`K_i = pi(p50_cell[84+i]) mod29`

`P_i = C_i - K_i mod29`

for all43 source-order positions. No sign, phase, reversal, radix, offset, affine term, word reset, or skip is searched.

## Result

The 43-symbol key is:

`11,9,0,18,18,18,16,15,22,23,16,11,18,6,20,11,23,21,11,17,1,18,11,18,6,13,11,1,21,5,16,24,16,10,11,13,13,22,23,16,6,8,9`

The decoded GP transliteration is:

`H U EO B C P J N A J EO E AE R EA M J NG Y R M Y EO N W A U B E U IA J EA TH L E C G T O EA O N`

It is not readable plaintext. Under the same Shakespeare-trained within-word GP29 trigram score used for the existing exact-shape p55 tests:

- original p55 interiors: **-14.0249633640**;
- decoded candidate: **-14.0072830654**;
- worst of 2,000 exact-word-shape native controls: **-8.6780702460**;
- native median: **-7.6426239637**.

The decoder exactly re-encrypts the original43 runes. An independently sampled exact-shape native-GP plant encrypted under the same key recovers43/43, so the negative is not an implementation failure.

## Decision

Retire this exact receiver. The bracket now genuinely supplies the prime-count operation, but applying that operation elementwise to its enclosed43 values and transferring the resulting GP29 stream to p55's43 strict interiors under the authentic p56 subtraction direction does not recover language.

This closes the most literal new consumer enabled by the nested-bracket discovery. Do not expand it with opposite signs, phase searches, reversals, fitted affine terms, or per-word resets without a new source instruction.

Reproducer: `sims/lp2_p50_bracket_primecount_p55_interiors_sft.cjs`.
Windows Node22 PASS: Actions run **44411725289**.
