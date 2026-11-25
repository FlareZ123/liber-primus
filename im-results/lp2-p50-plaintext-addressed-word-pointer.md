# p50 plaintext-addressed word pointer inverse

**Agent1, 25 November 2026.** Two plaintext-dependent receiver families with three finite original-input decisions. No recovered unknown LP2 plaintext or key.

## Decision

The signed 2016 instruction that words are the map and numbers the direction, together with the source-derived p50 forward pointer interpretation, suggests using the numerical value of a recovered plaintext word as a graph address. Unlike the existing [ciphertext-derived 32×8 byte automaton](lp2-p50-worddirection-byte-automaton-gate.md), this is a plaintext-dependent key generator. It is also distinct from the [fixed signed-word graph pad](lp2-primeecho-p50-wordmap-p0-pointer-key-gate.md). The authenticated message does not specify a previous-word clock, GP0 versus prime summation, modular reduction, or the additive consumer; these are explicit hypotheses.

Both variants below consume original p0–55, exactly 12,956 GP29 runes and 2,896 printed groups across nine chapters. The canonical source arrays are checked against the image-corrected transcription chapter by chapter, retaining split words across ordinary page seams. Both p50 radix interpretations use the exact original 256 tokens; radix59 removes the source-absent lowercase f. Native controls are the three excluded solved-text records 0_warning, 0_koan_1 and p57_parable, not invented English.

## 1. Previous plaintext word feedback: fully reversible ordinary mode

Let T be the p50 successor map, s the initial address (0–255) for a word, and k_i=T^i(s) mod29. Encrypt P_i as C_i=P_i ± k_i mod29. Set the next word's initial address to the sum of the just recovered plaintext word (GP0 or chart-prime weights) mod256. The F-hold receiver instead emits literal plaintext F without advancing the pointer, precisely as the known p56 exception; a consuming transition that would decode to F is forbidden.

For each chapter, give the decoder all 256 possible initial addresses, independently. At each word, enumerate every legal literal-F branch and propagate its next word sum. For a fixed next state the maximum-likelihood path suffices for Viterbi scoring, and retaining one path for every reachable state is lossless for the exact feasibility test. A word-internal trigram with begin/end markers, additive smoothing 0.2, and training on the five other native records (excluding the p56/p57 and two LP1 control records) selects the maximum fit score on the first two thirds of printed groups. Freeze the resulting state before the last third. In the ordinary mode the continuation is deterministic; in F-hold mode we grant the best continuation among the remaining legitimate branches. Fit and surviving continuation candidates are re-encrypted exactly.

| Receiver | Original chapter/configuration cases | Exact path failure | Frozen ordinary holdout |
|---|---:|---:|---|
| Ordinary, 2 radices × 2 sums × 2 signs | 72 | 0 | −4.655078 to −4.322657 nats/rune |
| Authentic F-hold, same eight settings | 72 | **72/72** | no full-chapter path |

The F-hold path set goes empty between zero-based printed group indices 9 and 150, even allowing different initial states in every chapter. This exclusion does not rely on English scoring. The original ordinary candidates produce nonprose on the held-out groups; the weakest native ordinary held-out score is −2.968417, and the best original is −4.322657. All 24 ordinary planted controls recover all 3,048 withheld runes; 22/24 also recover the full fit plaintext, but the planted initial address is recovered in only 6/24 because the stream can merge and different initial addresses can induce identical rune keys. The F-hold controls recover 2,980/3,048 withheld runes (21/24 fully exact; one frozen state has no continuation). Those limitations prevent a blanket claim of perfect blind recovery. The F-hold original exclusion remains exact regardless of scoring or control calibration. Ordinary negatives are calibrated, frozen-winner screens; they do not logically exclude every possible out-of-register plaintext.

The best original ordinary frozen readout begins `HYEOCAEL EAPF CE XEABJBOEEAIBAE RTH FOEIAWTTHYSHOOE OECSE PIA OY SRIEAPL YO`. It is not an intelligible message.

## 2. Self-addressed words: exact preimage gate invariant to whole-word reordering

A rival interpretation removes the dependence on printed group order: derive each group's starting address from its own unknown plaintext sum. This map can be noninjective, so do not assume it is a usable cipher. Instead, enumerate all 256 addresses and every legal F branch, retain a candidate only if its recovered sum equals the tested start, and re-encrypt every retained candidate. No dictionary or score is needed.

All sixteen fixed receivers fail in every one of the nine chapters, even allowing a separate receiver per chapter and arbitrary permutation of intact groups. Across the whole original text, the best setting has 907 zero-preimage groups; the worst has 1,264. The minimum zero-preimage counts in each chapter across all sixteen settings are:

| Chapter | Minimum impossible groups |
|---|---:|
| p0–2 | 53 |
| p3–7 | 80 |
| p8–14 | 106 |
| p15–22 | 142 |
| p23–26 | 72 |
| p27–32 | 95 |
| p33–39 | 101 |
| p40–53 | 213 |
| p54–55 | 17 |

All 4,368 native planted word/configuration instances contain their exact plaintext among the inverses. However, 2,637 instances are ambiguous, with up to 85 preimages for a single native word. This establishes the inverse enumeration's coverage and demonstrates why the self-addressed map would need an additional disambiguation mechanism even on compatible data. No such side data can rescue a zero-preimage group without changing the receiver.

The original zero-preimage counts apply only if printed groups are genuine plaintext units with their within-group rune order preserved (H-shuffle remains allowed). They do not reject H-decoy or arbitrary alternative word-state functions.

## 3. Previous-word receiver with arbitrary intact-group reordering

The ordinary previous-word test used source group order. To address H-shuffle, remove that order entirely and grant each group every possible starting byte independently. For each original group enumerate the exact 256 starting states and all F-hold histories, retaining the plaintext only if it belongs to the previously frozen broad 35,944-form GP29 register (all 29 singleton runes are granted). The possible next state is its GP0 or prime sum mod256. The selected sum weighting changes the endpoint of a candidate edge but cannot affect its existence. Thus lexical feasibility need only be computed once for each of eight radix/sign/F settings; any true feedback trail must first have enough nonempty per-group domains. This is a relaxation even of arbitrary whole-word order, not a test of grammar or the printed sequence.

| Chapter | Fewest empty lexical domains | Allowed OOV (5%) | Groups of length ≥8 with no domain |
|---|---:|---:|---:|
| p0–2 | 76 | 7 | 21/21 |
| p3–7 | 114 | 12 | 27/27 |
| p8–14 | 174 | 19 | 46/46 |
| p15–22 | 185 | 21 | 48/48 |
| p23–26 | 108 | 11 | 26/26 |
| p27–32 | 142 | 16 | 36/36 |
| p33–39 | 174 | 18 | 45/45 |
| p40–53 | 302 | 33 | 84/84 |
| p54–55 | 33 | 3 | 10/10 |

Every one of the 72 chapter/settings exceeds its OOV budget. All **343/343** original groups of length at least eight have empty domains under each setting. Whole-book missing group counts span 1,339–1,372. Exact forward replay succeeds for every retained original candidate. There is no reason to run the more expensive edge-selection or Euler-trail solver when this necessary condition already fails.

For calibration, independently encrypt 100 held-out groups from each of three literary donors under each radix/sign/F/sum combination, preserving the true previous-word state, then shuffle the groups deterministically. The 48 controls retain every one of 4,768 in-register plaintext/start/end edges among 4,800 groups; only 16 groups lack any lexical edge. This is a positive control for domain enumeration, not proof of unique word ordering. The held-out control windows were selected for at least 95% lexical coverage; the 5% OOV threshold is a finite register hypothesis, not a universal claim about all languages or novel words.

**Decision:** neither intact source group order nor arbitrary group reordering rescues the specified previous-word receiver under this lexical model. H-decoy, other word/address functions, and alternative p50 operations remain open. [Post-shuffle SFT](../sims/lp2_p50_plainword_pointer_postshuffle_sft.cjs) · [raw results](lp2-p50-plainword-pointer-postshuffle-output.json).

## Reproduction

From the repository root:

    node sims/lp2_p50_previous_plainword_pointer_sft.cjs
    node sims/lp2_p50_self_plainword_pointer_sft.cjs
    node sims/lp2_p50_plainword_pointer_postshuffle_sft.cjs

All three experiment cores were executed in the connected V8 runtime on the exact repository input blobs. Standalone Node wrappers were not separately executed; no CI was launched. Exact raw outputs and source blob IDs: [previous-word](lp2-p50-previous-plainword-pointer-output.json), [self-address](lp2-p50-self-plainword-pointer-output.json), [post-shuffle](lp2-p50-plainword-pointer-postshuffle-output.json).

**Research disposition:** retire these direct plaintext-sum pointer receivers; do not tune them via alternative signs, starts, or an arbitrary score-driven address function. A genuinely source-selected address rule or a different inverse mechanism would be needed. The signed source's graph-navigation hypothesis is not itself excluded. No unknown page is solved.
