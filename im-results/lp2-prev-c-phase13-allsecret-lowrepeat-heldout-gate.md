# A reversible low-doublet cipher, its original word-start obstruction and an all-secret 13-phase decoder test

**17 November 2026 · Agent10. Evidence: constructive source-native cipher/known-key positive; independent original-source key-independent necessary-condition obstruction; blinded all-secret plaintext-recovery negative. No authentic unknown LP2 plaintext, author key, selected operation, or destination recovered.**

## Original problem and actual mechanism tested

The unsolved manuscript has **12,956** original GP29 runes across **55** rune-bearing physical pages, **12,901** within-page adjacent successor positions, and only **86** identical adjacent ciphertext runes. Physical images repeatedly use **13-dot punctuation**. Those clues suggest testing a 13-phase, previous-ciphertext-conditioned **full** rune-substitution transducer. No first-party text prescribes this operator or its secret tables.

Let `i` count rune positions from the start of each physical page, and `s=(i mod13,C[i−1])`. There are **13×29=377** public states, each with a completely independently chosen secret permutation `π_s` of **all 29** authentic GP runes. The page's first rune is an unmodeled public IV. At every other position:

```text
C[i] = π_(i mod13,C[i−1])(P[i])
P[i] = π⁻¹_(i mod13,C[i−1])(C[i])
```

This is a **complete one-to-one, one-rune-in/one-rune-out cipher**. No plaintext rune is suppressed, altered, buffered or discarded. It can generate long nonrepeating runs for a natural-language input even though ciphertext doubles remain possible for other inputs. Hence a hypothetical *universal* sidecar-information lower bound for a cipher forbidding all repeat outputs does not apply here.

## Concrete low-doublet construction and its exact condition

Each of the 377 independently seeded GP29 permutations is fixed so that either GP rune **NG** (for 3/4 of secret states) or GP rune **J** (for 1/4) maps to the preceding ciphertext rune. All 28 other plaintext runes map bijectively to the other 28 outputs by an ordinary seeded Fisher–Yates permutation. The **exact** identity is

```text
C[i] = C[i−1]  iff  P[i] ∈ {NG,J} and
                         P[i] equals that state's particular selected rare rune.
```

Gibran's authentic 63,114-rune GP29 control has NG frequency **523/63,114** and J frequency **141/63,114**. Their selected 3:1 mixture has marginal probability **0.00677346**, or **87.38** expected repeats among 12,901 successors under an independence approximation. The actual deterministic positive, with original page lengths and fixed PRNG seed `0x33011313`, yields **78** repeats versus original **86**. The source-true secret inverse exactly recovers **12,901/12,901** independently constructed genuine English GP symbols, with complete re-encryption.

**Key caveat:** this 3:1 mixture was chosen by the analyst after inspecting the original repeat deficit. The close total count is a **constructive demonstration**, with no evidential force establishing Cicada used this trick. Moreover this first plant transplanted a **contiguous** genuine GP-English stream into the original *page* geometry; its source English **word boundaries were not aligned** to the original printed words. It therefore cannot establish an English-like **word-position** explanation.

### The original printed word-start evidence rejects this specific rarity selection

The original transcription preserves **2,896 complete printed words** including **32 words continued across physical page cuts**. Classify all 86 original same-rune successor sites by the **destination rune's** true printed-word position, without changing any original ciphertext. The result is **23 first-rune-of-word, 19 last-rune-of-word, 44 strictly internal**. The model above has a key-independent necessary consequence: if those source word boundaries also delimit the plaintext words, then **all 23 repeated ciphertext runes at word starts must be plaintext NG or J**, regardless of any of the **377 unknown secret permutations**.

This is a severe conflict with source-calibrated GP29 English. Among **every contiguous 2,896-word window** of the repository's three historical English sources, no one even contains 23 words **starting** with NG or J:

| Original word-boundary test | Source-native English words | All overlapping 2,896-word windows | **Largest** NG/J-initial count | Windows attaining 23 |
|---|---:|---:|---:|---:|
| Gibran, *The Prophet* | 15,733 | **12,838** | **22** | **0** |
| Shakespeare | 55,407 | **52,512** | **13** | **0** |
| Emerson | 77,932 | **75,037** | **18** | **0** |
| **Combined** | | **140,387** | **22** | **0** |

This is a **necessary-condition source comparison**, with no original key or language scoring. It is not a mathematical impossibility theorem for arbitrary original English writing: unusual prose might start 23 of 2,896 words with J, original printed word boundaries might not survive encryption, or the true alphabet could be nonstandard. But no ordinary GP-English native control window supports the 23-word-start requirement.

An independently fixed **word-shape-matched** second positive preserves **each of the original 2,896 word lengths** exactly. It deterministically samples genuine Gibran GP rune-words of those exact lengths (seed `0x33012113`), carries words over the same 32 page boundaries, and encrypts them under the **same previously frozen 377 permutation tables**. The result is revealing:

| Exact original-source geometry | Original LP2 | Genuine GP-English length-matched plant |
|---|---:|---:|
| Adjacent repeated runes | **86** | **113** |
| Repeats at start of printed word | **23** | **7** |
| Repeats at end of printed word | **19** | **75** |
| Repeats strictly internal to printed word | **44** | **31** |
| Equal glyphs five apart inside printed words | **104/2,105** | **82/2,105** |
| Correlation of consecutive inter-doublet gaps | **+0.3800196892** | **+0.1690128506** |

The high number of native GP-English terminal-NG words explains why the shape-matched plant produces so many word-final doubles. Even the first contiguous-plaintext positive has **79/2,105** five-back matches and **−0.0720162765** gap correlation, compared with the original **104/2,105** and **+0.3800196892**. The original gap correlation is separately affected by printed-line occupancy and must remain a secondary diagnostic, rather than a cipher-attribution claim. These single-plant observations are **not** a distribution-level rejection of all possible 377-state tables, but they show how a convincing *global* repeat-rate fit can fail the richer **source-exact word geometry**.

## Direct original plaintext-recovery attack, unknown 377 secret tables

Independently of the rarity construction, generously allow **every hidden state an arbitrary GP29 permutation**, rather than assuming a particular rare symbol mapping, a Caesar shift or a 28-letter exclusion rule. Fit the exact maximum-unigram-likelihood inverse from original ciphertext **training pages only**, with GP29 authentic-English rune frequencies fixed from the genuine Gibran reference. The optimum over each state's **29! possible permutations** is computed analytically by sorting that state's 29 ciphertext occurrence counts and matching them to decreasing independent English rune frequencies (the rearrangement inequality). This is the exact maximum-likelihood decoder under this fixed independent-unigram model; it does not claim to maximize every possible higher-order language model.

Hold out **entire original physical pages** before learning any substitution. Score the *frozen* learned 377 tables on the untouched pages, as well as on the independently secret-encrypted source-native low-doublet positive under precisely the same training procedure.

| Training pages (others held out) | Train / holdout rune transitions | Original withheld GP-English log gain, nats/rune | Genuine low-repeat GP-English positive |
|---|---:|---:|---:|
| Even original page indices | **6,314 / 6,587** | **+0.01105430** | **+0.63111328** |
| First 28 of 55 original pages | **6,733 / 6,168** | **+0.00179456** | **+0.64562540** |
| Odd original page indices | **6,587 / 6,314** | **+0.00991956** | **+0.62756338** |

The separate source-native **length-matched** positive also produces **+0.63453748** nats/rune on the first alternating split under the same blind learned tables. The source-original withheld improvement is essentially zero in all splits. These experiments show the same inference has real power at the actual sample size, and learns **no transferable 13-phase/previous-C GP29 English substitution codebook** from the unknown pages. In-sample fitting can falsely improve the original ciphertext because the model has 377 secret tables; we do not count that as progress.

This is materially different from the prior [period≤10 ciphertext-feedback conditional-entropy exclusion](lp2-cipher-feedback-conditional-entropy-gate.md), because a period-13 family escapes that key-independent bound, and from the separate [377-state additive-shift test](lp2-prev-c-state13-original-heldout-decryption.md) which allows only 29 secret Caesar rotations per state. Every permutation is allowed here.

## Cryptanalytic decision and reproduction

The **observed 86 low doublets do not require a lossy collision-repair encoder or an explicit sidecar**: a deterministic fully invertible English-biased transducer demonstrates how low repeats can arise while retaining every GP rune. But the current construction is **specifically disfavored** by original word-role geometry, and even the unrestricted 13-phase/previous-C substitution cannot be learned into source-native English on held-out original pages by an exact per-state unigram-MLE decoder. No source-authored selector supplies the necessary table or seed. **Retire this rare-J/NG receiver as a direct explanation of the original manuscript**, and do not fit another arbitrary rare-rune mixture solely to match counts.

Reproducer: [complete source-read-only Windows/Node22 CommonJS SFT](../sims/lp2_prev_c_state13_allsecret_english_holdout_sft.cjs). Original: [canonical LP2 rune indices](../resources/liber-primus/lp2-corpus.json), [printed transcription](../resources/lp2-transcription.txt) and [shared word parser](../sims/lp2_word_pages.cjs). Controls: [Gibran](../resources/control/gibran_prophet_58585.txt), [Shakespeare](../resources/control/shakespeare_first300k.txt) and [Emerson](../resources/control/emerson_essays_2944.txt). It asserts all 377 complete bijections, **12,901/12,901** known-key genuine-GP planted inverse positions, both exact-original-length plaintext plants, full original 86/23/19/44 repeat-role counts, independent 140,387-window necessary-condition screening, all three blind page holdouts, and the distinct five-back/gap diagnostics. The exact committed SFT passed using a deterministic V8 Node-API-compatible harness against the live fetched repository bytes; Windows CI is separately queued.
