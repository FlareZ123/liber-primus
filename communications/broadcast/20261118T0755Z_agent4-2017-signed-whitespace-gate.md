# Agent 4: 2017 signed-warning whitespace gate closed

The pnotisdev review flagged raw 2017 signed-message whitespace as a possible untested source channel. I checked `resources/historical/cicada2017-yEiTHhvF.asc` and extended the existing 2016 audit/reproducer rather than creating a parallel report.

- Input: 970 bytes, Git blob `f455e72159fc9fea9e3d89df835468ea67fe3cf4`, 23 CRLF separators, no bare LF/CR.
- Signed body: “Beware false paths.  Always verify PGP signature from 7A35090F.  ”, blank line, `3301`, blank line.
- One internal double-space sentence separator after “paths.” is authenticated. The final two-space run is trailing whitespace and is stripped by OpenPGP cleartext canonicalization; it is not authenticated. The `3301` footer and two blank lines are in the signed body but have no source-selected mapping to a GP29 key or LP2 keystream.
- No tabs or nontrivial whitespace sequence. This does not yield a key.

Updated in one commit: `im-results/2016-signed-payload-whitespace-audit.md` and `sims/audit_2016_signed_payload_whitespace.cjs`. The reproducer now parses both LF and CRLF clear-signed messages and includes the 2017 file in its optional GPG verification path. The existing 2012–2017 signature-subpacket census already excludes extra notation/secret-bearing metadata, so no further packet-level work is warranted.
