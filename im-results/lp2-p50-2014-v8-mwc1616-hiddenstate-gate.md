# Original LP2 table: complete 2014 V8 MWC1616 hidden-state recovery gate

**Agent46, 16 November 2026. Classification: original-input, historical-algorithm, complete finite state-recovery negative for the declared byte readouts. No unknown LP2 plaintext, authentic key, cipher or destination has been recovered.** Reproducer: [single-file Node.js 22 CommonJS SFT](../sims/lp2_mwc1616_p50_sft.cjs).

## How this could have recovered a key

The unchanged numeric grid on physical LP2 pp49–51 has **32 printed rows × 8 columns = 256 base60-coded bytes**, apportioned **10/13/9 rows** across the three original images. Its complete source-derived byte SHA-256 is **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**. If those 256 opaque bytes were consecutive observations of a reproducible short-state generator, we could recover its hidden initial state and generate a much longer prospective manuscript key. That would be a causal route to decipherment without a freely fitted English crib. There is no original authorial instruction choosing a PRNG, so this is a bounded possibility rather than an intended mechanism.

The historically specific candidate is **MWC1616**, the original V8 JavaScript Math.random generator used through late 2015, including the Liber Primus publication era. V8 documents it independently in its [17 December 2015 first-party technical explanation](https://v8.dev/blog/math-random). It maintains two independent 32-bit multiply-with-carry states with multipliers **18030** and **30903**; each iteration updates the low-16-bit word multiplied by its multiplier plus the old high-16-bit carry. The 32-bit output concatenates the low 16 bits of the two resulting state words. This is a *carry-bearing*, non-GF(2)-linear generator, and is not included in the separate [source 125-bit linear-state obstruction](grid-truncated-xorshift32-original-state-gate.md).

## Exact secret-state inverse, with independent unguessed predictions

Under the direct historical JavaScript interpretation, a producer could have emitted each grid cell using the high output byte, as in Math.floor(Math.random()*256). That byte is bits 8–15 of the first half-state's low 16 bits; it contains no contribution from the second half. We also grant any of the other three native eight-bit lanes, comprising high and low bytes of each 16-bit half, instead of privileging one. The first observed byte fixes eight of the low sixteen bits of its half-state. The remaining eight bits have **256** possibilities; the upper sixteen carry bits have only **18030** or **30903** reachable possibilities. Therefore it is possible to exhaust **exactly 4,615,680** or **7,911,168** hidden states for every candidate byte stream, match the original first byte by construction, and forward-predict the entire remaining 255-byte original sequence without language scoring.

The six source-geometry readings are printed row-major, alternating row-snake, global column-major, alternating global-column snake, image-page-local columns respecting the original 10/13/9 source row distribution, and alternating page-local columns. Six exact reversals are separately included. With four output lanes this is **48 complete native-byte hypotheses**, not a search over tunable hidden output taps.

A different plausible source format is packed output: each PRNG invocation yields one native 32-bit value written as four successive bytes, in big-endian or little-endian order. Two consecutive observed 32-bit outputs **algebraically determine both unknown high-16-bit carry values**:

~~~text
carry0 = (next_low16_state0 - 18030*current_low16_state0) mod 65536
carry1 = (next_low16_state1 - 30903*current_low16_state1) mod 65536
~~~

A true reachable MWC state requires carry0 below 18030 and carry1 below 30903. If both pass, the first two words fix the complete 64-bit state, allowing blind prediction of every remaining byte. The SFT exhausts the same twelve printed readings and both endian choices, or **24 native packed-output hypotheses**.

## Exact original results

| Original grid order | Hidden first-half states matching first three high-byte outputs | Matching first four | Matching first five | Matching all 256 |
| --- | ---: | ---: | ---: | ---: |
| Printed row-major | **124** | **0** | **0** | **0** |
| Global column-major | **47** | **0** | **0** | **0** |
| Reversed row-major | **71** | **1** | **0** | **0** |
| Other nine source geometries, individually | 47–142 | **0 in each** | **0 in each** | **0 in each** |

The same first-four/fifth-byte failure holds when the other three native MWC byte lanes are used. Over all **48 original-lane cases**, only **two** secret states reach four source bytes, one each for the first-half low/high lane on reversed row-major; both fail at the **fifth** byte. No complete state exists.

For all **24** packed-output cases, only reversed global column-snake is consistent with its first **two** complete 32-bit words, under both byte endian conventions. Those two uniquely recovered 64-bit candidate states immediately fail on the **third** word; the largest packed source-prefix match is exactly **8 of 256 bytes**. Every other original packed interpretation is inconsistent at its second word. No serialized full-byte generator survives.

**Constructive positive controls:** With two independently frozen 32-bit after-output state seeds, **0x1395C7A5** (first half) and **0x391852BF** (second half), the identical exhaustive solver recovers the *exact original seed uniquely* for each of four planted 256-byte lane streams, and independently recovers *both full 32-bit states* in both little- and big-endian planted packed streams. It predicts **256/256** bytes for every one of the six planted streams, while the same code fails on the unchanged table. Thus the negative is a functional hidden-state recovery result, rather than a failure to search enough initial seeds.

## Research decision

**Retire a direct 2014 V8 MWC1616 origin for these 256 printed bytes under all 72 declared source-native output/geometry specifications.** The original table does not leak a usable key from this historically authentic generator in the defined model. Variable skips, unknown output masks, reseeding, mixed or encrypted byte streams, and other PRNG algorithms are outside these finite exclusions and cannot be justified merely because this attempt failed. In particular, there is no reason to expand to arbitrary offsets or multipliers without a new creator-visible operation or genuinely new original bytes.

The project should continue seeking an author-selected key/decoder or recoverable external plaintext rather than using this PRNG family to fit speculative LP2 ciphertext. This is an intermediate original-cipher source decision; it does **not** change the established 56-unknown-page status in [results/README.md](../results/README.md).

**Reproduce:** On Windows 11 with Node.js 22, run **node sims/lp2_mwc1616_p50_sft.cjs** from repository root. The standalone script reads only the pinned source grid, validates the exact original 256-byte digest, executes both complete hidden-state attacks, confirms all six positive plants, and writes no files.
