# Red119 SKY/UDP: dated IRC-source gate for an executable packet instruction

**Decision (12 November 2026): the pinned public 2014–2016 participant transcripts do not supply an authenticated Cicada UDP receiver, sender, port/payload specification, captured datagram response, or LP2 decryption instruction.** The original p3/p39 red triads remain an interesting provisional `SCY / UDP` Atbash readout. This is a bounded historical-archive negative, **not** a general proof that the creators never intended an offline or currently missing network route. No LP2 unknown plaintext or key was recovered, and no UDP packets were sent.

## Source-selected question

The unique two red13-bracketed three-rune inscriptions, both at page-local rune offset119 on physical LP2 pp3 and39, convert under already solved LP1 GP29 Atbash to **SCY** (GP spelling corresponding to SKY) and **UDP**. The authenticated 2013 signed **“knock on the sky and listen”** instruction instead led to an ICMP echo responder, whose original packet payload and participant IP record are preserved [here](2013-icmp-echo-packet-reconstruction.md). The 2014 fourth-onion OutGuess message also carries **9133**, and a period third-onion server-status leak names `106.186.123.224`. These are historically observable *candidate* address/port fragments, but no source connects them as an actual UDP socket. [Original red119 clue](lp2-p3-p39-red119-atbash-sky-udp.md), [separate offline 256-byte payload framing candidate](../workplace/lp2-red119-udp-payload-handoff.md).

The exact gate is narrow: examine **dated 2013–2016** messages or packet traces for a human-visible and reproducible UDP command, consumer or response **linked independently** to those two red words. Merely finding a string `UDP` near unrelated scanner reports would be a false positive.

## Pinned participant archive and executable coverage

The archive [`neuroretransmit/cicada` commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs) contains original text IRC files. Two source-pinned, manual-only Node 22 programs downloaded the original bytes, asserted exact **Git blob SHA-1** identities against the archive tree, and examined **UDP, 9133, 3319, PCAP/packet capture, and same-line UDP plus one proposed port**. The complete archived log searches were executed successfully in [run 43255696139](https://github.com/FlareZ123/liber-primus/actions/runs/43255696139) and [extended run 43256420048](https://github.com/FlareZ123/liber-primus/actions/runs/43256420048). Output contains dated, numbered original lines and selected conversation context, rather than detached search fragments.

| Public archive file | Original bytes | Original lines | `UDP` mentions | Same-line `UDP` + 9133/3301/1033/3319 |
| --- | ---: | ---: | ---: | ---: |
| `#33012014.freenode.log` | 8,629,610 | 112,097 | **0** | **0** |
| `#cicadasolvers.freenode.log` (Jan–Sep 2014) | 18,487,233 | 239,026 | **10** | **0** |
| `#cicadasolvers.freenode.2.log` (Sep 2014–May 2016) | 27,234,234 | 347,210 | **9** | **0** |
| `#3301cado.freenode.log` | 326,982 | 5,299 | **0** | **0** |
| `#cicada3301.freenode.log` | 291,299 | 3,713 | **0** | **0** |
| **Total** | **54,969,358** | **707,345** | **19** | **0** |

Pinned SHA-256 digest of `#33012014`: `e442ece859af483c3a69a9cdca8a60605a3867aef311deef57d3f12b7617e1fb`. Its two numerals `3319` and `9133` appear only in **general prime listings** (6 Jan and 15 Jan 2014), not as a network address. The other log digests are `997a057dbeb86f32eabc25865dd721b72be902d3df9e972d936a508a66b17fb1` for `#cicadasolvers`, `0761bdcec9b62a533b30985fa94f2e689ff8dc87456b296ccc8661fa7c4b697e` for `.2`, `35d66e4fb25ce67c292952429dc18d07306d078cb77d1208d790c13f3c2cb3a6` for `#3301cado`, and `290bb757fd08f44e10cae63907387c04c892c1c6f520ddc9ad23d5cb6c6514c3` for `#cicada3301`. These hashes fix every cited record without assuming its author's statements are accurate.

## Context resolves all potentially relevant UDP anecdotes

**9 January 2014, `#cicadasolvers` lines 5536 and 8449–8469.** A participant reports port **123/UDP open on `106.186.123.224`**. Later someone says they scanned that Linode with TCP and UDP probes. The immediately adjacent context identifies **123/UDP as ordinary NTP**, and says TCP/80 and UDP/123 were the only apparently available ports. This is participant scanner evidence and does not attribute a custom UDP listener or instruction to Cicada. It cannot authenticate sending LP2 table bytes to that address.

**14 January 2014, lines 36720–36740.** Two participants discuss `Apache Server at 127.0.0.1 Port 5243`, along with consecutive ports 5241/5242. They notice that **Viber** commonly uses UDP **5243/9785**, explicitly offering that as an analogy. The actual named Apache listener is **localhost HTTP**, not a recovered Cicada UDP datagram consumer. The shared values do not establish a new packet route.

**31 January 2014, lines 92418–92430.** Participants report unsuccessful attempts to access supposed **9133/3319** ports while a historical onion path was available. Others explicitly caution that the numbers could be **arbitrary tags in a static HTTP error page**, rather than socket ports. The record does **not specify UDP** and does not demonstrate UDP was tested. The independent 2014 OutGuess `9133` remains a clue fragment, not an address.

**31 January 2014, line 94771.** A participant loosely says a user-provided onion service could accept “UDP files or whatever”. The immediately following messages correct other details of his explanation; it is informal, speculative user commentary about uploading magic squares. It supplies no original bytes, producer command, UDP endpoint or capture. Onion services are not an evidenced UDP transport here.

**14 May 2014, lines 177399–177402.** A participant did examine a **PCAP of a Tor hidden service upload**, identified an `--xYzZY--` MIME boundary after a PGP signature and had it explained as multipart framing. This is concrete historical packet-capture testimony, but pertains to **TCP/Tor HTTP multipart upload**, with no preserved UDP packet payload.

**20 August 2015, `.2.log` lines 164425–164445.** Another participant reports **UDP/113** behavior on `1033adacic.org`. A peer demonstrates **SSH** on port 113, and channel participants call this off-topic for Cicada. The scanner's UDP interpretation is not independently established or relevant to red119.

Other `UDP` mentions concern jokes, torrent trackers, NTP attacks or general networking; three `9133` mentions in the later log are a bot prime-list output and a 2016 retrospective question about the fifth-onion clue. **No one preserved a source-attributed UDP command containing the proposed puzzle bytes**, a receiver's original datagram response, or a reversible LP2 decoder. The 2013 signed SKY/ICMP operation remains the closest independently authenticated historical networking action.

## Cryptanalytic decision

The full source-verified archive creates **no source-fixed pair (receiver, port)** for the offline pp49–51 256-byte table hypothesis; ports **1033/3301**, **9133**, **5243**, **9785** and **123** should not be promoted to Cicada UDP destinations based on these records. The portable offline UDP serialization is syntactically valid only and would be valid for any arbitrary 256-byte payload, so it predicts **no unknown plaintext**.

A future positive must be an original dated creator-signed command or contemporaneous trace with exact datagram destination, port, payload framing and response, followed by a verified LP2 plaintext or reproducible key handoff. A missing historical private message remains possible. No present-day probe or guessed endpoint is justified.

Reproducers: [source-original early 2014 IRC gate](../sims/lp2_2014_udp_irc_source_audit_sft.cjs) and [extended four-channel 2014–2016 gate](../sims/lp2_2014_udp_laterchannels_archive_sft.cjs); manual-only [workflow](../.github/workflows/lp2-2014-udp-irc-source-audit-manual.yml). Each source line is pinned to a historical Git blob; the broader archive's missing private traffic is outside this negative.
