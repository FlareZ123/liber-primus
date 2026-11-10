# The 2013 Instar number as an LP2 reversible GP28 cipher seed

**Evidence status (2026-11-10, Agent 20): original-cipher negative within 864 exactly enumerated source-seeded reversible cipher configurations, with a byte-for-byte planted inverse and independently executed Windows CI. No unknown LP2 plaintext, key, or destination recovered.** This is one bounded seed/codec interpretation, not a rejection of any historical connection between the audio and manuscript.

## Source-to-cipher question

The 2013 Cicada OS audio file \`761.MP3\` has been transcribed with the ID3 comment *Parable 1,595,277,641*. The exact integer **1,595,277,641 = 1259 × 1031 × 1229**. The three factors are GP-prime sums of clauses in the historically solved Parable text, a known retrospective arithmetic observation. The original ID3 number precedes LP2 and supplies a genuinely *externally selected 32-bit seed*. We therefore test the four exact integer inputs [1595277641,1259,1031,1229], with no numerical seed fitting to the ciphertext. The link to the source is an hypothesis; the factorization alone does not establish an encryption method.

Original-cipher input: [normalized 55 rune-bearing pages, 12,956 runes](../resources/liber-primus/lp2-corpus.json), physical LP2 page range 0–55, excluding runeless p50, with all page order and repeated rune instances retained. The 8 source section rune lengths are [729,1145,1738,1894,1021,1433,1680,3316].

## Exactly reversible attack

The candidate encryptor treats each page, section, or entire book as a clock-reset segment. One source rune initializes the ciphertext. At each later position, a hypothetical GP-plaintext EA/index28 emits the preceding ciphertext rune verbatim. The other 28 GP letters are encoded into one of the 28 possible *different* next ciphertext symbols. Each 28-way output rank is the current plaintext letter plus or minus a PRNG key digit mod28. The three explicit 28-way reversible rank maps are

1. \`ΔC = 15^(rank) mod29\`, using GP-prime 53's source-supported generator relationship and the red q40=15 field generator;
2. \`ΔC = 1+rank mod29\`, cyclic 28-way excluding the predecessor;
3. \`C = rank if rank < previous, otherwise rank+1\`, sorted predecessor exclusion.

The first map is independently invertible by the discrete log table modulo29. The other two are direct bijections. The 28-way key clock is either actual legacy PHP 5.2.1–7.0 31-bit Mersenne Twister or the precisely implemented 32-bit recurrence \`s=1103515245*s+12345 mod2^32, raw=s>>>1\`; each is seeded with one of the four source numbers and reset as specified. Key digits use \`raw%28\`, \`floor(28*raw/2^31)\`, or \`(raw&255)%28\`. A repeated output may or may not consume a key draw. Additive sign is ±1. These choices total **4 seeds × 2 PRNGs × 3 reset conventions × 3 digit reductions × 3 output rank bijections × 2 EA draw clocks × 2 signs = 864**.

A given candidate decrypts *every original unmarked output exactly*, then reconstructs the original ciphertext exactly by re-encoding its candidate plaintext using original segment-initial rune values. This is a necessary algebraic correctness check, not evidence that any particular candidate is historically genuine. Selection is purely by a fixed GP-English unigram language model trained on the first 30,000 GP-encoded rune tokens of the committed Shakespeare excerpt; no plaintext labels or ciphertext-trained substitution map enter the scoring function.

## Executed original-cipher and source-matched positive

The winning original 864-setting candidate has GP rune-index coincidence rate **0.0353001837**, close to uniform \`1/29\`. Its per-rune GP-English unigram log-likelihood is **−4.2422068692**, whereas the strongest planted true model achieves **−2.9552705128** with rune coincidence rate **0.0612146944**. All four source seeds have similarly weak best original scores; no readable original GP plaintext or cryptographic key is recovered. Literal output repeats are treated as *conditional* EA plaintext anchors in this cipher architecture; their interpretation is unverified on LP2.

A strong end-to-end positive was encrypted with **seed 1595277641**, true legacy PHP MT, per-eight-section resets, scaled28 key, power15 output mapping, unchanged 28 marker, skip-key-on-marker, sign +1. The 864-way blind scan ranked the true full configuration **1/864** and recovered **12,948/12,948 noninitial plaintext runes exactly**. The eight section-first runes are deliberately free initialization parameters. Ciphertext re-encoding, including those eight original IVs, was bit-for-bit exact. The original best candidate also re-encodes the published original ciphertext exactly, confirming the decoder/encoder symmetry without asserting correctness of its plaintext.

Code: [\`sims/instar2013_source_seed_inverse.cjs\`](../sims/instar2013_source_seed_inverse.cjs), importing the audited [legacy PHP MT engine](../sims/php_legacy_mt.cjs), reusing [existing Windows manual workflow](../.github/workflows/agent20-source-prime-inverse.yml). Two successful Windows Node22 workflows: [first run 42801060663](https://github.com/FlareZ123/liber-primus/actions/runs/42801060663), [final checked run 42801579099](https://github.com/FlareZ123/liber-primus/actions/runs/42801579099). The final run includes the exact-original re-encipher assertion.

## Consequence

**The four externally selected integers do not behave like direct source-seeded GP-English 28-ary mod/add cipher clocks under these enumerated models.** Historical audio-to-book arithmetic remains a legitimate clue, but it has no demonstrated key schedule. Further low-value searches over neighbouring 32-bit seeds, alternative arbitrary LCGs, or fresh nonce guesses should be avoided unless independently evidenced. A valuable extension would derive a concrete original-source state transition that explains the strongly suppressed repeated-runic transitions *and* the post-selected lag-five/six echoes, then prove original heldout plaintext can be exactly re-encoded.

This supporting report belongs under \`im-results/\`. It does not change the authoritative \`results/README.md\` conclusion that LP2 unknown plaintext and keys remain unrecovered.
