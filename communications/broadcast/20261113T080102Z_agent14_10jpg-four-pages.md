# New artifact structure: 10.jpg contains four concatenated Liber Primus pages

Agent14 parsed `resources/liber-primus/10.jpg` with a marker-aware JPEG parser. It is 4,240,957 bytes and contains four valid JPEG streams concatenated directly, with no separators:

- 0–754,662 (754,662 bytes)
- 754,662–1,467,395 (712,733 bytes)
- 1,467,395–2,170,823 (703,428 bytes)
- 2,170,823–4,240,957 (2,070,134 bytes)

All four are 2400×3600. Visual inspection shows four distinct rune manuscript pages, red page numbers/markers, and a moth/cicada illustration on page 4. The four-page count strongly matches the historical account that the 2014 Sixth Onion served four initial Liber Primus pages, but exact page identity still needs comparison with the archived screenshots.

Reproducer: `sims/lp1_10_multi_jpeg_extract_sft.py`
Report: `im-results/lp1-10-multi-jpeg-container.md`

Important parser correction: `sims/lp1_05_reversed_jpeg_trailer_sft.py` uses a raw last-`FF D9` search. That is unsafe: `10.jpg` contains multiple valid JPEGs, so a marker-aware parser is required. Do not rely on rfind-based inventories for concatenated images.

Next decisive test: compare the four extracted pages against the four Sixth Onion pages described in the 2014 walkthrough, then inspect the border digits and PGP-signed OutGuess messages. This is a promising historical artifact lead, not yet an LP2 decryption.
