# LP2 30 red-dot short-code stream: original-source direct-codebook decision

**17 November 2026, Agent 8. Classification: deterministic, original-source necessary-condition exclusion.** The prescribed binary marker stream does **not** decode as a complete six-rune GP29 fixed-five-bit message, a complete five-character source base-60 fixed-six-bit message, or a standalone PGP/MIME Base64 unit. No unknown plaintext, intended direction/key, or new destination is recovered. The all-reordering obstruction is stronger than trying only printed order, but it applies solely to the declared raw-code polarity, fixed widths, and unsigned direct symbol indexes.

## Reader-visible input and extraction

The original LP2 source JPEGs contain colored large punctuation. The [source-aligned, image-adjudicated annotations](../resources/liber-primus/lp2-ink-annotations.json) record **30 red thirteen-dot marks and four red ten-dot marks across all 58 LP2 pages**. For a 30-event packet, use **only unsolved original physical pages p0–55** and only red 13-/10-dot marks, in page/position order. Exclude the separate **black** thirteen-dot mark at p7 rune194, and exclude solved p56's red ten-dot marker and red thirteen-dot marker, solved p57's red 13-dot and 23-dot marks, and ordinary/3-/4-dot punctuation.

This leaves **27** red thirteen-dot marks and **three** red ten-dot marks. Encode 13-dot=1, 10-dot=0, without sorting by content or moving dots:

```text
111111111111111111111001110111
```

The zeros are at one-based event ordinal **22** (p36 rune-offset99), **23** (p38 offset186), and **27** (p49 offset66). The register's physical location is independently reconstructible from the original scans. This is exactly the 30-bit input cited by the external [Round44 A1 study](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/SYNTHESIS.md), and the local SFT checks every event against the canonical annotations.

## Direct source-related short codebooks

The source's **29 Gematria Primus rune indexes 0..28** can be represented by unsigned five-bit codewords, although the original LP2 does **not** actually command that binary serialization. The source p49–51 numerical table uses **60 symbols** as radix-60 digits, conventionally ordered `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`; a six-bit codeword 0..59 could represent a digit, although that binary serialization is likewise *inferred*. The source-available 2012–2014 PGP armored messages use ordinary RFC4648-style Base64 as a distinct 64-symbol, six-bit transport; PGP armor cannot be assumed as an LP2 punctuation decoder.

| Test, exact marker order | Source codeword indexes | Result |
| --- | --- | --- |
| Six five-bit GP29 indexes, 13-dot=1 | `31,31,31,31,19,23` | Four indexes **31** exceed the allowed maximum **28** |
| Five six-bit base60 indexes, 13-dot=1 | `63,63,63,57,55` | Three indexes **63** exceed the maximum **59** |
| Five PGP/Base64 sextets, 13-dot=1 | `63,63,63,57,55` | Text **`///53`**; five Base64 sextets alone cannot encode whole bytes (length modulo 4 is one) |
| Reverse bit **polarity**, five-bit GP29 | `0,0,0,0,12,8` | Legal, but maps to **`FFFFEOH`** in canonical GP transliteration; no independently selected inversion or meaningful key |
| Reverse bit **polarity**, six-bit base60 | `0,0,0,6,8` | Legal **`00068`**, five digits, not a complete two-digit-per-byte table field |
| Reverse polarity, Base64 | `0,0,0,6,8` | **`AAAGI`**, likewise not a standalone valid Base64 message |

The inverted-polarity outputs are *forensic controls* which show what the missing source instruction would have to select. They are not decoded author messages. Reversing group bits, trying a cipher key, or assigning novel rune-index maps would be additional unselected operations and were deliberately omitted.

### Key-independent all-order capacity obstruction

The physical stream has exactly **three zero bits**. Every legal direct GP29 value 0..28 represented by five bits must have **at least one** zero bit, because the only all-ones codeword is **31** (invalid). Six nonoverlapping GP29 symbols therefore require **at least six zero bits**. The observed three cannot suffice **under any bit reordering or grouping into six complete five-bit symbols**. The fixed printed-order failure is a special case.

Similarly every legal source radix-60 digit 0..59 represented by six bits must contain **at least one** zero bit, because all-ones **63** is invalid. Five nonoverlapping radix-60 values require **at least five zeros**, which the source does not have. This excludes *every* permutation, reversal, or offset with all 30 bits used once, under this direct-code polarity. It does not disprove keyed substitutions, bit-complementing, nonuniform codebooks, variable-length encodings, deliberate padding, or non-message uses of the dots.

### Controls and intended solve route

The SFT roundtrips genuine clear p57's initial six rune values `PARABL` through GP29 five-bit packing and roundtrips five ordinary source base60 digits through six-bit packing. As a separate historical byte-transport positive, the ASCII digits `3301` roundtrip through standard MIME Base64 `MzMwMQ==`. A wrong-marker control that changes one genuine ten-dot marker into a thirteen-dot marker leaves only two zeros and strengthens the direct-codebook obstruction.

The original 2013 signed Base29/DH protocol supports *radix-29 integer representation*, and actual Cicada stages use both ASCII/PGP armor and other ordinary binary carriers. None of those historical facts supplies a 2014 instruction to treat these physical 30 markers as five- or six-bit codewords, select a reversed polarity, specify an octet boundary, or map them to an LP2 key. The external short-string recognizer's minimum useful length is not an instruction to invent a shorter codec.

## Decision

**Close this 30-bit short-message hypothesis under its natural direct GP29/base60 and standard Base64 receivers.** Its severe imbalance is a precise obstacle to those encodings, regardless of bit order. Retain the extracted marker topology as a source observation and revisit it only if independent Cicada-era evidence supplies a specific short codebook, symbol polarity, framing/padding rule, and named downstream consumer.

**Reproducer:** [`sims/lp2_dot30_historical_shortcodes_sft.cjs`](../sims/lp2_dot30_historical_shortcodes_sft.cjs); Windows-compatible CommonJS, `node sims/lp2_dot30_historical_shortcodes_sft.cjs`, only canonical original source JSON inputs, full source and positive assertions, no file writes.
