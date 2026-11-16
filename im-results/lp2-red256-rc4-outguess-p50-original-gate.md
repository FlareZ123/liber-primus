# RC4 stream-key consumer for the 256 original red/13-dot events and p50 table

**Agent9, 16 November 2026. Decision: neither frozen original-input RC4 consumer yields a typed output.** No unknown LP2 plaintext, historical key or SHA-512 preimage was recovered. This is a narrow test of a historically plausible operation with a fully visible 256-event input; **no first-party Cicada source instructs the player to use those events as an RC4 key**.

## Independent inputs and operation

The physical all-page original-image census identifies 225 genuine red GP29 runes and 31 physical thirteen-dot marks, including the black p7 mark and solved-page marks, for precisely 256 events. The source p50 field is 32 by 8 = 256 numeric bytes, printed across pp49–51. These are individually verified counts and original-image features; the numerical agreement alone does not authenticate a shared cipher register or event ordering. Historical Cicada used OutGuess, whose original implementation used an RC4-based pseudorandom generator initialized from password-derived MD5 material, making RC4 a motivated **consumer family** without selecting a key syntax or a transfer to LP2.

Before examining any outputs I froze the same page/offset event order used by the prior [direct XOR gate](lp2-grid256-allsecret-keyclock-original-gate.md#separate-256-event-red13-dot-tape-as-a-direct-p50-xor-pad): for each red rune use its source GP prime value (2…109), for each thirteen-dot component insert byte 13 before the rune at that offset. This yields exactly 256 bytes. Read the original p50 table row-major in the 32 printed rows. Apply standard RC4 KSA and PRGA, XORing the first 256 keystream bytes with the table. Test exactly two key serializations:

1. All 256 raw ordered event bytes, without extra password processing.
2. The 16-byte MD5 digest of those same raw event bytes, a source-era password-to-key analogue rather than a reconstruction of the historical OutGuess application.

The original event key begins hex `3517430711476b023567434f0d0d0d`; the MD5 digest is `29f9dbe84c8587adc11fd8050862116e`. Both variants have a full deterministic inverse and preserve all original table bytes. Exact round trips alone therefore provide no evidence of correct key selection.

## Full 256-byte original outputs

| Frozen key | First 16 output bytes | Printable ASCII | Unique output bytes | Complete SHA-512 |
| --- | --- | ---: | ---: | --- |
| Raw 256 events | `1985a3cf67c04bf5f7894bdb4089100b` | **85/256** | 160 | `258fadac77f178874aad943f7cb183d4b0f5e2f181469ae3b5a1a87e1667c8a0622ab151e1d6d5bdc6f4e740ab60c2298dd74372b34dbd17cd789412b0968b9f` |
| MD5(raw 256 events) | `4239dc29f435e7f6cb416f0262573b14` | **103/256** | 162 | `06c4f7b05d313810017e6b5b8e88a3e7c350e7b1efc676b14cec65be1e4550380e3e7e6bbbca740007b4331585123727eb63e4dc3b48ef44da62c1cd9f2fc720` |

Neither output starts with a common PDF, PNG, GIF, JPEG, ZIP, gzip or ELF magic header, nor forms contiguous readable text in the direct ASCII register. Neither SHA-512 digest equals the authenticated p56 hash `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`. The positive control plants an ASCII typed message under each key and recovers it byte-for-byte. The outputs were independently computed in a JavaScript original-input test and in a Python independent RC4 implementation with exact agreement on both digests.

## Research decision

Retire these **two specific** original red-event → RC4 → p50-byte XOR consumers. A generic claim that RC4 or the 256-event match has been excluded would overstate this experiment; dozens of missing source choices (alphabet, state, cryptographic operation, key provenance, event order, original register) could change output. Do not search arbitrary password spellings or RC4 drop lengths without a first-party instruction selecting them. A meaningful positive result would instead require a first-party key/serialization selector and an independently recognizable whole-message plaintext, file or p56 destination hash preimage.

Reproduction: [read-only Node22/CommonJS original-source SFT](../sims/lp2_red256_rc4_outguess_p50_sft.cjs), canonical `resources/liber-primus/lp2-corpus.json`, `lp2-ink-annotations.json` and `lp2-grid-256.json`. Source event count and original JPG census: [physical census](lp2-original-dot-punctuation-physical-census.md). Earlier distinct direct XOR negative: [original gate](lp2-grid256-allsecret-keyclock-original-gate.md#separate-256-event-red13-dot-tape-as-a-direct-p50-xor-pad).
