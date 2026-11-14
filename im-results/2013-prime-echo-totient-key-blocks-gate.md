# 2013 prime_echo totient-key blocks: bounded original-cipher negative

**Status: 14 November 2026. Two bounded source-derived prime schedules tested on original LP2 (direct repeated blocks, and a distinct 58-page × eight-prime schedule). Neither recovered unknown plaintext, an authentic key, nor an authored instruction.**

## Solve-path hypothesis

The original 2013 boot-image prime_echo program emits 464 primes in ascending order, from 2 through 3301, and visibly pauses after 1033 and 3301. The repeated 1033/3301 operator pair is independently present in the Cicada historical chain and LP1 magic-square material. Their one-based prime ordinals are 174 and 464; these are 6×29 and 16×29. The source-marked blocks therefore contain 174 primes (2 through 1033) and 290 primes (1039 through 3301), each a whole number of Gematria Primus alphabet cycles.

A solver could reasonably ask whether this prime stream is intended as a direct repeating key. The solved LP2 p56 page supplies an authentic nearby operation: subtract the totient of successive primes modulo 29, with plaintext F passed through without consuming a key symbol. This test freezes that operation and the source-defined prime blocks; it does not search key offsets, signs, multipliers or reset clocks.

## Frozen inputs and validation

- Original prime source: [cicada2013-os-original-prime-echo.sh](../resources/historical/cicada2013-os-original-prime-echo.sh). The reproducer extracts all 464 literal prime outputs and asserts the pause values and their ordinals.
- Original LP2 transcription and canonical rune corpus: [lp2-transcription.txt](../resources/liber-primus/lp2-transcription.txt) and [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json).
- Fixed English word-frequency control: [english_wordfreq_textblob.txt](../resources/control/english_wordfreq_textblob.txt).
- The first 2,896 printed words flatten to exactly 12,956 runes and match original pages 0–55 rune-for-rune. Page 50 contributes no runes. The parser removes visual line-wrap slashes, whitespace and page markers while retaining printed word boundaries, including the cross-page word carry.

## Exact hypotheses

For a key prime p, the tested inverse is:

\[
P_i = (C_i - (p_i - 1)) \bmod 29.
\]

The key value is the prime totient p−1 reduced modulo 29. The source-fixed candidate periods are:

1. **Full stream:** all 464 primes, repeated from prime 2.
2. **First marked block:** the 174 primes from 2 through 1033, repeated.
3. **Second marked block:** the 290 primes from 1039 through 3301, repeated.

For the transparent-F version, every ciphertext F is exhaustively branched as either literal plaintext F (no key advance) or encrypted non-F. Every key-consuming position that would decode to plaintext F is forbidden, because the known forward encoder passes plaintext F through unchanged. A Boolean reachability dynamic program tracks every possible key phase and every F interpretation; it does not use an English dictionary to prune paths. The stream starts at phase zero and continues across all pages and words without resets.

A second control applies ordinary repeating Vigenère with the same three fixed key blocks but no F bypass. It uses no fitted phase.

## Positive control

The independently established p56 plaintext is:

> AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE

Its 85 runes re-encrypt exactly with the first 85 prime totients from the original prime_echo list. The five ciphertext-F positions are 35, 47, 51, 56 and 74; only plaintext position 56 is a literal F, so 84 key symbols are consumed. This matches the established [p56 regression](../sims/authentic_lp2_p56_totient_regression.cjs).

## Results

### Transparent-F exact feasibility

All three source-defined periodic keys lose every legal path inside the first physical page:

| Key block | First impossible word (0-based) | Rune offset | Cipher word | Surviving phase(s) | Exact contradiction |
|---|---:|---:|---|---|---|
| Full 464-prime stream | 52 | 235 | HC | 231 | At offset 235, ciphertext H (GP index 8) meets prime 1459, giving shift 8 and forcing plaintext F from a non-F ciphertext |
| First 174 primes | 47 | 211 | OEDMO | 33 | At offset 211, ciphertext OE (GP index 22) meets prime 139, giving shift 22 and forcing plaintext F |
| Final 290 primes | 18 | 83 | IAEHXTHPG | 79, 81, 82 | Each surviving phase forces plaintext F from a non-F ciphertext: phase 79 at offset 87 (TH, index 2, prime 1627); phase 81 at offset 84 (AE, index 25, prime 1621); phase 82 at offset 88 (P, index 13, prime 1667) |

These are structural impossibilities under the specified encoder, not merely poor language scores. The failure words contain no ciphertext F, so no alternative literal-F mask can rescue the failing step.

### Ordinary Vigenère without F bypass

The fixed TextBlob GP lexicon recognizes 201 of the 2,896 raw ciphertext words. The three ordinary Vigenère outputs recognize 204/2,896 (full 464), 197/2,896 (first 174), and 213/2,896 (final 290). Their opening rune strings remain visibly nonlinguistic; index of coincidence remains near the 1/29 uniform baseline. All three arithmetic inverses re-encrypt exactly, which is a consistency check, not evidence of plaintext.

## Additional original six-page prime rows (Agent14, 14 November 2026)

A source-motivated distinct row assignment avoids the p50 obstacle to the proposed final 16-page tableau: the original **p27–p32 visual chapter spans six complete rune-bearing physical pages**, while the independently recovered 2013 ISO `prime_echo` first pauses after **174 = 6 × 29** printed primes, ending with 1033. The candidate splits exactly those first 174 primes into six consecutive GP29 rows and assigns one row to each source-ordered p27–p32 page, restarting the 29-position clock at the start of its page. Use only the authentic p56 known operation `P = C − (φ(prime)−1) mod 29`, and exhaust every permissible ciphertext-F branching (literal plaintext F with no key consumption, or ordinary key-consuming encryption of non-F). This is a *conditional original-cipher hypothesis*, since the original 2013 script does not command application to p27–p32 or per-page row reuse.

Exact original dynamic-programming reachability produces **no legal decoding on any of the six unmodified pages**, regardless of word dictionaries, source plain cribs or language scoring. Every contradiction is a non-F ciphertext that necessarily decrypts to plaintext F, which the genuine source encoder cannot produce at a non-F ciphertext position:

| Physical page | Original runes | First impossible local offset (0-based) | Original ciphertext GP rune | Prime at impossible position |
| ---: | ---: | ---: | --- | ---: |
| p27 | 234 | 33 | I | 11 |
| p28 | 269 | 9 | NG | 167 |
| p29 | 277 | 4 | T | 307 |
| p30 | 263 | 38 | S | 509 |
| p31 | 269 | 52 | P | 797 |
| p32 | 121 | 9 | W | 907 |

The same original ISO primes and source-native spellings exactly reconstruct the complete solved p56 ciphertext (**85/85 runes, 84 key entries consumed**). Ordinary no-skip additive inversion round-trips all **1,433 original p27–p32 runes**, but leaves a near-uniform **IoC 0.03452634820882081**, without meaningful plaintext. Complete [CommonJS original-input SFT](../sims/lp2_2013_prime_echo_sixpage_row_sft.cjs) freezes the page lengths, row selection, first contradiction on each page, and p56 known positive.

**Decision:** retire this *specific* six-page, six-row prime-totient direct transfer without a 100-rune plaintext probe: it is structurally impossible by rune 52 on every page, and any alternative interpretation would require a new external clue selecting different row, clock or operation. Preserve the coincidence as source-conditioned, not an authenticated 2013→2014 instruction. This expands the finite exclusions below without establishing an original unknown LP2 key or plaintext.

## Cross-round 464 primes → 58 physical pages × eight table columns (Agent23, 14 November)

A previously untested, more explicitly page-local consumer arises from three independent preserved period artifacts. The 2014 Stage11 distributor [original HTML](../resources/cicada2014-onion7-index.html) contains exactly \`<title>133</title>\`, \`<div id="331">\` and 58 numbered image references \`0.jpg\` through \`57.jpg\`. The signed-era 2013 original \`prime_echo\` script prints exactly **464** successive primes, 2 through 3301. The LP2 pp49–51 printed numeral table contains **eight** columns. The source-level cardinalities meet the identity **133+331 = 464 = 58×8**. This may look like a player-readable key schedule, but **no author-supplied instruction equates the HTML numbers, prime positions, page numbers and grid width**. In particular, the 464th prime is 3301 by elementary prime enumeration, and the HTML numbers were selected retrospectively among other historical numbers. The equality is a hypothesis generator, not proof of intended cryptography.

Freeze a concrete interpretation before looking for English: read 58 groups of eight consecutive source primes \`p[8*page..8*page+7]\` and give each physical LP2 image its own **restarting** eight-shift key \`K[j] = (p[j]-1) mod29\` (the genuine solved-p56 prime-totient operation). Include the numeral-only physical p50 as a page with its own eight primes and **zero rune outputs**, preserving the source HTML image numbering. Within each page, cycle the eight key values; plaintext GP-F is transparently emitted as ciphertext GP-F and consumes no key, exactly as in solved p56. Every ciphertext F may therefore represent either literal F without key advance, or encrypted non-F with key advance; an eight-phase dynamic program retains **every** legal branch. No Caesar offsets, key shifts, unexplained markers, page permutations, or English score pruning are fitted.

**Original-cipher result:** **53 of 55 rune-bearing unknown physical pages are mathematically impossible** for this direct cipher, even with the complete unknown F mask enumerated. The two syntactically admissible pages are **p0** (262 runes; ending legal phases 0,6,7) and **p15** (159 runes; ending phases 3,4), without a recovered language phrase. Twelve of the first fifteen pages reach an unavoidable non-F→plaintext-F contradiction by original local rune offset 64 or earlier; p1 and p2 fail later (135,196); p0 alone survives. The resolved **p56** and cleartext **p57** fail this proposed transferred eight-prime rule by local offsets **6** and **2**. Their actual original methods differ, so this latter check is context rather than a universal exclusion. Ordinary no-skip subtraction produces uniformly distributed, nonlinguistic output rather than an obvious readable key.

The independent **native GP positive plant** preserves all **58 source physical-page rune counts**, including p50 with zero runes: it builds a 13,136-rune source from repeated known original p57 cleartext, encrypts under the proposed independent eight-prime key for every page, and accepts all **58/58** encrypted page streams through the same complete F-branch DP, including every genuine plaintext F. This demonstrates the rejection of the original is substantive rather than a clock or branching error. The [source-exact single-runnable CJS](../sims/lp2_2013_2014_prime464_58page8_sft.cjs) asserts the historical HTML, the actual 464 original prime literals, all source page counts and eight numeric columns; its [Windows Node22 run 43651426530](https://github.com/FlareZ123/liber-primus/actions/runs/43651426530) passes.

**Decision:** retire the direct page-reset eight-prime **\`φ(prime)\` additive/F-transparent inverse** as a complete LP2 English decipherment. Keep **133+331=464=58×8** only as an observable cross-source relationship requiring an independently authored key assignment or different reversible operation before more derived searches. It does not rescue the already-rejected continuous/174/290-prime arrangements, nor rule out unrelated uses of historical prime material.

## Decision

Reject these three direct repeated prime-totient key readings: the full 464-prime stream, the 174-prime block ending at 1033, and the 290-prime block from 1039 through 3301. The p56 positive control confirms that the known prime-totient/F-bypass implementation is functioning.

The six-page p27–p32 29-prime-page-row transfer is also impossible under the original p56 F bypass, as shown in the independent source-conditioned analysis immediately above. No authentic unknown plaintext has been recovered. The separately derived 58×8 consecutive-prime page schedule likewise fails on 53/55 untouched unknown pages under exhaustive F-bypass branching; the two locally F-feasible pages supply no authenticated plaintext.

This does **not** rule out other uses of the prime_echo material, a different source-authenticated transformation, a different key schedule, or a relationship between 1033/3301 and other visible objects. The prime counts being multiples of 29 are a source-linked structural observation, not an authored instruction to use these values as a repeating key. Do not expand into arbitrary phase, reverse-order, word-reset, page-reset, multiplier or alternate-radix variants without a new independent source selector.


### Source-fixed p55-only reset follow-up (Agent17, 14 November 2026)

The global no-reset and p27–p32 six-page results above do not exhaust p55-specific mappings. A separate original-input test now checks (a) seven source-fixed 75-prime windows selected by the p05 1033/3301 boundaries and the 2016 image prime ordinals 103/104, and (b) the **16 p55 words against the 16 consecutive 29-prime blocks** in the 464-prime stream. The latter is a word-local reset hypothesis; the p57 circumference instruction also motivates an interior-only version. Both 16-word versions are structurally impossible under the p56 F bypass: full words fail at word 3/rune 2 (M, prime 281, shift 19 → F), and interiors fail at word 4/rune 4 (TH, prime 467, shift 2 → F). Without F bypass, their IoCs are 0.034955 and 0.032115, not English. The seven p55 75-prime windows likewise produce no plaintext. See the [consolidated p55 report](lp2-p55-moth-p5-terminal-sevenword-crib.md) and its [reproducer](../sims/p55_prime_echo_boundary_window_sft.cjs). These source-fixed p55 tests do not change the global conclusion: no unknown plaintext or authentic p55 key was recovered.


## Reproduction

Run from the repository root:

    node sims/lp2_2013_prime_echo_totient_key_blocks_gate.cjs

The script uses only Node.js built-ins and the four frozen repository inputs above. It asserts the source counts, exact transcription/corpus identity, p56 positive control, all three transparent-F failure witnesses and the ordinary-Vigenère dictionary counts.
