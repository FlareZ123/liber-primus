# xsxnaks second-onion page: archive and chain gate

**Disposition: bounded historical reconstruction; no original HTTP entity recovered and no LP2 handoff found.** This resolves the page's place in the 2013 sequence while preserving the remaining availability gap for Director Issue [#376](https://github.com/FlareZ123/liber-primus/issues/376).

## Naming correction

The 6 January signed hello from **emiwp4muu2ktwknf.onion** names **xsxnaksict6egxkq.onion**. The former is the first 2013 onion service (the TCP/interactive-shell stage); xsxnaks is the **second onion**, reached from that hello. It is therefore clearer to call this the second-onion page, not the first-onion page.

## Reconstructed player-visible route

    First onion: emiwp4muu2ktwknf.onion (TCP service)
      └─ 6 Jan PGP-signed hello → xsxnaksict6egxkq.onion (second onion)
           ├─ v1 page: “Patience is a virtue.”
           │    └─ HTML comment: “which means, come back soon.”
           │         └─ 501 error leaks old host li528-4.members.linode.com
           │              └─ old service taken down
           └─ replacement service (participant account says another server / Apache version)
                ├─ 11 Jan: page says “Welcome back.”
                ├─ 14 Jan, 06:31 GMT: PGP-signed “knock on the sky” message
                └─ second 501 error leaks li498-122.members.linode.com
                     └─ ICMP echo captures identify li498-122
                          └─ signed payload names pklmx2eeh6fjt7zf.onion
                               └─ third-onion “Standby for coordinates” /
                                  2013 poster, phone, SSSS and recruitment sequence

The last two steps are a participant-described route, not a proven signature-time chronology: the ICMP payload's signed timestamp is **10 January 2013**, while the “knock” page message is signed and reported as observed on **14 January 2013**. A message can be signed or staged before it is made available. Do not state that the 14 January wording caused the 10 January-signed payload. Agent45 is handling the separate availability/chronology question in Issue #376.

## Page content preserved by later archives

The pinned community archive [neuroretransmit/cicada, commit 6c6d3318414775f7febce3c982607039e70f176d](https://github.com/neuroretransmit/cicada/tree/6c6d3318414775f7febce3c982607039e70f176d/2013/005-second-onion) preserves this 129-byte v1 HTML file at [patience.html](https://github.com/neuroretransmit/cicada/blob/6c6d3318414775f7febce3c982607039e70f176d/2013/005-second-onion/patience.html):

    <html>
    	<head><title>3301</title></head>
    	<body>
    		Patience is a virtue.
    		<!-- which means, come back soon. -->
    	</body>
    </html>

For this **community archive copy only** (not a recovered original HTTP body):
- Size: 129 bytes.
- Git blob SHA-1: 7f591aaf6754b6b0a4acf27f912241a40a5c47b5.
- SHA-256: 29bb72d374ec6085b762f684d7a66f7e1df2a6d00176c0eea7bce9b80d45c20d.

The later Uncovering Cicada wiki transcript says that on 11 January 2013 the page returned at about 02:00 GMT+1 as:

    <html>
    	<head><title>3301</title></head>
    	<body>
    		Welcome back.
    	</body>
    </html>

It records the same “Welcome back” state at 17:14 GMT+1. The hidden comment was gone. The same transcript says the page changed again at **06:31 GMT on 14 January**, displaying the PGP-signed text preserved locally as [cicada2013-second-onion-everything-you-need.asc](../resources/historical/cicada2013-second-onion-everything-you-need.asc):

    You already have everything you need to continue.

    Sometimes one must "knock on the sky and listen to the sound."

    Good luck.

    3301

The surrounding HTML and the v1/“Welcome back” pages are **not signed**. The signed message body is; the exact original HTTP headers and body bytes are not preserved.

## The two server disclosures are different

The participant record preserves two distinct 501 responses for the same onion address:

1. **v1 / old host:** the error page identifies Apache/2.2.22 (Ubuntu), server **li528-4.members.linode.com**, Port 81. The archive links this hostname to 106.186.17.4 and says the clearnet host worked until the first Tor-2 service went down.
2. **replacement / new host:** the later error page identifies **li498-122.members.linode.com**, Port 81, with a different Apache banner. The participant record says this host did not work on plainweb. It explicitly says the page did not simply reopen: it was hosted on another server with another Apache version.

The ICMP packet transcript also identifies **li498-122.members.linode.com** as the echo-reply source. The payload is a gzip-wrapped PGP message, preserved in the community archive as [icmp-echo.txt](https://github.com/neuroretransmit/cicada/blob/6c6d3318414775f7febce3c982607039e70f176d/2013/005-second-onion/icmp-echo.txt) and [icmp-echo.asc](https://github.com/neuroretransmit/cicada/blob/6c6d3318414775f7febce3c982607039e70f176d/2013/005-second-onion/icmp-echo.asc). Its signed body says “Well done. You have come far.” and names **pklmx2eeh6fjt7zf.onion**. The archive reports the gzip member's source-file modification time as **10 January 2013 22:07:15**. The second host's numeric IP was not recovered in the sources checked; do not reuse the old li528 IP as if it identified li498.

This corrects a simple same-server interpretation: the participant account distinguishes the old li528 host from a replacement li498 host, and the packet capture names li498. The exact DNS/IP transition and the time at which the ICMP payload became publicly obtainable remain unresolved.

## Human-puzzle implication and cross-artifact callback

The v1 page is a deliberate-looking **waiting gate** in the participant reconstruction: its visible sentence says “Patience is a virtue” and its HTML comment immediately explains “come back soon.” The next observed state is “Welcome back,” followed by a short metaphor that suggests a recognizable operation, ICMP echo. This is a useful historical example of a compact human-facing clue selecting an operation, but it does not establish that the signed 14 January message caused the already-10-January-signed ICMP payload.

The same community wiki's phrase table records “Patience is a virtue” as prime **761** and “For Every Thing That Lives Is Holy” as prime **1033** (onions 2 and 1 respectively). These are plausible callbacks to the 2013 761.mp3 / 1033 material. The phrase table and first-onion COUNT reconstruction are participant material, not part of the signed TCP-server specification; treat this as historical context, not an authenticated LP2 selector or key.

## Source inventory and archive limits

- **Project-authenticated message files:** [first-onion hello](../resources/historical/cicada2013-first-onion-hello.asc), [second-onion “everything you need”](../resources/historical/cicada2013-second-onion-everything-you-need.asc), and [ICMP echo reply](../resources/historical/cicada2013-second-onion-icmp-echo.asc). The project source set records the PGP signatures as verified. Signature time, page observation time, and live availability time are distinct.
- **Pinned participant archive:** [neuroretransmit/cicada second-onion README](https://github.com/neuroretransmit/cicada/blob/6c6d3318414775f7febce3c982607039e70f176d/2013/005-second-onion/README.md), plus the v1 HTML, signed-message copy, ICMP hex and decoded message. This is a later community archive, not a 2013 WARC.
- **Two error-page copies:** [n7xtuNqh.txt](https://github.com/cijhho123/cicada3301/blob/d360ad97d39c4719e42dc88b0cbbb81ed54aa02c/2013/additional%20docs/TOR%202.2%20PAGE/n7xtuNqh.txt) and [nB98cRuT.txt](https://github.com/cijhho123/cicada3301/blob/d360ad97d39c4719e42dc88b0cbbb81ed54aa02c/2013/additional%20docs/TOR%202.2%20PAGE/nB98cRuT.txt). The latter preserves both the old li528 and replacement li498 error banners. These are later GitHub copies of participant material; original Pastebin timestamps were not recovered.
- **Detailed participant chronology:** [scream314/cicada3301 2013.md](https://github.com/scream314/cicada3301/blob/10733feb487bb8beb9966d534727ee5897aa54fc/2013.md) describes the two onion states, both server banners, ICMP replies and decoded pointer. The overlapping text in these repositories is not independent corroboration.
- **Wiki export:** [Dukotah's pinned Uncovering Cicada export, export_cur_00160.xml](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/corpus/C-community/wikis/uncovering-cicada/export_cur_00160.xml) contains the “TOR 2 DOWNTIME” page at revision **2016-05-02 04:38:16Z**, with embedded 7, 11 and 14 January 2013 observations. The related [export_cur_00840.xml](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/corpus/C-community/wikis/uncovering-cicada/export_cur_00840.xml) is a 2025 revision of the wiki material. These embedded dates are participant transcriptions, not independently captured HTTP timestamps.
- **Pinned Wayback CDX corpus:** [Dukotah exact-host CDX directory](https://github.com/Dukotah/cicada3301/tree/f63501d8f2d835b80c30230eb89a1110fb9197d2/corpus/D-archives/cdx). For xsxnaks, the direct .onion query has **0 rows**. The .onion.to file has **3 root rows** (11 April 2016 HTTP 302, 11 April 2016 HTTPS 500, 25 July 2016 HTTP 302) and **9 robots.txt rows** (5 HTTP 200, 4 HTTP 302); there is no root HTTP 200 capture. The .onion.link file has one robots.txt HTTP 502 row. The queried .cab, .city, .direct, .lt, .sh and .ws variants have 0 rows. These records do not supply the original page and do not query the li528/li498 clearnet hostnames.
- The wiki also links screenshots at prntscr.com/p4iat and prntscr.com/p4dz2 and Pastebin IDs n7xtuNqh / nB98cRuT. The original screenshot and Pastebin services did not yield retrievable originals in this pass. No original WARC, raw HTTP response headers, authenticated HTML page, or original 2013 page-body capture was recovered.

## LP2 disposition

The second-onion route ends at the signed pklmx pointer. The existing [pklmx continuation gate](pklmx-2013-onion-continuation-gate.md) documents the third-onion “Standby for coordinates” page and the later coordinates/poster/phone/SSSS recruitment chain; it found no authenticated LP2, p56, AN END, or LP2-key handoff. Nothing in the xsxnaks page or its ICMP continuation selects an LP2 operation or source-derived key.

**Close the xsxnaks archive task as a bounded historical result.** Keep Issue #376 open for the distinct signature-time versus public-availability question. Reopen this archive branch only if an original WARC/HTTP entity, an independently timestamped raw capture, or a new authenticated LP2 cross-reference appears.
