# 2014 Stage04 1033/3301 source gate: LP1 artifact boundary

**Decision:** the updated Stage04 `<!--3301-->` material is a continuation of the earlier LP1/2014 chain, not a source-selected LP2 key or operation. The 04-page OutGuess output is preserved as an opaque unresolved binary; it is not silently classified as plaintext, a key, or a known cipher.

## Pinned source and extraction contract

The participant archive `neuroretransmit/cicada` is pinned at commit [`ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/005-third-onion). Its `README.md` and `decode.sh` describe the Stage04 third-onion update, the `onion3` and status-page hex streams, byte reversal, JPEG boundary extraction, OutGuess extraction, and the fixed page-05 trailer extraction. These are participant-preserved artifacts, not a newly authenticated creator statement.

The archive records `onion3.bin` and `infotomb-server-status.bin` as the same 2,116,096-byte object (Git blob `dedbe57644cf549e705fe1b6770b358b493f7758`). The extraction script takes page 03 from the forward stream and page 04 from the reversed status stream. The separate `server-status.bin` is 673,066 bytes.

## Recovered objects and exact identities

| Object | Size | Git blob SHA-1 | Result |
|---|---:|---|---|
| Stage04 `03.jpg` | 892,759 | `fb390cedd9e26547f0b39563a1ce8998f0def030` | Exact byte identity with `resources/liber-primus/03.jpg` |
| Stage04 `04.jpg` | 1,223,337 | `e6a27cd5b25948d27d3af5ba029e4ba44fbff46f` | Exact byte identity with `resources/liber-primus/04.jpg` |
| Stage04 `server-status.bin` | 673,066 | `2829e13812015601ff1014cb4427587b4a8aa3a6` | Exact byte identity with full `resources/liber-primus/05.jpg` |
| Extracted Stage04 `05.jpg` prefix | 336,353 | `7369644b99426a57d1a41819306bfd7be8935f5f` | Exact prefix of the full page-05 artifact, ending at its first JPEG EOI |
| `03.jpg.asc` OutGuess output | 31,809 | `2a355d1bf14d37041384f09d8700e2ee274a13e6` | PGP clear-signed text; says “Let the text guide you” and contains a hex-embedded JPEG |
| Embedded small JPEG | 15,188 | `f91bdd6e2a890968a5a13d39be4d56899b877920` | Exact extraction of the `ffd8`…`ffd9` span in `03.jpg.asc` |
| `04.jpg.bin` OutGuess output | 7,524 | `d738b052bf0548e2f431e231af7ef1514becb4ad` | Opaque binary; no common file signature in the tested set; retained for future clue-led work |
| `square.txt` | 178 | `f081bf3bd3cb45b55359fa0e8961b1f033aa10c7` | Exact result of the fixed page-05 trailer extraction |

The three page-image identities are decisive: Stage04's 03/04 images are the original LP1 pages 03/04, and the complete `server-status.bin` is the repository's full LP1 page-05 artifact. This is not merely similar rune content; the Git blob identities match.

## Reproduced page-05 square

The first JPEG EOI ends at byte 336,353. The source decoder then selects 357 bytes at offset `0x521e4` (336,356), reverses that window, and passes it to plain-hex decode. The window contains 357 hexadecimal characters, so the final unmatched nibble is discarded by `xxd -p -r`; the output is exactly 178 bytes. This run reproduces the stored `square.txt` byte-for-byte from `resources/liber-primus/05.jpg`.

The recovered 5×5 square has every row, column and both main diagonals summing to 1033. It is the already-established 2013 `0_wisdom` / LP1 page-05 square. The `<!--3301-->` marker is not the square sum and does not create a new numerical key.

## OutGuess payloads and what remains unknown

- The page-03 OutGuess output is a PGP clear-signed text containing “Let the text guide you” and a small JPEG. The embedded JPEG is now preserved separately and checked byte-for-byte against the hex span. The clear-signature was verified successfully in [workflow run 43065776356](https://github.com/FlareZ123/liber-primus/actions/runs/43065776356) against `resources/control/cicada-3301-public-key.asc` (fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`). The embedded small rune JPEG is therefore covered by the verified signed text.
- The page-04 OutGuess output is a 7,524-byte binary with measured Shannon entropy about 7.978 bits/byte. It has none of the common JPEG, PNG, GIF, ZIP, GZIP, PDF, ELF, BZIP2 or XZ signatures tested by the SFT. These observations do not prove encryption or identify a cipher. The bytes are preserved at `resources/external/derived/2014-stage04/04-outguess.bin` for future work if a source-selected key or operation appears.
- The page-05 trailer is the 1033 square, already tied to the earlier wisdom puzzle. No LP2 reference, source-derived LP2 key, or exact LP2 byte/rune sequence is present in the recovered object inventory.

## Relationship to the earlier 256-byte object

The separate Stage04 `<!--1033-->` 256-byte object remains nonidentical to the LP2 p50 table under the two source-selected direct traversals already tested in [the 256-byte SFT](../../sims/lp2_stage04_256_direct_identity_sft.cjs). The updated `<!--3301-->` page does not repair that failed identity: it recovers LP1 pages 03–05 and their 2014 continuation.

## Reproduction

- Derived outputs are preserved under `resources/external/derived/2014-stage04/`, explicitly marked as participant-archive extractions rather than original manuscript pages.
- Run `node sims/cicada2014_stage04_3301_object_inventory_sft.cjs` to verify Git blob identities, the embedded small JPEG, the page-05 trailer extraction, the 1033 square sums, and the opaque page-04 payload metadata.
- Workflow: `.github/workflows/cicada2014-stage04-3301-source-gate.yml` also verifies the page-03 PGP clear-signature with `resources/control/cicada-3301-public-key.asc`.

**Conclusion for Issue #298:** the historical Stage04 hex material is mapped to LP1 pages 03–05 and the known 2014 onion continuation. It does not select an LP2 operation or interval. Close the LP2-transfer hypothesis; retain the opaque page-04 OutGuess bytes without speculative decoding.

