# LP2 confirmed small-full-stop BASE29 fixed-width byte transport gate

**Agent24, 15 November 2026. Original-image-audited finite negative; no unknown plaintext recovered.**

## Decision

The strict source-audited small-full-stop frame does **not** decode to a recognizable file or text stream under the frozen operation. The 138 confirmed four-dot diamond stops partition the 12,956 unknown GP29 runes into 139 fields when the final tail is terminated by end-of-input. Converting each field to its minimum-width big-endian byte representation produces 7,942 bytes, with no tested file signature at offset zero, invalid UTF-8, NUL bytes and only 38.0131% printable ASCII/whitespace.

This rejects the exact direct transport tested here. The same strict 139-field length vector also has no four-consecutive match in the checked-in historical source/register corpus; see [the strict source-crib gate](lp2-small-fullstop-source-crib.md). This does not identify a different cipher, key, nonlinear layer, moved-punctuation rule or unknown plaintext.

## Source-selected boundaries

The 175 marks in the original-image punctuation audit are **not 175 small full stops**. The audited morphology is:

| Original-image mark | Count | Treatment |
| --- | ---: | --- |
| Four-dot diamond stops | **138** (137 black, 1 red) | Use as confirmed small-full-stop boundaries |
| Single-dot ambiguous event (index 91) | 1 | Exclude from strict frame; test separately as sensitivity |
| Three-dot comma-form event transcribed as a stop (index 127) | 1 | Exclude; source morphology is comma-like |
| Four comma zigzags | 4 | Exclude |
| Large chapter/section marks | 31 | Exclude |
| Absent small event (index 125) | 1 | Exclude; no source glyph |
| Editorial p15 numeric-row entries (indices 57–60) | 4 | Exclude; explicitly nonphysical in original 32.jpg |

The 138 confirmed stops are exactly the \`stop_four_dot_diamonds\` class in \`resources/liber-primus/lp2-punctuation-identity.json\`, reproduced by \`sims/lp2_punctuation_source_audit.py\`. The 175 visible-mark total includes 138 definite stops, one ambiguous single dot, one comma-form mark, four comma zigzags and 31 large marks. The four p15 row entries and one absent small event are not physical marks. Two unmatched dot tokens in the derivative transcription are not promoted to stops without source-audit support.

The first confirmed stop is at global GP29 rune offset **154**; the last is at **12,597**, leaving a **359-rune EOF tail**. The first 12 field lengths are **[154,121,22,53,44,40,97,494,21,21,44,183]**. The complete 139-field partition sums to all 12,956 original runes without word, line or page resets.

This is distinct from the old 175-dot transcription run screen: its first 13-rune segment ends at a large chapter/section ornament, not a confirmed small full stop. The all-visible-punctuation affine gate also uses 175 mark boundaries; it is not a full-stop-only experiment.

## Frozen codec

For a field of \(n\) GP29 digits \(d_0,\ldots,d_{n-1}\), compute the positional integer \(N\) as the base-29 number with those digits. Choose the smallest byte width \(b\) satisfying \(256^b \ge 29^n\), then emit \(N\) as exactly \(b\) big-endian bytes. Concatenate the 139 field byte strings in original source order. No offset, alternate radix, endianness, compression, padding, key phase or message-specific length is fitted.

## Original result

| Measurement | Result |
| --- | ---: |
| Unknown GP29 runes | 12,956 |
| Confirmed full-stop boundaries | 138 |
| Fields including final EOF tail | 139 |
| First field | 154 runes → 94 bytes |
| Total byte output | **7,942** |
| First field's maximum possible first byte | **0x11** |
| Actual first output byte | **0x09** |
| Valid UTF-8 | **No** |
| NUL present | **Yes** |
| Printable ASCII/whitespace ratio | **38.0131%** |
| Tested offset-zero signatures | **None** |

Tested offset-zero signatures: GZIP, ZIP, PDF, PNG, JPEG, BZIP2, XZ, 7z, RAR, ELF, SQLite, ID3, OggS, RIFF, HTML and XML. The first field's mathematical bound \(N<29^{154}\) with 94-byte minimal width gives a maximum first byte of 0x11, already below GZIP's 0x1f and printable ASCII; the complete stream independently fails UTF-8 and the printable-content test.

First 64 output bytes (hex):

\`\`\`text
093ad731c61e124f374d5b804210ad3f3b436793ff357dc6315de29c0ee2988d755e5f7fa381cd7c7424bf8751313d062413dada9aeb826cb60a8ce7d775fc8
\`\`\`

## Positive controls and uncertainty

- **Same-geometry source-native plant:** cycle the 95 authentic p57 GP29 plaintext runes to 12,956 positions, partition with the exact 139 source field lengths, encode and decode each field. Every rune is recovered exactly. This validates the field arithmetic and segmentation implementation; the repeated plant is synthetic and is not a proposed LP2 plaintext.
- **Independent GZIP field/detector control:** six GP29 digits \`[25,23,6,15,3,24]\` encode to \`1f8b0800\`; decoding recovers the exact six digits. This is a field-level detector calibration, not a claim that the 139-field source geometry carries a GZIP file.
- **Ambiguous-event sensitivity:** include source-audit event 91 as an additional boundary. The resulting 140 fields produce 7,943 bytes, invalid UTF-8, NUL, 38.1594% printable content and no tested offset-zero signature. The negative is unchanged.
- The comma-form event, absent event, four editorial p15 rows, four comma zigzags and 31 large marks remain excluded. No unverified transcription-dot token is silently promoted to a full stop.

## Reproduction

Run from the repository root:

\`\`\`bash
node sims/lp2_small_fullstop_base29_byte_transport_sft.cjs
\`\`\`

The dependency-free Node 22 SFT checks the source transcription against the canonical GP29 corpus, the original-image punctuation-audit counts and event exclusions, the exact field partition, byte conversion, original and planted round trips, offset-zero format checks, and the ambiguous-event sensitivity case. The core arithmetic was also executed against the fetched canonical repository data in the current runtime. No historical key or unknown plaintext is recovered.
