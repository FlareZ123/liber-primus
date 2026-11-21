# P0 red13 as a local RC4 key: original-body gate

**Agent 27, 21 November 2026. Classification: bounded original-input negative.** No unknown plaintext, authentic key, or general LP2 cipher was recovered. This tests one source-visible local-key hypothesis and retires only that exact receiver.

## Human-visible premise

The original physical p0 image is **resources/liber-primus/17.jpg**. The source-adjudicated ink override fixes:

- 13 red GP29 runes at offsets 0–12, in two words of lengths 8 and 5;
- a large red 13-dot marker immediately after rune 13;
- the black body beginning at offset 13 and continuing for 249 runes.

The exact red-key vector in source order is:

~~~text
[15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]
~~~

A player could plausibly treat the marked 13-rune red heading as a local key for the body that begins immediately after its matching 13-dot marker. RC4 is a recognizable stream cipher and appears in earlier Cicada image-steganography workflows, but that historical use does **not** establish that LP2 prose uses RC4. This is therefore a deliberately narrow hypothesis, not an assumed creator method.

## Frozen receiver

Treat the 13 GP29 indices themselves as the 13 RC4 key bytes. Use standard RC4 KSA/PRGA, with no drop count, phase search, state reset, F bypass, or external key. Since the plaintext alphabet has 29 symbols, reduce each RC4 output byte modulo 29 and test the two natural stream directions:

~~~text
P[i] = C[i] - (RC4(key)[i] mod 29) mod 29
P[i] = C[i] + (RC4(key)[i] mod 29) mod 29
~~~

The test operates only on the 249 black p0 body runes. The red title is the key, not part of the target ciphertext. The source corpus and original-image ink override are both read by the reproducer; all 13 key symbols and the 13-dot boundary are asserted.

A separate prior experiment, **sims/lp2_13dot_row8_rc4_original_sft.cjs**, uses eight-byte p50 table rows as RC4 keys for 13-dot-delimited intervals. It does not test p0's own 13 red title as the key for its following 249-rune body; this is the distinct receiver evaluated here.

## Results

The standalone Node 22 SFT is **sims/lp2_p0_red13_rc4_body_original_sft.cjs**. It checks the standard RC4 known vector, both exact forward/inverse round trips, and a planted clear-p57 positive control. For language evaluation it uses the pinned 300,000-character Shakespeare reference, GP29-native transliteration, a four-rune model trained on the first 150,000 characters, and 300 fixed windows from the held-out half, each exactly 249 runes long.

| Original p0 body / candidate | IoC | GP4 mean log score |
|---|---:|---:|
| Unchanged ciphertext | 0.0343632595 | −14.1708061057 |
| RC4 subtraction | 0.0352377251 | −14.1761335398 |
| RC4 addition | 0.0333916310 | −14.1318940557 |

The 300 held-out English windows have GP4 score range **−11.4543172973 to −9.6825863609**, with median **−10.7432118275**. Both RC4 candidates are substantially below even the weakest held-out window; neither improves on the original body. The unchanged body is likewise outside the held-out English range.

As an encoding control, direct bytewise XOR of GP29 indices with raw RC4 bytes places **227/249** outputs outside the legal GP29 range 0–28. The tested modulo-29 variants are reversible and round-trip all 249 original symbols; the planted p57 control also round-trips exactly in both directions. These checks validate implementation, not the cipher hypothesis.

## Decision

Retire the exact direct receiver **raw p0 red13 GP key → standard RC4 → modulo-29 additive stream → p0 black body**. Do not rescue it with arbitrary RC4 drop counts, alternate phases, key rotations, or unmotivated key reinterpretations. A new first-party clue would be needed to justify those variants.

This does not refute RC4 use for image steganography, RC4 with a different independently sourced key, or unrelated page-specific mechanisms. It establishes only that the simplest local interpretation of p0's red13/13-dot pairing does not decrypt the following body into native English.

Reproduce from the repository root with:

~~~sh
node sims/lp2_p0_red13_rc4_body_original_sft.cjs
~~~

Sources: **resources/liber-primus/17.jpg**; **resources/liber-primus/lp2-p0-physical-ink-override.json**; **resources/liber-primus/lp2-corpus.json**; **resources/control/shakespeare_first300k.txt**.
