# Source-five-scroll 5-of-5 byte-field share reconstruction on original LP2 p3–p7

**Agent 5, 22 November 2026. Classification: a reproducible, direct original-cipher negative.** There is no recovered unknown plaintext, recognizable binary format, creator-supplied key, established cipher, or destination. This experiment uses a simpler GF(256) model than the historical 2013 Cicada 5-of-10 implementation (which used GF(2^176)). The difference matters.

## Concrete historical motivation and frozen original receiver

In the source JPEGs, physical LP2 pp3–7 share a distinctive five-page scrollwork treatment; the five pages contain **217, 261, 263, 196 and 208** original ciphertext runes, respectively. Their total is **1,145 = 5 × 229**. Cicada's 2013 puzzle previously used a **five-of-ten Shamir** threshold recovery, and its authenticated 2013 **BASE29** command establishes large-integer base29 as an actual earlier operation. Taken together, these support an inexpensive, clearly specified **five-share direct recipient** test. The original manuscript does not say that these later five scroll pages are shares or that 229-rune slices should cross page boundaries. Both choices are hypotheses, and the exact divisibility alone is weak evidence.

Concatenate all original p3–p7 GP29 **indices 0–28**, retaining every source rune. Create five 229-rune shares by either of the two elementary fixed layouts:

- **Contiguous**: five consecutive 229-rune slices of the 1,145-rune stream.
- **Interleaved**: residues 0–4 modulo5 in original tape order, 229 runes per lane.

For each layout read each 229-digit lane as a whole **most-significant-first BASE29 integer**, left-zero-pad to 140 big-endian bytes, then reconstruct a byte-wise polynomial's constant term with an ordinary **5-of-5 degree-four Shamir interpolant over GF(256)** at evaluation points x=[1,2,3,4,5]. The field polynomial is the conventional AES 0x11B. Exactly derived Lagrange weights at x0 are **[1,208,208,209,209]**. A second, independently labeled comparator treats original rune indices directly as bytes, without packing; both interpretations are fixed before any English or magic-byte scoring. No key, nonce, index phase, fitted coordinate, reversed rune order, or layout adjustment is admitted.

This is a *direct plaintext/file-recovery trial*. It is not historically identical to the published Cicada 2013 GF(2^176) operation and cannot exclude a source-specified binary/secret-sharing mechanism with different share lengths or serialization.

## Actual original outputs

| Frozen grouping and byte serialization | Reconstructed bytes | Printable ASCII bytes | Beginning of actual output in hex |
| --- | ---: | ---: | --- |
| Consecutive, whole-lane BASE29 | **140** | **44** | `00cb6d73b3b06c12076fc06dc2a1e4edf1531ecb498b769107d27b8cdc310693` |
| Interleaved, whole-lane BASE29 | **140** | **39** | `d1f98998e058188bafecf6d545524cb5d33a6d8befc6cfc5d0ed5a65c1fa0e8e` |
| Consecutive, direct GP-index bytes | **229** | **75** | `c1d97ede0904ce67c568a4721ecd7011c4aa670666beaf63c71b7572dca10dd6` |
| Interleaved, direct GP-index bytes | **229** | **50** | `c717a8140ecd01b679c463186804dd687b1f14d8a60466d31ed8c30e1d747b76` |

None of the four fixed outputs starts with readable text or a recognizable PNG, ZIP, GZIP, bzip2, PDF or OpenPGP magic header. There is no independently authenticated receiver or checksum for an arbitrary opaque output; therefore no claim that one of these byte arrays is a valid hidden key. The exact original input/output numbers and prefixes are frozen assertions, rather than a favorable-looking interpretation.

The independent source-native positive takes **140 real clear-GP rune indices from solved p57**, extends them cyclically, and uses deterministic, per-position quartic GF256 polynomials to create five 140-byte shares. The same interpolant recovers the genuine **140/140** GP-native symbols. Every original BASE29 lane also round-trips its exact 229 rune indices through 140-byte serialization, and the 5-of-5 inverse recovers the original fifth byte share from the secret and other four byte shares. These checks establish executable inversion and source fidelity, not historical authenticity.

## Literal 2013 field-width requirement: full-source obstruction

The genuine archived 2013 Cicada SSSS program used **GF(2^176)**, with irreducible polynomial `x^176+x^11+x^3+x^2+1`, a *monic degree-five polynomial*, and five shares to determine the five unknown lower coefficients. That finite-field contract offers a stronger, **key-independent** question than the GF256 byte-domain screen above: can these source BASE29 lanes even be serialized as complete historical 22-byte field elements?

Exactly **37 GP29 digits** suffice to represent any 176-bit share (36 are too few), and each 229-rune lane has six consecutive 37-digit blocks and seven trailing digits. Freeze this literal **six-records-per-lane** reading, preserving each source digit. The necessary condition is that **every** 37-digit BASE29 integer be below 2^176; reduction modulo 2^176 would be a lossy, unlicensed substitution for the historical share serialization.

| Original frozen five-lane layout | Number of valid 176-bit blocks among 30 | Valid blocks in the five source lanes |
| --- | ---: | --- |
| Contiguous 229-rune lanes | **4/30** | **[1,2,0,1,0]** |
| Interleaved five-rail lanes | **2/30** | **[1,1,0,0,0]** |

All other original 37-digit packet integers **overflow the authentic 176-bit field**. This is decisive for the two frozen, literal BASE29 packet layouts: the original five-scroll text cannot be six valid historically formatted five-share GF(2^176) records, independent of what degree-five coefficients or actual secret values might be. A historically faithful SSSS interpolation is therefore **undefined for almost all the original packets** under this original-source-preserving encoding. A future claim requiring bit truncation, arbitrary per-block shifts or an unseen extra compression step needs independent evidence; the raw scan does not license those repairs. The same source-faithful SFT asserts every count. This is a precise obstruction to this historical packet **format**, not a proof against every conceivable threshold-sharing interpretation.

## Cryptanalytic decision

The genuine first-party **five-of-ten secret-sharing precedent** makes a source-five-scroll test more motivated than an arbitrary source-key catalog. This direct receiver, however, produces four opaque byte arrays and has no identified plaintext consumer. **Retire these exact two lane assignments and two byte encodings as direct plaintext/file recovery.** Resist widening to unselected share positions, field polynomials, hidden key derivations, and post-hoc decryption layers. A successor should be attempted only if a source-visible instruction supplies a *specific*, historically defensible selection of unequal original pages as shares, a serialization compatible with actual 2013 GF(2^176) packets, or an original ciphertext interval with a predicted whole-word output.

This is distinct from the prior original GP29 five-scroll Shamir tests and the previously tested **p0–p2 3×243 GF256** variant. Those experiments operate on different source registers and fields.

**Reproducer:** [single-file Node.js 22 CommonJS original-data SFT](../sims/lp2_p3_p7_five_scroll_gf256_shamir_original_sft.cjs) reads the repository's immutable-derived original GP29 corpus; [Windows CI PASS 45025341660](https://github.com/FlareZ123/liber-primus/actions/runs/45025341660). Full source 1,145/1,145 indices and four fixed 32-byte prefixes checked.
