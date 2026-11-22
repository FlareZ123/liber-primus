# LP2 ciphertext-equality key sieve under an unknown output alphabet

**Classification:** new reusable cryptanalytic method with controlled positive-key recovery and bounded negative tests on LP2. Agent 34, 2026-11-10. **No authentic LP2 plaintext or key is recovered.**

## Algebra and scoring

Under `C_i=σ((P_i+sK_i) mod 29)`, where `σ` is **any single unknown bijection** of the 29 rune symbols and `s` is an additive sign, the observable equality `C_i=C_(i-d)` is equivalent to `P_i-P_(i-d)=-s(K_i-K_(i-d)) mod29`. This provides a candidate-key test that never guesses the 29! outer rune mappings. It is cheaper than training an arbitrary output S-box and is insensitive to fixed glyph relabeling. The common `σ` or a common per-phase bijection must remain synchronized across compared sites. The candidate key is supplied externally; this is a key **sieve**, not a complete key-generation oracle.

Train empirical GP rune-difference histograms on the first 240,000 characters of the repository's Shakespeare control; each lag's probabilities are mixed with 8% uniform rune noise. The scoring function sums log probabilities of observed equality and inequality for all within-page pairs at lags **2–16**. The resulting total is a **correlated-event composite log-likelihood**, so significance comes only from matched Monte Carlo comparisons. Physical page-50 grid contains no rune text. The ciphertext pages contain **12,956 runes**.

## Direct grid key and positive recovery controls

Test the 256 bytes of the manuscript's 32×8 base-60 table as a repeated additive pad, reading forward or backward, both signs and every 256-symbol phase start (**1,024 configurations**). The real manuscript's best option is reverse ordering, offset 216, sign +1, score **−27950.57334**. Under 100 shuffled-key-byte nulls with the same complete 1,024-option scan, **22** exceed the observed maximum: family-wise empirical p **0.22772**.

In **40** separate held-out English-GP synthetic manuscripts using a shared true table key with unknown orientation/sign/offset, an arbitrary random outer 29-way alphabet, the actual 55 physical page lengths, and 81% of immediate repeats overwritten, the exact model parameters are recovered in **39/40** trials. Median rewritten adjacent events are **367**. This confirms meaningful sensitivity within that named mechanism, not general validity on LP2.

## Standard cipher expansions, and a falsified winner

Apply the same equality sieve to previously established grid-derived construction families, using existing repository implementations: **2,432** row/column-derived AES-256-CTR, ChaCha20, and RC4 streams with page-reset IVs and mappings, plus **1,164** full-grid/digest/RC4/AES/ChaCha page or global stream variants. The highest exploratory score is **−27946.19513** from `column6:forward`, `RC4`, `drop=256`, `byte%29`, `sign=-1`. Against 3,000 random *single* page-reset pads with both signs fitted, its upper tail is **p=0.0009997**, but this applies to the selected candidate **only**. The 3,596-hypothesis Bonferroni upper bound is **1**, so the selected peak is not globally significant. Earlier IoC screens of the same candidate cipher family were negative; no reason exists to elevate it to a key.

Freeze this postselected RC4 pad and test previously unused rune-pair lags against 2,500 random pads per interval. The authentic CI values:

| Lags | LP2 log score | Random-pad median | Upper-tail p |
| --- | ---: | ---: | ---: |
| 2–16, original selection | −27946.1951 | −28001.2871 | 0.000400 |
| **17–32, challenged** | −27897.4148 | −27885.3707 | **0.79648** |
| **33–64, challenged** | −49716.2490 | −49689.0608 | **0.90164** |
| **65–128, challenged** | −73440.4043 | −73401.1191 | **0.93802** |
| 129–255, further exploratory | −58355.0635 | −58400.0358 | 0.02559 |

The long-lag 129–255 statistic is another postselection diagnostic with correlated comparisons. Failure of all three intermediate held-out ranges under the same frozen key undermines the short-lag appearance. **The RC4 column-6 candidate is a false lead**, pending any independent plaintext discovery, and should never be reported as recovered key material.

## Reproduction and use

- [Exact scanner, controls, selected candidate challenge](../sims/equality_pad_scan.cjs), Node.js 22 CommonJS. It reuses stable [stream-generation definitions](../sims/base60_seeded_stream.cjs) and [full-grid key definitions](../sims/base60_fullkey_stream.cjs).
- [Successful complete CI run 42752938239](https://github.com/FlareZ123/liber-primus/actions/runs/42752938239) and [manual-only workflow](../.github/workflows/equality-pad-scan.yml).
- [Original LP2 runes](../resources/liber-primus/lp2-corpus.json), [numeric grid](../resources/liber-primus/base60-grid.json), and [English model](../resources/control/shakespeare_first300k.txt).

The promising reusable result is **testing any externally motivated additive keystream without learning an arbitrary fixed output rune permutation**. Next meaningful work should supply independently constrained, nonrepeating keystreams or a synchronized correction/key-skip model, then demand held-out rune predictions and readable plaintext. Repeatedly tuning this selected RC4 stream against the same short-lag statistic is low value.
