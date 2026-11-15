# Independent January–March 2015 Tor crawl: a missing p56 target-page acquisition route

**15 November 2026, Agent47. Status: original 2016 publication and technical annex located; actual 2015 crawl data and any Cicada target page remain unacquired.** This source is distinct from the 2016 DUTA, EURECOM/Deusto, 2017 DUTA-10K and 2014/15 Arquivo/Wayback lanes already scoped in [the historic preimage assessment](../im-results/archive-hash-preimage.md). It supplies a specific archive custodian and original collection format to pursue, without presuming the archive survives or contains the target.

## Original source and why it could matter

The independent paper [Daniel Moore and Thomas Rid, *Cryptopolitik and the Darknet*, *Survival* 58(1), 7–38, published 1 February 2016](https://doi.org/10.1080/00396338.2016.1142085) describes a **January–March 2015** Tor hidden-service crawl seeded from **5,615** unique .onion addresses collected from Ahmia and Onion City. It followed hyperlinks up to **five hops** and examined up to **100 pages per site**. The published article reports roughly **300,000 visited URLs**, **205,000 unique pages** and **5,205 responsive websites**. These are contemporary first-party methodology claims, not independently recovered dataset bytes.

A separately preserved, original-webpage-format [ten-page technical annex by Daniel Moore](https://ridt.co/d/moore-rid-technical-annex.pdf), headed `TECHNICAL ANNEX: INDEXING TOR HIDDEN SERVICES` with original page footers `2/2/16, 12:23` and URL `http://35oktenzdrt2v4o5.onion/methodology/`, states that the **custom Python crawler** kept a persistent record in **MongoDB** and retried temporarily unavailable services. It *excluded .bin, archives, images, and other media*; collected textual HTTP pages; stripped HTML tags, hidden text, comments, JS and embedded media; language-identified and translated some text; **hashed the normalized text** and deduplicated repeat page content in MongoDB. The annex says **239,000 unique pages**, with **50,000 used for classification**. The article/annex page totals disagree in definition or accounting; neither total should be treated as a count of available raw HTTP bodies.

The previously released original 2014 Liber Primus Stage11 distributor was `ky2khlqdf7qdznac.onion`. The author-authenticated solved p56 directs solvers to an unknown deep-web page whose contents hash to a printed 128-hex target:

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

A crawl at this **early 2015** date could in principle preserve a page connected from the original distribution or the missing target URL. Its publicly described bootstrap and link-following method supplies no guarantee either service was reachable or indexed.

## Current acquisition gate and owner-approved metadata-only inquiry

The public-access assessment in [Director issue #1131](https://github.com/FlareZ123/liber-primus/issues/1131) located **no public URL index, dataset accession, download or query service** attributable to this particular January–March 2015 crawl. This closes public execution, but leaves one separate, authorization-dependent question: does an original custodian still possess a searchable archive index? The paper and annex document a persistent internal MongoDB collection, not a publicly committed schema or exposed index. No response-byte preservation, URL/title/timestamp field, or stored hash algorithm is established. The separate original 2015 CARONTE response-body project has a stronger primary provenance claim for exact response bytes and should precede this lower-priority normalized-text route if approved.

**Exact proposed message for repository-owner approval only (unsent):**

> Subject: Narrow metadata-only question about 2015 Moore–Rid Tor crawl
>
> Dear Dr Moore / Dr Rid,
>
> I am researching the historical Cicada 3301 Liber Primus puzzle, using your published January–March 2015 Tor hidden-service crawl as a possible record of an otherwise missing 2014-era public puzzle page. Could you confirm whether an authorized, searchable URL-level index from that original crawl still exists and, if so, whether the index records any page under the historically documented Liber Primus distributor host **`ky2khlqdf7qdznac.onion`**? If your index also has searchable title/normalized-text fields, could you check only for the exact phrase **`Liber Primus`** or the printed puzzle digest **`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`**? A yes/no on whether those searches are possible, including a negative result, is valuable.
>
> For *matching public puzzle records only*, we would be grateful for the original indexed URL and any index fields that actually survive: capture date/time, indexed title, document identifier, stored response length, stored digest **with its algorithm and hashed representation identified**, and whether original response-body bytes exist. These are optional: please do not derive or expose fields absent from your original records. A URL-index entry for the distributor would not by itself identify the unknown digest-target page.
>
> We are requesting **no raw webpage contents, corpus export, private user data, visitor/client information, service operators, server IPs or log records**. We would not ask you to run any additional crawling. Please disregard the inquiry if the archive cannot be searched or shared under your permissions.
>
> Thank you.

**Documented field basis and limits:** the [2016 journal paper](https://doi.org/10.1080/00396338.2016.1142085) establishes the January–March 2015 temporal scope, onion-site crawl and link traversal; the [original technical annex](https://ridt.co/d/moore-rid-technical-annex.pdf) establishes a persistent Python/MongoDB text-processing/deduplication pipeline. Neither source publishes a URL-index schema, raw HTTP retention policy or the digest's hashing algorithm. Accordingly URL, title, UTC capture, document ID, original length, body availability and digest are **conditional questions**, not claims that those stored fields exist. [The original p56 source](../im-results/p56-exact-digest-public-occurrences.md) fixes the digest; the 2014 Stage11 source establishes only the named distribution host, never the unknown target. The 2016 institutional source and [2024 Moore/Rid affiliation announcement](https://alperovitch.sais.jhu.edu/daniel-moore-author-of-offensive-cyber-operations-joins-the-alperovitch-institute/) establish possible custodial contacts, not archive custody.

**Permission and decision:** [Owner action #784](https://github.com/FlareZ123/liber-primus/issues/784) currently authorizes **neither** this new third inquiry nor any requester. The owner must separately approve (a) whether to approach Moore and/or Rid and (b) which named authorized person may send exactly this metadata-only text; until then **do not contact, disclose or query a private index**. If a custodian reports no retained index, no permitted lookup, or no matching indexed records, retire this route. If a dated public URL is returned, create a separate targeted original-response acquisition task; sanitized text or its deduplication hash cannot validate the 128-hex original-response target. An original source-associated title or instruction may guide cryptanalysis only after its provenance is pinned.

## Decision and evidence classification

**New actionable input:** a distinctly dated, relatively large, explicitly text-indexed 2015 Tor crawl with a named original custodian and original storage schema. The publication is recoverable now. The corpus itself, any matching .onion record, candidate plaintext, source key and final destination are **unverified and presently missing**. The strongest current path to a cryptanalytic change is an *actual original page or instruction* emerging from a targeted index lookup. Ordinary article statistics or the existence of a crawler do not count as Liber Primus decipherment.

Sources: [original journal article](https://www.tandfonline.com/doi/full/10.1080/00396338.2016.1142085) · [original technical annex](https://ridt.co/d/moore-rid-technical-annex.pdf) · [author institutional record](https://kclpure.kcl.ac.uk/portal/en/persons/daniel-moore/) · [existing distinct archive lane](../im-results/archive-hash-preimage.md).
