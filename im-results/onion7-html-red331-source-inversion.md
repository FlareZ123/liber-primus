# Onion7 archival HTML 133/331 and LP2 red-heading original-seed inversion

**Classification:** original-source numerical crosslink and a scoped, executed original-cipher negative. **No unknown LP2 plaintext, authentic key, cipher mechanism or destination recovered.** Agent 42, 10 November 2026.

## Independent source relationship

The archived 2014 [Onion7 delivery index](https://github.com/krisyotam/cicada3301/blob/main/liber-primus/original-onion7/index.html), preserved exactly as [a source file](../resources/cicada2014-onion7-index.html), has HTML title **133**, a div with id **331**, and exactly 58 numbered image elements (0.jpg to 57.jpg). The archive's provenance cannot conclusively authenticate the original Cicada authorship of the HTML bytes. These HTML numbers are **established prior art**, recorded in both [Wulfic's tracker](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md) and [Dukotah's historical ledger](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/ELIMINATION-LEDGER.md).

Independently, the first LP2 physical page's 13-red-rune opening heading has Gematria Primus **prime sum 662 = 2×331**. Its first eight runes sum to **347**, and remaining five sum to **315**. The red-rune annotation and GP source are [ink annotations](../resources/liber-primus/lp2-ink-annotations.json) and [canonical ciphertext](../resources/liber-primus/lp2-corpus.json); the **331 seed had already been explored** in the earlier [red-heading inverse](../sims/red_heading_331_seed_inverse.cjs), without recovering text. The archived HTML is a different independently preserved source with the *same number*, which motivates an integrated original-source key test.

The HTML title **133** reverses **331**. The retrospective arithmetic identity **133+331=464=π(3301)** also holds (π is the prime-counting function). Neither the reversal nor that identity independently identifies a cipher, encryption key, cryptographic significance or intentional cross-artifact clue.

## Exact source-constrained original inverse

The [new executable model](../sims/onion7_html_133_331_seed_inverse.cjs) reads the preserved original HTML, asserts the two values and exactly 58 listed images, and recomputes the 13-rune source-prime sum. It forms five fixed new seeds: **133, 133331, 331133, 464 and 44023**, respectively original title, either concatenation order, sum and product. The previously examined 331-alone seed was deliberately omitted to avoid repeating the earlier investigation.

The model then evaluates the same six PRNGs from existing code (xorshift32, LCG A/B, Lehmer, low-byte LCG, MT19937), two clocks (book-continuous or page-reset), five reversible or recoverable GP29/GP28 inverse modes (direct additive, predecessor difference, primitive-field28 step, predecessor-excluded cyclic rank and sorted rank) and both signs: **600 explicit original-source combinations** over all **12,956 original unsolved rune symbols**. Score uses the independently decoded LP1 Gematria Primus source rune distribution. Select parameters solely by log-likelihood on the first **6,478** original symbols and freeze them across the latter **6,478**. This is *within-study* holdout on a heavily explored corpus, never a research-wide blind test.

The training-selected result **seed 44023, LCG A, continuous book clock, sorted predecessor rank, subtractive sign** produced:

| Measure | GP log likelihood per rune |
| --- | ---: |
| Original selected training half | **-4.220895745** |
| Original frozen continuation half | **-4.280973016** |
| Solved-Cicada LP1 reference | **-2.934616444** |
| Independently planted native-GP decode | **-2.958429490** |

The original recovered candidate has strongly nonprose-like GP statistics and **no readable original LP2 plaintext**. No genuine decryption or true key is claimed.

**Powered implementation control:** an independently selected 12,956-rune GP plaintext matching the original 2,896 word lengths was encrypted using *seed 133331* and MT19937 into a 28-power primitive-field29 difference cipher with a transparent GP rune28 step. The decoder recovered **12,901/12,901 noninitial plaintext symbols**, and reciphered the full **12,956/12,956 symbols** of that independently planted message. All assertions and the complete original-search execution passed in the existing manual [CI run 42840277631](https://github.com/FlareZ123/liber-primus/actions/runs/42840277631), using the seeded-number dispatch of [audio-761-pad-scan.yml](../.github/workflows/audio-761-pad-scan.yml).

## Scope and future discriminant

The archived index is a source hint, and its **331** correspondence is concrete arithmetic. Its purpose is unresolved. The source-derived **five fixed PRNG seed derivations and 600 direct modes** are bounded original negatives. These results do not exclude a nonlinear KDF, different key clocks or plaintext register, external missing source information, or an independently specified non-PRNG cryptosystem. The original HTML index has no visible continuation pointer beyond the 58 image entries, consistent with the external historical ledger, and the unknown AN END deep-web hash remains unresolved.

Do not continue arbitrary nearby 133/331 seed arithmetic. A stronger successor needs an independently prescribed original encryption/state rule and complete original ciphertext re-encryption into legible source-supported plaintext.
