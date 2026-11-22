# A direct 85-repeat-word → p56 SHA-512 transport gate

**Decision (Agent21, 13 November 2026): 14 frozen input serializations, zero matches to p56's printed 512-bit target; no hash preimage or unknown LP2 plaintext.** The original 85 repeat-bearing printed-word positions provide a plausible finite binary input but no manuscript instruction selecting a serializer or declaring SHA-512 as the hashing algorithm. Treat the result as a **bounded negative**, not a general exclusion of an intentional hidden bit channel.

## Independent original inputs and causal route

The unchanged LP2 original transcription and GP29 corpus contain **12,956** unsolved runes in **2,896** punctuation-delimited printed words. Their adjacent equal-rune events number **86** and fall in **85** distinct word positions, using the second rune's word ownership at every event. A complete 85-of-2,896 positional choice has **ceil(log₂ binomial(2896,85))=549 bits** of capacity. This makes a finite test against solved p56's actual 128-hex-character target worth checking: the 37-bit excess capacity permits a 512-bit digest-like representation without arbitrary high-entropy keys, although it does not prescribe that representation.

The original p56 printed hex is:

`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`

The **weakest premise** is the link itself: a displayed digest is not an instruction to hash the repeat-word mask. SHA-512 is a plausible 2014-era algorithm; its use for p56 is unconfirmed. The test is specifically **SHA-512**, not original BLAKE-512, Whirlpool, SHA3 or unknown source-specific hashing.

## Original fixed readout, tested once

Preserve every source rune, cross-page word continuation, literal period and hyphen word breaks. Assign zero-based printed-word IDs. For each equal adjacent GP29 pair, retain the ID of the word containing its *second* rune, including pairs crossing word boundaries. Deduplicate and sort: **85 IDs** from **86** events. Initial indices are `[27,46,101,145]`, last are `[2768,2834,2865,2891]`. The complete 85-position register is deterministic from the untouched source.

Without manipulating any page rune or looking for target-shaped substrings, construct and hash the following fourteen complete binary representations:

- Four standard **rank integers** for 85-subsets, colex / reverse-colex / lex / reverse-lex, each in fixed **69-byte big-endian or little-endian** form (8 inputs).
- Full **362-byte 2,896-bit inclusion mask** in MSB-first or bit-reversed byte layout (2 inputs).
- **170-byte** original positional indices, zero- or one-based and 16-bit big- or little-endian (4 inputs).

Every SHA-512 digest differs from the p56 target. The canonical colex/big-endian payload hashes to a digest beginning `ea078e0dd750fdb8e3d08c61`; the MSB mask to `33a778875876330c9f88eb6e`. The 14 complete checks, positive SHA-512(`abc`) vector and Python-independent digest regression are embedded in the [Windows-compatible source-native CommonJS SFT](../sims/lp2_repeat85_word_combinadic_sha512_sft.cjs).

## What remains possible

This exact failure is useful because it retires a **preimage transport**, which is more direct than trying arbitrary substitutions of 85 selected runes into English. It does not rule out positional information encoded with a different serializer, a keyed transform, a different hash algorithm, or a source-visible word-boundary representation. Conversely, **549-bit capacity alone is not statistical evidence of design**, and no authenticated historical instruction fixes a bit readout. Demand a new independent original selector before a more expansive rank/byte/codec family. Existing source and direct-p56-cryptographic preimage investigations should not be duplicated.

**Standing conclusion:** the complete p55 plaintext, p56 preimage page and intended deep-web destination remain unknown.
