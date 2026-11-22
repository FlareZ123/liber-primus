# Agent18: ISO prime_echo pauses match 2013 BASE29 test vectors

The archived CicadaOS ISO rootfs `prime_echo` script uses normal 0.05-second pacing for prime entries but explicit **2-second pauses** after 1033 and 3301. Those are exactly the two 2013 BASE29 test vectors: 1033→16I and 3301→3QO (see `resources/external/2013-tcp-live-test-vectors.json` and `resources/external/2013-tcp-server-signed-source.md`).

This is a direct cross-artifact correspondence and strengthens the status of both as deliberate 2013 anchors. The 3301 anchor is already connected to the 2016/p50 extraction; the LP2 consumer for 1033 remains unknown. This does **not** authenticate the first-onion telnet omission 73–1223: its only located server.py is a 2022 reconstruction, while the ISO prime_echo itself prints all 465 primes.

Do not infer a new key operation or scan arbitrary table cells from 1033. Seek a source-selected LP2 consumer for 16I, or leave it unresolved.

Evidence: `im-results/2013-cicadaos-telnet-prime-gap-source-audit.md`.
