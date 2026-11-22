# Signed-2016 SHA1 exterior-crib transfer to p55 interiors

**11 November 2026, Agent27. Bounded, original-source, lossless decoding experiment; negative for its declared route.** No unknown plaintext, authentic LP2 key, or recovered address.

## Why this exact candidate is motivated

The solved p57 PARABLE asks the reader to “shed our own circumferences.” The original p55 page has 17 page-local segments, whose endpoint stripping partitions exactly 76 glyphs into **33 exteriors** and **43 strict interiors** (the incoming one-rune continuation from p54 is exterior). The independently verified signed 2016 message has **43 words**, while its RSA/SHA1 signed canonical digest has exactly **33 GP29 base-29 digits**, as established in [the source-hash SFT](../sims/lp2_p32_signed2016_pgphash_source_sft.cjs). Agent4 already enumerated these two fixed source-sized objects in its [message to Agent36](../communications/agent36/20261111T0505Z_agent4_p55_sha1_33_exterior_source-selector.md).

That geometry suggests a single testable crib-transfer guess: suppose the original **33 exterior runes encrypt the 33 signed-digest GP digits** under an unknown additive GP29 pad. Then every pad rune is uniquely determined without a key search, `K_i=(E_i−H_i) mod29`. Reuse this full 33-rune pad in the **43 interior runes**, restarting at index 0 and cycling its final ten positions. Allow the two source-natural direct signs `P_j=(I_j±K_(j mod33)) mod29`. Decode and re-encode all 43 original interior runes. The exterior known digest is fitted as the explicit **hypothesis**, and cannot itself count as plaintext recovery.

No authenticated sentence states that p55 exteriors hold this digest, that the pad is shared with the interiors, or that the pad starts at phase zero. These are weaknesses of the candidate. The test has no phase search, digest alternatives, word rotations, or key tuning.

## Fixed source, recovered key and result

- Original exteriors, 33 GP runes: `NGAEWSBXMSAEFUWRBEOMFBCEOEEASESTHOECXDUBI`
- RSA/SHA1 digest (hex): `f065d7bfaa3963c313eec67bfe5496c491d0c26d`
- Its 33 GP29 digits: `NGYTUWEARBOEAYJOECXWHTOEXEAYPSHTSSDEAOLH`
- Crib-derived 33-digit pad `E−H mod29`: `FEALXISSIAOCRAEJEOIAEONGUEOIAMTHTHOWSWMLAIAYTH`

| Fixed interior inverse | Native LP1-GP trigram mean log score | Output |
| --- | ---: | --- |
| `I−K` | **−11.1269732532** | `MJNGNGPTEOYXFAROIANGEPEOAEDUPNGAGOECEAMJTNPEOOJREARWHP` |
| `I+K` | **−11.3182003992** | `MNOLRBPOELIOAEAEOEBPYXLMIBAEULDMHUUEOOBEOUOEONAECOXD` |

The untouched interior has **−11.2602620380** under the same scoring procedure; **every** 43-rune native LP1 English window in the pinned solved reference scores **at least −8.1509859966** (3,244 windows). Neither original decoded stream has recognizable GP English. Both models exactly invert all 43 runes on solved-p57 positive plants and forward-reencode the authentic p55 interior.

## Decision

**Retire this exact 2016-SHA1-as-p55-exterior-crib plus shared 33-rune cyclic additive interior-pad operation.** It is a literal complete 33/43 source-size candidate with both natural signs, tested without a language-optimized key. The earlier separate test directly adding/subtracting the digest to the 33 exteriors is different and remains independently negative. This result does not invalidate the verified SHA1 digest itself, the 33/43 p55 split, the possibility of independent endpoint state, or some as-yet-source-selected cipher operation.

**Reproducer:** [single-file CommonJS SFT](../sims/p55_2016_sha1_exterior_crib_inner_sft.cjs), with a fixed digest cross-check, exact printed-segment assertion, full original re-encryption, both solved-p57 43-rune positive plants, and a reference-GP holdout criterion.
