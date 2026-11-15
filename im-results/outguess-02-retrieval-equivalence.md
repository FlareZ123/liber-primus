# OutGuess 0.2 and 0.4 have the same LP2 JPEG retrieval path

**Decision:** A separate Linux build of OutGuess 0.2 is not needed to resolve a version-specific concern in the LP2 extraction work. The relevant 0.2.0 and 0.4 retrieval code is functionally equivalent. This is a bounded implementation comparison, not a claim that all OutGuess payloads or passphrases have been excluded.

## Source revisions

- OutGuess 0.2.0: [commit e9967c7c5788b7e5b8d3aeec238766ea60bf8a12](https://github.com/resurrecting-open-source-projects/outguess/tree/e9967c7c5788b7e5b8d3aeec238766ea60bf8a12)
- OutGuess 0.4: [commit 24810e14327c2bbeedeaadd3e24491f2a4425c02](https://github.com/resurrecting-open-source-projects/outguess/tree/24810e14327c2bbeedeaadd3e24491f2a4425c02)
- [Upstream comparison](https://github.com/resurrecting-open-source-projects/outguess/compare/e9967c7c5788b7e5b8d3aeec238766ea60bf8a12...24810e14327c2bbeedeaadd3e24491f2a4425c02)

## Retrieval-path comparison

The source comparison covered the parts that determine the first four-byte seed/length header and subsequent JPEG payload extraction:

- `iterator.h` retains the same `INIT_SKIPMOD=32`, `DEFAULT_ITER=256`, `SKIPADJ`, and iterator declarations/macros.
- `iterator.c` has identical function bodies for `iterator_init`, `iterator_next`, `iterator_seed`, and `iterator_adapt`.
- `arc.c` has identical function bodies for `arc4_init`, `arc4_getbyte`, `arc4_getword`, `arc4_addrandom`, and `arc4_initkey`.
- `outguess.c` has identical `steg_retrbyte` and `steg_retrieve` bodies. `decode_data` is identical after whitespace normalization. The `encode_data` no-ECC length-probe path used by retrieval is unchanged; 0.4 adds only a defensive null-pointer guard after that early-return path. Both versions use the same default key string `Default key` and the same ARC4 domain string `Encryption`.
- `jpg.c` has identical `finish_state`, `steg_use_bit`, and `bitmap_from_jpg` functions. The JPEG coefficient-decoding files were compared at source level: among common JPEG 6b files, `jcdctmgr.c` and `jdcoefct.c` only add the `steg_use_bit` prototype and copyright notice; `jdhuff.c`, `jdinput.c`, `jdapimin.c`, and `jutils.c` are byte-identical. The remaining `jerror.c` changes are error-reporting/build compatibility, not coefficient order or retrieval.
- The changed `steg_find`/preservation logic concerns embedding and seed search. It does not change the extraction path from an existing JPEG.

## Consequence for LP2

The existing LP2 OutGuess analysis found that the first 1,024 eligible bits form an all-one prefix, so the initial four-byte header presented to the ARC4 decoder is `FFFFFFFF` before key decryption. The current 0.4 scan and its 60 tested keys are documented in [the universal-header report](lp2-outguess-universal-header-artifact.md) and [the archive/hash report](lp2-outguess-archive-p56-hash.md).

Because the 0.2 and 0.4 retrieval functions, iterator constants/state transitions, ARC4 setup, and JPEG coefficient hook are equivalent, a 0.2 Linux build does not provide a different first-header extraction algorithm for the same JPEG coefficient bitmap. The proposed 0.2-only control can therefore be retired without spending CI on a redundant build.

## Scope and remaining uncertainty

This closes **only the version-difference question**. It does not prove that no LP2 image contains an OutGuess payload, does not search every possible key, and does not exclude another steganographic tool or a different source-selected extraction route. The 60-key negative remains scoped to those tested keys. A useful next OutGuess step would require an independently motivated passphrase, authenticated payload clue, or evidence that the relevant JPEG coefficient bitmap differs from the current source reconstruction—not another version-only build.

The comparison is reproducible from the two pinned upstream commits above; function names and paths are listed so future agents can recheck the exact retrieval contract without reconstructing this invocation.
