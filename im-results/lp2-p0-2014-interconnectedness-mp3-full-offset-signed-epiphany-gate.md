# Full-original 2014 Interconnectedness MP3 byte-offset key search against the p0 2016 signed crib

**Agent43, 23 November 2026. Original-source direct key alignment negative; no new LP2 plaintext or key.**

## Distinct, finite human solve-path hypothesis

The original signed 2014 *Interconnectedness* MP3 (Git blob SHA-1 `09fe068192b76a3697c47ec1d604b527703db798`) has **6,651,873 raw bytes**. A Cicada 2013 stage used real bytewise XOR and historical 2014 steganographic layers reused literal binary audio, so these are independently preserved potential key bytes. Original physical LP2 **p0** opens with **eight red runes, a red word separator, then five red runes**. The original 2016 signed message has an exact **8+5-GP29-rune** contiguous phrase, **EPIPHANY SEEKS**, under the historical GP29 spelling `EPIPHANY SEECS`. The plaintext relationship is a plausible **crib hypothesis**, not an authenticated decryption; prior direct periodic and historical-F cipher tests did not recover its surrounding text (see [p0 source-title gate](lp2-p0-2016-epiphany-title-crib-gate.md)).

Unlike the earlier [2014 audio direct-byte test](../sims/lp2_2014_interconnectedness_bytekey_sft.cjs), which used only byte offset0 and the MP3 ID3 boundary, this experiment asks the sharper **known-plaintext key-recovery** question: *does any contiguous section of the entire preserved raw audio act as a direct additive GP29 keystream whose first 13 digits transform the original p0 red rune span into the independently nominated words?* The offset is **exhaustively searched**, no truncated MP3 window, sampled offset, lexical scoring, or selected key.

## Exact frozen receiver

Original ciphertext GP29 p0 red span, indices 0–12:

`[15,8,18,3,6,19,27,0,15,26,18,21,5]`

Conditional plaintext GP29 string `EPIPHANY SEECS`:

`[18,13,10,13,8,24,9,26,15,18,18,5,15]`

For **every 262-byte window of the original audio** (the unchanged p0 has 262 ciphertext runes), start at each unsigned byte offset `0..6,651,611`, inclusive, a total **6,651,612** offsets per mode. For each, define its direct GP29 key symbols by either (a) `byte % 29` or (b) `floor(29*byte/256)`, and plaintext by `P=(C+sign*K) mod29`, signs `-1,+1`. This is the complete set of those four **fixed** raw-byte-to-GP29 additive modes; no feedback, decryption phase reset, alphabet relabeling, PRNG or cipher-dependent skip rule is available from the source.

The read-only [original-input single-file CommonJS reproducer](../sims/lp2_p0_2014_interconnectedness_mp3_full_offset_epiphany_sft.cjs) checks audio length and Git blob SHA-1, source p0 GP indices, and exact GP29 signed-phrase transliteration before searching. A genuinely independent positive control encrypts the crib into the unchanged p0 first13 positions using original audio **at offset1,234,567**, then scans without knowing the winning position and recovers it uniquely.

## Actual original results

The [Windows Node.js22 native-source workflow 45158979012](https://github.com/FlareZ123/liber-primus/actions/runs/45158979012) passed. It verified the exact **6,651,873-byte / Git SHA** original MP3 and ran every eligible offset, with the following observed comparison:

| Byte-to-GP29 projection | Inverse sign | Original offsets agreeing at first rune | Longest agreeing consecutive crib prefix | Full 13-rune source crib matches |
| --- | ---: | ---: | ---: | ---: |
| `byte %29` | −1 | 201,955 | **4** | **0** |
| `byte %29` | +1 | 231,509 | **4** | **0** |
| `floor(29*byte/256)` | −1 | 204,233 | **4** | **0** |
| `floor(29*byte/256)` | +1 | 237,020 | **4** | **0** |

A complete scan tests **26,606,448 mode×offset combinations** on the original input. The best four-rune prefixes occur at byte offsets **49,109**, **522,336**, **1,375,546** and **89,074**, respectively; no longer prefix exists in these modes. By contrast, the planted original-audio positive yields **exactly one** full match and longest prefix **13**, at the independent offset **1,234,567**.

The 2016 phrase and p0 red 8+5 layout remain conditionally interesting, but **the actual MP3 bytes cannot provide their first 13-key values under any direct constant-offset, additive, whole-byte projection tested**, irrespective of a later paragraph scorer or hidden-text-language model.

## Decision and limits

Retire only this exact **raw-MP3 contiguous-offset → GP29-byte projection → additive p0 EPIPHANY SEEKS** key-alignment route. There is no match from which to derive the remaining 249 p0 key symbols. This does **not** reject the suggested red-phrase crib itself, the historical audio as a possible other-language key carrier, fractional-duration audio clues, a keyed steganographic payload, a nonadditive original cipher or the original 2016 message as a word map. No creator-authenticated instruction selects these four key laws. Do not rescue the negative with arbitrary byte spacing, bit shifts or cipher layers without a new independently identifiable source selector.
