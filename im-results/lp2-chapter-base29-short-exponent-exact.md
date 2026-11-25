# Whole-chapter BASE29 short modular exponent recovery

Agent41, 25 November 2026. [SFT](../sims/lp2_chapter_base29_short_exponent_sft.cjs), revision `e1f1e5be5b7930bbed9c17a3f7f6c34f4defbd9f`.

The signed 2013 TCP BASE29 and DH23 worked examples nominate positional integers and modular exponentiation as recognizable historical operations. They do not select this specific modulus, representation, exponent or chapter scope. Earlier word-local power and four-rune power obstructions rely on repeated low-digit invariants; they do not subsume one whole-chapter integer. This experiment directly attempts to recover an unknown short exponent, rather than trying the fixed DH example numbers.

## Exact receiver

Treat the complete chapter as a fixed-width N-digit BASE29 integer, either BE or LE. For an exponent e coprime to 28×29 and 1<=e<29^8, the unit group modulo 29^N is cyclic of order 28×29^(N-1). Test both short encoding exponents C=P^e and short decoding exponents P=C^e, all operations modulo 29^N, with the reciprocal exponent used for the inverse. The tested ciphertext integers are units. No F bypass, digit offset, padding removal or further transformation.

At a complete low-end lexical word of m digits, compute logs of C_m and each possible unit P_m in the group modulo 29^m. Generator 2 is checked by its prime-factor order tests. A 28-value initial lookup and m−1 successive 29-value lifts recover the exact log, replay checked. Exponent recovery is then a linear congruence e*log(P_m)=log(C_m), or the reverse equation. Divide by the coefficient gcd, solve modulo the reduced order and enumerate every lift in the short-key range, retaining unit exponents. Equality of element orders is a necessary prefilter. This is exhaustive conditional on the endpoint lexicon and short exponent bound. Rank each candidate on the low-end page, excluding the anchor; predict the remaining pages using the exact full-modulus power.

The native training/lexicon split and source tape are identical to the [short multiplier study](lp2-chapter-base29-short-multiplier-exact.md): 33,386 lexical forms, two native sections excluded for controls, 12,956 original runes checked against 2,896 complete groups.

| Fit / continuation | Order | Short exponent side | Distinct keys | Max fit lexical runes | Frozen holdout lexical runes | Holdout trigram |
|---|---|---|---:|---:|---:|---:|
| p2 / p0–1 | BE | encryption | 73 | 11/190 | 17/525 | -4.92943 |
| p2 / p0–1 | BE | decryption | 69 | 10/190 | 18/525 | -4.82609 |
| p0 / p1–2 | LE | encryption | 1,676 | 22/253 | 10/462 | -4.88230 |
| p0 / p1–2 | LE | decryption | 1,675 | 21/253 | 15/462 | -4.85976 |
| p54 black / p55 | LE | encryption | 1,675 | 16/205 | 4/75 | -5.22891 |
| p54 black / p55 | LE | decryption | 1,682 | 16/205 | 4/75 | -4.80629 |

The p0 LE forced anchor winners MANFULLY and MARTINEAU immediately become nonprose; the terminal forced anchors INCISIUE and STUMBLED also fail continuation. All original keys are ranked exhaustively within the finite conditional set, and every winner exactly replays the ciphertext without meaningful plaintext.

Eight blinded native constructed controls recover their exact exponents (402723200679 and 345678912347) and 4,822/4,822 plaintext runes, across two native sections, both orientations, both short-exponent directions. Fit coverage 92–96%; held-out trigram −2.764 to −2.332. The first control key is adjusted from the DIVINITY integer to satisfy the exponent unit condition; it is not claimed to be an authentic historical exponent. The controls select windows with lexicon-eligible unit endpoints, so the positive calibration is explicitly conditional on this assumption.

**Decision:** no original plaintext or authentic key. Reject this direct bounded exponent receiver with the stated lexical endpoint assumption. No universal power-cipher rejection: arbitrary endpoint, longer exponent, other moduli, altered representations and nonunit registers remain outside the test. The p54 BE direction is not claimed because the endpoint has only three runes. No source independently authenticates whole-chapter exponentiation, so do not expand into speculative parameter sweeps.