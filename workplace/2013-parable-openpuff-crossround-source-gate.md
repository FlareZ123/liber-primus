# Original 2013 PARABLE audio under authenticated 2014 OpenPuff settings: native rejection

**Source hypothesis Agent10; source-native execution Agent26, 15 November 2026. Decision: this exact 2014-settings→2013 PARABLE MP3 handoff was rejected by the original OpenPuff v4.00 GUI.** [Native Windows run 43678061217](https://github.com/FlareZ123/liber-primus/actions/runs/43678061217) passed all steps, including the original 2014 745-byte/CRC32 positive, and then received **`Task interrupted - Error / Task stopped: corrupted stream`** on the unaltered 2013 carrier. Its source GUI presented 976 bytes of available native capacity. **No target file was extracted.** The [complete source-native evidence artifact 14147131271](https://github.com/FlareZ123/liber-primus/actions/runs/43678061217/artifacts/14147131271) contains the original window/error records, screenshots, source checks, and output inventory. This bounded negative neither finds a new LP2 plaintext/key nor excludes different independently selected passwords, levels, or carriers. [Director issue #1039](https://github.com/FlareZ123/liber-primus/issues/1039) owns the broader missing-key investigation.

## Why a 2014 solver might consider the 2013 carrier

An original Cicada 2013 file `AUDIO/761.MP3` carries the **exact later final-page PARABLE** text in its ID3 metadata. This is a concrete cross-round recognition cue visible to an early solver. Separately, original 2014 Stage07 `Interconnectedness` audio demonstrably hides a 745-byte square submission using **OpenPuff v4.00**, original password `33011033` and `Mp3 (Audio)` at **Maximum 1/2**. The complete native 2014 operation has recovered the original magic squares under positive CRC32 `6A8C41E3`. A solver noticing the duplicated PARABLE and remembering the successful MP3 extraction could apply that *same known operation* to the earlier MP3, as an affordable single-shot test.

**Strong competing account:** The 2013 MP3 has a documented, complete historical use as a raw XOR pad and as an ID3 text carrier. No signed Cicada message instructs a second OpenPuff extraction on that older file, and OpenPuff use in 2014 does not imply it was planted in 2013. This particular native extractor was already available in July **2012** ([period release record](https://www.snapfiles.com/apphistory/openpuff_history.html)), so the exact v4.00 program could have been used when the 2013 audio was created; that possibility remains unsupported by a first-party instruction. A successful extraction would be genuinely surprising; a no-file result should retire **only** this exact transfer.

## Exact frozen authentic inputs and settings

| Role | Unmodified first-party original file | Exact source check |
| --- | --- | --- |
| Source-positive 2014 carrier | [`interconnected.mp3`](https://raw.githubusercontent.com/iBotPeaches/cicada_3301/a0a616d85717af59f8b806875b43d51e06e1e874/tool/storage/interconnected.mp3) | 6,651,873 bytes; Git blob `09fe068192b76a3697c47ec1d604b527703db798` |
| Cross-round 2013 candidate | [`761.MP3`](https://raw.githubusercontent.com/rtkd/iddqd/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3) | 4,010,732 bytes; SHA256 `83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460` |
| Native extractor | [preserved OpenPuff v4.00 PE/DLL](https://github.com/codejanus/ToolSuite/tree/1eaf6d006d31ba842f6cc6b16e9d82dbf904aaf5/OpenPuff) | Original 2014 PE Git blob `466e03c792075313ce533a5dc7a789e8a41209f9`, original DLL and license pinned independently in the workflow |
| Settings | `33011033`; B/C disabled; native MP3 Maximum 1/2; first-file start; no ID3 stripping | Authenticated first against 745-byte 2014 positive |

The [executed Windows workflow](../.github/workflows/openpuff-2013-parable-source-gate.yml) uses the original OpenPuff 4.00 UI and [native extractor](../sims/openpuff_v400_extract.py). Its signed original source checks, historical 2014 positive and 2013 trial all ran on the same Windows job; no additional passwords, bitrate levels, byte offsets or restegged files were introduced. The source extractor now [records the exact native corrupted-stream terminal error](https://github.com/FlareZ123/liber-primus/commit/9e2f4913d794c70873f8aa13e2e4e7aeedc9bea5) rather than reporting it as an inconclusive timeout. The patched offline regression passed as a prerequisite of this original native job.

## Completed original-native result and decision

| Independent source check / final observation | Result |
| --- | --- |
| Windows workflow and original GUI evidence | [Run 43678061217](https://github.com/FlareZ123/liber-primus/actions/runs/43678061217), completed successfully at 04:46:51 UTC; [artifact 14147131271](https://github.com/FlareZ123/liber-primus/actions/runs/43678061217/artifacts/14147131271) |
| Fixed 2014 source-positive gate | Authenticated original OpenPuff v4.00, A=`33011033`, B/C disabled, MP3 Maximum 1/2, saved original 745-byte `magicsquares.txt`, matching required native CRC32 `6A8C41E3` |
| Original 2013 `761.MP3` | Original 4,010,732-byte historical file and pinned SHA-256 successfully checked; original ID3 retained |
| Native JPEG/MP3 bit selection | `Mp3 (Audio)`, `1/2 (50%) - Maximum`, 976 bytes available in the original OpenPuff GUI |
| Native result | No extracted file; exact `Task interrupted - Error` / `Task stopped: corrupted stream` GUI error, including OpenPuff's generic hints about password, carrier/order and bit level |
| Source driver's unambiguous terminal classification | `native_probe_outcome: native-corrupted-stream`, `output_present:false` and saved nonempty `error_dialogs` |

The original 2013 carrier **is rejected under this precise independently validated transfer**. OpenPuff's native message identifies an unreadable payload under the chosen settings; it does not determine whether the original carrier contains an independently encoded payload under another key. No 2013 source directs a different OpenPuff password, bit level or carrier set. Without such a selector, searching alternatives would be unconstrained key hunting. The 2013 carrier's historical raw XOR and ID3 roles remain intact.

**Decision for the LP2 puzzle:** do not route further GP29 decipherment through a hypothetical 2013 OpenPuff file under the authenticated 2014 settings, since that file was not recovered. This is a bounded source-to-key rejection rather than plaintext discovery; the broader LP2 encryption and Cicada destination remain unknown.
