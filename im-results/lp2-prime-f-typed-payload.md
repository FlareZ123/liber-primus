# #2739 — Exact prime/F survivors as historical typed objects

Agent24, 25 November 2026. No unknown plaintext. A separate, substantive historical implementation correction emerged.

## Frozen receiver

Reconstruct only the three paths from #1498 on the original p54–55 corpus (Git blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165): starts 167,167,168; literal F positions [41,195,247], [65,195,247], [41,65,195,247] respectively. All replay 308/308 and end at prime pointer 472. All share the identical 76-rune p55 tail (start397, skip15). No new phase/skip search.

2013 signed BASE29 and the archived participant examples demonstrate canonical positional integers (3301→3QO, 30→11, 1033→16I). Their byte serialization is not specified; choose the usual minimal unsigned big-endian representation as one exploratory transfer. Canonical integer roundtrip alone cannot identify a consumer: all nonleading-zero tapes pass. No scanning internal offsets or alternate widths.

Typed tests: complete zlib Crypt::RSA serialized field (exact length, field name Cyphertext, EOF and no trailer); one numeric 432-bit RSA block under the 2014 challenge's published/solver-derived key; literal 5×5 positive decimal 1033 square (all lines and diagonals, no extra fields); complete nonempty bzip2 member with no trailer; exact printed p56 target as SHA-512. The digest algorithm remains unauthenticated.

## Actual historical control: important correction

The archived [signed 2014 challenge](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/002-first-onion/1033.jpg.asc) (blob cd529671eac6458a790f047d23895af264b11751) contains a 190-byte compressed object with 162 ciphertext bytes, exactly three 54-byte blocks. The pinned solver account contains the recovered factors and historical output. These factors are solver-derived, not first-party private-key delivery.

The source of [Crypt::RSA 1.99 DataFormat.pm](https://github.com/gitpan/Crypt-RSA/blob/257f59d25d2d4adec3ef7e439e89b07a3a21a4ec/lib/Crypt/RSA/DataFormat.pm) (blob 07edffd5340a50717f9c5ebf859c267a09d1a6cd) increments the MGF counter by hlen=20, not by one. The [OAEP module](https://github.com/gitpan/Crypt-RSA/blob/257f59d25d2d4adec3ef7e439e89b07a3a21a4ec/lib/Crypt/RSA/ES/OAEP.pm) (blob 98b980c0575cc876143ba9f395fde361b6fe7eab) defines k−1 encoded bytes and SHA1. Recovered actual historical blocks pass **3/3** with counter 0,20,40,…; standard OAEP counter 0,1,2,… passes **0/3** (delimiter fails despite matching label). Historical plaintext concatenation matches the known archived continuation exactly. This is an implementation difference, not a newly solved LP2 clue.

Prior standard-library synthetic positives are therefore not source-exact historical controls. The previous direct p55 shell negative remains valid because all three raw representatives fail the mandatory k−1 width before MGF. See [corrected scope](lp2-p55-2014-rsa-original-source-shell-gate.md).

Other controls: two actual 2012 archived participant envelopes (blobs 30a45f2149bf46fd99d156d24b7132f8e0f207b3 and e2dbbad61d8dfb1a9efa736a331f183745ac157e) parse into 188 ciphertext bytes each; no participant-specific inverse attempted. Actual derived stage04 1033 square (blob f081bf3bd3cb45b55359fa0e8961b1f033aa10c7) passes. The bzip2 gate reuses the repository's [actual Stage08 member validation](cicada2014-stage08-bzip2-original-member-audit.md); the historic binary was not refetched successfully in this environment. New synthetic complete member passes and appended trailer fails.

## Results

| Object | Minimal bytes | RSA status | Other typed matches |
|---|---:|---|---:|
| Start167, skip41 | 187 | Out of range | 0 |
| Start167, skip65 | 187 | Out of range | 0 |
| Start168 | 187 | Out of range | 0 |
| Common p55 tail | 47 | Decrypted representative exceeds k−1 width | 0 |

All four canonical numeric objects fail every frozen actionable consumer. 1,024 seeded random controls match each shape's length, initial/final pointer and exact plaintext F locations, with forward-valid ciphertext, and give zero typed matches. They are not claimed to reproduce the original ciphertext.

Decision: retire these precise receiver transfers for the surviving tapes. No independent evidence for a different byte packing or private key. Do not mistake numerical reversibility for an intended next instruction. Bounded failure, not exclusion of all binary/register interpretations. No network interaction with any puzzle endpoint.

Reproduce: `python sims/lp2_prime_f_typed_payload.py`. [Raw result](lp2-prime-f-typed-payload.json). Executed on the fetched original p54/p55 indices in local Python; script reads the same pinned repository corpus when run in checkout.
