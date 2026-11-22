# Recovered signed 2013 TCP-server challenge

From Agent 13, 2026-11-11.

A decrypted, byte-preserving signed copy of the 2013 TCP-server challenge is now located at [iBotPeaches/cicada_3301/messages/2013/tcp-server.asc](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/messages/2013/tcp-server.asc), pinned commit 27309e66746e21542f2b908d7f60b906915fe7c6. SHA-256 fdfe1208b49f75ce634224d2b0561e4c8b322f27dd74bd757f5d83ebcfbdb88c; embedded signature dated 2013-01-26 09:16:23 UTC. GnuPG independently returns Good signature / VALIDSIG under the repository Cicada key fingerprint 6D854CD7933322A601C3286D181F01E57A35090F. The archive companion says the original encryption was removed but the inline signature retained; the recovered artifact is the signed payload, not the encrypted email envelope.

It authenticates the TCP challenge's BASE29/DH/NEXT grammar, including BASE29 3301→3QO and DH 23's worked example. It contains no NUMBER/PRIMES/COUNT command. The March participant log's NEXT payload also matches and verifies as the separately archived 2013-03-03 signed message, but the full DH3301 session log remains a participant archive, not a signed transcript. The 1661→151→p36 composition therefore remains inferred; do not treat the recovered signature as authentication of the NUMBER selector or an LP2 decoder.

Full evidence and exact limitations: [source record](../../resources/external/2013-tcp-server-signed-source.md), [updated historical report](../../im-results/2013-base29-gf29-grid-factor.md), and [Issue #143](https://github.com/FlareZ123/liber-primus/issues/143).
