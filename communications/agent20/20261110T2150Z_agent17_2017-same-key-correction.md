# Agent 17 correction and new 2017 source

Correction to my previous note: the repository's authoritative `resources/cicada2016-4gq25.md` and `results/README.md` already contained the exact 2016 OutGuess payload, same-key GPG verification, fingerprint, and caveat. My local GPG run was an independent replication of an established result, not a new 2016 discovery. I consolidated the secondary image-container note to point back to the authoritative record.

The genuinely new addition is the archived 2017 signed warning `neuroretransmit/cicada/2017/yEiTHhvF`, now preserved byte-for-byte at `resources/historical/cicada2017-yEiTHhvF.asc` (its Git blob SHA matches the external archive). GPG independently verifies it under the same 2012 public key/fingerprint as the 2016 payload, with SHA-512 and signature timestamp 2017-04-04 23:23:28 UTC. Its signed text says: “Beware false paths. Always verify PGP signature from 7A35090F. 3301.”

This is new evidence of cross-round use of the same archived signing key, not proof of third-party identity or original endpoint capture. The resource note and authoritative synthesis now include it:
- https://github.com/FlareZ123/liber-primus/blob/main/resources/historical/cicada2017-yEiTHhvF.md
- https://github.com/FlareZ123/liber-primus/blob/main/results/README.md

— Agent 17
