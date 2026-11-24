# Huh2.jpg is an exact two-page composite

**Classification:** verified archival byte identity; not an LP2 decryption, key, or independent ciphertext.

## Finding

The archived 2014 file `Huh2.jpg` is exactly:

```text
resources/liber-primus/01.jpg || reverse(resources/liber-primus/02.jpg)
```

The first segment is 1,476,614 bytes. The reversed second segment is 175,159 bytes. The concatenation is 1,651,773 bytes.

This is stronger than matching file lengths or marker patterns: reconstructing the concatenation from the repository's original page images reproduces both the external GitHub blob ID and the independently catalogued SHA-256 of the complete Huh2 file. The trailing segment's SHA-256 also matches the independent trailer hash.

## Reproducible evidence

| Object | Bytes | SHA-256 | Git blob SHA-1 |
|---|---:|---|---|
| `00.jpg` | 168,876 | `184e6f9de8695d99435c2bef4fd7e304a8a0f704dbe04439fa8bf13c4da395a7` | `b99a2532e76bba018b2ace579238dd07e4fd3dbc` |
| `01.jpg` | 1,476,614 | `71f4bd03c692ede630091272597d2b18702184ed32fdd1977ef0ba7306632b46` | `73142da4b986c2679a100ac7be5399619d87843b` |
| `02.jpg` | 175,159 | `0297572bbc2d234f84df634c6f0474011ff5df66c2ce987c3bb7aa0c635799b4` | `ee89ee08025c4476294700a803626c9f631e115f` |
| `reverse(02.jpg)` | 175,159 | `0d7a3ec5339b6578a68124f9f4a4e8626803613c97064aee304acc1f81866ae6` | — |
| `01.jpg || reverse(02.jpg)` | 1,651,773 | `325ee77f09216cb6ca866ee5ef89ce68e068a3275c2788a6880d6653bc6ef89f` | `aa5b1bad888710826c929529d61dae81ff308e77` |

The external `cijhho123/cicada3301` tree identifies `Liber_primus.jpg` with blob SHA-1 `b99a2532...`, `Intus.jpg` with `ee89ee...`, and `Huh2.jpg` with `aa5b1bad...`. The reconstructed local `00.jpg` and `02.jpg` match the first two external blob IDs; the reconstructed Huh2 composite matches the third.

The independent `Dukotah/cicada3301` `TRAILING-DATA.json` record gives Huh2's full-file SHA-256 as `325ee77f...`, image end offset 1,476,614, trailer length 175,159, and trailer SHA-256 `0d7a3ec5...`. All match the reconstruction.

## Interpretation

- The previously unclassified 175,159-byte Huh2 trailer is not a new payload: it is the byte-reversed `02.jpg` page.
- The Huh2 file body is exactly `01.jpg`.
- The first three pages in the repository's image sequence therefore account for the entire Huh2 artifact.
- A 2014 walkthrough independently describes extracting three JPEGs from a bitwise-inverted stream and reversing the final JPEG. That historical account is consistent with this file structure, although image labels in secondary accounts should not override byte identity.
- This establishes an archival packaging/reversal fact. It does **not** establish that LP2 uses byte reversal as a cipher, nor does it provide an LP2 key or plaintext. Do not promote this into a key hypothesis without a separate clue that selects the operation on unsolved ciphertext.

## Reproduction

Run from the repository root:

```bash
python sims/reconstruct_huh2_composite.py
```

The script verifies the page hashes, trailer hash, reconstructed Huh2 SHA-256, and external Git blob SHA-1.

## Sources

- Original archive: [cijhho123/cicada3301 — Huh2.jpg](https://github.com/cijhho123/cicada3301/blob/main/2014/additional%20images/Liber%20primus%20pages/Huh2.jpg), [Liber_primus.jpg](https://github.com/cijhho123/cicada3301/blob/main/2014/additional%20images/Liber%20primus%20pages/Liber_primus.jpg), [Intus.jpg](https://github.com/cijhho123/cicada3301/blob/main/2014/additional%20images/Liber%20primus%20pages/Intus.jpg)
- Independent trailer inventory: [Dukotah/cicada3301 — TRAILING-DATA.json](https://github.com/Dukotah/cicada3301/blob/main/corpus/A-primary-artifacts/TRAILING-DATA.json)
- Historical 2014 extraction account: cited in the research conversation; it describes the third extracted JPEG as reversed.
