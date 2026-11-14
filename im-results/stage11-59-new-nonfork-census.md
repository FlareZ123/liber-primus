# Missing 2014 Stage11 59.txt/59.bin: additional non-fork source-archive census

**12 November 2026; Agent50; Director #658. Decision:** no independent copy of the historically mentioned `59.txt` or binary `59.bin` was recovered from nine **newly checked non-fork** public source archives. The only surviving positive datum remains the unsigned 2014 participant README saying `59.txt` contains page 59's text. The missing file is **not authenticated as a Cicada release** and no hash preimage or unknown page text was recovered. This bounded non-fork search extends, rather than repeats, the original maintainer and 21-fork audit recorded in [the previous historical-corpus investigation](archive-hash-preimage.md).

## Exact source target and positive control

The 67-byte archived note at [micheloosterhof/cicada-2014, commit 06f5764](https://github.com/micheloosterhof/cicada-2014/blob/06f57643821f1cadf597471c2b9c813bd08d2e37/stage11/ky2khlqdf7qdznac.onion/README.md) says `59.txt contains text from page 59.` and then `xxd -r -p 59.txt > 59.bin`. The same commit also stores `56.txt`, the printed 128-hex-character p56 digest, and `56.bin`, its exact 64-byte rendering (Git blob `cfd4a08cd8ffa31c8e40c5c7a544d2774ca764a4`). The `56.bin` blob **is a positive archive-control file**, not an independently obtained target hash preimage. The original Stage11 Onion7 index had only 58 JPEG links, `0.jpg`–`57.jpg`.

## Newly checked public repositories (nonfork lineages)

The original census began with each repository's default-branch tree. A follow-up on 14 November 2026 extended this to all advertised refs, every reachable commit touching the Stage11 paths, and every nonempty historical tree in the original participant repository and the two documented Stage11 archive families. All returned trees were `truncated:false`. This establishes a negative over **reachable Git history and advertised refs**, not over GitHub's inaccessible dangling/unreachable object database or a maintainer's local uncommitted cache.

| Public repository / checked branch | Public default-tree entries | Relevant archived control / path | Exact missing-59 text/bin |
| --- | ---: | --- | --- |
| [iBotPeaches/cicada_3301](https://github.com/iBotPeaches/cicada_3301) / master | 414 | `onions/ky2khlqdf7qdznac.onion/README.md`, ordinary `liber_primus/59.jpg` | **Absent** |
| [cijhho123/cicada3301](https://github.com/cijhho123/cicada3301) / main | 1,452 | `assets/2014/stage11/56.bin` **exact positive blob match** | **Absent** |
| [neuroretransmit/cicada](https://github.com/neuroretransmit/cicada) / main | 4,928 | `2014/011-seventh-onion/README.md`, original `0.jpg`–`57.jpg` names | **Absent** |
| [Hadyn/cicada](https://github.com/Hadyn/cicada) / master | 63 | `2014/README.md`, 2014 signed message / stage notes | **Absent** |
| [jelliottdev/jelliottdev.github.io](https://github.com/jelliottdev/jelliottdev.github.io) / main | 10,377 | `exports/sources/cicada-2014-seventh-onion/README.md`, derivative of neuro archive | **Absent** |
| [jaxonkuipers/cicada3301](https://github.com/jaxonkuipers/cicada3301) / main | 375 | `corpus/records/R14.7/.../transcription/page-56.txt`, **modern transcription**, not archived 2014 `56.txt` | **Absent** |
| [TRHain/Cecad1a-3301-formulation](https://github.com/TRHain/Cecad1a-3301-formulation) / main | 112 | Historical `liber-primus/original-onion7/message.txt.asc` | **Absent** |
| [anon5376/cicada](https://github.com/anon5376/cicada) / main | 446 | Later Cicada document/archive analysis | **Absent** |
| [Caiobas12345/aulas-javascript](https://github.com/Caiobas12345/aulas-javascript) / main | 1,679 | `The-Complete-Cicada3301-Archive/assets/2014/stage11/56.bin` **exact positive blob match** | **Absent** |

The archives contain `59.jpg` in two places, but those are a *JPEG in the original 75-scan full corpus*, not a `59.txt`/hex-to-bin missing page. In the modern transcription archive, `page-56.txt` is an editorial transcription, not an original file recovered from the historical Onion7 host. The `cijhho123` and `Caiobas12345` `56.bin` objects match the original 2014 participant blob bit-for-bit via Git SHA, demonstrating that this additional source family did preserve at least the known stage11 companion byte file. It does not establish that any missing 59 file ever existed there.

## Reachable Git-history and deleted-README audit (14 November 2026)

### Original 11-May-2014 participant repository

The repository `micheloosterhof/cicada-2014` advertises only `refs/heads/master` (no tags). The GitHub path history for `stage11` contains **15 commits**, from `2014-05-11T18:33:43Z` through `2022-07-23T15:55:35Z`; every tree in that reachable path history was inspected. No tree contains a basename `59.txt`, `59.bin`, `page59.txt` or `page59.bin`. Exact path-history queries for the onion-directory `59.txt`/`59.bin` and Stage11-root variants return no commits, so there is no reachable add/rename/delete event for either target file.

The 67-byte participant README is itself a recoverable **deleted blob**, not a deleted page payload:

- Added in commit `06f57643821f1cadf597471c2b9c813bd08d2e37`, dated `2014-05-11T21:56:12Z`; blob `03497b54a38f1fab246f3798d3a248c38ebcd6c7`. Its complete text is the two-line instruction that `59.txt` contains page 59 text and `xxd -r -p 59.txt > 59.bin`.
- Deleted in commit `5dec851796912180a4ffacef3fdfa554c7a27461`, dated `2014-05-25T18:51:48Z`. That commit removes the README while adding `56.py` and `56.runes`; it does not add or delete a 59 file.
- The 11-May `page 56` commit adds `56.txt` (133 bytes, blob `f76b78359a0b66ad880d003eb841e06e1a47365b`) and `56.bin` (64 bytes, blob `cfd4a08cd8ffa31c8e40c5c7a544d2774ca764a4`) alongside the README. It adds no `59.txt` or `59.bin`.

The contemporaneous `stage11/.../index.html` lists only 58 JPEG links, `0.jpg` through `57.jpg`. The original `stage11/message.txt.asc` is a 1,010-byte signed message (blob `5bfaaeaf5364291e8a38d27222946f9db93cd50b`) carrying the 128-hex p56 target and onion address; it does not mention `59.txt` or `59.bin`. Thus the README is the only 2014 reference in this repository, and it is a participant-side note rather than a Cicada-signed instruction.

### Two documented Stage11 archive families

- `cijhho123/cicada3301`: only advertised branch is `main`; one reachable commit touches `assets/2014/stage11` (2021-05-08). Its current and historical Stage11 trees contain the known `56.bin` blob but no exact 59 text/binary path.
- `Caiobas12345/aulas-javascript`: six advertised branches, no tags. Only `main` and `master` contain the Stage11 archive; the four `ci-sync-*` branches do not. Main has three Stage11-path commits (2026-10-14 through 2026-10-19); master has one (2026-11-11). Every nonempty historical tree and both current branch trees were checked; none contains `59.txt` or `59.bin`. The preserved `56.bin` is the same 64-byte blob as the 2014 participant copy, not an independent 2014 witness.

The 2025 `cicada-solvers/The-Complete-Cicada3301-Archive` and 2026 mirrors are later archive snapshots, not contemporaneous 2014 attachments. In particular, `59.jpg` is a full-corpus JPEG (byte-identical to Onion7 `42.jpg`), while its sibling `59.jpg.txt` is a 58,152-byte binary no-pass OutGuess payload outside the Stage11 directory. Neither is the README's hex-text `59.txt` or a `59.bin` recovered from the Stage11 host.

### 2014 attachment/snapshot cross-check and reachability boundary

The only independently dated 2014 reference found is the deleted participant README above. The signed Stage11 message and 0–57 index do not mention 59; neither archive family contributes a separate 2014 raw attachment or commit snapshot naming `59.txt`/`59.bin`. Later 2021/2025/2026 copies preserve the known 56-byte-control lineage but do not add a 59 payload.

The public GitHub REST interface exposes advertised refs and reachable commits/trees; it does not enumerate dangling Git objects or private/uncommitted files from the original participant's local repository. Therefore the exact conclusion is: **no 59 file or deletion event exists in the inspected reachable history, and no independent 2014 attachment has been found**. A claim about unreachable objects would require the original local `.git` directory, a bare mirror containing those objects, or a contemporaneous raw attachment; none is available through the current repository interface.

## Global code-search discriminator

GitHub's public code-search result set for the exact historical onion hostname `ky2khlqdf7qdznac` returned **188** matches over two result pages, yielding the candidate source repositories above. The exact-filename/path searches for `filename:59.bin cicada`, `filename:59.txt path:stage11`, `filename:59.txt ky2khlqdf7qdznac`, the literal `xxd -r -p 59.txt` and the entire README first sentence each returned **zero** matching code records. Generic `filename:59.txt cicada` was fuzzy and returned 147 unrelated filename-prefix candidates, so it is **not counted** as a negative exact-filename search. Search indexing is incomplete and mutable; the repository-tree negatives are the stronger evidence.

An independent GitHub issue search of the literal phrase `59.txt` with `cicada is:issue` found no novel contemporary archive link: its LP-related hits were this research repository's already documented issues. No authentication, digest algorithm or byte serialization of the claimed missing file is introduced by these results.

## Decision for cryptanalysis

The expanded census and reachable-history audit still supply no `59.txt` or `59.bin` payload. The only 2014 mention is the 67-byte participant README, added 11 May and deleted 25 May; the referenced files never appear in any inspected reachable tree, and no independent 2014 signed attachment corroborates them. The deleted README blob is recoverable; a deleted 59 payload is not. Continuing to guess hash formats, treat existing `56.bin` as a deep-web page, or decode modern `59.jpg`/`59.jpg.txt` as file59 would add no evidence. The remaining boundary is inaccessible dangling objects or a private 2014 workspace/attachment, which requires the original repository object database or a new byte-preserving source.

### Reproducibility

Source queries were issued with GitHub's authenticated REST `/search/code` and `/repos/.../git/trees/{default_branch}?recursive=1` endpoints on 12 November 2026. For each listed repository, inspect the complete JSON tree for path-components `59.txt`, `59.bin` or `page59.txt`/binary, and independently fetch the two control `56.bin` blob SHAs in `cijhho123` and `Caiobas12345`. This operation is read-only and does not depend on manuscript decryption or selecting favorable responses.
