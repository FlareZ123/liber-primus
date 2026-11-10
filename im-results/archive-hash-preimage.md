# Frozen historical onion-page hash preimage test

**Outcome (2026-11-10):** no exact 512-bit digest match from the finite, audited candidate set. **No LP2 plaintext or continuation page was recovered.**

## Question and provenance

Solved LP2 page 56 directs the pilgrim to a deep-web page that "hashes to" the 128-hex-character target printed in `resources/cicada2014-archive-hash-manifest.json`. That text does not specify whether the preimage is a URL, raw page bytes, decoded content or another object; nor does the length uniquely select a digest algorithm.

A public community archive, `krisyotam/cicada3301`, contains staged copies of 2014 onion web pages, signed announcement files, and original puzzle material. We froze archive commit `76d3ee8c762f60025822c8c05edbf31351636469`, then listed **22** specifically sourced 2014-stage files in `resources/cicada2014-archive-hash-manifest.json`. The preserved bytes are archive copies; contemporaneity and byte-for-byte identity to the original 2014 HTTP response have **not** been independently established. These items were selected because their filenames and paths actually identify stages of the 2014 puzzle rather than contemporary guesses about possible hidden destinations.

## Frozen test

The cross-platform Node 20 script `sims/archive_hash_preimage_scan.cjs` retrieves exactly these pinned paths from the frozen archive commit, enforces the declared archive file lengths, and logs SHA-256 of every retrieved raw input. The 22 inputs generated **40** byte candidates: raw bytes for each file, plus removal of one trailing LF where present or CRLF→LF on a file whose declared extension indicates text. No ad hoc encodings were added after seeing outcomes. The seven historically recorded onion hostnames generated **42** exact string candidates, six URL forms each: bare host, `http://host`, `http://host/`, `http://host/index.html`, `https://host/`, and `https://host/index.html`.

Each of those **82** candidate byte strings was evaluated under **SHA-512**, **SHA3-512**, and **BLAKE2b-512**, giving **246** direct comparisons with the LP2 target. The SHA-512 of the fixed `abc` positive control must match the published known digest before the run can proceed. Downloads, sizes, digest availability and the report write fail closed, avoiding incomplete runs masquerading as negative evidence. The report is emitted through an atomic, lock-protected file write. The workflow is manual `workflow_dispatch` only, never a per-commit workflow.

## Executed result

[Successful Windows GitHub Actions run 42762660445](https://github.com/FlareZ123/liber-primus/actions/runs/42762660445) finished 2026-11-10 at 05:32 UTC. The job printed **22 source fingerprints**, `blobVariants=40`, `urlVariants=42`, `hashEvaluations=246`, and `hits=0`. The complete JSON candidate ledger is retained in the run's artifact `archive-hash-scan-output` (artifact ID 13738128148). All 22 source lengths matched the frozen manifest.

**Bounded conclusion:** the target is not the SHA-512, SHA3-512, or BLAKE2b-512 digest of any tested archive input or URL form. That says nothing about a later undiscovered page, an independently derived key, pages unavailable in this archive, byte representations not included here, BLAKE-512/Keccak-512, or an unknown digest convention.

## Decision

This archival sweep is closed. Repeating the same 246 comparisons or expanding to arbitrary guessed hostnames is low value without new **historically evidenced** inputs. A further attempt should first obtain an independently sourced preimage candidate with credible connection to the intended continuation, and then attempt exact digest matching under a frozen rule. The immediate higher-value effort returns to cryptanalytic inversion and novel key-derivation mechanisms on original LP2 ciphertext.
