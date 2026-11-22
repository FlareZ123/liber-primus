# P0 red13 as a local RC4 key: original-body gate

**Agent 27, 21 November 2026. Classification: bounded original-input negative.** No unknown plaintext, authentic key, or general LP2 cipher was recovered. This tests one source-visible local-key hypothesis under the ordinary clock and the exact solved-p56 F-transparent rule.

## Human-visible premise

The original physical p0 image is **resources/liber-primus/17.jpg**. The source-adjudicated ink override fixes 13 red GP29 runes at offsets 0–12, a large red 13-dot marker immediately after rune 13, and the black body beginning at offset 13 and continuing for 249 runes.

The exact red-key vector in source order is:

~~~text
[15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]
~~~

A player could plausibly treat the marked 13-rune red heading as a local key for the body that begins immediately after its matching 13-dot marker. RC4 is a recognizable stream cipher and appears in earlier Cicada image-steganography workflows, but that historical use does **not** establish that LP2 prose uses RC4.

## Frozen receivers

Treat the 13 GP29 indices themselves as the 13 RC4 key bytes. Use standard RC4 KSA/PRGA and reduce each output byte modulo 29. Test both natural additive directions:

~~~text
P[i] = C[i] - (RC4(key)[i] mod 29) mod 29
P[i] = C[i] + (RC4(key)[i] mod 29) mod 29
~~~

Also test the exact p56 plaintext-F-transparent rule. A plaintext F (GP29 index 0) is copied unchanged and does not consume a keystream byte. A ciphertext F is ambiguous: it may be a transparent plaintext F, or a non-F plaintext shifted to F. The reproducer exhaustively branches both explanations with a dynamic program; non-F ciphertext positions that would decrypt to plaintext F are rejected. This is not the simpler, incorrect shortcut of treating every ciphertext F as transparent.

No drop count, phase, state reset, key rotation, F remapping, or external key is used. The red title is the key, not part of the target ciphertext. The source corpus and original-image ink override are read by the reproducer; all 13 key symbols and the 13-dot boundary are asserted.

## Results

The standalone Node 22 SFT is **sims/lp2_p0_red13_rc4_body_original_sft.cjs**. It checks the standard RC4 known vector, exact ordinary round trips, the exact F-transparent DP, and planted clear-p57 positive controls. For language evaluation it uses the pinned 300,000-character Shakespeare reference mapped through the fixed GP29 transliteration routine, a four-rune model trained on the first 150,000 characters, and 300 fixed windows from the held-out half, each exactly 249 runes long.

| Original p0 body / candidate | IoC | GP4 mean log score |
|---|---:|---:|
| Unchanged ciphertext | 0.0343632595 | −14.1708061057 |
| Ordinary clock, RC4 subtraction | 0.0352377251 | −14.1761335398 |
| Ordinary clock, RC4 addition | 0.0333916310 | −14.1318940557 |

The 300 held-out English windows have GP4 score range **−11.4543172973 to −9.6825863609**, with median **−10.7432118275**. The best ordinary-clock candidate remains more than 2.68 log-score units below even the weakest held-out window.

Under the exact p56 plaintext-F-transparent rule, **both signs have zero valid plaintext paths** for the original p0 ciphertext. This is stronger than a low language score: no plaintext sequence satisfies that exact key-clock rule. The same DP recovers planted p57 plaintext under both signs (576 and 364 candidate paths respectively), confirming that the ambiguity handling is not simply rejecting all ciphertexts.

As an encoding control, direct bytewise XOR of GP29 indices with raw RC4 bytes places **227/249** outputs outside the legal GP29 range 0–28. The tested modulo-29 ordinary variants are reversible and round-trip all 249 original symbols. These checks validate implementation, not the cipher hypothesis.

**Scoring limitation:** the language screen uses an English Shakespeare reference mapped through GP29, not a multilingual adjudicator. The ordinary-clock negatives reject these receivers as English plaintext candidates; the exact transparent-clock result is an algebraic impossibility for this receiver regardless of language.

## Decision

Retire the exact direct receivers **raw p0 red13 GP key → standard RC4 → modulo-29 additive stream → p0 black body**, under the ordinary clock and exact p56 plaintext-F-transparent clock. Do not rescue them with arbitrary RC4 drop counts, alternate phases, key rotations, or unmotivated key reinterpretations.

This does not refute RC4 use for image steganography, RC4 with a different independently sourced key, or unrelated page-specific mechanisms.

Reproduce from the repository root with:

~~~sh
node sims/lp2_p0_red13_rc4_body_original_sft.cjs
~~~

Sources: **resources/liber-primus/17.jpg**; **resources/liber-primus/lp2-p0-physical-ink-override.json**; **resources/liber-primus/lp2-corpus.json**; **resources/control/shakespeare_first300k.txt**; the solved p56 F-transparent convention is summarized in **results/README.md**.
