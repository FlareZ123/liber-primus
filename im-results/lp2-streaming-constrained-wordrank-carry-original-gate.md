# Streaming constrained-word enumerative carry: original inverse, local state lower bounds, all-carry GP28 suffix gate, and dictionary carry envelope

**Agent1 · 24 November 2026 · Director #2273.** Distinct from the previously exhausted single whole-book/section high-sidecar rank, word-reset arithmetic codec and rANS receiver. This is a causal, lossless, variable-radix **word-by-word quotient carry** with genuine complete original-cipher inversion. It produces no recovered unknown LP2 plaintext or authenticated key. The dictionary-rank extension in §5 excludes all shared fixed rank permutations of the stated finite-language quotient carry with any initial integer of 2,048 bits or fewer. The historical signed 2013 BASE29 operation motivates trying radix conversion; the original words, 63 interior equalities and 23 equal word seams supply the conditional constraints. No first-party instruction selects this exact codec, initial state, or treatment of the printed segmentation.

[Reproducer](../sims/lp2_streaming_constrained_wordrank_carry_sft.cjs), actual Code Mode JavaScript execution on the GitHub-fetched source corpus and dictionary. No independent Windows CI run is claimed.

## 1. Local rather than global private-state capacity

Use all 12,956 original p0–55 GP29 runes in 2,896 complete printed words, including genuine cross-page carries. For word i of rune length L_i and its observed interior repeat count e_i, a ciphertext word has

`M_i = a_i * choose(L_i-1,e_i) * 28^(L_i-1-e_i)`

possible outputs. In the free-head model a_i=29. In the fixed-seam model a_i=29 for the first word, 1 at an observed equal predecessor seam, and 28 at an observed unequal seam; the previous emitted symbol is public. The exact repeat-count schedule (and in the second model, seam-equality schedule) is fixed across all admissible messages at those positions. It is not inferred to be a real encoded channel.

For an unrestricted A-symbol plaintext alphabet at the same printed word lengths, let P_i=A^L_i. Any causal deterministic lossless encoder with S private carry-state alternatives, fixed incoming state, and no extra independent output within a contiguous interval [u,v] needs

`S >= ceil(product(P_i, u..v) / product(M_i, u..v))`.

Reason: for a fixed incoming state, the output words together with the outgoing state must distinguish all arbitrary input words of this interval. If two inputs yield identical emitted words and outgoing state, the same future plaintext gives identical continuation, violating losslessness. The incoming state, printed clock and preceding output may be public; the outgoing *private* state can distinguish at most S alternatives. This is a finite-state lower bound, not an assumption of uniform source English. A language/dictionary-restricted source, variable lengths, data-dependent repeat schedules, lookahead or separate output channels escape the specific premises.

The exact BigInt maximum product over **all contiguous word intervals** is obtained by resetting the running ratio to one after each nonpositive log-ratio prefix; exact cross multiplication selects the maximum, and exact integer division supplies the state bound. In contrast to the global GP27 capacity result (which has no deficit), this catches local bursts:

| Plaintext alphabet | Free-head minimum private states / bits | Fixed-seam minimum private states / bits |
|---|---:|---:|
| GP26 | 50 / 6 | 89 / 7 |
| GP27 (authentic solved native alphabet excludes EO,OE) | **73 / 7** | **1,292 / 11** |
| GP28 | **4,894,270,309,668 / 43** | ≥2^279 / 280 |
| GP29 | 679 bits | 936 bits |

Here bits mean the ceiling of log2 of the required number of private alternatives, not the bit length of a particular numerical state. The free-head GP27 maximum comes from original p35, zero-based complete words **1939–1940**, lengths 2+8 and one repeat each: `ᚦᚦ ᛁᚫᛚᛋᛝᛄᛄᛡ`. The fixed-seam GP27 maximum is original p24, words **1291–1304**, 71 runes, three interior repeats and one equal seam. The GP28 free-head maximum is words 1024–2768 (physical p19–52), 7,797 runes and 47 repeats, even though the global deficit is only 23 bits. This specifically rules out one-GP-rune private carry for these universal GP27 word-exact architectures, and sharply raises the GP28 small-state burden. Global GP27 surplus alone does not permit a local word-reset decoder.

## 2. Actual reversible streaming word-rank construction

Each word's constrained ciphertext rank r_i is computed by three finite registers:

- A: first GP29 rune ordinal, or its 28-way rank excluding previous emitted rune / singleton equal choice in fixed-seam mode.
- B: exact e_i interior equality sites among L_i-1 opportunities, canonical combinadic/colex rank.
- D: the ordered nonrepeating successor ranks as a base28 integer. Test ascending GP ordinal exclusion and cyclic GP ordinal exclusion.

The six orders of A,B,D are separate exact mixed-radix bijections onto [0,M_i). The encoder converts each plaintext word to its base-A rank p_i in [0,P_i), where A here is the plaintext alphabet size, and uses nonnegative integer carry s_i:

`v_i = s_i*P_i + p_i; r_i=v_i mod M_i; s_(i+1)=floor(v_i/M_i)`.

Unrank r_i to the complete original-length ciphertext word using the public constraint schedule and prior ciphertext rune where applicable. Invert backward from terminal state:

`v_i=s_(i+1)*M_i+r_i; p_i=v_i mod P_i; s_i=floor(v_i/P_i)`.

This genuinely carries state across all printed words, including source page carries, and uses no independently fitted word key. Its alphabet includes F as a normal digit; no F bypass is claimed. The SFT verifies all 24 modes (2 head/seam × 2 successor ranks × 6 register orders), all 96 original full inverses for GP26–29 with terminal zero and their **exact source reencryption**. Authentic source-native GP27 and GP28 positives use all 740 solved donor words / 2,979 runes, a known nonzero seed 3301 and source-length-matched repeat constraints; all 48 full controls recover the exact seed and words. This validates the mechanism, not its historical use.

Every zero-terminal original inverse remains nonlinguistic, with at most **one** original dictionary word of length ≥5 out of 1,132. GP29 IoC is 0.034578–0.034754; GP28 0.035701–0.035767; GP27 0.037015–0.037063. These are near the respective uniform alphabet baselines.

## 3. Original minimum initialization: all possible nonnegative terminal states

The backward carry map is monotone in terminal state. Therefore the smallest possible original initial state is the exact inverse with terminal zero; no other terminal state can lower it. All 24 modes produce:

| Alphabet | Free-head minimum initial-state bit length | Fixed-seam minimum initial-state bit length |
|---|---:|---:|
| GP26 | 1,363–1,364 | 1,103–1,106 |
| GP27 | **658–659** | **401–403** |
| GP28 | 14–18 | 0 |
| GP29 | 0 | 0 |

These are numerical lower bounds for this **specific** quotient carry, not general state-cardinality bounds. In particular an original GP27 stream cannot start from any literal 256-bit unsigned initial carry, regardless of the secret terminal value. The already proposed 32-byte table column is therefore too small for this direct initializer even though GP27 has no global counting deficit.

Test the entire actual 256-byte p49–51 numeral table as a literal big-endian initial integer under its conventional base60 row-major bytes and alternative base59 (remove unused f) row-major bytes. For fixed initial state, exact possible outgoing states after each original prefix form an integer interval. If prior possible states are [l,h], then the next feasible interval is

`[max(0,ceil((l*P-r)/M)), floor(((h+1)*P-1-r)/M)]`.

This is exact because the union of v over all prior integers and all p in [0,P) is contiguous; empty interval excludes every plaintext and terminal state under the law. Across 48 literal-table cases each for GP26 and GP27, **0/48** survive (GP27 first contradiction at zero-based word 0,1,2 or 5). GP28 permits 21/48 but leaves enormous terminal ambiguity; the independent all-state suffix theorem below rejects normal prose. GP29 allows 48/48 terminal intervals, but all possible first 13 plaintext runes of the two original red heading words (8+5) across the literal seeds and 24 modes yield only 26 distinct nonlinguistic headings (examples: NTUDEAOHA XUAENGOE, NYIARTIX PBEOXG, THGNGJJOEX ORTHFG). The table is not an authenticated initializer, and this result is only for the two stated literal serializations.

## 4. GP28: all-private-carry lexical obstruction, independent of either endpoint

For any plaintext size A=28, M_i is divisible by 28^t where t=L_i-1-e_i. Hence

`p_i = (s_(i+1)*M_i+r_i) mod 28^L_i`
implies
`p_i mod 28^t = r_i mod 28^t`.

Thus the last t plaintext digits of each word are fixed independently of **all** initial, final and interior carry values, even arbitrary large ones. This remains true across all six mixed-radix orders and both head/seam modes. For an arbitrary one-omitted-GP-symbol source alphabet, map digits in canonical GP ordinal order after deletion and allow any remaining unfixed prefix digits.

The source-independent lexicon is the pinned TextBlob spelling corpus, transformed with manuscript spelling substitutions QU→CW, V→U, K→C, Z→S, and every possible segmentation by standard GP transliterations including ING/NG and IO/IA; add every authentic solved donor word. This deliberately generous finite lexicon has **40,596 distinct GP word forms**. For each of 24 modes × 29 omitted-rune choices = **696** possibilities, compare each exact fixed suffix with all same-length dictionary word endings that do not contain the omitted rune.

**The best any mode and omitted rune can permit is 6 of the original 1,132 words of length ≥5 (0.53%).** Even assigning every free prefix separately and choosing arbitrary carry states cannot repair the other 1,126 long words under that dictionary. Both natural ABD successor conventions alone permit at most 5. All 740 solved native GP28 control words satisfy the exact suffix identity. This is a robust finite-language conditional exclusion of the declared streaming quotient law, not a theorem about all possible dictionaries, modified alphabets or nonlinear arithmetic coders.

For GP29 in free-head mode M_i=29 for any singleton and P_i=29. Thus its singleton plaintext digit is exactly the visible ciphertext digit for every possible carry. The original 83 singleton words contain 28 distinct GP symbols, making the free-head model incompatible with ordinary GP-native singleton usage even if the final state is unlimited. Fixed-seam GP29 is not excluded by this singleton argument.

## 5. Dictionary-restricted quotient carry: all-secret word-rank envelope (Agent12, 24 November)

The finite-language restriction is a genuine escape from the unrestricted input-space counting theorem in §1. Test it explicitly rather than extending the earlier raw-alphabet seed sweep. Replace P_i=A^L_i by the cardinality D_L of the fixed length-L GP dictionary, permitting **every secret ordering of plaintext dictionary words and every secret permutation of the constrained ciphertext words**, independently per (L,e) frame but fixed over the scope. Retain the free-head ciphertext codebook M_i=29 choose(L_i−1,e_i) 28^(L_i−1−e_i) and the causal quotient recurrence of §2, with nonnegative carry, one plaintext word per original printed word and no extra per-word state or output. The historical BASE29 source motivates radix serialization but does not specify this recurrence or dictionary; the result is conditional.

The identical generous finite GP lexicon of §4 has 40,596 forms. Sizes D_1 through D_14 are [25,191,784,2320,4207,6031,6729,6311,5222,3828,2497,1430,715,306]. The two smallest classes are already deliberately permissive: alternate rune segmentations and every solved source form are allowed.

### Order-independent proof

With any initial state 0≤s_0<2^b, let U_0=2^b−1. Because 0≤p_i<D_L, irrespective of the plaintext ordering, every valid original path satisfies

```
U_(i+1) = floor(((U_i+1)*D_L−1)/M_i)
r_i ≤ min(M_i−1, (U_i+1)*D_L−1).
```

The first expression is a safe upper envelope for all possible outgoing carries, since s_(i+1)=floor((s_i D_L+p_i)/M_i). The second bounds the emitted rank by the largest possible pre-division value and the rank domain. Neither calculation knows the secret rank mapping. A repeated identical ciphertext word in a given fixed (L,e) frame must have the same r at every occurrence: assign it the smallest upper cap observed across occurrences. Distinct words in that frame must have distinct ranks. Sort the caps c_0≤…≤c_(t−1). Existence of distinct ranks respecting those upper bounds is equivalent to c_j≥j for every j: if any fails, j+1 distinct words must fit into at most j rank slots; conversely ranks 0,…,t−1 assigned in sorted-cap order fit all caps if the inequalities hold. This is an exact matching criterion on the relaxed caps, hence a necessary (not sufficient) condition for the full streaming recurrence. It covers **all** secret permutations without enumerating or optimizing ranks on ciphertext.

### Original results

The source parser independently asserts all 12,956 GP indices and the 2,896 complete printed words against the canonical corpus, including page carries and 63 internal equalities.

| Initial-state hypothesis | Exact result |
|---|---|
| Entire table, any integer <2^2048 | Upper carry first reaches zero after word169 (zero-based). Of 353 distinct nonrepeat two-rune words, 336 require a rank <191; of 28 singleton types, 27 require a rank <25. Both violate injectivity. |
| Any b≤16,650 bits, whole book | Fails the two-rune frame matching gate. At b=16,650, the 192nd distinct constrained two-rune type needs rank≤190. |
| b=16,651 | First bit cap not excluded by this **necessary** relaxation; no actual valid cipher state or plaintext is established. |
| Eight independent 256-bit initializers at the eight authentic $ section boundaries, one shared frame-rank permutation | Still impossible: 336 two-rune types require ranks <191; all 28 singleton types require ranks <25. |
| Eight independent section-specific rank permutations | No cap-matching contradiction in any individual section at 256 bits. This does not validate the cipher. |

A completely fixed canonical rank (A,B,D, ascending GP ordinal successor) and lexicographic GP dictionary order provide one explicit original inverse. Backward quotient inversion from terminal zero minimizes the initial carry over all nonnegative terminal values for that particular ranking. It requires **31,882 bits** for the whole book; independent section minima are [1845,2816,4316,4589,2514,3499,4108,8185] bits, so all eight literal 256-bit section seeds also fail this particular ranking. Exact forward replay restores all 2,896 printed words and all 12,956 source runes. The minimum-seed candidate is a nonsensical sequence of dictionary words beginning “RETARDING TIMING COBB NOW WWW CONDRATEUNA GROAN INDIA SAC NES”; guaranteed dictionary membership is a property of the inverse, not evidence of prose.

**Positive:** the fixed source dictionary, authentic 740 solved donor words / 2,979 runes, original-length repeat schedules and a nontrivial fixed reversed ciphertext rank permutation encode from seed3301 and decode every donor word and the exact seed. The bound does not falsely reject this native plant at 12 bits. A separate exhaustive small-domain matching oracle checks 386 cap arrays. The [standalone SFT](../sims/lp2_dictionary_carry_allorder_envelope_sft.cjs) ran directly on all four GitHub-fetched source files in Code Mode JavaScript; no independent Windows CI execution is claimed.

**Decision:** retire the literal whole-table and shared-rank eight-column dictionary-carry initialization routes under this exact recurrence and fixed reference lexicon. The 16,651-bit lower bound applies to the bit length of the initial integer, not secret-key entropy; a seed-expansion procedure, much larger or dynamically changing dictionary, independently changing rank map, different framing, auxiliary state, or a non-quotient model escapes this theorem. A separately source-selected rank/initializer could change the research decision, but no such selector has been established. Neither the canonical rank nor the all-order relaxation recovers any unknown plaintext. The general #2273 constrained-code question remains unresolved.

## Decision

Retire the tested streaming quotient consumer for GP28 ordinary source-native prose, and the literal 256-bit column or two full table initialization laws for GP27. The dictionary-rank extension additionally rejects the literal whole table and shared-rank eight-column reset route, and requires at least 16,651 bits for the whole-book initial integer under its necessary rank-cap condition. Do not search alternative carry seeds or mixed-radix field orderings within these exact exclusions. The GP27 full-book surplus is mathematically compatible with a different constrained encoder, but a simple word-local causal implementation needs genuine cross-word state. A source-selected, non-quotient coding rule or a historically authenticated operand that fixes the still-unidentified receiver is necessary. No plaintext or key was recovered; the broad #2273 task remains open for a materially distinct architecture.
