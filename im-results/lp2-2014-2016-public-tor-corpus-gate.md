# 2014–2016 public Tor-corpus gate for the LP2 p56 continuation

**Decision (updated 17 November 2026; Agent 8's earlier #1160/#828 review, plus Agent37's 2014 Ahmia primary-code gate #1322): NO QUALIFYING PUBLIC CORPUS FOUND.** The additional 2014 Owenson–Savage HSDir study and 2015 CARONTE response corpus were examined alongside the 2016 TorCrawl lead. The 2014 study has no located public per-service dump or URL/body index; CARONTE's ethics approval prohibited third-party disclosure and required deletion at publication. Public Tor Metrics exposes only aggregate counts. No candidate satisfies the combined original-byte, searchable-index, and positive-control requirements. No p56 candidate body, digest preimage, key, unknown LP2 plaintext, or destination was recovered.

## Acceptance test

A candidate must satisfy all four conditions at once:

1. A Tor/onion crawl with an independently dated collection in 2014–2016.
2. Downloadable original HTTP response bodies or WARC records, not merely extracted text, rendered DOM, screenshots, traffic traces, metadata, or page labels.
3. An independent searchable/index interface that can retrieve a record by a URL witness, link target, or exact response bytes.
4. A positive control demonstrating that the interface returns at least one dated original response with usable byte boundaries.

A paper reporting that a crawler fetched HTML is not evidence that its raw responses remain publicly available. Likewise, a public record or a dataset available only on request is not a presently accessible public corpus.

## 2014 Ahmia crawler: exact primary-code test for archived raw HTTP bytes (Agent37, 17 November)

Ahmia was a real, period-operating onion search engine, independent of the DUTA, TorCrawl, CARONTE and general-web archive collections above. Its founder's original [public 2014 Python/Scrapy repository](https://github.com/juhanurmi/ahmia/tree/7aaf852742bd6054865428dc665a7eb00b76d1b8) supplies an unusually decisive data-retention gate. The pinned **31 July 2014** commit predates later Ahmia rewrites and lies inside the LP2 historical target window.

- [Historical response parser](https://github.com/juhanurmi/ahmia/blob/7aaf852742bd6054865428dc665a7eb00b76d1b8/onionbot/dirbot/spiders/onionspider.py): Scrapy obtains `response.body` while crawling, immediately decodes it as Unicode, uses `html2text` with `ignore_links=True`, splits the result into words, and produces a `CrawledWebsiteItem` with extracted `title`, processed `text` and `url`. Raw HTML response bytes are **not placed in the item**.
- [Original item schema](https://github.com/juhanurmi/ahmia/blob/7aaf852742bd6054865428dc665a7eb00b76d1b8/onionbot/dirbot/items.py): only `domain`, `url`, `tor2web_url`, `title`, `text` and `date_inserted` are defined. No `body`, HTTP response-entity file offset, WARC record or entity checksum field exists.
- [Original persistence pipeline](https://github.com/juhanurmi/ahmia/blob/7aaf852742bd6054865428dc665a7eb00b76d1b8/onionbot/dirbot/pipelines.py): stores this derived item in local Apache Solr, using SHA-256 **of the URL as the record ID**, then deletes the prior record of that ID. The URL-ID SHA-256 is not a content digest or p56 candidate. The [historical OnionBot README](https://github.com/juhanurmi/ahmia/blob/7aaf852742bd6054865428dc665a7eb00b76d1b8/onionbot/README.md) also advertises only the derived fields and a local Solr service.
- The published repository's `backups/addresses` and `backups/sql` directories each contain only a wildcard `.gitignore`; the published tree has **no historical Solr export or raw-body WARC dataset**. The newer [Ahmia Elasticsearch index schema](https://github.com/ahmia/ahmia-index/blob/master/mappings_tor.json) likewise indexes parsed text/metadata, not byte-exact original HTTP entities, but does not prove what private storage Ahmia may have used.

**Decision for #1322:** the historically public 2014 Ahmia *code and published storage schema* definitively cannot themselves provide any authentic original response body to hash; no source-selected p56 target URL or SHA-512 preimage emerges. This does **not** show whether private raw traffic, a distinct unpublished WARC, or an original Solr data dump once existed. The current public code-only surface fails conditions 2–4 of the four-part acceptance test. Do not repeat indexed-word matching as a substitute for exact response bytes. A dated, openly accessible independent Ahmia raw-body/WARC deposit or first-party p56 URL witness would be a new premise.

## New historical lead: Australian-authorised 2016 TorCrawl

Dalins, Wilson and Carman's 2018 paper, *Criminal motivation on the dark web: A categorisation model for law enforcement* (DOI [10.1016/j.diin.2017.12.003](https://doi.org/10.1016/j.diin.2017.12.003)), describes a Tor crawl conducted from **12 April to 1 July 2016**. The abstract reports **232,792 pages from 7,651 Tor virtual domains**. The detailed results separately report **1,210,089 successful HTTP-200 GET requests from 1,313,714 attempts**, **1,155,549 unique URLs across 42,013 domains**, and **408,216 Tor URLs across 7,954 Tor virtual domains**. These are the paper's separately stated measures; this report does not reconcile them.

The paper says the authors had Australian-government permission for an unrestricted crawl and that files required to render pages were downloaded at access time. Monash's [institutional project page](https://www.monash.edu/it/research/social-good-projects/illuminating-criminal-activity-on-the-dark-web) independently confirms AFP permission and the research collaboration. The publisher article and institutional page document the study, but the public surfaces examined expose **no dataset download, raw-response/WARC archive, URL-level index, or content lookup service**. The paper's description of downloaded/rendered files also does not establish preservation of unmodified on-wire HTTP response entities.

The dataset is referred to as **TorCrawl** in later dataset literature, including a reported image-derived subset from 2,419 documents. That does not establish public access to the original crawl or its HTTP response bodies. Because the collection was law-enforcement-authorised and may contain highly sensitive material, no bulk-access request or contact was made. Any future custody inquiry must be separately owner-authorised and metadata-only.

**Disposition:** genuine, distinct historical crawl; **fails public-access and byte-fidelity gates**. Do not count it as a qualifying source.

## 2014 Owenson–Savage HSDir study: historical descriptor capture, no public index

The 2015 CIGI report says the authors operated **40 relays for six months**, recording published hidden-service descriptors and request counts at each relay. A separate crawler fetched **textual page content for one month near the end** and stored parsed data in a database. The study reported approximately **80,000 unique services**. Gareth Owen presented the completed study at 31C3 on **30 December 2014**; the accessible sources do not pin exact collection start/end dates. This is a genuinely distinct historical source, but the public publication and University of Portsmouth research surfaces expose no per-service descriptor dump, URL-level index, raw HTTP/WARC archive, or body lookup interface. The Portsmouth record for the 2016 journal article notes that the post-print is unavailable. Tor Project's public metrics specification only documents the `hidserv-dir-onions-seen` **count** reported in relay extra-info descriptors and its aggregation; it does not expose the onion identities or page bodies behind those counts. The report does not establish byte-exact response-body retention. This lead therefore fails the public-access, index, and byte-fidelity gates.

## 2015 CARONTE study: response corpus was not a public research archive

The CARONTE paper documents storing both requests and responses from its exploration of 1,974 live HTTP/HTTPS hidden services, restricted to textual and HTML responses. Its ethics section states that the institution's review board required the sensitive data to be protected, **not disclosed to third parties**, and **deleted when the paper was accepted for publication**. The paper does not identify a public dataset or query endpoint. This is not an available public archive and must not be pursued as one.

## Other dated candidates screened

| Candidate | What is publicly established | Why it does not qualify |
|---|---|---|
| **Ahmia 2014 historical crawler** | [31 July 2014 archived implementation](https://github.com/juhanurmi/ahmia/tree/7aaf852742bd6054865428dc665a7eb00b76d1b8) maps downloaded HTML to extracted title/text/URL Solr fields. Published backups contain only ignored placeholders. | The public code and schema retain no original HTTP body bytes or WARC; no public raw-body dataset or exact URL-backed positive control identified in the examined repository. |
| **DUTA / DUTA-10K (2016–17)** | The 2017 paper calls DUTA publicly available but its footnote says the dataset is available **upon request to the first author**. The collection description says HTML pages were concatenated into one HTML file per onion domain. | Not an immediately downloadable raw-response/WARC archive; no independent raw-body lookup interface. |
| **Silkkitie / Valhalla (2014–15)** | [Public Zenodo dataset](https://zenodo.org/records/8385260) contains daily JSON seller/product information and a few screenshots. | A single marketplace's structured product-page data, not a crawl of original HTTP response bodies or WARC. |
| **Dark Net Operation (2014–16)** | [Public Zenodo record](https://zenodo.org/records/12538602) describes structured posts from one investigated Tor forum. | Structured forum records, not a general Tor crawl or raw HTTP/WARC; no qualifying response-byte lookup. No dataset contents were downloaded or inspected. |
| **EURECOM / Deusto May–June 2016** | *The Onions Have Eyes* documents three 2016 crawls and a PhantomJS-based collection mode that saved HTML, headers, scripts, redirects and links. | Public paper/dissertation material only; no qualifying public raw-response deposit was located. Delayed browser HTML and JSBeautifier processing do not prove original response-entity fidelity. See [the existing source-specific review](2016-onions-have-eyes-crawl-p56-raw-body-acquisition.md). |
| **Owenson–Savage 2014 HSDir study / 2015 report** | Forty relays recorded published descriptors and request counts over six months; a one-month text-only crawl stored page data; approximately 80,000 unique services were observed. The completed study was presented at 31C3 on 30 December 2014. | No public per-service dump, URL/body index, or raw-response archive was located; exact collection dates and original body-byte fidelity are not established. Public Tor Metrics exposes only aggregate counts. |
| **CARONTE 2015** | The paper reports 1,974 live HTTP/HTTPS services and an internal database of textual/HTML requests and responses. | The ethics board required that the sensitive data not be disclosed to third parties and be deleted at paper acceptance; no public dataset or index is identified. |
| **Tor Metrics / CollecTor** | Public relay extra-info records include the `hidserv-dir-onions-seen` statistic, documented by the Tor Project. | This is an aggregate count of onion addresses observed by a relay, not the underlying identities, URLs, or page bodies; it cannot serve as a target index. |
| **TNO 2013 / Moore–Rid 2015** | Their separate custody and public-availability decisions are already documented in [the 2013–2015 custody report](lp2-2013-2015-tor-custody-scope.md). | No public per-host raw-response archive and searchable original-byte interface was established there. Do not repeat those searches. |
| **Common Crawl / Arquivo.pt / Archive Team** | Existing reports document their public archive formats, source-specific controls and target queries. | These are already audited general-web/archive lanes, not a newly discovered Tor-specific 2014–16 corpus. Do not rerun the same scans. |

## Decision and next action

The 17 November primary-code extension confirms that the publicly available 2014 Ahmia crawler surface is an extracted-text index, even though its live crawler necessarily received HTML; the pinned period implementation and published repository do not include response bytes suitable for the p56 hash. The bounded review found **zero** candidates satisfying the complete conjunction of period, Tor/onion crawl, public raw HTTP/WARC access, independent content lookup, and a byte-valid positive control. The 2014 Owenson–Savage capture is historically relevant but has no located public per-service index; CARONTE's data were subject to a no-disclosure/deletion requirement; Tor Metrics is aggregate-only; and the 2016 Australian TorCrawl still has no public raw-response/index surface. DUTA, Silkkitie and the Dark Net Operation dataset are public or request-accessible in narrower derived forms, not qualifying original-response corpora.

No digest sweep was run: without a source-selected target response and byte framing, testing more digest families or guessed serializations would have no causal path to the p56 preimage. No onion host enumeration, recrawl, dataset download, or external custodian contact was performed. In particular, no CARONTE data were requested or accessed, and no private Owenson–Savage records were sought.

Reopen this public-source lane only if a genuinely new 2014–2016 Tor/onion raw-response or WARC deposit appears with a usable content/URL index and an independently dated byte-level positive control. A private custodian route is a separate, owner-authorised decision and must not be misreported as public availability.

## Sources

- Dalins, Wilson & Carman, [*Criminal motivation on the dark web*](https://www.sciencedirect.com/science/article/pii/S174228761730333X), 2018; crawl dates and detailed request counts.
- Monash University, [*Illuminating criminal activity on the dark web*](https://www.monash.edu/it/research/social-good-projects/illuminating-criminal-activity-on-the-dark-web), confirming AFP-authorised research collaboration.
- Al Nabki et al., [*Classifying Illegal Activities on Tor Network Based on Web Textual Contents*](https://aclanthology.org/E17-1004/), 2017; DUTA availability-on-request footnote.
- [Silkkitie / Valhalla 2014–2015 Zenodo record](https://zenodo.org/records/8385260).
- [Dark Net Operation Dataset Zenodo record](https://zenodo.org/records/12538602).
- Sánchez-Rola, Balzarotti & Santos, [*The Onions Have Eyes*](https://doi.org/10.1145/3038912.3052657), 2017; see the existing EURECOM public-deposit review linked above.
- Owenson & Savage, [*The Tor Dark Net*](https://researchportal.port.ac.uk/files/19636608/The_tor_dark_net.pdf), 2015, pp. 3–5; [31C3 presentation](https://media.ccc.de/v/31c3_-_6112_-_en_-_saal_2_-_201412301715_-_tor_hidden_services_and_deanonymisation_-_dr_gareth_owen); [University of Portsmouth publication record](https://researchportal.port.ac.uk/en/publications/empirical-analysis-of-tor-hidden-services/).
- Tor Project, [reproducible metrics specification](https://metrics.torproject.org/reproducible-metrics.html), § Onion Services.
- Matic, Kotzias & Caballero, [*CARONTE: Detecting Location Leaks for Deanonymizing Tor Hidden Services*](https://software.imdea.org/~juanca/papers/caronte_ccs15.pdf), §§3.2 and 6 (response storage and ethics requirements).
