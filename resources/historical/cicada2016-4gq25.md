# 2016 image archive: 4gq25.jpg

**Artifact class:** archived binary copy of the image linked from the 5 January 2016 Cicada tweet; not a direct capture from the original host.

## Source copies

The identical JPEG is preserved in two public Cicada archives:

- https://github.com/scream314/cicada3301/blob/master/assets/2016/4gq25.jpg
- https://github.com/micheloosterhof/cicada-2016/blob/master/stage01/4gq25.jpg

Both files have Git blob SHA 22027296dcd7df53c5127e6aadbabeaf3223f72d. The first archive's 2016.md identifies the original image URL as https://infotomb.com/4gq25.jpg. The second archive's stage01/README.md records the OutGuess extraction.

## Exact binary inventory

- File: resources/historical/cicada2016-4gq25.jpg
- Size: 26,342 bytes
- JPEG: baseline SOF0, three components
- JFIF: version 1.1, density unit 0, X/Y density 1
- Dimensions: 563 × 569 pixels
- JPEG marker sequence before scan: APP0/JFIF, two DQT, SOF0, four DHT, SOS
- No APP1 EXIF/XMP, APP2 ICC, APP13 IPTC, COM comment segment, or bytes after EOI
- No EXIF/GPS metadata is present to supply a location

The absence of metadata or appended bytes does not imply absence of steganography. The archive preserves the extracted signed payload as [`4gq25.jpg.outguess`](https://github.com/micheloosterhof/cicada-2016/blob/master/stage01/4gq25.jpg.outguess); its README records OutGuess retrieval of 25,229 usable bits, seed 230, and payload length 1,136 bytes. The byte-exact payload, key fingerprint, and GPG verification are documented in the authoritative [2016 source record](../cicada2016-4gq25.md). I independently repeated the signature check during this audit and obtained the same good-signature result; this is corroboration, not a new extraction or a new cryptographic finding.

A separate 2017 signed warning is now preserved at [`cicada2017-yEiTHhvF.asc`](cicada2017-yEiTHhvF.asc), with its same-key verification in [the 2017 source note](cicada2017-yEiTHhvF.md).

## Interpretation limits

The two archives are byte-identical mirrors, not independent captures from the original infotomb host or tweet CDN. The matching Git blob SHA establishes that the checked-in resource preserves those archived bytes exactly; it does not independently authenticate the image's original delivery or prove that its dimensions were intentionally selected as a cipher clue.

The 563 × 569 dimensions used in the lag-six source hypothesis are now confirmed from the archived binary rather than only from a contemporaneous 4chan post. This strengthens the input datum, not the interpretation: no LP2 plaintext, key, or complete mechanism follows from the image inventory.

## Reproduction

Run:

    node sims/2016_jpeg_asset_inventory.cjs

## Tree identity and OutGuess-seed interpretation

The Uncovering Cicada Wiki identifies the background as generic dead-oak clipart and links the Clipartbest asset https://www.clipartbest.com/cliparts/abc/y97/abcy97qTL.jpeg. This is not evidence for a geographic oak or a physical route. The 563 × 569 canvas dimensions remain a separate possible clue; the clipart's existence neither proves nor disproves that the composite dimensions were deliberately selected.

The archived OutGuess extraction reports seed 230 and payload length 1,136. In the classic OutGuess 0.2 source, iterator.h defines DEFAULT_ITER as 256 and outguess.c uses the default to search seeds 0–255, selecting a seed by embedding cost. Retrieval prints the stored seed and length. The original encoder invocation is unavailable, so seed 230 may be algorithm-selected rather than creator-selected; length 1,136 is payload metadata. Do not treat either as an LP2 key without additional evidence. References: https://github.com/crorvick/outguess/blob/master/iterator.h and https://github.com/crorvick/outguess/blob/master/outguess.c.
