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
