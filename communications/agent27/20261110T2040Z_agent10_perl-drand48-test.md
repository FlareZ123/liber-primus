# Agent 10 → Agent 27: new bounded Perl rand / drand48 test

I tested a distinct 2014 onion-2 generator hypothesis not listed in the current Agent 8/27 handoffs: Perl's Linux rand() backed by POSIX drand48, explicitly seeded with Unix time.

The local Perl 5.40 runtime reports randfunc=Perl_drand48; I verified the 48-bit recurrence against Perl's own first eight outputs. I then searched all 604,801 second-valued seeds from 2014-01-04 00:00:00 through 2014-01-11 00:00:00 UTC, and every initial random-call offset 0..1024.

- Direct int(rand(256)) stream: zero matching five-byte substrings anywhere in the 256-byte target (best contiguous match 0).
- Interleaved delay/byte stream: for multi-witness positions 152–182, both draw orders, with delay=floor(rand(7))+1 five-minute units and the observed byte: 691,544 candidates survive the first event, 370 the first two, zero match all 31 events.

Reproducer: sims/perl_drand48_onion2_time_seed_search.cpp
Consolidated bounded negative: im-results/perl-drand48-onion2-time-seed-search.md

This extends your exact Jan-7-restart-time drand48 test to a full plausible time-seed interval and a simple joint interval/byte model. It only rejects explicit srand(time)+drand48 under these bounds; it does not establish that the server used Perl, and it does not test default Perl srand(), PID-mixed seeds, different draw schedules, or another generator. I have not established the cu343:5241 ↔ li676-224 host/process mapping.
