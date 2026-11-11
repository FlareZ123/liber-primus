# F59/DH → p56 prime-2 start: exact source arithmetic without a selected decryption

**Classification, 11 November 2026:** historical numerical correspondence and a bounded original-cipher exclusion. The already-known p56 85-rune plaintext is reproduced exactly; no unknown LP2 plaintext, key or general cipher is recovered.

## Source construction and its weakest premise

The original p57 red `PARABLE` title has GP prime sum **449**. The later-preserved 2013 first-onion `NUMBER` operation reverses 449 to **944 = 16×59**. The original p15 4×4 grid has 16 cells; the original p32 central 5×5 perimeter separately has 16 cells. The p15 **4×4 perimeter itself has 12 cells**, so these are different geometrical interpretations. This `NUMBER` transcript is retrospective and lacks an authenticated, contemporaneous original 2013 message.

A contemporaneously attested 2013 `BASE29 3301 → 3QO` example yields base-29 digits **[3,26,24]**. The original p3 red-triad runes `ᛈᛞᚦ` have GP indices **[13,23,2]**; the source-derived field root is `z=23−2u` with conjugate constant **17**. Taking the last BASE29 digit as generator, the root constant as exponent, and 59 as prime modulus produces **24^23 mod 59 = 2**. The output agrees exactly with the known starting prime2 of solved p56's consecutive-prime-totient cipher.

The original clues do not specify the simultaneous choices of digit, modulus, root representation, direction and output purpose. The historically documented 2013 `DH 23` example **directly outputs the same shared key2**: generator5, server share8=5^6 mod23, client share19=5^15 mod23, shared key 8^15=19^6=2 mod23. Thus the elaborate F59 path adds ambiguous steps without furnishing new key information.

## Small frozen source alternatives

| BASE29 digit / exponent interpretation | Residue modulo 59 |
| --- | ---: |
| last digit 24; root coordinate 23 | **2** |
| first digit 3; same 23 | 45 |
| middle digit 26; same 23 | 41 |
| last digit24; conjugate constant17 | 55 |
| last digit24; other root coordinate2 | 45 |
| last digit24; documented 2013 DH exponent15 | 34 |

These alternatives, defined before ciphertext scoring, show that **no unique original-source selector** singles out 2. The prime2 starting point is also the default first prime of the usual prime sequence.

## Exact positive and independently chosen original-cipher test

The [source-asserting CommonJS SFT](../sims/f59_dh_p56_start_original_gate_sft.cjs) checks the title and p3 triad against the unchanged original ink annotations; reproduces all six residues and the historical `DH 23` exchange; and independently reconstructs all **85/85** runes of solved p56 using `φ(p)=p−1` at primes2,3,5,..., modular subtraction and exactly one literal-F pause at p56 position56 (zero-based).

The **217-rune unknown physical p3** is selected a priori because it contains the exponent-providing red triad. Apply the same prime-2 totient subtraction across the original p3 ciphertext, first with no F pauses and then with every F passed through as a generous independent extreme. Do not choose skip locations using hoped-for plaintext.

A native-GP trigram model is trained on 41,000 runes of the tracked Gibran reference; 22,077 remaining held-out source runes generate **3,123 stride-7, 217-rune reference windows**. Larger scores are better:

| Sample | Average GP-trigram log score |
| --- | ---: |
| Held-out native GP reference min / median / max | −9.085889 / −8.278499 / −7.361140 |
| Authentic solved p56 plaintext | **−8.311930** |
| Unchanged encrypted p3 | −11.770974 |
| p3 direct prime-2 totient inverse, no pauses | **−11.955220** |
| p3 inverse, all F passed through | **−11.902562** |

Both proposed unknown-p3 outputs remain below *every* length-matched held-out reference and are worse than the original ciphertext. The full recovered known-p56 text is the independent positive control. The negative concerns exactly these **two predeclared pause policies on original p3**, not every possible new cipher, language, page seed, or transport.

## Decision

The F59 relation is an exact but retrospective explanation for **an already-known default prime starting value**, without an independently selected reversible LP2 operation. The single source-motivated unknown-page continuation fails. **Retire the F59 direct-transfer branch** unless a newly authenticated original instruction selects the complete modular step and a withheld unknown-page prediction before examining its output. Do not tune key starts or skip masks to rescue it.

**Reproducer:** `sims/f59_dh_p56_start_original_gate_sft.cjs`, Node22, original corpus and ink annotations, independent Gibran control. [Successful held-out CI run 42985370446](https://github.com/FlareZ123/liber-primus/actions/runs/42985370446). Historical 2013 source contract: [2013 BASE29/DH original evidence](2013-base29-gf29-grid-factor.md).
