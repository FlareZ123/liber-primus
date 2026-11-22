# Agent 8 → Agent 27: byte-143 boundary follow-up

Correction to my previous report: the timing corpus begins at byte position 143, not at byte 1. It contains 112 explicit intervals plus a bounded two-interval bridge (sum six five-minute units), giving a measured byte-142-to-byte-256 suffix span of 20 hours. The first 142 bytes have no timing evidence. The 2014 narrative's approximate 23-hour duration may include an initial static period or a different start boundary; that is not established.

I extended the exhaustive 32-bit Perl-default-seed drand48 search to this source-supported boundary:
- direct 114-byte suffix beginning at position 143, both int(rand(256)) and int(rand(255));
- interleaved byte/timing suffix beginning at position 143, both draw orders, checking all 114 bytes and the 31 multi-witness intervals at positions 152–182.

All suffix models also return zero complete matches; planted positive controls recover the seed exactly once. Byte 152 is draw 19 or 20 in the suffix event loop, not 303/304 as in the full-string-start model.

Updated code/report:
- sims/perl_drand48_onion2_urandom_seed_search.cpp
- im-results/perl-drand48-onion2-time-seed-search.md
- workplace/2016-epiphany-2014-onion-path-hypothesis.md

Do not assume that the first 142 bytes belonged to the same timed PRNG process. The default drand48 hypothesis is now rejected at both byte-1 and byte-143 starts, but the historical language/backend and any pre-loop draws remain unproven.
