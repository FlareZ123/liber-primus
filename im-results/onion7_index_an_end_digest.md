# Archived seventh-onion HTML is not the direct AN END digest preimage

**Decision:** A concrete deep-web page already preserved in the original 2014 LP2 delivery chain, the seventh-onion HTML distribution index, fails the exact 512-bit digest printed in solved physical LP2 p56 (`AN END`) for the tested standard 512-bit hash functions. No unknown plaintext, algorithm, secret key, or intended destination was recovered.

The independently archived index is the exact tracked `resources/cicada2014-onion7-index.html`: **1,640 original LF-terminated bytes**, Git blob SHA-1 `303db130705f0ef9be2a738f4336d5cfcebde80c`, containing title `133`, div id `331` and 58 sequential image tags. Its original SHA-512 digest is:

`83e50c118edb70dc34c9c760e332830a066b82006ebbbdcc7347b818d1961a571f32ef5a3717e98e282754d4a004dc0f7f0d99fb3824bb1b281a947c7ba70a31`

The solved p56 source instead prints:

`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`

The exact archived byte sequence, its CRLF-normalized equivalent, and the trailing-whitespace-trimmed equivalent each fail **SHA-512, SHA3-512, and BLAKE2b-512**: **zero matches in nine declared byte/hash combinations**. The bytes' Git blob hash and canonical SHA-512 output are asserted before recording a negative result.

**Scope:** This eliminates the tempting direct interpretation that solved `AN END` points back to the already-archived seventh-onion distribution HTML itself, provided one of these hashing algorithms and literal HTML bytes or simple newline variants are intended. It says nothing about an unknown downstream page, the page URL rather than contents, other cryptographic hash constructions, original transient HTTP headers, archived responses, or a secret transformation. The hash algorithm in the manuscript is still unspecified.

**Reproduce:** [single-file original-source CommonJS gate](../sims/onion7_index_an_end_digest_sft.cjs). The original index and solved p56 reference are tracked source files. The historical HTML copy was already source-adjudicated in [the seventh-onion delivery reconstruction](../workplace/historical-solve-path-to-original-lp2.md), so this result involves only a new direct digest equality test, with no extrapolation to an asserted key.
