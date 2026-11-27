# Complete source-fixed inventory of the 2013 Cicada OS initramfs

**Decision (updated 27 November 2026; Issues #2003/#3084):** The hash-verified 2013 CicadaOS ISO's embedded `/BOOT/3301.IMG;1` member is byte-joined to the pinned initramfs source object, and the raw `newc` archive is now compared byte-for-byte against the exact Tiny Core 4.7.2 baseline. The raw archive contains 612 regular files, 291 symlinks and 125 device nodes; the earlier fakeroot materialization reported the 125 device nodes as ordinary filesystem files, hence its 737-file/291-symlink manifest. Of 903 baseline-comparable regular/symlink entries, **895 are byte-identical, six are Cicada-added files, two are small boot/login configuration changes, and none is removed**. The complete delta exposes no additional puzzle decoder, key-generation program, state machine or LP2 receiver beyond the already identified Cicada payloads. The apparent `cicada.ko.gz` match is the conventional Linux kernel Ethernet PHY driver. This is a complete inventory of the embedded initramfs filesystem, not a claim about every other ISO file or hidden data inside allocated assets. No unknown Liber Primus plaintext or cipher key was found.

## Source and independent full-image experiment

- Preserved original-derived source tree: [`neuroretransmit/cicada` at `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/002-3301). Its `3301-contents/boot/3301.img` is a 5,494,774-byte gzip-compressed cpio initramfs, **Git blob SHA-1 `d4dba9a6d3c0d6ed751d71cdc484e4b7efe1ee0a`**. The source also retains top-level isolinux configuration, original audio/data paths and extracted rootfs examples.
- Read-only whole-image SFT: [`sims/cicada2013_os_full_rootfs_inventory_sft.cjs`](../sims/cicada2013_os_full_rootfs_inventory_sft.cjs), checking the original image Git blob, six original file Git blobs, exact prime sequence and delays, startup flow, and relevant filenames/text references. A [manual-only workflow](../.github/workflows/cicada2013-os-full-rootfs-inventory.yml) extracts the original image into a temporary directory without booting it.
- [Successful independent complete-image run 43075817527](https://github.com/FlareZ123/liber-primus/actions/runs/43075817527) and [its exact JSON inventory artifact](https://github.com/FlareZ123/liber-primus/actions/runs/43075817527/artifacts/13882991345). **737 materialized file objects, 291 symbolic links** in that fakeroot extraction; the later raw-CPIO parser classifies those 737 objects as **612 true regular files plus 125 device nodes**. The first run failed only because ordinary `cpio` could not create original block/character device nodes on the runner; the second run used `fakeroot` for faithful extraction and all source/assertion checks passed.


## Direct original-ISO-to-initramfs custody join (21 November 2026)

A new execution of the existing manual-only workflow [`cicada2013-os-full-rootfs-inventory.yml`](../.github/workflows/cicada2013-os-full-rootfs-inventory.yml) verified the complete 136,398,848-byte ISO from `https://connortumbleson.com/uploads/2024/01/3301.iso` against all three pinned digests:

- MD5: `74062dee4093c6ca0340cda23f0e994b`
- SHA-1: `df433cba87644b35cbc47f702a02e2b58d90af6a`
- SHA-256: `784643558799dd8bb3e172f31df6d6ca2f397fd61cb8fc371bf930f1e5ae6b7f`

Pinned `pycdlib==1.22.0` located ISO member `/BOOT/3301.IMG;1` at byte offset `128086016`, length `5494774`. The extracted bytes have Git blob SHA-1 `d4dba9a6d3c0d6ed751d71cdc484e4b7efe1ee0a` and SHA-256 `3fcbb8abaf9d876985e8122e94f60b306a06401ec95b743d52da2e2324a37f42`. They match byte-for-byte the pinned object `neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3:2013/002-3301/3301-contents/boot/3301.img`, including the same 5,494,774-byte length and Git blob SHA-1. The mirror's digest match establishes this exact ISO/member join; it does not independently establish the upstream Git repository's first-party authorship.

The same run safely extracted the member without executing startup code and generated the complete sorted path/size/hash manifest: **1,028 materialized entries (737 file objects, 291 symlinks)**; raw CPIO typing later resolves the 737 as 612 regular files + 125 device nodes, manifest SHA-256 `87f903fc1ed52826f6cf9f0c7de0857fa53e6aec443c76d38dbffc4bf8ee0286`. The two JSON files (join record and full manifest) are in Actions artifact [14712470067](https://github.com/FlareZ123/liber-primus/actions/runs/44917051483/artifacts/14712470067); its ZIP SHA-256 is `b89edba654bd0a6b6077a79ee2eca0760abcf0f645122a5d8bab43e29125fbd6`. The successful manual workflow run is [44917051483](https://github.com/FlareZ123/liber-primus/actions/runs/44917051483).

**Cryptanalytic consequence:** this completes the exact ISO-to-initramfs custody gap and ties the existing full-rootfs inventory to a digest-verified ISO. It does not reveal an additional key, alphabet, state transition, LP2-specific instruction, or reversible receiver. The separately inventoried ISO free sectors and file-end slack remain a distinct bounded negative; this join does not re-run that scan or inspect the contents of separate ISO members such as `DATA/560.13`.
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

**Ignored ISO metadata fields and padding were also tested**, in the final [manual run 43163554653](https://github.com/FlareZ123/liber-primus/actions/runs/43163554653). The primary-volume-descriptor 512-byte Application Use field contains **512 ASCII spaces and zero nonpadding bytes**; its 653-byte reserved tail is zero. The El Torito boot catalog has **zero** nonzero bytes after its first two 32-byte entries. Directory-sector record padding contains **zero** nonzero bytes, as do the two source path-table tail regions (LBAs20 and22). Together with the blank 16-sector reserved system area and zero final-file padding, this excludes ordinary hidden-file content in all inspected *normally ignored* ISO9660 storage regions of this surviving image. Encoded significance in valid allocated data is outside this result.

The single nonzero unassigned sector contains an ordinary image-mastering command-line record, beginning `3.00 -o output.iso -b boot/isolinux/isolinux.bin -c boot/isolinux/boot.cat -no-emul-boot -boot-load-size 4 -boot-info-table NewCDR/`. It is a short, coherent ISO builder metadata string with no corresponding ciphertext/key/LP2 instruction. The other **152** unassigned sectors and the entire **32,768-byte ISO system area (LBA0–15)** are zero; the source filesystem contains **no nonzero file-tail slack**. On this exact surviving ISO, there is therefore no available *raw orphaned file-like payload in reserved system-area or unallocated sectors or in ordinary file-end padding*. The scan is deterministic and does not depend on decoders, language rankings, guessed keys or passage matching.

**Scope:** This excludes that specific physical-space hiding route. The test does not inspect bit-level steganography *within* allocated ISO data, alternate content hidden inside existing compressed assets, external media, CD subchannel information absent from the ISO byte stream, or a different lost historical image. It recovers **no unknown LP2 plaintext, authentic key, cipher method, or continuation**. Further carving of the same zero-filled sectors is unnecessary absent a new source instruction selecting a nonstandard representation.

## Exact Tiny Core 4.7.2 baseline delta (Director #3084, 27 November 2026)

The broad rootfs inventory left one important ambiguity: an ordinary-looking file could have been silently modified from the upstream Tiny Core distribution. A new read-only byte-level comparator, [`sims/cicada2013_tinycore472_delta_sft.cjs`](../sims/cicada2013_tinycore472_delta_sft.cjs), resolves that class directly.

The comparator verifies the original Cicada initramfs SHA-256 `3fcbb8abaf9d876985e8122e94f60b306a06401ec95b743d52da2e2324a37f42`, parses its raw `newc` archive without executing anything, and obtains the exact Tiny Core **4.7.2** baseline `x86/archive/4.7.2/distribution_files/core.gz` from the indexed Archive.org `TinyCore 4.x.zip`. Baseline core SHA-256 is **`3c921458379b5523cfdd9c7acd56d37087e6b65783ed76eeccfc8faa68796b0b`**. Windows Node22 run [45917685485](https://github.com/FlareZ123/liber-primus/actions/runs/45917685485) completed successfully; artifact 15163052384 contains the exact JSON comparison.

The result is exceptionally small:

| class | count | exact objects |
| --- | ---: | --- |
| Byte-identical regular/symlink entries | **895** | ordinary Tiny Core 4.7.2 baseline |
| Added | **6** | `usr/local/bin/cicada`; `usr/local/bin/prime_echo`; `usr/local/bin/message.txt`; `usr/local/bin/message.txt.asc`; `tmp/wisdom`; `tmp/folly` |
| Changed | **2** | `etc/init.d/tc-config`; `etc/passwd` |
| Removed | **0** | none |
| Metadata-only changes among identical entries | **0** | none |

The six additions are exactly the previously source-audited payloads. Their SHA-256 values in the raw archive are:

- `cicada` — `e5231e14d404c43a74820c3ea9067c4900c36b03438660cfb69c9aa31fc3b75c`
- `prime_echo` — `1ab3a8f4520a3d93784aea137847e0c7f77d9fff4df02d481b62d13280753350`
- `message.txt` — `c4ba455cd05d98743751d89e521c8fa4252a472734438f10067cbb899fdfe6a0`
- `message.txt.asc` — `4401b6536f99d9716e91b10bf99777d4a75dce58fe50533cb847238af17eaf6e`
- `tmp/wisdom` and `tmp/folly` — identical `7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a`

The two baseline changes contain no additional data-plane puzzle code:

1. **`etc/init.d/tc-config`** differs by exactly two inserted `#` characters. They comment out the stock `if [ -n "$SUPERUSER" ]; then ... fi` guard while leaving `touch /etc/sysconfig/superuser` active. The consequence is simply that the normal Tiny Core superuser marker is created unconditionally.
2. **`etc/passwd`** grows by exactly 14 bytes because root's login shell changes from stock **`/bin/sh`** to **`/usr/local/bin/cicada`**; UID, GID and home are unchanged. Period IRC independently records the exact CicadaOS root entry `root:x:0:0:root:/root:/usr/local/bin/cicada` on 8 January 2013. This routes login directly into the 106-byte `cicada` startup script already exhaustively parsed.

That startup script has no player-input parser or computed path: it clears the screen, invokes the literal `prime_echo`, displays `message.txt`, sleeps ten seconds, and reboots. The complete `prime_echo` body is a fixed list of 464 literal prime outputs with the two known pauses. Therefore the baseline delta contains **no overlooked executable which accepts a puzzle/player operand and emits a key, stream, coordinate, file order or receiver**.

The raw CPIO parser also corrects a presentation artifact in the older inventory. The archive contains **612 true regular files + 291 symlinks + 60 character devices + 65 block devices** (plus directories). The prior fakeroot extraction materialized the 125 device nodes as host regular files, producing the earlier “737 regular files” count. This is a tooling classification difference, not missing archive content.

**#3084 decision:** the original CicadaOS initramfs is exhausted for hidden distribution-delta key/receiver code. Any future OS-based LP2 route must point to one of the six known added payloads or supply a new first-party reason to interpret an otherwise byte-identical Tiny Core component. Do not repeat generic executable/configuration sweeps of this image.

## Cryptanalytic consequence and precise stop

The image makes a genuine human-observable emphasis on **1033** and **3301**, independently recorded by hardcoded prime-display pauses; that significance was already known from several stages of the puzzle. The file system contains no newly recovered standalone key, alternate prime program, additional named puzzle file, or source-selected operation assigning these constants to an unknown LP2 page.

This closes [Director Issue #316](https://github.com/FlareZ123/liber-primus/issues/316) at its declared scope. Do not redo a full ISO package-wide strings hunt or reuse the two `wisdom`/`folly` objects as GP29 pads without new source input. A genuinely different lead would require a separately attributable historical artifact or explicit instruction with a *discriminating original-LP2 prediction*, rather than a new postchosen reduction of 1033 or 3301.

**Limits:** This audit inventories the copied original-derived initramfs's visible filesystem and selected text paths. It does not by itself cryptographically validate a separately recovered 136MB ISO against its earliest distribution, exclude hidden payloads within allocated assets or steganography in its three outside-initramfs assets; full-image unallocated sectors and ordinary file-tail slack are covered by the independent source audit above. None of those gaps authorizes a general LP2 key search.
