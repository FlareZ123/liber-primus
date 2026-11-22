# 2013 Instar Emergence XOR source contract

**Stable historical reference, consolidated by Agent4 on 18 November 2026.** This record separates original 2013 objects from later solver reconstruction so LP2 work can reuse the exact historical operation without reopening operand ambiguity.

## Original objects

The preserved 2013 Cicada OS contains:

- `audio/761.mp3`, title **The Instar Emergence**, Git blob `7e2bd299fbc7b96283219cf15e2904641daf631f`, 4,010,732 bytes. The repository's pinned binary audit gives SHA-256 `83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460`.
- the TXXX metadata value `Like the instar, tunneling to the surface\nWe must shed our own circumferences;\nFind the divinity within and emerge.`, with the original tag storing literal backslash-n pairs.
- the Twitter-derived binary `2013/003-twitter/twitter.bin`, 64,167 bytes, Git blob `ba1866f89b31a7bd816eb6307eda56bdbd083674`.
- the recovered `gematria.jpg`, 64,167 bytes, Git blob `65ded13617196f0fd5d210855a75452ff2e7a340`.
- the OutGuess-extracted `gematria.jpg.asc`, containing a Cicada PGP-signed whitespace message.

Pinned public archive for the 2013 OS/Twitter reconstruction:
`neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`.

The original MP3 is independently mirrored as `rtkd/iddqd@f2267b0c2f1e1d2662806b90b9c3a2953b3a7023:2013/02/761.MP3` with the same Git blob.

## Exact historical byte operation

The period reconstruction's `2013/003-twitter/xor.py` performs bytewise XOR from offset zero and truncates to the shorter input:

`out[i] = file1[i] XOR file2[i]`.

Its `twitter.sh` reconstructs the useful carrier as:

`twitter.bin XOR 761.mp3 -> gematria.jpg`

then runs:

`outguess -r gematria.jpg gematria.jpg.asc`.

The 64,167-byte Twitter object is therefore consumed against the first 64,167 bytes of the MP3, including the MP3's 206-byte ID3 tag.

This operation is historically authenticated by exact recovery of the valid JPEG and the subsequent Cicada-signed OutGuess payload. The available archive does **not** preserve a Cicada-signed plaintext instruction that literally says “XOR 761.mp3 with twitter.bin”; that opcode is a successful period solver reconstruction from the original objects. Preserve that distinction when claiming source support.

## LP2 transfer boundary

The historical operator is typed over **bytes** and needs two byte strings plus an offset/length convention. It supplies no canonical mapping from:

- GP29 runes to bytes;
- p50 table tokens to bytes;
- a circumference-shed rune object to bytes;
- the historical MP3 stream to an LP2 page/rune clock.

The exact offset-zero whole-file transfer to original LP2 insect/wing JPEGs has already been tested with a positive historical control and rejected as a recognizable payload; see `im-results/lp2-p27-2013-761mp3-original-jpeg-xor-gate.md`.

A future LP2 XOR test using this source must therefore cite an independent first-party rule fixing the LP2 byte operand, serialization, start and length. Prefixing GP indices, packing base29, truncating the audio to a chosen rune count, or choosing a p50/p55 target by thematic association would add unsourced state.
