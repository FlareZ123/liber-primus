# LP2 944-phase all-secret permutation gate from historical prime reversal

**11 November 2026, Agent 16. Status: bounded original-cipher exclusion, not a recovered plaintext, key, or authenticated cipher period.** This experiment tests one proposed cross-round reading against the complete unchanged unsolved LP2 rune stream. It offers a key-independent verdict on a mathematically broad family of direct GP29 ciphers, while leaving the manuscript unsolved.

## Human-visible proposed operation and its uncertainty

The independently solved LP2 p57 red heading **PARABLE** has Gematria Primus prime-weight sum **449**. A historically documented 2013 Cicada `number` operation reverses decimal digits of primes and factors the result; the 2013 `count parable` display also includes `449*`. Applying that historical operator yields **reverse(449) = 944 = 16 × 59**. Sixteen echoes the original p15 4×4 Fibonacci-prime spiral and the 16-cell inner circumference of the documented 2014 7×7 magic square. The 59 factor also appears in investigations of the signed 2016 clue. These associations are **retrospective**, do not uniquely select a 944-symbol key, and should not be represented as an instruction to decrypt LP2. Prior source studies: [p57 PARABLE and 2013 onion operations](onion7-magic-center-source-prime-gate.md), [p15 source spiral](../results/fibonacci-prime-spiral.md), and [historical 2016 source](../resources/cicada2016-4gq25.md).

We test a **source-constrained candidate period**, rather than search freely over periods or secret keys.

## Tested original-cipher family

Let `P_i` be plaintext encoded directly in the canonical 29 GP symbols, `C_i` the original ciphertext index, and `h_i` the public phase modulo 944. For **every** possible secret set of 944 independent permutations `pi_h` of all 29 symbols, two invertible transports are tested:

1. **Direct:** `C_i = pi_[h_i](P_i)`.
2. **Chained:** `(C_i - C_(i-1)) mod 29 = pi_[h_i](P_i)` for all but each physical page's first rune. The first symbol is free/omitted in this key-independent test.

Each transport uses either a book-global rune counter or a counter restarting at every physical page. The two clock rules give **four** precisely defined original-cipher families. In any one family, the secret permutations can be arbitrarily complicated and completely unknown: the number of equal symbol pairs sharing a public phase is **invariant** under the key. For chained transport, count equal *ciphertext differences* within phase. The direct and chained variants round-trip for any chosen bijective secret phase tables, although original ciphertext reencryption alone cannot identify a historical key.

All original runes are loaded from `resources/liber-primus/lp2-corpus.json` with the preserved 55 physical rune-bearing page lengths. No candidate original plaintext, key table, smoothing parameter, or fitted clock offset is used to compute the invariant.

## Complete original counts

| Public clock | Transport | Exact equal pairs | Eligible within-phase pairs | Invariant rate |
| --- | --- | ---: | ---: | ---: |
| Book-global | Direct GP29 | 2,907 | 82,524 | **0.0352261160** |
| Book-global | Chained difference | 2,844 | 81,831 | **0.0347545551** |
| Page-reset | Direct GP29 | 10,751 | 311,132 | **0.0345544656** |
| Page-reset | Chained difference | 11,006 | 309,647 | **0.0355436998** |

The chained families exclude exactly 55 physical page-start symbols from the invariant; all other original runes are included. Source page 50 is rune-free and contributes no symbol.

## Independent native-GP controls

The standalone reproducer uses the existing repository's canonical `encodeGP` (including its documented QU/K/V/Z folding) to generate 45 **disjoint length-matched** 12,956-rune controls from Shakespeare (16), Gibran (4), and Emerson (25). The original physical page lengths are imposed on each text window before scoring. In chained tests, score the *original plaintext symbols* against equal phases, with page starts excluded, because a secret bijection maps plaintext symbols to ciphertext differences; taking differences of the English plaintext would test a different model.

The minimum and maximum invariant rate across the reference windows in each category are:

| Reference | Windows | Book direct | Book chained | Page direct | Page chained |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shakespeare | 16 | 0.057983–0.061982 | 0.057839–0.062018 | 0.058197–0.061961 | 0.058127–0.061919 |
| Gibran | 4 | 0.059268–0.061946 | 0.059207–0.062006 | 0.059438–0.060492 | 0.059487–0.060446 |
| Emerson | 25 | 0.059571–0.065024 | 0.059525–0.065085 | 0.061492–0.064038 | 0.061535–0.064047 |

**All 45/45 native text windows exceed each original rate under every one of the four families.** The smallest native-control rate (0.057839) is about **1.63×** the largest original rate (0.035544); the original phase-equality behavior resembles a far flatter symbolic register. The 45 windows are contiguous selections from only three works, so they are not 45 statistically independent authors or broad proof about all human language.

### Secret-key positive controls

For every native window, the program deterministically generates a completely arbitrary *different permutation for each of 944 phases*, encrypts the native GP stream under both direct and chained versions of both clocks, and checks that the secret-key ciphertext has **exactly the same number of equal phase pairs as its native plaintext**. All **180** such planted controls pass by construction if the code is functioning. This directly demonstrates that unknown secret 29-way substitutions cannot hide the equality signature in the tested families. It does **not** claim any historical key recovery.

## Decision and remaining space

**Reject a fixed-public-period-944, fixed-secret-phase-permutation cipher producing directly native-English-like GP29 plaintext**, whether the output is the original rune itself or its within-page additive difference, under either of the declared clock conventions. This is an invariant-based statistical mismatch and conditional to prose-like language controls; it is not a mathematical disproof of unusual GP29 plaintext.

The following remain untested and open: additional hidden cipher state or feedback beyond a fixed public phase; separate secret tables on each physical page or section; an alphabet larger than 29 symbols, byte/homophonic or compressed plaintext; output with insertions, deletions or variable rates; and a source-directed nonperiodic key. There is **no authenticated original plaintext or complete LP2 cipher**.

**Reproduce:** `node sims/parable_944_allsecret_phase_sft.cjs` from repository root. [Standalone CommonJS script](../sims/parable_944_allsecret_phase_sft.cjs) uses immutable original/English source inputs, fixed page boundaries, exact pair-count asserts, and seeded secret-key plants. The experiment is distinct from existing 179-, 225-, 78- and 840-period finite screens. Any follow-up should supply a source-authenticated mechanism changing the cipher architecture; arbitrary adjacent period or phase sweeps are unjustified.
