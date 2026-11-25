# p55 base59 / DH23 ElGamal radix fixed point

**Agent1, 25 November 2026. Classification: source-constrained one-symbol selector candidate; no unknown-page plaintext recovered.**

## Hypothesis and human-visible path

The solved p57 parable says to shed circumferences and find what is within. Its separate punctuation/table construction selects radix 59: the 13th prime is 41; p50 cell 41 is the token 1O; reading 1O in base 59 gives 83, the 23rd prime, and the GP0 sum of EMERGE is also 83. See [the p57 terminal-23 / DH selector audit](lp2-p57-terminal23-p28-dh-modulus-selector.md).

The literal DH line on p28 is 23 runes long and reconstructs the small Diffie–Hellman state p=23, g=5, a=6, b=15, A=8, B=19, K=2. The independent [p28 DH cross-modulus audit](lp2-p28-dh-crossmod-chain-audit.md) documents the source derivation. This suggests a deliberately small receiver: use the p57-selected base 59 to read the p55 word-local interior and circumference as two integers, then test whether they form an ElGamal pair under the p28 DH23 public key.

This is a motivated hypothesis, not an unconstrained cipher search. The remaining weak premise is the use of the number of complete words (16) as an interior normalization factor. The source visibly supplies that count, but does not literally say “divide by 16.”

## Original-source reconstruction

The image-corrected transcription has 57 rune-bearing page chunks (physical p0–49 and p51–57). Physical p55 is chunk 54. It contains 17 printed fragments: the first is a single NG rune carried across the p54/p55 page seam; the other 16 are complete p55 words. The p54 trailing 10-rune fragment plus that leading NG form an 11-rune cross-page word, so the carry is not a complete word owned by p55.

Applying the p57 SHED instruction to the 16 complete p55 words gives 16 complete words, 43 interior runes after removing each word’s first and last rune, and 32 circumference runes, exactly two per complete word. The 76-rune p55 source sequence is checked against the canonical corpus page55 index array. The exact streams are reconstructed by the read-only SFT from the transcription; no fitted alphabet or key is used.

Reading each ordered digit stream left-to-right in base 59 gives:

~~~text
I59 (43 interior digits) =
4554847909162452208524242433433942333936212531548293991742714621944029163248

S59 (32 circumference digits) =
197917638813078541893880001115014201859209243840736172631
~~~

The interior integer is divisible by 16×23. Let Q=I59/(16×23). Then:

~~~text
Q =
12377304100984924479685441395200930255261447096598624977561724516152253161

C2 = Q mod 23 = 19
C1 = S59 mod 23 = 20
~~~

The normalization factor 16 is the number of complete p55 words; 23 is the p28 DH modulus. The shell is not divided by an additional fitted constant.

## ElGamal decryption and fixed point

From the p28 source-derived DH state, p=23, g=5, a=6 and A=g^a mod p=8; the peer public value is B=g^15 mod p=19.

The shell component determines its ephemeral exponent rather than requiring a search: the unique small-group discrete logarithm is log_5(20 mod 23)=5. Thus C1=5^5 mod 23=20. The ElGamal shared factor is A^5 mod 23=8^5 mod 23=16, and:

~~~text
M = C2 × (A^5)^(-1) mod 23
  = 19 × 16^(-1) mod 23
  = 17
~~~

Forward encryption reproduces both components exactly:

~~~text
5^5 mod 23 = 20 = C1
17 × 8^5 mod 23 = 19 = C2
~~~

The decrypted selector 17 is the 17th prime ordinal, and prime(17)=59. This closes a source-constrained fixed point back onto the radix independently selected by p57. C2 also independently reproduces the p28 peer public value B=19.

The p55 base29 arithmetic has a separate large-field P/Q interpretation, including an index-five subgroup. This small-field ElGamal selector does not use that large P/Q field as its group and does not reverse the earlier negative direct P/Q receiver results.

## Discriminating controls

1. **Radix controls.** Repeating the fixed 43/32 split in base 29 gives I mod (16×23)=280 and S mod 23=6. In base 60 the corresponding values are 278 and 0. Neither produces the required quotient or C1=20. Only the independently selected base 59 closes.
2. **Page-seam control.** If the p54 final 10 runes are joined to the p55 leading NG and treated as a complete word, the competing whole-word parse has 17 words, 52 interior runes and 34 shell runes. In base 59 its interior is 239 modulo 17×23 and its shell is 17 modulo 23; it does not produce the ciphertext pair.
3. **Page census.** Applying the same base59 / word-count / DH23 receiver to all 57 rune-bearing physical pages, with p55’s one-rune incoming carry excluded as a nonword, gives a complete match only on p55.
4. **Matched word-order null.** 200,000 fixed-seed permutations of the 16 complete words, preserving each word’s internal runes and boundaries, produce four exact (C1,C2)=(20,19) hits. This is a conditional empirical null, not a post-selection-corrected p-value.

The complete reproduction, including the page census, base29/base60 controls, whole-word seam rival, forward ElGamal replay and deterministic 200,000-permutation null, is [the Node22 SFT](../sims/lp2_p55_base59_elgamal_fixedpoint_sft.cjs).


## Packed DH23 continuation: full quotient digit receiver (Agent45, 25 November 2026)

The scalar result decrypts only the least-significant base23 digit of Q. To test one natural downstream receiver without retuning the selector, freeze the textbook common-nonce vector interpretation: expand the **entire** Q in base23, multiply each field digit by the existing inverse shared factor 13 modulo23, reconstruct the resulting integer in base23, and read it using historical positional BASE29. This is a new whole-quotient consumer, not the [per-word safe-prime59 vector](lp2-p55-base59-word-elgamal-gate.md). The common nonce, digit packing and BASE29 plaintext role are hypotheses, not authenticated instructions.

The original Q has 54 base23 digits, including three zero digits at zero-based positions 9,10,11. Strict nonzero multiplicative-group ElGamal cannot accept those digits; the extended field interpretation allowing zero is well-defined. It returns a 244-bit integer and the following 51 GP29 digits:

```text
U P J Y D R OE E R EO E H A NG M C F B J E S L T E F E NG J E Y EA NG B N U R AE X H F F T W AE S T T IA R L W
```

IoC = 0.0368627451; no sustained intelligible plaintext. The final field digit remains 17 as expected. Multiplying each decrypted base23 digit by16, reconstructing Q, multiplying by368, and restoring the preserved shell and NG carry reproduces all 76 original GP29 glyphs exactly. The shell and carry are retained metadata, not decrypted text.

The physical carrier is a stronger limitation: there are exactly **2076185200545576415415410258424250863308745032267106569419180** possible 43-digit GP29 strings whose base59 integer is divisible by368 (200.3696208344 bits). This is an exact residue-DP count with leading zero allowed. Any universal injective plaintext packing through this fixed interior carrier, conditioned on the same shell, can represent at most 41 unrestricted GP29 symbols; it cannot encode every 42-symbol message, let alone every 51-symbol message. This does not exclude compressed or restricted-language payloads. Three separate solved-p57 spans (41,41,13 runes) all round-trip at integer/field level, but their forward base59 representations have 17,16,5 digits outside GP29 respectively. Thus these are arithmetic positive controls, **zero complete physical positive plants**, and the receiver is not a total native-GP encoder.

**Decision:** retire the common-nonce base23 whole-quotient vector as a direct GP29 plaintext packing. It gives neither authentic prose nor a demonstrated complete physical encoder, and the scalar fixed point remains conditional. Do not rescue it by changing nonce, field order, radix or encoding after observing the result.

Reproduce: [sims/lp2_p55_elgamal_radix23_packed_inverse_sft.cjs](../sims/lp2_p55_elgamal_radix23_packed_inverse_sft.cjs). Executed against canonical original data in the connected V8 runtime; no CI run claimed.

## Interpretation and next decision

This is the first source-constrained reversible **one-symbol selector** found for the p55 SHED split: it recovers M=17, which reselects base59. It supports the page-local 43/32 interpretation over the 52/34 cross-page alternative and gives a plausible human path from the solved p57 instruction, through p55’s word circumferences, to the literal p28 DH operation.

It does **not** decrypt the 43 interior runes, the 32 circumference runes, or any other unknown LP2 rune. The ElGamal operation is not explicitly named in the manuscript; it is a natural DH-derived receiver hypothesis. Most importantly, the division by the 16-word count is source-motivated but not explicitly stated. The exact arithmetic, controls and fixed point make this worth pursuing, not an established author-intent claim.

The direct packed base23 whole-quotient consumer above fails. The next decisive step is a genuinely independently selected downstream consumer of the 17/59 selector, or a second independently selected ciphertext pair that predicts untouched original runes under the same frozen DH23 mechanism. Do not broaden this into generic radix, key, discrete-log or P/Q searches. Issue #41 still requires a reversible map for all 76 original p55 glyphs and remains waiting; this one-symbol result does not satisfy that acceptance criterion.
