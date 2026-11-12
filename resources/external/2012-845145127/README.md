# 845145127.com source inventory

This is a source index, not a rehosting of third-party captures. Community reconstructions must not be presented as original server responses.

## Contemporary sources
- [ClevCode 2012 walkthrough](https://clevcode.org/cicada-3301/) — countdown target, coordinate transition, whitespace decoding recipe, ten numbered image paths and book-code messages.
- [AllMystery 10 January 2012 discussion](https://www.allmystery.de/themen/gg81407-4) — contemporaneous 14-coordinate page and QR discussion; FTP-credential suggestion is speculation.
- [2012 second-chance reconstruction](https://uncovering-cicada.fandom.com/wiki/The_second_chance_(2012)) — filename grouping and later route; community synthesis.
- [2014 participant account](https://gist.github.com/tekknolagi/8526671) — DNS/IP story; its unsigned-message wording conflicts with the verified signature.
- [Current WHOIS](https://www.whoxy.com/845145127.com) — current record only; reports 2013-03-28 creation.

## Page archives
- Countdown: no byte-preserved original HTML found. Pinned [community archive](https://github.com/cicada-solvers/845145127.com/tree/a53793a7e70b4fe07c614f38f8bbe8fcddc728a2) has a 2022 reconstruction (618 bytes, blob `35249f9a6fdabc265a7be7730eba250bb2a66f5e`) and a distinct 20,858-byte image (blob `96522aa7d96d7f42efe16ffa807c021a93c8d436`) added in 2023.
- Coordinates: earliest full copy located is the [2015-06-24 03:54:46 UTC Wayback snapshot](https://web.archive.org/web/20150624035446/http://net-netz-blog.de/845145127.htm) of a third-party local-save page, not the original domain. Pinned [archived HTML](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/blob/c3127e0e9eb5afbb582d37988d6369fe38429238/2012/websites/the%20GPS%20coordinates%20website/845145127.html) is 78,953 bytes (blob `ec5f60d260a5e2547be4b7618491ac68b54240dc`); image is 20,892 bytes (blob `68f9a195ae1c6d6429caa9183846de430baa3a8d`). It contains an IE saved-from marker, AdBlock CSS and Wayback toolbar.
- Whitespace: the community HTML reconstruction is 7,756 bytes (blob `ee54eb231436c9b99e230e669ee45a7e9c8e855f`) and is not byte-faithful; applying the documented decoder does not reproduce the signed payload. Preserve the decoded payload instead.

## Wayback CDX
Pinned [Dukotah CDX JSON](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/corpus/D-archives/cdx/845145127.com.json) (86,526 bytes; blob `642d31460b30f004b70099dc13ecbdd959de6ec3`) has 310 records. Only two are from 2012: `robots.txt` 404 at 2012-01-11 02:24:54 UTC and `www/robots.txt` 301 at 02:25:01 UTC. No 2012 root/page/numbered-image capture exists. First root capture: 2013-05-17 06:50:23 UTC, 404. Later 200s are parking/squatter HTML. See [archive assessment](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/corpus/D-archives/CONFLICTS-D.md).

## Cryptographic artifacts and limits
Three exact clear-signed payloads are preserved under `im-results/2012-845145127/`: 12-coordinate OutGuess extraction, ten-filename whitespace payload and `162667212858.jpg` OutGuess extraction. All verify under `resources/historical/cicada-3301-2012-public-key.asc`, fingerprint `6D85 4CD7 9333 22A6 01C3 286D 181F 01E5 7A35 090F`. Run `bash sims/verify_2012_845145127_signatures.sh`.

The coordinates page has 14 entries while the signed image has 12; two extra entries' provenance is unresolved. The whitespace HTML is not itself signed, but its decoded ten-filename payload is PGP clear-signed (signature time 2012-01-11 05:07:59 UTC). IP/FTP/DNS claims rely on participant accounts and scans, not authoritative DNS/FTP logs. The present WHOIS creation date does not establish continuity with the 2012 registrant. The route ends in the 2012 book-code and second-chance material; it supplies no LP2 key or decoder.
