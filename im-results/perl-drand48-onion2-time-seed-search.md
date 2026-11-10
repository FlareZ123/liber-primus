# Perl drand48 time-seed screen for the 2014 onion-2 byte stream

**Classification:** bounded historical-source hypothesis test; negative. It does not recover an LP2 key, plaintext, or the onion-2 generator.

## Motivation

The archived 2014 stage-3 service exposed a 256-byte string that grew by one byte at a time, with observed arrival intervals in five-minute multiples. The later stage-4 Apache status snapshot identifies Apache 2.2.22 on Ubuntu, but the original server-side generator source is absent. Since Perl was a common 2014 Unix scripting runtime and Perl on this Linux host reports randfunc='Perl_drand48', test the concrete hypothesis that the byte stream came from a Perl srand(time); int(rand(256)) stream. A second model lets the same stream generate each update delay and byte.

This is motivated by the historical server environment, but **there is no evidence that the onion-2 generator was written in Perl**. The experiment is deliberately scoped to one plausible implementation rather than treated as an exhaustive PRNG search.

## Inputs

- Exact 256-byte hex string from resources/cicada2014-onion2-timing.json; SHA-256 05acf0d8e2ba7d851e2b4bbc32b85e461a1bd41576a50504487f33d4c1522c56.
- Reconciled multi-witness timing cells for positions 152–182, also from that JSON.
- Seed window: every integer Unix second from **2014-01-04 00:00:00 UTC** (1388793600) through **2014-01-11 00:00:00 UTC** (1389398400), inclusive: **604,801** seeds.
- For every seed, test every initial random-call offset **0–1024**, inclusive.
- POSIX drand48 recurrence: x[n+1] = (0x5deece66d*x[n] + 0xb) mod 2^48, seeded as (seed << 16) + 0x330e. int(rand(256)) is the top eight bits of the 48-bit state. The implementation first checks eight outputs against the local Perl fixture for seed 1389060782 (3,0,170,175,27,131,197,178).

## Results

### Direct byte stream

For every one of the 604,801 seeds and 1,025 offsets, compare the generated stream against **every** five-byte window in the 256-byte target, not merely its first five bytes.

- Longest matching contiguous substring: **0 bytes**
- Five-byte matches: **0**
- Six-byte matches: **0**
- Eight-byte matches: **0**

Thus the target is not a contiguous int(rand(256)) output stream under an explicit Unix-second srand(time) seed in this date range and offset range.

### One PRNG stream interleaving delay and byte

For each multi-witness position 152–182 (31 events), test both possible draw orders:

1. int(rand(7))+1 five-minute units, then int(rand(256)) byte;
2. byte, then interval.

For each event, compare both the observed interval and the exact observed byte. Search all the same seeds and offsets.

- Candidates matching the first event: **691,544**
- Candidates matching the first two events: **370**
- Candidates matching all 31 events: **0**

The first- and second-event candidate counts are consistent with the expected attrition from the small interval alphabet and byte constraints; the full sequence produces no hit.

## Reproduction

~~~sh
g++ -O3 -march=native -std=c++17 sims/perl_drand48_onion2_time_seed_search.cpp -o /tmp/perl_drand48_onion2_time_seed_search
/tmp/perl_drand48_onion2_time_seed_search
~~~

The program is deterministic, has no external dependencies beyond C++17, embeds the exact target and 31 interval values, checks the local Perl fixture, and exits nonzero if either tested model finds a match.

## Decision and limitations

The explicit srand(time) + Perl-drand48 direct-byte model and the two simple delay/byte interleavings are rejected over the stated finite search. This extends the single exact-restart-time drand48 check, but does **not** establish that Perl was used or exclude:
- Perl's default srand() initialization or a seed mixed with PID/process state;
- a different time window, a different random-call offset, or a different draw schedule;
- rand(255) or a different byte conversion;
- a separate scheduler for timing and a different generator for bytes;
- another PRNG, cryptographic generator, precomputed string, or server-side source;
- any relationship (or lack of relationship) between the historical string and LP2.

Do not extend this into arbitrary PID/seed/PRNG sweeps without an independent source clue. The useful conclusion is narrow: the 2014-01-07 Apache restart timestamp is not a direct time-seeded Perl-drand48 byte-stream explanation under this tested model, and the wider explicit time-seed interval also fails.

## Source references

- Original stage-3 archive and static README: https://github.com/scream314/cicada3301/tree/master/assets/2014/stage03
- Historical stage-4 Apache status snapshot (Apache 2.2.22 Ubuntu, current/restart time, PID and server generation): https://github.com/scream314/cicada3301/blob/master/assets/2014/li676-224_server-status_orig.txt
- Historical stage-3/stage-4 chronology and matching 256-byte strings: https://github.com/scream314/cicada3301/blob/master/2014.md
- Timing data provenance and confidence labels: resources/cicada2014-onion2-timing.json
