# LEAD=82 source-authentication gate: arithmetic echo retained, chemistry selector retired

**Agent14, 19 November 2026. Director #1724. Classification: the arithmetic coincidence is reproducible, while the semantic step `LEAD -> chemical element -> atomic number 82` has no authenticated Cicada source selector. Retain it only as a checksum-like echo. It must not authenticate THE, ROAD, or the (8,2) packet selector.**

## Frozen local facts

The local p0 candidate chain predates this audit.

1. The preserved-center H packet on p0 offsets80..102 has length23.
2. One-based positions `(A,K)=(8,2)` select packet values `[a,p]=[6,23]`.
3. Subtracting `[6,23]` from original p0 ciphertext `[8,12]` gives native GP `[TH,E]` = **THE**, with exact forward replay.
4. The adjacent navigation-predicted ROAD word at offsets105..108 has original ciphertext `[16,8,25,27]`.
5. Subtracting native GP ROAD `[4,3,24,23]` gives the exact residue vector `[12,5,1,4]`.
6. Ordinary A1Z26 reads that vector as **LEAD**.
7. Lead's standard atomic number is **82**, whose decimal digits equal the earlier selector positions `(8,2)`.

Those equalities remain true. This audit asks whether Cicada independently instructed the two semantic conversions needed to turn them into an authored selector.

## Authenticated-source search

The checked first-party corpus contains the PGP-clearsigned 2012–2017 messages already preserved in the repository. The source-body audit searched case-insensitively for `A1Z26`, `LEAD`, `atomic`, `periodic`, `chemical`, `chemistry`, and `element`.

No checked signed source contains any of those selector terms.

Two signed messages do use number language, but at a more general level:

- the 2012 RSA instruction says the encrypted message is a number;
- the 2016 message says Liber Primus's words are the map, their meaning is the road, and their numbers are the direction.

Neither source defines Latin letter ordinals, chemical-element lookup, atomic numbers, or a LEAD homograph operation. The 2017 signed warning adds only the false-path/signature-verification instruction.

### Pinned signed-source blobs

| Source | Git blob SHA |
| --- | --- |
| `resources/historical/cicada2012-countdown-message.asc` | `7229104f48f4a0eeeae69c901eb74cb21baed956` |
| `resources/historical/cicada2012-midi-email.asc` | `cbdb9899a5c77f364456f55e39bd25b73467d809` |
| `resources/historical/cicada2012-song-is-your-own-path.asc` | `d40ea4207b7db70be6f422865191451de05b63a1` |
| `resources/historical/cicada2012-message-only-displayed.asc` | `672184615cf25d19e5eb177875be83b4d83c1128` |
| `resources/historical/cicada2013-first-onion-hello.asc` | `867f15cf3da05d75ff5b1450b571429c1419f656` |
| `resources/historical/cicada2013-forest-clue.asc` | `78d4eaf01df3e13e8d3aba0a113cee7c76523ce0` |
| `resources/historical/cicada2013-second-onion-everything-you-need.asc` | `9ec8b96c62c6fc9033744c67e4643f0e83e6aea7` |
| `resources/historical/cicada2013-second-onion-icmp-echo.asc` | `b8dcf1674603399d364c43ba86241f3147660fd2` |
| `resources/historical/cicada2013-welcome-and-congratulations.asc` | `2a76372e671573028809260777169e3a4a0a6950` |
| `resources/historical/cicada2013-if-you-followed.asc` | `2cac85317c8245dfe3bf6509807e7f8308b734ac` |
| `resources/historical/cicada2013-no-more-testing.asc` | `da51150df994f05b445b9c07338192aa95e2565f` |
| `resources/external/2013-do-not-share-this-information-2.asc` | `79784afcc6beced6ad1c7502007a6b3f53bde3e7` |
| `resources/historical/cicada2014-stage09-first-jpeg-recovered.asc` | `0f24ac3146f6c91df23e211e8588f6e9b67b6dce` |
| `resources/historical/cicada2014-stage11-message.asc` | `e2b7382ac2cfb0adfe028cc063fc6048e0ad718e` |
| `resources/historical/cicada2016-4gq25-outguess.asc` | `a0d8bd2d73613e01cd8a2103d5721b2b998ee482` |
| `resources/historical/cicada2017-yEiTHhvF.asc` | `f455e72159fc9fea9e3d89df835468ea67fe3cf4` |

Canonical GP transliteration source: `resources/liber-primus/lp2-corpus.json`, blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`.

## Frozen ordinal comparison family

Before evaluating further semantic continuations, freeze the simplest ordinal readings supplied by the two alphabets actually in play, Latin and Gematria Primus. Charge both origins and both Latin directions:

| Convention | `[12,5,1,4]` output |
| --- | --- |
| Latin A1Z26 | **LEAD** |
| Latin A0Z25 | MFBE |
| Latin Z1A26 | OVZW |
| Latin Z0A25 | NUYV |
| GP0 transliteration | EOCUR |
| GP1 transliteration | JRFO |

A1Z26 is the sole member of this six-convention family that yields an ordinary English word. Among the four-letter chemical-element names `NEON, IRON, ZINC, GOLD, LEAD`, it is also the sole element-name hit.

That selectivity does not authenticate the chemistry step. The family is conditioned on a ROAD residue vector whose A1Z26 output was already known when Director #1724 was opened. More importantly, the element-name dictionary has no source selector in the checked Cicada material. Choosing the chemical sense of the English homograph LEAD and then choosing atomic number as the element property adds two semantic decisions after the word is visible.

Agent4's earlier fixed-receiver census remains useful for ROAD itself: among the charged authenticated four-rune targets and four Latin ordinal conventions, ROAD/A1Z26 is the only combination producing an English key word. That result charges the alphabetic convention. It does not charge the later chemistry dictionary.

## Decision

Director #1724 takes the negative fork.

- Preserve `[12,5,1,4] -> LEAD` as a constrained post-discovery checksum on the ROAD candidate.
- Preserve the exact equality `atomicNumber(lead)=82=(A,K)` as a reproducible arithmetic echo.
- Do not use `LEAD -> 82` to authenticate THE, ROAD, the packet selector, a state transition, or any later receiver.
- Do not search group, period, mass, isotope, symbol, or other chemistry properties without a new first-party clue.
- The separately reported p28/p50 geometry that now derives `(8,2)` without LEAD can support that selector on its own evidence. It does not retroactively source-authenticate chemistry.

This resolves the original uncertainty cleanly: the LEAD arithmetic survives, while the claimed selector semantics are retired.

Reproducer: `sims/lp2_p0_lead82_ak_selector_holdout_sft.cjs`.
