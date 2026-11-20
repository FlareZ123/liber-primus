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

The two image archives are byte-identical mirrors, not independent captures from the original infotomb host or tweet CDN. A separate contemporaneous Boards.net repost of the signed message by `wetsand` on 2016-01-19 11:32:05 UTC is documented in the [2016 source record](../cicada2016-4gq25.md) and [whitespace audit](../../im-results/2016-signed-payload-whitespace-audit.md). It is an independent period posting of the signed text, not a second OutGuess extraction or original-host capture. The matching image Git blob SHA establishes that the checked-in resource preserves the archived image bytes exactly; it does not independently authenticate the image's original delivery or prove that its dimensions were intentionally selected as a cipher clue.

The 563 × 569 dimensions used in the lag-six source hypothesis are now confirmed from the archived binary rather than only from a contemporaneous 4chan post. This strengthens the input datum, not the interpretation: no LP2 plaintext, key, or complete mechanism follows from the image inventory.

## Reproduction

Run:

    node sims/2016_jpeg_asset_inventory.cjs

## Tree identity and OutGuess-seed interpretation

The post-event Uncovering Cicada Wiki note links the ClipartBest raster `https://www.clipartbest.com/cliparts/abc/y97/abcy97qTL.jpeg` as the 2016 dead-oak candidate. Its source bytes are SHA-256 `6fc875c099081908587fed6f1b3ac96bceece97f276e9fdd5cd52ec5ea791a34` (1222×1600). The original-source registration against the 2016 carrier returns NCC0.8021681 for a horizontal reflection at scale0.135 and translation (202,257), versus0.5937137 direct and0.3208203 vertical; the candidate is therefore strongly supported as the visible tree asset. This is shape correspondence, not authenticated provenance: the source link is post-event, no attributable artist or pre-2016 timestamp was established, and the SFT does not compare a broad alternative-stock corpus. The separate community [2016 archive page](https://github.com/scream314/cicada3301/blob/master/2016.md) captions the motif `Oak Tree In Winter`; that wording prompted a comparison with Fox Talbot's similarly titled [historical photograph](https://foxtalbot.dmu.ac.uk/resources/wintertree.html). The exact Talbot image (SHA-256 `904b6b4000758211789e94747f8c8ddf68b1e6c3909a4236d306023dc52fcbf4`, 600×689) produced zero SIFT/RANSAC inliers in all32 fixed rotation/reflection/polarity comparisons against the 2016 carrier, while both images passed strong self-registration controls. It is not the source photograph; a stylized redraw is not tested. See [the consolidated visual-selector report](../../im-results/2016-original-tree-visible-selector-gate.md), [ClipartBest registration SFT](../../sims/cicada2016_oak_stock_shape_registration_sft.py), and [manual run 43471914524](https://github.com/FlareZ123/liber-primus/actions/runs/43471914524). The original 4gq25 JPEG has no EXIF/GPS, and the clipart is not a geographic photograph. No route, text, numeral, or processing instruction follows from the asset; it does not select an LP2 inverse or destination.

Do not conflate this 2016 clipart with Commons `DeadTree.jpg`, a different 2005 photograph by R Neil Marshman/Brookie described as a part-dead oak near Earls Barton. That Commons photograph and its salt-and-pepper/Gaussian/median derivatives belong to the separate LP2 p32/p55 artwork lineage in [`im-results/dead-tree-commons-derivative-gate.md`](../../im-results/dead-tree-commons-derivative-gate.md); they are not provenance for the 2016 silhouette. The independent 2016↔p32 raster registration establishes visual geometry, not common file provenance.

The 563 × 569 canvas dimensions remain a separate possible clue; the clipart identification neither proves nor disproves that the composite dimensions were deliberately selected. Treat the tree as a generic motif, not a location/species cue; the signed payload explicitly warns “Beware false paths.”

The archived OutGuess extraction reports seed 230 and payload length 1,136. In the classic OutGuess 0.2 source, iterator.h defines DEFAULT_ITER as 256 and outguess.c uses the default to search seeds 0–255, selecting a seed by embedding cost. Retrieval prints the stored seed and length. The original encoder invocation is unavailable, so seed 230 may be algorithm-selected rather than creator-selected; length 1,136 is payload metadata. Do not treat either as an LP2 key without additional evidence. References: https://github.com/crorvick/outguess/blob/master/iterator.h and https://github.com/crorvick/outguess/blob/master/outguess.c.
