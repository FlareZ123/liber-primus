# Stage11 original-response recovery: non-Wayback archive census

**Decision (12 November 2026, Agent29, Director #408):** No new original Stage11 HTTP response body, extra page, 59.txt, key, decoder, or unknown LP2 plaintext was recovered. One independent archive's exact literal onion-host search returned no indexed captures. Four gateway variants and Archive.today were inaccessible, so their coverage is **inconclusive**, not negative. This is a finite source census rather than evidence that the historical response did not exist.

## Historical evidence and decisive source question

The signed May 2014 Cicada release led to the Stage11 onion host ky2khlqdf7qdznac.onion. The preserved 2014 HTML source has exactly 58 image links, 0.jpg through 57.jpg, and no further instruction. A separate unsigned participant README mentions 59.txt, but its original bytes have not been recovered. Previous Wayback and 21-fork searches are recorded in [the source ledger](archive-hash-preimage.md) and [the Stage11 index envelope](lp2-stage11-original-release-index-envelope.md). This independent test asks whether any different historical archival service retained a genuine HTTP response body.

## Frozen experiment

At original source host scope, query Arquivo.pt's documented CDX endpoint with host-prefix URL patterns and 2014–2018 inclusive date bounds, limiting results to 200 per host. Query the literal onion hostname plus the four fixed proxy variants: onion.to, tor2web.org, onion.link, and onion.city. Try a separate Archive.today listing for those same five. Historical www.sapo.pt and example.com are positive controls. Preserve original requested URLs, statuses, body lengths, SHA-256s, indexed records, replayed HTML response hashes and errors; request a replay only when a 200 HTML/text CDX record exists. The experiment does not guess novel onion labels, URL paths, keys, or hashes.

## Observed results

[Manual GitHub Actions run 43129254830](https://github.com/FlareZ123/liber-primus/actions/runs/43129254830) completed successfully and uploaded artifact 13904482254, a 10,030-byte ZIP containing the exact JSON result. The workflow's success means the script completed, not that archive targets responded.

| Test | Observed result | Decision |
| --- | --- | --- |
| Arquivo.pt historical www.sapo.pt positive control | HTTP 200; 200 control index records at preset cap. First 2014-era HTML replay HTTP 200, 368,981 bytes, SHA-256 b1f9791abc46916f55a96e59e1ad840befb60eb1c015756aee0e13175744a831 | Archive index and one real historical replay worked |
| Arquivo.pt literal ky2khlqdf7qdznac.onion/*, years 2014–2018 | HTTP 200 and zero index records, empty response body | Bounded exact-host negative |
| Arquivo.pt four gateway prefixes | Four TypeError fetch failures, no HTTP response | Inconclusive, not coverage |
| Archive.today example.com control and five host listings | Six TypeError fetch failures, no HTTP response | Inconclusive, not coverage |

The exact query URLs, response hashes and error strings remain in the run artifact. Reusable code: [frozen archive census](../sims/onion7_nonwayback_archive_probe.cjs), [manually dispatched workflow](../.github/workflows/onion7-nonwayback-archives-manual.yml). The method and endpoints are independently inspectable.

## Cryptanalytic consequence

No authenticated new response identifies a key, operation, target page, or plaintext. The controlled Arquivo.pt null narrows one source-recovery route, while the four proxy endpoint failures and Archive.today failures preserve open archival possibilities. Future recovery effort should require a genuinely new archived endpoint, a byte-preserving participant capture, or a new named service object rather than repeat guessed preimages and already-inspected mirrors.
