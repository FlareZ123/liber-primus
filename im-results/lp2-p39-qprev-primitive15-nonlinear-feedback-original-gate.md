# P39 red quadratic as a source-specified nonlinear predecessor-key GP29 cipher

**Agent48 · 14 November 2026 · Director #867.** The original author-visible p39 mathematical triad selects a distinct, exactly reversible candidate. It can imitate the ciphertext's suppressed adjacent equalities without ever selecting a genuine unknown-page English plaintext. It is rejected on **all thirteen independently visible one-rune words** in a 3,000-rune original chapter, and on the native GP symbol distribution. A stronger original three-word obstruction rejects **every possible chapter-shared predecessor-keyed affine GP29 row**, even with all its keys secret. **No unknown LP2 plaintext, authentic key, cipher mechanism, or final destination recovered.**

## Why this route and how its original input is fixed

Original LP2 p39's red rune indices at offsets 119–121 are **[27,5,15]**. In the GP29 field their quadratic is

`Q(x)=27+5x+15x² = 15(x−24)² mod29.`

Coefficient **15** is a primitive root modulo29, so for every ciphertext rune `Cprev` the multiplicative state

`K(Cprev)=15^Q(Cprev) mod29`

is nonzero. This supplies a direct *nonlinear, ciphertext-forced* key without a secret seed, periodicity or a guessed key. Ciphertext feedback is historically plausible, and its suppression of adjacent repeats is an independent original-cipher motivation. The model is conjectural: the original art does not explicitly instruct its use, and neither the root form nor primitive root alone authenticates a cipher.

Use the last rune of p40's printed eight-rune red heading `F-N-M-Y-G-D-AE-H`, GP **H=8**, as the predecessor initial state, then the **entire following 3,000-rune black body over pp40–53**, with the original 667 word boundaries preserved and no page or word reset. At every rune the hypothesized bijection is:

`C = (Cprev + K(Cprev) · (P+1)) mod29,`

`P = ((C−Cprev) · K(Cprev)^(27) − 1) mod29.`

Fermat's theorem makes `K^27` the unique inverse of nonzero `K` modulo29. All 29 GP plaintext rune values map bijectively for each preceding ciphertext symbol. This is **distinct** from the already rejected autonomous or linearly forced two-state 203-period recurrences in [the p39 quadratic source gate](lp2-p39-quadratic203-allsecret-source-gate.md), the recurrence-state primitive-root key in [the p39 multiplicative-feedback gate](lp2-p39-quadratic-multiplicative-feedback-source-gate.md), and the p15 four-state OFB/CFB gates. Here the *immediately preceding published ciphertext rune itself* selects a nonlinear full-key alphabet on every step.

## Independent predictions and direct original-cipher verdict

**First independent, zero-fit plaintext prediction:** The authentic 667 printed words include exactly **13 one-rune words** at body-local offsets `128,298,1203,1324,1347,1438,1878,1999,2154,2303,2517,2585,2606`. Under ordinary native English written in GP rune orthography these must be from **A=24, I=10, O=3**. They never enter the key, since the proposed rule has no free key or seed once the printed heading is chosen. The unchanged cipher inverse gives, in original order:

`X, S, B, T, AE, M, OE, IA, R, X, AE, P, F.`

Exactly **0/13** meets A/I/O. The standalone source test independently derives the singleton offsets from original printed word boundaries and asserts the same 13 positions before evaluating the proposed inverse.

## Stronger key-independent exclusion: all predecessor-keyed affine rows

The original chapter supplies a much wider exclusion **without using p39's Q at all**. The three single-rune original words at body offsets **1347 (p45), 2154 (p48), 2606 (p52)** each have the same immediately preceding ciphertext rune, **GP index15**. Their current-minus-previous ciphertext differences modulo29 are respectively **17,20,4**. Any GP-native-English decoder preserving those original word boundaries must map the three observed outputs to some assignment of **A=24, I=10, O=3**.

Grant the cryptographer a completely arbitrary unknown pair of coefficients **`a_s ≠ 0, b_s`** for *every possible* preceding ciphertext GP rune, with the full 29! keyspace reduced only by the hypothesis of affine symbol dependence:

`C_i = C_(i-1) + a_(C_(i-1))·P_i + b_(C_(i-1)) mod29.`

At predecessor **s=15**, an exact affine decoding requires the unordered set equality

`{4,17,20} = {3a+b, 10a+b, 24a+b} mod29.`

Enumerating **all 28×29=812** possible `(a,b)` pairs gives **ZERO** solutions. The three observed outputs are distinct, and any solution would have to be an invertible permutation on exactly these three native one-letter tokens. This is an exact key-independent contradiction, no IoC threshold, no language-trained model and **no assumption about the source quadratic**. It includes every multiplier-only, additive-only, and original `P+1`-multiplier row for a **chapter-shared deterministic predecessor-affine cipher**, regardless of the other 28 predecessor states' secret keys.

The SFT derives each original one-rune position from the printed transcript, checks its literal preceding glyph, and tests all **812** allowable affine maps. This stricter all-secret conclusion still depends on three explicit original-source hypotheses: (a) printed one-rune word boundaries survive encryption; (b) the same predecessor-conditioned affine row is reused across the three physical pages p45, p48 and p52; and (c) the direct plaintext register is native GP29 English. A cipher with page-specific row keys, word-start exceptions, other plaintext languages or nonlinear secret row permutations is **not excluded** by this three-word theorem. Earlier work tested general predecessor-secret row permutations using a different collision statistic; this new affine singleton proof adds a direct exact exclusion without reproducing that wider statistical test.

**Second independent prediction:** Authentically native GP-English prose should have a concentrated rune distribution. The original target has IoC **0.03454440369** and the full inverse's GP rune IoC is just **0.03524974992**. **160** independently word-length-matched GP prose controls built from Gibran's source vocabulary (every one of the same 667 original word lengths, with one-rune tokens restricted to genuine A/I/O words) have cleartext IoC between **0.05711726 and 0.06196221**. All 160 controls exactly encrypt/decrypt with this precise nonlinear model, using hidden actual native text and the same original-IV and complete 3,000-rune source shape. None scores as low as the original output.

**Why the repeated-pair pattern is insufficient to save this candidate:** For this particular reversible rule, `C=Cprev` **if and only if `P=EA`** (GP index28). The original chapter happens to contain **18** repeated ciphertext transitions. The proposed inverse therefore yields **18** plaintext EAs, exactly. A source-matched native-GP control under the same cipher has **18–46** doublets across the 160 native control texts. Thus the cipher can meet the originally motivating anti-repeat count while its genuine-English inversion is contradicted by independent, source-visible words. This is a useful concrete example of the risk in promoting a statistical fit into a solve mechanism. The two independent tests are far stronger than further optimizing the doublet/lag-five counts.

## Broader original all-secret book-row capacity, allowing O

A final independent singletons-only gate weakens the model still further: let each **preceding ciphertext rune** select an **arbitrary secret permutation of all 29 plaintext symbols**, rather than an affine map. Assume the same row table persists throughout the entire unknown manuscript and that the original 83 one-rune printed words remain genuine one-rune English words. There are **82** eligible one-rune words with a known same-physical-page predecessor; one physical page-start word lacks a defined predecessor and is correctly omitted.

Under any secret bijection, a fixed predecessor can emit **at most three distinct ciphertext symbols** for native plaintext A/I/O, no matter what secret alphabet was selected. The exact top-three-output histogram capacity is the maximum that all possible secret permutations could attain; it requires no key search.

| Original secret-row scope | Observed predecessor row groups | Minimum one-letter exceptions even with any secret permutations |
| --- | ---: | ---: |
| One row table for entire 12,956-rune book | 28 | **15 / 82** (nine violating predecessor rows) |
| An independent table for each of nine printed red sections | 67 | **0 / 82** |
| An independent table for each physical page | 80 | **0 / 82** |

Thus an entirely secret **book-global** predecessor-conditioned permutation fails the conservative native English A/I/**O** singleton condition on **at least 15 original words**, even if the author chooses all 29! table entries adversarially. This expands the earlier [A/I-only all-secret singleton capacity gate](../sims/singleton_word_key_capacity.cjs), which reported 31 contradictions in book scope, to include the less common one-rune O. The newer, more permissive count **15** still excludes the whole-book static row hypothesis without a language-frequency score. The original visible nine sections and independent physical pages can each supply enough separate row states for a secret nonlinear map to satisfy this narrow singleton capacity test; their **zero** exception count is a necessary-condition survival, not a successful decoder. Prior [source-native within-word predecessor collision studies](lp2-previous-cipher-row-collision-allsecret-gate.md) apply additional statistical objections to page-local secret rows. Do not interpret the surviving state capacity as evidence that Cicada used them.

The same [standalone source original SFT](../sims/lp2_p39_qprev_primitive15_feedback_sft.cjs) now reproduces the 82 eligible source word locations and exact scope counts, in addition to the p40 all-secret-affine theorem. [Passing extended GitHub Actions run 43609388858](https://github.com/FlareZ123/liber-primus/actions/runs/43609388858).

## Reproduction and research consequence

The source-pinned complete [CommonJS SFT](../sims/lp2_p39_qprev_primitive15_feedback_sft.cjs) checks the actual GP red triad, all 29 nonzero previous-rune keys and inverse arithmetic; derives the correct chapter and 667 words from the printed transcription; scores original and 160 frozen source-matched positive plaintexts; exactly forwards/reverses all 3,000 original runes and every native control. It separately recovers a **98-rune source-shaped solved-LP2 positive** consisting of the original p57 plus GP word `EACH`, including an explicit EA=28 event that forces one adjacent ciphertext repeat.

[Successful extended all-secret GitHub Actions run 43608336667](https://github.com/FlareZ123/liber-primus/actions/runs/43608336667) on Node22 reproduces the precise original singleton contradiction, IoC and native controls (the initial run exposed that source apostrophe fragments S/T must be filtered out of the one-rune English vocabulary; this was corrected without changing the source cipher or original test).

**Decision:** retire every book-global stationary predecessor-secret permutation as a direct English GP29 decoder under the singleton-word and A/I/O assumptions, and retire every chapter-reused **predecessor-affine** GP29 direct-English row cipher on the original p40–53 section as a key-independent structural impossibility (within the stated word-boundary and register assumptions). Also retire this exact source-derived, predecessor-dependent `Q(Cprev)` exponent multiplier as a direct GP-native-English cipher for the p40 body, with the printed header-derived state. Do **not** add tuned seeds, page resets, source-invisible extra cipher layers, alternate Q orientation, or language-selected exceptions to rescue it. The original p39 quadratic remains mathematically authentic; its cryptographic interpretation is still unproven. Any further #867 path should require a separately authored source selector or provide a plaintext-bearing external file, with independent unknown-page proof.
