# 2014–2016 public Tor-corpus gate for the LP2 p56 continuation

**Decision (14 November 2026; Agent 8, issue #828): NO QUALIFYING PUBLIC CORPUS FOUND.** A new, historically distinct Australian 2016 Tor crawl was identified, but the public record exposes no downloadable raw HTTP/WARC archive or independent content/URL lookup interface. It is a possible private-custody lead, not a public corpus. No p56 candidate body, digest preimage, key, unknown LP2 plaintext, or destination was recovered.

## Acceptance test

A candidate must satisfy all four conditions at once:

1. A Tor/onion crawl with an independently dated collection in 2014–2016.
2. Downloadable original HTTP response bodies or WARC records, not merely extracted text, rendered DOM, screenshots, traffic traces, metadata, or page labels.
3. An independent searchable/index interface that can retrieve a record by a URL witness, link target, or exact response bytes.
4. A positive control demonstrating that the interface returns at least one dated original response with usable byte boundaries.

A paper reporting that a crawler fetched HTML is not evidence that its raw responses remain publicly available. Likewise, a public record or a dataset available only on request is not a presently accessible public corpus.

## New historical lead: Australian-authorised 2016 TorCrawl

Dalins, Wilson and Carman's 2018 paper, *Criminal motivation on the dark web: A categorisation model for law enforcement* (DOI [10.1016/j.diin.2017.12.003](https://doi.org/10.1016/j.diin.2017.12.003)), describes a Tor crawl conducted from **12 April to 1 July 2016**. The abstract reports **232,792 pages from 7,651 Tor virtual domains**. The detailed results separately report **1,210,089 successful HTTP-200 GET requests from 1,313,714 attempts**, **1,155,549 unique URLs across 42,013 domains**, and **408,216 Tor URLs across 7,954 Tor virtual domains**. These are the paper's separately stated measures; this report does not reconcile them.

The paper says the authors had Australian-government permission for an unrestricted crawl and that files required to render pages were downloaded at access time. Monash's [institutional project page](https://www.monash.edu/it/research/social-good-projects/illuminating-criminal-activity-on-the-dark-web) independently confirms AFP permission and the research collaboration. The publisher article and institutional page document the study, but the public surfaces examined expose **no dataset download, raw-response/WARC archive, URL-level index, or content lookup service**. The paper's description of downloaded/rendered files also does not establish preservation of unmodified on-wire HTTP response entities.

The dataset is referred to as **TorCrawl** in later dataset literature, including a reported image-derived subset from 2,419 documents. That does not establish public access to the original crawl or its HTTP response bodies. Because the collection was law-enforcement-authorised and may contain highly sensitive material, no bulk-access request or contact was made. Any future custody inquiry must be separately owner-authorised and metadata-only.

**Disposition:** genuine, distinct historical crawl; **fails public-access and byte-fidelity gates**. Do not count it as a qualifying source.

## Other dated candidates screened

| Candidate | What is publicly established | Why it does not qualify |
|---|---|---|
| **DUTA / DUTA-10K (2016–17)** | The 2017 paper calls DUTA publicly available but its footnote says the dataset is available **upon request to the first author**. The collection description says HTML pages were concatenated into one HTML file per onion domain. | Not an immediately downloadable raw-response/WARC archive; no independent raw-body lookup interface. |
| **Silkkitie / Valhalla (2014–15)** | [Public Zenodo dataset](https://zenodo.org/records/8385260) contains daily JSON seller/product information and a few screenshots. | A single marketplace's structured product-page data, not a crawl of original HTTP response bodies or WARC. |
| **Dark Net Operation (2014–16)** | [Public Zenodo record](https://zenodo.org/records/12538602) describes structured posts from one investigated Tor forum. | Structured forum records, not a general Tor crawl or raw HTTP/WARC; no qualifying response-byte lookup. No dataset contents were downloaded or inspected. |
| **EURECOM / Deusto May–June 2016** | *The Onions Have Eyes* documents three 2016 crawls and a PhantomJS-based collection mode that saved HTML, headers, scripts, redirects and links. | Public paper/dissertation material only; no qualifying public raw-response deposit was located. Delayed browser HTML and JSBeautifier processing do not prove original response-entity fidelity. See [the existing source-specific review](2016-onions-have-eyes-crawl-p56-raw-body-acquisition.md). |
| **TNO 2013 / Portsmouth 2014 / Moore–Rid 2015** | Their separate custody and public-availability decisions are already documented in [the 2013–2015 custody report](lp2-2013-2015-tor-custody-scope.md). | No public per-host raw-response archive and searchable original-byte interface was established there. Do not repeat those searches. |
| **Common Crawl / Arquivo.pt / Archive Team** | Existing reports document their public archive formats, source-specific controls and target queries. | These are already audited general-web/archive lanes, not a newly discovered Tor-specific 2014–16 corpus. Do not rerun the same scans. |

## Decision and next action

The bounded review found **zero** candidates satisfying the complete conjunction of period, Tor/onion crawl, public raw HTTP/WARC access, independent content lookup, and a byte-valid positive control. The 2016 Australian TorCrawl is a new source pointer but does not change that decision. DUTA, Silkkitie and the Dark Net Operation dataset are public or request-accessible in narrower derived forms, not qualifying original-response corpora.

No digest sweep was run: without a source-selected target response and byte framing, testing more digest families or guessed serializations would have no causal path to the p56 preimage. No onion host enumeration, recrawl, dataset download, or external custodian contact was performed.

Reopen this public-source lane only if a genuinely new 2014–2016 Tor/onion raw-response or WARC deposit appears with a usable content/URL index and an independently dated byte-level positive control. A private custodian route is a separate, owner-authorised decision and must not be misreported as public availability.

## Sources

- Dalins, Wilson & Carman, [*Criminal motivation on the dark web*](https://www.sciencedirect.com/science/article/pii/S174228761730333X), 2018; crawl dates and detailed request counts.
- Monash University, [*Illuminating criminal activity on the dark web*](https://www.monash.edu/it/research/social-good-projects/illuminating-criminal-activity-on-the-dark-web), confirming AFP-authorised research collaboration.
- Al Nabki et al., [*Classifying Illegal Activities on Tor Network Based on Web Textual Contents*](https://aclanthology.org/E17-1004/), 2017; DUTA availability-on-request footnote.
- [Silkkitie / Valhalla 2014–2015 Zenodo record](https://zenodo.org/records/8385260).
- [Dark Net Operation Dataset Zenodo record](https://zenodo.org/records/12538602).
- Sánchez-Rola, Balzarotti & Santos, [*The Onions Have Eyes*](https://doi.org/10.1145/3038912.3052657), 2017; see the existing EURECOM public-deposit review linked above.
