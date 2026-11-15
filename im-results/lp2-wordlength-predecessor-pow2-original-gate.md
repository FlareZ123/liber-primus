# Word-number and predecessor-rune nonlinear GP29 decoder: complete original-key decision

**15 November 2026, Agent45. Result: a complete 24,389-key original-cipher test, with a genuine 729-rune positive recovery, excludes this exact small nonlinear model as a native-GP-English LP2 solution. No unknown plaintext, genuine key, or destination was recovered.**

## Why this specific operation was tested

The surviving 2016 Cicada-signed direction, “Its words are the map, their meaning is the road, and their numbers are the direction,” raises the question of whether the length and position of **original printed rune words** can determine an evolving cipher. The 29 GP29 symbols form the field GF(29); 2 generates all 28 nonzero residues. The unknown manuscript has only 86 equal adjacent runes, far fewer than ordinary source-native English, with an internal five-apart signal. Neither statement supplies the following cipher equation, so it is tested as a compact human-plausible *hypothesis*, not a recovered author instruction.

A previously established stronger original-cipher result already excludes **every** fixed output alphabet conditioned on (word-start page, physical page, word length, within-word position) for three GP-native English source registers. That architecture has no need for renewed key searches: [prior exact entropy gate](lp2-wordposition-delta-allsecret-page-gate.md). The same prior study **does not exclude** output alphabets conditioned additionally on the *immediately preceding published ciphertext rune*. The model tested here enters precisely that surviving category using a single nonlinear, reversible predecessor-controlled multiplier and only three global small operands.

For original joined printed word length **n** and zero-based within-word offset **j**, let Cprev be the previous real ciphertext GP index, continued through printed word and physical page boundaries. The first initial accumulator is zero. Test

\[
C_i=C_{\mathrm{prev}}+2^{C_{\mathrm{prev}}}(P_i+B n_i+D j_i+E)\pmod{29}.
\]

The exponent multiplier always lies in GF(29)\{0}; it is therefore invertible for all 29 predecessor values. The exact unknown-plaintext inverse is

\[
P_i=2^{-C_{\mathrm{prev}}}(C_i-C_{\mathrm{prev}})-B n_i-D j_i-E\pmod{29}.
\]

Search **every 29³ = 24,389** global triple (B,D,E) without free per-page keys or clocks, word-boundary edits, fitted skip masks, or post hoc shift variants. The nonlinear multiplier makes the output alphabet depend on Cprev, distinguishing the mechanism from the earlier source-rejected fixed word-position accumulators. A separate prior p39 quadratic-derived predecessor exponent was already tested with different source operands; this is not a repeat of that bounded source-conditioned construction.

## Untouched original source and scoring

The [complete single-file CommonJS reproducer](../sims/lp2_wordlength_predecessor_pow2_sourcekey_sft.cjs) reads the canonical [original GP29 corpus](../resources/liber-primus/lp2-corpus.json), joins all page-carried printed words according to the existing [source parser](../sims/lp2_word_pages.cjs), and verifies **12,956 indices in 2,896 original words, including 32 page-carried words**. The numerical-only physical p50 has no GP runes. It encodes solved LP1 into **3,510 source-native GP runes**, with the historically calibrated single-rune ING and IO spellings, to build one fixed add-one smoothed GP29 trigram likelihood. The source encoder itself validates authentic solved LP1 spelling and independently solved p57 PARABLE.

Only the **first 729 original runes on physical pp0–2** select the candidate key. There are no search-time page or phase resets. Two untouched, distant native-GP tests then evaluate the same unaltered keys: the independent **3,008-rune pp40–53 visual chapter** at original global indices [9640,12648), and the final **308-rune pp54–55 chapter** at [12648,12956). Both holdouts are much larger or structurally different from a single tiny overfitted crib.

| Candidate selected on pp0–2 | Mean GP29 trigram log likelihood on 729-rune train | Untouched pp40–53 (3,008) | Untouched pp54–55 (308) |
| --- | ---: | ---: | ---: |
| Best of all 24,389: **B=10, D=2, E=0** | **−3.37872379** | **−3.41277222** | **−3.42633468** |
| Among top ten train candidates: highest pp40–53 holdout (B=1,D=22,E=14) | −3.38484602 | **−3.40546599** | −3.41320926 |

The complete top ten, each key's independent heldout score, and the first decoded original word are printed by the SFT. All stay near nonlinguistic source, far from the native-source plant below. A purported recovered key would have to yield coherent original plaintext over consecutive printed words and independent manuscript sections. None does.

**The inverse is fully reversible for every candidate**: reencryption of the complete 12,956-rune original after applying the train-selected triple reconstructs all 12,956 published indices exactly. That is an encoder check, not evidence of correctness, since a wrong invertible key also roundtrips.

## Same-method positive and null controls

To verify actual key recovery rather than a cipher implementation that merely reproduces its own mistakes, construct a **729-rune, exactly original-word-length-matched GP-English passage** by sampling native-encoded words from the independently fixed Gibran *Prophet* reference. Encrypt using the *same predecessor exponent and same original (n,j) states*, with a secretly fixed true triple **(7,11,5)**, and run the identical complete 24,389-key search. The true key is **rank 1/24,389**, mean log likelihood **−2.98867617**, second-best **−3.29376743**; decrypting with the recovered key gives the entire planted native text **729/729 GP29 runes exactly**. There is no fitted native-plaintext crib in the original search.

Five separately generated wrong-family random 28-way near-no-repeat streams, each with the same 729-rune word layout and the same complete search, yield winning train scores **−3.37534, −3.37549, −3.37770, −3.37720, −3.37624**. The original winner **−3.37872** is comparable with this wrong-family range and over 0.39 log points per trigram worse than the genuine decryptable native-language plant. These are finite controls, not a statistical claim about all possible natural languages or all nonlinear state ciphers.

The recorded [Windows Node.js 22 workflow](https://github.com/FlareZ123/liber-primus/actions/runs/43659558700) **passed** all assertions. The SFT contains the complete original cipher check, exhaustive key search, untouched holdouts, exact GP-native positive recovery, seeded five-stream null control, and 12,956/12,956 inverse replay. Its source inputs remain in the repository; no external network calls or generated outputs are required to repeat the calculation.

## Interpretation and next decision

This rejects the **single fully specified** GF29 predecessor-exponential, word-length/position-affine, book-global 24,389-key family as an English-GP29 LP2 decoder. It does not reject arbitrary 29-state nonlinear maps depending on (Cprev,n,j), an external source-derived multiplier stream, other plaintext registers, reordered rune positions, or lost original key material. The original 2016 instruction supplies no reason to replace 2^Cprev with another retrospectively tuned function or to add an unknown per-word pad solely because this test failed.

A constructive successor requires an **independent source clue supplying a new state rule or key source**, and must achieve authentic consecutive plaintext plus untouched-page prediction. No further (B,D,E) fitting is useful for the now-exhausted model.
