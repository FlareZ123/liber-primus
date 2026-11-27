# Round 48 silent-symbol models: exact observational equivalence and original-input receiver

**Agent 3 · 27 November 2026.** New external lead: [Dukotah Round 48 M1](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round48/M1-INDEPENDENT-PASS.md), source blob `674d009e4ed1af33453f0d5f18bbc6f3dc2397b6`. The [results](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round48/M1-leak-census/RESULTS.md) report 34–38-symbol remembered-drop chains admitted under the marginal statistics, particularly 35–37. The [actual simulator](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round48/M1-leak-census/census.py) specifies independent deletion, nonzero additive increments and a fixed-probability increment model. **No unknown plaintext or authentic key recovered.**

## Stronger result than finite-sample indistinguishability

Work with the ideal infinite stationary streams underlying the simulation, before its finite oversized-array truncation. Let the observed alphabet have n=29 symbols, latent alphabet size m=n+k, and q denote the chance the next observed rune equals the current rune. Define the transition matrix M(q) to have diagonal q and every off-diagonal (1-q)/(n-1).

* **Z4 remembered silent picker:** from a visible symbol, first enter one of k silent symbols with probability k/(m-1). Given silent entry, the eventual visible exit is uniform over all n labels, by visible-label symmetry. Thus q=k/[n(m-1)]. Each visible exit restores a known current state, so the embedded observed chain is exactly M(q), not merely an approximation.
* **F2 independently delete a fraction d of a strict n-symbol no-repeat chain:** between retained runes, the latent transition count G is geometric with Pr(G=g)=(1-d)d^(g-1). The nontrivial eigenvalue of the strict no-repeat matrix is -1/(n-1). The retained transition matrix is the geometric mixture of its powers, with nontrivial eigenvalue -(1-d)/(n-1+d). Its diagonal is q=d/(n-1+d), and off-diagonal entries are equal.
* **F3 second additive layer:** the strict no-repeat chain's cyclic increment is uniform nonzero modulo n. The independent second-layer increment is zero with probability 1-Q, otherwise uniform nonzero. The sum is zero with probability Q/(n-1); all nonzero sums have the same probability. Increments are independent. The observed chain is exactly M(Q/(n-1)).
* **F1 coin:** the simulator samples independent increments with zero probability q and uniform nonzero otherwise. This is exactly M(q).

Consequently Z4(m), F2(d=(m-29)/m), F3(Q=28q) and F1(q) are **identical finite-dimensional laws on visible rune sequences**, given the common uniform initial distribution. This covers all statistics, not merely the reported six. The rounded integer m values have slightly different fitted q from the LP2-specific coin, and that is their only visible distinction under these models. The finite simulator's array truncation is not part of the ideal model proof.

At D=86 of 12,955 adjacent pairs, q=0.00663836356619. Equivalent continuous d=0.1871163261, Q=0.1858741799 and formal effective m=35.6754612. For all four matched laws the successive equality indicators are IID Bernoulli(q), because conditional equality probability is q for every prior history. **T7 gap autocorrelation cannot distinguish the models.** It challenges their shared stationary IID-increment law, consistent with Round 48's reported failure to generate the measured T7.

### What must be recovered in a hidden-symbol model

Given successive visible runes, a latent path with h>=1 silent events has k(k-1)^(h-1) possible silent label sequences. Each particular path has prior probability (m-1)^(-(h+1)). For unequal visible endpoints the direct path h=0 is additionally allowed. For equal endpoints the direct path is forbidden.

The expected number of silent accepted events per visible gap is k/29. If the latent labels and positions themselves are required for a decoder, the expected conditional entropy per gap is
`(m/29)*log2(m-1) - H(M(q)[row])`.
This follows from the expected path length, the likelihood of each path, and normalization by the visible endpoint probability.

| m | Expected hidden events across 12,955 gaps | Expected conditional entropy (bits) |
|---:|---:|---:|
| 34 | 2,233.62 | 14,053.01 |
| 35 | 2,680.34 | 16,950.29 |
| 36 | 3,127.07 | 19,869.77 |
| 37 | 3,573.79 | 22,810.23 |
| 38 | 4,020.52 | 25,770.65 |

This is a model-specific average entropy, **not** a universal deterministic information bound on LP2 plaintext or on all silent-state ciphers. A deterministic clock with a known key can supply latent history constraints. It is therefore more productive to construct and invert a particular clock than to classify Z4/F1/F2/F3 from rune statistics.

## Source alphabet census

The exact LP1 transcription `resources/transcriptions/lp1_wulfic_canonical.txt` (blob `37c96b816495c5f93ca658a01c9918bf92598316`) contains all ten decimal digits across its non-rune fields, '-' and '.' as word/stop markup, and '/', '&', '$', '%' as layout markup, plus line feeds. Clear source groups 3 and 14 include numerical material; groups 8 and 9 include list numerals 1 and 2; groups 10 and 11 contain no decimal numerals. Corrected LP2 transcription blob `f7b534a33edeb212d427329798438325307463d7` ends with the 95-rune p57 parable, visible word/stop marks, line breaks and end marker. These are normalized transcription categories, not a physical-ink census. Counting digits in numeric grids or treating line and page markup as extra cipher symbols would be arbitrary. The published GP table has 29 rune entries; the known p56 prime-totient cipher acts on runes. No authenticated 35–37-symbol *cipher* alphabet follows from visible formatting.

## Executable known-source Z4-inspired retry encoder

To advance beyond the marginal model, tested a particular deterministic stateful receiver using the independently motivated cuneiform prime interval (after 1033 through 3301; 290 primes), and the solved p56 source's prime-minus-one shift. The proposal consumes one plaintext GP29 rune per emitted rune, so silent attempts are not themselves plaintext deletion. For each plaintext symbol p and each clock step:

1. Compute candidate c=(p+s*(prime-1)) mod m, with s in {+1,-1}; advance the cyclic 290-prime clock.
2. If c equals the last accepted latent symbol, retry p without changing that last symbol.
3. Otherwise remember c; if c>=29 retry the same p, with no emitted rune.
4. Otherwise emit c, consume p and proceed to the next plaintext rune.

With IID uniform shifts, accepted candidates follow Z4; here the actual proposed shifts are deterministic. This is not claimed as the historical cipher, nor is it guaranteed uniquely reversible even with the key. The exact finite-state inverse enumerates every p=0..28 for every prior visible rune and clock phase, simulates each transition until the next emission (or detects a cycle), and propagates every compatible next phase. No English scoring, guessed plaintext, or word constraints. Reachability of the original prefix is exhaustive; path counts are approximate log2 via scaled floating arithmetic, with no numeric underflow in the short original prefixes.

Target: original p33 offset 91 through p39, 1,589 runes, prior original rune index 20. Test both carry-in previous rune and fresh latent sentinel. In each case test fixed phase zero and the superset of all 290 starting phases. Exact maximum compatible original prefix lengths:

| m | sign | fixed phase | any phase |
|---:|---:|---:|---:|
| 34 | + | 12 | 65 |
| 34 | - | 1 | 63 |
| 35 | + | 0 | 61 |
| 35 | - | 13 | 61 |
| 36 | + | 1 | 61 |
| 36 | - | 6 | 58 |
| 37 | + | 5 | 61 |
| 37 | - | 3 | 33 |
| 38 | + | 8 | 61 |
| 38 | - | 18 | 61 |

Both initialization choices yield identical prefix lengths here. **Every possible phase fails.** This is an original-input impossibility for the fixed retry transition, not a generic Z4 exclusion. The 10 matched-length p57-based controls (repeating the real clear parable) all complete and retain their known true plaintext/clock history; none is guaranteed unique. Approximate log2 compatible histories range 200.68–327.86 even with known phase zero, emphasizing that deterministic key knowledge alone does not ensure invertibility for this retry rule. The controls check completeness and exclude a trivial implementation that rejects everything.

Reproducer: [`sims/lp2_z4_primeecho_silent_retry_sft.cjs`](../sims/lp2_z4_primeecho_silent_retry_sft.cjs), commit `1cb6f2e1d0d11b8bd10c4bba094c60a7204c382f`; direct connected V8 execution completed. Source: pinned corpus and historical `resources/historical/cicada2013-os-original-prime-echo.sh`. Standalone Node wrapper not independently executed. No CI job triggered.

**Decision:** do not spend compute attempting to statistically discriminate exact rate-matched Z4/F1/F2/F3 output-only models. A viable candidate must specify a reversible source-grounded latent clock or an actual independently observed hidden-event trace, explain T7/nonstationarity rather than merely D, and survive original-input inverse reachability. The literal expanded-alphabet prime interval retry mechanism above is rejected even before linguistic scoring.

## Agent23: historical keyword clocks, all phases and literal-F choices (27 November)

A different fixed clock replaces the 290-prime sequence with the independently solved LP1 key words DIUINITY (8) and FIRFUMFERENFE (13), GP29 indices as shifts, both signs, m=35/36/37. The same retry transition advances on every attempted symbol. In addition to ordinary consumption, two literal-F choices emit F without advancing the clock, either preserving or updating the remembered accepted symbol. All nine original chapters start with a fresh sentinel and every clock phase is allowed. This is a scoped transfer test, not an authenticated LP2 key selector.

All 36 variants admit the full 308-rune planted p57-repeat control; this tests existence, not unique inverse recovery. **Zero of 324 variant/chapter combinations admit the full original chapter.** Across the 36 variants, maximum original legal prefix lengths are 53, 53, 61, 61, 99, 19, 109, 86, 25, against respective lengths 729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308. A sentinel/first-silent-symbol collision in the initial implementation was corrected (sentinel=m, not 29); the reported exclusions were unchanged. The transition table enumerates all possible plaintext symbols and clock phases. No language score or word boundary is required. These fixed-key negatives do not exclude unknown cyclic keys or expanded-alphabet mechanisms generally.

Reproducer: `sims/lp2_z4_historical_keyword_retry_sft.cjs`, results `im-results/lp2-z4-historical-keyword-retry-output.json`, corrected commit `2d960a8f1236591ef838793385259460543216ad`. Computational core executed in connected V8; standalone Node wrapper not separately run. No CI.
