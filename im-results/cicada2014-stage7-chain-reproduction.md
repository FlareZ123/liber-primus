# 2014 Stage 7 signed-hex → Interconnectedness → OpenPuff reproduction

**Status: complete as a composite, exact-byte reproduction (20 November 2026). Historical control only; no LP2 cipher inference.**

## Reproduced chain

The chain is established across two native Windows runs joined by the exact MP3 Git blob hash. It is not necessary for every stage to execute in one workflow: the output of the signed-hex stage is byte-identical to the input of the successful OpenPuff stage.

### 1. Signed page → hexadecimal payload → MP3

[Run 44708710753](https://github.com/FlareZ123/liber-primus/actions/runs/44708710753) verifies the original clear-signed Stage 7 page with GnuPG under Cicada fingerprint:

`6D854CD7933322A601C3286D181F01E57A35090F`

The verified page is 13,526,359 bytes with Git blob SHA-1 `afb1ae7b8ffe2def6d1cd7a2f7ce961e550331b9`. Its 13,303,746 hexadecimal characters decode to an MP3 with:

- Size: **6,651,873 bytes**
- Git blob SHA-1: **`09fe068192b76a3697c47ec1d604b527703db798`**
- The decoded MP3 matches both pinned Stage 7 archive copies byte-for-byte.

The two community archives are pinned at `cijhho123/cicada3301` commit `d360ad97d39c4719e42dc88b0cbbb81ed54aa02c` and `scream314/cicada3301` commit `10733feb487bb8beb9966d534727ee5897aa54fc`. Their copied files are useful byte controls, not independent first-party witnesses; the PGP signature authenticates the signed page content.

### 2. MP3 → OpenPuff → exact squares

[Run 43662139707](https://github.com/FlareZ123/liber-primus/actions/runs/43662139707), Windows job `positive-control (33011033)`, successfully runs the original OpenPuff v4.00 tool against the archived 2014 Interconnectedness MP3. The workflow verifies that input independently:

- Pinned source: `iBotPeaches/cicada_3301` commit `a0a616d85717af59f8b806875b43d51e06e1e874`
- Size: **6,651,873 bytes**
- Git blob SHA-1: **`09fe068192b76a3697c47ec1d604b527703db798`**
- MD5: **`7638414d35f416084b7ddcc94aa53685`**

This is the exact MP3 produced in step 1.

The original OpenPuff v4.00 files are pinned from `codejanus/ToolSuite` commit `1eaf6d006d31ba842f6cc6b16e9d82dbf904aaf5` and verified by Git blob SHA-1:

| File | Git blob SHA-1 |
|---|---|
| `OpenPuff.exe` | `466e03c792075313ce533a5dc7a789e8a41209f9` |
| `libObfuscate.dll` | `f3b1c3315f8286346416fefd6141410f422f2454` |
| `OpenPuff_license.txt` | `b0bab97d3c9906caada26fbb890a2a6fe028baa4` |

The executable reports PE file version **4.0.0.0**. The successful native settings are:

- Password A: **`33011033`**
- Passwords B and C: disabled
- Carrier: the 2014 Interconnectedness MP3
- Bit format: `Mp3 (Audio)`
- Bit selection: `Maximum (1/2)` (50%)

OpenPuff recovered the exact `magicsquares.txt`:

- Size: **745 bytes**
- SHA-256: **`9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f`**
- OpenPuff-native CRC32: **`6A8C41E3`**
- The extracted bytes are identical to `resources/cicada2014-openpuff-magic-squares.txt`.

Use the OpenPuff-native CRC, not zlib's standard CRC32: for these exact bytes zlib gives `5E547914`, while the OpenPuff-native MSB-first checksum gives the historical `6A8C41E3`. The exact successful output and original GUI evidence are preserved in [artifact 14141021011](https://github.com/FlareZ123/liber-primus/actions/runs/43662139707/artifacts/14141021011).

The alternate `33011103` matrix job failed at a file-picker stage before extraction. It is **untested**, not a password rejection. The successful `33011033` run is sufficient for the source-documented Stage 7 route.

### 3. Exact ordered 99-number stream

[Run 44806886086](https://github.com/FlareZ123/liber-primus/actions/runs/44806886086) re-fetches the pinned Stage 7 archive copies and verifies that:

- The `cijhho` `magicsquares.txt` is 721 bytes.
- The `scream314` `magicsquares.txt` is 745 bytes and has Git blob SHA-1 `0cff0a94f16a8603443619b6338def411c9f7bd5`.
- The local 745-byte reference has the same Git blob SHA-1.
- Both archive copies produce the same **ordered 99-number stream** as the local reference.

The 24-byte difference between the two text files is formatting; the numeric stream is identical. The native OpenPuff output matches the 745-byte local reference exactly, so the exact output and the 99-number comparison are both established.

## Reproduction entry points

- Signed-page and hex-decoding workflow: `.github/workflows/manual-stage7-reproduction.yml`
- Native OpenPuff workflow: `.github/workflows/openpuff-v400-ui-probe.yml`
- Native OpenPuff driver: `sims/openpuff_v400_extract.py`
- Existing exact output: `resources/cicada2014-openpuff-magic-squares.txt`
- Historical Stage 7 instructions: [cicada-solvers / fifth onion](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/b13600373d3400d75ec4208198019f3d92a304dd/2014/007-fifth-onion/README.md)

The failed Midas acquisition is retired. `https://mir.cr/05EYEMXF` redirects to `https://www.mirrored.to/files/05EYEMXF/` and returns HTML, not the expected ZIP. Runs [44806886086](https://github.com/FlareZ123/liber-primus/actions/runs/44806886086) and [44826560629](https://github.com/FlareZ123/liber-primus/actions/runs/44826560629) diagnose that obsolete mirror path; they do not invalidate the already successful native OpenPuff run. Do not repeat generic mirror searches or rerun the extraction merely to obtain a single-workflow transcript.

## Evidence boundary

This closes the documented **2014 Stage 7 media-to-squares handoff**. The fifth-onion README says the extracted squares' use is unknown at that stage, but the subsequent sixth-onion outguess instructions and PGP clear-signed Stage8 form (signature block present; independent verification not completed in this invocation) resolve their role: submit the three squares plus a Tor hidden-service URL. The form specifies a CGI upload endpoint (`/cgi-bin/upload`, field `file`) and a GnuPG public key at `/key.asc`; the HTML form names the three square fields `53301`, `71033`, `51033`. The archive records three further LP pages after submission. This is a source-authenticated **submission receiver**, not a square-to-text decoder for LP2 p33.

Nothing in this reproduction recovers unknown LP2 plaintext, selects an LP2 key schedule, identifies an LP2 reversible transform, or resolves the final Cicada destination. Keep the historical control separate from all LP2 cryptanalytic claims.
