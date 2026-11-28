# P49–51 two-character byte transports: exact source-codebook ambiguity

**Status: original-input mathematical constraint; no unknown LP2 plaintext or creator-selected radix/receiver. Original-layout gate #1632 independently source-selects the top-left, left-to-right, top-to-bottom row-major 256-cell sequence; the mirrored p50 trees additionally source-select the horizontal column reflection `c→7−c`. Numeric codec/address origin and consumer remain unselected. The 256-cell panel is compatible with a period RAND 256 interpretation but does not establish it; the literal full-grid OutGuess receiver is rejected below.** This resolves specific source-typing decisions, including the ambiguity between two *uniform-byte* source grammars and the exclusion of a literal historical finite reciprocal-table grammar. It does not establish that the field is made of bytes, identify the cryptographic role of its values, or exclude a historically specified nonuniform encoding.

## Observable source and competing explanations

The untouched original images `resources/liber-primus/{66,67,68}.jpg` contain the physical LP2 p49–p51 table: **32 rows ×8 two-character cells**, laid out 10|13|9 rows. The independently image-audited tokens appear in `resources/liber-primus/lp2-grid-256.json`; the derived `byte_rule` and earlier `base60-grid.json` filename reflect a conventional numerical hypothesis rather than an authored instruction. The 256 printed positions contain **161 distinct token spellings**. This alone rules out interpreting the table literally as a 256-entry permutation of all different bytes, but leaves a byte stream, repeated-value lookup table, pointer field, symbolic message and other types open.

Two historically discussed byte grammars use the identical printed tokens:

* **Conventional radix60:** digits `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`; each unsigned byte 0..255 is printed in exactly two digits.
* **Drop-lowercase-f radix59:** delete just `f` from that alphabet and print each unsigned byte 0..255 in exactly two digits. This is a proposed alternative, **not** a confirmed period convention.

Their byte-support sets each contain exactly 256 strings. Exhaustive enumeration proves

```text
base60-only:  0f  1f  2f  3f
base59-only:  4G  4H  4I  4J
intersection: 252 two-character strings
```

**All 256 printed source cells lie in the 252-token intersection.** There is no printed test case supported by only one of the two codebooks. The source's first cell `3N` decodes to 203 (base60) versus 200 (base59); distinct numerical readings do not supply an independent ground-truth value.

## Exact identifiability result and scope

Suppose each of the 256 source cells was produced by an independent uniform random byte from 0..255, and then encoded by either grammar. Under either grammar, **every source-observed token has probability 1/256**, so the complete unchanged printed tape has identical pointwise likelihood `(1/256)^256` under both models. The full-data likelihood ratio is exactly **1**, regardless of repeated values or row order. No post-hoc histogram/entropy score of these same printed bytes can create evidence between these *specific* models with the full tape already observed.

The equivalence is also algebraic for unconstrained downstream byte lookup functions. The 252 shared spellings induce a one-to-one map between the corresponding base59 and base60 integers; the four unused inputs and outputs can be paired to form a complete **256-symbol permutation T**. Thus on every original cell `decode60(token)=T(decode59(token))`. Any decoder class allowing arbitrary secret alphabet relabeling can absorb T and will produce the same outputs and forward replay under both interpretations. This equivalence **does not** extend to a separately authenticated fixed arithmetic, byte serializer, key schedule or other operation that is *not* closed under arbitrary relabeling.

The standalone [CommonJS test](../sims/lp2_p50_radix_codebook_overlap_sft.cjs) enumerates both entire codebooks, verifies every original printed cell, constructs the complete byte permutation T, tests all 256 round trips and publishes a row-major source digest. It also uses the eight discriminating strings as positive rejection controls. No search for fluent LP2 output is involved.

## Direct lookup-box classification (Director #2568)

The same source-exact 256 tokens also give a stronger exclusion of the direct lookup interpretation, independent of row/column ordering and of the two surviving radix choices. Using the independently adjudicated `lp2-grid-256.json` original readings, the multiplicity histogram is:

| Number of occurrences of a byte | 0 | 1 | 2 | 3 | 4 |
|---|---:|---:|---:|---:|---:|
| Number of byte values | 95 | 92 | 49 | 14 | 6 |

The base60 range is 0–255; the base59 range is 0–251. Both have exactly 161 distinct values and 127 equal-value unordered pairs. For example, the original token `33` is at zero-based printed positions 7 and 14 (p49 row1 column8 and row2 column7). Thus any deterministic token-to-byte relabeling retains at least 95 excess duplicate positions. No inverse permutation exists; changing order, reversing rows or bijectively relabeling values cannot repair it. AES S-box/inverse and all bijective byte substitutions are excluded without comparing particular arrays.

**Additional algebraic exclusion:** any full-domain affine map F₂⁸→F₂⁸ of rank r has exactly 2^r distinct outputs and constant nonempty fiber size 2^(8−r). The observed 161 is not a power of two, and its nonempty fibers have sizes 1, 2, 3 and 4. This excludes *every* linear or affine eight-bit lookup, including conventional CRC-8 byte tables (fixed initial state, reflection and constant XOR do not affect the argument), even after arbitrary reordering of input indices or bijective output relabeling. This covers singular CRC choices too. For the familiar uniform-iid byte null, expected distinct values are 162.0071 and expected equal-value pairs 127.5; the observed counts are close to those expectations, not evidence for a particular cipher or for randomness.

The existing [SFT](../sims/lp2_p50_radix_codebook_overlap_sft.cjs) now prints exact missing byte lists, multiplicities and collision totals for both codebooks. The arithmetic was executed in the connector runtime against the source JSON; no new CI run is required or claimed. No direct standard-table inverse or affine lookup can be the consumer. Nonbijective nonlinear functions (for example as part of a larger reversible construction), byte ciphertext or context-dependent registers remain possible. No authored receiver or unknown plaintext was obtained. Since the permutation prerequisite fails, no specific standard-table comparisons or fitted transforms are warranted.


## Source-selected cell grammar decision (#3103, Agent11, 27 November 2026)

This gate reconciles a stale synthesis contradiction. The original-image traversal decision in [the dedicated source-layout audit](lp2-p49-p51-rowmajor-source-layout-gate.md) is positive: p49 prints 10 complete 8-cell rows, p50 13 and p51 9; the two page seams fall after cells 80 and 184, both at row boundaries; p50/p51 carry no restart heading; and surrounding rune prose fixes ordinary left-to-right, top-to-bottom page reading. Thus the physical sequence **does** select the top-left printed cell `3N` as the first consumed cell and then canonical row-major order. A global column-major reading would require 23 physical page transitions, serpentine order 31 unmarked line reversals, and right-to-left order contradicts the surrounding line direction. What remains unselected is whether a later numerical *address* names that first cell 0 or 1.

The p50 mirrored trees independently select the involution `c→7−c`; they do not override the ordinary sequence or say when a decoder should apply reflection. Treat reflection as a source-selected operation available to a receiver, not as a second traversal.

The numerical and output layers still fail the authored-source gate:

1. **Codec.** Earlier p33 cuneiform gives an authentic same-manuscript reason to prefer conventional sexagesimal/base60. Contemporaneous May 2014 solvers also reached a base60-byte interpretation. But #1968 established that the scans contain no digit legend, byte label, zero convention, or instruction forcing the unused lowercase `f` into the alphabet; every printed token is simultaneously legal under the drop-`f` base59 alternative. The exact tape therefore cannot authenticate one integer stream by itself.
2. **Historical command syntax.** The signed 2013 TCP specification authenticates BASE29 and `RAND n`, but BASE29 is a different explicit alphabet and RAND emits decimal byte lines. No surviving first-party source serializes `RAND 256` as these two-character cells or hands such a response to an LP2 consumer.
3. **2014 Stage10/Stage11.** Stage10 authenticates three magic-square input fields and a submission workflow; Stage11 delivers the LP2 onion/images. Neither defines a 32×8 parser, table address rule, row reflection consumer, key schedule, or output type. The later participant `sexagesimal.bin` is evidence for a contemporary human interpretation, not a creator-issued serializer.
4. **Candidate receivers.** The exact five-numbered-passage locator is a fully specified analyst construction, but the historical 2013 first-occurrence book-code transfer contradicts 153/256 frozen addresses and only 28 symbols survive. Direct lookup-box, affine lookup, literal full-grid OutGuess password, direct p56-digest preimages, and other source-pinned simple consumers in this report are already negative. These failures do not select a replacement output grammar.

**Decision:** the original artifact now supplies two reliable structural operations—canonical row-major sequence from the top-left cell and horizontal column reflection—but still does not supply a unique numerical codec/address origin or full typed receiver. A new cross-gate observation does survive the radix ambiguity: because both candidate grammars are ordinary positional encodings beginning with digit `0`, the 60 printed leading-zero cells are exactly the **one-digit/high-digit-zero** class under either codec (`value<60` or `value<59`). The independently observed equality enrichment therefore types one binary table state without choosing most exact byte values. A nested source-field class now gives an exact exception: the five printed `0[0-9]` cells decode identically under both grammars as values 0,4,5,6,0 and cover 10/86 repeats; this `0D` class is the strongest of the pre-existing first-digit×D/U/L bins and is uniquely maximal at source phase 0. Thus the radix ambiguity does **not** block this small-integer control state, although it still blocks general table arithmetic. [Small-decimal repeat gate](lp2-p50-small-decimal-repeat-gate.md). The source-selected tree reflection is an independent negative control for the gate address: reflecting the five `0D` coordinates gives only 1 repeat in 252 opportunities at source phase versus 10/251 literally; conditioned on the 11 union hits, direct-side concentration has exact upper tail 0.00534. This sharpens the earlier traversal decision: use ordinary row-major coordinates for this state signal, while reflection remains a separate unbound operation. This remains insufficient for a reversible decoder, and an independent repeat-rate sender keyed only by that state fails held-out T7 sharply. [Joint p50/T7 gate](lp2-p50-one-digit-t7-joint-gate.md). Retire untyped table-consumer searches; a successor must bring a source-selected consumer or a stateful law that explains both the period-256 high-digit gate and T7. No new broad cipher trial is licensed by #3103.

## 2013 RAND 256 interpretation and literal OutGuess receiver gate (Agent3, 26 November)

The authenticated [2013 TCP protocol source](../resources/external/2013-tcp-server-signed-source.md) defines `RAND n` as returning `n` random integer values in 0–255, one decimal line per value. The original p49–p51 panel has exactly 256 two-character cells. Under the conditional base60 reading, those cells form 256 bytes; their multiplicity histogram (95 values absent, 92 singletons, 49 doubles, 14 triples, 6 quadruples) is close to the uniform-byte null (expected distinct 162.0071; observed 161; expected equal pairs 127.5; observed 127). This makes a `RAND 256` interpretation historically recognizable, but not established: the protocol's output is decimal lines, not a two-character base60 serialization; all printed tokens remain compatible with both base59 and base60; and no surviving authenticated `RAND 256` response is known. The two preserved three-byte RAND samples do not occur contiguously in the table; the one-byte value 179 occurs once, which is not discriminating.

A single downstream receiver was tested rather than opening a cipher sweep. The candidate password is exactly the 512-character concatenation of the 256 image-adjudicated tokens in printed order across p49, p50 and p51, with no separators. This is the literal visible string, not a hash, radix conversion, rotation or fitted key. It was supplied as the password to pinned OutGuess 0.4 revision `24810e14327c2bbeedeaadd3e24491f2a4425c02` against all 58 original LP2 JPEGs (repository scans 17–74), using [the existing keyed probe](../sims/outguess_lp2_keyed_probe.cjs) and [the manual workflow](../.github/workflows/agent3-p50-full-grid-outguess-key-manual.yml).

**Control and result.** A same-key positive plant on original scan 17 round-tripped the exact payload `P50_FULL_GRID_KEY_CONTROL\n` (`cmp` passed), establishing that the 512-character password is accepted and the extractor works. The full-book run nevertheless produced 58 header-consistent 2,871-byte candidate streams and **zero recognizable payloads**. The synthetic no-payload control also passed the same header-consistency heuristic (12,091 bytes, zero recognizable payloads), so `headerConsistent` is not evidence of a hidden message. The original-page candidates share seed 64709 and identical first/last 32-byte fields; their high-entropy bodies are not recognized as text or a standard file. See [the completed run](https://github.com/FlareZ123/liber-primus/actions/runs/45907349119), job `140207165305`, artifact `15158501720` (SHA-256 `d9e4fbfb71511da511d56271757c8e7c1b1fa25b74a7fefee5f6345241cdd460`).

**Decision:** retire the exact literal full-grid OutGuess-password receiver. This does not prove that the 256-cell table is not a random-byte block; it shows that this source-literal password does not recover a recognizable payload from the original LP2 JPEGs. The `RAND 256` interpretation remains a hypothesis without a selected byte codec, authenticated response or downstream consumer. Do not extend this into arbitrary hashes, encodings, rotations or other stego passwords absent a new period source selector. No LP2 plaintext or authentic key recovered.

## p56 digest preimage gate for p49–p51 source material (Agent3, 26 November)

Because the adjacent solved p56 page prints a 128-hex-character digest, the p49–p51 material is a natural, tightly bounded local preimage candidate. The exact target is `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`. Seven direct source-grounded representations were checked under SHA-512 and community-reported Whirlpool: the three original JPEGs individually, their bytewise concatenation in release order, the p50 table as 256 base60 bytes, the same cells as 256 base59 bytes, and the literal 512-character token stream. No page reordering, separators, whitespace normalization, or other serialization sweep was attempted.

| Candidate | Bytes | SHA-512 | Whirlpool |
|---|---:|---|---|
| p50 table, base60 bytes | 256 | `bbb14b9db89b0a55fd15e08bcc82238b397bcdaffa43a0bd8463838e69ee6bf13b6a1e36216dd83d159484979e5497d6c2675e791e6e9df7d64ce1b2020b3f20` | `3e0e1becc4aa7a0801c36ce0e528a621d6dd8a5c3d225adc3760a6516da40abd13293283af7c024c67b501092666bcd0ecca02ae36ef5e5a7a2f5b62bd4b4af3` |
| p50 table, base59 bytes | 256 | `ebe4b796f29535cd317ce578481c83b82eff3b109019de3dd953c9d67eb4f1e33e4c36ab437b312681774f8e8eda14f3d80ea46b88912ba7e2b484ab0fae4030` | `325dcbe306b6ee5d4c192ac1addabf1b21533407939ea10d65053cb9970eb7f054a74aa15529c3b012660278c241b4fa84dad9dd45dcaa6ccc31756219313bd6` |
| literal 512-token string | 512 | `bf34f96ceec6fe264b35d50b092e77568c3a613cd30a571ef09309cdc1a0a978a486e684508df4060401bfcd16fd2b09dcbdcb0b3bdc04edb8c0fcf166c8d4ca` | `38fb988d943b45ad5ce557b50f34e23d0e73b804aa6a135e171d6c1fed030233820619d2bcf9691bff6d889fe13fd96c32b8a6fc20c88c69d458db3f894ec218` |
| original p49 JPEG (66.jpg) | 651504 | `f35bdf53a0c6a4f62176f119e1f20c46cd818570ce77e3c7dc3a28e7d0b3b19e64a7214a2e57060a9132338bb0df509dab0fa01f2989187d054ab0aeedd43b1b` | `a4b8eedac6847d715d42fb0ae7397441e5da6af256c16d985513bdd6aa5572176481d609cd8f971cc0f099d86365f558a1cceefb4315bf414e9f698513c508a7` |
| original p50 JPEG (67.jpg) | 581983 | `b5fd899ad2cba61827b3905c86cd91d9d442bd071a9547540c8307be6039aa63262bd078b2226aef8db91c2b184b16e37b7453ad0cd8b89bfd28d0e69a72124e` | `a4f0180c4d4aca0b60c8f4b03c73caa0ee1b5ff066d550e58a7cf71f1efd74d84d628a8327600dce410bcb94e2157194e637329eaca3e6963dd4db05bcb497e8` |
| original p51 JPEG (68.jpg) | 661727 | `dc13d7b5289c9c67e2780b3742e1e8a43baa23e24e672607e077096525c32bd6c5e7020226fb86eb38498b524979ace851ed79b3534c403f5e6cb465810de316` | `85ff40ab5d907c1a09fab7031e812e26911f77a23f1f9c957e3e1d35ae97cf1c3ee760ff5517bdfc1d9c9bba3bce243e6bfa9e4d7ee48c2a3fb78ebd9da2a92b` |
| p49–p51 concatenated JPEGs | 1895214 | `83251803a614098cec506a13410c92ac866f8a0816ea96cdd8d7e468a56220fb60c3b54ad63bafdf252dc1917748b257ea467b1aa5c46f1bab87057943069782` | `6f3e403c766e2e6b6bbae749dd511c74dd79208cd763a53f7c5e26398a35403b9edfeb6b4a41eab720773ddfda632b15c12688b184c07dacaf462bc21b01d247` |

All 21 comparisons fail across SHA-512, Whirlpool and BLAKE2b-512.

A third 512-bit family, BLAKE2b-512, is named as a candidate in the secondary [Dukotah key-hint synthesis](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/KEY-HINT-RESEARCH.md). Applying that fixed family to the same seven exact candidates gives another **0/7**; this is a bounded candidate check, not evidence that BLAKE2b is the intended algorithm.

| Candidate | BLAKE2b-512 |
|---|---|
| p50 table, base60 bytes | `8d5fea0ca5bc463bf741480cd8262765284db064a08ded4256725fc7361d570fdc71e68ad4f1adfa18ad0d4b137d6302df6c1d726308deab69009f313ac0f18c` |
| p50 table, base59 bytes | `f2b3151ad93a26fd31a94b9d71ee40a15c87f57297547e898c55b83fe468090b7d3eb8451b99f5caa07d09a07356eccb9084a4dda6a40aa3280e1484a7e6df80` |
| literal 512-token string | `6ebe0f319cf57cbc0ed8f49c280521c4c753f2d45651e3801eda8a96918c4b3339a195f4083bc2a294a904265b4a547545c6ad97be35206b3ee2e80c699a33ce` |
| original p49 JPEG (66.jpg) | `955e406a9c298ed86fddfbeca062b32dbeb883d5d0b33a752237ea5ffab70dfb1790be8a49461874fe0017f74404ae4a98788eebead6f95157c0609fd8ff8ca5` |
| original p50 JPEG (67.jpg) | `c058008906e935f4175a1ba65e4c646fa22ad40f72412517a3babd1ca4c6b589ed8b4f93dd3577c1da90c758c67529eb60d5a113c1e39765ab450c5d141c0add` |
| original p51 JPEG (68.jpg) | `750fc13c1aac351a9ea8df7fd29dda6f32c5e29d33448be4416770b7235c048e792c377717e8551cde9e2bec94e817083016391230d2b327a2903ee940ca95b0` |
| p49–p51 concatenated JPEGs | `50b85d442d8ed29d05c0e646607095425cabd3e211b140d1dc5fbae8592713dfd46d9d26ed09ed3a0db8d3345ad1826e98a0a323f8b4cd16efb2aac67d410c79` |

 The p50 table is not the direct SHA-512/Whirlpool preimage in any of these exact forms. This does not identify the intended deep-web page, choose the digest family, or exclude a different source-selected external object. Reproduce with [the standalone preimage gate](../sims/lp2_p50_p56_preimage_gate.py). No destination or plaintext recovered.


### LP1 05.jpg reversal transforms against the adjacent p56 digest (Agent11, 28 November 2026)

A source-derived follow-up now closes the obvious reversal loophole in the direct preimage gate. Original LP1 `05.jpg` demonstrates three concrete file/data operations without inference from LP2 output: its post-EOI trailer contains a nibble-swapped hex payload whose decimal cells are digit-reversed, followed by an exact byte-reversed JPEG. The p33 cuneiform values 1033 and 3301 independently form a decimal-reversal pair. Applying only those demonstrated transformations to the p49–p51 object therefore has a causal historical basis; no arbitrary encoding sweep is needed.

For each of the two surviving 256-byte interpretations (base60 and drop-`f` base59) and for the literal 512-character token stream, test **whole-byte reversal**, **per-byte nibble swap**, and their composition. For the literal stream also test **reversing the two characters inside every printed token**, the direct analogue of decimal digit reversal. These give ten transformed table/string candidates. LP1 `10.jpg` independently demonstrates a second container operation: its first JPEG is followed byte-for-byte by the complete standalone `11.jpg`, `12.jpg`, and `13.jpg` files. Compose that authenticated concatenation precedent with the `05.jpg` transforms on the already-tested p49–p51 JPEG concatenation: reverse the whole 1,895,214-byte object, nibble-swap it, compose those two, or reverse each constituent JPEG before concatenation (with and without nibble swap). These are five additional fixed candidates. SHA-512, Whirlpool, and BLAKE2b-512 give **0/45** matches across the 15 new source-demonstrated transforms. Combined with the seven exact untransformed candidates above, the direct local preimage screen is now **0/66 candidate–algorithm checks**. The OpenSSL-3 Whirlpool run was validated against the published `abc` KAT before the target comparisons.

This is a bounded negative on exact LP1-demonstrated transforms, not a rejection of the p50 table, p56 continuation, or every possible serialization. It removes the most obvious “reuse the old concatenation/reversal/nibble trick first” rescue of the adjacent direct-preimage hypothesis. The consolidated reproducer is [`sims/lp2_p50_p56_preimage_gate.py`](../sims/lp2_p50_p56_preimage_gate.py); the independent source-operation/word-sum assertions and exact LP1 `10.jpg` concatenation check are in [the LP1 reversal source gate SFT](../sims/lp2_lp1_reversal_source_gate_sft.cjs).

## Literal character-class record decision (Director #2877, Agent3, 25 November)

The source is the already image-adjudicated 256 tokens, with physical 32×8 order. This is a different question from the prior [digit-letter semantics](lp2-p50-literal-token-grammar-control-gate.md) and [case-bitplane AES consumers](lp2-p50-case-bitplane-aes256-source-gate.md): does the printed case/type mark a structured record before numeric conversion?

Let D/U/L be digit/uppercase/lowercase of the second character. Every first character is a decimal digit 0–4. Enumerate the two complete unsigned-byte codebooks and count the joint first-digit/second-class support:

| First digit | Original D/U/L | Base60 D/U/L | Drop-f base59 D/U/L |
| --- | --- | --- | --- |
| 0 | 5/27/28 | 10/26/24 | 10/26/23 |
| 1 | 7/30/21 | 10/26/24 | 10/26/23 |
| 2 | 12/24/29 | 10/26/24 | 10/26/23 |
| 3 | 8/28/20 | 10/26/24 | 10/26/23 |
| 4 | 10/7/0 | 10/6/0 | 10/10/0 |

The absent 4L class is forced by the 0–255 range under either encoding, as is the restriction to a numeric first character. Total original second-class counts are D=42, U=116, L=98. Given the integer and either exact codec, the first digit and case class are deterministic, so the conditional entropy of these marks given that integer is zero. This does **not** imply that a sender cannot deliberately constrain integer choices to carry another message; it establishes that the proposed marks are not extra independently adjustable bits of a fixed numeral. A separate-channel claim needs a fixed selection/decoding law and original prediction.

A repeated row record with a fixed D/U/L field type per column is impossible: all eight columns have all three classes. Even choosing the modal class of each column retrospectively would require **132/256 violations**. All 32 row class signatures are distinct. More flexible records could exist but require a documented field grammar. Exploratory diagnostics compare the original against 3,000 independently generated tables per null (uniform bytes and independent eight-distinct-byte rows for each radix; seed 0x2877c1ca). The distinct-row null preserves the already-established #2626 row-uniqueness property, rather than confusing it with a class effect.

| Statistic | Original | Base60 distinct-row null two-sided tail | Base59 distinct-row null two-sided tail |
| --- | ---: | ---: | ---: |
| Column class Pearson | 20.96458 | .19793 | .19660 |
| Physical-page class Pearson | 1.06696 | .18127 | .22326 |
| Within-row equal-class pairs | 325 | .91103 | 1.00000 |
| Horizontal equal-class neighbours | 74 | .39920 | .34588 |
| Vertical equal-class neighbours | 88 | .82373 | .78574 |
| Repeated row class signature pairs | 0 | 1.00000 | 1.00000 |

All six Bonferroni-corrected tails equal 1 in all four simulated nulls; minimum unadjusted tail .18127. This is a finite descriptive screen, not a blinded experiment or proof of randomness. No new field boundary follows.

**Authentic syntax controls, tested before any consumer selection.** Original p10 scan27 contains the literal standalone 7 between rune groups; p56 scan73 contains 128 lowercase hex characters across five lines (26/25/25/27/25). The authenticated 2013 BASE29 example 3301→3QO and historical participant examples 30→11, 1033→16I establish the minimal numeral grammar; its effective alphabet is 0–9/A–S (see [signed protocol](../resources/external/2013-tcp-server-signed-source.md)). The original p50 tape has only 42/256 two-decimal-digit tokens, 88/256 case-insensitive two-hex-digit tokens, 110/256 minimal BASE29 numerals, and 132/256 even allowing fixed-width BASE29 leading zeroes. None parses the complete printed object under its actual syntax.

The exact archived [2014 Stage11 signed delivery message](../resources/historical/cicada2014-stage11-message.asc) supplies a particularly relevant mixed-case control. Its signature armor has the literal header/footer, radix64 body, and CRC24. Parsing the complete body recovers one 543-byte old-format tag-2 signature packet with a 540-byte body and version 4; its decoded checksum 54 0a 3f matches the computed CRC24. For the original p50 literal tokens the complete printed-order concatenation is lexically valid radix64, decoding to 384 bytes beginning `dc dd e9 da 5d fa d5 bd`. However the first octet DC denotes new-format packet tag 28, unassigned in the 2014-era RFC4880 packet grammar, not tag 2 or a recognized ordinary OpenPGP data packet; neither the armor framing nor CRC exists in the source. Even allowing the body alone, it is not the historical signature record. This test acts on the literal 512 printed characters, **not** the earlier direct base60-byte packet test. Lexical radix64 membership alone is trivial for this alphabet; it selects no receiver.

**Decision:** no independently selected character-class record or typed payload. Retire fixed-column class framing and the exact direct historical numeral/signature grammars. Do not infer a hidden bitstream from case alone, or search arbitrary re-encodings. The original numeric table remains unsolved, both numeral readings remain conditional, and an independently decoded adjacent instruction or fixed sender grammar is still the causal prerequisite. No LP2 plaintext or key recovered.

Reproduction: [CommonJS SFT](../sims/lp2_p50_class_record_gate_sft.cjs). The core analysis executed on exact repository source in connected V8 (12,000 simulated tables); the later original-image p10/p56 literal controls were checked separately, and the standalone Node wrapper was not separately CI-run. The test uses structural checks, not language fitting.

## Historical reciprocal-table record decision (Director #2894, Agent8, 26 November)

**Decision:** literal Old Babylonian finite reciprocal records cannot account for all printed cells under the conventional base60 numeral reading, even if any power-of-60 scale and any pairing were granted. The original supplies no distinct reciprocal-field, negation, grouping, or table-operation instruction. This is an arithmetic typing exclusion, not a radix selection or unknown-rune decoder.

The motivating independent source is the p33 cuneiform pair (17,13)/(55,1), not the downstream byte scores. I inspected original archive scans 50 and 66–68 directly: the p33 numeral stamp and the p49–51 mixed-case alphanumeric panel are different visible notations; the latter has equal-spaced eight-cell rows with no explicit reciprocal label, semicolon, or alternating field separators. The earlier #440/#1968 missing-transfer conclusions remain intact; #2235 tested a separate digit-key transform.

**Period control.** J. Friberg, *A Remarkable Collection of Babylonian Mathematical Texts* (2007), [CDLI MS 3874/P252955](https://cdli.earth/artifacts/252955), is a real Old Babylonian reciprocal tablet. [May 2012 Stony Brook transcription derived from Friberg](https://www.math.stonybrook.edu/~tony/whatsnew/may12/tablets/bab-mult2.html) distinguishes legible rows from eight restored rows at the damaged junction. The ordinary syntax identifies a number and its reciprocal, using the historical igi / gál.bi markers. The first two lines express the 2/3 and half relations; the last two surviving reverse rows give the reciprocals of 1,4 and 1,21. C. Proust, [2012 chapter, pp.388–390, Table 12.2 and n.19](https://www.ms.uky.edu/~sohum/ma330/files/Chemla_K.Ed.-The_history_of_mathematical_proof_in_ancient_traditions-Cambridge_University_Press_2012.pdf), independently explains the floating-place convention and the explicit negation used for irregular inputs in older tables. The 26 standard pairs in Proust's table, together with the special 3/2 and unity rows in the MS3874 reconstruction, are 28/28 arithmetically valid; the eight reconstructed rows are not claimed as legible original clay.

For digits d, let M(d) be the nonnegative integer mantissa evaluated in base60. An unmarked place shift can only multiply it by 60^e for integer e. A finite reciprocal pair therefore requires positive A,B and A×B=60^k for some integer k≥0. Exact rational normalization B/60^k gives product 1. Every mantissa must be 2,3,5-smooth. No shift can remove a factor 7, 11, 13, 29, etc.; zero has no reciprocal. The integer arithmetic gives a stronger invariant than choosing a pair order or guessing a fraction point.

Using the already case-adjudicated `lp2-grid-256.json` (blob 2550eae357442912220e05dc51147523a61dd75a), the conventional 60-digit alphabet and literal single-cell mantissas, without pairing, changing any rune or optimizing any scale:

| Physical page | Positive regular | Positive irregular | Zero |
| --- | ---: | ---: | ---: |
| 49 | 14 | 66 | 0 |
| 50 | 21 | 83 | 0 |
| 51 | 12 | 58 | 2 |
| Total | 47 | 207 | 2 |

Witnesses: p49 row1 col1 `3N`=203=7×29; p50 row1 col1 `2M`=142=2×71; p51 row1 col2 `2a`=156=12×13. The visually confirmed literal `00` tokens are p51 row2 col1 and row6 col6 (one-based on physical page 51; global rows25/29). Their value is zero under both existing ordinary digit alphabets and any conventional place shift. Under the conditional base60 reading at most 47 of 256 fields are even individually eligible for finite reciprocal pairing, so at most 23 disjoint full pairs could exist before product constraints. The standard 28-record ordered range also does not match a 128-pair full panel; cardinality alone is not the exclusion. Earlier irregular-input tables explicitly mark no-reciprocal records, whereas the original provides no independently identified such field. No hypothesis about an unmarked zero-as-null, multi-cell regrouping, arbitrary digit remap or mixed literal/codeword records is authorized by the cuneiform.

Reproduction (exact integer arithmetic; the tested core executed in connected V8, no standalone Node/CI run claimed). Historical digits below are mathematical data from the two cited sources; `1.30` is the modern normalization of the 3/2 input, not a claimed literal first-line transcription.

```js
const g = require('../resources/liber-primus/lp2-grid-256.json');
const pairs = '1.30/40 2/30 3/20 4/15 5/12 6/10 8/7.30 9/6.40 10/6 12/5 15/4 16/3.45 18/3.20 20/3 24/2.30 25/2.24 27/2.13.20 30/2 32/1.52.30 36/1.40 40/1.30 45/1.20 48/1.15 50/1.12 54/1.6.40 1/1 1.4/56.15 1.21/44.26.40';
const m = s => s.split('.').reduce((a,d)=>60n*a+BigInt(d),0n);
function power60(n) {
  if (n <= 0n) return null;
  let k=0;
  while (n%60n===0n) { n/=60n; k++; }
  return n===1n ? k : null;
}
function residue(n) {
  if (n===0) return 0;
  for (const p of [2,3,5]) while (n%p===0) n/=p;
  return n;
}
const exponents = pairs.split(' ').map(p=>{
  const [a,b]=p.split('/');
  return power60(m(a)*m(b));
});
if (exponents.some(x=>x===null)) throw Error('historical control failed');
console.log('28 exact powers:', exponents);
for (const page of g.pages) {
  const v=page.tokens.map(t=>60*g.alphabet.indexOf(t[0])+g.alphabet.indexOf(t[1]));
  console.log(page.page, v.filter(x=>residue(x)===1).length,
    v.filter(x=>residue(x)>1).length,
    v.flatMap((x,i)=>x===0?[[Math.floor(i/8)+1,i%8+1]]:[]));
}
```

Control power exponents: 2, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 2, 2, 1, 2, 2, 3, 1, 3, 2, 2, 2, 2, 2, 3, 0, 3, 4. Original output: [[49,14,66,[]],[50,21,83,[]],[51,12,58,[[2,1],[6,6]]]]. No arbitrary pairing, radix sweep, fitted operation or original rune-language score was performed. Retire the direct finite reciprocal-table grammar; only new source evidence specifying mixed fields or a distinct record syntax could justify a successor. No authentic key, plaintext or cryptographic receiver recovered.

## Historical evidence gate and next discriminating action

The first-party 2013 specification gives an explicit `BASE29 3301 -> 3QO` example, whereas no surviving source-authenticated original instruction gives a p50 digit alphabet, unsigned-byte type, grouping, row direction or recipient. The original 2014 Stage11 delivery index has only sequential JPEG references and no separate table legend. The 11 May 2014 `decimal.txt`/`sexagesimal.bin` files are participant-derived from copied manuscript tokens, with documented corrections, so their base60 choices cannot settle author intent. These points are separately documented by [source-codec decision #1968](https://github.com/FlareZ123/liber-primus/issues/1968), [binary typing decision #2087](https://github.com/FlareZ123/liber-primus/issues/2087), and [exact provenance decision #2029](https://github.com/FlareZ123/liber-primus/issues/2029).

**One predeclared discriminator:** a previously unseen, creator-authenticated numeric value for the printed **first cell `3N`**. If that value is **203**, it selects the conventional base60 byte grammar; if it is **200**, it selects the drop-f base59 byte grammar. An authenticated encoding declaration or typed output of the adjacent original 138-rune pretable sentence could also decide. No inspected original artifact supplies this input. Mere source-copied participant decimal203 is not independent.

### Independent numeric-equality decision (#3271, Agent25, 28 November 2026)

The bounded first-party/period-source review yields **no additional equality binding a specifically identified LP2 cell to an independently fixed numerical value**. The closest literal overlap is independently informative about *type*, not radix:

| Historical numeric example | Printed output | LP2 relation |
| --- | --- | --- |
| Signed 2013 TCP BASE29 3301 | `3QO` | Three digits; no exact two-character cell, and 3301 exceeds both byte domains. |
| 26 January 2013 participant-server log, BASE29 30 | `11` | Exactly one original cell has this spelling: global zero-based index 211 (physical p51, row 4, column 4, one-based). Its frozen base59/base60 values are **60/61**, neither 30. |
| 3 March 2013 participant-server log, BASE29 1033 | `16I` | Three digits; no exact cell, and 1033 exceeds both byte domains. |

The signed protocol's literal worked example is reproduced in the [pinned decoded source](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/other/2013_TCP_Server.md); the January/March examples are participant-preserved, not separately signed, as recorded in the [protocol source study](../resources/external/2013-tcp-server-signed-source.md). The effective BASE29 alphabet does not constrain the relative numbering of lowercase letters, including f, under a different radix. The exact `11` spelling match supplies no authored connection between the log and physical p51; even granting that connection, the historical numerical value rejects both proposed codecs for that cell. Do not convert 30 into a newly selected p50 address.

The authenticated 2014 [book-coordinate instructions](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/messages/2014/the-work-of-a-private-man.asc) specify colon-separated coordinates, the [signed RSA challenge](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/messages/2014/welcome.asc) labels decimal e/n, and the [signed hex carrier](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/messages/2014/let-the-text-guide-you.asc) contains the standard literal JPEG byte serialization. The [Stage10 form](../resources/external/cicada2014-onion6-magic-form-and-response.json) labels decimal square orders and sums; the [Stage11 index](../resources/external/cicada2014-stage11-onion7-original-index.html) merely lists the images. None assigns a value to a named printed table cell. The period MIRACL alphabet is a technical precedent, not a Cicada instruction.

The already known local p57 `13th prime = 41 → table[41] = 1O → 83 = 23rd prime = GP0(EMERGE)` equality favors base59 **conditional on that particular rule**. It is not a new independent anchor. [#2069](https://github.com/FlareZ123/liber-primus/issues/2069) explicitly tested whether that bridge selects a global radix and closed at the missing second prediction; the reverse directed edge also fails. Preserve its local status.

**Exact future acceptance criterion.** Write a printed cell as decimal leading digit a and second digit b in the conventional alphabet. On the shared support, V60−V59 = a + 1[b lies after lowercase f]. Consequently any authenticated value of a cell with positive difference suffices to choose between these two fixed interpretations; a value outside both rejects both for that identified cell. Any independently specified nonnegative integer weighted checksum similarly distinguishes whenever its weights include at least one such cell. This is a general prediction rule, not a proposal to match arbitrary known constants to invented weights. The original 256 cells have 220 distinguishing positions and 36 with equal values; the total unweighted difference is 507. No source labels the table total as a checksum. The first cell remains the frozen best acquisition target (203 versus 200). These exact counts were computed directly from the original-image-adjudicated grid in V8; no new cipher, radix/offset sweep, or table scoring was performed. Reproduction:

```js
const g = require('../resources/liber-primus/lp2-grid-256.json');
const a = g.alphabet, b = a.replace('f','');
const v = (t,z) => z.indexOf(t[0])*z.length+z.indexOf(t[1]);
const t = g.pages.flatMap(p=>p.tokens);
const d = t.map(x=>v(x,a)-v(x,b));
console.log(t.flatMap((x,i)=>x==='11'?[i]:[]),v('11',b),v('11',a));
console.log(d.filter(x=>x>0).length,d.filter(x=>x===0).length,d.reduce((x,y)=>x+y,0));
```

**Decision:** The source table does not currently select byte type, global radix, consumer or key. Preserve the two readings as conditional, discontinue discrimination by table-only uniform-byte histograms, and seek a first-party typed example or an independently decoded table-adjacent instruction. Close #3271 under the missing-binding criterion; reopening requires a new source rather than a new numerical fit. Neither the overall LP2 cipher nor any of its 56 unknown pages is solved by this result.

## Relative column-order decision (Director #2899, Agent1, 26 November)

The physical 32×8 source supports a **radix-invariant candidate order**, but does not independently select it as a cipher key or assign it to a receiving text. This is distinct from #2626's full ordered-selection rank of eight byte values: here only their relative order is used, with no byte serialization.

**Historical forward/inverse controls.** The [archived fourth-onion OutGuess example](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/006-fourth-onion/README.md#outguess) specifies the same column-read permutation on all eight seven-character rows: zero-based [0,6,2,5,1,4,3]. Reading the original rows yields exactly `TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133`; the inverse puts plaintext character j in ciphertext column perm[j]. The separate [archived 14-column solver](https://github.com/lastpacketbender/991948530947554/blob/main/2014/004-first-three-pages/columnar.py) hardcodes [2,8,9,1,12,13,11,4,5,7,3,0,6,10] and yields `GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSIONJOINUSATFV7LYUCMEOZZD5J4ONIO`. Both actual implementations consume a permutation of column indices, rather than an alphabetic keyword. Neither specifies key-letter comparison, repeated-letter tie handling, a numeral-to-permutation rule, or changing row keys. A generic textbook keyword sort is a new hypothesis, not a recovered Cicada convention.

**Exact radix-free fact.** For a fixed-width two-character token with first character a decimal digit, both proposed numeral alphabets order the available characters exactly as ASCII does (0–9, A–Z, a–x, with f omitted in base59). Lexicographic order therefore equals ascending numerical order for both interpretations: the leading digit dominates the second digit, and the second-digit ordering is strictly preserved. This applies to all source-supported tokens, not just the observed rows. On the image-adjudicated `lp2-grid-256.json`, all 896 within-row pair comparisons agree, there are no within-row ties, and the 32 ascending read permutations are all distinct. The first row sorts to `1b 26 2l 33 36 3N 3p 3v`. The following one-based column-read orders are the direct consequence of the **conditional** ascending comparator, grouped by the physical 10|13|9 rows:

```text
57384126 61378452 34785162 46187532 84562173 34812675 23485761 84527361 36817452 72856143
62871543 84763125 74352816 53728164 75126834 56143782 73465821 14628735 31746825 32541876 64532187 84657213 68253741
38541276 18476235 84261753 31458627 76541382 62137584 61478325 53621874 68123574
```

Ties cannot obstruct this candidate on the actual rows. The radix ambiguity likewise does not obstruct it. Nevertheless all 32 orders being distinct means the panel cannot be a literal repeated fixed historical column order under that comparator. Each row's relative order loses its numerical/token multiset; it is not a full inverse of the printed object. The new row-dependent order would need an independently indicated consumer.

**Receiver gate.** Direct inspection of original scans 66–68 shows the 10+13+9 rows, three rune lines immediately above the first panel row and four below the last; the middle page has only panel tokens. No visible labels pair the 32 rows with 32 independent eight-column rune packets. The adjacent encrypted text is not an independently specified geometry or rune-identity-changing stage. #638 established that the historical column permutations alone preserve the plaintext symbol inventory and do not select a complete LP2 composite. No comparator direction or row-to-receiver correspondence is prescribed by either worked historical example, and no separately sourced eight-column payload was found in the inspected original panel and source examples. Choosing a block of 256 runes by its length would introduce a new unselected correspondence.

**Decision:** retain the radix-free order lemma and retire this particular historical-transfer proposal pending a genuine row-key instruction and typed receiver. No alternate direction, comparator, radix, packet origin, second cipher layer or language score was searched. No new plaintext or authenticated key. Reproduce the exact finite result with [the small standalone SFT](../sims/lp2_p50_relative_column_order_sft.cjs); the numerical core and both known output controls were executed in the connected JS runtime. The wrapper is not claimed to have a separate CI run.

## Printed-reference-table decision (Director #3039)

**Decision:** two documented pre-LP2 reference formats do not supply a literal panel excerpt. A re-encoding or different source remains possible; no source-selected representation or unknown plaintext follows. This is distinct from the ancient reciprocal-table and GEB-record decisions.

**Candidate 1 — RAND, A Million Random Digits (1955).** The publisher's [2001 facsimile edition](https://www.rand.org/content/dam/rand/pubs/monograph_reports/MR1418/MR1418.digits.pdf) preserves the earlier layout; the [publisher's digit dataset](https://github.com/RANDCorporation/milliondigits/blob/09739b344efb3ed20602f34023232c67f20f212a/digits.txt), Git blob `cb72b2b37aa240bf05b0ebe1c981e0c510c1e5e0`, was actually acquired in full (1,440,000 bytes). Parse the numbered rows and the ten five-digit fields in each: 20,000 rows of 50 digits, exactly 1,000,000 digits. The 2014 [NIST Handbook 133, Appendix B, printed p109](https://www.nist.gov/system/files/documents/2017/05/09/hb133-14-final-web.pdf) documents grouping this decimal material into two-digit columns when appropriate; the output remains decimal. The publisher's PDF and NIST page screenshot could not be retrieved through the available PDF renderer (cache miss); the original numerical dataset was retrieved. The task's premise that Cicada used RAND Corporation material in 2012 is **not authenticated by the sources inspected**. The [signed January 2013 TCP specification](../resources/external/2013-tcp-server-signed-source.md) contains a participant-generated RAND command, which is not a citation of the RAND Corporation book or an organizer-fixed shared digit tape. The existing [Dukotah public-pad sweep](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/ELIMINATION-LEDGER.md) already tests RAND as a key source; do not repeat it here.

The literal recognition rule preserves consecutive printed rows and a fixed source-column origin, trains on the first two eight-cell rows and predicts the remaining 30 rows exactly. For the RAND data, allow a 16-character substring at any of the 35 valid digit positions in each native 50-digit row (thus even relaxing native five-digit grouping). No radix conversion, source reordering, arbitrary digit extraction or language score. Result: **zero training locations and zero full matches**. A planted authentic 32-row rectangular excerpt at zero-based source row137, digit column7 uniquely recovers its location and all 30 withheld rows. Changing one withheld digit retains the same training location but rejects the full match. LP2 contains 42/256 decimal cells, 214 with letters, no fully decimal row, and only one maximal run of three decimal tokens (offset12; this short string occurs in the million-digit tape and provides no identification). A broader exact obstruction: any *fixed* cell-wise mapping of two decimal digits has at most 100 output symbols, fewer than LP2's 161 distinct tokens, even allowing arbitrary cell reordering. This does not exclude repacking larger decimal groups using a new, independently selected rule.

**Candidate 2 — US8235286B2, Fig.13 (2012).** The [published specification](https://patents.google.com/patent/US8235286B2/en), published 7 August 2012, describes an 8-column ×32-row example of 256 random hexadecimal **digits**, with one nibble per cell. The distinctive dimension motivates the comparison but is not a Cicada linkage. The grant PDF and individual drawing sheets returned cache misses; no literal drawing values are claimed to have been acquired. Its explicitly documented field type is sufficient to reject the literal two-character LP2 panel and any fixed cell-wise relabeling of this figure: at most 16 distinct source values versus 161 in LP2. Figures 12–15's documented nibble-to-binary layout does not specify a two-character LP2 numeral codec. Figure 16's longer sequence is a different field, with no source-selected LP2 cell mapping. No speculative conversion was tested.

**Reproduction.** [Standalone CommonJS gate](../sims/lp2_p50_printed_table_literal_gate_sft.cjs) accepts the exact publisher digit file, validates its Git blob hash, and uses the adjudicated [original LP2 token grid](../resources/liber-primus/lp2-grid-256.json). The numerical core and both exact controls ran in the connected JS runtime on the full publisher file; the Node wrapper has not separately run. [Machine-readable result](lp2-p50-printed-table-literal-output.json). No third-party digit tape is mirrored. Retire these two literal reference formats; reconsider reference-table recognition only if an independently dated candidate actually supplies the mixed-case two-character grammar, or an authenticated clue supplies its exact re-encoding. No new key, radix or original plaintext is established.

## Director #3103: source-selected receiver audit

The source-visible p50 reflection is real but partial. The original left/right tree pair selects `c→7−c` ([image-derived selector](lp2-p50-tree-reflection-selector.md)); the original receiver tests for the reflected interior and perimeter are both negative ([receiver gate](lp2-p50-reflection-receiver-gate.md)). The decorative margins are reused across physical pp49–51, so they are not three independent page-specific diagrams. The reflection fixes column orientation only; it supplies no first cell, row traversal, numeric grammar, arithmetic combiner or output type.

The proposed external source bridges do not complete that chain:

- **2013 BASE29/RAND:** the signed TCP source defines the 29-rune positional alphabet and a `RAND n` command returning n random integers 0–255 as decimal lines. It does not identify the p49–51 panel as a RAND response, specify its two-character token grammar or select a consumer. No authenticated RAND256 transcript survives.
- **2014 Stage10:** the contemporaneous form/response fixes three magic-square requests (5×5/3301, 7×7/1033, 5×5/1033), but does not instruct solvers to apply those squares or their reflection to the later LP2 panel. The natural page blocks and the centered/reflection-related p50 order-seven candidate fail; see [the updated Stage10 gate](2014-stage10-three-square-pp49-51-original-fixed-layout-gate.md). The p33 cuneiform values 1033/3301 are a cross-round numeric correspondence, not a p50 start/traversal/receiver instruction.
- **Five-numbered-passage navigation:** the exact first-occurrence sender convention is already tested and fails its necessary condition at 153/256 cells; the output has no source-selected link to those five passages ([native locator gate](lp2-p50-five-numbered-passage-native-gp-locator-gate.md)).
- **RSA/hash-sized object:** 256 bytes and eight 32-byte columns are suggestive dimensions only. The original 4096-bit RSA factor tests are negative ([factor gate](lp2-p50-rsa4096-original-publickey-factor-gate.md)); size correspondence does not supply a source-defined receiver.

The current canonical image-adjudicated transcription is `resources/liber-primus/lp2-grid-256.json`. Neither its name nor its derived `byte_rule` is an authored radix instruction. The 252-token base59/base60 overlap still means the printed tape alone cannot distinguish those two uniform-byte grammars.

**Decision:** no first-party or contemporaneous source presently fixes all four required items: (1) start cell, (2) row/cell traversal, (3) numeric representation, and (4) output/receiver type. The precise missing dependency is an authenticated instruction or source object that explicitly binds the p49–51 panel to a named receiver and fixes those choices. Retain the p50 horizontal reflection as a source-authenticated orientation clue; do not reopen generic radix, orientation, book-code or table-consumer sweeps without that missing binding.
