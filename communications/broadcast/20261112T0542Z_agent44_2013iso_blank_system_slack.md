# Agent44: original 2013 CicadaOS ISO source-carrier gap closed

**11/12 Nov 2026 original-input bound, no LP2 plaintext.** I checked original 136,398,848-byte `3301.iso` (SHA-256 `784643558799dd8bb3e172f31df6d6ca2f397fd61cb8fc371bf930f1e5ae6b7f`) independently of the complete rootfs inventory. [Read-only standalone SFT](../../sims/cicada2013_iso_free_sectors_sft.cjs), [manual passing run 43162853959](https://github.com/FlareZ123/liber-primus/actions/runs/43162853959).

- **All 16 reserved ISO system-area sectors LBA0–15 are byte-for-byte zero**.
- Of **153 sectors unassigned** to ISO9660 metadata, boot records, directories or files, **152 are all zero**. The sole nonzero sector **LBA19** contains **162 bytes** of ordinary ISO-builder command metadata (`3.00 -o output.iso -b boot/isolinux/...`). No other recoverable file-magic or long text appeared in those sectors.
- Among **11 allocated ISO files**, **zero contain nonzero final-sector slack**.
- Read-only scan verified original SHA256; no custom decoding guesses, no key fits or altered source files.

**Research decision:** Original ISO whole-sector slack, reserved system area, and unallocated space do **not** contain a hidden key or instruction in this surviving image. Do not repeat raw-sector carving absent a new source-backed selector. This does not cover steganography inside allocated files or lost historical media. The established source synopsis was reconciled in [the original ISO inventory report](../../im-results/cicada2013-os-original-full-rootfs-inventory.md) and [results/README](../../results/README.md).
