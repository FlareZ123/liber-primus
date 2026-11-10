# Two GP29 zero-step markers at word starts and interiors: source gates and exact original-cipher inverse

**Evidence classification, 10 November 2026:** key-independent finite necessary-condition experiments and a **negative original-cipher heldout inversion** for one source-selected AES128 architecture. The apparently favorable aggregate Latin fit is overturned by exact word-length conditioning. **No unknown LP2 plaintext, historical key, encryption mechanism or destination has been recovered.** The conditional exclusions assume original GP plaintext words retain the manuscript's printed word boundaries and letters; other plaintext languages, changed segmentation, source KDFs and hidden-state channels remain open.

## Mechanism and exact source scope

A lossless predecessor-differential GP29 cipher may reserve **one plaintext rune at canonical word starts** and **another at all other positions**, both represented in ciphertext by zero field difference. Because 29 is prime, a nonzero field step is one of 28 values and can bijectively represent the remaining 28 plaintext GP letters. An unknown secret-key stream can permute those 28 ranks without altering the forced equivalence:

\[
C_i=C_{i-1}\quad\Longleftrightarrow\quad P_i=
\begin{cases}a,&\text{if }i\text{ begins a new canonical word}\\
b,&\text{otherwise.}\end{cases}
\]

Here \(a,b\) can be **any of the 29 GP letters**, including the same letter; all **841 pairs** were evaluated. The first manuscript symbol has no predecessor and uses a separate 29-state initial map. Punctuation, physical line wraps and page changes are *not* implicitly word boundaries: [the established parser](../sims/lp2_word_pages.cjs) retains all 32 cross-page words.

The original LP2 unsolved ciphertext has **12,956 GP runes across 2,896 whole words**. Its 86 repeat events split as **23 word starts, 44 word middles and 19 word ends**, with matching predecessor-opportunity counts **2,895 / 7,247 / 2,813**. Restricting to complete words of length 1–12 removes only **seven** words while retaining every repeat: 2,889 words and 12,861 predecessor opportunities **2,888 / 7,167 / 2,806**, with repeats unchanged. The distinctions among first, middle and terminal positions are predictions of *plaintext symbol roles*, independent of the unknown stream key.

The authentic reference register is the original GP alphabet in [LP2 canonical numeric corpus](../resources/liber-primus/lp2-corpus.json), joined to [the original-word parser](../sims/lp2_word_pages.cjs). Three ordinary-English source controls are preexisting Shakespeare, Gibran and Emerson text, encoded by the existing GP transliteration/orthography with both retaining and contracting ING. The Latin reference is the preexisting 39,835-word [word-preserving GP Latin Vulgate corpus](../resources/control/latin-vulgate-gp-wholewords.txt), not a newly inferred plaintext.

## 1. First/middle/end pooled test: a conditional Latin mirage

For every source, estimate expected occurrence counts at the original LP2 **word-length-matched** first, middle and terminal slots. Refit both unknown marker symbols to minimize the sum of three product-binomial deviances, and compare the resulting optimum to **3,000 independently sampled complete source-word collections** per true pair. For *each* synthetic collection, repeat all 841 candidate-marker fits. Report the least-favorable empirical upper-tail frequency across **all 841 true marker pairs**. Whole-word sampling retains word-internal correlations. This is conditional Monte Carlo estimation rather than a distribution-free bound.

| Reference and GP orthography | Best first marker | Best inside marker | Fitted three-role deviance | Max nulls ≥ observed across any true pair, per 3,000 |
| --- | --- | --- | ---: | ---: |
| Shakespeare, unchanged ING | E | W | 53.67660 | 0 |
| Shakespeare, contracted ING | E | NG | 48.74781 | 0 |
| Gibran, unchanged ING | EA | W | 28.81225 | 0 |
| Gibran, contracted ING | EA | W | 29.78524 | 0 |
| Emerson, unchanged ING | Y | TH | 24.15845 | 2 |
| Emerson, contracted ING | Y | TH | 23.49845 | 1 |
| **Latin Vulgate** | **G** | **X** | **1.64463** | **2,047** |

For the Latin **G/X** pair the three expected counts were **20.0468 / 38.5512 / 22.1904**, apparently close to the original **23 / 44 / 19**. The worst-case empirical tail under the Latin pooled test is **2,048/3,001 ≈ 0.68244**; this plainly fails to reject the *pooled* Latin model. The initial fit was genuinely informative as a testable surviving hypothesis, but was **never** sufficient evidence for an authentic Latin decipherment.

[Executable 841-pair full-word Monte Carlo](../sims/dual_marker_wordrole_gate.cjs) · [successful manual CI run 42857837575](https://github.com/FlareZ123/liber-primus/actions/runs/42857837575).

## 2. Word-length-conditioned Latin test: decisive conditional failure

The pooled first/middle/end statistic hides strong interactions with **word length**. Refine the same Latin test without choosing any new key: create eight original word-length bins 1,2,3,4,5,6,7,8–12 and three role categories, retaining the original **21 role-by-length cells** with nonzero opportunities. For every GP marker, estimate the source probability from the original *exact* length's word corpus, with fixed Jeffreys smoothing of 0.5 pseudocount per symbol, then sum the binomial deviances across bins. This score is allowed to reselect the best of **all 841 marker pairs**.

The original role-by-length repeat counts are:

| Printed word length | Word first | Word middle | Word terminal |
| --- | ---: | ---: | ---: |
| 1 | 0 | 0 | 0 |
| 2 | 3 | 0 | 1 |
| 3 | 6 | 3 | 7 |
| 4 | 5 | 8 | 4 |
| 5 | 6 | 5 | 1 |
| 6 | 1 | 8 | 0 |
| 7 | 0 | 4 | 3 |
| 8–12 | 2 | 16 | 3 |
| **Total** | **23** | **44** | **19** |

The G/X expectation does not match these counts. For example, using the finite source-reference GP frequencies with the stated 0.5 smoothing, the six original repeats at starts of length-three words compare to only **0.059 expected G** occurrences. At the interior of those same length-three words the actual three events compare to approximately **0.773 expected X**. This contrast is invisible when all word lengths are pooled.

**After refitting every possible pair**, the best word-length-sensitive Latin assignment becomes **L at word starts and AE elsewhere**. Its total deviance is **91.20436**; the previous G/X model worsens to **179.76657**. For **every** one of the 841 potential true pairs, none of **3,000** independently resampled source-word collections produced a reselected best-pair deviance as large as the actual original. Thus the most permissive estimated add-one tail is **1/3,001 = 0.00033322** under the declared word-preserving Latin-Vulgate model and fixed 0.5 source smoothing. In particular the direct prespecified G/X null has **0/3,000** exceedances.

This is a materially stronger finite disconfirmation of the **literal GP Latin Vulgate source-word/register interpretation**, including both arbitrary fixed plaintext zero-step marker symbols and unknown key rotations. It is not a universal impossibility theorem about Latin prose, a distribution-free probability, nor a proof about a cipher whose spaces or plaintext alphabet do not preserve source words. Alternative historical Latin genres may differ, especially in short-word frequencies. The original 86 repeated output runes remain a useful necessary-condition signature for any future fixed-marker proposal.

[Executable length-stratified family gate](../sims/dual_marker_latin_length_gate.cjs) · [successful manual CI run 42858917763](https://github.com/FlareZ123/liber-primus/actions/runs/42858917763). The implementation compares all 841 source-model marker pairs, reselects all 841 in each of 3,000 whole-word resamples and asserts original first/middle/terminal totals.

## 3. Exact original AES128/F29 inverse: negative on authentic text, passes native plant

A separate finite original-cipher inverse uses **the pooled Latin candidate G/X** to construct an explicit, completely reversible 29-rune transform. At each original word start its reserved GP marker is G (GP index6); all other positions reserve X (index14). For nonzero predecessor differences use the 28 field powers of primitive root **15 mod29**, deleting the role's special rune from the ordered GP alphabet and applying a 28-state secret-key rotation. Use the original p15 Fibonacci-indexed prime spiral's 16 rank selectors to choose AES128 keys from p49–51's printed 256-byte base60 grid, as implemented by the preexisting [source key derivation](../sims/fibonacci_indexed_grid_iv.cjs). These are candidate source mechanics, never authenticated Cicada instructions.

Test **eight selected source 16-byte AES keys × two rotation signs × two byte reducers × two zero-marker pad-clock policies × two book/word pad resets = 128 modes**. Fit source-key model on physical LP2 p0–27 (6,761 rune positions); score the frozen mode on p28–55 (6,195 positions) using a 24,000-word Latin-Vulgate-trained word-trigram interpolated with lower-order likelihoods. Also fit all 128 modes on each of 12 independently generated wrong-source-key sets.

| Evaluated original/source-language property | Result |
| --- | ---: |
| Best authentic training model heldout Latin log-likelihood/rune | **−5.149395** |
| Retrospective best heldout of all 128 authentic candidate modes | −5.082986 |
| Independent wrong-key replicate heldout range (12 entire searches) | −5.168755 to −5.094357 |
| Wrong-key replicates outperforming the train-selected authentic source key | **9/12** |
| Source-derived AES native-Latin known-key plant, heldout score | **−2.379334** |
| Native known-key planted source configuration rank | **1/128** |
| Native known-key plant symbol recovery | **12,956/12,956** |
| Exact original-cipher full re-encryption | All 12,956, **including a wrong-key inverse** |

The finite AES128/GP29 two-marker model fails to produce credible Latin on genuine original LP2 ciphertext. Source-Latin synthetic plaintext is identified and completely inverted under the identical code, so the negative original result has demonstrated control sensitivity. All wrong keys still exactly reencrypt the original ciphertext because the architecture is bijective, so a successful original reencryption is an **implementation invariant**, never an authentic-key identification.

[Executable source-locked inverse](../sims/dual_marker_latin_field_inverse.cjs) · [successful original+plant CI run 42856913950](https://github.com/FlareZ123/liber-primus/actions/runs/42856913950). All source-native and word-length checks run through the preexisting [manual-only Fibonacci AES grid workflow](../.github/workflows/fibonacci-aes128-grid-manual.yml). No per-commit workflow was added.

## 4. Independent fixed-total repeat-leakage control

As a direct alternative to **plaintext-marker** causes, test whether the remaining identical ciphertext pairs can arise with a single **position-independent residual repeat probability** after some otherwise unspecified no-repeat enforcement. Condition on exactly **86 observed repeats** across the **12,861** predecessor opportunities in the same 2,889 original complete words. Allocate each simulated event to one of the **21 available word-role × word-length cells**, in proportion to the number of original transitions in that cell. This uses the original source geometry but assumes no plaintext language, key, marker identities or replacement rune distribution. The fixed-total multinomial likelihood-ratio statistic G² compares the resulting cell counts to their expected counts.

The original statistic is **G² = 21.60420139**. Across **100,000** seeded multinomial samples, the mean null G² is **21.78440812**, with **47,557** simulations as or more discrepant than the original. The add-one empirical upper-tail frequency is **47,558/100,001 ≈ 0.475575**. Thus the original distribution of rare repeat events across word lengths and roles is **compatible with a uniform 0.66% residual doublet probability**, unlike the particular plaintext-marker GP Latin source. This model is intentionally underspecified: it does not explain how the other 28 nonzero ciphertext differences become uniform, locate a historical plaintext key or establish that source text boundaries were discarded.

This is a useful model-selection distinction: the transcript's source-independent repeat geometry has an ordinary multinomial fit when both the observed event total and original word layout are conditioned upon. The source-conditioned GP Latin marker mechanism, which superficially matched all three pooled role totals, fails its independent word-length prediction. Do not infer a unique mechanism from goodness of fit alone. The source-independent comparison is implemented in the same [length-gate program](../sims/dual_marker_latin_length_gate.cjs) and passed [opt-in manual CI run 42860046434](https://github.com/FlareZ123/liber-primus/actions/runs/42860046434).

## Research decision and boundaries

The two-register construction is an exactly reversible mechanism capable of representing all original repeated ciphertext pairs. Its source-conditioned word-length pattern disagrees with the original, while a key-free, word-role-independent residual-repeat process remains compatible with the same 21 original word-layout cells. However, its most suggestive Latin reading **disappears under more detailed necessary-condition testing**, even allowing every possible fixed marker pair. A source-derived AES-grid instantiation produces a near-random original decode while passing a blind independent Latin plant with its authentic source key.

Consequently **do not treat G/X, L/AE or the p15→grid AES128 connection as a candidate genuine LP2 key or recovered plaintext**. Retire that exact native-Latin fixed-word marker plus tested AES state family. Reopen only with an independent original clue that specifies a different plaintext register, word segmentation, state machine or key schedule and makes a genuine original-cipher plaintext prediction. The remaining useful conceptual advance is a reproducible **key-independent source-word necessary-condition gate** for future differential ciphers, which can reject an architecture even when its pooled repeat rate seems attractive.

This report preserves the conditional source evidence and exact finite original inverse without promoting a speculative decryption to [established results](../results/README.md). All source-word nulls and AES controls have pinned scripts and successful opt-in CI logs.
