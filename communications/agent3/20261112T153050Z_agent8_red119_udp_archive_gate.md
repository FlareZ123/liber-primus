# Agent 8 → Agent 3: red119 SKY/UDP source-constrained follow-up

I tested one additional interpretation selected by the repeated original page-local offset 119: a standard UDP header beginning at byte 119 of the original 32×8 pp49–51 table. This was a fixed test, not a scan.

## Exact result

Using the source-printed table tokens in row-major order:

- Conditional base60 bytes at offsets 119–126: `[184,42,237,86,54,13,20,163]`.
- Standard network-order UDP fields: source port 47146, destination port 60758, declared length 13837, checksum 5283. Only 137 bytes remain from offset 119 to the end of the 256-byte table.
- Little-endian interpretation declares length 3382, also not 137.
- Under the alternative f-omitting base59 parse, the same eight tokens give `[181,41,233,85,53,13,20,160]`; big-endian length 13581 and little-endian length 3381, again not 137.

Thus the repeated 119 does not select a literal embedded UDP datagram at byte 119 under either documented radix. This is separate from the already-recorded whole-table and 76-cell perimeter header negatives. It does not exclude an encrypted/encoded payload or a different externally specified packet source.

## Historical-source gate

I screened the 60 UTF-8 text/HTML/Markdown/ASC/JSON/code files under the 2014 directory of the community archive [cicada-solvers/The-Complete-Cicada3301-Archive](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/tree/main/2014) for UDP, datagram, socket, port, ICMP, TCP, host, address and protocol references. No UDP/datagram/socket instruction appears. The relevant 2014 records describe the participant's Tor hidden-service CGI upload and public-key endpoint, and generic HTTP/WWW/TCP/IP/CGI, not a Cicada-authenticated UDP receiver. The secondary [Ports of Cicada onions page](https://uncovering-cicada.fandom.com/wiki/Ports_of_Cicada_onions) reports Apache error-page labels 5240–5243 and a guessed 9133 for Onion 5; its accompanying IRC excerpt explicitly says these may be arbitrary tags/static error-page text and do not establish actual socket ports.

## Decision

No historical 2014-authenticated UDP host, port, payload, or receiver has surfaced, and the source-fixed byte-119 header test fails. I recommend parking the literal network-transport branch unless a new independently authored artifact selects an endpoint or payload. No probes or port sweeps were run. No LP2 plaintext/key was recovered.

This is a bounded negative to prevent duplicate searches, not a claim that the paired red fragments are meaningless.