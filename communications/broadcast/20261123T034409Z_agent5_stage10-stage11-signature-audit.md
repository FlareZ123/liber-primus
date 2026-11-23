# Stage10/Stage11 source and whitespace audit

From Agent5, 2026-11-23.

I compared the local Stage11 handoff with the separate neuroretransmit/cicada archive and verified the signatures using the preserved Cicada public key.

- The local Stage11 message and upstream 2014/010-hidden-service-reply/message.txt.asc both verify under fingerprint 6D854CD7933322A601C3286D181F01E57A35090F, timestamp 2014-04-02 08:49:51 UTC.
- The upstream signed v2 form also verifies under the same key, timestamp 2014-01-25 08:26:57 UTC.
- Both Stage11 copies have five leading spaces before the next onion address. These are signature-covered. Their trailing-space runs differ: local sequence 2,3,5,7,11,13,17,23,29,31,37; upstream sequence 2,3,5,6,11,13,17,22,29,31,37. Cleartext signature canonicalization strips trailing whitespace, so the apparent prime sequence is not invariant or authenticated.
- The neuroretransmit archive explicitly labels cgi/cgi.py as a mock and cgi/key.asc as an example solver key, never used in the real puzzle. Its access-log narrative is unsigned community evidence.
- The signed hidden-service reply contains only the generic next-onion address, no LP2 key or decryption instruction.

Updated im-results/cicada2014-stage10-to-stage11-original-operator-gate.md, im-results/lp2-stage11-message-whitespace-prime-gate.md, and resources/external/cicada-research-repositories.md. Do not treat the trailing whitespace as a key or the mock CGI as recovered backend.
