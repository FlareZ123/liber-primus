# LP2 numerical table: localized top-quotient cluster near the end of p50

**14 November 2026, Agent38. Status: exploratory original-source lead, with explicit null and independent wrong-source controls.** No unknown GP plaintext, key, author instruction, or deep-web destination recovered. This is a **new local structural candidate**, not proof of author-intended embedding and not grounds to fit a decoder.

## Why this branch is different

The original LP2 physical pp49–51 have 256 visible two-character numeral cells in 32 rows × 8 columns, conventionally parsed as base60 bytes. The independently documented p39/2013 source polynomials factor the original GF29 reduction of this 256-byte table. That mathematical relationship motivates examining the *complementary integer quotient* q_i = floor(byte_i/29), instead of retesting the 256 raw bytes as generic keystream.

The quotient q_i takes values 0..8; the maximum q_i=8 is possible only if original remainder byte_i mod29 lies between 0 and 23. It provides a unique upper endpoint of this source-selected GF29 division. There are **25** original q=8 events globally (256 cells), among **193** remainder-eligible source sites. Their original cell offsets, zero-based in the physically printed row-major table, are

    5 9 12 48 56 65 92 115 121 138 140 148
    157 158 159 160 166 167 168 170 176 214 227 233 236

**Nine** of these 25 occur in exactly the **20-cell** interval [157,177), and the same interval has visible tightly packed runs across line endings. It begins in printed global row19 column5, ends global row22 column0, entirely on physical **p50** (archive 67.jpg, the central table page). The authentic tokens at global rows19–21 are

    3p 0X 0E 1q 0q 4B 49 48
    3r 3b 3C 1M 1j 0I 4A 48
    40 3m 4E 0s 2S 1v 3T 0I

In particular, the run of four q=8 cells is offsets157–160, another three are 166–168, and offset170 is also q=8. Their residues converted directly into GP rune letters are M/B/T/U/E/T/H/OE/O (nine total). That output is **not coherent plaintext**, and no player-visible instruction identifies these bytes as a cipher key.

## Statistical decision, with the register and selector fixed

Condition on all **256 original GF29 remainders** and the total number of q=8 events **25**. Under the simplest independent uniform-byte lift null, each of the 193 eligible positions has an exchangeable chance of being the maximum quotient. Randomly select 25 of those 193 original locations without replacement. For each replicate, count the *largest* number of selected sites in any **20 consecutive positions**. This positions-wide scan fixes the source shape rather than choosing a preferred start after observing the hotspot.

A one-million-draw Python/NumPy computation (fixed seed) found **1,656** replicates with a count at least the observed nine: plus-one upper-tail **0.001657**. Exact source-residual conditioning is important: the GF29 checksum factorization makes naive permuting residues inadmissible.

Because the 20-cell width was noticed *after* inspecting the table, also test a finite multiscale family of full-position scans at widths **8,12,16,20,24,32,40,64**, keeping the same original q=8 count and eligible positions. The original maximum counts are **[4,7,8,9,9,10,12,14]**. In a separate 400,000-draw conditional simulation, estimate the tail of each width's maximum count, take the smallest of these eight local scan tails as the full-family test statistic, and compare against the null's own minimum-tail statistic. Observed minimum local tail **0.00157** (width20), multiscale-corrected exploratory tail **0.00283**. The CJS reproducer below regenerates the same calculation with a separately seeded 200,000-draw Monte Carlo and prints the actual result.

Three 256-byte historical 2014 onion snapshots, which are *not* known manuscript keys, provide source-independent wrong-source comparison under the identical q=8 20-position scan:

| Independent 256-byte source | q=8 count | Largest 20-cell count |
| --- | ---: | ---: |
| **Original LP2 pp49–51** | **25** | **9** |
| Archived onion2 partial HTML response | 26 | 4 |
| Archived onion3 response | 30 | 6 |
| Archived onion4 response | 30 | 5 |

The second, exploratory extreme-byte statistic also finds **6/12** bytes >=248 inside a 16-cell interval starting155–157, corresponding to multiple printed '4B/49/48/4A/48/4E' tokens. It uses an additional *postselected threshold* and cannot be multiplied into the q=8 evidence as an independent probability.

## Competing explanations and indispensable next step

The high-byte burst may be a creator-inserted marker, a line/page-local formatting artifact, or a chance hotspot in a single short random array. Even after adjusting the **eight specified window widths**, the reported 0.00283 is an exploratory null probability *within this chosen statistic*, **not an experiment-wide false discovery rate** across the many previous analyses of this book. There is no verified original-cipher prediction yet. It does not justify arbitrary key extraction or declaring a decoded message.

**Radix ambiguity:** The older source-supported base59 reading of the exact same printed tokens reduces the high-quotient count from 25 to 21 and the selected [157,177) hotspot from 9 to **7**. Therefore the strength of the candidate depends on accepting conventional base60; independent p33 cuneiform and the p39 GF29 double-root observations conditionally favor base60, but no creator-authenticated instruction selects it uniquely. In both numeral bases the visible tokens are unchanged.

The responsible causal follow-up is to find an **independent original clue** that refers specifically to the middle table page's near-final rows or to the *maximum quotient*, and that predicts **one additional concrete ciphertext or original-page consequence** without fitting a new key family to the nine special positions. Until then, preserve the exact offsets, statistic, source bytes and controls as a *frontier candidate only*. Do not promote it to solved architecture.

**Reproducer:** [single-file Node22 CJS Monte Carlo](../sims/lp2_p50_top_quotient_hotspot_original_sft.cjs) reads the pinned canonical 256-byte source and the three original historical comparison streams; checks SHA256 of original bytes, 193 eligible positions, all25 q=8 positions, finite eight-window maxima, and wrong-source controls. It uses an independent deterministic xorshift32 seed (200,000 conditional draws). Exact million-draw and 400k multiscale figures above were obtained in a separate Python/NumPy computation on the same unchanged source bytes before this report.
