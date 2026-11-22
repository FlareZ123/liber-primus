# Cicada RSA-4096 signature gate on the original 512 printed p50 glyphs

**Agent27, 17 November 2026. Classification:** new source-constrained original-cipher typed-object test, **negative for six fixed layout conventions**. No unknown LP2 plaintext, authentic decryption key or final destination recovered.

## Authored historical operation and concrete candidate

The actual LP2 numerical table printed across pp49–51 (source scans 66.jpg–68.jpg) has **32×8 two-character cells**, hence exactly **512 literal printed characters**. Reading their literal ASCII code units produces a 512-byte register without assuming any particular base-60 numerical interpretation. A human 2014 Cicada solver already possessed the genuine [Cicada OpenPGP public key](../resources/historical/cicada-3301-2012-public-key.asc) used to authenticate the puzzle. That key is an **RSA-4096** key with public exponent **65537**, so a full-length raw RSA signature occupies precisely **512 bytes**. An RSA signature could be checked using the public key alone, with an independently typed result: an RFC 4880 v4, PKCS#1 v1.5 signature block beginning 00 01 FF...00 followed by a DER-encoded hash DigestInfo.

This candidate is materially different from reading each original *two-character token* as one base60 numerical byte (256 binary bytes), or as 512 base60 digits compacted into a 378-byte integer. It tests the *literal original printed glyphs* as an already-complete historical signature. Neither the original table nor a signed instruction explicitly directs that interpretation, so matching sizes is a hypothesis.

## Source-fixed inverse and genuine historical positive

[Reproducer](../sims/lp2_p50_rsa4096_ascii512_signature_sft.cjs) reads exactly the preserved 2012 Cicada key and [256-cell LP2 original-source transcription](../resources/liber-primus/lp2-grid-256.json). It checks public-key fingerprint **6D854CD7933322A601C3286D181F01E57A35090F**, RSA modulus **4096 bits**, exponent **65537**; it extracts a **genuine RSA key self-certification signature** from the authenticated public key and recovers correct 00 01 FF...00 PKCS#1 padding with SHA-1 DigestInfo prefix 3021300906052b0e03021a05000414. This real signature is the independent positive: no arbitrary synthetic signature or guessed secret is needed.

For each original table layout, concatenate exactly 256 two-glyph cells into 512 bytes of printed ASCII characters, interpret the bytes as a big-endian signature integer S, compute EM = S^65537 mod N with the original Cicada public modulus, left-pad to exactly 512 bytes, and parse the required PKCS#1-v1.5 signature framing.

| Original source layout | First 16 bytes of recovered 512-byte EM | Valid RSA signature padding? |
|---|---|---|
| Physical printed order, left to right and top to bottom | 5a6427970c7a23ba87d632da6ce6e682 | **No** |
| Exact reverse of all 512 characters | 12e44aad1d1aaaeae5c32fb697927ad7 | **No** |
| Reversed order of the 256 complete two-glyph cells | 4727d9ced1f568f257fccee73b84efcf | **No** |
| Swap the two printed characters within each cell | a7d05a35daadb0e6093025c214558f97 | **No** |
| Column-major traversal of the actual 32×8 printed table | 6d9807c054d9bcf4cb426546e69a82df | **No** |
| Every other physical printed row read in reverse | 3bcfaa4a584cf3b55dc5f56a43ef3f02 | **No** |

All six original 512-byte candidate integers are less than the 4096-bit public modulus. The recovered messages fail immediately at the **first byte**, which is never the required 00 for a valid 2014-era PKCS#1 RSA signature. No hash choice, DigestInfo parsing, plaintext crib, padding search or unverified historical private key could repair that first-byte failure under any of the six fixed source layouts. The identical modulus/exponent accepts the genuine original self-certification, guarding against an implementation false negative.

## Decision

Retire **literal printed-ASCII 512-byte table-as-Cicada-RSA4096-signature** for the six specified source-native orientations. This closes a precise, historically motivated possibility that the unusually exact 512-character count supplied an authentically signed standalone object. The byte count is a source observation; it does not authenticate an instruction to use the RSA key.

This experiment does not exclude arbitrary secret glyph permutations, nonliteral code units, RSA-4096 ciphertext addressed to a private-key holder, another sender's signature, a codebook, a different key, or key material elsewhere in the book. Such branches would require an independent original clue selecting the transform or sender. The direct published-Cicada signature route produces **no plaintext**.

Run from the repository root on Windows Node.js 22: node sims/lp2_p50_rsa4096_ascii512_signature_sft.cjs. The script contains the source assertions, the full six-layout matrix, real historical RSA positive, and exact expected original byte prefixes.