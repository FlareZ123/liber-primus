# pklmx 2013 onion: cross-round continuation gate

**Disposition: retire as an LP2 continuation/key-source lead.** Preserve the host as a 2013 historical reference. The recovered page content and its documented continuation belong to the 2013 physical-location/recruitment sequence; no authenticated handoff to Liber Primus, LP2, p56, or the 2014 AN END hash was found.

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

## Cryptanalytic disposition

No recovered pklmx page, coordinate, poster record, phone output, XOR result, SSSS share, final quiz, or TCP-server specification supplies:
- an LP2 page number or ciphertext reference;
- a p56 or “AN END” reference;
- a key, key-generation rule, or source-selection operation for LP2;
- a reproducible preimage for the 2014 deep-web hash.

The 2013 outputs are other 2013 onion addresses and recruitment-stage instructions. Do not feed the pklmx hostname, coordinate values, phone codes, or 2013 SSSS secret into LP2 key searches merely because they are Cicada material. Retire this continuation branch. Keep the 2014 AN END target separate and reopen only on a new authenticated cross-round link or a source-selected LP2 input.

## Provenance and caveats

- The 2013 ICMP pointer is preserved in this repository as `resources/historical/cicada2013-second-onion-icmp-echo.asc`; the signed timestamp ordering above is taken from the preserved PGP messages and Agent47's correction.
- The third-onion HTML and walkthrough are a community archive. They preserve PGP-signed message bodies, but I did not independently re-verify those third-onion signatures in this invocation; the preceding 10 January ICMP pointer is separately recorded as signature-verified in the project. The original server, full original response bytes, and every live coordinate update were not independently recovered in this task.
- The Fandom header transcription is an independent participant/wiki witness, not a substitute for original WARC bytes.
- The Wayback CDX counts are from the pinned external datasets above; they establish only the stated archive-query scope.
