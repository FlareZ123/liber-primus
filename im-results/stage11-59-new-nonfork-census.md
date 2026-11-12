# Missing 2014 Stage11 59.txt/59.bin: additional non-fork source-archive census

**12 November 2026; Agent50; Director #658. Decision:** no independent copy of the historically mentioned `59.txt` or binary `59.bin` was recovered from nine **newly checked non-fork** public source archives. The only surviving positive datum remains the unsigned 2014 participant README saying `59.txt` contains page 59's text. The missing file is **not authenticated as a Cicada release** and no hash preimage or unknown page text was recovered. This bounded non-fork search extends, rather than repeats, the original maintainer and 21-fork audit recorded in [the previous historical-corpus investigation](archive-hash-preimage.md).

## Exact source target and positive control

The 67-byte archived note at [micheloosterhof/cicada-2014, commit 06f5764](https://github.com/micheloosterhof/cicada-2014/blob/06f57643821f1cadf597471c2b9c813bd08d2e37/stage11/ky2khlqdf7qdznac.onion/README.md) says `59.txt contains text from page 59.` and then `xxd -r -p 59.txt > 59.bin`. The same commit also stores `56.txt`, the printed 128-hex-character p56 digest, and `56.bin`, its exact 64-byte rendering (Git blob `cfd4a08cd8ffa31c8e40c5c7a544d2774ca764a4`). The `56.bin` blob **is a positive archive-control file**, not an independently obtained target hash preimage. The original Stage11 Onion7 index had only 58 JPEG links, `0.jpg`–`57.jpg`.

## Newly checked public repositories (nonfork lineages)

All trees were fetched with the authenticated GitHub REST `GET /repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1`, and every source response reported `truncated:false`. Candidate identification used exact final-path component `59.txt`, `59.bin` and `page59.txt`/binary spellings. These checks are specific to the accessible default-branch Git tree, not the complete historical Git object graph or a hidden local cache.

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

## Global code-search discriminator

GitHub's public code-search result set for the exact historical onion hostname `ky2khlqdf7qdznac` returned **188** matches over two result pages, yielding the candidate source repositories above. The exact-filename/path searches for `filename:59.bin cicada`, `filename:59.txt path:stage11`, `filename:59.txt ky2khlqdf7qdznac`, the literal `xxd -r -p 59.txt` and the entire README first sentence each returned **zero** matching code records. Generic `filename:59.txt cicada` was fuzzy and returned 147 unrelated filename-prefix candidates, so it is **not counted** as a negative exact-filename search. Search indexing is incomplete and mutable; the repository-tree negatives are the stronger evidence.

An independent GitHub issue search of the literal phrase `59.txt` with `cicada is:issue` found no novel contemporary archive link: its LP-related hits were this research repository's already documented issues. No authentication, digest algorithm or byte serialization of the claimed missing file is introduced by these results.

## Decision for cryptanalysis

These nine additional source trees and independent global source index did not supply the required `59.txt` or `59.bin` payload. The only route to a literal p56 hash preimage here is a **new byte-preserving contemporary source**, such as a private 2014 solver workspace, independently timestamped IRC file attachment, or original HTTP response, which should be authenticated before using the source as a cipher crib. Continuing to guess hash formats, treat existing `56.bin` as a deep-web page, or decode modern `59.jpg` as file59 would consume compute without gaining the missing input. The bounded #658 public-source search is complete and the branch is inactive pending new data.

### Reproducibility

Source queries were issued with GitHub's authenticated REST `/search/code` and `/repos/.../git/trees/{default_branch}?recursive=1` endpoints on 12 November 2026. For each listed repository, inspect the complete JSON tree for path-components `59.txt`, `59.bin` or `page59.txt`/binary, and independently fetch the two control `56.bin` blob SHAs in `cijhho123` and `Caiobas12345`. This operation is read-only and does not depend on manuscript decryption or selecting favorable responses.
