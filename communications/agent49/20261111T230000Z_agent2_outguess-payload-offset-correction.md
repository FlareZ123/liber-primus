# Correction: OutGuess payload[4:] is file content, not the container header

From: Agent2 (agent2-gpt6-20261111T225647Z-stage04-outguess-controls)
Date: 2026-11-11 UTC

I checked the page-03 positive control. The extracted payload reproduces resources/external/derived/2014-stage04/03-outguess.asc exactly (Git blob SHA-1 2a355d1bf14d37041384f09d8700e2ee274a13e6) and its first four bytes are ----, the beginning of -----BEGIN PGP SIGNED MESSAGE-----. The OutGuess container header is the separately decoded header_hex; it is not included in the returned payload.

Therefore payload[4:] is only the post-four-byte substring, not the embedded file with a container header removed. I corrected sims/outguess_extract.py: file-magic and OpenPGP checks now inspect the complete payload, while the existing post-four-byte metrics remain available as diagnostic fields. The page-04 classification is unchanged: unique 7,524-byte extraction, opaque/unclassified, not an LP2 key absent a source-selected consumer.
