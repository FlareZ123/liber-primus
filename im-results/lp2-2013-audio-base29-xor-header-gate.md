# LP2 original BASE29 integer-to-byte, then original 2013 761.MP3 XOR: file-header gate

**Agent21, 13 November 2026. Source-constrained negative for one historically motivated composite. No authentic unknown Liber Primus plaintext, decryption key, or final destination recovered.**

## Why a contemporary player might try this

The original, signed 2013 Cicada TCP challenge demonstrates **BASE29** integer conversion, and a separate 2013 puzzle stage demonstrably used the original **761.MP3** audio file's bytes as a literal XOR operand against a byte stream to reveal a JPEG with an OutGuess-embedded Gematria Primus table. The original audio also carries the poem published as the 2014 LP2 final **PARABLE**, with the source-authored ID3 identifier `Parable 1,595,277,641`. These independently dated sources make **BASE29 → raw bytes → XOR with the original audio** a reasonable compact historical transfer hypothesis. They do **not** instruct that operation for the *unknown* manuscript, pick its stream alignment, or promise a file container. The audio-as-GP29 *modular key* has already been extensively tested independently; this test concerns a different **binary XOR after BASE29 conversion**.

The original MP3 is [2013 761.MP3, byte-identified ID3 audit](audio761-original-id3-frame-inventory.md), originally 4,010,732 bytes with SHA-256 `83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460`. Exact published **first ten file bytes** are `49443303000000000144` (ID3v2.3, 196-byte body), and the first original MPEG frame starts at byte offset206 with `fffbb064`. These independently documented bytes suffice to test whether the specified unencrypted file format begins at byte zero after XOR. No unauthenticated guessed audio bytes are used; the test cannot decode an entire unknown payload from only these bytes.

## Fixed original-input operation and necessary condition

Read `resources/liber-primus/lp2-corpus.json` unmodified, exactly **12,956 unknown GP29 runes** on **55** rune-bearing LP2 physical pages p0–p55 (the printed numerical p50 is runeless). Interpret GP indices `F=0..EA=28` as most-significant-digit-first BASE29 integer digits. Convert each source packet to **minimal** big-endian bytes or fixed mathematical byte width `ceil(n log2(29)/8)`; these differ only by leading zero padding. The source packets, selected independently from printed chapter/page borders, are the **whole book**, the **nine visual chapters** p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55, and the **55 rune-bearing physical pages**, for **65** packets.

For every packet and both byte-width conventions, XOR the beginning of its binary representation with either the true first **10 ID3 file bytes** of 761.MP3 or the true first **4 MPEG audio bytes**. The latter models the alternate plausible interpretation “skip the metadata,” without fitting an offset. Check the available output prefix for the unmodified 2014-era GZIP, BZIP2, ZIP, XZ, PNG, PDF, 7-Zip or PGP-armor opening signatures. A direct unencrypted file of any one of those types must begin with its exact signature. Under the 4-byte MPEG prefix, eight-byte signatures are unscorable and not claimed negative.

The [read-only Node.js single-file test](../sims/lp2_2013_audio_base29_byte_xor_header_sft.cjs) asserts the original corpus shape, authentic first-byte witness, correct big-integer BASE29 encode/decode for a ten-byte independent GZIP positive control, and XOR involution. It performs **65 × 2 × 2 = 260** fixed header checks, rather than a brute-force pad offset or unknown-cipher fitting.

## Actual original result

**0/260** packet/header configurations starts with any recognized, fully inspectable binary or armor signature. On the complete 12,956-rune book:

| Source/readout | First ten bytes |
| --- | --- |
| Original canonical minimal/fixed BASE29 bytes | `08734843a55193dcbb72` |
| Original BASE29 bytes XOR first ten original MP3 ID3 bytes | `41377b40a55193dcba36` |

The independent GZIP-header plant exactly reconstructs its chosen ten-byte source header when XOR is reversed. The observed complete-book bytes are unchanged by the fixed/minimal convention because the first GP29 digit is nonzero. No source-aligned direct GZIP member, JPEG, ZIP, PDF, OpenPGP-armor header, or other tested standard file-format prefix emerges.

## Decision and limits

The historically attested **BASE29 integer → original 761.MP3 byte-XOR → standard *unencrypted, unframed file*** route fails its **necessary file-header condition** for the complete book, its nine original visual chapters and all 55 individual physical rune pages, under the two source-evident audio beginnings and two unambiguous integer widths. This is a useful narrow rejection of a once-plausible composite of two genuinely historical operations. It is **not** a complete-file decryption, an entire-audio-stream extraction, or an exclusion of raw plaintext, encrypted/compressed-with-encrypted-header data, other byte orders/packet starts, other ciphers, or source-implied keying not yet recovered.

A valid sequel would require an **independently authenticated manuscript-specific instruction** selecting an additional step or a missing original binary as a key/known plaintext. Do not expand this gate into arbitrary stream offsets, compression phases, raw-byte XOR padding or new AES variants based only on a header near-match. Existing unrelated source-guided raw GP29 direct-container checks and earlier audio key studies are preserved in [the direct BASE29-file gate](lp2-original-chapter-base29-direct-file-gate.md) and [2013 audio analysis](audio-761-pad-scan.md).