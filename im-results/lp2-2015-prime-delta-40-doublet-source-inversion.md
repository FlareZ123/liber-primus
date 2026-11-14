# First-chapter prime-then-difference: exact original 2015 witness and eight-chapter holdout

**Status, 14 November 2026:** A source-dated solver observation has been reconstructed **exactly** on original LP2 ciphertext, and the uniquely selected first-chapter alignment is mathematically verified. It does **not** recover plaintext or an author-selected cipher. This is intermediate evidence for a possible first-chapter preprocessing operation; eight independent visual chapters do not display the same effect.

## Historical operation, independently named in 2015

The surviving [original Freenode transcript](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/irc-logs/%23cicadasolvers.freenode.2.log), 27,234,234 bytes, Git blob SHA1 `72634a9d071d32af767edbffc0493d810e88cd0d`, has an unusually concrete original-source hypothesis from **4 February 2015**. At source line **L89874**, `wetsand` relays an earlier observation by `ether8unny`: shift pp0–2 by successive primes and take differences between successive shifted rune values, imagining an **F rune before the first printed rune**. At **L89887–90** the same participant spells out the prime stream starting `2,3,5,7,…`. At **L89901–04**, they explicitly report that this operation produces **40 adjacent equal values** across the 729-rune first chapter, compared with the cipher's conspicuous scarcity of equals. The speakers present a tentative experiment, not a Cicada-signed decoding instruction or plaintext.

This was not implied by the project’s earlier full-GF29-grid polynomial derivative experiments. The exact dated source context and the resulting operation were checked separately from existing full-book unknown-key screens.

## Full reversible equation and original test

The first three physical encrypted LP2 pages have `262 + 266 + 201 = 729` original GP29 rune indices `C[0..728]`, all retained in original reading order including page boundaries. Let `p[k]` be the `k`th prime with `p[0]=2, p[1]=3`; the imagined **F** has source GP index **0**. Assign it prime2 and the first *real* rune prime3. The negative-direction GP29 prime shift and consecutive modular difference are:

```text
S[-1] = (0 - 2) mod 29 = 27
S[i]  = (C[i] - p[i+1]) mod 29
D[i]  = (S[i] - S[i-1]) mod 29
```

The inverse is exact for every GP29 sequence: starting at `S[-1]=27`, set `S[i]=(S[i-1]+D[i]) mod29` and then `C[i]=(S[i]+p[i+1]) mod29`. This is one unambiguous executable reading of the 2015 participants’ suggestion. A separate original solved-p57 GP positive plant round-trips all 729 symbols exactly. Exact round-trip by itself does not validate the historical operation as a cipher.

| Fixed original first-chapter statistic | Value |
| --- | ---: |
| Original ciphertext runes, pp0–2 | **729** |
| Equal adjacent pairs in original ciphertext | **4 of 728** |
| Equal adjacent pairs in transformed `D` | **40 of 728** |
| `D` GP29 index of coincidence | **0.03450459006014561** |
| Uniform GP29 comparison | **1/29 ≈ 0.0344827586** |

The original **40** exactly reproduces the count from historical L89901; it is therefore an independently dated *historical reconstruction*, rather than an unexplained fitted count. The transformed tape remains almost completely uniform, with **no authenticated readable GP plaintext**.

## Alignment discrimination and untouched nine-chapter transfer

As a source-preserving control, rotate the original chapter's **entire unchanged 729-rune ciphertext** against the fixed prime stream by each of the 729 possible circular offsets. This preserves every source rune, the unigram histogram and almost every original adjacency. At the historically specified unrotated original alignment, **40** equal pairs is the **unique maximum** among all 729 rotations; the ensemble mean is **25.504801**, standard deviation **4.763578**, and only **1/729** exact orientations reach 40. If both cipher signs and starts with either prime2 or prime3 are included before selecting a result, **2/729** rotations attain the best original 40, the other one corresponding to the same physical alignment under the other starting-prime convention. These are empirical orientation ranks under a defined finite surrogate ensemble, **not discovery-adjusted probabilities that Cicada authored this mechanism**. The operation and its reported count were discovered in 2015, after exploration of prime shifts, and should never be represented as a fresh preregistered prediction.

To test reuse, keep precisely the same negative-prime3-and-fictitious-F rule, reset at each of the independently printed nine visual-chapter boundaries and score each original chapter at source phase zero. Do not fit a key or choose a stronger phase in held-out chapters. The chapter boundaries and rune lengths are **[729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]**, in physical order.

| Chapter | Original runes | Prime-difference adjacent equals | Original-phase upper-rank among all intact rotations | Decoded GP29 IoC |
| ---: | ---: | ---: | ---: | ---: |
| **1** | 729 | **40** | **1 / 729** | 0.034505 |
| 2 | 1,145 | 39 | 735 / 1,145 | 0.034414 |
| 3 | 1,729 | 64 | 580 / 1,729 | 0.034750 |
| 4 | 1,903 | 78 | 78 / 1,903 | 0.034528 |
| 5 | 1,021 | 37 | 327 / 1,021 | 0.034743 |
| 6 | 1,433 | 48 | 919 / 1,433 | 0.034311 |
| 7 | 1,680 | 60 | 585 / 1,680 | 0.034327 |
| 8 | 3,008 | 99 | 2,410 / 3,008 | 0.034511 |
| 9 | 308 | 11 | 101 / 308 | 0.034794 |

The first-chapter source phase is exceptional **for this original statistic**, and the remaining eight chapter phases are generally ordinary. Chapter4's 78/1,903 is mild and unadjusted across eight held-outs. None gives English-like GP29 symbol frequencies.

**Independent no-reset whole-book test:** If the same exact prime list **continues** after p2 instead of restarting on the eight later visual chapters, the inverse of all **12,956** original runes produces **472 adjacent derived equals** and an all-book GP29 IoC of **0.034509200096422304**. This is checked independently in the same original-input SFT; the first 729 transformed runes match the historical reconstruction exactly. The alternative continuous clock therefore does not salvage an English-like one-step decoder. Any **pure transposition**, spiral route or **fixed bijective GP29 alphabet substitution** applied afterward preserves this IoC *exactly*. A recovered native-English plaintext would require another value-changing/stateful operation, a different source-selected register or a non-English payload. This is a key-independent structural statement about these particular downstream families, not a proof that no English text can ever have such a frequency spectrum.

## Concrete research decision

Preserve the **exact p0–2 prime-then-difference transform** and its unique source-position alignment as a small hypothesis for a *first-chapter intermediate register*. It is an independently dated human experiment that exactly reproduces its own reported original-text statistic. A genuine next step would require an original image/number/statement that selects what to do with the 729 transformed GP29 values and yields a withheld original plaintext prediction. Do not commission 29-phase scans, freely changed prime clocks, or stacked arbitrary language-model layers to chase the alignment anomaly. The eight held-out chapters provide affirmative evidence against promoting this single operation into a universal decryption mechanism.

**Reproduce:** [single Windows Node22/CommonJS SFT](../sims/lp2_2015_irc_prime_delta_inverse_sft.cjs) consumes unchanged `resources/liber-primus/lp2-corpus.json`, asserts the source runes and counts, applies both directions of the reversible mapping, runs 729×4 source-cyclic controls, and tests all nine printed chapter intervals. [Successful Windows source-original workflow 43615533947](https://github.com/FlareZ123/liber-primus/actions/runs/43615533947), with a passing original-input GitHub Actions log. The [original 2015–16 cross-message dialogue index](../sims/lp2_2015_2016_original_irc_vision_sft.cjs) separately retrieves and checks the immutable original source log, reproducing the precise dated lines; [successful source run 43614403090](https://github.com/FlareZ123/liber-primus/actions/runs/43614403090).
