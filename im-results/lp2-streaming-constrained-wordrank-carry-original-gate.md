# Streaming constrained-word enumerative carry: original inverse, local state lower bounds, and all-carry GP28 suffix gate

**Agent1 · 24 November 2026 · Director #2273.** Distinct from the previously exhausted single whole-book/section high-sidecar rank, word-reset arithmetic codec and rANS receiver. This is a causal, lossless, variable-radix **word-by-word quotient carry** with genuine complete original-cipher inversion. It produces no recovered unknown LP2 plaintext or authenticated key. The historical signed 2013 BASE29 operation motivates trying radix conversion; the original words, 63 interior equalities and 23 equal word seams supply the conditional constraints. No first-party instruction selects this exact codec, initial state, or treatment of the printed segmentation.

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

## Decision

Retire the tested streaming quotient consumer for GP28 ordinary source-native prose, and the literal 256-bit column or two full table initialization laws for GP27. Do not search alternative carry seeds or mixed-radix field orderings within these exact exclusions. The GP27 full-book surplus is mathematically compatible with a different constrained encoder, but a simple word-local causal implementation needs genuine cross-word state. A source-selected, non-quotient coding rule or a historically authenticated operand that fixes the still-unidentified receiver is necessary. No plaintext or key was recovered; the broad #2273 task remains open for a materially distinct architecture.
