# LP2 printed-word syntax and source-typed sentence reflow: original-input decision

**Scope:** All 55 rune-bearing unsolved LP2 physical pages p0–p55, joined across the 32 genuine page-carry words, with a separate p16–p21 development region and held-out p40–p53 region. **Classification:** source-exact word-grammar observation and a negative bounded reversible-operator test. **No plaintext, independent key, or author-selected decoder has been recovered.**

## Causal question

A decipherment based on direct per-printed-word Caesar, affine transforms, or stationary secret substitution inherits the printed word segmentation. Those operations cannot restore the ordinary ordering of *word lengths*: they preserve the sequence. A reversible **word-boundary or word-order transducer** can escape this issue without predicting an unknown private key. But such a transducer should explain why an original reader would choose its route and should restore syntactic evidence on ciphertext withheld from selection. The rival explanation is that the printed lengths are deliberate cover-text formatting or unusual prose and need not be English/Latin plaintext words in reading order.

The exact source is `resources/liber-primus/lp2-transcription.txt`, with typographic line wraps joined, periods kept as printed sentence-like stops, and all 32 page-crossing words kept whole. The source contains 2,896 words, 12,956 runes, 83 singleton words, 448 two-rune words, and **175 nonempty period-delimited scopes**. The rune-free numeric physical page p50 is omitted from the normalized stream; it cannot create a rune boundary. This is a hypothesis test on printed-word grammar, rather than a claim to identify the plaintext language.

## A source-preserving, language-comparative constraint

The manuscript has **531 words of GP length one or two** (18.3356% of printed words), and **94 pairs of neighboring short words** out of 2,895 neighbor positions. When only original short/long class counts are fixed and their order is uniformly shuffled, the exact expected number of short–short pairs is **97.1788674**; the observed/expected ratio is **0.96728849**. The original printed sequence displays virtually no local avoidance of adjacent short words under this control.

This is unusual in the actual matched reference material, and the result is not driven solely by the short-word proportion. The independently sourced Latin Vulgate GP29 corpus has **7,156 short of 39,835** words (17.9641%, close to 18.3356%); it has **632** short–short pairs compared with **1,285.33149** expected under a length-shuffled Latin corpus, ratio **0.491702**.

A secondary, deliberately overlapping 2,896-word window diagnostic (stride 97) across pinned historical source corpora gives:

| Source, GP-length encoded | Windows | Minimum ratio | Median ratio | Maximum ratio | Windows ≥ LP2 ratio |
|---|---:|---:|---:|---:|---:|
| Latin Vulgate | 381 | 0.2692 | 0.4895 | 0.8155 | 0 |
| Gibran, *The Prophet* | 133 | 0.6396 | 0.8204 | 0.9236 | 0 |
| Shakespeare | 542 | 0.5673 | 0.7545 | 0.9025 | 0 |
| Emerson, *Essays* | 774 | 0.5741 | 0.6805 | 0.8291 | 0 |

These **overlapping windows are descriptive comparators, not 1,830 independent significance trials**. All comparisons depend on the specified phonemic GP digraph encoding and texts. The absence of a matching donor does not exclude all real languages, and it does not distinguish an extra ciphertext-space operation from a high-entropy mechanism whose word lengths were independently assigned.

## Original punctuation-scope grammar and native solved control

Condition on the **175 exact printed period scopes**, including each scope's complete-word lengths and number of short words, and permute only within its own scope. The exact short–short expectation then becomes

```text
sum over scopes (short_count × (short_count − 1) / word_count)
        = 85.90505517407924
```

The original LP2 source has **88 internal short–short pairs** (excess +2.094945). Real solved GP29 Liber Primus source text (nine published source-native registers, 740 GP words) gives **42** internal short–short pairs against scope-conditioned expectation **50.840717** (deficit −8.840717). Both are scope-conditioned descriptive counts; original solved words are a smaller, thematically related but separate sample.

The source's scope-terminal word is also strikingly ordinary under within-scope permutation: its word-length z is **−0.683562**, compared with **+5.836772** for the actual solved-GP29 source. The other source-native reference sentences show positive terminal word-length deviations (Gibran +22.62, Shakespeare +19.50, Emerson +39.98 on their own much larger sentence samples). English sentence endings often prefer longer nouns/verbs over articles and particles; this is a corpus-dependent association rather than a universal plaintext law.

**Decision significance:** LP2's printed punctuation may still delimit genuine statements, while the interior word-length order does not exhibit the syntax of the pinned natural-language sources. Plain per-word value substitution cannot change this. An authenticated decoder should specify how its output spaces and sentence positions are recovered; guessing spaces with a dictionary after decryption would not be a source-selected inverse.

## Complete reversible source-typed word reflow decision

The manuscript directly presents **five** numbered runic statements and the separate **eight-column** 32×8 numeric register. I tested the narrow human-executable interpretation that those two original numbers select a fixed width in each period scope. For a scope with `n` source words, place the words in a partially populated rectangle of width `k` (k=5 or k=8), then read down columns in one of two full inverse orientations, keeping punctuation and the original page-carry/word-length tape as recoverable sidecar. The exact algorithm is a permutation of all source complete words and works on incomplete final rows; **both inverse orientations round-trip every original source scope and genuine solved-GP source control** without losing a rune or printed boundary.

Evaluate, without fitting any rune cipher, a fixed **five-category Latin word-length first-order Markov log-likelihood ratio per adjacent pair**, trained on the independent Latin GP text. Compare physical pages 16–21 as development input with p40–53 as an independently held-out input. Higher is more language-like under this limited reference.

| Width and read | p16–p21 development | p40–p53 held out |
|---|---:|---:|
| Original, width1 | −0.018584 | −0.008849 |
| Five-column forward | −0.019252 | −0.019062 |
| Five-column inverse | −0.025695 | −0.010028 |
| Eight-column forward | −0.005986 | −0.013759 |
| Eight-column inverse | −0.013982 | −0.016837 |

Eight-column forward improves the development score but worsens held out. All four source-numbered reflows remain **negative** on the held-out material and none yields deciphered rune values, an authentic plaintext word stream, or a first-party instruction to move words between actual period scopes. This rejects the exact 5/8 column-order language-restoration story under this tested diagnostic. These word-order routes are narrower than the author's unknown full cipher.

## Next decipherment decision

Seek an **independently visible full-paragraph operator that recovers spaces and changes rune values together**, particularly one with a worked source-native solved example and a frozen receiver on unknown ciphertext. The original source's boundary tape can serve as an input or a side channel, but a new plaintext segmentation must be deduced from that tape or an authenticated key. A proposal should account for all 32 page carries and native one/two-rune words and produce a contiguous held-out natural-language readout, then predict additional original rune positions.

Retire simple **period-scoped column width five/eight rearrangement** unless a new first-party instruction determines a different filling route. Preserve the broader observation that the original printed short-word grammar is unlike these matched native-prose donors. A native solved punctuation comparator and a source-selected full-alphabet inverse are the next discriminating inputs.

**Reproduce:** [Windows-compatible Node22/CommonJS read-only source test](../sims/lp2_wordlength_sentence_boundary_reflow_original_sft.cjs); input files and all exact assertions are named in the code. Existing [integrated original-cipher challenge](../workplace/integrated-original-inversion-challenge.md), Director [#2278](https://github.com/FlareZ123/liber-primus/issues/2278), and original [source description](../resources/liber-primus/README.md) define how this fits earlier failed word-order and space-code tests. **Status: conditional source constraint; no unknown plaintext recovered.**
