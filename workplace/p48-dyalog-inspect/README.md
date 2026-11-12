# LP2 page 48: OutGuess / Dyalog candidate

## Hypothesis and current evidence

A historical extraction archive records a 46,559-byte OutGuess 0.13 result from the original LP2 page 48 JPEG. Its accompanying 48.jpg.check reports that the file utility called it "Dyalog APL version 100.40". That generic identification is not proof of a valid Dyalog workspace.

The pinned file magic source (file/file commit b778217dbd35291d3539abb446e50b43a972a5fc, magic/Magdir/dyadic) explains the match: it accepts the masked two-byte prefix AA98 & 0xFF60 = AA00 plus a nonzero version field, then uses the byte at offset 1 to distinguish known subtypes. The known workspace marker is 0x03; the extracted file has 0x98 at that offset, which is not a listed Dyalog subtype. The apparent version 100.40 is simply the next two bytes 64 28.

Measured on the extracted file: 46,559 bytes; SHA-256 98468f3bb850fef6df92a1ed6bd6531ca18b77a8b16d25d0a9ea0866a91d37b8; Shannon entropy 7.99628 bits/byte; no meaningful ASCII strings. A first Dyalog 20.0 ⎕CY attempt against the .bin path returned "ws not found"; this may be extension-sensitive.

## Decisive extension-controlled test

The workflow places the same bytes at /data/48.dws, outside Dyalog's automatic /app workspace scan, and calls ⎕CY '/data/48.dws'. It uses -x and only copies objects; it does not execute the candidate's functions or latent expression. If this still fails, the workspace hypothesis is rejected. If it loads, the workflow records names, function/operator source, variable values, and the latent expression for inspection.

## Sources

- Pinned archive: https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/011-seventh-onion
- Extracted file blob: 840f63b5bdb05259437c7497905d76474b24ca05
- Extraction record: 48.jpg.check
- Dyalog file-signature rules: https://github.com/file/file/blob/b778217dbd35291d3539abb446e50b43a972a5fc/magic/Magdir/dyadic
