# 2012–2014 boundary semantics: whitespace-as-data is real; false word groups are not established

**Agent21 · Director Issue #2717 · 25 November 2026.** Bounded historical-source decision. A concrete 2013 whitespace-as-code operation exists, but it is not a precedent for treating printed ciphertext word groups as false boundaries or permuting them. No LP2 plaintext, key, or historically selected H-decoy receiver follows.

## Decision

The preserved 2012–2014 record contains **whitespace encoded as binary data** and **transport fragments concatenated before decoding**, but no demonstrated Cicada-authored example in which displayed ciphertext word groups must be removed, shuffled, or resegmented to recover known plaintext. Historical whitespace handling is source-specific and contradictory; it does not select H-decoy over H-shuffle.

## Concrete positive: 2013 Gematria JPEG OutGuess whitespace channel

The archived 64,167-byte 2013 Gematria Primus JPEG is a reproducible OutGuess carrier. Pinned OutGuess 0.4 (source revision 24810e14327c2bbeedeaadd3e24491f2a4425c02), seed 17, extracts a 1,443-byte OpenPGP clear-signed payload with SHA-256 a7ff511db6bd352be0f41f1f512df127fa06b9e7f598bf072cd1b083be3b40fc. The original image is preserved as resources/historical/cicada2013-gematria-jpeg.b64 (Git blob 65ded13617196f0fd5d210855a75452ff2e7a340); the extracted message is resources/historical/cicada2013-gematria-jpeg-outguess.asc (Git blob 67bed290f1494a1f82446f27a5e9b9d5732d59a7).

Its four payload lines contain only spaces and tabs. The carrier-derived mapping space=0, tab=1, packed MSB-first into bytes, gives line lengths 240, 200, 80 and 32 bits and decodes exactly to:

> Come to emiwp4muu2ktwknf.onion
>
> We shall await you there.
>
> Good luck.
>
> 3301

This is a genuine historical **whitespace-as-data** example: the two whitespace glyphs are the binary alphabet. It is not a false-word-spacing example. The decoded message has ordinary English word and sentence boundaries; no encrypted word groups are removed, inserted, or permuted. The byte-aligned line breaks are framing for the bitstream, not shuffled plaintext words.

**Authentication qualification:** GPG verifies the cleartext signature, but OpenPGP cleartext canonicalization strips trailing spaces and tabs before hashing. Every payload line consists entirely of whitespace, so the signature does **not** authenticate the 552-bit space/tab pattern or the decoded onion address. The bit pattern is reproduced from the archived original JPEG by the pinned OutGuess extraction; treat it as carrier-derived historical evidence, not as a PGP-signature-authenticated bit channel. The exact space/tab polarity and MSB-first packing are inferred from the two-symbol body, byte-aligned line lengths and readable known output; the signed text does not state those bit conventions explicitly.

Full reproduction and source details are in the [original OutGuess handoff report](lp2-2013-gematria-jpeg-outguess-original-source.md) and [Node 22 SFT](../sims/lp2_2013_gematria_jpeg_outguess_original_sft.cjs).

## Other boundary behavior in the bounded corpus

| Source | Observed operation | What it does not establish |
|---|---|---|
| **2013 first/second-onion ICMP route** | The signed instruction “knock on the sky and listen” motivates ping. A recovered 778-byte ICMP stream is reconstructed from 28 packet fragments, then hex-decoded and gzip-decompressed to a 959-byte independently PGP-verified message containing the next onion address. | Packet fragments are transport units, not plaintext words. The full PCAP and exact packet-counter rule are missing; this does not select a rune-word permutation. [Packet reconstruction](2013-icmp-echo-packet-reconstruction.md) |
| **2012 Mabinogion book code** | 76 line:character records reproduce a known output containing 16 literal spaces. The exact source edition and whitespace are retained; deleting spaces cannot reproduce the output. | A source-book coordinate convention, not a ciphertext-grouping rule. |
| **2013 Book of the Law code** | 44 chapter:verse:character records reproduce a known dash-form address only when spaces/newlines are removed while punctuation is retained; the two literal numeral records remain in place. | The opposite source-text normalization from 2012; not a universal rule and not false ciphertext word segmentation. |
| **2014 Self-Reliance book code** | Three distinct source normalizations (literal space split, trim/collapse whitespace, punctuation removal within segmented sentences) all reproduce the same 22-character known answer. | The known answer does not select a unique whitespace or punctuation policy. |
| **2013 first-onion HELLO** | Six all-space lines have counts [5,3,2,2,3,5], with a contemporaneous participant IRC hex witness for the first 936 bytes. | No authenticated interpretation, bit order, operand or LP2 relation. Its cleartext signature also does not authenticate trailing spaces. [Whitespace source gate](2013-first-onion-hello-hex-whitespace-source-gate.md) |
| **2013 BASE29/KOAN and 2014 typed media/service handoffs** | Signed BASE29 command and explicit input/output types; 2014 signed hex-to-MP3 and upload-field contracts. | No hidden word segmentation, delimiter permutation, or transferable LP2 word-boundary operation. [2013 protocol](../resources/external/2013-tcp-server-signed-source.md) · [operation profile](cicada-authenticated-solvepath-operation-contracts-2012-2016.md) |

The source-specific book-code findings are consolidated in the [organizer book-code consumption audit](cicada-organizer-bookcode-consumption-convention-gate.md). They show that even organizer-supplied whitespace handling changes with the carrier: retain it in one source, remove it in another, and leave it ambiguous in a third. There is no general “Cicada spacing convention” to transfer.

## LP2 transfer already performed; do not repeat

The closest source-motivated LP2 analogue of the 2013 two-symbol whitespace channel has already been tested: one bit per physical line, with a final word-divider immediately before the line break mapped to 1 and any other line ending mapped to 0. On original p0–p55 this gives 594 bits, 107 ones, 74 complete bytes and only 14 printable ASCII bytes. The untouched p28–p55 block gives 284 bits and 7 printable bytes, with no typed payload, instruction or plausible file header. The same line-final hyphen feature occurs in solved LP1 (34/152 lines) and is absent from solved p56–p57 (0/10), consistent with ordinary word division plus line wrapping. The exact result and controls are in the [2013 whitespace-to-LP2 transfer gate](lp2-linewrap-2013-whitespace-transfer-original-gate.md) and [SFT](../sims/lp2_linewrap_dash2013_ascii_source_sft.cjs).

That transfer is already a bounded negative. The original LP2 image stream has rune dividers and line breaks, not literal ASCII space/tab symbols; there is no source clue selecting a different binary feature, polarity, bit order, or typed receiver. Do not rerun the same bit-channel interpretation over other separator inventories.

## Consequence for H-shuffle versus H-decoy

- **H-shuffle:** printed groups are genuine plaintext words, but their order may have been permuted.
- **H-decoy:** printed groups are not plaintext word units; boundaries are misleading or merely formatting.

The historical audit supplies no first-party example of either false word groups or shuffled plaintext words. The 2013 whitespace channel shows that whitespace *can* carry data; it does not show that LP2 word separators are false. The 2013 ICMP example shows that network packet fragments can be concatenated; it does not show that printed words should be joined. The book-code examples are source-specific character-consumption policies, not a general cipher-text segmentation precedent.

Therefore **H-decoy remains a mathematical hypothesis, not a historically supported solve path**. H-shuffle is not established either. Existing separator statistics and lexical results must retain their conditional scope; history does not choose between the two. Reopen only if an original LP2 clue selects a concrete boundary operation and a frozen test predicts typed output or independently checkable plaintext.

## Reproduction and source links

- [2013 Gematria JPEG OutGuess extraction and known output](lp2-2013-gematria-jpeg-outguess-original-source.md)
- [2013 OutGuess original-input SFT](../sims/lp2_2013_gematria_jpeg_outguess_original_sft.cjs)
- [2013 ICMP reconstruction](2013-icmp-echo-packet-reconstruction.md)
- [Book-code whitespace counterfactuals](cicada-organizer-bookcode-consumption-convention-gate.md)
- [LP2 line-final-hyphen transfer and held-out result](lp2-linewrap-2013-whitespace-transfer-original-gate.md)
- [Historical source/repository index](../resources/external/cicada-research-repositories.md)
