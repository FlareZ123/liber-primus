# Complete-word p54–p55 SHED core as literal AES-256 key for the original numerical panel

**22 November 2026 · Agent16 · Director #2272 · Bounded original-input negative.** Source-visible **52 strict interior runes / 34 whole-word endpoints** across the complete 86-rune p54→p55 terminal window encode one 250-bit integer under the historically authenticated GP29 number convention. Zero-left-padding that literal integer to 256 bits creates a source-derived 32-byte key. A fixed original-input **AES-256-ECB** inverse on all 256 original p49–p51 numeric bytes yields high-entropy nonprose. No unknown p55/plaintext, key selection by the author or continuation is recovered.

## Source and operation

The original p54 page ends with a ten-rune fragment, and p55 begins with one completing `NG`; this forms **one eleven-rune complete word**. Correctly counting all seventeen terminal whole words gives lengths `[11,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. Discard the first and last symbol of each complete word, as p57's authentic **SHED OUR OWN CIRCUMFERENCES** text suggests. Keep the 34 removed symbols for exact original reconstruction, retaining the 52 inner GP digits in their printed order. The split exactly regenerates all **86/86** source runes; no original word carries are treated as two words.

One natural **integer** consumer is already historically motivated: Cicada explicitly used BASE29 in the 2013 round. Interpret the 52 GP indices as one big-endian base29 integer. Its actual value is **250 bits**, so left-pad to a full 32-byte AES-256 key:

`0300f516a85f52950f3ec2bddbf98c224b0684e1d31988c710f71996b1b7a1e1`

Test **one** literal modern-2014-available inverse: AES-256-ECB, no IV and no padding, on the complete **256 unchanged printed numerical-panel bytes** in source row-major base60 order. This is an explicitly provisional cross-page key interpretation; the author did not label p55 as AES key material, specify byte padding, authenticate AES as LP2's cipher, or say that `SHED` acts on this terminal 86-rune window instead of all words.

## Original output

[Original-source complete-key CommonJS SFT](../sims/lp2_p54p55_52core_base29_aes256_p50_sft.cjs) passed [Windows Node22, run45031338656](https://github.com/FlareZ123/liber-primus/actions/runs/45031338656). The source-bound result is:

| Original p50 AES-256-ECB output | Value |
| --- | --- |
| Plaintext SHA-256 | `c4cfd4d907cdc9425385ca209de17327eaae1bb73e2cd05d4dfb56100f273055` |
| First 16 plaintext bytes | `5aaaf64778e191075871fffd32b58d50` |
| Printable ASCII bytes | **102/256** |
| Longest uninterrupted printable segment | **5 bytes** |
| Empirical entropy | **7.0775 bits/byte** |
| Recognizable header / clear instruction | **None** |
| Exact source ciphertext re-encryption | **256/256** |
| Known original-source-phrase plant | **256/256** |
| Original 86-rune full word-regeneration | **86/86** |

No source word, embedded file header, authentic plaintext or keying instruction appears. The 256-byte AES output looks like ordinary wrong-key material. The exact cipher replay demonstrates a correct implementation of a *hypothesized* bijection; it does not validate a decrypting key. The key/IV choice is not author-authenticated and this test does not purport to decrypt p54/p55 as runic ciphertext.

**Decision:** retire this *one* terminal-52 BASE29 → literal 256-bit key → original-table AES-256-ECB path. Keep the **52/34** physical word partition and source-authored SHED command as separate facts. To solve #2272's actual terminal **86-rune** inverse, a first-party instruction still must specify a rune-value-changing reversible operation and a use for both 34 outer and 52 inner runes, with an untouched ≥100-rune downstream holdout. Do not expand the negative into a guessed padding/IV/KDF/mode grid.
