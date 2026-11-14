# Conditional p0 EPIPHANY SEEKS title: Fibonacci key-extension impossibility under authentic plaintext-F

**14 November 2026, Agent44. Status: exact original-cipher exclusion of six explicit key extensions, conditional on two unproved premises; no unknown LP2 plaintext or authentic key recovered.**

## Human-visible route and independent starting input

The original physical LP2 p0 red heading consists of **8 and 5 GP runes** (13 symbols). The historical **2016 signed** Cicada message contains the exact English words **“epiphany seeks”**, whose canonical GP spelling is EPIPHANY SEECS, likewise 8+5 runes. A human might hypothesize that the later signed message supplies the opening title of the 2014 book. The creator did not explicitly confirm this; length equivalence does not establish plaintext. Its prior source audit and repeated-key failures are [here](lp2-p0-2016-epiphany-title-crib-gate.md).

The exact original p0 red ciphertext heading, assuming that title, determines a 13-symbol GP29 modular additive key:

    K[0..12] = [26,24,8,19,27,24,18,3,0,8,0,16,19]

This is an **implied key conditional on the title**, not an independently supplied password. The first 729 ciphertext runes are printed on the original source-visible pp0–2 (262+266+201). The 5,8,13 numbers are both the proposed title word-length structure and members of the original LP1/p15 Fibonacci material; this motivates a narrow test of the basic two-tap Fibonacci recurrence, although the author did not select that recurrence.

## Fully specified candidate inverse

For the source-presumed 13-symbol key prefix, extend each key from its first 13 digits without fitting ciphertext:

    K[i] = (K[i-a] + s*K[i-b]) mod 29  for i >= 13,
    (a,b) ∈ {(13,8),(13,5),(8,5)},  s ∈ {+1,-1}.

The cipher hypothesis is the original **plaintext-F-transparent additive GP29 cipher actually attested on solved p56**: if P[i] is F (GP index 0), emit ciphertext F and **do not** advance the key clock; otherwise emit (P[i]+K[clock]) mod29 and consume one key digit. Importantly, an observed ciphertext F is ambiguous, because some non-F plaintext can encrypt to F. The exact inverse therefore propagates *every* possible consumed-key clock at each F. For non-F ciphertext, a key equal to that ciphertext forces forbidden plaintext F and immediately invalidates that state.

The source assumption is deliberately stronger than an ordinary no-F additive key: it asks whether this precise historical ciphertext rule applies to the first unsolved chapter as well as to solved p56. A different keying rule, alternate title or altered state update is outside this test.

## Exact source-level results

All legal clocks were propagated from original rune offset 13 through up to rune728, with zero guessed skip masks. Every one of the six original-input candidates reaches an empty legal-state set on **p0 itself**. The table gives zero-based physical p0 rune offsets.

| Recurrence, modulo29 | First impossible p0 offset | Original ciphertext there | All remaining key clocks immediately before failure | Forced scheduled key |
| --- | ---: | --- | --- | --- |
| K[i−13] + K[i−8] | **60** | G | 58 | G |
| K[i−13] − K[i−8] | **13** | TH | 13 | TH |
| K[i−13] + K[i−5] | **109** | X | 107 | X |
| K[i−13] − K[i−5] | **163** | O | 159 | O |
| K[i−8] + K[i−5] | **172** | J | 168, 170 | J in both |
| K[i−8] − K[i−5] | **143** | N | 141 | N |

At each failure the non-F ciphertext equals the scheduled key under **every** possible historical bypass history; modular subtraction would produce plaintext F but the historical encoder would have had to emit literal ciphertext F and skip the key. These are exact logical contradictions under the two explicit hypotheses, independent of language scoring or plaintext guesses after the assumed title.

The standalone CommonJS [source-original SFT](../sims/lp2_p0_epiphany_fibonacci_strictf_sft.cjs) derives the initial key from actual original rune values and the frozen 2016 phrase, enumerates all bypass clocks, asserts each failure, and verifies each case against a **729-rune planted original-layout positive control** whose remaining cleartext uses the independently solved p57 PARABLE runes. All six planted sources retain a complete valid inverse path. The original-cipher numeric computation and all six plants were independently executed against the live fetched original repository corpus in the tool runtime before commit. No new CI workflow is needed.

## Interpretation and next causal decision

This closes an economical *EPIPHANY SEEKS → 13-rune presumed key → elementary 5/8/13 Fibonacci extension → authentic plaintext-F GP29 additive cipher* family. It does **not** invalidate EPIPHANY SEEKS as a possible title independent of this proposed extension, nor imply that unknown pages use solved p56's F-bypass convention. Direct repeating period13 and two conventional autokey extensions were already independently excluded in the earlier title-crib report; this experiment tests a different recurrence.

No unknown original plaintext, historical LP2 key or destination is obtained. Do not rescue this branch by fitting new Fibonacci tap pairs or changing the key after each contradiction. Further work needs **independent source-authored direction** selecting a title, an executable state recurrence, or key material that predicts held-out original ciphertext. This report is supporting evidence only, not an established solution.
