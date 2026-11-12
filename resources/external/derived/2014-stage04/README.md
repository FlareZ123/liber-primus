# 2014 Stage04 3301 extracted objects (derived)

These files are **derived outputs**, not original manuscript images. They preserve the unresolved OutGuess object and the small, reproducible payloads recovered from the 2014 third-onion / `<!--3301-->` update.

## Pinned source

- Participant archive: [neuroretransmit/cicada, commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/005-third-onion)
- Source instructions: [README.md](https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/005-third-onion/README.md) and [decode.sh](https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/005-third-onion/decode.sh)
- The archive's `onion3.bin` and `infotomb-server-status.bin` are the same 2,116,096-byte Git blob (`dedbe57644cf549e705fe1b6770b358b493f7758`). The script takes the first JPEG from the forward object and another from the reversed status object.

## Preserved derived outputs

| File | Bytes | Git blob SHA-1 | Meaning |
|---|---:|---|---|
| `03-outguess.asc` | 31,809 | `2a355d1bf14d37041384f09d8700e2ee274a13e6` | OutGuess output from page 03; PGP clear-signed text, including “Let the text guide you” and a hex-embedded JPEG |
| `03-small-rune-image.jpg` | 15,188 | `f91bdd6e2a890968a5a13d39be4d56899b877920` | JPEG extracted from the `ffd8`…`ffd9` hex span in the signed text |
| `04-outguess.bin` | 7,524 | `d738b052bf0548e2f431e231af7ef1514becb4ad` | OutGuess output from page 04; opaque binary, retained without guessed decryption |
| `05-square.txt` | 178 | `f081bf3bd3cb45b55359fa0e8961b1f033aa10c7` | Same square text without final LF; the pinned 2014 README's full `matrix` output is 179 bytes with LF (blob `faba9f1780d667a0ecd7d9499b41a1f8fbc5dbbd`) |

## Exact relationship to original LP1 resources

- Stage04 `03.jpg` (892,759 bytes; blob `fb390cedd9e26547f0b39563a1ce8998f0def030`) is byte-identical to `resources/liber-primus/03.jpg`.
- Stage04 `04.jpg` (1,223,337 bytes; blob `e6a27cd5b25948d27d3af5ba029e4ba44fbff46f`) is byte-identical to `resources/liber-primus/04.jpg`.
- Stage04 `server-status.bin` (673,066 bytes; blob `2829e13812015601ff1014cb4427587b4a8aa3a6`) is byte-identical to `resources/liber-primus/05.jpg`. Its exact layout is a 336,353-byte JPEG prefix (blob `7369644b99426a57d1a41819306bfd7be8935f5f`), a 360-byte out-of-bounds (OOB) field, and a 336,353-byte suffix that is the **exact byte reversal** of the JPEG prefix.
- The first JPEG EOI occupies bytes 336,351–336,352. The OOB field occupies `[336353,336713)`: `\n\na` followed by 357 ASCII hex characters. The suffix occupies `[336713,673066)` and equals `reverse(prefix)` byte-for-byte; it contains no independent second payload.
- The pinned 2014 Stage04 README's full extraction (`dd ... skip=336353 count=360 | rev | xxd -p -r`) yields the 179-byte `matrix` file (Git blob `faba9f1780d667a0ecd7d9499b41a1f8fbc5dbbd`), including its final LF. The separate 357-character one-liner at offset `0x521e4` (336,356) yields the 178-byte `05-square.txt` (Git blob `f081bf3bd3cb45b55359fa0e8961b1f033aa10c7`) without that LF. These are the same square; the difference is only the line terminator. The `a` nibble in the OOB prefix pairs with the final unmatched `0` nibble of the reversed 357-character window to form `0x0a` in the full extraction.
- The archived `server-status.data` text copy is 359 bytes (blob `0caa28ad1f9b32528019a3c27a16f38258ffb51e`): it omits the two leading linefeeds and appends one final LF, preserving the same hex stream.
- The 5×5 square has row, column and diagonal sums of 1033. The `<!--3301-->` marker is not the square sum.

## Surrounding Stage04 page\n\nThe original `server-status` response is an Apache 2.2.22 mod_status page with ordinary server fields (server build, current/restart times, parent generation, uptime, access/traffic counters, CPU/request rates, and active/idle workers). The separate Stage04 landing page `fv7lyucmeozzd5j4.onion/index.html` is 524 bytes: `<!--1033-->` plus a 512-character hexadecimal string, preserved locally as `resources/external/2014-stage04-index.html`. The participant walkthrough says that string matched the prior onion's growing value. It is not part of the 673,066-byte server-status object and supplies no independently specified LP2 operation or consumer.\n\n## Interpretation and limits

The updated 3301 payload reconstructs LP1 pages 03–05 and the already-known 2014 continuation. The page-03 signed OutGuess message and its small rune image lead to the fourth-onion waypoint; the page-05 OOB field decodes to the established 1033 square. This is a concrete historical connection, **not** an LP2 key or transfer.

`04-outguess.bin` has no common file signature among the formats tested by the SFT and has measured byte entropy of about 7.978 bits/byte. That is an observation, not proof of encryption or a license to guess transforms. It remains an opaque 2014 OutGuess object. No source-selected operation connects it to LP2.

Run `node sims/cicada2014_stage04_3301_object_inventory_sft.cjs` to reproduce local identity and extraction checks. The PGP clear-signature was verified successfully in [workflow run 43065776356](https://github.com/FlareZ123/liber-primus/actions/runs/43065776356) against `resources/control/cicada-3301-public-key.asc` (fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`).

Full research decision: [Stage04 1033/3301 source gate](../../../../im-results/cicada2014-stage04-256-p50-direct-identity-gate.md).
