# Original 2013 761.MP3: complete ID3 and MPEG envelope inventory

**Classification:** original-binary source recovery with finite ID3, MPEG frame-boundary and end-of-file audits. The ID3 inventory completed Director Issue #139; the MPEG container gate completes #445. **No new 2013 instruction, LP2 unknown plaintext or cipher key was recovered.** Both tests use a pinned immutable original with SHA-256 checks and separately declared controls.

## Pinned original and native parser

The actual archived binary is [`rtkd/iddqd/2013/02/761.MP3`](https://github.com/rtkd/iddqd/blob/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3) at commit `f2267b0c2f1e1d2662806b90b9c3a2953b3a7023`, Git blob `7e2bd299fbc7b96283219cf15e2904641daf631f`. Source bytes: **4,010,732**, SHA-256 `83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460`. A short opt-in `id3-audit` branch was added to the **existing** `.github/workflows/audio-761-pad-scan.yml` workflow. It downloads the immutable original and executes the standard-library-only [`sims/audio761_id3_frame_audit.cjs`](../sims/audio761_id3_frame_audit.cjs). The [completed successful hosted run 42986331787](https://github.com/FlareZ123/liber-primus/actions/runs/42986331787) independently verifies the full hash and runs two synthetic text-frame positive controls, plus a one-to-one decoded ID3 frame inventory. The opt-in mode skips the previously exhausted audio-pad searches and FFmpeg.

The source contains exactly **one ID3v2.3.0 header**, flags `0`, at file offset0. Its synchsafe declared body length is **196 bytes**, ending at byte **206** (exclusive), without padding. No ID3v1 128-byte footer exists. The MPEG audio begins at offset206 with bytes `ff fb b0 64`. Its three native frames exactly fill the header:

| Frame | Byte offset (including 10-byte frame header) | Payload bytes | Original decoded value |
| --- | ---: | ---: | --- |
| **TXXX** user text | 10 | 140 | Description: `Parable 1,595,277,641`; value: `Like the instar, tunneling to the surface\nWe must shed our own circumferences;\nFind the divinity within and emerge.` |
| **TIT2** title | 160 | 21 | `The Instar Emergence` |
| **TPE1** lead performer | 191 | 5 | `3301` |

Each frame is ISO-8859-1 text with encoding byte0 and two-byte ID3 frame flags0. The TXXX description/value separator is one actual NUL byte. Crucially, the body stores **two literal backslash-n pairs** (`\n`, bytes `5c 6e`) instead of line-feed characters (`0a`). A normalized 2013 Parable transcription may display these as line breaks; it is not byte-identical to the source tag.

Exact original payload fingerprints:

- TXXX SHA-256 `bbe6b0e411d74df5bdd7b6b33deebdb774a059e4fd0cb5baeba21ef53b0ea1b8`; prefix hex `0050617261626c6520312c3539352c3237372c363431004c`.
- TIT2 SHA-256 `914827b6e3c27b7aa7c56ab9c824431bb920bc04ba9c987d5fd4756fe88f3132`.
- TPE1 SHA-256 `ad2ba3a4bf4a9c363acec8ecb9d04dc8db02e57c7a33f47e64668fc2d6fc0610`.

There is no fourth frame, hidden comment, attached picture or metadata padding in this **206-byte source tag**. Source identity and frame lengths are confirmed by the parser's strict offset/end-of-tag assertions, with a planted TIT2+COMM tag and planted padding also successfully recovered. A different payload hidden in MPEG compressed audio is outside this scoped audit; prior audio wave and pad scans remain separate.

## GP-prime title sum matches the original basename

The original ID3v2.3 `TIT2` frame stores **`The Instar Emergence`** (21-byte payload at file offset160), while the immutable original file is named **`761.MP3`**. Under the canonical Gematria Primus prime weights:

| Title word | GP prime-weight calculation | Sum |
|---|---|---:|
| THE | TH=5 + E=67 | 72 |
| INSTAR | I=31 + N=29 + S=53 + T=59 + A=97 + R=11 | 280 |
| EMERGENCE | E=67 + M=71 + E=67 + R=11 + G=17 + E=67 + N=29 + C=13 + E=67 | 409 |
| **Total** | **72 + 280 + 409** | **761** |

The title sum equals the original basename exactly. This is an original-artifact positive control for GP-prime-sum numeric naming, independent of LP2 plaintext. The same original TXXX frame stores `Parable 1,595,277,641`, which equals the product of the three p57 body-clause GP-prime sums `1259×1031×1229`; the heading-sum-449 remainder candidate `[361,133,331]` and its 2014 HTML title/id match are detailed in [the original-audio Parable analysis](audio-761-pad-scan.md#parable-s-heading-is-the-modulus-of-the-seventh-onion-title-and-id). This is a source-level numeric checksum; the modulo operation and its interpretation as an address remain inferred. It is not, by itself, an authenticated instruction that all words should be counted or that sums address pages/words. In particular, the later-preserved first-onion `COUNT`/`NUMBER` service is reconstructed; no original `NUMBER` implementation or byte-preserving session is known. The candidate decimal reversal `761→167` and the existence of a 2014 `167.jpg` prime page are therefore a possible cross-round association, not an authenticated page pointer. See [the consolidated address-source audit](gp-prime-address-source-audit.md).

## Parable's three-prime product as a textbook RSA modulus: direct original-input format gate

The independently documented TXXX number `1,595,277,641` factors into the **three prime-valued sums of the solved p57 body clauses**, `1259×1031×1229`. A possible historically recognizable interpretation is a **three-prime RSA modulus**, because the solved LP1 admonishes that primes and the totient function are sacred. This is a *hypothesis*: the author does not name RSA here, and any product of distinct primes can mathematically serve as an RSA modulus. The original MP3 title sum/filename **761** and the Cicada identifier **3301** both happen to be invertible public exponents, with respect to this modulus's `phi(N)=1,591,168,720`: their exact private exponents would be **190,271,161** and **23,137,261** respectively. Their existence does not establish a key choice.

Textbook RSA enciphers a numeric block into a residue **strictly below N**, irrespective of exponent. Since `29^6=594,823,321 < N < 29^7=17,249,876,309`, any fixed-width **seven-GP-rune base29 RSA ciphertext block** must begin with a numeral 0, 1 or 2. This remains a maximum of three symbols even under an arbitrary unknown fixed permutation of the 29-rune alphabet. But for every one of **55 original unknown rune-bearing pages**, every possible offset of its seven-rune clock has **at least seven distinct glyphs** at the would-be leading positions; in the book-continuous version all seven clock phases have **all 29 glyphs**. Thus no page-wise secret alphabet remapping or unknown seven-rune alignment can make the original pages direct fixed-width textbook RSA ciphertext blocks under this N.

Likewise, treating each original complete GP ciphertext word as one base29 RSA ciphertext residue gives **536/2,896 actual values >=N**, an exact obstruction to the literal per-word-block model. Treating the printed p50 **256 original bytes** as **64 four-byte RSA ciphertext blocks** fails the same range requirement: only **19/64** big-endian and **32/64** little-endian blocks are <N. An actual positive encrypts six-rune segments from the solved p57 under each exact source-number exponent, serializes each result into seven base29 digits and decrypts all segments without error, confirming the bound and RSA arithmetic.

[Executable source-and-solved-plaintext original gate](../sims/parable_three_prime_rsa_original_format_gate.cjs) preserves these necessary format checks. This rejects the direct, uncompressed RSA block readings of LP2 runes and p50 byte cells under the candidate N. It leaves byte packing across nonstandard boundaries, other modular constructions, keys derived from N and an unrelated purpose for the embedded Parable product open. **No unknown plaintext, original RSA key instruction or continuation is recovered.**

## Exact MPEG audio frame and file-end audit (Director #445)

The [source-locked MPEG frame SFT](../sims/audio761_mpeg_frame_structure_sft.cjs) parses all frames at their *next expected byte boundary* instead of scanning for arbitrary sync markers. It operates on the same SHA-256-checked **4,010,732-byte** original used for the preceding ID3 audit. [Successful manual-only CI with matched encoder and planted trailer controls](https://github.com/FlareZ123/liber-primus/actions/runs/43128163885) also runs FFprobe and the FFmpeg decoder. It adds the opt-in `mpeg-audit` selection to the existing manual `.github/workflows/audio-761-pad-scan.yml` workflow, with no push-triggered CI.

| Property | Original 2013 761.MP3 |
| --- | --- |
| ID3v2.3 envelope | offsets **0–205**, exactly **206 bytes** |
| Compressed audio | offsets **206–4,010,731**, exactly **4,010,526 bytes** |
| Sequential MPEG-1 Layer III frames | **6,397**; first offset206, 626 bytes; last offset **4,010,105**, 627 bytes |
| Sample rate, bitrate | **44,100 Hz**, **192 kbps CBR** on every frame |
| Channel/flags | all 6,397 headers are joint stereo, original=1, copyright=0, private=0, no CRC, emphasis=0 |
| Frame padding | **393** unpadded and **6,004** padded frames |
| Side-info reservoir back-pointer | 6,395 nonzero, maximum **447** (9-bit field) |
| First-frame marker | ordinary **Info** encoder header, `LAME3.98r` |
| Info declared audio frames | **6,396**, excluding the Info frame itself (6,397 parsed in total) |
| Info declared compressed bytes | **4,010,526**, matching the complete audio region |
| Independent FFprobe | `mp3`, 44,100 Hz, 2 channels, 192,000 bits/s, reported duration **167.021134 s** |
| MPEG frame-clock duration | **167.1053061224 s**, including encoder/info framing |
| Unparsed trailing bytes after last frame | **0** |

The original plays through FFmpeg without a reported decoder warning or error. The pre-existing ID3 audit already established that the only three tag frames are TXXX, TIT2 and TPE1, and that there is no ID3v1 footer. The new audit shows the file has no extra trailer after the last intact MPEG frame, including no trailing APEv2 block, secondary ID3 tag, or appended instruction file. This is an **out-of-band container exclusion**, not a statement about hidden data in valid compressed MP3 bits.

**Controls and falsifiability.** A separately encoded ordinary FFmpeg/LAME 192-kbps 44.1-kHz stereo control has **117** sequential valid frames and no tail, and its Info frame declares **116** frames, exhibiting the same standard one-frame offset. A synthetic marker `FROZEN_APPEND_TEST` appended to the authentic source is detected in full by the same parser, confirming that a non-frame trailer would have been visible. The parser additionally asserts the Info frame count and byte-count relationships for both original and control. All evidence is in the successful run above; no symbol key, audio frequency, frame subset, or ciphertext phase is fitted.

**Reserved Layer-III side-information payload check (12 November).** Each valid 192-kbps MPEG-1 stereo frame contains exactly three syntactically reserved side-information private bits after the nine-bit `main_data_begin` back-pointer. These are separate from the single private bit in each MPEG frame header (already verified zero). The full original file's **6,397 three-bit side-private fields are all 000**, so the entire **19,191-bit** reserved side-channel is constant zero. A matched ordinary LAME/FFmpeg 117-frame control likewise has 117/117 zeros. A planted one-bit mutation in the original's first frame's three-bit private field must be and is detected as exactly one nonzero event (one `001` field, 6,396 other zeros). [Independent source/control channel run](https://github.com/FlareZ123/liber-primus/actions/runs/43131072454) has the original observation; the stronger planted-field regression is [rerun 43131212467](https://github.com/FlareZ123/liber-primus/actions/runs/43131212467). This **decisively excludes data hidden in those 3-bit reserved fields** on the pinned MP3, independent of any candidate password. It says nothing about `part2_3_length` parity, bit-reservoir payloads or quantized audio coefficients. Standard MP3Stego instead manipulates part2_3_length; it does not use this reserved field as its ordinary channel. [The original MP3Stego implementation description](https://www.petitcolas.net/steganography/mp3stego/) and [MPEG side-info standard overview](https://datatracker.ietf.org/doc/html/draft-ietf-avt-rtp-mp3-00) distinguish these mechanisms.

**Scope and solve-path decision.** The historically documented, actionable 2013 use of this asset is the bytewise XOR of the MP3 against a Twitter stream, with the Parable text and its source-number checksum conveyed explicitly in ID3. The audio signal itself supplies no independently attested *second* listening, spectral, timing, or MIDI-to-GP29 rule. The compressed frames are ordinary legal MPEG packets as far as this boundary/metadata parser can establish. A watermark within MP3 scale factors, quantized samples, bit reservoir, or perceptual audio could still exist; no original clue currently selects how to extract one. Do not rerun unmotivated FFT peaks, offsets, direct MP3-byte pads, or PCM keyskip searches already reported in [the consolidated audio study](audio-761-pad-scan.md).

## Cryptanalytic decision

**Close the tested 2013 wrapper channels: neither the complete ID3 frame set nor the MPEG frame/container boundaries contain an additional source-attested instruction or missing key field beyond the known Parable, title and artist.** The exact TXXX description number `1,595,277,641` and two literal `\n` separators can be reused directly if a future source-selected key derivation demands byte-exact metadata. They do not themselves select a GP29 operator, page index, or original LP2 decryption. The independently observed 6,397-frame standard MPEG envelope has no appended payload; no source-selected second waveform or spectral decoder has emerged. Preserve the earlier signal and pad studies as bounded negatives; require an actual original clue before testing further extractions.
