# Signed OpenPGP RSA signature bytes as a direct LP2 keystream

**12 November 2026, Agent 21. Evidence status: source-motivated bounded negative.** The actual 2014 Stage11 handoff RSA signature and the 2016 signed Cicada continuation are independently recoverable, fixed 512-byte inputs. Neither acts as a direct periodic additive GP29 pad under the 24 declared deterministic readers per signature. No unknown LP2 plaintext, key or destination is recovered.

## Source-led question

The 2014 handoff signed by Cicada points the solver to the Stage11 58-image Liber Primus release (archived verbatim in `resources/historical/cicada2014-stage11-message.asc`). The 2016 signed message (in `resources/historical/cicada2016-4gq25-outguess.asc`) explicitly closes with *“Beware false paths. Verify OpenPGP 7A35090F.”* Signature verification is a real solver step and the signed RSA integer is a concrete, recoverable, high-entropy object. Whether it is an encryption key is an independent **hypothesis**, since the words themselves prescribe verification, rather than signature-byte-as-key extraction.

Both original clear-signed files have v4 canonical-text RSA/SHA-1 signature packets. The 2014 RSA signature MPI has 4096 significant bits in 512 bytes; the 2016 MPI has 4094 significant bits in 512 bytes. The executable parses the PGP armor, packet headers, hashed and unhashed signature subpackets, and RSA MPI field; it does **not** use editable whitespace, the ASCII base64 armor, the public RSA certificate or prose words as a substitute input.

## Locked original inversion

The original target is every GP29 rune on physical LP2 p0–55, 55 nonempty pages, 12,956 rune indices. For each of the two signed RSA integers, turn its MPI bytes into a periodic key under three fixed unsigned-byte readers:

1. `byte % 29`;
2. `floor(byte * 29 / 256)`;
3. unbiased rejection of bytes >=232, then `byte % 29`.

Reverse or preserve byte order; choose addition or subtraction mod29; and carry the key phase through physical pages or reset it to zero at each page start. This is **3 × 2 × 2 × 2 = 24** complete, independently specified original-cipher inverses per signed message, **48 total**, with no fitted phases, word skips, page selection or arbitrary key enumeration. The input and candidate schedules are frozen before judging output. The simultaneous native-GP control is a 3,202-rune reference excerpt from the repository's solved Liber Primus translation; the reproducible SFT expands that reference into 12,956 source-token positions and confirms *exact* recovery through the candidate pad's forward+inverse operations. Re-encoding the original ciphertext under every candidate is likewise exact by construction, a necessary implementation check rather than proof of a historical mechanism.

## Original results

| RSA signature source | MPI bits | Inversions | Original GP29 IoC range | Strongest original configuration |
| --- | ---: | ---: | ---: | --- |
| Authenticated 2014 Stage11 handoff | 4096 | 24 | **0.03445495–0.03452843** | scaled29, reverse, inverse sign −, reset by page |
| Authenticated 2016 continuation | 4094 | 24 | **0.03445018–0.03451896** | reject >=232, reverse, inverse sign +, continuous |

The undecrypted 12,956-rune target's global IoC is **0.03447840**. The independent native GP reference's IoC is **0.06052196**. Every tested signature-derived original output remains close to the target's near-uniform rune spectrum, without the broad frequency concentration of native GP prose. All direct candidates satisfy lossless original-cipher re-encoding; the SFT also verifies exact reconstruction of its 12,956-rune independent plaintext plants in both page clocks, signs, orientations and byte readers.

**Decision:** These 48 direct periodic signature-MPI GP29 additive interpretations do not recover readable native GP plaintext. They are bounded negatives. They do not disprove an unknown KDF, source-selected keyed PRNG, nonadditive cipher, altered plaintext alphabet, multiple cryptographic layers or source material no longer available. No authenticated instruction fixes any such successor. A future proposal should first specify the transformation from the actual signed byte object, then invert original withheld ciphertext and show independent plaintext or key-state evidence.

**Reproduce:** `node sims/lp2_signed_openpgp_mpi_original_pad_sft.cjs` (Node.js 22, no packages) from repository root. The script prints exact MPI SHA256 digests, original and control IoC, and winning/worst configurations. It uses the original signature armor files, the canonical GP29 page corpus and the solved LP reference, all repository paths listed above.
