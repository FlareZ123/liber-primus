# The 2013 Instar number as a source-seeded LP2 reversible cipher hypothesis

**Current result (Agent 20, 10 November 2026).** A complete **1,584-setting** original-cipher GP28 inverse challenge over independently sourced integer seeds and three explicitly implemented generator families has recovered **no unknown LP2 plaintext, authentic key, or destination**. The first 864 settings and the additional 720 CPython 2.7 settings each have a blind positive that exactly recovers source-native GP plaintext and forward re-encrypts it. These are finite, model-specific negatives, not an exclusion of the historical seed as a clue.

## Frozen historical seed and original input

The historical 2013 Cicada OS audio track `761.MP3`, “Instar Emergence,” includes ID3 “Parable 1,595,277,641.” The exact factorization **1,595,277,641 = 1259 × 1031 × 1229** matches the historically solved 2014 Parable's three GP-prime clause sums. Because the displayed number predates the second-release ciphertext, the four positive integers **[1595277641, 1259, 1031, 1229]** are an externally selected finite seed set. Neither this arithmetic nor the audio establishes a true LP2 cipher key or PRNG.

The unchanged target is [the original normalized 55 nonempty LP2 physical rune pages](../resources/liber-primus/lp2-corpus.json), p0–55 except the runeless p50, totaling **12,956 ciphertext runes**. The original section lengths are [729,1145,1738,1894,1021,1433,1680,3316]; the source's **86 repeated adjacent outputs** are preserved. All 29 GP symbols retain their canonical index order. No ciphertext-trained plaintext dictionary, key, seed offset or alphabet permutation is supplied.

## Conditional and lossless GP28 original inverse

At the start of each independently initialized segment, the first published ciphertext glyph is treated as public IV. Each subsequent hypothetical GP plaintext **EA** (index28) emits an unchanged previous glyph. Every other GP plaintext rune is assigned a 28-choice non-repeat output by one of these invertible rank maps:

- `power15`: nonzero GP-index difference `15^rank mod29`, using the manuscript-linked F29 generator 15.
- `cyclic`: output difference `rank+1 mod29`.
- `sorted`: output glyph at rank `rank` after excluding the predecessor from the ordered 29-glyph list.

At a normal position, encryption adds or subtracts the PRNG digit modulo28 before applying its rank map. At a repeated output the generator either advances one digit or skips it. Every option is exactly reversible given the model, published glyphs and segment IVs; the 86 original repeats are **unverified conditional EA interpretations**. Exact original forward re-encoding is therefore a validity check for code symmetry, not key authentication.

### Family A: legacy PHP MT and ANSI-style LCG, 864 settings

The [existing audited inverse](../sims/instar2013_source_seed_inverse.cjs) tests: four fixed seeds × two generators × three scopes (book/section/page) × three digit reducers (`raw31%28`, `floor(raw31×28/2^31)`, `(raw31&255)%28`) × three output-rank bijections × two EA draw clocks × two signs = **864**.

The original best setting gives GP-unigram log likelihood **−4.24220686923214 nats/rune** and GP IoC **0.03530018370379**. A hidden-key source-native GP-English positive ranks its actual full configuration **1/864**, recovers **12,948/12,948** noninitial runes, and scores **−2.95527051277 nats/rune**, with IoC **0.06121469438**. Exact forward re-encoding passes for both the original inverse and synthetic native source plant.

Its verified Windows Node22 workflow was [42801579099](https://github.com/FlareZ123/liber-primus/actions/runs/42801579099). The synthetic initial glyphs and the original published IVs are externally supplied; no unknown original IV is guessed.

### Family B: CPython 2.7 Mersenne Twister, 720 settings

The second [fully reproducible original-input inverse](../sims/instar2013_python_mt_inverse.cjs) directly implements historical CPython 2.7 `_randommodule.c` integer-seed `init_by_array` and MT19937, verified by exact first-output known answers. The byte-level algorithm is specified by historical [`_randommodule.c`](https://github.com/certik/python-2.7/blob/master/Modules/_randommodule.c) and [`random.py`](https://github.com/certik/python-2.7/blob/master/Lib/random.py). This is distinct from PHP's pre-7.1 Twister seed expansion.

The five explicitly screened 28-way digit generators are: `getrandbits(31)%28`, `floor(28×getrandbits(31)/2^31)`, `(getrandbits(31)&255)%28`, exact Python 2.7 `randrange(28)` through rejected `getrandbits(5)`, and `floor(28×random())` using Python's 53-bit float consumption. Four seeds × five reducers × three scopes × three rank maps × two EA clocks × two signs = **720**.

The original best option is **seed 1229, section reset, 5-bit rejection, cyclic rank, repeat consumes draw, sign+**, with log likelihood **−4.246090354625861 nats/rune** and IoC **0.03534342227773557**. The main original 2013-number seed's best score is **−4.2552166937584905**. The untouched GP-Shakespeare reference sampled under the same score has **−2.955116152815091 nats/rune**, IoC **0.06123369313756**. No original candidate resembles source-native GP text.

Blind positive: source-native Shakespeare GP plaintext deliberately encrypted under **seed 1595277641, Python 2.7 randrange28/getrandbits(5), section reset, power15, skip-draw-on-EA, sign+**. The 720-way search ranks the true exact configuration **1/720**, recovers **12,948/12,948** non-IV runes and exactly re-encodes all **12,956** test outputs; fitted reference log score **−2.955270512769739**. Original ciphertext inversion and re-encoding also exactly match all 12,956 glyphs, as every chosen key should.

All new settings and assertions passed the existing **manual-only Windows Node22 workflow** [42821802894](https://github.com/FlareZ123/liber-primus/actions/runs/42821802894). No per-commit workflow was added.

## Interpretation and next decision

**A PHP 5.2.1–7.0 MT, fixed ANSI-style LCG or historical CPython 2.7 MT, seeded by the previously published 2013 number or its exact factors, does not yield GP-English-like unknown LP2 plaintext within the declared 1,584 directly reversible GP28 variants.** This observation is strong against these explicit key schedules and native-GP plaintext assumptions. The reversible EA model remains a conditional construction; no cipher architecture is authenticated by a mere synthetic positive or original ciphertext roundtrip.

More 32-bit seed offsets, arbitrary LCG constants and generic generator swaps are low priority without an independent source rule. A meaningfully new successor must independently determine how historical source bytes drive an *evolving correlated* state that also predicts the original lag-five/six echo structures, the published word boundaries and exact unseen ciphertext, or derive a true intermediate alphabet or byte representation. Evidence of meaningful original plaintext is still required before promoting anything into [authoritative results](../results/README.md).
