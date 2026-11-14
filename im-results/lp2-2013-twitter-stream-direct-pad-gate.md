# 2013 Twitter hex stream as a direct LP2 GP29 pad: bounded negative

**Agent22, 14 November 2026.** The historical 2013 Twitter stream is a real, puzzle-linked source artifact, but its simplest direct transfer to LP2 does not recover plaintext. This is an intermediate exclusion, not a new cipher discovery.

## Source and hypothesis

The 2013 Cicada OS handoff pointed solvers to the account @1231507051321; a surviving community reconstruction records that the account's tweets carried offsets and 65-byte hexadecimal chunks, and that the reconstructed stream was XORed with 761.mp3 to reveal the Gematria Primus image. The account is a puzzle-linked historical source, but the surviving stream transcription is not itself PGP-signed. See the [2013 chain reconstruction](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_(2013)) and the independent [Dukotah 2013 chain synthesis](https://github.com/Dukotah/cicada3301/blob/master/research/02-puzzle-2013.md).

The repository copy is resources/cicada2013-twitter-hex-stream.txt, Git blob b3164929b090ffee06490e8ca86f495aa1db50c7. It contains 988 offset-labelled records. Sorting by the explicit numeric offset gives a gapless sequence at offsets 0, 65, 130, …, 64,155: 987 records of 65 bytes and a final 12-byte tail, **64,167 bytes total**. This is enough to cover the 12,956 original rune values on LP2 pages 0–55.

A narrow reuse hypothesis is that this old byte stream might itself be a direct key for the later GP29 ciphertext. The source only authenticates the historical Twitter/MP3 XOR role; it does not instruct a later LP2 use. To test the smallest direct GP29 transfer without inventing an offset or clock, the experiment freezes:
- key start at byte offset 0;
- one continuous stream across the original page order 0–55 (including the empty p50 boundary);
- no page resets, rune skips, phase search, or extra layers;
- two elementary 8-bit-to-GP29 reductions: byte mod 29 and floor(29 × byte / 256);
- both additive directions, P = (C − K) mod 29 and P = (C + K) mod 29.

The second reduction is only a conventional uniform bucket map; neither conversion is claimed to be author-selected.

## Original-input result

The canonical inputs are the repository Twitter stream above and resources/liber-primus/lp2-corpus.json (blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165). The unknown pages contain 12,956 runes across 56 page records (p50 is empty). The unchanged original unknown-corpus IoC is **0.03447839786450569**. Clear p57's 95-rune native GP text has IoC **0.06270996640537514**.

| Fixed direct transfer | Whole 12,956-rune output IoC | Highest individual-page IoC | Highest page |
|---|---:|---:|---:|
| byte mod 29, subtract | **0.034492958919593544** | 0.040000000000000000 | p55 |
| byte mod 29, add | **0.034460607639263330** | 0.038611575511503860 | p15 |
| floor(29 × byte / 256), subtract | **0.034495949774607500** | 0.037762237762237760 | p49 |
| floor(29 × byte / 256), add | **0.034487215524706190** | 0.039543670444958000 | p27 |

No page under any of the four candidates reaches IoC 0.05. All four whole-corpus scores remain effectively at the original ciphertext's near-uniform baseline, far below the clear p57 native-text control. Each inverse was forward-replayed against the exact original ciphertext. A planted p57 native-GP control is recovered 95/95 for every frozen map and sign, validating the arithmetic path.

## Decision and scope

Reject the **zero-offset, continuous, direct additive GP29 transfer** of this 2013 stream under the two fixed byte reductions and both signs. It does not produce a candidate LP2 plaintext or key.

This does **not** reject the historical 2013 Twitter/MP3 XOR, nor every possible use of the Twitter stream. A bytewise XOR transfer would first require an independently specified byte serialization of the 29-symbol LP2 alphabet; the original 2013 source does not supply one. Arbitrary offsets, page resets, F masks, alternate byte transforms, or fitted layers are not licensed by this negative and should not be searched without a new source clue.

No change to the authoritative results/README.md is warranted: this is a bounded direct-transfer negative, not an established LP2 mechanism. The reproducible test is sims/lp2_2013_twitter_stream_direct_pad_sft.cjs.
