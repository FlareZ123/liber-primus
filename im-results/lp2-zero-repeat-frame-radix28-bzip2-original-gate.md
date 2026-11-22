# Original LP2 zero-step packet framing: literal BZip2/byte readout

**Decision (Agent47, 18 November 2026): bounded direct original-source negative.** The authentic 2014 puzzle employed BZip2 in its distribution chain, and the unknown LP2 text has only 86 within-page repeated-rune transitions. A human solver could try interpreting these exceptional zero differences as *byte-packet boundaries* and the 28 other differences as a no-repeat numerical digit. On the complete original source, **neither of two public GP28 successor rankings** directly produces a BZip2 stream, recognized file header or obvious readable packet. This is a decision about one literal receiver, with no recovered unknown plaintext or key.

## Frozen source-level operation

Use the canonical 55 original rune-bearing pages p0–55 (**12,956** runes; physical p50 has no runes). For each page discard its first rune as a reversible predecessor seed. For every later rune pair:

- If the runes are identical, treat this **zero step as a frame boundary**. Preserve its location as explicit structure.
- Otherwise give the successor its rank among the **28 different runes**, either cyclically after the predecessor, `rank=(cur-prev-1) mod29`, or in canonical sorted GP29 order excluding the predecessor, `rank=cur-[cur>prev]`.
- For each resulting frame, treat ranks as **one base28 integer** and convert to byte array. Test both digit-reading directions, plus minimal-length and exact digit-capacity byte framing (the latter pads leading zero bytes). A source-selected BZip2 file should begin with `BZh`; also inspect standard gzip, zlib, ZIP and PDF signatures.
- As a stricter competing convention, concatenate all nonzero digits in source page order into **one 7,701-byte** integer-byte object, with the 86 exceptional zeros removed. Test both directions and byte framing.

This is a finite and deliberately narrow four-way frame readout per successor ordering. No guessed secret digit permutation, source-index offset, decompression without headers, postselection of boundaries or Vigenère layer was added.

## Exact original outcomes

| Original observable | Result |
| --- | ---: |
| Rune-bearing source pages | 55 |
| Original ciphertext runes | 12,956 |
| Original within-page repeated-rune delimiters | 86 |
| Resulting delimiter/page-framed runs | 141 |
| Empty runs | 2 |
| Nonzero successor digits | 12,815 |
| Longest digit run | 272 |
| Framed readouts with a recognized header | **0** |
| Framed byte readouts ≥16 bytes with ≥85% printable ASCII | **0** |
| Whole-tape interpretations | 4 per successor convention |
| Whole-tape length in each convention | 7,701 bytes |
| Whole-tape recognized headers | **0** |

The whole-tape forward/cyclic 16-byte prefix is `3a228883a4ab3fe0a6047a24839f2fb7`; the whole-tape forward/sorted prefix is `1776018ff6a0dc91f5337277d40dbe92`. An exact synthetic **`BZh9` prefixed** byte object is converted to radix28, integrated into a GP29 no-repeat cipher tape, and recovered byte-for-byte under each of the two rank conventions. Both positive controls find the BZip2 header.

**Scope:** this rejects only directly recognizable per-frame/whole-stream binary encoding under these two predecessor-excluding rank orders and original event boundaries. It does not reject raw compressed deflate/BZip2 interiors, a changing secret alphabet, inserted parity symbols, a different framing carrier, or unencrypted original GP29 plaintext. The original source itself does not instruct zero-step delimitation. Do not multiply speculative codecs absent a new independently visible opcode, key or original plaintext.

**Reproducer:** [single read-only Node22 CommonJS SFT](../sims/lp2_gp28_repeatframed_bzip2_header_sft.cjs) using the committed source JSON, with [Windows GitHub Actions PASS 44328157721](https://github.com/FlareZ123/liber-primus/actions/runs/44328157721). This bounded test is independent of the previously documented word-delimited GP29↔GP28 integer model and COBS-29 source packet inverse.
