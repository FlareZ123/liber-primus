# Archived 2014 OpenPuff MP3 versus the 256-cell LP2 table

**Agent 40, 14 November 2026. Original-byte result:** no literal LP2 table reuse was found in the complete archived `Interconnectedness` MP3. This is a bounded original-source rejection, with **no unknown LP2 plaintext, key, cipher inverse or recovered destination**.

## Source-selected question

The original 2014 puzzle used OpenPuff with an MP3 carrier. Its internal carrier format uses a **256-byte encrypted IV**, as documented in [LibrePuff's independent OpenPuff-compatible source](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/carrier.rs). A [published OpenPuff steganalysis study](https://doi.org/10.1371/journal.pone.0195737) separately identified a **256-byte inserted block** in some OpenPuff MP3 outputs. The original LP2 pp49–51 table has **256 numeric cells in 32 rows by eight**. The sixteen natural adjacent pairs of rows are sixteen 16-byte groups. This gives a historically plausible and fully falsifiable *literal reuse* hypothesis. A shared size alone does not authenticate a key or transfer operation.

## Exact original test

- Source table: [canonical original 256 base60-decoded bytes](../resources/liber-primus/lp2-grid-256.json), SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Its printed row-major order is not altered.
- Archived [2014 `interconnected.mp3`](https://github.com/iBotPeaches/cicada_3301/blob/a0a616d85717af59f8b806875b43d51e06e1e874/tool/storage/interconnected.mp3): **6,651,873 bytes**, Git blob SHA1 `09fe068192b76a3697c47ec1d604b527703db798`, SHA256 `1ce3839b4a62462d9009c4469acc189b523e1bdcf338cb49cda1cd7bb4efffc6`. Both hash identities and exact length verified before testing.
- Search **every byte offset in the entire MP3** for the complete 256-byte table and, separately, each of its **32 eight-byte printed rows** and **16 sixteen-byte paired-row blocks**.
- **Original results:** full table absent (`offset=-1`); **0/32** eight-byte rows matched anywhere; **0/16** paired-row blocks matched anywhere.
- An independently planted 256-byte table at synthetic offset740 is retrieved exactly with all 32 row matches and all 16 paired-row matches; an unchanged synthetic carrier returns none. This positive exercises the same extraction and comparison code.
- The original MP3 also lacks the published study's particular `0000348380004c414d45332e39` LAME-adjacent signature and any literal `LAME` token in its first 65,536 bytes. The study's fingerprint covered only a subset of OpenPuff MP3 outputs; its absence is no generic steganography exclusion.

## Cryptanalytic decision

The original 2014 carrier did not literally carry the manuscript's printed numerical table in its unchanged row-major byte order or in any of its printed eight-byte subrows. There is consequently **no evidence for cross-round literal IV reuse** under the source-motivated model. An IV may be separately random or transformed; the manuscript still supplies no source-selected operation to map its grid into an OpenPuff carrier or GP29 plaintext. Avoid extending this negative into arbitrary byte shifts or undisclosed transformations.

The open-source LibrePuff implementation currently parses only WAV carriers; its MP3/JPEG paths are unimplemented. The [original OpenPuff GUI execution task #39](https://github.com/FlareZ123/liber-primus/issues/39) is a distinct still-blocked investigation. This byte-exact test has no dependency on its GUI or passwords.

**Executable SFT:** [Node22 original-byte comparator with positive control](../sims/lp2_openpuff_256_iv_source_gate_sft.cjs). **Verified original run:** [GitHub Actions #43597398648](https://github.com/FlareZ123/liber-primus/actions/runs/43597398648) using [the manual workflow](../.github/workflows/lp2-openpuff-mp3-grid-iv.yml). The full JSON result is in the job log.

## Agent 14 extension, 27 November 2026: distinguish fixed IV constants from extracted carrier IV

The compatible implementation's [chain.rs](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/chain.rs) (Git blob `eb0d9b284a54256c888b983e64399ab6897c8bd6`) identifies three different 256-byte objects: fixed sixteen-cipher IV-decryption constants, the carrier-specific encrypted IV decoded from whitened carrier bits, and the decrypted carrier-specific IV. The fixed constants are a directly available candidate operand, distinct from searching for the printed bytes in the original MP3. In this implementation the first carrier's IV decryption is password independent; its key is `0x502239c3` and its IV decryption password is the zero-padded decimal representation of that key. The application password is used for the subsequent content decryption. This establishes an implementation-specific distinction, not an independently verified v4.00 implementation claim.

Tested the fixed constants in the exact declared cipher order against original 256 numeric tokens under radix60 and the competing omitted-lowercase-f radix59, with no fitted transforms. An exact multiset overlap provides a lower bound on necessary byte substitutions over **all** position permutations, including row/column permutations and mirror readings.

| Codec | Aligned equal bytes | Minimum substitutions after arbitrary permutation | Exact 16-byte source blocks shared |
|---|---:|---:|---:|
| Radix60 | 0/256 | 136 | 0/16 |
| Radix59 (omit f) | 0/256 | 133 | 0/16 |

Executed against the remote original fixture (Git blob `2550eae357442912220e05dc51147523a61dd75a`) and the remotely fetched constants. [Reproducer](../sims/lp2_openpuff_fixed_iv_gate_sft.cjs) includes identity, permutation and one-byte mutation controls; the equivalent numerical calculation was executed in the connected JavaScript environment, but the committed Node script has not been executed separately.

**Decision:** reject the table as a direct byte permutation of the compatible implementation's fixed constants. The earlier raw-carrier search does not test the carrier-specific extracted IV. Do not treat this result as excluding that latter hypothesis. The discriminating remaining experiment is a byte-exact comparison with the encrypted and decrypted IV from the known successful original 2014 MP3 extraction, calibrated by the authentic 745-byte recovered payload. The compatible implementation only supports WAV parsing and the historical MP3 was unavailable to this invocation locally; that experiment remains unexecuted. No LP2 plaintext or key was recovered.
