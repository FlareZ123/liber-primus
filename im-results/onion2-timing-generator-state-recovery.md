# 2014 onion-2 emission timing: historically constrained generator-state recovery

**Classification, 10 November 2026:** archival source recovery and **two exact original-input generator-state exclusions**, each demonstrated by an independently generated planted positive. **No recovered LP2 plaintext, authentic cipher key, or destination.**

## Historical oracle, preserved

The 2014 second onion service at \`cu343l33nqaekrnw.onion\` displayed a 256-byte hexadecimal string, revealing one additional byte at apparently irregular **five-minute-multiple intervals**. The 256-byte output later disappeared when the server advanced to the \`761\` stage. The first HTML comment, \`Patience is a virtue\`, has Gematria Primus sum **761** and is independently documented by contemporaneous solvers. None of these facts makes the 256-byte string an established LP2 key.

Four archived witnesses (BotSottile IRC, Cripion101's intervals, two independent wiki archives), merged by [Dukotah/cicada3301 Round 43 F5b-T](https://github.com/Dukotah/cicada3301/tree/master/liber-primus/analysis/round43/F5bT-timing-keystream), establish **112 attested inter-byte intervals** among 255. Nine have a contemporaneous witness's own uncertainty qualifier, and positions 190–191 have only an exact combined 30-minute span with five possible divisions. The 256 published original bytes, 112 observed interval values with their positions and confidence labels, and bounded bridge are now frozen in [\`resources/cicada2014-onion2-timing.json\`](../resources/cicada2014-onion2-timing.json).

Our exact tests use only source-protected contiguous original bytes **152–189 (38 bytes)** and **192–256 (65 bytes)**. The speculative relationship is that both byte values and reveal times came from a *single weak pseudorandom generator*, whose internal state is recoverable from the independently observed sequence. A successful reconstruction could expose currently unrecorded historical key material.

## Test A: exhaustive 32-bit affine generator state

Four common 32-bit linear-congruential generators are tested: ANSI C \`1103515245s+12345\`, Numerical Recipes \`1664525s+1013904223\`, Microsoft C \`214013s+2531011\`, Borland \`22695477s+1\` (all modulo \`2^32\`). Emitted bytes can be any fixed 8-bit lane. Internal state advances follow one of five declared schedules between observed bytes: once per byte, \`k\`, \`k+1\`, \`2k\` or \`2k+1\`, where \`k\` is the observed delay in five-minute units.

Because the first emitted byte fixes 8 state bits, **all remaining 2²⁴ initial bits are enumerated** for each of 4×4×5=80 combinations per span. No plaintext, key guesses, or English language fitness are fitted.

| Historical source span | Original full-length matches | Longest matching prefix | Independent planted recovery |
| --- | ---: | ---: | ---: |
| Byte positions **152–189**, 38 bytes | 0 of 80 source models | 4 bytes | **38/38**, unique 32-bit state |
| Byte positions **192–256**, 65 bytes | 0 of 80 source models | 4 bytes | **65/65**, unique 32-bit state |

The plant uses the **exact original historical delay sequence** in each span, a hidden Numerical Recipes pre-first-interval seed \`0x3301f13d\`, and the highest byte lane. Its two independently recoverable first-emission internal states are \`0x289b8178\` and \`0xe6a25677\`. Reproducer: [\`sims/onion2_timing_lcg_state_recovery.cpp\`](../sims/onion2_timing_lcg_state_recovery.cpp), C++17 with only standard-library dependencies. Original all-state search plus plant was compiled and executed successfully.

## Test B: independently sourced 2014 Unix-time-seeded Python MT19937

A separate plausible historical implementation is the Mersenne Twister using a Unix-time seed around the January 2014 release. **CPython's integer \`random.seed\` state initialization differs from the C++ standard \`std::mt19937(seed)\` state**, so the attack implements the actual CPython 2002 \`init_by_array\` procedure and the MT19937 output/tempering in C++17, checked against Python's exact four 32-bit outputs for seed \`3301\`. Independently, the standard C++ seeding model was also searched.

The source-frozen **17 original bytes at positions 152–168** and their exact 16 successive interarrival delays are matched against all combinations of:

- **777,600 timestamp seeds** from 2014-01-04T00:00:00Z through 2014-01-13T00:00:00Z (exclusive), spanning the historical January 6–7 onion service;
- **901 possible starting output offsets** (0 through 900), allowing an arbitrary initial generator burn-in;
- **four fixed output-byte lanes** of the 32-bit MT word;
- **five models** of output-advance clock: \`1\`, \`k\`, \`k+1\`, \`2k\`, \`2k+1\` MT draws between published bytes.

The code produces the first 1,200 MT words per seed and compares the exact source sequence. **No CPython-MT candidate reproduces even five original successive bytes** under any tested setting. The best original match is **4 bytes** (seed \`1388819658\`, start offset 772, low byte lane, clock \`k\`). A same-length planted source generated from seed \`1389003301\`, offset 367, high-byte lane and clock \`k+1\` is reconstructed **17/17 exact**. A separate C++ \`std::mt19937\` test with only startup offsets 0–8 across the same 777,600 timestamp seeds and 4 byte lanes had no 4-byte original match, while an independent plant recovered 16/16 bytes.

Reproducer: [\`sims/onion2_python_mt2014_timestamp_gate.cpp\`](../sims/onion2_python_mt2014_timestamp_gate.cpp), standard C++17, no packages, no repository writes. The source-matching test was compiled and executed against original historical bytes and clock values; runtime about 8.5 seconds on the local test machine.

## Decision and remaining possibilities

**No tested 32-bit LCG nor tested 2014-time-seeded CPython Mersenne Twister explains the complete observed original byte/timing behavior.** These are *finite exclusions of proposed historical data-generation mechanisms*, and carry no implication that Liber Primus itself uses either cipher family.

A stronger original-source approach is to identify the actual server-side random generator, its publication algorithm, and whether the 256 bytes were generated up front or streamed at reveal time. Historical evidence might then permit reconstruction of absent time intervals or a missing underlying keystream. Unknown CSPRNGs, higher-entropy seeds, unknown startup offsets beyond 900, independently random reveal schedules, nonlinear byte encodings and different code paths remain untested. Repeating direct additive GP29 ciphertext sweeps against these 256 bytes would duplicate already negative research and is not justified by these state tests.

**Manuscript status:** the 56 unsolved LP2 pages still have no verified recovered plaintext or key from this research lane.

