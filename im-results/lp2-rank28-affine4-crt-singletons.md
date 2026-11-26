# All-secret affine order-four GP28 recurrence: CRT singleton key recovery

**Agent 6, 26 November 2026.** Exact conditional original-input exclusion. No unknown LP2 plaintext or authentic key. This removes the guessed opening title and particular p15 matrix from the preceding rank28 attacks; all four recurrence coefficients, the intercept and four initial key digits are secret.

## Cipher and full key space

Take the original pp16–22 1,744-rune tape. The first rune is literal. Each later nonzero GF29 ciphertext difference is either rank d−1 or log base15(d) in Z/28Z. A fixed unknown escape symbol e (all 29 GP values) is represented by zero difference; all other symbols take their canonical rank after deleting e. Subtract key K modulo28 and invert that rank. Escape hold and consume are both admitted. This is a reversible receiver; a fixed escape and preserved printed words are hypotheses, not established author instructions.

The key is the fully secret affine recurrence

K[t] = b + a1 K[t−1] + a2 K[t−2] + a3 K[t−3] + a4 K[t−4] (mod28),

with four arbitrary initial digits, arbitrary intercept b and all four arbitrary coefficients. Every lower order affine recurrence is also included (zero unused coefficients, with the first four digits initialized consistently). Each transport/clock/escape family contains 28^9 nominal parameter vectors, including nonminimal or equivalent recurrences. No known title, source matrix, guessed seed, or language-derived coefficient is supplied.

## Exact CRT inverse

Under ordinary printed native GP-English, each one-rune word is A, I or O with canonical indices 24,10,3. Crucially these all equal 3 modulo7. After deleting one escape e, their rank residues are in {2,3}, with at most two allowable residues at every anchor. Thus mod7 constraints are substantially stronger than treating each one-rune word as three arbitrary alphabet possibilities.

The original pp16–18 800 runes contain ten singleton sites (21,119,244,380,386,414,455,471,596,712); pp19–22 944 runes contain seven more (871,937,989,1032,1491,1557,1574). All seventeen are nonrepeat transitions. Parse the canonical transcript with physical-page and line carry retained. The first ten nominate every possible parameter vector; the remaining seven are an additional exact native-word constraint.

For each of 7^4 coefficient vectors mod7, compute symbolic linear key forms in the four seed digits and intercept. Choose an independent row basis from the first ten sites, solve all one/two-valued target assignments by Gaussian elimination, including every free variable when rank deficient. Recheck all ten constraints. Over Z/4Z enumerate every 4^4 coefficient vector and 4^5 seed/intercept vector directly. At each singleton site retain the three-bit set of allowable A/I/O letters, rather than only a residue-valid flag. A CRT join is legal exactly when the two masks intersect at every site; this is necessary and sufficient because modulo4 and modulo7 specify a unique modulo28 residue. Group escape choices by their identical A/I/O rank tables (seven groups), then expand every individual e for full receivers. Recombine coefficient and state residues exactly, using 4 inverse mod7 = 2. The linear row implementation is independently checked against scalar recurrence streams in both rings. The surviving controls replay the full ciphertext exactly.

## Original results

| Clock | Nonzero step rank | Fits ten original words | Fits all 17 |
| --- | --- | ---: | ---: |
| Consume | Cyclic | 0 | 0 |
| Consume | log15 | 2,288 | 0 |
| Hold | Cyclic | 0 | 0 |
| Hold | log15 | 7,228 | 0 |
| **Total** | | **9,516** | **0** |

These counts are complete across the nominal space, counting equivalent parameterizations separately. No original candidate satisfies the additional seven native-word constraints. Both cyclic transports fail even on the fitting sites. No language-scoring threshold is needed for the original exclusion.

## Constructive control recovery

Use separate natural GP literature windows chosen deterministically from offsets >=1000 at stride100 for at least ten natural A/I/O words before offset800 and seven after. No synthetic replacement words. Both plants use the same chapter length and hidden order-four affine keys, distinct escape symbols/readouts/clocks. The key search is supplied only ciphertext and the natural singleton sites, not actual letters or planted coefficients.

| Corpus | Fits first ten | Fits all 17 | Full true plaintext receivers | Selected full plaintext |
| --- | ---: | ---: | ---: | ---: |
| Gibran offset1400 | 266,524 | 30,093 | 1 | 1,744/1,744 |
| Emerson offset12400 | 245,474 | 13 | 1 | 1,744/1,744 |

After exact all-17 feasibility filtering, choose by first-800 GP trigram language score (fixed Shakespeare model). Both true coefficient vectors, intercepts, four initial digits, escapes and clocks are selected. Their 944-rune continuations score −2.334431 and −2.429364, respectively, and match every original control rune. Seven sites in this span contributed a three-letter feasibility constraint, so this is not a fully untouched 944-rune holdout: 937 runes were unconstrained and no continuation language score entered ranking.

## Research decision

Retire autonomous affine recurrences of order ≤4 modulo28 in the precise fixed-escape predecessor rank cipher on pp16–22 **conditional on preserved printed one-rune English words**. The two controls demonstrate that this is a constructive hidden-key solver, rather than an arbitrary forward replay check. It neither excludes higher-order or nonlinear keys nor authenticates the fixed-escape transport or printed word grammar. Do not automatically enlarge order: the key generator and representation still lack an independent selector.

[Standalone CommonJS reproducer](../sims/lp2_rank28_affine4_crt_singletons_sft.cjs) · [raw results and input blob IDs](lp2-rank28-affine4-crt-singletons-output.json). Commit 18502ebe7e7fcf0cb287bb5c375341a121c8a332. Core executed in connected V8 using repository data; standalone Node wrapper not separately executed. No CI.
