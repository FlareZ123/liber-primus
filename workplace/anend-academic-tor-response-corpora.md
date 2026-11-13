# AN END: original-response academic Tor crawls as a possible preimage source

**Agent 50, 13 November 2026. Class:** independent, source-identified historical acquisition lead. **No p56 preimage, new LP2 plaintext, cipher key, or destination was recovered.** The aim is to recover missing contemporaneous bytes, not to expand a speculative key search.

## Why this is a distinct route

Solved LP2 p56 asks for a deep-web page whose digest equals the printed 128-hex target. The [present archive/preimage synthesis](../im-results/archive-hash-preimage.md) already covers the surviving 2014 Cicada archives, historical Tor2web CDX, the 21 original-stage archive forks, and known archive/corpus attempts. Those attempts cannot exclude the retained, institution-held response databases of independent Tor measurement projects. The critical discriminator is **a saved raw HTTP response body from May 2014 or later**, plus a trustworthy original URL and timestamp. A textual scrape or screenshot may identify a page but cannot certify a digest preimage without recovering the canonical original bytes.

The original p56 digest is `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`. Its 128 hex characters do **not** independently establish the digest algorithm.

### Priority 1: 2015 CARONTE database, explicitly stored response bodies

Matic, Kotzias and Caballero, [*CARONTE: Detecting Location Leaks for Deanonymizing Tor Hidden Services*](https://www.freehaven.net/anonbib/cache/caronte-ccs2015.pdf), CCS 2015, describe collecting **31,849 onion URLs** from **6,426 onion domains**. The test reported **4,794 URL responses** (4,617 HTTP, 177 HTTPS) from **1,974 live services** over four approximately three-day exploration rounds. Sections 3.2 and 3.4 say that their system saves requests and responses in a central database, compares response-body hashes to find duplicate pages, and builds a generic-content blacklist by **hashing the body of every page in that database**. This establishes a design that preserved per-page HTTP response information at analysis time, stronger for a hash-preimage search than a collection of only stripped article text.

The paper does not establish that those database bytes survive today, that the paper's body-hash function matches p56, or that the unknown p56 target was ever on one of the discovered services. The crawl's exact dates and its URL list must be acquired before a historical positive can be claimed. **Decision gate:** obtain an attributable database snapshot or the authors' answer to two narrowly scoped questions: (i) do original response-body bytes, URLs and timestamps remain accessible, and (ii) does the index contain any original Cicada host, especially `ky2khlqdf7qdznac.onion`? If yes, inspect these known hosts first and only then perform an authorized exact digest sweep across original stored bodies with each algorithm distinguished. A matching raw body would provide the needed authentic preimage candidate, contingent on independent digest verification and Cicada relevance.

Primary source: https://www.freehaven.net/anonbib/cache/caronte-ccs2015.pdf ; [authors' institutional publication page](https://software.imdea.org/research/publications/2015/).

### Priority 2: January to March 2015 Moore/Rid text-page crawl

Daniel Moore and Thomas Rid, [*Cryptopolitik and the Darknet*](https://www.tandfonline.com/doi/full/10.1080/00396338.2016.1142085), *Survival* 58(1), published February 2016, report an onion-site crawler run **January–March 2015**. Their initial **5,615 onion-address seeds** came from the public onion.city and ahmia.fi indexes. The crawler followed up to **five links deep** and sampled up to **100 text pages per host**, recording approximately **205,000 unique pages** from roughly **300,000 URLs**. Because this crawl took place after the May 2014 LP2 distribution, its source dates are relevant. The article reports collecting **textual content**, with other formats filtered out, so source-byte preservation cannot be presumed.

**Decision gate:** establish whether its database retained per-page original HTML response bytes with URL/timestamps, or a stable exact host-path index. If only classified/plain text survives, use it for a potential Cicada-specific original clue or URL, never as an authenticated 512-bit preimage. No public release of the raw corpus was verified in this pass.

Source: https://www.tandfonline.com/doi/full/10.1080/00396338.2016.1142085 ; [author's source landing page](https://ridt.co/cryptopolitik/).

### Priority 3: 2016–2017 later web-crawl survivors

Al Nabki and colleagues' [DUTA report](https://www.forensicfocus.com/articles/classifying-illegal-activities-on-tor-network-based-on-web-textual-contents/) states that the crawler harvested HTML from May–July 2016, from **7,931** reachable hidden services, with **6,831** samples labeled. Each hidden service's retrieved pages were **concatenated into a single HTML record**, which is unsuitable for byte-exact individual-page hash matching without separate original captures. The 2017 [Sánchez-Rola, Balzarotti and Santos study](https://www.eurecom.fr/en/publication/5152) reports independently crawling **1.5 million URLs** across **7,257 onion domains**; its page corpus might preserve a historical pointer if the original destination remained online. Both need archive-availability and original-byte checks before work on decryption. Later crawls are in any case less likely than 2015 to preserve a short-lived original 2014 page.

## Failed Common Crawl control, not a no-record finding

To resolve an earlier endpoint failure in the existing [Common Crawl probe](../sims/anend_commoncrawl_probe.cjs), Agent 50 retriggered the repository's unmodified [historical index workflow](../.github/workflows/anend-commoncrawl-probe.yml). [Run 43441085041](https://github.com/FlareZ123/liber-primus/actions/runs/43441085041), 13 November 2026 14:15:56 UTC, ended with its JSON artifact `an-end-commoncrawl-cdx` (artifact ID **14044628905**, ZIP SHA-256 `052718e3badd11bdd1f5c48913968ca8278ba6465835c103d3023c0e4e1d4887`). The controls were **HTTP 404** for `example.com/*` on `CC-MAIN-2014-23`, and **HTTP 504** for the same control on `CC-MAIN-2015-22`; zero target host patterns were submitted. Therefore the run made **no claim whatsoever** about whether Common Crawl indexed any Cicada page. Further identical reruns offer little value without a working index endpoint/control.

## Best next decision

Test the **CARONTE raw-body availability** before branching into broad research. It has a documented original-response storage operation and a publication near the relevant 2014 date. If CARONTE data are inaccessible, ask the Moore/Rid team only for preserved URL and body availability; if later-crawl bodies alone exist, query known Cicada hostnames and hash all accessible legal text bodies without interpreting unrelated sensitive content. A negative over any one bounded archive would leave other potential sites open. No new ciphertext decoder or unknown plaintext follows from these source findings.

References to surviving community mirrors and their limitations: [existing archive/preimage synthesis](../im-results/archive-hash-preimage.md), [authoritative overall research synthesis](../results/README.md).
