# p57 five-instar → 2013 SSSS → p32: direct-transfer gate

**Status: rejected for the tested natural encodings and row-major five-share assignment. No key or plaintext recovered.**

## Question

Does the p57 cleartext's five-instar / circumference language select the original 2013 Cicada five-of-ten Shamir secret-sharing mechanism, with p32 as a recipient?

The structural motivation is real but incomplete:

- Removing the first and last rune from each of p57's 20 printed words leaves exactly 55 interior runes.
- The 55 values can be reshaped as five consecutive rows of eleven.
- p32 contains 121 runes, which can be reshaped as an 11×11 array.
- The original 2013 Cicada SSSS mechanism used threshold five, a monic degree-five polynomial over GF(2^n), and XTEA diffusion. Its recovered secret was 22 bytes in the historical instance.

The 5×11 and 11×11 layouts are reshapes, not printed grids. The p57 language motivates testing five shares, but does not itself identify share coordinates or a byte encoding.

## Source-grounded mechanism

The historical implementation is the 2013-era ssss 0.5 code, not interpolation over GF(29). Its source is available at [ssss.c](https://github.com/osresearch/ssss/blob/master/ssss.c). The implementation supports field degrees in byte multiples, selects irreducible-polynomial terms from its table, uses a monic x^5 term for threshold five, and applies XTEA diffusion by default. The repository's independent 176-bit reproduction is sims/2013_pklmx_reproduce.py.

The field polynomials used here, taken from the ssss irreducible-polynomial table, were:

| Byte representation | Field | Polynomial |
|---|---:|---|
| 11 GP ordinal bytes | GF(2^88) | x^88 + x^7 + x^6 + x^2 + 1 |
| 11 UTF-16 code units | GF(2^176) | x^176 + x^11 + x^3 + x^2 + 1 |
| 11 UTF-8 runes | GF(2^264) | x^264 + x^9 + x^6 + x^2 + 1 |

The UTF-16 encodings give the same 22-byte width as the original 2013 secret. The one-byte ordinal and three-byte UTF-8 encodings test the other natural representations of the rune sequence; they require the corresponding supported field degrees.

## Exact test

Input was taken from resources/lp2-transcription.txt and resources/liber-primus/lp2-corpus.json:

1. Parse p57 using the existing transcription's word separators.
2. Remove the first and last rune of each of the 20 words, preserving printed order.
3. Split the resulting 55 runes into five consecutive 11-rune rows.
4. Encode each row in one of four ways: GP ordinal bytes, UTF-16BE code units, UTF-16LE code units, or UTF-8 rune bytes.
5. Treat the five rows as the five y-values of the historical monic degree-five polynomial.
6. Test only two motivated x-coordinate sets: sequential row IDs [1,2,3,4,5], and the five earliest IDs [2,3,5,7,8] from the preserved 2013 share fixture.
7. Apply the original default XTEA inverse-diffusion step after GF(2^n) interpolation.

This is eight fixed variants, not a search over arbitrary share IDs, permutations, padding, polynomial degrees, or post-processing. The 176-bit implementation first reproduces the original 2013 five-share fixture and recovers p7amjopgric7dfdi.onion. The 88- and 264-bit implementations pass synthetic five-share round-trip controls.

## Results

| Encoding | Field | x IDs | Recovered 11-rune GP key? |
|---|---:|---|---|
| GP ordinal | GF(2^88) | 1–5 | No |
| GP ordinal | GF(2^88) | 2,3,5,7,8 | No |
| UTF-16BE | GF(2^176) | 1–5 | No |
| UTF-16BE | GF(2^176) | 2,3,5,7,8 | No |
| UTF-16LE | GF(2^176) | 1–5 | No |
| UTF-16LE | GF(2^176) | 2,3,5,7,8 | No |
| UTF-8 | GF(2^264) | 1–5 | No |
| UTF-8 | GF(2^264) | 2,3,5,7,8 | No |

None of the reconstructed secrets decodes to eleven symbols of the 29-rune GP alphabet. The UTF-8 outputs do not decode as eleven valid GP runes either. Consequently, there is no source-derived GP key to apply to p32, and no p32 consumer test is justified.

The previously documented GF(29) five-row interpolation was also negative; it is not the historical 2013 algorithm and should not be conflated with this test.

## Decision

Retire this direct p57-row → historical SSSS secret → 11-rune p32 key route. The numerical shape and the word “instar” are insufficient to establish that p57 contains five SSSS shares. Do not widen the search to arbitrary x-coordinate subsets, reordered rows, ad hoc encodings, disabled diffusion, or byte padding without an independent original clue selecting that change.

This result does **not** disprove every possible use of p57's 55 interior runes, every historical Cicada mechanism, or every p32 interpretation. It rejects only the explicit, reproducible bridge tested here.

## Reproduction

Run:

`node sims/lp2_p57_ssss_gf2n_5x11_gate.cjs`

The script includes:
- the eight fixed candidate variants and their recovered-secret hex values;
- synthetic round-trip tests for all three field widths;
- a known-answer check against the original 2013 five-share fixture;
- conditional p32 GP29 additive consumers, which run only if a valid eleven-rune key is recovered.

No established result in results/README.md changes: this is a bounded intermediate negative, not a decryption.
