# LP2 page 48 OutGuess/Dyalog signature: rejected

## Conclusion

The 46,559-byte OutGuess extraction from LP2 page 48 is **not a readable Dyalog APL workspace**. The historical file(1) identification is a generic signature match, not a valid subtype match. Dyalog 20.0.53963 returned "ws not found" both when the file was named .bin and when the same bytes were copied to a .dws path outside the interpreter's automatic workspace scan. No APL objects, source, latent expression, plaintext, or key were recovered. Retire this lead; do not run further Dyalog or OutGuess variants against this file without a new source clue.

## Pinned source and extracted bytes

The secondary archive neuroretransmit/cicada, commit ade9a02889ef8acbc8cde8edbfd0a785c369f4c3, contains:

- 2014/011-seventh-onion/48.jpg.bin, 46,559 bytes, Git blob 840f63b5bdb05259437c7497905d76474b24ca05
- 2014/011-seventh-onion/48.jpg.check, whose OutGuess 0.13 record reports the generic file(1) result "Dyalog APL version 100.40"

The extracted bytes used in both tests had SHA-256 98468f3bb850fef6df92a1ed6bd6531ca18b77a8b16d25d0a9ea0866a91d37b8, Shannon entropy 7.996283449383728 bits/byte, and no coherent ASCII strings. First 16 bytes:

    aa 98 64 28 f6 f9 11 9e f9 f9 9d 72 76 1e 5c 92

## Why file(1) misidentified it

The pinned file(1) magic source is file/file commit b778217dbd35291d3539abb446e50b43a972a5fc, magic/Magdir/dyadic. Its generic Dyalog rule checks:

    0  ubeshort&0xFF60  0xaa00
    >1 byte              !4
    >>2 ubeshort         >0x0000

The first two bytes AA98 pass the mask because AA98 & FF60 = AA00. The next two bytes 64 28 are printed as version 100.40. That generic rule does not establish a valid Dyalog file subtype.

The same magic source distinguishes the subtype using the byte at offset 1. A workspace requires 0x03; other recognized types include 0x01, 0x02, 0x06–0x1a, and 0x80. This extraction has 0x98 at offset 1, which is not a listed Dyalog subtype. Thus the utility's generic description is a weak signature coincidence, not evidence of a workspace.

## Decisive runtime test

Two successful GitHub Actions runs used the official dyalog/dyalog:20.0 image (runtime 20.0.53963), with -x and no automatic loading of the candidate:

- Run 43275163075 attempted ⎕CY '/app/48.bin' and returned "ws not found".
- Run 43276152969 copied the exact same bytes to /data/48.dws, outside /app, then attempted ⎕CY '/data/48.dws'; it again returned "ws not found".

The second run controls for the file extension and automatic workspace discovery. The inspection only attempted to copy workspace objects; it did not execute any candidate function or latent expression. Both run artifacts recorded the same file size, header and SHA-256.

## Reproduction

Download the pinned 48.jpg.bin from:

https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/011-seventh-onion/48.jpg.bin

Then run file, sha256sum, and a Dyalog 20.0 ⎕CY attempt with the file renamed to .dws. The exact historical file-signature rule is linked above. The temporary inspection workflow and its script were removed after this negative result so they do not become permanent CI overhead.

## Research decision

This result does not change the manuscript-level synthesis: no unknown LP2 plaintext, key, or decipherment mechanism was recovered. It only retires one attractive but invalid OutGuess file-type lead.
