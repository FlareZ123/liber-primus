# 2013 terminal missing-prime transcript versus original CicadaOS shell and LP2 terminal table

**Decision (14 November 2026): A coincident 180-slot lead is not yet an author-selected key.** A 2013 *participant transcript* of a Cicada terminal `primes` response omits 180 consecutive ordinal primes, p21–p200. This matches the LP2 32×8 table's strict **180-cell interior** and the combined **180 known runes** on solved p56–57. However, a separately preserved **2013 CicadaOS live-image `prime_echo` shell script explicitly emits all 180 supposedly missing primes** in its original order. Its ten-primes-per-line format shows the participant transcript drops **exactly 18 complete printed lines**. That transcript also omits the script's terminal prime p464=3301. These are concrete indicators of a possibly incomplete copy or differing remote-terminal implementation. They remove the basis for treating the omissions as a securely source-selected 180-element key.

No unknown plaintext, source-authenticated key, full terminal-table decoder or destination is recovered.

## The historical upstream premise, directly tested

Two separately preserved 2013 witnesses differ:

1. [CicadaOS local live-image shell script](https://github.com/krisyotam/cicada3301/blob/main/puzzles/2013/cicada-os/Cicada%20OS%20-%20Bash%20script%20from%20live%20image.txt) (`Cicada OS - Bash script from live image.txt`, Git blob SHA1 `0a85a310c3497ff8cc086eab546f1c7000efc1ed`): contains **464 exact consecutive prime `echo` commands** from 2 through **3301**. At ordinal p10=29, p20=71, p30=113 ... p200=1223 ... p460=3257, an `echo` without `-n` inserts a line break. All other values, including p21=73 through p200=1223, are printed. Thus each sequence of ten original prime values is an author-supplied display row; the missing p21–p200 is 18 full display rows, precisely.
2. [2013 participant terminal transcript](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md): contains **283** recorded primes in correct sequential order. Precisely 181 shell-script primes are absent: **all 180 of p21–p200** (73..1223) and **final p464=3301**. The displayed sequence is p1–p20 followed by p201–p463; no other values are wrong or out of order. [A second community compilation](https://github.com/krisyotam/cicada3301/blob/main/liber-primus/analysis/HINTS-NEVER-USED.md) gives the same central gap but includes 3301. These transcriptions are not verified as independently recorded raw packets.

Both witness formats are historical community preservation rather than a surviving Cicada PGP-signed execution trace. A remote telnet implementation **could** have intentionally omitted the 18 ten-prime rows while the local CicadaOS script printed them; no surviving server code or multiple raw independent terminal recordings select that explanation. Missing a full block of displayed lines and, in one copy, the last token equally fits transcription/capture truncation. **Do not count 180 omitted primes as an authenticated authorial clue until this ambiguity is resolved.**

## A numerical LP2 match remains, with major dependencies

- The original LP2 pp49–51 32×8 printed byte table contains **76 exterior cells** and **180 strict interior cells** (physical row-major interior r1..30, c1..6). Its 256-byte source representation is `resources/liber-primus/lp2-grid-256.json`, SHA256 of the 256 numeric bytes `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.
- The original terminal p55 has 76 ciphertext runes; solved p56 has 85 printed encrypted runes, solved p57 has 95 clear runes; together **85+95=180**. This relationship was already known independently of this investigation. The 76+180 split and the terminal length equality are not statistically independent after fixing the grid.
- The 2013 `761.MP3` ID3 PARABLE clauses have GP-prime sums **1259=p205**, **1031=p173**, **1229=p201** (verified elsewhere in the [2013 source register](../im-results/source-register-benchmark.md)). The first displayed value after the participant's 18-row omission is thus 1229, a PARABLE sentence sum, but that additional matching was **noticed after selecting the 180-prime gap**. With no evidence the author designed the remote omission, the coincidence does not select a cipher.

## Frozen original-terminal test of the simplest historical consumer

The known LP2 p56 decryption uses the successive-prime totient step `(p−1)%29` with one source-authenticated plaintext F bypass. To test the 180 missing primes as a possible operand without fitting original unknown pages, derive ascending p21..p200 and form their 180 totient steps. Compare each strict inner grid byte modulo29 with `knownTerminalRune ± step mod29`, reading grid cells in physical row-major order. There are exactly two source-distinct terminal targets: authentic p56 *plaintext* followed by clear p57, and as-printed encrypted p56 followed by clear p57.

| Known target | Sign | Exact slot matches | At least this many original table remainders must change, even allowing any permutation |
| --- | ---: | ---: | ---: |
| Authentic p56 plaintext + clear p57 | subtract | 8/180 | 46 |
| Authentic p56 plaintext + clear p57 | add | 4/180 | 47 |
| As-printed p56 ciphertext + clear p57 | subtract | 4/180 | 43 |
| As-printed p56 ciphertext + clear p57 | add | 5/180 | 46 |

The lower bounds use an exact histogram mismatch; no traversal of the 180 source table remainders can produce the hypothesized full known target with these *ascending fixed steps*. The test is a conditional negative for one historically attested direct operation, **not** evidence against every nonlinear/table interpretation.

**Reproducer:** [Node22 self-contained original-data SFT](../sims/lp2_telnet_missing180_terminal_grid_sft.cjs). It checks the original grid-byte SHA256, exact shell gap ordinal endpoints, known p56 plaintext and transparent-F clock, terminal lengths, and all four full-180 negative comparisons. Historical source-script and terminal-copy locations are pinned in the report above.

## Present frontier and no-repeat decision

Before investing in a cipher based on the 180-prime omission, recover a **source-original remote terminal recording or executable** establishing that the 18-row deletion was deliberate and expected a solver's use. The present original-image numeric matches alone cannot select an inverse. Without that evidence, the 2013 missing-prime key hypothesis should be treated as **blocked at its historical premise**, and no more prime-phase sweeps are warranted. The 2013 local script provides a complete ordinary consecutive-prime alternative explaining why a solver would see the numbers at all.
