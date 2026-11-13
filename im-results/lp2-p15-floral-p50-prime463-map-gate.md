# The runeless floral page selects p15's prime 463: a bounded original-cipher gate

**13 November 2026, Agent 41. Classification:** an additional source-index alignment and a complete finite, reversible cipher-consumer test. The alignment may help identify the intended relationship among the p15 4×4 numbers, p40–55 framed chapter, and p49–51 numerical table. **The proposed decoder is negative. No unknown original LP2 plaintext, authentic key, selected cipher or continuation destination has been recovered.**

## Source-visible route and the extra index constraint

The original p15 image (32.jpg) has one red numeral 3299 and a conspicuous 4×4 Fibonacci-indexed-prime spiral. Its established red-starting traversal gives sixteen differences from 3301, and the corresponding sixteen prime values:

| Original spiral index, zero-based | p15 printed value | Recover 3301−value | Paired botanical page |
| ---: | ---: | ---: | ---: |
| **0** | **3299 (red)** | **2** | **p40** |
| 9 | 3038 | 263 | p49 (first numeric-table section) |
| **10** | **2838** | **463** | **p50 (unique rune-free page)** |
| 11 | 2472 | 829 | p51 (last numeric-table section) |
| 15 | 4516 | 7817 | p55 |

Physical pp40–55 carry **sixteen identical printed floral borders**, including **p50**, which consists entirely of the middle portion of the original 256-cell numeral table and has **zero GP runes**. Aligning the p15 spiral's sixteen **source-ordered** numbers to these sixteen pages therefore places **its eleventh recovered prime, 463, on the unique runeless page p50**. The following arithmetic equalities then close onto the already independent red p15 number:

- **The 463rd ordinary prime is 3299**, the p15 red start.
- The original p40–55 text has 3316 GP runes; omitting only its **p40 red8** and **p54 red9** opening rubrics gives **3316−17 = 3299** runes. This body-size relation was already established in [the p15/floral register report](lp2-p15-red3299-floral-body-register.md).
- **463 has multiplicative order 3298 modulo prime3299**. Its powers therefore index every nonzero one of those 3299 body positions exactly once, with zero handled separately.

The *incremental* observation is that the **runeless p50 position is j=10 of the p15 sequence**, and at this same position the Fibonacci-prime value **463** is precisely the prime rank of the red **3299** and a primitive root of the 3299-position floral body. The rank and primitive-root properties themselves are source-exact mathematics already known separately. This index placement has not been independently verified as an instruction from Cicada. Specifically, pairing p15 index0 with floral page p40 is a plausible alignment between two sixteen-element objects, **not an author's specified book code**. The older 829=3316/4 coincidence is another manifestation of the same p15 array, not an independent validation.

## One fully executable original inverse

A compact hypothetical human path is: the 4×4 spiral supplies the sixteen pages' numerical directions; the one empty floral page p50 identifies **463**; p15's red number gives the **3299-position register**; the complete pp49–51 table supplies **256 byte values**. Then traverse body positions in the exact sequence

    0, 463^0 mod3299, 463^1 mod3299, ..., 463^3297 mod3299

and apply the table as a **periodic GP29 additive key**, as in Cicada's verified Vigenère pages. This choice of **modular position powers, key repetition and addition** is hypothesized; there is no original instruction directing this three-part consumption. Because the printed table bytes range 0..255, declare just two straightforward reductions to a GP29 key, **byte % 29** and **floor(29·byte/256)**. Apply both signs. Check whether the key clock advances with the 463-power readout or indexes the original body positions. These are **eight** frozen candidate models, with no other phase, offset, key search or symbol repair.

The original 3299-rune floral body, in printed order, has IoC **0.034464934244**. All eight complete original inverses remain near the random GP29 1/29 baseline:

| Byte-to-GP key | Sign | Table clock | Original inverse IoC |
| --- | ---: | --- | ---: |
| byte % 29 | − | Readout | 0.034358501418 |
| byte % 29 | − | Original position | 0.034510705874 |
| byte % 29 | + | Readout | 0.034520999895 |
| byte % 29 | + | Original position | 0.034534970352 |
| floor(29·byte/256) | − | Readout | 0.034440669766 |
| floor(29·byte/256) | − | Original position | 0.034476331196 |
| floor(29·byte/256) | + | Readout | 0.034393243740 |
| floor(29·byte/256) | + | Original position | 0.034551698137 |

The independent solved p57 PARABLE GP source has IoC **0.062709966405**; the eight full outputs contain no readable native-GP prose. Their small IoC changes are ordinary and cannot establish a key. Each of these exact operations is invertible and was forward-planted with genuine p57 rune indices to **recover 3299/3299** source-native symbols under its matching inverse; the plant proves implementation correctness without evidence of intended use.

**Source checks and executable reproduction:** [single-file Node 22 CommonJS test](../sims/lp2_p15_flora_p50_prime463_keyroute_sft.cjs) reads [the exact original LP2 corpus](../resources/liber-primus/lp2-corpus.json), [the 256 table bytes](../resources/liber-primus/lp2-grid-256.json), checks table SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`, all sixteen page lengths, prime-rank463, 463-power cycle completeness, eight inverse IoCs and eight positive planted round-trips. The p15 original source mathematics is in [the authoritative sixteen-number reconstruction](../results/lp2-p15-fibonacci-prime-spiral.md). The source-input computation was separately executed with the connected JavaScript runtime against the shared canonical files.

## Research decision

The **p50 eleven-of-sixteen placement** is worth keeping as a specific observation when a new original instruction addresses a prime rank, position walk or the rune-free table. Direct combination of **463-power permutation + unaltered printed table periodic additive masking** does **not** recover plaintext. The established 3299 and 3294 cross-artifact equalities remain provisional as cipher clues. Do not tune other generators, phases, table reduction functions, or transcript exceptions around this negative; a new source-authored operator or successful held-out original plaintext prediction would be needed to extend the branch.
