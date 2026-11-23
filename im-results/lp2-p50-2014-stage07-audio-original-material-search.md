# Original 2014 Stage07 MP3 versus the full LP2 p50 table: direct source-material identity gate

**Agent43, 23 November 2026. Status: complete, original-source negative; no unknown LP2 plaintext or key recovered.** Reproducer: [single-file Windows Node22 SFT](../sims/lp2_p50_2014_interconnectedness_audio_material_original_sft.cjs). [Successful workflow with original results](https://github.com/FlareZ123/liber-primus/actions/runs/45160021356).

## Independent source premise and useful success criterion

The original Cicada 2014 Stage07 `index.mp3` reconstructed from an archived signed onion response is one of the relatively few surviving first-party binary objects from the same historical round as the LP2 manuscript. Its original Git blob SHA-1 is `09fe068192b76a3697c47ec1d604b527703db798`; SHA-256 `1ce3839b4a62462d9009c4469acc189b523e1bdcf338cb49cda1cd7bb4efffc6`. LP2 pp49–51 separately print a 32×8 numeral panel, image-adjudicated as **256 base60-derived bytes** (original byte SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`). Earlier source tests have already excluded literal p50-byte copying from the *different 2013* `761.MP3`; there was no corresponding literal source-index test for 2014 Stage07 audio.

A literal **eight-byte** table slice found anywhere in the full authenticated-era 2014 audio would be a strong candidate for a first-party pointer to a 256-byte raw keystream. The same search after `byte % 29` reduction can recognize exact eight-rune source material even when the p50 digits are field operands. The separately discovered H(2013 BASE29)×G(p39 red triad) exact polynomial factor gives a fixed 252-GP-digit quotient, which could in principle be a keyed subsequence of the audio after the same reduction. Source-defined inputs determine these *three* complete registers in advance; no keyed offset, artificial encoding, audio trim, rotation, cryptographic hash, or phoneme recognition is fitted.

## Exact bounded test

All three searches traverse the original **6,651,873-byte** audio file using eight-consecutive-symbol matching in row-major source order:

1. Original 256 p50 **literal byte values** against unchanged MP3 bytes.
2. The same original 256 p50 **GF29 residues** against original MP3 `byte %29` residues.
3. The exact **252 GP29 H×G polynomial quotient** against original MP3 `byte %29` residues. The complete p50 remainder is asserted `[0,0,0,0]`; quotient begins `[0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21]`.

At each of the **249,249,245** eligible source-register starts respectively, search every audio byte offset for an exact eight-symbol substring. On a hit, extend it to the longest literal shared run. Independently plant a **256-symbol audio excerpt at original byte offset4,096** as a mock register and demand complete identical retrieval under each of the same three readers; all three positive controls pass. No original plaintext score enters the test.

| Prespecified source register | Exact eight-symbol matching offsets anywhere in original 2014 audio | Longest matching source register fragment |
| --- | ---: | --- |
| 256 original literal bytes | **0** | less than eight |
| 256 GP29 byte residues | **0** | less than eight |
| 252 H×G quotient GP29 residues | **0** | less than eight |

The expected *uniform-independent-reference* accidental eight-symbol rate for 256 table symbols over 6.65M source bytes is about **0.00331** for GF29 and **8.98×10⁻¹¹** for bytes. These numbers are descriptive baselines, not measured probabilities for nonrandom audio or an originally selected clue. An exact eight-symbol match would have required further independent support.

## Decision

Neither the printed original p50 table nor its source-derived H×G quotient contains a contiguous exact eight-unit excerpt of the original 2014 Stage07 audio in the frozen direct readers. Accordingly, **there is no observed raw MP3 offset supplying a literal byte or GP29-residue copy of the p50 operand**. This is a finite negative that rejects a specific, human-plausible same-round key-material transfer. It cannot exclude hash-derived source keys, a reordered or encoded audio stream, or a different cipher on the source panel, none of which are instructed by the original available artifact. In particular the p50 H×G polynomial factors remain independently true as arithmetic but do not yet identify a creator-selected receiving decoder.
