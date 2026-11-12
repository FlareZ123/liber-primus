# 2013 second-onion ICMP: payload and prime-ID reconstruction

**Classification:** reproducible historical payload reconstruction; target IP documented in a participant transcript; strong, incomplete 3301-seeded prime-ID hypothesis; original PCAP not recovered. This is not an LP2 decryption.

## Directly recovered payload

The pinned [`neuroretransmit/cicada` source](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/005-second-onion) contains `icmp-echo.txt`, `icmp-echo.asc.gz`, and the decoded `icmp-echo.asc`. The archived hex text is 28 lines: 27 lines of 28 bytes and a final line of 22 bytes, for **778 bytes** total. It is an extracted data stream, not a raw PCAP.

Strip whitespace from the 28 hex lines, decode with `bytes.fromhex`, gzip-decompress, and compare with `resources/historical/cicada2013-second-onion-icmp-echo.asc`. The decompressed output is **959 bytes** and matches byte-for-byte. Reproduce with:

```bash
python sims/reconstruct_2013_icmp_echo_payload.py
```

| Object | Size | SHA-256 |
|---|---:|---|
| Reconstructed gzip stream | 778 bytes | `17a82c53d90dcc17bdae5df8507c46bcec6e959e719dd6fc26a9e2e31a0ce1e1` |
| Decompressed signed message | 959 bytes | `13645961e2642811500677f1a08d537e3c38f8c28764229b9d93480965c1c78c` |

Source Git blob IDs: `4007ca0792f8084a53b4b4f289571ae35e2b4b22` (`icmp-echo.txt`) and `b8dcf1674603399d364c43ba86241f3147660fd2` (`icmp-echo.asc`).

The gzip header names `message.txt.asc` and stores mtime `1357837635`, i.e. **2013-01-10 17:07:15 UTC**. That epoch exactly matches the OpenPGP signature creation time. GPG verification against the preserved Cicada key gives a valid signature with fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`; this establishes cryptographic validity against that key, not independent identity or key trust. The signed body says:

> Well done. You have come far.  
> pklmx2eeh6fjt7zf.onion  
> Good luck.  
> 3301

No LP2 plaintext, LP2 key, page-56 instruction, or `AN END` handoff appears in this payload.

## Target and human-facing operation

The contemporaneous [2013 `#33012013` IRC log](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/%2333012013.freenode.log) is 13,345,841 bytes and 190,170 lines (SHA-256 `3589f67c010e3290845900d1247ae1d65919859bb05e7e5efffb90b70dc46028`).

- **11 Jan, lines 15727–15731:** participants distinguish replacement host `li498-122.members.linode.com` from earlier `li528-4.members.linode.com`; adjacent IP-lookup and DNS-lookup messages give `106.187.103.122` for the new host.
- **11 Jan, line 16117:** a participant posts a ping loop targeting `li498-122.members.linode.com`. This predates the signed “knock” instruction, but the log does not show that the custom reply was recognized then.
- **15 Jan, lines 23189–23215:** participants say there had been no hint in that direction before the “knocking” message, report that some routers/ISPs drop the second ICMP reply, and discuss a packet capture.
- **15 Jan, lines 23484–23487:** a participant describes the custom responder as emitting one data line per ping request; simultaneous pingers therefore divide the stream between them. This is participant-reported behavior, not recovered server source code.
- **15 Jan, lines 26524–26599:** the channel refers to a first PCAP, with inconsistent attribution to `pots_` and `hops_`, and connects the capture discussion to a `/sci/` post.
- **20 Mar, line 71617:** a participant explicitly records `li498-122.members.linode.com. [106.187.103.122]`.

The IP mapping is participant-documented, not recovered from the original packet header or independently established DNS history. The exact DNS transition time remains unknown.

The separate signed “knock on the sky and listen” message was signed at epoch `1358141467` (**2013-01-14 05:31:07 UTC**). Its [Pastebin copy](https://pastebin.com/raw/CLZTB1KF) is the signed hint, not a PCAP; its HTTP Last-Modified header is 14 Jan 05:35:48 GMT and its Date header is 14 Jan 21:50:12 GMT. The IRC log records public recognition of the ICMP route on 15 Jan. The tcpdump sample timestamps around 17:32 have no date and must not be assigned to 10 or 11 January.

## 3301-seeded prime-ID hypothesis

The independent [`scream314/cicada3301` transcript](https://github.com/scream314/cicada3301/blob/10733feb487bb8beb9966d534727ee5897aa54fc/2013.md) shows three data-bearing ICMP echo replies:

| Data line | 28-byte data fragment | Observed ICMP identifier | Prime rank |
|---:|---|---:|---:|
| 19 | `c866c2e3cd2eda7698b2057681c3846fba7bf4b1c1bc6c7f2e8db8fc` | 3457 | 483 |
| 20 | `e0ddd275cf4069985ed481c22491bb267414e5fb128fdb429c662443` | 3461 | 484 |
| 21 | `f6856ed2d4aa87f36686ca58e0f82927b1756e6d7bcf94f6abb55c4f` | 3463 | 485 |

Each displayed packet fragment matches the corresponding hex-stream line exactly. These values are **ICMP identifiers**, not IPv4 IDs: the sample IPv4 header ID is zero, while the ICMP echo-reply identifier is 3457, 3461, or 3463. The same transcript shows sequence number 1 for these data replies, interleaved with ordinary ping replies using identifier 54023 and increasing sequence numbers.

The IRC description of one data line per ping matches the 28-line stream. The numerical fit is unusually specific:

- 3301 is the 464th prime.
- Advancing to the next prime before each data reply gives 28 identifiers at prime ranks 465–492.
- Data lines 19–21 then receive identifiers 3457, 3461, and 3463, exactly matching the surviving packet samples.

The resulting **predicted** identifiers are:

`3307, 3313, 3319, 3323, 3329, 3331, 3343, 3347, 3359, 3361, 3371, 3373, 3389, 3391, 3407, 3413, 3433, 3449, 3457, 3461, 3463, 3467, 3469, 3491, 3499, 3511, 3517, 3527`

The simplest model is to initialize a counter at 3301, advance it to the next prime for each data line, and use that value as the ICMP identifier. The first data reply would use 3307 and the 28th 3527. **Only positions 19–21 are directly observed.** The first and last values, and the complete sequence, remain predictions pending a full capture. The tcpdump excerpt reports ICMP length 64 but preserves only the 28-byte data fragment; the remaining ICMP body is not reconstructed here.

This is a strong, falsifiable packet-header mechanism and a plausible human-facing clue: “knock” leads to ping, the second reply carries a line, and its ICMP identifier advances through primes from the Cicada 3301 seed. It may be a transport counter or watermark; it is not evidence of a key or a cipher layer for LP2.

## PCAP search and bounded absence

The pinned `neuroretransmit/cicada` second-onion directory contains the extracted hex stream, gzip, signed message, and decode material, but no `.pcap` or `.pcapng`. The IRC log confirms that participants had or discussed a PCAP and that a link had been posted earlier, but the channel transcript does not preserve a usable capture URL.

- `pastee.org/6bx6t`, `pastee.org/fg64f`, and `pastee.org/psrss`: current requests return 404; Wayback CDX queries returned no captures.
- `codeseekah.com/cicada/tings.bin`: current request returns 404. This was a participant-linked binary, not established as the PCAP.
- `pastie.org/5686025`: gone.
- `boards.4chan.org/sci/res/5414358#p5440590`: referenced in the IRC discussion; tested archive mirrors did not yield a retrievable copy.
- Pastebin `CLZTB1KF` is the signed 14 January hint, not the capture.

An additional complete HEAD-tree inventory covered eight public, independently maintained or mirrored repositories (all GitHub tree listings reported `truncated: false`): `neuroretransmit/cicada` (4,928 paths), `scream314/cicada3301` (445), `iBotPeaches/cicada_3301` (414), `cijhho123/cicada3301` (1,452), `cicada-solvers/The-Complete-Cicada3301-Archive` (1,455), `Dukotah/cicada3301` (6,361), `krisyotam/cicada3301` (4,507), and `pnotisdev/cicada3301` (14,051). Filename/path filtering for `.pcap`, `.pcapng`, `.cap`, `snoop`, `icmp`, `ping`, `wireshark` and `tcpdump` found no original capture. The only on-topic additional hit, [`iBotPeaches`' `Onion_xsxnaksict6egxkq_Ping.md`](https://github.com/iBotPeaches/cicada_3301/blob/main/other/Onion_xsxnaksict6egxkq_Ping.md), reproduces the same 28-line hex stream already preserved. This is a **current default-tree filename inventory**, not a historical Git object or binary-in-archive exclusion. The original 2013 `/sci/` thread remains a distinct unresolved archival route, as do privately held participant captures.

Thus the raw PCAP is **not recovered from the named accessible archives**. The three sample packets and extracted stream establish the payload and a strong prime-counter prediction, but not all 28 packet identifiers or the complete ICMP body. If the original PCAP or referenced `/sci/` post is recovered, the decisive test is whether the 28 data replies use the predicted identifiers in order.

The later `Dukotah/cicada3301` file `logs_linode_onion3.docx` is a separate 2014 onion3 record for a different Linode host; it is not evidence about this January 2013 `li498-122` ICMP exchange.

## Disposition

The 2013 ICMP route is reproducible at the payload level and has a strong 3301-seeded prime-ID model. The recovered signed payload leads only to the pklmx continuation already documented in [the pklmx gate](pklmx-2013-onion-continuation-gate.md), a separate 2013 coordinate/poster/SSSS branch, not LP2. Keep the prime-ID sequence classified as a hypothesis until the full capture is found; do not promote it to an LP2 key or plaintext.
