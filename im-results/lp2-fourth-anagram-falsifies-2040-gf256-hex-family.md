# Fourth original scroll anagram eliminates the previously fitted AES-field HEX key

**Agent 4, 22 November 2026. New, source-constrained model discrimination; no original unknown-page plaintext recovered.**

The prior [finite 2,040-setting source HEX receiver](../sims/lp2_scroll255_hex_gf256_direct_receiver_sft.cjs) tested two historical GF(256) fields, RS polynomial **0x11D** times multiplier2 and AES polynomial **0x11B** times multiplier3, each against the original p49–p51 numerical table read as radix59 or conventional radix60, both GP29 pad signs, and all 255 nonzero initial field states. Only one configuration had matched the *three previously known repeated whole-word source pairs* in the 255-scroll-word/255-page8-rune registration: **AES-11B, radix59, negative difference sign, seed237 (0xED)**, giving GP29 original difference triplet **[8,18,14]**. This apparent unique seed was already deemed unverified by the original familywise comparison, and the full source output was nonlinguistic.

[Agent4's newly located fourth source pair](lp2-scroll255-gf4-radix59-untrained-anagram-fourth-equality.md) is a **nonidentical black/red word anagram**, scroll word88 **EO·X [12,14] black** and word179 **X·EO [14,12] red**. It was not included among the three original fitting word pairs. Their actual original p8 runes give a **fourth difference 25** (so the full original signature is **[8,18,14,25]**).

The exact **previously chosen AES seed237 decoder predicts [8,18,14,8]**, therefore fails this independent fourth constraint by **17 modulo29**. I then re-evaluated every one of the *same 2,040 already defined finite-field candidate keys*, keeping all source inputs and phase conventions unchanged and requiring the untrained anagram as a fourth equality. The exact four-equality match histogram is:

| Equalities correct / four | Number of candidate keys |
| ---: | ---: |
| 0 | 1791 |
| 1 | 233 |
| 2 | 15 |
| 3 | 1 |
| **4** | **0** |

The only 3/4 candidate is the old AES seed237. This **rejects all 2,040 earlier tested direct-field receivers as exact order-insensitive word digests for all four original source multiset collision classes**, conditional on the 255 scroll-word→p8 rune source registration. The independent prior **GF4 four-tap period255 / radix59** key remains **the sole 4/4** candidate among its own earlier 64 conventions. This distinction is meaningful, but **a four-pair coincidence cannot itself recover plaintext or establish Cicada author intent**.

The [reproducible Windows Node22 SFT](../sims/lp2_fourparikh_gf4_versus_gf256_2040_original_sft.cjs) reads the original GP29 source words and original byte panel, verifies the black/red anagram, recovers the exact original differences, and exhausts all 2,040 keys with a positive original repeat-class anchor. The full committed SFT ran against the original GitHub data and passed.

**Research decision:** Retire the AES-field **seed0xED** interpretation of HEX as a full four-multiset word digest, and the entire 2,040-candidate direct GF256 family, without further seeded “rescue” exceptions. The GF4/radix59 four-pair relation is strengthened *relatively*, while the missing ingredient is still a historically selected **nonlinear, permutation-invariant whole-word numeric law** or a different independently justified downstream decryptor. The source relation is evidence of a possible intended operation, **not a solved LP2 page**.
