# Original p55 prime/generator: exact partial DH log and authenticated 43-word exponent decision

**Agent11, 23 November 2026. Intermediate, conditional cryptographic evidence.** The original physical LP2 p55 has not yielded plaintext, a creator-selected private exponent, or a usable instruction to decrypt any other unknown page. The operations below were chosen from the actual 2013 Cicada Diffie–Hellman example and from the signed 2016 43-word clue, with all original source inputs fixed before checking the required equality.

## The human-readable input and candidate equation

The solved p57 instruction to *shed circumferences* applies directly to the 16 complete printed p55 words, excluding one cross-page carry rune at the start of p55. The 43 remaining interior GP0 digits form N=8P, the 32 stripped endpoint digits E=43Q. The exact data, 16 original word lengths, primality certificate, conditional source controls, and interpretation are preserved in [Agent1's original-input finding](lp2-p55-shed-circumference-prime-shell-original.md):

- Prime modulus **P = 63755441409934721069036418908763882578170591536653256311514221**.
- Primitive root **Q = 1268532719737981052966698570711268391040527137**.
- Separate small source factor **8** occurs in the interior N=8P; **43** occurs in the exterior E=43Q and in the authenticated 2016 message's natural-language word count.

A conditional but numerically precise DH reading is: P is the field, Q its generator, and 8 is a public value, so an undisclosed private exponent x would have to satisfy **Q^x ≡ 8 (mod P)**. This DH-role assignment is a hypothesis, not an original author instruction. A different assignment can be consistent with the exact arithmetic.

## Exact finite-field constraint

The verified factorization of the group order is

~~~text
P−1 = M × R
M = 4 × 5 × 41 × 49477 × 15535963
  = 630311729907820
R = 101149063843788281988908603592862658065019147521
~~~

R is a 157-bit prime, and Q has full multiplicative order P−1. Project the conditional equation into each prime-power factor of M and solve using complete baby-step/giant-step calculations; combine using CRT:

| Modulus | Required private x residue |
|---:|---:|
| 4 | 3 |
| 5 | 1 |
| 41 | 35 |
| 49477 | 35483 |
| 15535963 | 13984653 |

The unique combined result is:

~~~text
x ≡ 97883509924151 (mod 630311729907820)
Q^(x*(P−1)/M) ≡ 8^((P−1)/M) (mod P)  [exact]
~~~

The lowest representative does **not** solve the full equation Q^x=8. A complete 2^32-bound baby-step/giant-step test finds no x below 4294967296. The remaining R-order logarithm is 157 bits, with generic square-root effort about 2^78.5 group operations; allocating brute force to it is unproductive without an original constraint on x. This is an exact conditional partial key relation, **not recovered author key material**.

## Could the signed 2016 43 words supply the exponent?

The independently PGP-signed 2016 message has exactly 43 natural-language tokens when the standalone numerical signature and key ID are excluded. It explicitly says that Liber Primus's words are a map and their numbers a direction. That makes a 43-digit private-exponent field the simplest plausible independent source to check, with no search-dependent key fitting.

Freeze seven literal one-digit-per-word encodings: first GP0 rune, last GP0 rune, GP0 index sum mod29, GP prime-value sum mod29, GP rune-token length, first Latin A0 character, and last Latin A0 character. For each, preserve both printed first-to-last and reversed word order. Interpret the resulting 43 digits as one big-endian base29 integer x, and check the **exact original field equation**.

**All 14 candidates fail.** None has the necessary residue x mod M = 97883509924151; the full Q^x modP also equals neither the candidate original public8 nor the alternative original factor43. All checks are exact and apply to the original signed text. A planted exponent with the correct smooth-subgroup residue passes the projection check, demonstrating a sensitive positive. The result rules out these fourteen **specific** direct signed-word exponent readings. It cannot exclude any unknown keyed extractor, a different message span, a separate public operand, or non-DH author intent.

A closely related 43-word **per-position DH pad** was tested using Q^(signed GP-prime-sum), Q^(signed GP-index-sum), and Q^(signed word length), each reduced mod29 as a 43-place additive key against the original p55 interior and the independent 215-rune p27 body, with both signs and a fixed phase. None gave sustained intelligible native-GP text; original p55 IoC ranged 0.02879–0.03987 and p27 0.03330–0.03830. This secondary check is exploratory and does not rule out other cipher modes.

## Reproducibility and next decision

The [original-source partial-log SFT](../sims/lp2_p55_primitive_root_partial_dh_sft.cjs) reconstructs N/E from the original 76 p55 GP indices, independently checks Q primitive, solves the five subgroup logs, verifies the CRT projection and a complete <2^32 search with a planted positive. The [signed-2016 private-exponent SFT](../sims/lp2_p55_signed2016_43word_dh_exponent_sft.cjs) re-reads the original PGP cleartext and GP corpus, recomputes every literal candidate and checks the full DH equation with a planted subgroup positive. Both passed on [Windows/Node22 Actions run 45116995373](https://github.com/FlareZ123/liber-primus/actions/runs/45116995373).

**Research choice:** retain P,Q as a source-derived *possible* finite-field packet. Before committing to more DH, demand an independent author-provided reason to choose the DH equation, a bounded private exponent source, and a reversible ciphertext consumer with a holdout unknown passage. The original source and this finite gate do not select those missing inputs. Further arbitrary digest, key/IV, and exponent searches cannot change that causal uncertainty.
