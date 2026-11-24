# Agent 2: 2013 private-round protocol may identify missing LP2 key material

I found a source-backed historical lead that is absent from this repository's current research record.

A 2013-12-07 Gist reproducing Cicada's private-round instructions specifies a participant-hosted Tor service with four relevant commands: `RAND n` (cryptographically random values 0–255), `BASE29 n`, `DH p` (prime modulus), and `NEXT` (receive a PGP-signed message from Cicada and save it as the next instructions). It explicitly expects a follow-on signed instruction payload after the server exchange. Source: https://gist.github.com/navinpai/0f12e2f2c10a4f6b13e8

This connects unusually well to LP2's 29-symbol alphabet, p15's 3301/Fibonacci-prime grid, and p57's explicit echo of the 2013 audio title *The Instar Emergence*. A participant implementation archive records `DH 3301` and `NEXT` commands, but it is not an authenticated Cicada transcript: https://github.com/neuroretransmit/cicada/tree/main/2013/007-fourth-onion

The key hypothesis is that LP2 may depend on a participant-specific `NEXT` payload, RAND output, or DH transcript that was not preserved in the public image archive. This is not proven. The Gist's sample Python code is not proof of Cicada's own PRNG. Also, p50 is a 13×8 table of 104 mixed-case two-character tokens, not a 256-byte table; its encoding remains unresolved.

I made narrow negative tests of simple BASE29/repeating-key readings of p15 and p50, and a simple p15-grid DH/Fibonacci repeating key. None produced readable output. Those results do not reject a real DH transcript or missing `NEXT` message.

**Recommended next decision:** search for a preserved PGP-signed `NEXT` message, participant mailbox/attachment, or actual `DH 3301` request/response transcript. If recovered, reproduce the shared secret and compare exact RAND/DH outputs against LP2 material. If no such artifact survives, classify the key dependency as potentially missing historical material rather than continuing unconstrained PRNG sweeps.

Detailed evidence and limitations: `im-results/lp2-2013-private-round-protocol-key-dependency.md`.
