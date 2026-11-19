# External five-page LP2 solve claim: public-source recovery gate

**Decision (19 November 2026): unsubstantiated on the accessible public record; not disproved.** The indexed Reddit post makes several concrete claims, but the linked GitLab Pages site, its mirror, the natural corresponding project path, and targeted archive endpoints could not be retrieved. No external source bytes, project history, proof files, claimed plaintext, or reproducible original-cipher implementation were recovered. The already completed p32 determinant check remains a mathematical check, not a decryption.

## Public claim and chronology

The source is the [Reddit post](https://www.reddit.com/r/mystery/comments/1x0432x/proof_5_new_liber_primus_pages_solved/), titled “[PROOF] 5 new Liber Primus pages solved mathematically. The community's base-60 transcriptions have 10 fatal errors.” The indexed post date is **7 October 2026**. The **17 November 2026** date visible at the bottom of the indexed text belongs to a later comment (“Quick note what if some clues are in the picture”), not the post's creation date.

The accessible post text claims:
- ten case-sensitive base-60 transcription errors, exemplified by `3I` versus `3i`, each changing a token value by 26;
- pages 49–51 (physical scans 66–68) form a 256-byte / 2048-bit RSA block;
- “Page 71 (56.jpg)” uses a prime-totient stream `P_n = (C_n - φ(p_n)) mod 29` with a “Skip-F” rule when `P=0`;
- 11 is a primitive root modulo 29 and the Fibonacci/Pisano period modulo 29 is 14;
- “page 47 (32.jpg)” reshaped as an 11×11 matrix has determinant 8 and a calculated inverse;
- Zig 0.15.0 source, formal proofs, binary hashes and interactive verifiers are hosted on the linked project.

The post links the [primary GitLab Pages site](https://21skibidiserb37.gitlab.io/xyzsolving333/) and [mirror](https://21skibidiserb37-gitlab-io-e46f79.gitlab.io/). The conventional GitLab project path implied by a namespace/project Pages URL is [gitlab.com/21skibidiserb37/xyzsolving333](https://gitlab.com/21skibidiserb37/xyzsolving333/) (see [GitLab Pages URL documentation](https://docs.gitlab.com/user/project/pages/getting_started_part_one/)).

## Exact recovery boundary

Targeted retrieval attempts covered:
1. the primary Pages URL and the mirror;
2. the corresponding GitLab project page, its main-tree URL and a raw README URL;
3. GitLab API user/project lookups for the named namespace/project;
4. Wayback CDX queries for both exact Pages hostnames;
5. the Common Crawl `CC-MAIN-2026-46` index for the exact primary Pages URL; and
6. web searches for the exact project name, username and archive references.

The web fetcher returned “URL is not accessible” or “Cache miss” for the Pages, GitLab project/API and archive endpoints; exact-name searches returned no indexed project or archive result. A local direct retrieval attempt failed at DNS resolution (“Temporary failure in name resolution”). The connected-browser read tool was unavailable because no originating browser context was present.

**No** raw HTML, GitLab project metadata, repository tree, commit ID, source archive, Zig source, binary, proof, download, archive capture, SHA-256 digest or claimed plaintext bytes were obtained. These failures establish an access boundary only: they do **not** prove that the site/project never existed, is deleted, or has no archive copy.

The accessible Reddit text itself supplies no rune-by-rune plaintext for five unknown pages, no exact coordinates for the ten alleged table corrections, no page/rune offsets, no complete key/state/clock specification, no executable source, no forward re-encryption, and no untouched holdout. It says proof files are available elsewhere but does not include their contents or hashes.

## What can actually be evaluated

### p32 matrix

The repository's canonical p32 is physical JPEG `49.jpg`, with 121 runes and original line lengths `[25,23,23,21,22,7]`. Reflowing its 121 GP29 ordinal indices row-major into 11×11 does give determinant **8 modulo 29**. Replacing ordinal indices with GP29 prime values modulo 29 gives determinant **21**. The exact inverse of the ordinal matrix multiplies back to the identity, but its 121-entry rune rendering is not coherent plaintext and no source instruction selects this reshape or supplies a separate right-hand-side/decryption operation.

For a uniformly random 11×11 matrix over GF(29), the probability of being nonsingular is **0.9643282295491619**. Thus determinant 8 / invertibility is expected behavior, not evidence of a solved page. Reproduction is already preserved in [the original-source CommonJS SFT](../sims/lp2_20261117_external_p32_inverse_claim_sft.cjs) and [Windows run 44241583861](https://github.com/FlareZ123/liber-primus/actions/runs/44241583861); this test was not repeated.

### Other mathematical statements

The order-28 primitive-root property of 11 modulo 29 and the 14-step Fibonacci period modulo 29 are true arithmetic facts. The post supplies no independently selected connection from either fact to an LP2 key, state update, page receiver or reversible unknown-page operation.

The stated prime-totient/Skip-F formula is not accompanied in the accessible text by its exact source page mapping, original rune offsets, initialization/reset details, resulting rune stream or forward reconstruction. If “56.jpg” denotes canonical LP2 p56, that page is already a known solved control; it is not one of the 56 unknown pages. If a different numbering is intended, the missing source bytes and mapping prevent adjudication.

The ten claimed base-60 corrections cannot be tested without their exact cell coordinates and the byte-exact original `sexagesimal.bin` (or an independently authenticated equivalent). The post gives one illustrative token pair but no list of ten positions or source artifact.

## Decision and reopening condition

Close this bounded acquisition task as **unsubstantiated on the available public record**. Do not call the claim false, do not infer that the site never existed, and do not begin substitute cipher searches. Reopen only if the exact Pages/project source, an archived byte-preserved copy, or the claimed proof/code artifacts become retrievable. Any positive must identify exact original LP2 pages and rune offsets, supply the full source-selected reversible operation and key/state, reproduce each claimed correction at its original cell, recover contiguous unknown plaintext, and forward-reencrypt an untouched original span.
