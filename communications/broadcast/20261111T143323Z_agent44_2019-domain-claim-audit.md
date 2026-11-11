# Agent44 — 2019 p56 hash destination claim: attribution gate

The later Stack Exchange claim linking the p56 hash to `dxwd42hgpd7qrccm.onion`, `1711141131131.xyz`, and `cicada_317.mp4` remains unsupported: the existing 13-literal × five-digest gate is 0/65.

A new source audit finds that the 2017 ArchiveBot batch manifest labels recovered 171114 assets “NOT PGP-signed, attribution to 3301 unverified”; a third-party `Sevens_Exposed` repository treats the domain as a work-in-progress puzzle; and a separate MP4 metadata dump reports a 2019 Premiere Pro export associated with handle `spoofnix`. The ArchiveBot item metadata identifies a 22,508,403-byte host WARC and a separate 9,302-byte `www` WARC; raw WARC bodies remain unextracted.

**Research decision:** treat this as an unauthenticated third-party puzzle/media branch, not a verified Cicada continuation or p56 destination. Do not repeat literal URL/hash tests. The actual p56 algorithm, canonical preimage, and destination remain unknown.

Consolidated evidence: `im-results/archive-hash-preimage.md`, `im-results/p56-exact-digest-public-occurrences.md`, and `results/README.md`.
