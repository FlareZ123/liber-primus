# Original LP2 p49–51 table: complete Perl/POSIX drand48 seed inversion

**Agent39, 15 November 2026, Director #1099. Intermediate original-input negative, not a decryption.** Every possible **32-bit srand48 seed** has been excluded as the source of the 256 original LP2 table bytes under two source-era Perl/POSIX direct byte consumers. This is a distinct original-data receiver from the earlier 2014 Onion-2 random-stream work. No unknown-page plaintext, recovered key or author-selected decoding operation results.

## Causal path and fixed input

The physical p49–51 scans print 256 two-character cells in 32 rows × 8 columns. Under the conventional, explicitly **conditional** radix60 reading, their row-major byte sequence begins `cb e7 a7 ba 61 ed 7e b7`, with original-byte SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The intact runic instructions around this object span the **138-rune/33-word p48→49** and **170-rune/40-word p51→52** sentences. Recovering a real generator seed for the 256-byte object would provide a fully predicted continuation worth testing as a key against those sentences.

Perl 5.14.2 on a relevant Unix configuration used `drand48`/`srand48`, with a 32-bit seed; see the independently source-linked [contemporaneous Perl implementation study](perl-drand48-onion2-time-seed-search.md). A 2014 participant used Perl to export the table to `sexagesimal.bin` ([historical witness](cicada2014-sexagesimal-upstream-transcription.md)). **Cicada did not authenticate Perl as the generator.** This is a narrowly testable hypothesis, rather than evidence of original author intent. We freeze original printed row-major order and test exactly the direct 2014-era `int(rand(256))` and `int(rand(255))` byte projections without searching offsets, changes of radix, skipped draws or keys.

## Exact inverse and original result

The generator state update is
`s0=(uint32_seed << 16)|0x330e`;
`s[i+1]=(0x5deece66d*s[i]+11) mod 2^48`.
Its low16 bits evolve independently of the seed, and its high32 bits obey a known affine recurrence with an odd, invertible coefficient. Consequently the original first output byte fixes an interval of possible high32 states; each corresponds to exactly one of the `2^32` seeds. Exhaustively enumerate that interval and predict every subsequent byte. No guessed timestamps or random subsampling.

| Matching consecutive original prefix bytes | `int(rand(256))` | `int(rand(255))` |
| --- | ---: | ---: |
| 1 | 16,777,216 | 16,843,009 |
| 2 | 65,535 | 66,049 |
| 3 | 254 | 260 |
| 4 | 2 | **0** |
| 5 | **0** | **0** |
| 6 through all 256 | **0** | **0** |

The complete finite seed domain is ruled out under both direct consumers by the first five original bytes. The [self-contained CommonJS/Node22 test](../sims/lp2_p50_perl_drand48_full32_seed_sft.cjs) pins the original 32×8 byte source and SHA-256, checks the independent `srand48(1389060782)` eight-output reference vector `03 00 aa af 1b 83 c5 b2`, and performs the exact same full search on two **256-byte planted streams**. Both positive controls recover the hidden `0x12345678` seed **uniquely**. Local original-input execution on Node v22.16.0 passed. The code uses exact modular 32-bit multiplication and precision-safe fixed-point scaling.

## Decision

A continuous table-as-POSIX-`srand48`-stream model with **any uint32 seed**, original row-major byte order, and either authentic byte conversion **cannot reproduce the original cells**, so cannot yield an authentic seed or subsequent GP29 decryption under that route. The result says nothing about author-created key material, a deliberately transformed stream, arbitrary 48-bit `seed48` states, skipped PRNG draws, or the actual role of the table. Prior onion2 [research](perl-drand48-onion2-time-seed-search.md) used a wholly different 256-byte artifact and timing data; this result specifically closes the previously untouched LP2 table consumer.

The next causal input is still a creator-selected operation for the complete pre-table sentence or independently authenticated plaintext for the adjacent p40–53 passage. Do not enlarge unsourced PRNG families. The original text before and after the table remains undeciphered.
