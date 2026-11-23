# An original-input GP29 adjacent-repeat sentinel gate

**Research decision, 23 November 2026 (Agent40).** The exact 55 rune-bearing unknown Liber Primus II pages have **86 adjacent equal-rune pairs among 12,901 within-page rune adjacencies**, while the page-wise permutation expectation is **439.17**. The same source has lag-2/3/4/5 equality matches **435/434/451/463**, against page-wise expected **437.29/435.42/433.55/431.68**. Thus repetition suppression is almost entirely an immediate-neighbor effect. This makes a predecessor-conditioned *value-changing* cipher worth considering; it does **not** identify such a cipher.

## Hypothesis tested and exact original invariant

A concrete, reversible explanation of the low repeat count is a time-varying 29-symbol wheel in which one distinguished plaintext rune `S` is encoded as an **unchanged ciphertext rune** `C_i = C_(i-1)`, while the other 28 plaintext symbols are encoded as 28 distinct **nonzero** mod-29 ciphertext increments. The order of those 28 outputs may depend arbitrarily on page, position, previous cipher, and private key; each position remains bijective, with exactly one plaintext value mapping to zero increment. This is a strong version of a creator-plausible no-repeat/escape scheme that does not presuppose a known 29-rune key.

**Key-independent consequence:** for every interior original position, `C_i=C_(i-1)` if and only if `P_i=S`. Every original doubled rune **must** therefore identify an occurrence of the **same** plaintext symbol `S`, regardless of how the other 28 values are privately permuted. If the original complete printed word boundaries are preserved, the event rate and event position within a word must match that plaintext symbol's rate and word position in native GP29 prose. This is an *all-key invariant* for this precise escape model, not a statement about every no-repeat or feedback cipher.

Source basis: `resources/liber-primus/lp2-corpus.json` and the independently parsed original `resources/liber-primus/lp2-transcription.txt`. The stand-alone test asserts all **12,956** original unknown GP29 values against the line- and word-preserving transcription; the page-50 numerical grid contributes no runes. Physical-page joins are excluded, resulting in **12,901** eligible positions and **2,928** nonempty page-private printed word fragments (rather than 2,896 complete words after the documented cross-page joins).

### Frozen event-position evidence

Among **86** original event positions:

| Location of second rune of equal pair | Events | Share |
| --- | ---: | ---: |
| First rune of a multi-rune printed word | 23 | 26.74% |
| Final rune of a multi-rune printed word | 19 | 22.09% |
| Strict interior rune | 44 | 51.16% |
| One-rune printed word | 0 | 0% |

The event-value identities span 28/29 GP rune classes, with no observed triple; this fits an immediate-neighbor operation more naturally than a few specially printed alphabet symbols. The event positions cut across real word boundaries and physical linebreaks. The test evaluates source-occurrence **positions**, not original cipher output identities.

## Native-register test and decision

All native reference donors use the documented GP29 transliteration from the source, longest-token segmentation and a stated conventional normalization `V→U`, `K/Q→C`, `Z→S`. These controls approximate native English, and are **not claimed to equal the author's unknown spelling conventions or plaintext**.

For each possible distinguished plaintext rune `S` (29 options), the test computes a two-part *deviance*: (1) binomial divergence of its prevalence from 86/12,901, and (2) conditional four-bin multinomial divergence of its placement in printed words, adding 1/2 pseudocount per position bin to avoid zero-probability estimates. Minimizing over all 29 symbols explicitly charges the free identity of `S`.

| Independent native English donor | Best S | Minimum combined deviance |
| --- | --- | ---: |
| Gibran, *The Prophet* | P | 67.06 |
| Emerson, *Essays* | EA | 89.14 |
| Shakespeare, first 300k text | P | 85.89 |
| 384 deterministic original-word-length-matched books assembled from those donors | EA on the best book (seed 275) | **50.87** |

The word-length-matched samples use **every original physical page's actual word lengths** and all 12,956 slots with deterministic selections from source-native words of matching GP29 rune length. Their construction is a distributional control, not independent fluent prose. Across all 384, **none** gives a combined deviance below 50.87, despite choosing the best symbol freely for each sample. The closest candidate usually exploits very rare EA whose overall prevalence matches the repeat rate, yet in native English its within-word occurrence is overwhelmingly interior, incompatible with the original event placement.

**Positive test:** a fully invertible 29-state evolving-substitution plant maps an original-layout native GP29 donor to a ciphertext in which **and only in which** its EA plaintext positions become adjacent equal ciphertext. Its 12,956 runes invert exactly, including all page boundaries; the planted source gives **95** repeats distributed `[7,1,87,0]` and the unchanged code correctly selects EA as its best symbol, with combined deviance **1.18451**. This confirms that the failure on original ciphertext is a genuine natural-register mismatch rather than a broken cipher inverse or parser.

### Conclusion and useful next decision

**The source-native static distinguished-escape explanation is strongly disfavored for ordinary English and intact printed word positions.** It remains mathematically possible for unusual English, other-language register, an author-selected S with deliberately distorted lexical placement, deliberate resegmentation, or a cipher where the plaintext symbol triggering a repeated ciphertext rune changes with state. The corpus samples are finite and literary; the deviance is a diagnostic likelihood ratio, **not** an exact empirical probability that LP2 is or is not English.

The next valuable attack must explain **why the repeat trigger varies with position/state or how word positions are transformed**. In particular, a proposed reversible 29-symbol feedback cipher can be challenged against the exact observed joint distribution of doubles versus original word position *before* fitting keys. A time-dependent special symbol evades this test but needs a clue selecting the exception schedule; an arbitrary private per-position permutation would simply fit any text without recovering it.

**No unknown LP2 plaintext, key, external endpoint or author-selected cipher operation has been recovered.**

## Reproduction

- Original-input SFT (CommonJS/Node 22, full inverse positive plant): [`sims/lp2_adjacent_repeat_fixed_plain_symbol_original_sft.cjs`](../sims/lp2_adjacent_repeat_fixed_plain_symbol_original_sft.cjs).
- [Windows Node22 PASS, GitHub Actions run 45120286597](https://github.com/FlareZ123/liber-primus/actions/runs/45120286597); the first run 45120189907 failed solely because a too-strict smoothed positive plant tolerance was set to 0.2 rather than the observed 1.18451. The corrected controlled test passes without changing the original input, original gates or candidate rankings.
- Controls are existing source-stable `resources/control/gibran_prophet_58585.txt`, `emerson_essays_2944.txt`, `shakespeare_first300k.txt`. No new workflow or external key material is needed.
