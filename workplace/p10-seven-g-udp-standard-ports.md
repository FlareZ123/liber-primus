# LP2 p10 “7 G” with p3/p39 SKY/UDP: two source-numbered standard UDP services

**Agent 2, 12 November 2026. Classification: original-artifact/historical-standard *candidate*, not a decipherment.** The new contribution is an independently defined *consumer* for the original `7 G` and provisional `SKY/UDP` clues. No host, original datagram, unknown-page plaintext, key, or intended author instruction is recovered.

## Locked inputs, not re-derived findings

The original LP2 physical **p10** (`resources/liber-primus/27.jpg`) contains the lone ordinary-prose Arabic **7**, followed by the isolated GP rune **ᚷ**, at local rune position **169**. **ᚷ** is GP ordinal **7** (index6) and its GP-associated prime is **17**. That source geometry, its uniqueness among the five list numerals and the `7×17=119` speculative address are established in [the original-image source bridge](p10-seven-g-red119-source-bridge.md) and its passing [SFT](../sims/lp2_p10_literal7g_red119_bridge_sft.cjs).

Original p3 and p39 contain the only red three-rune spans, both at local offset119, bracketed by red13 marks. LP1-authenticated Atbash (GP index `28−r`) turns these to `SCY` (GP C/K corresponds to **SKY**) and **`UDP`**. The two triad readings and offsets predate this note: [evidence and SFT](../im-results/lp2-p3-p39-red119-atbash-sky-udp.md). The separately signed 2013 “knock on the sky and listen” puzzle historically used **ICMP echo**, with the 2013 echo host and captured participant packets documented [here](../im-results/2013-icmp-echo-packet-reconstruction.md). That is original *echo behavior*, but it is explicitly **not** evidence for an LP2 UDP listener.

## A historical, zero-key network operation selected by each printed number

Two *different* IETF Internet Standards, both dated **May 1983**, make the original numbers into distinct recognized network-service selectors without fabricating a prime key, an application-packet header, or arbitrary port 1033/3301:

| Original source number | Historically established UDP service | Actual semantics | Relevant original-source clue |
| --- | --- | --- | --- |
| Printed decimal **7** and redundant GP **G** ordinal7 | **UDP/7 Echo**, **RFC 862 / STD 20** | On receiving a datagram, server echoes its contents back | Original p3 **SKY** and signed 2013 SKY→ICMP echo |
| GP-prime lookup **G→17** | **UDP/17 Quote of the Day**, **RFC 865 / STD 23** | On receiving a datagram, server **discards its input** and returns a short printable **quote**, usually under 512 characters | Original p39 **UDP**, immediately preceding the quote-containing LP2 pp40–53 chapter |

**Primary official evidence:**
- RFC 862, May 1983: https://www.rfc-editor.org/rfc/rfc862 — explicitly specifies UDP port **7** with echo reply.
- RFC 865, May 1983: https://www.rfc-editor.org/rfc/rfc865 — explicitly specifies UDP port **17**, its reply format, and that the received request bytes are ignored.
- IANA registry: https://www.iana.org/assignments/service-names-port-numbers — lists `echo/udp/7` and `qotd/udp/17`.

**Material implication:** In the QOTD/17 branch the proposed **256-byte table-as-UDP-application-payload is unnecessary**. A standard server returns its administered quote irrespective of the request contents. The relevant missing artifact is therefore an *authentic contemporaneous service output* rather than evidence that any of the 256 unknown table bytes forms a UDP packet. If the hypothetical author ran a custom QOTD server, such an output could have given a human solver a plaintext passage or a source-selected key/crib. In the Echo/7 branch an ordinary compliant server sends back exactly the chosen input; an independently captured **non-echo response** would be needed to indicate a puzzle-specific custom server rather than a tautology. This makes the two hypotheses experimentally different.

## Objections and discriminating source gate

The manuscript does **not** print “send,” “echo,” “quote of the day,” “port,” a hostname, or an input datagram adjacent to `7 G`. Both `7` and `17` are available, and the choice between the two services is **not fixed**. The alternative multiplication `7×17=119` is also arithmetically compatible with the red-triad offsets, so one must not count its coincidence as independent corroboration of either network service. The quote chapter's proximity to p39 is thematic adjacency, not a source-authenticated network handoff. Many 2014 servers did not expose these archaic services; scanning historical IP addresses in 2026 would be unjustified and uninformative. **There is also a hard transport constraint:** the original Stage11 entry was a Tor onion service, and Tor transports TCP streams, not raw UDP. Thus a literal UDP/7 or UDP/17 request cannot be sent to the published `.onion` address via the normal Tor service. An independently published **clearnet receiver or explicit UDP-over-TCP bridge** would be required. Neither is authenticated in the surviving Stage11 HTML (`133`, `331`, JPEG links). This materially downgrades the hypothesis in the absence of a separate host; it is compatible with the older 2013 clearnet ICMP branch and cannot by itself exclude a missing 2014 clearnet stage. Tor's own protocol statement: https://support.torproject.org/relays/legal-and-abuse/ddos/ .

The preserved 2014–2016 IRC UDP audit [here](../im-results/lp2-red119-dated-udp-packet-source-audit.md) checked broad UDP and various candidate-port references but **did not select or authenticate any UDP/7 or UDP/17 response**. This note has made **zero network requests** and performed no packet/key search.

**Affordable next decision:** Search only source-dated original 2013–2014 participant captures, authentic host advertisements, archived connection transcripts, and signed hints for `UDP/7`, `UDP/17`, `echo`, `qotd` or `quote of the day` linked to the Stage11 server. A positive must contain a time-attributed **receiver**, one **selected port**, captured bytes of an **author-specific response**, and a reversible method that predicts held-out original LP2 text or produces a verifiable novel key. A standard reflection without additional text is a negative for *content extraction* on Echo/7. A fixed source-selected QOTD quote would provide a tight original-cipher test as a plaintext crib or key candidate, with complete page encryption check and controls. If no historical response/source operation exists, stop this branch without guessing current hosts, sending datagrams, trying arbitrary ports, or sweeping new cipher keys.

**Outcome:** New period-correct protocol interpretations for the original 7/17 clues; no genuine unknown plaintext or validated continuation. This report belongs in `workplace/`, not `results/`.
