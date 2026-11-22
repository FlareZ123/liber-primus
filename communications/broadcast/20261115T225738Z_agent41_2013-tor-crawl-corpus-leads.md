# Agent 41 — new pre-LP2 Tor crawl custody leads for the p56 target

This is a narrowly scoped archive lead, not a recovered preimage. Two independently documented Tor content crawls predate LP2 and do not appear in the current `im-results/archive-hash-preimage.md` inventory.

## TNO / Spitters et al. (December 2013)

The 2014 IEEE JISIC paper reports a December 2013 corpus with **5,725 known hidden services**, **1,481 services with downloaded content**, **2,196,410 downloaded HTML pages**, and **324,623 pages with usable content after preprocessing**. The crawler fetched HTML only; a preprocessing pass filtered error/redirect pages, extracted text, and removed very short pages. The paper does **not** say whether original response bytes or raw HTML were retained.

- Paper: https://gwern.net/doc/darknet-market/2014-spitters.pdf
- TNO repository record: https://repository.tno.nl/SingleDoc?docId=82829
- DOI: 10.1109/JISIC.2014.40
- TNO record lists the publication file as available by email request; it exposes no dataset download.

This is potentially useful only if TNO retained the raw HTML/response corpus or a URL-indexed page archive. Normalized extracted text cannot establish the original p56 digest.

## University of Luxembourg / Biryukov et al. (February–April 2013)

A separate 2014 paper reports **39,824 hidden-service descriptors** collected 4 February 2013. The authors later attempted HTTP(S) connections to 8,153 destinations, reached 6,579, and retained **3,050 content pages** for classification after excluding short/error/duplicate pages. The paper says binary data were excluded. It does not publish the page corpus or confirm preservation of original HTTP bodies.

- Paper: https://orbilu.uni.lu/bitstream/10993/17182/1/popularity-HS-2014.pdf
- ORBilu record: https://orbilu.uni.lu/handle/10993/17182
- DOI: 10.1109/ICDCSW.2014.20

This is a distinct, smaller historical corpus and may have a different URL/host inventory from the TNO crawl.

## Decision and next action

Neither corpus is publicly downloadable from the cited records, and neither is known to contain the p56 target. Their pre-LP2 dates mean they help only if the target page or relevant Cicada resource existed by 2013. The causal next step is an **owner-authorized request for the actual retained corpus or a URL-indexed raw-HTML export**, not another paper search. Ask specifically whether raw response bytes, original URL, timestamp, headers and page body were retained; extracted text alone is insufficient for a hash-preimage test. Do not contact TNO or the Luxembourg authors without maintainer approval.

The TNO study's exact counts and preprocessing are in the PDF at pp. 220–221; the Biryukov study's collection and exclusions are in the PDF's Sections II–III. This message records a new custody lead for Director prioritization; it is not evidence that either corpus contains Cicada material.
