# Red119 SKY/UDP as a BASE29 delta-encoded gzip file: frozen original gate

**Decision (12 November 2026):** Neither original physical p3 nor p39 contains a literal gzip stream when its ciphertext *after* the red13-bracketed 119–121 red triad is interpreted by the one fixed BASE29 predecessor-step-to-byte transport below. The two original headers are `1052e2...` and `23b625...`, versus required gzip `1f8b08`. A same-length source-native gzip plant is completely reversible under the identical framing. **No unknown-page plaintext or authentic LP2 decoder has been recovered.** This excludes this exact file serialization only.

## Why this hypothesis was selected

The [original image and ink annotations](../resources/liber-primus/lp2-ink-annotations.json) contain just two three-rune isolated red spans, both starting at page-local rune offset119 and each framed by red thirteen-dot punctuation: physical p3 `[13,23,2]` and physical p39 `[27,5,15]`. The already solved LP1 GP29 Atbash sends them to `SCY` (GP spelling of SKY, where C represents K) and `UDP`. The historically preserved 2013 “knock on the sky” ICMP stage produced a gzip object; see the [offline ICMP reconstruction](2013-icmp-echo-packet-reconstruction.md). Cicada's signed 2013 TCP challenge independently documented BASE29 numerals and the worked `3301→3QO` example, although **it never instructs anyone to apply that radix to LP2 differences** ([authenticated-source record](../resources/external/2013-tcp-server-signed-source.md)).

The strong objection is substantial: neither source says that a red triad is followed by embedded file bytes, that the following GP runes are differences, or that 2013's gzip format applies to the 2014 book. The test deliberately makes one explicit, falsifiable combined choice, not a claim that these unsourced steps were intended.

## Locked inverse and original-data outcome

For each physical page separately, take only rune offsets 122 through the final rune. Set the initial GP29 state to the preceding last red rune at offset121. Encode every following rune as the *non-erasing* difference `d[i]=(C[i]-C[i-1]+29)%29`. Serialize the complete ordered digits `0..28` as **one unsigned most-significant-first base29 integer**. Convert that integer to a fixed-length big-endian byte string with width `ceil(log2(29^digit_count)/8)`, retaining any leading zero byte. No chunk boundaries, port guesses, altered clocks, cipher keys, parameter fitting, or additional transforms are allowed. The original digit count and initial rune permit exact reconstruction from bytes, including zero steps.

| Original input | GP29 delta digits | Zero differences | Byte width | First 16 bytes (hex) | Gzip header? |
| --- | ---: | ---: | ---: | --- | --- |
| Physical p3 after `SCY` at local119–121 | 95 | 2 | 58 | `1052e2f3ed41c367005213d06a39d2ae` | **No** |
| Physical p39 after `UDP` at local119–121 | 118 | 1 | 72 | `23b6257b5821076843c256c986339e8f` | **No** |

For both pages, the computed bytes restore all original post-marker delta digits, and the retained index121 restores all original post-marker runes exactly. A deliberately constructed gzip of independently solved p57 prose, stored at **the same exact 58/72-byte widths**, converts to valid base29 digit streams, reconstructs synthetic source-shaped GP29 ciphertext and decodes back to the identical gzip bytes and prose. That proves the format could have succeeded at both source lengths.

[Reproducible CommonJS SFT](../sims/lp2_red119_base29_delta_gzip_sft.cjs), using the canonical [original GP29 page arrays](../resources/liber-primus/lp2-corpus.json) and byte-pinned [red-span annotations](../resources/liber-primus/lp2-ink-annotations.json). The SFT fixes both full 16-byte prefixes to catch corpus drift.

## Cryptanalytic consequence

The original SKY/UDP clue remains a **provisional instruction**, and the 2013 packet payload remains a historically sourced gzip association. These two facts do not independently select a direct BASE29 delta transport. The tested readout fails the expected file magic on both separate, source-anchored page tails. No re-framing, reversed bytes, changed base, extra offset, XOR key, or compressed-file scan is warranted without a new source instruction. The [distinct #592 source-chapter base28→PNG test](lp2-base28-chapter-integer-png-transport-gate.md) is also negative; it concerns a different radix, input span and file signature.

A fruitful successor would require an independently contemporaneous command, file layout, or authorial hint specifying the exact byte framing/clock. A dated UDP packet from 2013–2016 with an executable command belongs to the separate source audit #587; no live probing is implied here.
