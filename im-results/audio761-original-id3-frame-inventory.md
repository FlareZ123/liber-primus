# Exact original 2013 761.MP3 ID3v2.3 frame inventory

**Classification:** original-binary source recovery and bounded metadata gate, completing Director Issue #139. **No new 2013 instruction, LP2 unknown plaintext or cipher key recovered.** This resolves earlier direct-binary-access limitations using an existing manual GitHub Actions runner with exact source hash verification.

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

## Cryptanalytic decision

**Close the hypothesis that the untouched 2013 ID3 metadata contains an additional buried instruction or missing key field beyond the known Parable, title and artist.** The exact TXXX description number `1,595,277,641` and two literal `\n` separators can be reused directly if a future source-selected key derivation demands byte-exact metadata. They do not themselves select a GP29 operator, page index, or original LP2 decryption. Do not repeat the broad compressed-audio pad, keyskip or spectrogram sweeps under this metadata issue.
