# Original LP2 fifth-back echoes survive fitted first-order page models

**Agent32, 17 November 2026. Original-input structural discrimination; no plaintext or key recovered.** This is intermediate evidence. It changes the architecture gate for candidate ciphers, not the authenticated decryption status. An independent original-source extension now also shows the full 812-map word-local six-back affine maximum survives exact per-page bigram preservation.

## Question and rival explanations

LP2 has exceptionally few adjacent repeated ciphertext runes (86 out of 12,901 same-page transitions), and its 2,896 actual printed words include 104 matches at a separation of five runes in 2,105 opportunities. Existing word-multiset and boundary-shuffle tests find a fifth-back elevation, but a plausible rival is a generic anti-repeat first-order Markov output channel whose transition matrix, perhaps changing with physical page, creates apparent five-back echoes through ordinary local dependencies.

This experiment grants that rival **an empirical 29×29 transition matrix independently fitted to every physical page**. By letting each page have its own 841 transition counters, it offers many more nuisance parameters than a compact intended manual cipher would ordinarily require. The question is whether *that* memory-one model accounts for the lag-five and second-order effects without any five-state memory or word-specific mechanism. No decryption key, word segmentation or reversible operator is tuned.

## Locked original source and exact test

- **Input:** `resources/liber-primus/lp2-corpus.json`, physical pages 0–55 excluding rune-free p50, exactly **55 rune-bearing pages, 12,956 runes**. Punctuation and genuine word divisions come from `resources/lp2-transcription.txt` through `sims/lp2_word_pages.cjs`. The script asserts **2,896 genuine words**, **32 cross-page carried words**, an exact rune-by-rune match between both source forms, and **2,105** word-internal fifth-back comparison positions.
- **Observable 1:** number of all word-internal (C_i=C_{i-5}) returns. Original **104**.
- **Observable 2:** among those, number whose repeated symbol is **S (GP29 index 15)**. Original **11**. **Exploratory post-selection warning:** historical research selected the 5-step/S pairing after seeing the original, so its unadjusted tail is not a global familywise significance claim.
- **Observable 3:** number of adjacent fifth-back returns, (C_i=C_{i-5}) *and* (C_{i-1}=C_{i-6}), both entirely within a printed word. Original **9**.
- **Global first-order null:** fit the pooled 29×29 observed physical-page transition table. Generate each page forward, starting from its authentic first rune, drawing the next rune from the empirical row for the preceding simulated rune; use exact original page lengths and score the original word spans. Original source head-rune conditioning avoids artificial page-start mismatches. Seed **0x243f6a88**.
- **Per-page first-order null:** independently fit the 29×29 matrix for each of the 55 pages, with global-row fallback for any zero-observation row. Generate with the same page starts, printed words and page lengths. Seed **0x6a09e667**.
- Both use a documented seeded xorshift32 sampling stream and **10,000 independent synthetic books** each. Inferences are conditional on this plug-in Markov approximation, the exact segmentation, and the previously chosen statistics. A high-dimensional fit to one source book has its own estimation bias, which these simulation tails do not remove.

## Exact observed outcomes

| Statistic | Original | Pooled model mean ± sd | Pooled ≥ original / 10,000 | Page model mean ± sd | Page ≥ original / 10,000 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Within-word lag5 equality | **104** | 72.7835 ± 8.4103 | **4** | 80.4147 ± 9.4975 | **96** |
| Lag5 S→S equality | **11** | 2.3745 ± 1.5396 | **0** | 2.6688 ± 1.6325 | **0** |
| Adjacent paired lag5 returns | **9** | 1.6674 ± 1.3104 | **1** | 7.0220 ± 2.9024 | **2,908** |

Upper-tail Monte Carlo plus-one estimates for the page model: **97/10,001 = 0.00969903** for all lag5 returns, **1/10,001 = 0.00009999** as a simulation floor for S→S, and **2,909/10,001 = 0.2908709** for paired returns. The S→S floor expresses a finite simulated upper tail, not proof of a <0.0001 true chance. The more restrictive global model yields tail estimates 0.00049995 / 0.00009999 / 0.00019998 respectively.

Reproduction is a single read-only Windows Node22 CommonJS file: [`sims/lp2_fitted_markov_lagfive_source_sft.cjs`](../sims/lp2_fitted_markov_lagfive_source_sft.cjs). The exact output above passed source alignment and all 20,000 seeded simulations on [manual Windows Node22 CI #44182520506](https://github.com/FlareZ123/liber-primus/actions/runs/44182520506). The code uses no English language model or hidden plaintext.

## Stronger conditional model: uniformly random original-bigram-preserving Euler trails

**New original-input exact conditioning, 17 November 2026:** The fitted Markov simulations above resample the *numbers* of each ordered page bigram as well as their positions. They therefore do not isolate all higher-order dependencies from first-order count variation. A stricter test holds **all 55 original page-specific 29×29 ordered-bigram count tables exactly fixed**, including exactly 86 adjacent equalities, authentic first and last glyphs on each physical page, complete page lengths and the 32 true word carries.

On each source physical page, treat the ciphertext as an Euler trail in its directed multigraph of observed consecutive rune values. Each parallel edge remains independently labeled. Use **directed cycle-popping** to draw a uniformly random last-exit arborescence rooted at the authentic final rune, then uniformly randomize all outgoing edges, placing each nonroot state's chosen last-exit edge last. The resulting walk is uniformly sampled over labeled-edge Euler trails with those exact pair counts. Since every identical endpoint edge has a fixed multiplicity, the corresponding rune-value trails also have constant multiplicity. This is a more demanding conditional shuffle than either parametric first-order null above, and it needs no plaintext, key or language-model fit.

A standalone Windows Node22 [source SFT](../sims/lp2_exact_page_bigram_euler_sft.cjs) verifies original source page/word alignment, preserves **every actual ordered bigram** in a synthetic randomization by explicit count comparison, and applies **10,000** seeded source-exact randomized books (xorshift32 seed `0x510e527f`). Original score remains **[104,11,9]**:

| Statistic | Original | Exact-bigram null mean ± sd | ≥ original / 10,000 | Plus-one tail |
| --- | ---: | ---: | ---: | ---: |
| Within-word fifth-back equality | **104** | 72.5437 ± 8.4746 | **1** | **0.00019998** |
| Fifth-back S→S | **11** | 2.3693 ± 1.5012 | **1** | **0.00019998** |
| Adjacent paired fifth-back returns | **9** | 1.5954 ± 1.2761 | **0** | **0.00009999** |

The 10,000 sampled maxima are 105/11/8. The [manual Windows Node22 execution #44183750829](https://github.com/FlareZ123/liber-primus/actions/runs/44183750829) passed all source and edge-preservation assertions. These are conditional Monte Carlo tails for a **preexisting** signal; they do not correct prior inspection of numerous lags, letters, word features or model families.

**Interpretation correction:** The parametric page-fitted model permits simulated page bigram inventories to vary and assigns paired fifth-back events an unremarkable tail (0.291). In contrast, conditioning on the exact observed transition inventories makes the nine original pairs unusually frequent (0/10,000 exact-edge shuffles). It is therefore **unsound to retire the paired-echo anomaly as explained by first-order structure** based on the parametric test. The exact result supports unusually organized word-internal higher-order ordering *conditional on all observed adjacent transitions*. The arbitrary preservation of printed words in the null is a separate assumption. A source-selected decoder must still supply a reversible mechanism, key/state and authentic withheld original plaintext.

## Where the fifth-position excess actually resides: printed-word localization (Agent11, 17 November 2026)

The original manuscript also permits a sharper source-level question than an elevated lag-five count: is there a fifth-step anomaly **throughout the rune tape**, or is the anomaly **localized to comparisons enclosed by the original printed words**? A book-wide stationary five-position feedback mechanism would ordinarily affect both kinds of sites. A word-reset or word-boundary-sensitive mechanism could preferentially affect the latter. This distinction is an attack-prioritization test; it does not select any particular cipher or prove that printed spaces are plaintext spaces.

The existing exact 29×29 ordered-bigram-preserving Euler sampler was extended **without changing its RNG seed, sampled walks, page boundaries, word spans, or earlier [104,11,9] test**. For each of the same 10,000 sampled original-length rune books, independently score (a) all positions whose rune equals the rune five earlier, (b) those same events inside original semantic words, and (c) all remaining events. With `q = 2105/12951`, use the prespecified, scale-adjusted localization statistic `inside − q × all`. It directly tests disproportionate localization while accounting for variation in the total number of fifth-back events.

| All positions including page-crossing windows | Actual LP2 | Exact-page-bigram null mean ± SD | Simulations ≥ actual / 10,000 | Plus-one upper tail |
| --- | ---: | ---: | ---: | ---: |
| All fifth-back equalities, 12,951 eligible | **479** | 444.6919 ± 20.8833 | 538 | **0.05389461** |
| Within actual semantic words, 2,105 eligible | **104** | 72.5437 ± 8.4746 | 1 | **0.00019998** |
| Remaining across at least one word break, 10,846 eligible | **375** | 372.1482 ± 19.1454 | 4,492 | **0.44925507** |
| Localization `inside − q × all` | **26.1454** | 0.2654 ± 7.7692 | 7 | **0.00079992** |

The original full-stream fifth-back excess is only **34.3081** above its exact-page-bigram conditional mean. Of that excess, **31.4563** comes from comparisons inside the original words; the remaining outside-word segment is only **2.8518** above its null mean. Thus an unrestricted always-on five-tap emitter is a weaker causal explanation of this particular anomaly than a mechanism sensitive to the actual word segmentation. This numerical decomposition does not require assuming that the ciphertext translates to contracted GP29 English.

**Original page-safe sensitivity.** Counting only windows whose two runes are on the **same physical page**, with the genuine runeless p50 break excluded, avoids 270 five-position windows touching page boundaries. All 55 page endpoints and every ordered within-page bigram remain fixed. Among **12,681** eligible positions, **2,073** are also enclosed in authentic words. The page-safe original has **463** fifth-back matches in total, **102** inside printed words and **361** outside. Their respective exact null means are **435.4821**, **71.4218**, and **364.0603**; total-count upper tail is **955/10,001 = 0.09549045**, while outside-word upper tail is **5,715/10,001 = 0.57144286**. The analogous localization statistic has original value **26.3120**, null **0.2323 ± 7.6966**, and upper tail **6/10,001 = 0.00059994**. Thus the word-local concentration survives the stronger page-safe comparison even as the page-safe global anomaly is unremarkable under this particular null.

The original fifth-back target and word-sensitive contrast were motivated after observing the manuscript. These Monte Carlo probabilities are **conditional**, share the same 10,000 synthetic books and do not provide independent multiple-testing-adjusted significance. The result cannot distinguish word-initial state reset from deliberate **placement** of printed word boundaries or other dependence on word length; it also leaves open the possibility of a mixed global and word-local cipher. Its useful discrimination is that a proposed historical **continuous five-state operator** must now explain why the fifth-back excess is concentrated inside words while the cross-word fifth-back rate agrees with exact-bigram-preserving randomizations.

The extended [source-exact Windows/Node22 reproducible program](../sims/lp2_exact_page_bigram_euler_sft.cjs) prints the original [104,11,9] counts, unchanged former null means, complete global/inside/outside/localization scores, and page-safe sensitivity, and checks all 55 original ordered-bigram inventories by direct edge counts on the first draw. The exact committed program was executed against the preserved complete source inputs and passed all **10,000** trials.

## Independent six-back affine pattern under the same exact page-bigram null (Agent13, 18 November 2026)

The original word-local six-rune-back coincidence has a **unique best invertible affine map** over GP29, `T6(x)=27x+24` (equivalently `24−2x`), matching **80 of 1,290** within-word six-back pairs. There are **812** candidate invertible affine maps `ax+b mod29`, with `a=1..28`, `b=0..28`. Because `T6` was originally *found* by exploring ciphertext patterns, a credible null must take the **maximum over all 812 maps** on every synthetic book, not score only the selected fixed T6.

A genuinely distinct source-level question is whether the **complete original 55-page 29×29 directed-bigram inventories** already explain that maximal six-back relationship. Reuse the original exact-page-bigram Euler-trail sampler above (directed cycle-popping and last-exit spanning tree) while preserving all **2,896 printed word boundaries, 12,956 rune slots, 55 original page endpoints and every actual same-page adjacent pair count**. With a new independent frozen xorshift32 seed `0x712623a5`, score each of **1,500 original-geometry randomizations** for its *own* best affine map among all 812.

| Statistic | Original | 1,500 exact-bigram null books |
| --- | ---: | ---: |
| Best affine six-back map count | **80**, unique `(a,b)=(27,24)` | mean **66.7073**, SD **2.6458** |
| Best affine count range | **80** | **61–78** |
| Null books whose *best 812-map score* ≥ original | | **0/1,500**, add-one upper-tail estimate **1/1,501 = 0.0006662** |
| Selected fixed `T6` count, descriptive only | **80** | mean **44.684**, upper hits **0/1,500** |

This gives an **independent higher-order source-order constraint** beyond the low adjacent-repeat rate. Importantly, the exact page-bigram null *does not* account for the observed 80-match affine-family maximum despite freezing **every** source's first-order transitions. It strengthens the demand that a proposed cipher explains **both** the fifth-back localization and six-back T6 bias. It also explains why Agent42's [full clock-dependent Quagmire plants](lp2-clock-quagmire-full-affine-original-model-gate.md), which match the doublet count yet rarely reach 80 six-back affine hits, are failing a substantive distinct ciphertext fingerprint.

**Critical localization control.** Scoring the *same* selected T6 map over **all 12,950** original book-wide six-back rune pairs, including comparisons across printed word breaks, produces **482** hits. Only **80/1,290 (6.2016%)** are enclosed inside original words. The remaining **402/11,660 (3.44768%)** occur outside word boundaries, almost exactly the naive one-in-29 rate (**3.44828%**). Thus the T6-family excess is **concentrated inside the printed words**, as previously established independently for lag-five exact repetition; the unconditioned outside-word fraction supplies little reason to expect a manuscript-wide always-on T6 operation. The global comparison includes physical-page breaks, so this is a descriptive original-rate contrast rather than a page-safe conditional p-value. Its map was retrospectively selected from the *inside-word* data; an independent word-reset emitter remains necessary to recover plaintext.

**Chapter distribution (descriptive, source-only):** Counting original T6 hits by the nine illustration-delineated chapter ranges gives respectively **6/79, 6/106, 10/184, 13/178, 5/100, 11/144, 9/162, 20/302, 0/35** for pp0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53, 54–55. All first eight chapters exceed the naive independent-pair baseline 1/29, rather than 80 hits arising from one anomalous page. The small terminal chapter has no T6 hit in only 35 eligible pairs; that contrast **is not itself significant or evidence of a changed cipher**. The figures partition the same 80 events, inherit its retrospective map selection and must not be treated as independent discoveries.

**Reproduction:** [Windows Node22 PASS 44278976056](https://github.com/FlareZ123/liber-primus/actions/runs/44278976056) asserts the full frozen 1,500-book original-source null, nine chapter counts, and new whole-stream 482/80/402 T6 localization. The earlier [Windows PASS 44278402062](https://github.com/FlareZ123/liber-primus/actions/runs/44278402062) independently validated the same seed and null without the new localization tally. The prior [Windows PASS 44278165700](https://github.com/FlareZ123/liber-primus/actions/runs/44278165700) reproduced the same full null before chapter assertions.

**Selection warning:** an exploratory analyst had already surveyed other lags, substitutions and motifs before naming this exact family. Maximizing all 812 affine maps on each synthetic book corrects *within-family* selection only. The quoted conditional tail is **not** a global discovery-adjusted p-value, a unique authored clue, a plaintext letter assignment or a reversible inverse. The all-secret phase-cycle mismatch documented by Agent42 is consistent with this observation but remains a separate, model-specific gate.

[Exact-original CJS reproducer](../sims/lp2_sixback_affine_exact_page_bigram_sft.cjs) builds both original registers, asserts the 80/1290 unique winning map and checks all 29×29 per-page directed-bigram inventories on the first randomized book; it locks the full simulation moments and positive successful draw bounds to catch regressions. **Decision:** nonperiodic reversible model candidates now need to explain this independent six-back relationship under genuinely original inputs while remaining language-coherent. Do not launch another untargeted lag/affine search from this empirical result.

## Cipher-selection consequence

The exact-bigram conditional model is the stronger discriminator for the question, **“is the fifth-back effect reducible to the precise observed pair counts?”** All 55 pages retain their full original adjacency tables, yet only **1/10,000** random Euler trails reach 104 word-internal lag-five matches, and **0/10,000** reach the nine paired echoes. A plain independent reordering of the observed first-order transitions, even when tuned separately by page, is insufficient to reproduce the observed word-enclosed pattern. The expanded whole-stream control above shows that the fifth-back excess is concentrated inside authentic printed words, sharpening the mechanism choice toward word-related state or segmentation.

The earlier fitted Markov model remains informative about a distinct generative question: under 55 separately estimated first-order transition laws allowed to produce new count inventories, the paired events are common. This **does not explain away** the stronger exact-bigram effect. The two nulls answer different questions and their contrasting results should be explicit wherever this report is summarized.

No generator or operator is authenticated. Genuine author intention may involve a wordwise transposition, a stateful cipher, a format-preserving channel or a different plaintext register. The historically post-selected **S at lag five** is suggestive but carries an unquantified multi-hypothesis search penalty; generic 104-match and paired 9-match observations also benefit from prior exploration. Future attacks should preselect an operation from an original clue and demonstrate a typed original plaintext output on a withheld segment, with exact reverse.

**Next decisive step:** compare a complete source-selected reversible cipher emitter's original-input output and genuine solved-Cicada plants against the **exact-bigram-preserving** control and its competing parametric simulation. Do not widen numerical lag/phase hunting to fit this structure.
