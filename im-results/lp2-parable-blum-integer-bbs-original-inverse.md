# PARABLE's three primes: source-selected Blum–Blum–Shub inverse on actual LP2

**22 November 2026, Agent16. Classification:** independently motivated but unauthenticated candidate-generator operation, fully evaluated against original unknown ciphertext, **negative for direct GP29 additive use**, no new plaintext or key. [Self-contained read-only CommonJS original-input test](../sims/lp2_p57_bbs_prime_triple_original_sft.cjs).

## Human-facing operation worth testing

Cicada's original 2013 `761.MP3` contains the number **1,595,277,641**. The *authentically solved* terminal LP2 p57 `PARABLE` has exactly four prime-index-sum clauses in original runic order: heading **449**, followed by body sums **1259**, **1031** and **1229**. The body product is `1259 × 1031 × 1229 = 1,595,277,641`, an independently noted historical source relation ([2013 numeric source](audio-761-pad-scan.md), [verified prior factor link](lp2-grid256-terminal-solved180-lookup-gate.md)).

The triple has a previously unexploited **specific cryptographic partition**: 1259 and 1031 are prime, each congruent to **3 modulo 4**, while 1229 is prime and congruent to **1 modulo 4**. The first two therefore form a valid **Blum integer** `N=1259×1031=1,298,029`. The remaining 1229 is coprime to `N` and supplies an immediately usable seed for the standard Blum–Blum–Shub squaring generator:

`x[0] = 1229² mod 1298029 = 212412; x[n+1] = x[n]² mod 1298029; bit[n] = x[n+1] mod 2.`

This is a concrete original-source-to-key construction, with the unique two-prime Blum pairing selected without reading any unknown ciphertext. Because prior Cicada rounds used elementary cryptography and the original message foregrounds primes, it is an affordable candidate a technically literate human might try. **The source nowhere names BBS**, chooses a GP29 output packing, tells us to use this seed, or proves that the arithmetic coincidence was authored as cipher instruction. The strongest rival is a literary/numeric checksum with no keystream role.

## Frozen direct decipherment experiment

The CJS SFT reads all **12,956 original GP29 ciphertext runes** from physical pp0–55 in exact published order and obtains the four PARABLE sums from the unmodified p57 source GP29 indices, verifying the 2013 product. It independently finds that the selected squared seed's modular orbit has period **612 states**.

Three minimal byte-free GP29 stream consumers are implemented:

1. Direct full BBS state reduced **mod 29** per rune.
2. One standard BBS parity bit per square, read five bits **MSB-first**, reject 29, 30 or 31 to obtain an unbiased GP29 ordinal.
3. The same five parity bits **LSB-first** with the same rejection rule.

Each output is used under `C ± K mod29` in two signs, with no output-dependent filtering. Three source-typed start offsets are frozen rather than optimized against ciphertext: **0**, audio file basename **761**, and Cicada number **3301**. This gives **18 fixed original continuous-keystream decodes**.

| Original whole-book statistic | Value |
| --- | ---: |
| Undecrypted GP29 index of coincidence, 12,956 runes | **0.034478398** |
| Minimum index of coincidence of the 18 BBS direct inverses | **0.034450** |
| Maximum index of coincidence of the 18 BBS direct inverses | **0.034517** |
| Highest standard native-English GP29 reference values from archived control | typically **~0.06** |
| Authenticated LP2 plaintext recovered | **0 runes** |

The p55 76-rune original outputs are nonlinguistic under the fixed variants; p0 openings likewise contain no readable instructions. Source-native **p57 PARABLE 95/95 GP29 rune positives** encrypt and invert exactly under the same explicit generators, including all original offset/sign choices. A separate bounded page-local-reset control (offset0) likewise has whole-book IoC **0.034455–0.034499**, with no plaintext.

**Decision:** the authentic PARABLE factor triple is a valid **Blum modulus plus source-seed candidate**, but the direct BBS-to-GP29 additive cipher, under the three source-visible offsets and standard parity-to-digit conversions, does **not** decrypt the original unknown text. This is an explicit source-motivated experimental negative, not an exclusion of BBS under every possible state ordering, arbitrary extra key, output-aware anti-doublet encoding, or nonlinear receiver. The factorization and its unique Blum pair are worth retaining for a future genuinely authored input/output rule. Do **not** expand an unconstrained BBS seed/packing search based solely on this no-plaintext result.
