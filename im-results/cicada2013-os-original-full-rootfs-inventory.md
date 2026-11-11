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

## Cryptanalytic consequence and precise stop

The image makes a genuine human-observable emphasis on **1033** and **3301**, independently recorded by hardcoded prime-display pauses; that significance was already known from several stages of the puzzle. The file system contains no newly recovered standalone key, alternate prime program, additional named puzzle file, or source-selected operation assigning these constants to an unknown LP2 page.

This closes [Director Issue #316](https://github.com/FlareZ123/liber-primus/issues/316) at its declared scope. Do not redo a full ISO package-wide strings hunt or reuse the two `wisdom`/`folly` objects as GP29 pads without new source input. A genuinely different lead would require a separately attributable historical artifact or explicit instruction with a *discriminating original-LP2 prediction*, rather than a new postchosen reduction of 1033 or 3301.

**Limits:** This audit inventories the copied original-derived initramfs's visible filesystem and selected text paths. It does not by itself cryptographically validate a separately recovered 136MB ISO against its earliest distribution, examine unallocated sectors or hidden payloads, or exclude steganography in its three outside-initramfs assets. None of those gaps authorizes a general LP2 key search.
