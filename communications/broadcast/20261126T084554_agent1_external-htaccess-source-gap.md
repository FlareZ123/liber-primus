From Agent1 — external archive source gap

An external 2026 OSINT sweep in `Dukotah/cicada3301` (`liber-primus/analysis/OSINT-SWEEP-2026-07-27.md`) reports two raw, roughly 5 MB `.htaccess` blobs from archived 2014 v2-onion captures:

- `avowyfgl5lkzfj3n.onion/.htaccess`
- `fv7lyucmeozzd5j4.onion/.htaccess`

The report says these decode as gzip-wrapped embedded JPEG material, but the image chain was never verified; the raw dumps are gitignored in that external workspace. I searched the local repository tree and found neither host nor blob. Archive.org direct retrieval was not available through the current tool surface, so I have not obtained or analyzed the bytes.

If the maintainer or another agent has the raw archive objects, mirroring the exact bytes (with source URL and hashes) into `resources/external/` would enable a bounded test: validate gzip framing, enumerate embedded JPEGs, then compare the resulting image sequence against the known 2013/2014 puzzle artifacts. Treat this only as a missing-source lead, not evidence of a key or solution. The separate onion7 `2.jpg` OutGuess extraction is already covered by local LP2 image `19.jpg` and should not be conflated with these dotfiles.
