# P55 shell as SHA-1, with the source-bracketed p50 23-byte HMAC key: bounded original gate

**Agent29, 21 November 2026. Classification: source-count-motivated, cryptographic checksum hypothesis; negative for the frozen SHA-1 consumers.** No unknown-page plaintext, source-authenticated cipher, preimage, key or destination is recovered.

## Human-visible route and strongest alternative

The original p55 page carries exactly **76 GP29 runes**. The solved p57 instruction *SHED OUR OWN CIRCUMFERENCES*, interpreted with the source page-carry rule, partitions p55 into **33 exterior runes** (one carried endpoint plus two endpoints of each of 16 complete words) and **43 strict word-interior runes**. The original p49–p51 table independently contains the strongly selected **43-byte** numeric interval at zero-based positions84–126, between the nested paired 201/193 markers. The solved p57 page ends with the unique 23-dot mark, which independently participates in the p28 DH23 navigation chain. The authentic 2016 signed message uses RSA/SHA1. These source facts suggest a cheap, falsifiable typed alternative to another GP-English search: perhaps the 33 exterior runes are a base-29 **160-bit SHA-1 authentication tag** for the 43 interiors, with a 23-byte HMAC key taken from one end of the p50 43-byte bracket.

The crucial unsupported step is the **choice of SHA-1 and the direction/serialization of this proposed authentication relationship**. Source counts permit, but do not require, any SHA-1 reading. No Cicada-authored instruction selects HMAC or says the p55 exterior is a digest. A real typed checksum would be dramatically more informative than a good English score: the exact 160-bit match would authenticate the current source connection without any language fitting.

## Exact original-source test

The frozen p55 exterior GP values, treated as a single most-significant-first base-29 integer, equal this exactly **160-bit** value:

\`efe89bff1c7eff588ec80605c99a364067960320\`

**Capacity check:** 33 base-29 symbols span 33 log₂(29) = **160.3133728392 bits**. Even under a uniform random exterior vector, the probability that its numeric value fits in exactly 20 bytes is 2^160 / 29^33 = **0.8047581351**. Thus the shell's 160-bit *fit* alone is expected roughly **80.48%** of the time and supplies **no independent SHA-1 evidence**. The typed digest-equality test below bears the full evidential burden.

The 43 original strict interior GP values are checked independently of their transcription labels and encoded under four natural, source-specific serializers:

1. 43 zero-based GP29 symbols as raw bytes.
2. The whole 43-digit base29 integer as **27 big-endian bytes**, without an invented header.
3. Canonical GP transliteration concatenated as ASCII.
4. Original rune characters concatenated as UTF-8.

For each serializer test a direct SHA-1 digest and HMAC-SHA1 with both 23-byte p50 key candidates: the first23 bytes and the last23 bytes of the **original, unpermuted** 43-byte bracket. Separately test SHA-1 of the 43 original p50 bytes themselves. Thus there are **13 original-source typed comparisons**, with no phase, salt, key search, extra hashing, or rotated input.

None matches the 20-byte exterior value. In particular, direct SHA-1 of the raw p50 bracket is \`4e1d5cc7118d628fd6ad42a8b0452b194ddf3086\`. All **12 positive controls** (four serializers × direct SHA-1 or either keyed HMAC) recover a full 20-byte planted digest by the same 33-GP-digit radix conversion, using original clear p57 runes as the message. The exact symbolic p55 exterior roundtrip and p50 original marker boundaries are asserted.

The stand-alone [Windows Node22 original-input reproducibility test](../sims/lp2_p55_sha1_shell_p50_23key_sft.cjs) passed in [GitHub Actions run 44941658846](https://github.com/FlareZ123/liber-primus/actions/runs/44941658846).

## Decision

Retire these **13 precisely specified** checksum consumers. The literal shell may still carry another typed object, use an unobserved external key, follow an authored transform, or have no checksum role at all. Do not multiply private HMAC key derivations or serializations to force a match. The already documented 43/33 p55 and 43-byte p50 source selector geometries remain intact. This result establishes **zero new plaintext or authenticated p55 cryptographic structure**.
