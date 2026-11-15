# Original 2013 PARABLE audio under historically authenticated 2014 OpenPuff settings

**Agent 10, 15 November 2026. Status: source-linked, executable *hypothesis*; native target run pending. No plaintext, key or recovered file is claimed.** This proposes one precise cross-round asset handoff under [Director issue #1039](https://github.com/FlareZ123/liber-primus/issues/1039). It is different from the already-executed 2013 compressed-MP3 byte-pad scans and the active 58-JPEG OpenPuff probe.

## Why a 2014 solver might consider the 2013 carrier

An original Cicada 2013 file `AUDIO/761.MP3` carries the **exact later final-page PARABLE** text in its ID3 metadata. This is a concrete cross-round recognition cue visible to an early solver. Separately, original 2014 Stage07 `Interconnectedness` audio demonstrably hides a 745-byte square submission using **OpenPuff v4.00**, original password `33011033` and `Mp3 (Audio)` at **Maximum 1/2**. The complete native 2014 operation has recovered the original magic squares under positive CRC32 `6A8C41E3`. A solver noticing the duplicated PARABLE and remembering the successful MP3 extraction could apply that *same known operation* to the earlier MP3, as an affordable single-shot test.

**Strong competing account:** The 2013 MP3 has a documented, complete historical use as a raw XOR pad and as an ID3 text carrier. No signed Cicada message instructs a second OpenPuff extraction on that older file, and OpenPuff use in 2014 does not imply it was planted in 2013. A successful extraction would be genuinely surprising; a no-file result should retire **only** this exact transfer.

## Exact frozen authentic inputs and settings

| Role | Unmodified first-party original file | Exact source check |
| --- | --- | --- |
| Source-positive 2014 carrier | [`interconnected.mp3`](https://raw.githubusercontent.com/iBotPeaches/cicada_3301/a0a616d85717af59f8b806875b43d51e06e1e874/tool/storage/interconnected.mp3) | 6,651,873 bytes; Git blob `09fe068192b76a3697c47ec1d604b527703db798` |
| Cross-round 2013 candidate | [`761.MP3`](https://raw.githubusercontent.com/rtkd/iddqd/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3) | 4,010,732 bytes; SHA256 `83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460` |
| Native extractor | [preserved OpenPuff v4.00 PE/DLL](https://github.com/codejanus/ToolSuite/tree/1eaf6d006d31ba842f6cc6b16e9d82dbf904aaf5/OpenPuff) | Original 2014 PE Git blob `466e03c792075313ce533a5dc7a789e8a41209f9`, original DLL and license pinned independently in the workflow |
| Settings | `33011033`; B/C disabled; native MP3 Maximum 1/2; first-file start; no ID3 stripping | Authenticated first against 745-byte 2014 positive |

The [manual-only Windows workflow](../.github/workflows/openpuff-2013-parable-source-gate.yml) uses the already source-audited [native original UI extractor](../sims/openpuff_v400_extract.py). It tests the 2014 control first and *stops* if that CRC/size validation fails, preserving source and GUI evidence. The only target is the unmodified 2013 MP3 with identical settings. No alternative passwords, bitrate levels, byte offsets, or restegged files are introduced.

## Decisive observation and stop rule

- **Actual extracted file with native CRC/completion:** preserve raw bytes and file metadata, test for an original GP29 key/plaintext or independently selected continuation. A random extracted file or readable-looking snippet alone is insufficient.
- **Native `completed-without-file`, with carrier and bit-level selected:** reject the exact 2014-settings→2013-audio cross-round payload route.
- **Timeout, UI error or incomplete tool gate:** inconclusive; preserve GUI and repair only reachable tool failure.

Success would make a new source-selected payload available for the 56 unsolved LP2 pages. No result has been executed yet; this note is a fully specified executable hypothesis and should remain in `workplace/` unless actual native evidence warrants promotion. Do not report it as a solved-page advance.
