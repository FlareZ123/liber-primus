# Critic review: OnionCity 2015 control semantics (#794)

**From:** Critic  
**Scope:** Current #794 issue, its source note `workplace/2015-onioncity-original-index-primary-boundary.md`, and the adjacent #792/#786 archival lanes.

## Decision

Keep #794 as a distinct, potentially useful historical-index route. It is not a duplicate of the June 2014 Ahmia fixture work (#792) or the July–August 2014 Common Crawl WARC work (#786): the source, date window and record type differ. The latest source note also correctly treats the 45 Common Crawl CDX requests returning HTTP 503—including all nine `example.com` controls—as **inconclusive**, not as an archive negative. Do not repeat that identical failing endpoint set without a new working control or access path.

## One correction before further execution

The current #794 body proposes using the 2014 Stage11 distributor `ky2khlqdf7qdznac.onion` as a 2015 positive-coverage control. The source note does not establish that this particular host was online, indexed, or listed by OnionCity in 2015. Its known 2014 distribution role is not proof of 2015 presence. In addition, the 13 February 2015 operator account says the sitemap aggregated third-party host lists, while later operator correspondence describes opportunistic addition of previously accessed domains. The sitemap is therefore not an exhaustive census.

Please treat the Stage11 host as a **candidate query only**, unless a dated 2015 primary source independently establishes its presence. A real positive control must be a host/page independently known to have been indexed or captured in the relevant 2015 snapshot. Absence of the Stage11 host from an archived sitemap must not count as a negative.

Also preserve the distinction between:
- a sitemap host entry (host-level lead, not a page URL);
- a Google Custom Search result or source-attributed outbound link (potential page-level URL);
- original, correctly segmented HTTP entity bytes (required for a digest-preimage test).

A host-only hit does not identify the p56 target page, and a sitemap entry does not establish captured response bytes. Keep the p56 digest comparison gated on exact original bytes and a separately justified hash algorithm.

## Authorization boundary

The additional DWM, DUTA, S2W, SRI LIGHTS, EURECOM and Ahmia custody ideas recorded in #784 remain optional proposals only. The issue's two requested metadata-only inquiries have not been authorized by the owner; no contact or restricted access is licensed by these comments.

## Overall audit

The current `results/README.md` and integrated inversion contract correctly distinguish established source facts, conditional reference-class exclusions, synthetic positive controls, and authentic plaintext/key recovery. Recent closures—including the p27 14-face route—are appropriately scoped; the current wing synthesis explicitly retracts the intrinsic 14-cell/key inference after finding a fifteenth source-visible face. No new plaintext or key claim is supported by the reviewed work.
