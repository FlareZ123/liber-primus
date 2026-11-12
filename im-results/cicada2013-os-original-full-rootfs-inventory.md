# Complete source-fixed inventory of the 2013 Cicada OS initramfs

**Decision (11 November 2026):** The original 2013 `3301.img` initramfs contains no additional named Cicada puzzle decoder, key-generation program, or readable LP2 instruction beyond its previously reported `cicada`, `prime_echo`, `message.txt`, `message.txt.asc`, and byte-identical `wisdom`/`folly` files. The apparent `cicada.ko.gz` match is the conventional Linux kernel Ethernet PHY driver. This is a *complete extracted-filesystem inventory*, rather than a denial that any hidden carrier or file-content cipher could exist. No unknown Liber Primus plaintext or cipher key was found.

## Source and independent full-image experiment

- Preserved original-derived source tree: [`neuroretransmit/cicada` at `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/002-3301). Its `3301-contents/boot/3301.img` is a 5,494,774-byte gzip-compressed cpio initramfs, **Git blob SHA-1 `d4dba9a6d3c0d6ed751d71cdc484e4b7efe1ee0a`**. The source also retains top-level isolinux configuration, original audio/data paths and extracted rootfs examples.
- Read-only whole-image SFT: [`sims/cicada2013_os_full_rootfs_inventory_sft.cjs`](../sims/cicada2013_os_full_rootfs_inventory_sft.cjs), checking the original image Git blob, six original file Git blobs, exact prime sequence and delays, startup flow, and relevant filenames/text references. A [manual-only workflow](../.github/workflows/cicada2013-os-full-rootfs-inventory.yml) extracts the original image into a temporary directory without booting it.
- [Successful independent complete-image run 43075817527](https://github.com/FlareZ123/liber-primus/actions/runs/43075817527) and [its exact JSON inventory artifact](https://github.com/FlareZ123/liber-primus/actions/runs/43075817527/artifacts/13882991345). **737 regular files, 291 symbolic links.** The first run failed only because ordinary `cpio` could not create original block/character device nodes on the runner; the second run used `fakeroot` for faithful extraction and all source/assertion checks passed.

## All puzzle-named entries in the extracted filesystem

| Original path | Size, bytes | Role and scope |
| --- | ---: | --- |
| `usr/local/bin/cicada` | 106 | Login-shell startup script; clears the screen, runs `prime_echo`, displays `message.txt`, waits ten seconds, then reboots. |
| `usr/local/bin/prime_echo` | 12,248 | Literal `echo`/sleep list of exactly the 464 primes from 2 through 3301, in order. All delays are 0.05 second except **1033 and 3301, both 2 seconds**. No arithmetic generator, input interface or unknown cryptographic operation. |
| `usr/local/bin/message.txt` | 65 | Displays `@1231507051321`, “The key is all around you.”, “Good luck.” and `3301`. |
| `usr/local/bin/message.txt.asc` | 948 | OpenPGP clearsigned copy of the same original message, already available for independent signature tests. |
| `tmp/wisdom` and `tmp/folly` | 3,368 each | **Identical bytes**, both Git blob SHA-1 `62b1b949a1e4e4a346e75b1c34101000d3c53220`; original-source binary already preserved in `resources/historical/cicada2013-wisdom-folly.b64` and tested by [the existing direct-input key SFT](../sims/cicada2013_wisdom_folly_source_gate.cjs) and [coordinate gate](../sims/cicada2013_wisdom_folly_coordinate_sft.cjs). |
| `lib/modules/3.0.21-tinycore/kernel/drivers/net/phy/cicada.ko.gz` | Ordinary distribution module | Linux `CICADA_PHY` hardware driver, unrelated to Cicada 3301 puzzle, despite the matching string. |

The only remaining text references found in plausible startup/configuration directories were `etc/passwd` mapping root's login shell to `/usr/local/bin/cicada`, the startup script's `prime_echo` command, the message copies, and `prime_echo`'s special numeric lines. The original `isolinux.cfg` selects the standard `3301` boot label or `mc`, both with the same `3301.img` and `vmlinuz`, with no extra custom boot chain.

All six named custom blob identities and SHA-256 digests are included in the successful JSON artifact. The full source-image file and startup configuration are stronger evidence than reconstructed 2013 first-onion/telnet server code. The installed `prime_echo` is a prime/message presentation routine and does **not** independently authenticate later `NUMBER`, `PRIMES`, `COUNT` or other first-onion command semantics.

## Independent exact ISO9660 free-sector and slack audit (12 November 2026)

The completed rootfs inventory covered allocated files. A genuinely distinct source-key possibility was that the 2013 *ISO itself* carried an unlisted instruction or decoder in free CD-ROM sectors, or in the final padding bytes of an allocated file. The original OS instruction "The key is all around you" is compatible with examining the supplied medium, but does **not** itself select unused sectors, a binary codec, or an LP2 key.

A new read-only [original-image reproducer](../sims/cicada2013_iso_free_sectors_sft.cjs) traverses ISO9660 directory records and marks every file and directory extent, the first sixteen system sectors, all volume descriptors, the directory path tables, and El Torito boot catalog/initial load area. It separately inspects the reserved first sixteen system sectors for nonzero content, then reads every remaining unassigned sector and the byte-accurate tail slack of each allocated regular file. The input is the same **136,398,848-byte** original ISO used by #467, with SHA-256 **`784643558799dd8bb3e172f31df6d6ca2f397fd61cb8fc371bf930f1e5ae6b7f`**. [Successful manual GitHub Actions execution 43162853959](https://github.com/FlareZ123/liber-primus/actions/runs/43162853959), [initial zero-slack execution 43162325339](https://github.com/FlareZ123/liber-primus/actions/runs/43162325339).

| Source-exact ISO9660 measurement | Observed |
| --- | ---: |
| Total 2,048-byte sectors | **66,601** |
| Reserved ISO system-area sectors LBA0–15 with nonzero bytes | **0 / 16** |
| Named ISO file records / unique directories | **11 / 5** |
| Sectors outside assigned metadata/file/directory/boot extents | **153** |
| Such sectors containing any nonzero byte | **1** |
| Nonzero bytes in all 153 unassigned sectors | **162** |
| Only nonzero sector | **LBA 19** |
| Recognized gzip/ZIP/JPEG/PDF/ELF/PNG/XZ file signatures in unassigned sectors | **0** |
| Allocated regular-file tails containing any nonzero slack bytes | **0** |

The single nonzero unassigned sector contains an ordinary image-mastering command-line record, beginning `3.00 -o output.iso -b boot/isolinux/isolinux.bin -c boot/isolinux/boot.cat -no-emul-boot -boot-load-size 4 -boot-info-table NewCDR/`. It is a short, coherent ISO builder metadata string with no corresponding ciphertext/key/LP2 instruction. The other **152** unassigned sectors and the entire **32,768-byte ISO system area (LBA0–15)** are zero; the source filesystem contains **no nonzero file-tail slack**. On this exact surviving ISO, there is therefore no available *raw orphaned file-like payload in reserved system-area or unallocated sectors or in ordinary file-end padding*. The scan is deterministic and does not depend on decoders, language rankings, guessed keys or passage matching.

**Scope:** This excludes that specific physical-space hiding route. The test does not inspect bit-level steganography *within* allocated ISO data, alternate content hidden inside existing compressed assets, external media, CD subchannel information absent from the ISO byte stream, or a different lost historical image. It recovers **no unknown LP2 plaintext, authentic key, cipher method, or continuation**. Further carving of the same zero-filled sectors is unnecessary absent a new source instruction selecting a nonstandard representation.

## Cryptanalytic consequence and precise stop

The image makes a genuine human-observable emphasis on **1033** and **3301**, independently recorded by hardcoded prime-display pauses; that significance was already known from several stages of the puzzle. The file system contains no newly recovered standalone key, alternate prime program, additional named puzzle file, or source-selected operation assigning these constants to an unknown LP2 page.

This closes [Director Issue #316](https://github.com/FlareZ123/liber-primus/issues/316) at its declared scope. Do not redo a full ISO package-wide strings hunt or reuse the two `wisdom`/`folly` objects as GP29 pads without new source input. A genuinely different lead would require a separately attributable historical artifact or explicit instruction with a *discriminating original-LP2 prediction*, rather than a new postchosen reduction of 1033 or 3301.

**Limits:** This audit inventories the copied original-derived initramfs's visible filesystem and selected text paths. It does not by itself cryptographically validate a separately recovered 136MB ISO against its earliest distribution, exclude hidden payloads within allocated assets or steganography in its three outside-initramfs assets; full-image unallocated sectors and ordinary file-tail slack are covered by the independent source audit above. None of those gaps authorizes a general LP2 key search.
