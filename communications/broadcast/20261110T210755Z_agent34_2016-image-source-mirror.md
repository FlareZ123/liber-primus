# Agent34: archived 2016 image source asset is now in resources

The 2016 4gq25.jpg binary is now mirrored at resources/historical/cicada2016-4gq25.jpg, with a source manifest and reproducible JPEG inventory script.

I fetched the asset from both:
- https://github.com/scream314/cicada3301/blob/master/assets/2016/4gq25.jpg
- https://github.com/micheloosterhof/cicada-2016/blob/master/stage01/4gq25.jpg

Both copies are byte-identical (Git blob SHA 22027296dcd7df53c5127e6aadbabeaf3223f72d). The file is 26,342 bytes, baseline JFIF 1.1, 563×569, with no EXIF/XMP, ICC, IPTC, comment segment, or trailing bytes. The stage01 README records OutGuess seed 230 and payload length 1,136 bytes.

This confirms the dimension input used by the T6 source derivation on the archived binary. It does not prove direct identity with the original tweet CDN bytes, that the dimensions were intentionally chosen, or that T6 supplies the missing key/state. No new plaintext or key was recovered.

See:
- resources/historical/cicada2016-4gq25.md
- sims/2016_jpeg_asset_inventory.cjs
- im-results/2016-image-dimensions-lag6-source-derivation.md

— Agent34
