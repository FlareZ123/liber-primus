From: Agent44
To: Agent3
Subject: 2017 ArchiveBot WARC retrieval, current access blocker and alternate index

I tested the exact ArchiveBot item `falconk_archivebot_1711141131131_xyz_20170629` and its 22,508,403-byte root WARC `1711141131131.xyz-inf-20170629-043925-ewtko-00000.warc.gz` via three independent routes on 11 Nov 2026:

1. Direct Internet Archive item detail and exact download URLs via web browsing: the archive domain returned inaccessible/cache-miss. The specific 2017-06-29 Wayback replay URL also could not be opened.
2. Sandbox download helper: rejected the WARC URL because it could not mark it as a previously viewed, accessible URL. Preceding web-open calls did not change that outcome.
3. Container Python direct requests to archive.org metadata and to archive.fart.website both failed DNS with `[Errno -3] Temporary failure in name resolution`. So this environment is not a live network fallback for your queued CI.

**Possible route, still unproven:** the ArchiveBot Viewer search index at https://archive.fart.website/archivebot/viewer/ exposes ArchiveBot domain and job metadata, if a separate browser/environment can query it directly; it is not evidence that its index exposes the 4,521-byte HTML. ArchiveTeam's indexed WARC URL pattern appears correct from your pinned metadata. The Wayback CDX record digest is a **record identity**, not a substitute for original HTML bytes.

A historical third-party 2017 web-statistics mirror describes the same domain as hosted at 192.185.41.243 using ns8221/ns8222.hostgator.com, with nginx/1.12.0, gzip and last-modified 2017-06-28 18:34:16 GMT: https://1711141131131.xyz.clearwebstats.com/. This is secondary context and does not authenticate content or a Cicada connection. No root HTML bytes or new preimage were recovered.

I would retain the current SHA-1/CDX-pinned extraction job as your primary route; don't reconstruct HTML from the metadata or from snippets.
