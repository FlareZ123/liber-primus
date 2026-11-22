# Perl drand48 seed screens for the 2014 onion-2 byte stream

**Classification:** bounded historical-source hypothesis tests; negative. Neither experiment recovers an LP2 key, plaintext, or the original onion-2 generator.

## Motivation and historical limits

The archived 2014 stage-3 service exposed a 256-byte string that grew one byte at a time, with surviving arrival intervals in five-minute multiples. The later stage-4 Apache status snapshot identifies Apache 2.2.22 on Ubuntu, but the original onion-2 server-side generator source is absent. The host attribution is also unresolved: the surviving status page is for onion 3, and no contemporaneous header or configuration ties onion 2's port 5241 to the same host or Apache parent.

Perl is a plausible 2014 Unix scripting runtime, but **there is no evidence that the onion-2 generator was written in Perl**. The tests below therefore evaluate a concrete implementation family, not the historical generator as an established fact.

Perl 5.14.2 provides a useful, previously untested default-seed model:
- In pp.c, pp_rand() calls seed() on first use when srand has not been called; argument-less pp_srand() also calls seed() ([v5.14.2 pp.c, lines 3151–3175](https://github.com/Perl/perl5/blob/v5.14.2/pp.c#L3151-L3175)).
- In util.c, Perl_seed() attempts to read a U32 from /dev/urandom by default unless PERL_NO_DEV_RANDOM is defined, then falls back to time, process ID, and process-memory information if that read is unavailable or returns zero ([v5.14.2 util.c, lines 5708–5775](https://github.com/Perl/perl5/blob/v5.14.2/util.c#L5708-L5775)).
- A Unix Perl configuration in the same source tag selects drand48/srand48 with 48 random bits ([Porting/config.sh, lines 897–934](https://github.com/Perl/perl5/blob/v5.14.2/Porting/config.sh#L897-L934)). This is a representative build configuration, not proof of the onion-2 host's Perl build.

The POSIX model tested here is:

\[
s_{n+1}=(0x5deece66d\,s_n+0xb)\bmod 2^{48},\qquad
s_0=(\text{seed}\ll16)\;|\;0x330e.
\]

int(rand(256)) is the high byte of the state. The search also tests int(rand(255)) as a common alternative byte conversion. For the timing model, int(rand(7))+1 produces the observed one-to-seven five-minute units.

## Inputs

- Exact 256-byte hex string from resources/cicada2014-onion2-timing.json; SHA-256 05acf0d8e2ba7d851e2b4bbc32b85e461a1bd41576a50504487f33d4c1522c56.
- Reconciled multi-witness timing cells for byte positions 152–182 inclusive (31 consecutive intervals), from the same JSON.
- The source JSON marks these 31 intervals multi-witness; the two-cell 30-minute ambiguity at positions 190–191 is not used.

## Timing chronology and coverage boundary

The merged timing corpus does **not** cover all 255 inter-byte gaps. It contains 112 explicit intervals at positions 143–189 and 192–256, plus a bounded two-interval bridge at positions 190–191 whose combined value is six five-minute units.

- The 112 explicit values sum to 234 units.
- The bounded bridge adds six units.
- The recorded suffix from byte 142 to byte 256 therefore spans 240 units = **20 hours**.
- The explicit cells at positions 160–256 sum to 196 units = **16 hours 20 minutes**; including the bounded bridge at positions 190–191, the full 159-to-256 span is 202 units = **16 hours 50 minutes**.
- The BotSottile log records a first observation at length 159 at 12:39 and length 256 at 05:10 the following day: **16 hours 31 minutes**. This is 19 minutes shorter than the merged interval sum for positions 160–256 including the bounded bridge. It is a coarse consistency check, not an independent validation if those cells were derived from that same witness.

The 2014 chronology says the process lasted approximately 23 hours and that the document changed at 05:31:40 GMT about an hour after growth stopped. The 20-hour measured suffix leaves roughly three hours outside the recorded interval coverage. The first 142 bytes have no timing evidence in the merged corpus. One possible interpretation is that a 142-byte prefix was already present during an initial static period and the timed append phase began at byte 143; this is plausible given the archived description that the page initially appeared static, but it is **not established**. Do not extrapolate the five-minute schedule backward across positions 1–142.

This boundary matters cryptanalytically: a PRNG may have started at byte 143 rather than byte 1. Experiment C tests that source-supported alternative.


## Experiment A: explicit time-based Perl seed

The earlier bounded search tested every Unix-second seed from **2014-01-04 00:00:00 UTC** (1388793600) through **2014-01-11 00:00:00 UTC** (1389398400), inclusive: **604,801 seeds**. For each seed it tested every initial random-call offset **0–1024**, inclusive.

Two models were checked:
1. a direct byte stream, comparing every generated five-byte window with every five-byte window in the target;
2. one stream interleaving int(rand(7))+1 timing units and int(rand(256)) bytes, in both draw orders, against all 31 exact events.

Results:
- Direct stream: longest matching contiguous substring **0 bytes**; five-, six-, and eight-byte matches **0**.
- Interleaved stream: **691,544** candidates matched the first event, **370** matched the first two events, and **0** matched all 31.

Reproduction:
~~~sh
g++ -O3 -march=native -std=c++17 sims/perl_drand48_onion2_time_seed_search.cpp -o /tmp/perl-time
/tmp/perl-time
~~~

## Experiment B: exhaustive default-seed Perl model

The default Perl seed is a 32-bit U32, so an explicit time-seed search does not cover it. Rather than iterate all seeds and all 256 outputs, the new search uses the invertible affine structure of the 48-bit LCG.

At any fixed draw count, the low 16 bits of the state are fixed by the initial 0x330e, while the high 32 bits are an affine function of the 32-bit seed. Its multiplier is odd and therefore invertible modulo 2^32. For a specified output byte, enumerate every high-32-bit state that can produce that byte, then invert the affine map to obtain the corresponding seed. This is exhaustive: every 32-bit seed that could match the first constrained byte appears exactly once, and all other seeds are excluded by that byte alone.

### Direct byte stream

For int(rand(256)), the first byte selects exactly \(2^{24}=16,777,216\) candidate states. For int(rand(255)), the first byte selects 16,843,009 candidate states. Each candidate is checked against the first four bytes and then, if it survives, against the remaining 252 bytes.

| Conversion | Candidate states | First 2 bytes | First 3 bytes | First 4 bytes | Full 256-byte matches |
|---|---:|---:|---:|---:|---:|
| int(rand(256)) | 16,777,216 | 65,535 | 254 | 2 | **0** |
| int(rand(255)) | 16,843,009 | 66,051 | 259 | 1 | **0** |

The four-byte survivors were seeds 0x1408d967, 0xfd92cbb8 (scale 256) and 0x27eeda8e (scale 255); each fails on subsequent bytes.

### Interleaved byte/timing stream

If each update consumes one byte draw and one timing draw, then after 151 prior events byte 152 is draw 303 for byte-then-delay, or draw 304 for delay-then-byte. The search enumerates every seed whose byte at that exact draw matches source byte 152, checks the corresponding first interval, then replays from the first event and verifies **all 256 bytes and all 31 multi-witness intervals**.

| Byte scale | Draw order | Candidate states | Passing first interval | Full byte + interval matches |
|---|---|---:|---:|---:|
| 256 | byte then delay | 16,777,216 | 2,396,747 | **0** |
| 256 | delay then byte | 16,777,216 | 2,396,746 | **0** |
| 255 | byte then delay | 16,843,009 | 2,406,143 | **0** |
| 255 | delay then byte | 16,843,009 | 2,406,142 | **0** |


### Experiment C: stream begins at the first timed byte (position 143)

Because the timing corpus begins at position 143, the initial 142 bytes may have been present before the timed append phase. The suffix is the exact 114 bytes at positions 143–256; its first four bytes are 49 bf 28 fa, and byte 152 is 26.

For a direct stream, the first suffix byte is draw 1. For an interleaved stream, byte 152 is the tenth suffix event: draw 19 for byte-then-delay or draw 20 for delay-then-byte. The search again enumerates every compatible 32-bit seed by inverting the affine state map. The interleaved replay checks all 114 suffix bytes and all 31 multi-witness intervals at positions 152–182.

| Conversion | Candidate states | First 2 bytes | First 3 bytes | First 4 bytes | Full 114-byte matches |
|---|---:|---:|---:|---:|---:|
| int(rand(256)) | 16,777,216 | 65,536 | 256 | 0 | **0** |
| int(rand(255)) | 16,843,009 | 66,051 | 259 | 2 | **0** |

The scale-255 four-byte survivors are 0xf198ea54 and 0xdb22dca5; neither matches the remaining suffix.

| Byte scale | Draw order | Candidate states | Passing first interval | Full 114-byte + 31-interval matches |
|---|---|---:|---:|---:|
| 256 | byte then delay | 16,777,216 | 2,396,746 | **0** |
| 256 | delay then byte | 16,777,216 | 2,396,745 | **0** |
| 255 | byte then delay | 16,843,009 | 2,406,143 | **0** |
| 255 | delay then byte | 16,843,009 | 2,406,144 | **0** |

### Positive controls

The same search functions recover the planted seed 0x12345678 exactly once for:
- direct 256-byte streams and 114-byte suffix streams under both rand(256) and rand(255);
- interleaved rand(256) full streams and 114-byte suffix streams in both draw orders.

The earlier known fixture srand(1389060782); int(rand(256)) also reproduces the expected first eight bytes (3, 0, 170, 175, 27, 131, 197, 178).

The original-target search completed in approximately 1.3 seconds in the local optimized C++ run.

Reproduction:
~~~sh
g++ -O3 -march=native -std=c++17 sims/perl_drand48_onion2_urandom_seed_search.cpp -o /tmp/perl-urandom
/tmp/perl-urandom
~~~

## Decision

The following source-motivated models are rejected:
- explicit Unix-second srand(time) seeds in the Jan 4–11 window, offsets 0–1024;
- all 32-bit seeds under the Perl 5.14.2 default-seed + POSIX drand48 model, for direct byte streams starting at byte 1 or at the first timed byte (position 143), using either rand(256) or rand(255);
- the same default-seed model for interleaved byte/timing streams starting at byte 1 or position 143, in either draw order, with no pre-loop random calls.

This does **not** rule out Perl as a language, a different Perl random backend, explicit custom seeding, a different byte conversion, pre-loop draws, a separate timing generator, a cryptographic random source, a precomputed string, or a different historical implementation. It also does not prove any relationship between the 2014 stream and LP2.

The useful conclusion is narrower: the simple default Perl drand48 explanation is exhaustively rejected for the two source-motivated start boundaries tested (byte 1 and byte 143). Unknown pre-loop draws, a different backend, separate byte/timing generators, or a different implementation remain open. Do not repeat time/PID/seed sweeps under these same models. Continue this line only if new evidence identifies the actual runtime, backend, or draw schedule. Otherwise treat the 2014 timing channel as historical context rather than established LP2 key material.

## Source references

- Perl 5.14.2 pp_rand / pp_srand: https://github.com/Perl/perl5/blob/v5.14.2/pp.c
- Perl 5.14.2 default seed implementation: https://github.com/Perl/perl5/blob/v5.14.2/util.c
- Example Unix drand48 build configuration: https://github.com/Perl/perl5/blob/v5.14.2/Porting/config.sh
- Perl 5.14.2 srand documentation: https://perldoc.perl.org/5.14.2/perlfunc
- Original 2014 stage-3 archive: https://github.com/scream314/cicada3301/tree/master/assets/2014/stage03
- Historical stage-4 Apache status snapshot: https://github.com/scream314/cicada3301/blob/master/assets/2014/li676-224_server-status_orig.txt
- 2014 chronology and onion descriptions: https://github.com/scream314/cicada3301/blob/master/2014.md
- Timing data, witnesses, and confidence labels: resources/cicada2014-onion2-timing.json
- BotSottile observation log: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5-stored/onion2-timing_BotSottile_qn8jmPJr.txt
- Archived 2014 chronology: https://github.com/scream314/cicada3301/blob/master/2014.md
