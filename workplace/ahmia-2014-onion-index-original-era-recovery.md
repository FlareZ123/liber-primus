# Ahmia: recovered May–June 2014 directory fixture and scoped Cicada coverage decision

**Shared research synthesis · updated 14 November 2026. Status: June/July public fixtures recovered; weekly private-backup mechanism documented; no additional public 2014 snapshot or p56 continuation recovered.** A date-pinned Ahmia directory fixture survives in the original maintainer's Git history, supplying original-era onion URL and description metadata from after the Liber Primus release. It contains no identified Cicada continuation URL, preserved HTTP response body, original plaintext or key.

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

The older [ahmia/static/visuals/oniondomains.xml](https://github.com/juhanurmi/ahmia/blob/8d8382d5a4a5214824ca8b8174461baab7912b50/ahmia/static/visuals/oniondomains.xml) dates to **13 March 2014**, was separately scanned by Agent 3 (439 distinct hosts), and predates the M## 2014 backup architecture and public-access boundary

The first-person [30 May 2014 operator report](https://archive.torproject.org/websites/lists.torproject.org/pipermail/tor-reports/2014-May/000537.html) says automated backup systems had been added. The original public source history now identifies exactly what those backups were and where they were written:

- [28 May 2014 commit 785ee167](https://github.com/juhanurmi/ahmia/commit/785ee167cf7fa7d26215a6080a006e49239a804f) adds a weekly PostgreSQL dump to the local path /usr/local/lib/ahmia/backups/sql/YYYY-MM-DD-db_backup.sql and adds backups/sql/.gitignore.
- [31 May 2014 commit 349f33a](https://github.com/juhanurmi/ahmia/commit/349f33a5ff3ecae99e7ad5819b1ec61a60fc3d22) adds a weekly address-page snapshot to /usr/local/lib/ahmia/backups/addresses/YYYY-MM-DD-addresses_snapshot.json and adds backups/addresses/.gitignore. The crontab schedules the SQL dump at Monday 01:07 and the address snapshot at Monday 01:08, using the server's local date.
- Both backup-directory .gitignore files ignore every file except the .gitignore itself. The public Git history for backups/addresses/.gitignore contains only its initial addition; the public crontab history through 31 December 2014 contains only the 31 May backup addition and an unrelated 2 June indexing/log update. No weekly backup payload is committed in the public repository.

The [same commit's Apache virtual-host configuration](https://github.com/juhanurmi/ahmia/blob/349f33a5ff3ecae99e7ad5819b1ec61a60fc3d22/apache2/sites-available/django-ahmia) aliases only /static/, /media/, /favicon.ico, and /robots.txt; the site root is handled by WSGIScriptAlias /. There is no /backups/ alias and the local backup directory is not an Apache document root. The configuration also explicitly denies public access to /alldomains and /banneddomains.txt, allowing localhost only. The full inventory including banned domains was therefore not a public endpoint.

### What the backups would contain

The [31 May URL routes](https://github.com/juhanurmi/ahmia/blob/349f33a5ff3ecae99e7ad5819b1ec61a60fc3d22/ahmia/urls.py) and [views](https://github.com/juhanurmi/ahmia/blob/349f33a5ff3ecae99e7ad5819b1ec61a60fc3d22/ahmia/views.py) distinguish three useful interfaces:

- Public /onions/ returns a plain-text list of non-banned onion URLs. It does not include descriptions or outward relations.
- /address/ returns an HTML list by default. The [HTML template](https://github.com/juhanurmi/ahmia/blob/349f33a5ff3ecae99e7ad5819b1ec61c655a9cb31/ahmia/templates/hs_list_view.html) displays online, non-banned services, descriptions and optional relation URLs.
- /address/ can return JSON or RDF only when the request's CONTENT_TYPE contains json or rdf. The [JSON template](https://github.com/juhanurmi/ahmia/blob/349f33a5ff3ecae99e7ad5819b1ec61a60fc3d22/ahmia/templates/onions.json) includes URL, title, description, relation, keywords, type, language and contact information. The corresponding view selects the latest description per onion. The SQL dump is broader: it includes the database models and their URL, status, observation-date and description/relation metadata, but not original HTTP response bodies.

There is an important implementation caveat: the committed cron command is written as:

    curl -i "Content-Type: application/json" https://ahmia.fi/address/ > /usr/local/lib/ahmia/backups/addresses/DATE-addresses_snapshot.json

It has no -H option. The quoted Content-Type: application/json is therefore an extra curl URL argument, not a request header. The view checks request.META['CONTENT_TYPE'], not Accept; absent that request header, /address/ takes its default HTML branch. If curl continues to the second URL after the invalid first argument, the saved output is therefore expected to be the default HTML response with -i response headers, not the JSON template. The .json filename alone does not establish the file format. The actual backup bytes are not public, so whether the job ran successfully and what it wrote remain unknown.

The backup commands cover PostgreSQL and the address directory, not a Solr index export. The [8 September 2014 operator report](https://blog.torproject.org/ahmia-search-after-gsoc-development/) later documents the OnionBot → Apache Solr full-text pipeline and PostgreSQL OnionDir, but no Solr export command appears in the preserved crontab. The address snapshot/SQL dump could preserve original URLs and outward relation metadata; neither is evidence of original webpage entity-body bytes or a p56 digest preimage.

### Public-era references versus preserved data

The public directory's existence is independently date-pinned: an [20 August 2014 Tor Stack Exchange answer](https://tor.stackexchange.com/questions/3896/where-can-i-find-export-or-download-the-biggest-list-of-all-onion-addresses/3897) points users to the Ahmia onion-domain list and says it contained over 1,000 sites; the [8 September 2014 operator report](https://blog.torproject.org/ahmia-search-after-gsoc-development/) reports 1,228 domains and seven filtered services. These are contemporaneous descriptions and counts, not copies of the URL index.

Targeted public searches for the backup filename, the JSON/template endpoint names, and archived Ahmia address/onion-list pages produced no additional date-pinned May–December 2014 snapshot. The earlier Arquivo.pt query found no captures; the earlier Wayback CDX request timed out and is not a negative result. Do not repeat that failed CDX query by changing URL serialization. The recovered June fixture and July test-page list remain the only public post-release original-era URL-bearing artifacts established here.

## Cryptanalytic significance and next decision

**Public-source decision:** no additional public post-release 2014 production Solr/OnionDir export, weekly backup payload, or date-pinned web-cache copy with new Cicada host/link evidence was recovered. This is a scoped negative over the public maintainer repository history, its documented backup/HTTP exposure, the targeted public search, and the already recorded archive results—not proof that no third-party copy exists.

**Access boundary:** the only newly identified recurring snapshots were deliberately stored under server-local /usr/local/lib/ahmia/backups/{sql,addresses}/, ignored by Git, and not exposed by the Apache virtual host. The public /alldomains and /banneddomains.txt interfaces were localhost-restricted. No restricted backup was accessed, and no custodian was contacted.

**No source-selected decoder:** the public fixtures still produce no known-Cicada host or instruction. The potential weekly backups contain URL/description/relation metadata, not original page bodies; the metadata alone cannot test the 128-hex p56 digest. The historical 2014 database MD5 field hashes the onion hostname, as documented above, not page bytes. The p56 target host may differ from the known Stage11 distributor.

**Recommended owner-authorized next action:** add the precise 2014 backup question to [owner-action Issue #784](https://github.com/FlareZ123/liber-primus/issues/784), but do not contact anyone until the owner explicitly authorizes it. Ask only whether any May–December 2014 weekly files at the two documented backup paths survive and whether the custodian can provide a metadata-only, source-permitted query/result containing onion URL, outward relation URL, title, description, subject/keywords, type, language, contact information, update time, snapshot date and record counts. Ask whether the .json snapshots are actually JSON or default HTML. Do not request the raw SQL dump, HTTP bodies, server logs, IP/visitor data, credentials, banned-domain details or active hidden-service access. If no backup survives or no lawful metadata-only result can be provided, record that boundary; do not convert it into a negative p56 hash result.

**Disposition:** June 2014 public fixture **FOUND**; July 2014 public test-page host list **FOUND**; exact known-Cicada host/text tests **NEGATIVE WITHIN THOSE SOURCES**; additional public May–December 2014 snapshot **NOT FOUND**; private weekly metadata-backup mechanism **DOCUMENTED, PAYLOAD NOT PUBLIC**; production Solr export and original HTTP body bytes **NOT FOUND**. No new key, unknown-page plaintext, decoder or digest preimage.
