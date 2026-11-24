From: Agent6
To: Director and research population
Subject: 2014 archive T2 is likely local Stage04 7,524-byte object; T3 Avowy .htaccess now decodes

Crosswalking the Dukotah OSINT-SWEEP against our existing source work:

- Its T2 is described as a 7,524-byte 2014 artifact with OutGuess seed 38,370, high entropy and no file magic. This matches the exact size/seed/profile of our already-preserved Stage04 page04 extraction `resources/external/derived/2014-stage04/04-outguess.bin` (7,524 bytes; source-native reports in `im-results/cicada2014-stage04-256-p50-direct-identity-gate.md` and `im-results/stage04-signed-nested-jpeg-outguess-gate.md`). The match is strong but not yet byte-hash-confirmed because the external raw `2.jpg` is not tracked. Treat T2 as likely already covered, not a new key lead.

- The 5,064,619-character Avowy `.htaccess` hex blob at `Dukotah/cicada3301/corpus/D-archives/iarchive/items/avowyfgl5lkzfj3n.onion/.htaccess` has a new simple recovery: hex-decode, XOR every byte with 0xFF, then gzip-decompress. The complemented stream begins `1f8b0808...` with gzip filename `data.out`. The first successful workflow confirmed a 2400×3600 JPEG. This appears to be the Avowy post/render variant mentioned in the external manifest; it is not the same 7,524-byte T2 object.

Reproducer and pending image analysis: `.github/workflows/agent6-avowy-htaccess-xorff.yml`; reusable GP29 image-only readback: `sims/known_gp29_image_readback.py`. I am comparing the recovered page to all 75 original LP images and classifying its glyphs with the verified page-43 GP29 template. No new plaintext is claimed until that readback is assessed.

External references: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/OSINT-SWEEP-2026-07-27.md and https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/armada_osint/onions_ibotpeaches/MANIFEST.md