# Source-conjugate GP29 nonlinear norm oscillator: original-input decision

**Agent 5, 14 November 2026. Evidence class:** new bounded negative of one **fully reversible, source-motivated nonlinear ciphertext-feedback cipher**. The proposed operation does **not** recover any unknown LP2 plaintext, historical key, or destination. The historical operator is a hypothesis rather than an authored instruction.

## Independent clue and exact reversible mechanism

The period-archived [2014 seventh-onion index](../resources/cicada2014-onion7-index.html) contains \`<title>133</title>\` and \`<div id="331">\`. The residues **17** and **12** in the manuscript's 29-symbol field are conjugate square roots of \(-1\): \(17^2=12^2=-1\), \(17+12=0\), and \(17\cdot12=1\) modulo 29. The existing [linear source-root oscillator](onion7-133331-gp29-pair-inverse.md) already exhausts a different cipher using a sum of two registers. Here a mathematically distinct **product of the conjugate registers**, a norm-like output, tests whether nonlinear state feedback is the omitted step.

Given registers \(u_i,v_i\in\mathbb F_{29}\) and sign \(s\in\{+1,-1\}\):

\[
C_i=P_i+s\,u_iv_i\pmod{29},\quad
u_{i+1}=17u_i+C_i\pmod{29},\quad
v_{i+1}=12v_i+C_i\pmod{29}.
\]

The recurrence consumes the **actually emitted** ciphertext rune, so a decoder holding the two initial registers and the sign recovers every plaintext rune as \(P_i=C_i-s\,u_iv_i\pmod{29}\), without losing information. This provides an exact inverse and forward encryption rule for all 29 rune values. The absence of a source-defined rule for **which original page/word clock to reset** and any authentic initial registers are its weakest assumptions. We generously allow all **\(2\times29^2=1,682\)** seeds/signs per reset unit, separately for the continuous book and each of the 55 physical rune-bearing pages. The p56 transparent-F behavior is not imported; this family instead treats F as an ordinary rune, so an unsupported F-bypass remains outside scope.

### Locked independent criteria

Using the first 80% of [Shakespeare first300k](../resources/control/shakespeare_first300k.txt) mapped into GP29 with the source-native ING rune and the repository's explicit character normalizations, train a fixed 29-symbol unigram probability table with 0.5 pseudocount. Use the last **12,956 GP runes** from that source as untouched native-English controls. Within each original book/page unit select the sign and registers **only on that unit's first half**, then measure the heldout half. An authentic GP-English cipher should show a large positive log-likelihood ratio against a uniform GP29 source, as the known source does. Additionally compare the original's complete adjacent-doublet and word-local five-lag counts against an independent published-cipher positive using the same 2,896 printed word lengths. Positive proof is exact native plaintext recovery and identical forward reencryption with the true hidden registers, followed by blind seed recovery.

The original source has **12,956 runes, 55 rune-bearing physical pages and 2,896 full printed words**. Input and runnable [CommonJS SFT](../sims/onion7_133331_nonlinear_norm_sft.cjs) pin all the mathematical definitions, native control, clock, alphabet and original-source inventory. No synthetic ciphertext is used to select historical keys or optimize any original parameter.

## Results

| Test | Original LP2 | Source-native independent planted cipher |
| --- | ---: | ---: |
| Whole-book best first-half GP log-ratio per rune | −0.833334 | +0.401712 |
| **Whole-book second-half heldout GP log-ratio per rune** | **−0.928876** | **+0.375692** |
| 55-page weighted first-half GP log-ratio | −0.360175 | +0.385915 |
| **55-page weighted heldout GP log-ratio** | **−0.893429** | **+0.391507** |
| Original all-book fixed-source-seed \((17,12,+)\) recovered-symbol IoC | **0.034458** | **0.059278** (true plaintext) |
| Original source physical-page adjacent identical runes | **86** | **470** |
| Within-word five-apart matches under exactly 2,105 original word opportunities | **104** | **65** |

The original whole-book first-half key choice is sign **−**, initial \((1,6)\); its untouched second half is much less GP-English-like than a native plaintext. The planted whole-book key is recovered exactly as sign **+**, registers **\((17,12)\)**. All **55/55** page-native plants recover the exact secret source registers and sign when individually blind-fitted on the first half, and the true-key inverse recovers **12,956/12,956** planted native runes with exact forward reencryption.

The planted doublet count **470** and lag-five count **65** are one illustrative original-length-aligned positive, **not a simulated population distribution**. They show that this nonlinear oscillator in its source-fixed form does not automatically generate the two motivating structural anomalies, despite producing an English-recoverable positive. The heldout unigram failure is the stronger rejection, including every tested free seed/sign and the two declared reset scopes.

## Decision and boundary

**Retire this exact conjugate-product nonlinear oscillator as a direct LP2-to-GP-English decoder.** It is genuinely distinct from the earlier additive conjugate oscillator yet fails on the actual ciphertext while a true encrypted English control passes its blind inverse. It gives no source-supported key and no plausible original unknown plaintext. Any future nonlinear oscillator must have an independently selected state/output rule beyond this one; adding a fitted after-layer solely to explain missing repeats would rescue a rejected model without an authorial clue.

The broader LP2 mystery remains open. This excludes neither non-GP plaintext, unobserved external key material, legitimate keyed homophonic encoding, nor arbitrary stateful ciphers. The priority remains a source-authored reversible operation and an independently recoverable key/crib, rather than another unconstrained oscillator variant.
