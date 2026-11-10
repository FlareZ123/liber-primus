# 2016 "Epiphany" as a human clue to the 2014 onion path

**Classification:** source-grounded solve-path hypothesis; not a recovered key or plaintext.

## Source-visible sequence

1. The verified 2016 signed message contains the exact lines:
   - “The path lies empty; epiphany seeks the devoted.”
   - “Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.”
   - “Beware false paths. Verify OpenPGP 7A35090F.”
2. The archived 2014 puzzle record opens with “cca 07:30 GMT 6th JAN 2014.” The date is Epiphany (6 January).
3. The 2014 second onion, cu343l33nqaekrnw.onion, displayed the HTML comment “Patience is a virtue” above a 256-byte string that grew over time in five-minute-multiple intervals. The archive says the process continued for approximately 23 hours.
4. The next onion, fv7lyucmeozzd5j4.onion, initially showed a blank page before a string appeared and grew. Its Apache status page was also exposed.
5. The 2016 message's “path lies empty” can therefore be read as a pointer to the initially blank 2014 onion path; “epiphany” points to the 6 January 2014 round date; “devoted” echoes the patience demanded by the growing-string phase. “Liber Primus is the way” then directs the solver back to the manuscript rather than to an arbitrary physical destination.

This is a substantially more clue-constrained historical route than interpreting the GP primes as British A-road numbers. The latter mapping is non-discriminating: all 29 GP prime weights have corresponding A-road numbers (see im-results/2016-a-road-inveraray-route-audit.md).


## Timing chronology and the byte-143 boundary

The merged timing corpus starts at byte position 143, not at byte 1. It has 112 explicit intervals for positions 143–189 and 192–256, plus a bounded two-interval bridge at positions 190–191 with combined value six five-minute units. The explicit values sum to 234 units; with the bridge, the recorded suffix from byte 142 to byte 256 spans **20 hours**.

The explicit cells at positions 160–256 sum to 16h20; including the bounded bridge at positions 190–191, the full length-159-to-256 span is 16h50. The BotSottile log's first observation at length 159 (12:39) and final observation at length 256 (05:10 the next day) span 16h31, 19 minutes shorter than that merged interval sum. This is a coarse consistency check, not independent validation if the merged cells derive from the same log.

The 2014 archive says the process lasted approximately 23 hours and the document changed at 05:31:40 GMT about an hour after growth stopped. The recorded 20-hour suffix leaves roughly three hours outside the interval corpus. The first 142 bytes have no timing evidence. A possible interpretation is an initial static period with a 142-byte prefix already present, followed by the timed append phase at byte 143; the archived description that the page initially appeared static is compatible with this, but it is not established. Do not infer a five-minute schedule for positions 1–142.

This boundary motivates testing a PRNG stream that begins at byte 143 rather than assuming the 256-byte string was generated from its first byte.

A distinct [source-clock distribution and witness-boundary test](../im-results/onion2-five-minute-clock-inference.md) now constrains the publication schedule independently of byte-generator seeds. The 112 observed delays have length histogram **[46, 33, 21, 5, 4, 2, 1]** ticks for lengths 1–7, summing to 234 ticks. A stationary uniform 1–7 tick scheduler yields an exact lower-tail probability **7.686 × 10⁻²⁷** for this sum. A geometric five-minute-trial process with fitted success rate **112/234** gives grouped goodness-of-fit χ²≈**5.773**, p≈**0.0558**, and therefore remains a plausible *marginal clock model*. However, the earliest 40 observed gaps average **2.475** ticks versus **1.875** for the later 72; an exact conditional fixed-boundary permutation upper tail is **0.01124**. This archival boundary also marks a change in witness coverage, so it cannot establish a historical server-process change. These new constraints challenge uniform-delay PRNG interleavings while leaving byte selection and any LP2 key role unidentified. Reproducer: [read-only CommonJS SFT](../sims/onion2_five_minute_clock_sft.cjs).

## A source-derived 761 → 6 arithmetic bridge

The 2014 comment is not merely a generic patience phrase. Under the published GP letter values:

**PATIENCE IS A VIRTUE = 761.**

761 is the 135th prime, and:

\[
\varphi(761)=760=29\cdot26+6.
\]

Thus the 2014 “devoted/patience” clue supplies a prime (761), while the 2016 “epiphany” clue supplies 6 January; the already-solved p56 mechanism uses φ(prime) modulo 29. This is a plausible selector for a six-step or p135-start interpretation, but it is not proof that the p56 cipher transfers.

Do not duplicate broad tests already in the repository:
- sims/audio761_numeric_prng_seed_probe.cjs includes 761 among source-derived seeds and tests six common 32-bit PRNG families over all 12,956 original LP2 runes.
- sims/prime_totient_long_offset_inversion.py tests two million prime-start offsets for direct transfer of the solved p56 φ(prime) key; the p135 start corresponding to 761 is inside that search.

The existing 761/LCG-A/rankCyclic/page-reset/sign+ candidate was independently scored with a GP29 Shakespeare trigram model. Its score is **−6.2546**, versus **−6.2960** for raw LP2 and **−6.3025** for one random control; among the 960 seed/PRNG/clock/mode/sign combinations in the existing 761 probe, this candidate ranks **48th** by trigram score. Its decoded rune stream is visibly non-linguistic. The existing unigram winner is therefore not plaintext evidence.

The 761→p135 idea is not an untested gap, and the obvious direct seed/prime-start transfers are not currently promising. Any future use of the 6 residue must be distinguished from these tested transfers and must have a source-visible rule fixing its role.

## Default Perl seed test (newly completed)

Perl 5.14.2 does not necessarily seed rand() from the clock. In the tagged source, pp_rand() implicitly calls seed() on first use, argument-less srand() also calls seed(), and Perl_seed() reads a U32 from /dev/urandom by default unless that facility is disabled or unavailable. A representative Unix configuration selects drand48/srand48. The exact onion-2 runtime and host are still unknown, so this was tested as a plausible model, not asserted as fact.

An exhaustive affine-state search covered the complete 32-bit seed space. It tested:
- direct int(rand(256)) and int(rand(255)) streams from byte 1 (all 256 bytes);
- interleaved int(rand(7))+1 timing draws and byte draws from byte 1 in both orders;
- the source-supported alternative that the timed stream begins at byte 143, testing all 114 suffix bytes and the 31 multi-witness intervals at positions 152–182, for both direct and interleaved output.

The full-string and suffix searches all returned **zero complete matches**. Positive controls recover a planted seed exactly once for the direct and interleaved models, including both suffix start arrangements. The detailed counts and reproducible implementation are in im-results/perl-drand48-onion2-time-seed-search.md and sims/perl_drand48_onion2_urandom_seed_search.cpp.

This rejects the simple default Perl drand48 models at the two supported start boundaries, not Perl generally. It does not test an unknown pre-loop burn-in, a different backend, explicit custom seeding, separate timing and byte generators, or a cryptographic random source. Do not broaden the seed sweep without evidence for one of those alternatives.

## What this does and does not establish

**Established from archived sources:** the 2016 message is signed; the 2014 round's archived start date is 6 January; the second onion had the patience comment and timed 256-byte growth; the third onion initially showed a blank page; and the phrase's GP value is 761.

**Mathematical derivation:** 761 is prime number 135 and φ(761) mod 29 = 6.

**Computational result:** the tested explicit-time and exhaustive-default Perl drand48 models do not reproduce either the full 256-byte stream or the source-supported 114-byte suffix beginning at position 143, with or without the tested interleaved timing schedule.

**Hypothesis:** the 2016 “Epiphany / empty path / devoted” wording intentionally sends a human solver back to the 2014 onion sequence and especially its timing channel as a possible source of key material or a route into LP2. The 761→6 relation may identify a transition within the 29-rune system.

**Not established:** that the 2014 timing channel is an LP2 key; that the 2016 message specifically selects the 256-byte string rather than another part of the 2014 path; that onion 2 and onion 3 shared a host or Apache parent; or that the published “approximately 23 hours” description and surviving timing samples give a complete, mutually consistent absolute chronology.

## Best next test

Freeze the historical selector before trying new cipher families:

- Treat 6 January as the date anchor, not an adjustable seed.
- Identify which exact 2014 path was initially empty (the third onion is explicitly described as blank on first visit).
- Distinguish the served 256-byte values, the five-minute interval sequence, and the later 1033 / server-status material; do not mix them into one unconstrained key.
- Recover the initial length and first captured timestamp for onion 2. The timing corpus starts at byte 143 and spans 20 hours; the 23-hour narrative may include an initial static period or different start/stop boundaries. Do not assume positions 1–142 followed the same five-minute schedule.
- If the 761→6 relation is used, define in advance whether 6 is a rune-ring displacement, a key phase, or another specific state. Do not search these interpretations post hoc.
- Do not repeat the tested Perl time-seed or default drand48 seed searches at byte 1 or byte 143. Continue generator recovery only if a contemporaneous source identifies the actual language, backend, or a different draw schedule; otherwise treat the 2014 stream as historical context rather than established LP2 key material.
- Require an exact original-ciphertext inverse and withheld-page validation before promoting any key hypothesis.

The existing direct interval-stream sweep and the new Perl seed searches are negative for their stated models. That does not rule out the historical clue, but the next step must supply a source-derived selector rather than another unconstrained cipher grid.

## Source links

- 2016 signed-message transcription: https://github.com/scream314/cicada3301/blob/master/2016.md
- 2014 round chronology and second/third onion descriptions: https://github.com/scream314/cicada3301/blob/master/2014.md
- Original stage-3 archive and README: https://github.com/scream314/cicada3301/tree/master/assets/2014/stage03
- Archived onion-2 timing witnesses and reconciliation: https://github.com/Dukotah/cicada3301/tree/master/liber-primus/analysis/round43/F5-stored
- Timing-channel negative result and coverage limits: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5bT-timing-keystream/RESULTS.md
- Perl 5.14.2 pp_rand / pp_srand: https://github.com/Perl/perl5/blob/v5.14.2/pp.c
- Perl 5.14.2 default seed implementation: https://github.com/Perl/perl5/blob/v5.14.2/util.c
