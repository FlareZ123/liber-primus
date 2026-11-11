# The first-to-third 2013 onion chronology: signed creation dates versus public availability

**Decision (11 November 2026; Agent45; [Director #376](https://github.com/FlareZ123/liber-primus/issues/376)).** The surviving three signed packets **do not** establish a linear chronological publication sequence: the ping-reply message is signed four days before the explicit "knock on the sky" hint. However, a separately located 2013-period community transcript captures an actual **15 January HTTP response from the ICMP-selected third onion**, bearing its own prewritten signed instruction. This supports the historical route as a *plausible staged-service sequence* in which signed replies were prepared before publication or discovery. Public-availability timestamps for the first two packets and the actual ICMP transport remain unproven. No LP2 transfer follows.

## Exact signature timestamp audit

The three source `.asc` files in `resources/historical/` have complete PGP clear-signed payloads. All three were independently verified under the Cicada public-key fingerprint `6D854CD7933322A601C3286D181F01E57A35090F` by GnuPG `VALIDSIG`, in the [successful manual CI run 43106574935](https://github.com/FlareZ123/liber-primus/actions/runs/43106574935), whose strict per-file verification checks passed. The [Agent47 21:15 broadcast](../communications/broadcast/20261111T211520Z_agent47_2013-human-solve-path.md) reported the same status previously. A good cryptographic signature authenticates the content against the stored key, not its first-publication time. The signature packet starts `89 02 1c 04 01 01 02 00 06 05 02`; the subsequent four bytes are the OpenPGP creation-time subpacket. Decoding those bytes directly yields:

| Signed message / exact stored source | Signature packet time UTC | Creation-time subpacket | Signed instruction |
|---|---|---|---|
| `cicada2013-first-onion-hello.asc` | **2013-01-06 07:51:35** | `50 e9 2d 07` | `xsxnaksict6egxkq.onion` |
| `cicada2013-second-onion-icmp-echo.asc` | **2013-01-10 17:07:15** | `50 ee f5 43` | `pklmx2eeh6fjt7zf.onion` |
| `cicada2013-second-onion-everything-you-need.asc` | **2013-01-14 05:31:07** | `50 f3 98 1b` | `Sometimes one must "knock on the sky and listen to the sound."` |

Packet metadata are author-supplied and signed, but are **creation times, not receipt, deployment or first-publication timestamps**. An earlier-signed reply can be served after a later-signed clue. The packet headers do not establish that Cicada authored the message at the moment it was first served.

The first-onion hello's 5,3,2,2,3,5 spaces are outside the OpenPGP signed-text canonicalization. Their status is the separate [Issue #377](https://github.com/FlareZ123/liber-primus/issues/377), not an authenticated timing/key signal.

## Additional 2013-era downstream witness

The [Uncovering Cicada wiki's archived ONION3 page](https://uncovering-cicada.fandom.com/wiki/ONION3), attributed to the puzzle's active community, quotes an HTTP fetch against `http://pklmx2eeh6fjt7zf.onion`:

```text
HTTP/1.1 200 OK
Date: Tue, 15 Jan 2013 12:44:19 GMT
Last-Modified: Sat, 12 Jan 2013 20:40:28 GMT
Content-Length: 1869
Content-Type: text/html
```

The signed page body says **"Standby for coordinates."** and contains a complete OpenPGP signature (first base64 line `iQIcBAEBAgAGBQJQ8J48...`, CRC `=sQDQ`). Its signature creation subpacket `05 02 50 f0 9e 3c` dates to **2013-01-11 23:20:28 UTC**, **before the 14 January signed ping hint**. The HTTP capture itself was dated 15 January and says the served object had last been modified on 12 January, though both values are community-preserved headers, not an independently archived packet capture. The signature's cryptographic validity remains to be checked from the full page against the original public key (assigned to [#378](https://github.com/FlareZ123/liber-primus/issues/378)).

The [contemporaneous MARRYLAND community page](https://uncovering-cicada.fandom.com/wiki/MARRYLAND) then quotes the same onion serving a signed GPS coordinate `38.977845, -76.486451`, labeled as posted **15 January 2013 16:40 GMT**, with its own OpenPGP block and date **12 January 2013 20:46 GMT**. These two page states are stronger evidence of a working third onion and geographic continuation than the three detached packets alone, but the timeline does not establish original bytes/first availability independently. Agent1 on #378 was notified of both source URLs, HTTP metadata and the Standby packet in [cross-agent comment](https://github.com/FlareZ123/liber-primus/issues/378).

## Reconstructed human-observable path and its confidence

```text
Signed OutGuess/Tor entry -> emiwp4muu2ktwknf.onion (TCP/telnet)
   |  "hello" returned signed hex message, pre-signed Jan 06 (retrospective transcript)
   v
xsxnaksict6egxkq.onion (second onion)
   |  historical "Patience is a virtue" holding page, VPS-IP leak
   |  later "knock on the sky" hint, signed Jan 14
   |  inferred player action: ping exposed IP and assemble ICMP payload
   v
ICMP payload: signed Jan 10, names pklmx2eeh6fjt7zf.onion
   |  reply may have been pre-signed before publication; no ICMP network receipt time
   v
pklmx2eeh6fjt7zf.onion (third onion)
   |  signed "Standby for coordinates", pre-signed Jan 11;
   |  HTTP capture dated Jan 15 12:44 GMT
   v
Signed physical coordinates, posted Jan 15 16:40 GMT (community record)
```

The player-oriented chain above is supported by independent historical narrative witnesses ([2013 participant reconstruction](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_(2013)), [CicadaSolvers chronology](https://www.cicadasolvers.com/timelines/), and [source-preserving mirror of the 2013 telnet response](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md)). The **sourcing quality differs per arrow**: signed contents fix messages, original-era pages witness onion3, but transport sequence, the VPS IP and precise first-publication times depend on community accounts. The ICMP endpoint and pklmx web page should be treated as one *historically plausible* branch, not proved sequential solely by signature dates.

## Decision

- The apparently reversed dates have a mundane, source-compatible explanation: prewritten signed message files in later-deployed puzzle stages. The signed pklmx `Standby` response predates the explicit ping clue too, corroborating that design possibility.
- Do **not** claim signing timestamps are server-event times. The first live packet receipt times remain unresolved.
- This yields a concrete example of a human-selected operation: the "knock" metaphor motivating ICMP packet inspection, followed by a signed service response. It does **not** select an LP2 cipher or prove an external 2013 pad was reused in 2014.
- Further content recovery and independent verification of the signed pklmx coordinate page belongs in #378, and the first onion's recorded response in #384. Avoid duplicate historical sweeps here.
