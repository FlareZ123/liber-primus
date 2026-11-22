# P50 32×8 feedback lookup: exact 29! outer-alphabet capacity obstruction

**Agent 13, 21 November 2026. Intermediate original-cipher result.** An entire source-shaped deterministic cipher family is incompatible with the observed original LP2 ciphertext as an encryption of ordinary Gematria Primus English with the rune frequencies of authenticated solved Cicada text. This is a **key-independent exclusion of every secret outer alphabet**, rather than a guessed-key search. **No unknown LP2 plaintext, authentic decryption key, author-selected mechanism or puzzle destination is recovered.**

## Source clue, mechanism, and strongest alternative

Physical LP2 p50 prints **256 original numeric cells in 32 rows × 8 columns**. The canonical source has **29 GP rune symbols**, which fit into a 32-row lookup, and real eight-step clocks: global rune ordinal, original page-local rune ordinal, original section-local ordinal, or original printed-word rune ordinal. The original ciphertext has exceptionally few adjacent equal symbols, which could motivate checking a changing-alphabet lookup driven by its previous emitted symbol. A small stateful lookup could have been implemented by Cicada's technically literate puzzle author.

The **untested premise is author selection**: neither an authenticated page nor a Cicada message says to use the numerical table as an alphabet-feedback key, or to reduce each table byte modulo 29. The rival explanation is that p50 is a different form of message, navigation graph, numeral source, or input to a nonlinear cipher.

The finite model is

\[
C_i=\sigma(P_i+s\,G[R(C_{i-1}),Q_i]\bmod29),
\qquad s\in\{-1,+1\},
\]

where \(G\) is the **unaltered original 32×8 byte grid**, reduced modulo 29 only at the output; \(\sigma\) is **any one fixed permutation of the 29 GP symbols**; \(R\) is one of the four original-source row conventions \(C_{i-1},C_{i-1}+3,28-C_{i-1},31-C_{i-1}\); and \(Q_i\) is one of the four original clocks under eight phase rotations and both column directions. Every physical page's first rune is granted **arbitrary plaintext**, rather than requiring a shared IV or inherited previous page state.

There are \(4\times4\times8\times2\times2=\mathbf{512}\) outer configurations, each with \(29!\) unknown possibilities for \(\sigma\). This is the same model menu previously **heuristically scored and fitted** in [the prior lookup implementation](../sims/grid_cprev_lookup_sigma.cjs); the result here is a different, exact **all-secret necessary-condition theorem**. Neither the top-scoring old key candidate nor any language score is used.

## A full-keyspace proof with a 29×29 assignment

For any configuration, count the original within-page output pairs by current original ciphertext symbol \(c\) and source-selected grid key value \(k\):

\[
N[c,k]=\#\{i:\ C_i=c,\ G[R(C_{i-1}),Q_i]\equiv k\pmod {29}\}.
\]

The \(55\) physical-page first runes are **excluded**, leaving exactly **12,901** original transitions. For a target plaintext rune \(t\), the inverse gives \(P_i=\sigma^{-1}(C_i)-s k\pmod{29}\). If \(\sigma^{-1}(c)=x_c\), the count of plaintext \(t\) at all eligible positions is exactly

\[
\sum_{c=0}^{28}N[c,\,s(x_c-t)\bmod29].
\]

Because \(c\mapsto x_c\) must be a bijection, its maximum over **all \(29!\) unknown alphabets** is the weight of a **maximum bipartite assignment**, with weight matrix

\[
W_t[c,x]=N[c,\,s(x-t)\bmod29].
\]

For any specified set of target plaintext runes \(T\), replace \(W_t\) by \(\sum_{t\in T}W_t\) before solving the same exact assignment. The result is the *true maximum* for this family on the 12,901 selected positions, not a random-search estimate. The first 55 symbols may all be counted as additional successes. For the one-target set \(\{E\}\) and the two-target set \(\{E,O\}\), reflecting the arbitrary outer permutation makes the two signs \(s=\pm1\) capacity-equivalent. A single 256-mode pass therefore covers all 512 declared configurations.

**Literal-F super-allowance:** On solved p56 one plaintext F can be a transparent non-consuming symbol. This other page's exception does **not** establish such a branch for the unknown pages. To avoid ruling it out too narrowly, remove every **456 non-page-first current ciphertext F** from the assignment entirely, and grant each F arbitrary plaintext, regardless of the position, key or chosen secret alphabet. The other two original F occurrences are already among the 55 free page starts. Thus **511 positions are granted arbitrary plaintext**, even though genuine p56's literal-F branch would only permit F itself. The remaining original pairs still obey the assignment theorem. This generosity gives a safe ceiling for *any choices of literal-F exceptions that do not mutate the source-defined clock*.

## Exact original-source counts

Maximum possible native-GP counts over the entire **12,956-rune** unchanged ciphertext, simultaneously optimizing every unknown \(\sigma\) separately for each target set:

| Source clock | Maximum E | Maximum E + O | Maximum E with F free | Maximum E + O with F free |
|---|---:|---:|---:|---:|
| Physical-page ordinal | 746 | 1,280 | 1,193 | 1,709 |
| Global rune ordinal | 741 | 1,283 | 1,185 | 1,707 |
| Original section-local ordinal | 747 | 1,273 | **1,195** | 1,701 |
| Printed-word local ordinal | 744 | **1,284** | 1,183 | **1,719** |
| **Maxima over all 512 configurations** | **747** | **1,284** | **1,195** | **1,719** |

Even under the F super-allowance, every target \(E\) in every model has at most **1,195 / 12,956 = 9.2235%** of its original source positions; both \(E\) and \(O\) combined can occupy at most **1,719 / 12,956 = 13.2679%**.

The independently available authentic solved-rune source (LP1 and already clear LP2 p56/p57) has **2,979 real GP29 runes**, including **380 E** and **256 O**. Its actual combined rates are **12.756% E** and **21.349% E or O**. At 12,956 runes these rates correspond to approximately **1,653 E** and **2,766 E-or-O**, exceeding even the all-F-free source ceilings by approximately **458** and **1,047** respectively. This is a reference-register comparison: it is strong evidence against using the family to produce ordinary source-native GP English. It cannot rule out deliberately lipogrammatic, differently encoded or unusual plaintext texts with unusually low E/O counts.

## Independent positive and exact reproduction

The [single runnable CommonJS test](../sims/lp2_p50_cprev_outer_assignment_capacity_sft.cjs) reads the canonical original GP29 corpus, printed original word/page/section boundaries and the 256 original p50 values. It asserts the 12,956-rune stream, 2,896 printed complete words, 55 rune-bearing pages, 12,901 eligible transitions, 456 eligible F ciphertext symbols, and all exact maxima in the table. It checks a Hungarian maximum-weight assignment against two small closed-form permutation cases, and checks sign invariance of E and E+O for every configuration.

The positive plant repeats the **actual 2,979-rune authenticated solved-native source**, extends it to the full **12,956-rune source length**, and encrypts it with an independently seeded, fully secret random GP29 outer permutation under the candidate **ciphertext-dependent** p50 lookup, preserving all source page starts and eight-phase word clock positions. The identical decoder then recovers **12,956/12,956 original plant plaintext symbols exactly**, and the assignment upper bound correctly admits the plant's true E and E+O counts. This plant is a source-register/algorithm positive, not a claim to reconstruct a new LP2 passage.

The file passed in the [Windows Node.js 22 original-source workflow run 44955008932](https://github.com/FlareZ123/liber-primus/actions/runs/44955008932). No training set, fitted 29-symbol permutation, external web data or statistical significance claim is required for the original counts.

## Research consequence

**Retire a stationary, secret 29-symbol outer alphabet wrapped around this fixed p50 predecessor-row/eight-phase GP29 lookup as a complete ordinary-English original decoder.** Allowing all page starts and ciphertext Fs arbitrary **still leaves a large mathematically unavoidable E/O shortage**. The earlier best-fitted lookup score already made this family unlikely; the present result closes its unconstrained \(29!\)-alphabet escape route *without* estimating any secret key.

Other possibilities remain alive: an author-specified **dynamic** alphabet, a **clock affected by transparent symbols**, longer-memory cipher state, an independently supplied running key, a transposition or variable-length intermediate register, or source material currently missing. This negative family theorem does not establish which of those actually operates, and **all 56 unsolved LP2 pages remain unsolved**.
