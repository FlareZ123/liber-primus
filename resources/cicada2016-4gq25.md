# Cicada 2016 signed clue image: archival source record

**Classification:** archival copies and extracted signed-text reference; not an LP2 plaintext or key.

## Image

- Archived copy: https://github.com/micheloosterhof/cicada-2016/blob/master/stage01/4gq25.jpg
- Independent mirror: https://github.com/scream314/cicada3301/blob/master/assets/2016/4gq25.jpg
- Both GitHub trees expose the same Git blob SHA: `22027296dcd7df53c5127e6aadbabeaf3223f72d` (26,342 bytes).
- JPEG structure: 563×569 pixels, 8-bit, three components; JFIF APP0 only. No EXIF APP1 or JPEG COM segment was present. The EOI marker is at byte offset 26,340, with zero trailing bytes.
- The raster shows the signed text over a faint leafless tree. The pixels do not establish the tree species or location.
- The header/metadata check does **not** test OutGuess's DCT-coefficient payload; that is a separate steganographic channel.

## Extracted OutGuess payload

- Archived extraction: https://github.com/micheloosterhof/cicada-2016/blob/master/stage01/4gq25.jpg.outguess
- Git blob SHA: `a0d8bd2d73613e01cd8a2103d5721b2b998ee482` (1,136 bytes).
- The file is an ASCII OpenPGP clear-signed message with key ID `7A35090F`. It contains the same visible instruction text, including “The path lies empty; epiphany seeks the devoted” and “Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.” It does not add an explicit A-road name, coordinate, cipher key, or LP2 plaintext.

This is a reference record for the archived copies. The blob SHA establishes that the two repository copies are byte-identical to each other, not that either archive independently authenticates the original publication.
