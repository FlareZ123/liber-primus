# p7 rooted table address: length-only null and passive archive coverage

Director #2614; Agent40, 2026-11-24. No authenticated destination.

## Frozen path and format null
Original missing-f base59 table row-major successor map, p7-selected start 61, path [61,193,153,33,112,72,161,214,247,189]. A length-ten byte string always base32-encodes to a syntactically valid 16-character v2 identifier. Exactly 8 of the 256 original start positions reach a self-loop in 10 vertices (25,61,90,151,206,234,246,254). This is not eight independent clues.

300,000 seeded Fisher-Yates permutations of the same original decoded value multiset; count only distinct-vertex paths ending at a fixed point (not arbitrary paths cut at ten). Seed 0x33012614; the PRNG modulo sampling has negligible finite bias, so report simulation frequencies rather than exact probabilities.

| Event | Count / total | Rate |
|---|---:|---:|
| Fixed start 61 ends in exactly 10 vertices | 1002 / 300000 | 0.00334 |
| At least one such start | 46097 / 300000 | 0.15366 |
| Fully single-rooted maps | 1150 / 300000 | 0.00383 |
| Fixed start 61 ends in 10, conditional on single rooted | 44 / 1150 | 0.03826 |
| Any such start, conditional on single rooted | 1150 / 1150 | 1 |
| Mean qualifying starts, conditional on single rooted | 9830 / 1150 | 8.54783 |

Observed 8 is ordinary conditional on the very rooted geometry that motivates the path. Conditional fixed-position rate ~3.83%; do not multiply it by the previously assessed rooted-map probability as independent evidence. Syntax adds zero authentication.

## Passive archive check

- Pinned [Phase52 report](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/log/phase52_an_end_archives.md), 34 host labels from 1,333 archived text files and wiki, does not include the frozen label. Its [query script](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/phase52/cdx_query.py) only submits the harvested hosts; it does not establish absence from Wayback. The 862 queries are not candidate-specific coverage. Full CDX export unavailable through this runtime (oversized/empty tool response); no claim to have searched all its rows.
- Passive exact candidate Wayback CDX and availability requests inaccessible; Common Crawl 2014-23 and 2014-52 exact candidate index requests likewise inaccessible. No returned zero-result archive response; archive coverage is unresolved, not a negative archive lookup.
- Tor Metrics historical data describe aggregate statistics rather than a public complete service list ([source](https://metrics.torproject.org/reproducible-metrics.html)). A 2013 research descriptor collection predates the 2014 release ([paper](https://arxiv.org/abs/1308.6768)); no qualifying 2014 descriptor/body was obtained. No general exact-address web/GitHub rerun, live onion request, alternate candidate or network probe.

**Decision:** retire this specific route as uncorroborated under its original format-based premise. No body obtained, so no p56 digest test. This does not prove that the service never existed; candidate-specific archive access failed. Reopen only on independently dated authentic capture or descriptor, not more path encodings.

Reproducer: `node sims/lp2_p7_rootpath_length10_null_sft.cjs`; executed JS V8 directly against the repository table. Commit 2e0c5a7645d42a6a34a958fc9f1a7394d0c5f33e. No CI dispatch.
