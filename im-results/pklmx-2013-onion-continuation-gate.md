# pklmx 2013 onion: cross-round continuation gate

**Disposition: close as a historical 2013 recruitment branch, not an LP2 continuation/key-source lead.** The player-visible route is now reconstructed through coordinate updates, physical posters, Gematria-derived phone codes, ISO-byte XOR, a 5-of-10 SSSS recovery, a 19-image screening quiz, and the later TCP-server challenge. Its recovered secret is the 2013 onion address p7amjopgric7dfdi.onion. Nothing in this route supplies an LP2 key, selector, plaintext, or cipher mechanism; retain it as evidence about Cicada's earlier human-puzzle design, not as an active LP2 decryption hypothesis.

## Question and decision rule

The target was `pklmx2eeh6fjt7zf.onion`, named by the 2013 ICMP-stage signed message. A useful cross-round result would require at least one of: a Cicada-signed instruction that selects an LP2 operation or source; an exact LP2/p56/AN END reference; an identifiable source-derived key object; or a reproducible digest preimage. A familiar onion address, a later community interpretation, or a numerical coincidence is insufficient.

## What the preserved page says

The participant archive `neuroretransmit/cicada`, pinned at commit [`ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`](https://github.com/neuroretransmit/cicada/commit/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3), preserves the initial page as [`standby.html`](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/006-third-onion/standby.html). Its PGP cleartext-signed body says only:

> Standby for coordinates.

The archive's [stage README](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/006-third-onion/README.md) records later signed coordinate updates and the continuation:
- [`okinawa.html`](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/006-third-onion/okinawa.html): `26.41968, 127.73254`.
- [`annapolis.html`](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/006-third-onion/annapolis.html): `38.977845, -76.486451`.
- The full stage account lists seven poster locations, poster phone numbers and access codes, dataset/offset/hex triplets, XOR against the named 2013 ISO data files, and the resulting onion addresses.
- The recovered Shamir shares reconstruct `p7amjopgric7dfdi.onion`, whose next stage is the 19-question test. The same archive then documents a 3 February 2013 TCP-server implementation challenge. This is a 2013 recruitment/selection chain, not an LP2 handoff.

The preserved HTML files are participant-archive objects, not a claim to have recovered the original server's complete HTTP entity. Their exact bytes as returned from the pinned GitHub files were hashed (ASCII/LF content; byte counts match the Git tree):
| Object | Bytes | SHA-256 |
|---|---:|---|
| `standby.html` | 983 | `292b3450434756eeb872bd9bf1c88033b2056cab1925310f53214dfbffa6d086` |
| `okinawa.html` | 976 | `4c0768ffb17868db874cf9e01f217b2056939e0164f16566e0783370ee7f6a62` |
| `annapolis.html` | 978 | `287c360521f5693a73c218060a96d3c1c8bff1497b88a83faf527e55999c99e0` |

The participant archive's HTML wrappers contain the PGP signature blocks. The corresponding source commit is dated 3 May 2024; this dates the repository copy, not the original live response. The independent [Uncovering Cicada ONION3 page](https://uncovering-cicada.fandom.com/wiki/ONION3) reports an HTTP 200 response dated 15 January 2013 12:44:19 UTC, Last-Modified 12 January 2013 20:40:28 UTC, and Content-Length 1869, and transcribes the signed “Standby for coordinates” message. Its 1869-byte header value differs from the 983-byte participant-archive file: do not treat the two as byte-identical. The exact original 1869-byte entity body was not recovered here.

## Independent signature verification (Agent16, 11 November 2026)

The three pklmx messages are now independently verified against the preserved Cicada public key. The exact participant-archive files and their `.asc` companions are mirrored under [`resources/historical/pklmx-2013/`](../resources/historical/pklmx-2013/README.md). Their source is the pinned `neuroretransmit/cicada` commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`; these are participant-archive copies, not original-server or WARC bytes. For every message, the HTML `<pre>` block is byte-for-byte identical to its separate `.asc` companion, with LF line endings and no CR bytes.

GnuPG 2.4.7 reports `GOODSIG` and `VALIDSIG` for all three under primary fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`. The preserved key is 4096-bit RSA; the signatures are OpenPGP v4, RSA algorithm 1, SHA-1 digest algorithm 2, text signature class `0x01`. Each dearmored signature packet is 543 bytes; its hashed creation-time subpacket matches the following:

| Message | Signed text | HTML / signed-block bytes | Signed-block SHA-256 | V4 creation time (UTC) | Binary signature-packet SHA-256 |
|---|---|---:|---|---|---|
| Standby | `Standby for coordinates.` | 983 / 909 | `86ad73b36db096c48720ab36ba5147b0b4baf9f8be7e2cd6a4d6d8afdf6435d6` | 2013-01-11 23:20:28 | `b8b14ae7e57f968fa2b8a6ae0d89e3ab32f54aab34b825e7e8c4b380a897211a` |
| Okinawa | `26.41968, 127.73254` | 976 / 902 | `ce3b6b7c5beacf46d7b729805084f51001cb7a7bae5d3d7b2d90076546af63b1` | 2013-01-12 20:39:51 | `c565fd255f340164bce5b8292441f8175ffd121e322373950467c01c4d9d6690` |
| Annapolis | `38.977845, -76.486451` | 978 / 904 | `348cf5639cde991d1257865b0e5778843d067b6e272e93725389da72eb0314dc` | 2013-01-12 20:46:39 | `a59cbc644c57fe12ed155a950fa0656ccdd08a28ed0dfc96258f731bc2a973fb` |

The exact source Git blob IDs, full-file SHA-256 values, signature packet hashes, fingerprint, packet metadata, and HTML/ASC equality are asserted by [`sims/pklmx_2013_signed_message_verification.py`](../sims/pklmx_2013_signed_message_verification.py). The GnuPG trust database reports the key as `[unknown]`: this is cryptographic verification against the preserved key, not independent web-of-trust identity certification. The signature timestamps are signer-supplied signed metadata, not trusted publication timestamps.

**Archive correction:** the external stage README's two coordinate-page links are swapped relative to their signed content. `annapolis.html` contains the Annapolis coordinate and `okinawa.html` contains the Okinawa coordinate; use the signed text, filenames, and later summary table, not the two misplaced prose links.

The ONION3 Fandom page quotes `Date: 15 Jan 2013 12:44:19 GMT`, `Last-Modified: 12 Jan 2013 20:40:28 GMT`, and `Content-Length: 1869`. These headers are community-transcribed and unsigned. The 1869-byte HTTP entity has not been recovered; the pinned standalone `standby.html` is 983 bytes, and the two coordinate pages are separate 978- and 976-byte files. The quoted Last-Modified time is 37 seconds after the Okinawa signature and 6 minutes 11 seconds before the Annapolis signature. That is a useful chronology boundary, not proof of which signed messages were present in the HTTP response. The ONION3 and MARRYLAND pages also disagree on the Annapolis posting time (16:50 CET versus 16:40 GMT); both are secondary accounts, while the signed creation time is unambiguous.

**Disposition:** the three signed message bodies are authenticated under the preserved key, but the HTML wrappers, HTTP headers, original 1869-byte response, and first-publication chronology are not. The signed text supplies a standby instruction and two coordinates; it still contains no LP2/p56 handoff, key, or cipher instruction.

## Archive and repository search

The exact-host search was checked against the pinned Cicada-related sources already indexed by the project:
- [`iBotPeaches/cicada_3301`](https://github.com/iBotPeaches/cicada_3301): the signed ICMP message naming the host.
- [`neuroretransmit/cicada`](https://github.com/neuroretransmit/cicada): the third-onion page and coordinate/poster/XOR/SSSS archive above.
- [`krisyotam/cicada3301`](https://github.com/krisyotam/cicada3301): a 2013 walkthrough that likewise describes the third onion as “standby for coordinates.”
- [`Dukotah/cicada3301`](https://github.com/Dukotah/cicada3301/tree/f63501d8f2d835b80c30230eb89a1110fb9197d2): exact-host CDX inventory, target list, and artifact inventory.
- [`pnotisdev/cicada3301`](https://github.com/pnotisdev/cicada3301/tree/15200c67abee106913ba01ff504c5b6e88d16cc7): broad URL harvest and Wayback CDX corpus.
- Exact-host search in `cicada-solvers/neuroretransmit-cicada` returned no matches. No separate original-era IRC/mail capture containing an additional pklmx instruction surfaced in these pinned repositories; the contemporaneous pointer is the signed ICMP payload, while the page and coordinate sequence survive through participant/wiki archives.

The pnotisdev Phase 52 archive report ([report](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/log/phase52_an_end_archives.md), [CDX data](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/phase52/cdx_results.json)) records:
- Direct `pklmx2eeh6fjt7zf.onion/*`: **0** Wayback CDX rows.
- `.onion.to/*`: **39** rows, comprising 17 root requests (all HTTP 302 or 500) and 22 `robots.txt` requests (HTTP 302/200). No root-page HTTP 200 capture exists in this set.
- `.tor2web.org`, `.tor2web.io`, `.tor2web.fi`, `.d2web.org`, and `.onion.city/.cab/.link/.sh/.ws/.nu/.lt/.direct`: **0** rows each.
- The independent [Dukotah CDX file](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/corpus/D-archives/cdx/onion_pklmx2eeh6fjt7zf_to.json) has 21 rows with the same gateway pattern; its [summary](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/corpus/D-archives/logs/cdx_summary.tsv) records zero direct-onion rows and zero for the other queried proxy forms. Its manifest identifies the 2016 root replay as a gateway HTTP 500 response, not the Cicada page.

This is a **bounded Wayback result**, not a universal claim about all archives. The pnotisdev report explicitly says it did not query archive.today, Common Crawl, or Tor2web-era mirrors outside Wayback. That limitation does not preserve this as an LP2 lead: the page content that is available is already identified as the 2013 coordinate/poster chain, and the Wayback gateway captures add no competing page body.

## Chronology caution

The signed ICMP reply that names pklmx is timestamped **10 January 2013**. The separate signed instruction containing “Sometimes one must ‘knock on the sky and listen to the sound’” is timestamped **14 January 2013**. Agent47's [chronology correction](https://github.com/FlareZ123/liber-primus/blob/main/communications/broadcast/20261111T211700Z_agent47_2013-timestamp-order-correction.md) correctly warns that the surviving signatures do not show the 14 January wording causing the 10 January ICMP reply. Treat the metaphor/ICMP association as a conceptual connection, not a proven chronological trigger.


## Reconstructed player-visible 2013 solve path

This section consolidates the physical-poster, IVR, ISO/XOR, Shamir, and post-Shamir stages from pinned participant archives. It is deliberately separated from the PGP-authenticated page/signature findings above: the coordinate messages and several transition messages are signed, but the poster photographs, phone transcripts, extraction tables, and 19-question screenshots are participant/community records rather than signed Cicada statements.

### Poster and phone stage

Pinned source: [neuroretransmit/cicada at ade9a02889ef8acbc8cde8edbfd0a785c369f4c3](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/006-third-onion). The README records seven locations, seven phone numbers, and seven two-letter access labels. Five poster photographs are present (Okinawa, Moscow, Arkansas/Little Rock, Oregon/Portland, Georgia/Columbus); Dallas has no photograph in this archive, and Annapolis is explicitly marked as not physically recovered. The README says six location codes were recovered and the seventh was not physically visited, while still listing all seven codes. Treat the Annapolis row's acquisition history as unresolved.

The two-letter labels are not T9. The independent worked-call account gives L=73 and M=71 in Gematria Primus, so LM becomes 7371; the keypad/T9 attempt 56 fails. Applying the same concatenation of Gematria Primus prime values gives the following reconstruction:

| Location | Coordinates | Phone | Poster label | GP digits | Dataset / byte offset | XOR result |
|---|---|---|---|---:|---|---|
| Dallas | 33.092817, -96.082650 | +1 205-396-3301 | JD | 3789 | 560.17 / 33461 (0x82B5) | y2wyuvrqraowagc5.onion |
| Okinawa | 26.419680, 127.732540 | +1 626-586-1033 | YF | 1032 | 560.13 / 37861 (0x93E5) | wzwmcwmsk5cb7gjn.onion |
| Moscow | 55.793765, 37.578608 | +1 928-237-3301 | CR | 1311 | 560.13 / 1111111 (0x10F447) | qw7mhchzvuq6f2mf.onion |
| Little Rock | 34.747791, -92.269086 | +1 719-428-3301 | LM | **7371** | 560.13 / 13831 (0x3607) | 4l6uipnstbggwjyv.onion |
| Annapolis | 38.977845, -76.486451 | +1 253-655-1033 | PX | 4347 | 560.17 / 77977 (0x13099) | erwfcsdvx6pm2rsk.onion |
| Portland | 45.500920, -122.652512 | +1 424-999-1033 | GH | 1723 | 560.13 / 12821 (0x3215) | gbyh7znm6c7ezsmr.onion |
| Columbus | 32.478944, -84.983674 | +1 469-251-1033 | NR | 2911 | 560.17 / 617 (0x0269) | ll5afyskb6v6g7ga.onion |

The community README's Little Rock row says LM:7167. That is inconsistent with both the stated Gematria mapping and the independent worked-call result (7371). Treat 7167 as a transcription error, not as a second viable code.

The archive says the phone IVR supplied a dataset number, byte offset, and hexadecimal string. The operation is a bytewise XOR between the supplied bytes and the corresponding slice of DATA/560.13 or DATA/560.17. The seven resulting strings are onion hostnames after trimming the line ending. The exact supplied and extracted byte strings are preserved in sims/2013_pklmx_reproduce.py.

There is a material Annapolis transcription error. In the neuroretransmit README table, its data string has 43 hex nibbles and cannot be decoded. Its all.txt version is even-length but shifts a nibble and appends a zero; XOR with the archived extracted bytes produces non-onion binary output. The independent iBotPeaches-derived ShamirSolve.php and 2013_SSSS_Extractions.md use the corrected data value:
~~~text
d5a6cb76e55a2166bd6a4d078857ec1f68ea6afa9738
~~~
With the archived extracted bytes, that value XORs to erwfcsdvx6pm2rsk.onion. The reproduction script checks both bad transcriptions and the corrected row.

Raw ISO limitation: the current Liber Primus repository does not contain DATA/560.13 or DATA/560.17, and I did not independently re-extract these slices from the 3301.iso container in this run. The krisyotam archive's ShamirSolve.php reads those exact DATA files, converts them to hex, slices at offset*2, and XORs; its extraction table preserves the resulting byte slices. Its download script pins the 3301.iso MD5 as 74062dee4093c6ca0340cda23f0e994b. A separate recovery note records DATA/560.13 as 118,818,811 bytes with SHA-256 db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f. These are secondary-source checksums, not checksums independently recomputed here. The script accepts --iso-dir to verify the raw slices when those files are available.

### Shamir reconstruction and the authenticated outlier

The seven community-table share values have IDs 02, 03, 05, 07, 08, 09, and 10. The signed share messages preserved in the iBotPeaches archive are 03, 09, and 10. I verified all three clear-signatures locally against the repository's Cicada key (fingerprint 6D854CD7933322A601C3286D181F01E57A35090F); share 03 and share 10 were signed at 2013-01-15 20:05:42 UTC, share 09 at 20:05:44 UTC. Share 10 is therefore authenticated material, not an unsigned transcription.

I implemented the relevant ssss 0.5 combine path independently. The source is [osresearch/ssss, ssss.c blob 0955e250971da324412fdc8454888881df9d3411](https://github.com/osresearch/ssss/blob/0955e250971da324412fdc8454888881df9d3411/ssss.c). The 44-hex-character share payloads imply a 176-bit field. The source's irreducible-coefficient entries at indices 63–65 are 11, 3, and 2, giving x^176 + x^11 + x^3 + x^2 + 1. Its split polynomial is monic of degree threshold; combine removes the known x^threshold term before interpolation. The default diffusion is the 40-pass sliding 64-bit XTEA layer. The reproduction implements the same field, byte order, monic term, and inverse diffusion.

Result: IDs 02, 03, 05, 07, 08, and 09 are mutually consistent. All six five-share subsets drawn from those six IDs recover exactly:

~~~text
p7amjopgric7dfdi.onion
~~~

No five-share subset containing ID 10 recovers that secret (0 of 15 subsets). This does not establish why share 10 differs: it could be a deliberate outlier, a share from another set, or a source-level anomaly. Do not call it forged; its PGP signature is valid. Of the three surviving signed share messages, 03 and 09 fit the recovered set and 10 does not. The other four values are community-table evidence, not PGP-authenticated messages in the archives inspected.

The participant archive's shares.txt order is 02, 03, 05, 08, 09, 10: it omits 07 and appends 10. Its first five shares recover the same secret. The ssss 0.5 combine implementation reads exactly threshold share records, so the sixth line is not consumed. A separate walkthrough uses 05, 07, 09, 03, 02 and also recovers the secret. Thus the archived successful command did not test share 10; exhaustive subset testing reveals the outlier.

The preserved reconstruct.sh invokes ssss-combine with -t 5 -r. That -r flag is not accepted by the pinned upstream 0.5 source's option parser, so this exact shell command is version/fork-dependent or erroneous. The independent walkthrough's plain ssss-combine -t 5 command is reproduced by the script. Do not let this CLI discrepancy obscure the reproduced secret.

### The 19-question stage and later continuation

The pinned fourth-onion archive contains exactly 19 question JPEGs under 2013/007-fourth-onion/questions. Their contents, paraphrased in file order, are:

1. Two observers describe a lake as a reflection versus fish/plants/rocks; which is lying? (1ZND6M7)
2. Whether what one is matters more than what one does. (4XAalwX)
3. If A is not true, what must it be? (8MThJBS)
4. “This sentence is false.” (9lUH3e5)
5. Similarities between reality and Facebook's News Feed. (DVy7AQu)
6. Whether any arbitrary color looks the same to everyone, disregarding color blindness. (F5eP2Ju)
7. Whether observation changes the observed thing. (fFkoMPl)
8. What mathematical operation known as addition is modeled after. (GzIwotK)
9. A paragraph about the brain categorizing sensations by belief systems and noticing confirming rather than contrary evidence. (HvxZwi1)
10. “You cannot step into the same river twice.” (JduaCax)
11. “I am the voice inside my head,” with a parenthetical about the voice the reader just thought. (pAuyLPv)
12. Whether people who study only after a test do better than people who never study. (PWAalbD)
13. Whether 1 equals 0.999… (rrGRCxE)
14. “There is no truth.” (UBF6D1h)
15. Explain the mathematical principle relied on for the security of Shamir's Secret Sharing Scheme. (UMdFAJH)
16. What “it” refers to in “It is dark outside.” (x04ouOT)
17. “All things are true.” (yhDfKUb)
18. Whether grass is green only through a relationship among grass, light, and mind. (yu7uEET)
19. Write a function that returns a function that returns the value 3301. (zSJim03)

The screenshots show timers and, in a few images, selected options (for example, “Strange Loop” for the liar sentence, “True” for observation, and “None of the Above” for “All things are true”). These are visible selections, not an answer key. The 19 images are participant-archive screenshots, not signed Cicada artifacts. The README describes this phase as largely undocumented and based on leaks. Two cookie values (names 167 and 761) are also transcribed there; no role for them is established.

The next email specification in that README says to run a Tor-hidden TCP service and submit its onion address by an email deadline of 3 February 2013. The README explicitly says the email signature was removed; treat the service/deadline wrapper as leaked community material. The later TCP command protocol is separately preserved as a PGP-signed artifact in resources/external/2013-tcp-server-signed-source.md. The signed follow-up message “If you followed the rule but did not receive an email” is independently verified here; it tells recipients to email the organizers and make their GPG key accessible (signature time 2013-01-26 20:26:21 UTC). The later signed invitation asks three questions about privacy/anonymity, free information, and censorship. These are recruitment/selection stages, not an LP2 cipher layer.

### Reproduction and interpretation

Run:

~~~bash
python3 sims/2013_pklmx_reproduce.py
~~~

The script verifies the seven Gematria-derived access codes (flagging the Little Rock mismatch), all seven XOR outputs against the archived extracted-byte column, the Annapolis transcription error, and all 21 five-share combinations. It prints 6/6 matching subsets from IDs 02,03,05,07,08,09 and 0/15 matches among subsets containing signed share 10. Pass --iso-dir with the extracted DATA directory to additionally check the raw ISO slices.

The human solve path is unusually explicit: a signed “standby for coordinates” instruction; GPS coordinates; physical posters; Gematria Primus values; phone IVR fields labelled dataset/offset/data; byte-offset XOR; a named Shamir scheme; then a 19-question screening stage and a small, explicit TCP protocol. This is good historical evidence for the maintainer's clue-constrained, human-player model. It is not evidence that LP2 uses this same pipeline, that the 2013 share 10 is an LP2 key, or that p7amjopgric7dfdi.onion is the manuscript's destination.

## Remaining historical uncertainties

- The authenticated share 10 is outside the recovered 5-of-10 polynomial. Its intended role is unresolved; the present evidence does not distinguish a deliberate decoy, a second share set, or an archive-level mismatch.
- The Little Rock LM value is 7371 by the independently documented GP mapping, while the participant README says 7167.
- The Annapolis hex is inconsistent in the README and all.txt; the corrected ShamirSolve.php value is the one that yields the published onion address and a consistent share.
- The Arkansas/Little Rock poster photograph contains a small QR code at the lower left. Its payload is not decoded in the preserved notes or this run.
- The original DATA/560.13 and DATA/560.17 files are not present in the current repository; the XOR stage is reproduced from archived extraction bytes, not freshly re-extracted from the ISO.
- The 19-question images and email wrapper remain community/leak evidence, not signed Cicada material.

**Closure:** this is a completed historical reconstruction task. No LP2 cipher successor is justified by these findings. If the Director considers the signed share-10 outlier worth pursuing, it should be a separate bounded historical-source decision, not an LP2 key hunt.


## Cryptanalytic disposition

No recovered pklmx page, coordinate, poster record, phone output, XOR result, SSSS share, final quiz, or TCP-server specification supplies:
- an LP2 page number or ciphertext reference;
- a p56 or “AN END” reference;
- a key, key-generation rule, or source-selection operation for LP2;
- a reproducible preimage for the 2014 deep-web hash.

The 2013 outputs are other 2013 onion addresses and recruitment-stage instructions. Do not feed the pklmx hostname, coordinate values, phone codes, or 2013 SSSS secret into LP2 key searches merely because they are Cicada material. Retire this continuation branch. Keep the 2014 AN END target separate and reopen only on a new authenticated cross-round link or a source-selected LP2 input.

## Provenance and caveats

- The 2013 ICMP pointer is preserved in this repository as `resources/historical/cicada2013-second-onion-icmp-echo.asc`; the signed timestamp ordering above is taken from the preserved PGP messages and Agent47's correction.
- The third-onion HTML and `.asc` files are participant-archive copies pinned at `neuroretransmit/cicada` commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`. The initial `Standby for coordinates` body and both preserved coordinate updates independently verify under the repository Cicada key; exact HTML `<pre>` blocks match the companion `.asc` files byte-for-byte. See the signature-verification section and [reproducer](../sims/pklmx_2013_signed_message_verification.py). The original server, full 1869-byte HTTP response, and first-publication chronology were not recovered; the Fandom headers remain community-transcribed and unsigned.
- The Fandom header transcription is an independent participant/wiki witness, not a substitute for original WARC bytes.
- The Wayback CDX counts are from the pinned external datasets above; they establish only the stated archive-query scope.
