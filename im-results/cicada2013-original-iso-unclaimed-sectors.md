# Original 2013 CicadaOS ISO: no extra payload in unmapped sectors or file slack

**Agent 38, 18 November 2026. Classification: original 2013 binary-container negative, with a previously unrecorded ISO builder record. No LP2 ciphertext decryption, authentic new key, or continuation address.**

## Why this was an independent attack

In the 2013 Cicada challenge, players received a bootable **`3301.iso`** that supplied actual bytewise XOR operands in its filesystem. A later Liber Primus solver could reasonably examine the original full carrier rather than reusing just its historically published files as speculative pads. The author's original ISO generator may have left non-directory data in its volume sectors. This audit asks precisely whether a hidden file, instruction or ciphertext exists as **nonzero complete sectors outside ISO9660 file/data/metadata extents, or as nonzero trailing bytes inside files' final allocated sectors**. It is not a new search for encryption keys among `560.13`, `560.17`, `_560.00`, `761.mp3` or the 2013 operating-system /tmp contents; those original file interiors have been separately investigated.

## Exact original input and finite experiment

The audit downloaded the byte-exact 2013 ISO from https://connortumbleson.com/uploads/2024/01/3301.iso, a public mirror independently matched to existing historical 2013 source checks. It verified the **136,398,848 bytes** before processing:
- MD5 `74062dee4093c6ca0340cda23f0e994b`.
- SHA1 `df433cba87644b35cbc47f702a02e2b58d90af6a`.
- Earlier independent archival extraction's SHA256 is `784643558799dd8bb3e172f31df6d6ca2f397fd61cb8fc371bf930f1e5ae6b7f` (not recomputed by this audit).

Use the original 2,048-byte sector geometry. Mark sectors 0–15 as the ISO system area; mark the ISO9660 volume descriptors including terminator, all four directory extents, both little/big-endian path-table forms, the boot catalogue indicated by the El Torito descriptor, and every original file's actual byte extents from the public PyCdlib v1.22 parser. The latter discovered **11 files** (including a zero-length `BOOT.CAT` directory record and its separately catalogued boot-data sector). Take the exact complement of all marked complete physical sectors. **Separately**, for every file byte extent whose declared length ends partway through its final 2,048-byte sector, inspect the entire unused tail after the file's end. Inspect these two disjoint domains for nonzero bytes, standard file-header signatures (PNG/JPEG/GIF/ZIP/GZIP/7zip/PDF/ELF/OpenPGP armor), and uninterrupted 24+ printable ASCII. Preserve the sector ranges, hashes, entropy and full inventory in the raw JSON workflow artifact.

An independent artificial four-sector source with a synthetically planted PGP-armor header at absolute byte 2,091 passes **both original code paths**, once as an unclaimed whole sector and once as a fictitious file's last-sector slack. Both detectors report precisely the planted PGP address.

## Observed original-source result

| Measurement | Source result |
|---|---:|
| Physical sectors in exact ISO | **66,601** |
| Marked ISO filesystem and boot/metadata sectors | **66,448** |
| Unmarked complete physical sectors | **153** (313,344 bytes) |
| Unmarked sectors entirely zero-filled | **152** (311,296 bytes) |
| Unmarked sectors containing nonzero data | **1** |
| Nonzero unmarked sector | **19**, absolute bytes `38912..40959` |
| Sector19 nonzero bytes / 2,048 | **162** |
| Sector19 Shannon byte entropy | **0.770002 bits/byte** |
| Recognized hidden-file headers in unmarked sectors | **0** |
| Original final-sector file-slack bytes across listed files | **8,460** |
| Nonzero original file-slack bytes | **0** |

The sector19 readable bytes begin `MKI Thu Jan  3 23:19:55 2013` and include the original ISO build command beginning `3.00 -o output.iso -b boot/isolinux/isolinux.bin -c boot/isolinux/boot.cat -no-emul-boot -boot-load-`. This looks like a standard mkisofs builder/boot-information record, with an early-January 2013 build timestamp. The captured 100-character excerpt is **truncated** by the detector's deliberately bounded printable preview; no conclusion rests on unseen trailing characters. It is obviously not a PGP instruction or free-standing ciphertext plaintext in the frozen extractor. Sector19 SHA256 is `5ab11a9f154c3cf4c688214a571db3bfa3b3dfd0b3e4ddbb76f7e2cc09d68dcf`.

Other unmarked sectors are exactly all-zero, as are **all 8,460 bytes of file-end slack** inside the physical sectors occupied by the 11 indexed file records. These are exact zero-byte tests, stronger than mere absence of file signatures. Original source's ISO directory reveals `AUDIO/761.MP3;1`, `BOOT/3301.IMG;1`, `BOOT/VMLINUZ.;1`, `DATA/560.13;1`, `DATA/560.17;1`, `DATA/_560.00;1`, and five `BOOT/ISOLINUX/` file records; every source byte occupied by the listed file extents is marked, not searched anew.

**Decision:** no additional nonzero *whole-sector or indexed-file end-sector-slack* payload exists outside the original ISO filesystem/metadata in this verified ISO witness. Retire both the orphan-sector and declared-file-slack channels. This is not a proof about unparsed inter-record directory slack, hidden data inside file contents or compressed file members, boot-loader side effects, downstream 2014 assets, or a creator-selected cipher. An author could still have used any of the already documented 2013 file contents in a historically unpublished way, but the present test recovers no such operation.

## Reproduction and scope

- Original-input single-file Python3.11 program: [`sims/cicada2013_iso_unclaimed_sector_sft.py`](../sims/cicada2013_iso_unclaimed_sector_sft.py).
- Reproducible Windows-2022 manually triggered workflow: [`.github/workflows/agent38-iso-orphan-sector-gate.yml`](../.github/workflows/agent38-iso-orphan-sector-gate.yml), pinned `pycdlib==1.22.0`, `filelock==3.20.0`, `requests==2.32.5`.
- **Passing complete original-source job**: [GitHub Actions run 44305748025](https://github.com/FlareZ123/liber-primus/actions/runs/44305748025), including archived JSON [artifact 14428471181](https://github.com/FlareZ123/liber-primus/actions/runs/44305748025/artifacts/14428471181).
- Independent prior *inside-files* study: [recovered root filesystem and authored startup](2013-os-wisdom-folly-source-classification.md). This new test is a different physical source channel and does not reopen that already completed work.
