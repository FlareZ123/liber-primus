# Ahmia: recovered May–June 2014 directory fixture and scoped Cicada coverage decision

**Agent 28 · 13 November 2026. Status: contemporary public source recovered; original-p56 continuation still unidentified.** A date-pinned Ahmia directory fixture survives in the original maintainer's Git history, supplying original-era onion URL and description metadata from after the Liber Primus release. It contains no identified Cicada continuation URL, preserved HTTP response body, original plaintext or key.

## First-hand preserved source

The original Ahmia maintainer Juha Nurmi committed a full Django JSON database fixture on **10 June 2014 at 10:18:29 UTC**, commit [7db4e805c072ff3e133aaab174815aaa1abb86d6](https://github.com/juhanurmi/ahmia/commit/7db4e805c072ff3e133aaab174815aaa1abb86d6). The exact original [ahmia/fixtures/initial_data.json](https://github.com/juhanurmi/ahmia/blob/7db4e805c072ff3e133aaab174815aaa1abb86d6/ahmia/fixtures/initial_data.json) is **2,759,554 bytes**, Git blob SHA-1 **08102c19f74df5d47771dfae8f85ddd8b8b7173d**. The file disappeared from the current default branch after [removal on 25 February 2015](https://github.com/juhanurmi/ahmia/commit/d26cbdd40f0e469b2aa3851c6ebfd0299c034d8d). Inspect the immutable **June 2014 commit**, rather than attempting to retrieve it from the current master.

The complete 7,136-record original fixture parses as:

| Model | Count | Original-era contents |
| --- | ---: | --- |
| ahmia.hiddenwebsite | **1,410** | URL, 16-character v2 host, online flag and observed/updated dates |
| ahmia.hiddenwebsitedescription | **4,234** | Host-linked title, description and topic labels |
| ahmia.hiddenwebsitepopularity | **1,391** | Original clicks and public backlink counts, without target links |
| Other administrative/session/site records | **101** | Framework objects unrelated to cipher text |

The fixture's `md5` field hashes the **onion hostname**, not a 2014 HTTP entity body: the author’s [June 2014 `ahmia/models.py`](https://github.com/juhanurmi/ahmia/blob/7db4e805c072ff3e133aaab174815aaa1abb86d6/ahmia/models.py) documents `hashlib.md5(url[8:-1])`; applying MD5 to the positive-control literal `3g2upl4pq6kufc4m.onion` yields `08194edddf09feeb6cc1d435d32a424a`, exactly its stored `md5` field. The 1,410 MD5 strings cannot be treated as preserved webpage hashes or clues to the original p56 128-hex content digest.

Every one of the 1,410 host keys has description records. Among 4,234 descriptions, **3,582 titles are nonempty** and **894 distinct nonempty title strings** occur. Original ahmia.hiddenwebsite records have updated dates between **17 May and 10 June 2014**; their seenOnline fields range between **17 May 2014 20:09:58** and **8 June 2014 08:53:10**. The description model includes older records beginning 2013. These are dated **database observations**, not authenticated raw HTTP entity response capture times. A known contemporaneous positive coverage control is DuckDuckGo v2 onion **3g2upl4pq6kufc4m.onion**, seenOnline on **4 June 2014 at 20:06:53**.

### Exact historical-LP2 queries

A complete case-insensitive scan of the fixture produced **zero matches** for all seven known Cicada onion v2 host strings: auqgnxjtvdbll3pv, cu343l33nqaekrnw, fv7lyucmeozzd5j4, avowyfgl5lkzfj3n, q4utgdi2n4m4uim5, ut3qtzbrvs7dtvzp, and the 2014 LP2 distributor **ky2khlqdf7qdznac**. Additional exact queries for previously discussed eq6emgv2ehsrix6t, **cicada**, **liber primus**, and the printed p56 digest prefix **36367763ab73783c** all returned zero. The substring **3301** occurs once, solely inside the unrelated numeric database primary key **153301**, never in a source description/title/host. There is **no source-selected Cicada host or continuation instruction** in this public fixture.

This is a **scoped negative for 1,410 original-era index entries** with a positive non-Cicada coverage control. The unknown p56 target may have used a different hostname and Ahmia's live production Solr index could have covered services absent from this preserved test fixture. The source has no original HTTP response bytes on which to test a 128-hex content digest.

### Second original-period address list

The same repository contains [ahmia/tests/example_addresses.html](https://github.com/juhanurmi/ahmia/blob/2ac6896159dedb07db3c463bd43e5aa09093c777/ahmia/tests/example_addresses.html) under its **25 July 2014** commit [2ac6896159dedb07db3c463bd43e5aa09093c777](https://github.com/juhanurmi/ahmia/commit/2ac6896159dedb07db3c463bd43e5aa09093c777). Source tree Git blob SHA-1 **548f8970a89ae780eb504852993261c655a9cb31**, original size **1,142,829 bytes**. It contains **1,336 distinct 16-character onion host strings**; **1,331** also occur in the June JSON, while five are unique to this test page. None of the known Cicada host names, **cicada**, **3301**, or **primus** occur in the HTML. The June 10 and June 27 committed versions already contain those same 1,336 host identities. A July code commit therefore does **not** imply July-dated service observations. When checking byte identity, consult the pinned Git blobs because text-projected API views can normalize original HTML bytes.

The older [ahmia/static/visuals/oniondomains.xml](https://github.com/juhanurmi/ahmia/blob/8d8382d5a4a5214824ca8b8174461baab7912b50/ahmia/static/visuals/oniondomains.xml) dates to **13 March 2014**, was separately scanned by Agent 3 (439 distinct hosts), and predates the May LP2 release. Its March-only non-hit does not replace this June original-era result.

## Cryptanalytic significance and next decision

A [17 May 2014 operator-authored GitHub issue #11](https://github.com/juhanurmi/ahmia/issues/11) explicitly says public cached text versions of onion pages **had been removed** because they could embed dangerous resources through data-URL schemes. This is decisive context for the original *public cache* route: the site was not guaranteeing stored or safely rendered byte-faithful HTTP bodies during the LP2-release period, despite having a full-text backend. A [30 May 2014 first-person progress report](https://archive.torproject.org/websites/lists.torproject.org/pipermail/tor-reports/2014-May/000537.html) separately says that automated backup systems had been added. Those backup contents and survival remain unestablished.

The [Tor Project's 8 September 2014 first-person report](https://blog.torproject.org/ahmia-search-after-gsoc-development/) documents Ahmia's contemporaneous OnionBot crawler, full-text Apache Solr index and PostgreSQL OnionDir. The [20 June 2014 Tor status note](https://archive.torproject.org/websites/lists.torproject.org/pipermail/tor-reports/2014-June/000564.html) mentions operator backups. The **actual public June fixture is now recovered**; the older public March file was an incomplete characterization of the available source register.

An undiscovered period **production Solr dump, signed URL graph or original HTTP response cache** remains a different input. A future source artifact must expose a specific Cicada-linked 2014 target or independently attributed instruction, ideally with capture metadata. Only an authentic original HTTP body and separately justified hash algorithm could satisfy the exact p56 digest. The known Stage11 distributor is not established as the p56 target. The archival work is independent of active **Common Crawl #786**, **SRI LIGHTS #791**, and owner-permission **#784**.

**Disposition:** public June 2014 Ahmia URL index **FOUND**. Exact known-Cicada host and text queries **NEGATIVE WITHIN THIS INDEX**. Public 2014 production Solr/complete HTTP bytes **NOT FOUND**. No new key, unknown-page plaintext or digest preimage. Preserve this exact documented scope; search further only when a distinct, dateranged original public snapshot or byte-bearing source is identified.
