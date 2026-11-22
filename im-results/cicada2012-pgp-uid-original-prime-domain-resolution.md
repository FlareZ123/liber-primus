# 2012 845145127.com: page sequence, authenticated payloads and archive boundary

## Conclusion

`845145127.com` was a real 2012 Cicada stage. The source-supported sequence is **countdown → coordinates → whitespace payload → ten numbered images → two book-code messages → second chance**. The whitespace HTML is whitespace-only, but its decoded payload is a valid PGP clear-signed message. The earlier claim that the decoded message was unsigned is contradicted by direct signature verification.

This authenticates a continuation of the **2012** puzzle. It does not provide an LP1/LP2 rune key, an LP2 cipher operation, or an authenticated LP2 destination.

## Page sequence

The original phone instruction used the first image's prime dimensions, 509×503, and 3301:

`509 × 503 × 3301 = 845145127`

The 2012 public-key User ID is `Cicada 3301 (845145127)`, matching the domain.

### Countdown

The first page counted down to **2012-01-09 17:00 UTC**. Its recovered image message told solvers to return at that time; the contemporary ClevCode walkthrough records the transition to the coordinate page at expiry.

No byte-preserved original countdown HTML was found. The community `cicada-solvers/845145127.com` archive's `countdown/index.html` is a 2022 reconstruction (618 bytes, blob `35249f9a6fdabc265a7be7730eba250bb2a66f5e`). Its distinct 20,858-byte countdown image (blob `96522aa7d96d7f42efe16ffa807c021a93c8d436`) was added to that archive in 2023.

### Coordinates

The page changed at the stated expiry to an instruction to find the nearest symbol and **14 coordinate entries**. A contemporaneous 10 January 2012 forum discussion also records 14 entries.

The associated `cicada.jpg` is 20,892 bytes (blob `68f9a195ae1c6d6429caa9183846de430baa3a8d`). Its archived OutGuess extraction is a PGP clear-signed list of **12** coordinates; its signature verifies under the 2012 key and was created **2012-01-08 22:34:35 UTC**. The page copy contains two additional entries absent from the signed payload:

- Seoul: `37.577070, 126.813122`
- Arkansas: `36.0665472222222, -94.1726416666667`

Keep the 14 page entries and 12 signed-image entries distinct. The embedded JPG signature was created **2012-01-08 22:34:35 UTC**, before the 9 January 17:00 UTC website change. A post-signature addition to the public webpage is plausible, but no surviving creator statement or original dated page edit proves why the extra entries appeared.

**Follow-up physical-poster recovery (12 November 2026):** source-locked original-image QR decoding identifies the archive's ambiguously labelled `Arkansas-or-Sydney.jpg` poster as **`http://845145127.com/162667212858.jpg`**, one of the *already signed* ten image URLs carrying the existing Britannica book-code family. A second archive has the byte-identical photo under a generic US filename. Two preserved Seoul images show an actual cicada poster; the 240×240 QR is clipped at its bottom, while the separate 480×360 street photo has an unreadable tiny QR. A strictly bounded ten-original-filename partial-QR comparison yields no unique URL (best 120/204, runner-up113/204). Thus no independent new 2012 key/route is recovered. Evidence and runnable image checks: [original poster QR source decision](cicada2012-two-unsigned-coordinates-poster-qr-recovery.md).

The earliest full page copy located is a Wayback snapshot dated **2015-06-24 03:54:46 UTC** of a *third-party local-save page* at `net-netz-blog.de/845145127.htm`, not a direct capture of `845145127.com`. The archived HTML is 78,953 bytes (blob `ec5f60d260a5e2547be4b7618491ac68b54240dc`) and embeds the 20,892-byte image. It contains an Internet Explorer “saved from” marker, AdBlock-injected CSS and the Wayback toolbar; it is not the original HTTP response. [Pinned archived page](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/blob/c3127e0e9eb5afbb582d37988d6369fe38429238/2012/websites/the%20GPS%20coordinates%20website/845145127.html).

### Whitespace payload and ten images

The later whitespace-only page's decoded output is a PGP clear-signed message. ClevCode documents the operation: discard non-whitespace, map tabs to 0 and spaces to 1, then group into octets. The signed payload lists:

```
162667212858
414974253863
598852142735
876873892385
935691396441
316744223127
427566844663
644169769482
889296759263
963846244281
```

The signature was created **2012-01-11 05:07:59 UTC** and verifies under the Cicada key. The HTML page itself is not signed; its decoded payload is. A 2014 participant Gist calls the message unsigned, but that description conflicts with the clear-signed payload and reproducible verification.

The ClevCode walkthrough maps the numbers to `http://75.119.203.244/NUMBER.jpg`; the community second-chance reconstruction records equivalent domain URLs. The filenames are grouped as follows:

- **29-volume / Britannica (six):** `162667212858`, `316744223127`, `414974253863`, `427566844663`, `598852142735`, `889296759263`.
- **Fading-death / Agrippa (four):** `644169769482`, `876873892385`, `935691396441`, `963846244281`.

The walkthrough says the images reproduce the two messages already obtained from physical QR posters. One raw numbered image, `162667212858.jpg`, survives in the `neuroretransmit/cicada` archive. Its OutGuess extraction is itself PGP clear-signed and verifies under the same key; signature time **2012-01-06 20:28:30 UTC**. The other nine original image files were not found in the reviewed archives. The two book-code messages lead to the established Britannica and Agrippa paths, not to an LP2 key.

The separate second-chance path sums the largest number in each family:

`889296759263 + 963846244281 = 1853143003544`

The `1853143003544.tk` lead and its TXT follow-up to `33091839349.tk` belong to the 2012 second-chance branch. The community reconstruction notes no direct evidence that the first `.tk` domain itself was created by 3301; a later PGP-verified message authenticates the second-chance instruction. The resulting onion is `cginiziglyaobyph.onion`. This is a continuation within the 2012 puzzle, not a transfer into Liber Primus.

## Cryptographic verification

The public key is `resources/historical/cicada-3301-2012-public-key.asc`.

- Primary fingerprint: `6D85 4CD7 9333 22A6 01C3 286D 181F 01E5 7A35 090F`.
- Signing key ID: `181F01E57A35090F`.
- The coordinate payload, ten-filename whitespace payload and preserved `162667212858.jpg` OutGuess payload each return **Good signature**.
- Signature times: 2012-01-08 22:34:35 UTC; 2012-01-11 05:07:59 UTC; 2012-01-06 20:28:30 UTC.

GnuPG marks local owner trust `[unknown]`; this is lack of a local certification path, not a failed signature. Exact clear-signed payloads and a reproducer are in [the evidence bundle](2012-845145127/) and `sims/verify_2012_845145127_signatures.sh`.

The community `whitespace_message/index.html` (7,756 bytes; blob `ee54eb231436c9b99e230e669ee45a7e9c8e855f`) is not byte-faithful: applying the documented whole-response whitespace filter to that reconstruction does not reproduce the signed message. Preserve the decoded payload, not this HTML as the exact original bitstream.

## Wayback, DNS and registration

A pinned independent CDX inventory contains 310 domain records. Its only two 2012 captures are:

- `2012-01-11 02:24:54 UTC`: `http://845145127.com/robots.txt`, HTTP 404.
- `2012-01-11 02:25:01 UTC`: `http://www.845145127.com/robots.txt`, HTTP 301.

There is no 2012 capture of the domain root, countdown HTML, whitespace HTML or any numbered image in this inventory. The first root capture is **2013-05-17 06:50:23 UTC**, HTTP 404. The 2013 captures of `316744223127.jpg` and `935691396441.jpg` are also 404. Later 200 responses for the root and numbered paths are HTML parking/squatter pages, not original JPEGs. See the pinned [CDX JSON](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/corpus/D-archives/cdx/845145127.com.json) and [archive assessment](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/corpus/D-archives/CONFLICTS-D.md).

A participant report gives the historical server IP as `75.119.203.244`. A contemporaneous scan dated 9 January 2012 19:17 EST records ports 21/FTP, 22/SSH and 80/HTTP open. This establishes service exposure, not an FTP listing or credentials; forum speculation that QR locations supplied FTP logins remains unverified. The signed filenames are documented as HTTP image paths.

DNS accounts are not fully consistent: the contemporary ClevCode narrative says the DNS entry was removed, while a later participant account says it changed to `127.0.0.1` and the old IP stopped responding after files were retrieved. The two Wayback `robots.txt` captures are the hard archived timestamps; no authoritative historical DNS log establishes the exact change time or mechanism.

Current WHOIS reports a creation date of **2013-03-28** and current registrant/nameserver details that do not establish continuity with the 2012 registrant. The original page references are HTTP; no 2012 certificate record was found in the reviewed source set.

## LP2 decision

The signed payloads authenticate a real 2012 sequence: coordinates, ten image filenames, two book-code messages and a second-chance route. They do not name Liber Primus, supply a GP29 rune sequence, specify an LP2 decoder, or yield an LP2 key. The 845145127 derivation and second-chance filename arithmetic are explained within the 2012 round. Keep this as an established historical route; **do not promote it into an LP2 cipher hypothesis**.

## Sources

- [ClevCode contemporary walkthrough](https://clevcode.org/cicada-3301/) — countdown, coordinate transition, whitespace decoder and numbered image paths.
- [AllMystery 10 January 2012 discussion](https://www.allmystery.de/themen/gg81407-4) — contemporaneous coordinate page and QR/FTP speculation.
- [2012 second-chance reconstruction](https://uncovering-cicada.fandom.com/wiki/The_second_chance_(2012)) — filename grouping and downstream route; community source.
- [2014 participant account](https://gist.github.com/tekknolagi/8526671) — DNS/IP narrative; its unsigned-message wording conflicts with signature verification.
- [2015 Wayback copy](https://web.archive.org/web/20150624035446/http://net-netz-blog.de/845145127.htm).
- [Community page archive](https://github.com/cicada-solvers/845145127.com/tree/a53793a7e70b4fe07c614f38f8bbe8fcddc728a2).
- [Independent CDX inventory](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/corpus/D-archives/cdx/845145127.com.json).
- [Current WHOIS](https://www.whoxy.com/845145127.com) — current registration only, not a 2012 ownership record.

Run `bash sims/verify_2012_845145127_signatures.sh` to verify the three preserved clear-signed payloads.
