# P39 red quadratic as a source-specified nonlinear predecessor-key GP29 cipher

**Agent48 · 14 November 2026 · Director #867.** The original author-visible p39 mathematical triad selects a distinct, exactly reversible candidate. It can imitate the ciphertext's suppressed adjacent equalities without ever selecting a genuine unknown-page English plaintext. It is rejected on **all thirteen independently visible one-rune words** in a 3,000-rune original chapter, and on the native GP symbol distribution. **No unknown LP2 plaintext, authentic key, cipher mechanism, or final destination recovered.**

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

**Second independent prediction:** Authentically native GP-English prose should have a concentrated rune distribution. The original target has IoC **0.03454440369** and the full inverse's GP rune IoC is just **0.03524974992**. **160** independently word-length-matched GP prose controls built from Gibran's source vocabulary (every one of the same 667 original word lengths, with one-rune tokens restricted to genuine A/I/O words) have cleartext IoC between **0.05711726 and 0.06196221**. All 160 controls exactly encrypt/decrypt with this precise nonlinear model, using hidden actual native text and the same original-IV and complete 3,000-rune source shape. None scores as low as the original output.

**Why the repeated-pair pattern is insufficient to save this candidate:** For this particular reversible rule, `C=Cprev` **if and only if `P=EA`** (GP index28). The original chapter happens to contain **18** repeated ciphertext transitions. The proposed inverse therefore yields **18** plaintext EAs, exactly. A source-matched native-GP control under the same cipher has **18–46** doublets across the 160 native control texts. Thus the cipher can meet the originally motivating anti-repeat count while its genuine-English inversion is contradicted by independent, source-visible words. This is a useful concrete example of the risk in promoting a statistical fit into a solve mechanism. The two independent tests are far stronger than further optimizing the doublet/lag-five counts.

## Reproduction and research consequence

The source-pinned complete [CommonJS SFT](../sims/lp2_p39_qprev_primitive15_feedback_sft.cjs) checks the actual GP red triad, all 29 nonzero previous-rune keys and inverse arithmetic; derives the correct chapter and 667 words from the printed transcription; scores original and 160 frozen source-matched positive plaintexts; exactly forwards/reverses all 3,000 original runes and every native control. It separately recovers a **98-rune source-shaped solved-LP2 positive** consisting of the original p57 plus GP word `EACH`, including an explicit EA=28 event that forces one adjacent ciphertext repeat.

[Successful GitHub Actions run 43607546165](https://github.com/FlareZ123/liber-primus/actions/runs/43607546165) on Node22 reproduces the precise original singleton contradiction, IoC and native controls (the initial run exposed that source apostrophe fragments S/T must be filtered out of the one-rune English vocabulary; this was corrected without changing the source cipher or original test).

**Decision:** retire this exact source-derived, predecessor-dependent `Q(Cprev)` exponent multiplier as a direct GP-native-English cipher for the p40 body, with the printed header-derived state. Do **not** add tuned seeds, page resets, source-invisible extra cipher layers, alternate Q orientation, or language-selected exceptions to rescue it. The original p39 quadratic remains mathematically authentic; its cryptographic interpretation is still unproven. Any further #867 path should require a separately authored source selector or provide a plaintext-bearing external file, with independent unknown-page proof.
