# LP2 p50 256-state table graph: complete all-secret original-cipher exclusion

**23 November 2026, Agent2. Exact original-source necessary-condition negative, with complete native-GP positive controls. No genuine unknown LP2 plaintext or authentic Cicada key.**

[Single read-only Windows Node22 source SFT](../sims/lp2_p50_autonomous_256state_allsecret_original_sft.cjs) · [PASS 45113545563](https://github.com/FlareZ123/liber-primus/actions/runs/45113545563) · [Director Issue #2339](https://github.com/FlareZ123/liber-primus/issues/2339) · [distinct p7 quartic 29-state model](lp2-p7-quartic-29state-evolving-allsecret-original-gate.md).

## Source-origin premise and independent alternative

Original physical pp49–51 contain the original 32×8 numeral grid, with **256** base60-interpreted source bytes. Interpreting each byte as the next **table address** gives a total deterministic 256-state functional graph, already investigated for the possible original p33 red84 → p39 red47 → p55 76-rune recipient route. A contemporary human could plausibly view each table value as a byte-sized state update for an LP2 cipher.

This last interpretation is **an analyst hypothesis**. A serious rival is that the table instead locates a separate external payload or gives a different, independently specified instruction. This experiment therefore rules out only the exact machine defined here, and does not claim to have discovered a creator-selected opcode.

The unknown original pages p0–55 comprise **55 physical rune-bearing pages**, **12,956 actual GP29 runes**, and **19 distinct internal large-mark cuts** in these pages. Page and authentic mark resets define either 55 or 74 state segments. Printed words and physical line breaks remain unchanged.

## A fully reversible cipher family with completely secret alphabets

Let \(B\) be the literal printed 256-byte table. At the beginning of every original segment g allow any independent secret byte seed s, and update state autonomously:

\[
s_{g,i+1}=B[s_{g,i}].
\]

At each state s and each original segment g, grant a completely unrelated, secret **GP29 permutation** \(A_{g,s}\), of all 29! possible bijective alphabets. The candidate receiver is

\[
P_i=A_{g,s_i}(X_i),\qquad
X_i=C_i\quad\text{or}\quad X_i=C_i-C_{i-1}\pmod {29}.
\]

The second variant uses the preceding rune of the same physical original page for every difference, retaining it across internal marks. Page-first runes are literal public IVs and excluded from differential decode steps. Direct current-C input includes page-first runes.

Thus all \(256^{55}\) or \(256^{74}\) independent initial-state tuples, and every source-segment/state-specific private GP29 alphabet, are included without fitting any secret keys to output language.

An **all-key equality invariant** for any pair of positions i,j in the same source segment and hidden state follows directly from injectivity:

\[
P_i=P_j\iff X_i=X_j,\qquad(s_i=s_j).
\]

No unknown alphabets can alter that within-state pair equality structure. This provides a sharp actual-source cipher obstruction without guessing a key.

## Exact seed-optimized source limit

For one segment g and each of its 256 possible initial seeds q, group all source positions by deterministic graph state and input rune X. Count the equal-input unordered pairs E_g(q) within the same state, and all within-state unordered pairs T_g(q). The exact maximal native-plaintext same-state equality fraction over **every independently chosen page/mark seed** is

\[
\rho_{\max}=\max_{q_1,\ldots,q_G\in\{0,\ldots,255\}}
\frac{\sum_gE_g(q_g)}{\sum_gT_g(q_g)}.
\]

The SFT solves the entire enormous Cartesian seed problem **exactly**, using finite-ratio fractional programming with integer comparisons. Given a rational candidate a/b, it independently maximizes the integer value bE−aT across all 256 states for each segment. At the returned optimum, the sum of all independently maximal reduced scores equals **exactly zero**, which certifies global maximality without enumerate all 256^G tuples. This is more precise than the invalid independent max(E)/min(T) relaxation, which produces misleading values near25%.

| Original-source receiver | Reset | Source segments | Exact optimal E / T | Max equality rate |
|---|---|---:|---:|---:|
| Direct current C | Physical page | 55 | 7,144 / 200,362 | **0.035655464** |
| Direct current C | Page + authentic marks | 74 | 5,096 / 141,536 | **0.036004974** |
| Same-page difference D | Physical page | 55 | 7,609 / 202,580 | **0.037560470** |
| Same-page difference D | Page + authentic marks | 74 | 7,183 / 190,590 | **0.037688231** |

**3.7689%** is the most permissive genuine all-key original ceiling among the four declared models. This includes every imaginable 256-state initial seed for each source segment and every possible independent secret output substitution. Choosing p33-red84 or p50 first-cell203 as the true initial byte cannot exceed it.

## Actual native-GP source-language positive controls

The same single file performs exact forward encryption and full inverse recovery under separately private **source segment × state** GP29 permutation tables. For difference channel D, the page's literal first rune is carried as its public IV; every remaining ciphertext rune is obtained cumulatively modulo29. State updates use the **same exact original p50 table**, original 55 page boundaries and original 19 internal marks. These are genuine full secret-key cipher plants, not direct IoC comparisons against unrelated prose.

It creates three independently sourced **12,956-rune** native-GP29 prose controls from Gibran's *The Prophet*, Emerson's essays and Shakespeare (all GP-normalized with fixed rune offset1000), and an additional **1,001-rune authentically solved LP1** control from six established clear sections. All eight exact forward-encrypt/decrypt positives recover every planted original symbol; the full-length six donor plants have native within-state equality rates asserted at least **0.012 higher than the source's optimal all-key upper bound** in their respective C/D variants. The original source impossible inequality is exact; donor-language contrast is empirical.

## Distinct ciphertext-feedback fork: exact underidentification, not a decryption

A useful further decision distinguishes this **autonomous** graph-state exclusion from a state that **consumes original ciphertext**. Retain all 256 original table bytes and the same 74 real page/mark segments, but explicitly test two conventional binary state combiners with the original GP rune C or same-page delta D:

\[
s_{i+1}=B[s_i]\ \mathrm{XOR}\ X_i
\quad\text{or}\quad
s_{i+1}=(B[s_i]+X_i)\bmod256,\quad X_i\in\{C_i,D_i\}.
\]

Both direct current-rune output and original GP29-difference output are eligible, giving eight strictly fixed observable-input models. **This binary-combiner choice is analyst-selected, not an authenticated Cicada instruction.** For a page-first C-output symbol with D-driven state, use the explicit GP0 predecessor0; for a D-output channel the first page rune is a literal known IV and excluded. Internal genuine marks keep the same-page ciphertext predecessor.

Apply **the identical mathematically exact 256-way independent-per-segment seed optimization** to each of these eight originals. The resulting exact all-secret upper equality fractions are:

| Private output input | State feedback | XOR maximum | ADD modulo256 maximum |
|---|---|---:|---:|
| Current C | Current C | 440 / 6,032 = **0.0729443** | 444 / 6,307 = **0.0703980** |
| Current C | Same-page D | 453 / 5,980 = **0.0757525** | 444 / 5,944 = **0.0746972** |
| Same-page D | Current C | 440 / 5,821 = **0.0755884** | 476 / 5,885 = **0.0808836** |
| Same-page D | Same-page D | 439 / 5,971 = **0.0735220** | 449 / 6,076 = **0.0738973** |

Every feedback graph-state ceiling now exceeds **7%**, above ordinary native GP within-state equality. This one invariant **cannot exclude** these keyed-feedback architectures. A high upper bound is only a lack of contradiction, not evidence that any original plaintext, key, cipher or author operation has been recovered.

The independent source-red84 seed makes the **identifiability weakness concrete**. Under original 74 segment cuts, eight feedback models expose only **183–221 repeated (segment,state,input) triples** among 12,901–12,956 glyph positions. Equivalently **98.3–98.6%** of positions have a unique input triple with an individually unconstrained secret output label. This shows why feedback with private output alphabets rapidly becomes too flexible for an original-language collision test alone, even though the autonomous graph remained sharply testable.

[Reproducible feedback SFT](../sims/lp2_p50_bytefeedback_256state_identifiability_sft.cjs) calculates every 256-seed optimum, verifies complete original glyph/mark counts, asserts all eight exact rational numerators/denominators, and separately reports the original red84-bin reuse. It supplies a **bounded causal fork**: an authored ciphertext-feedback opcode and an independently recovered secret-alphabet/key schedule are required before any further decoding effort. Algebraic source compatibility by itself is not a breakthrough.

## Cryptanalytic decision

**The literal p50 256-byte autonomous byte-pointer state machine with direct ciphertext or current difference input and any private GP29 bijection in every state/segment cannot yield ordinary GP29-English source-style plaintext on the unchanged LP2 p0–55 pages.** Its source ceiling is 3.56–3.77%, whereas properly forward-encrypted real native GP controls exceed that bound. It is mathematically pointless to hunt private alphabet substitutions, magic 256-byte initial seeds or page/private mark reset phases within this specific architecture.

A source-selected plaintext-dependent or ciphertext-dependent state transition, extra plaintext/ciphertext transposition, changed word spaces, non-GP intermediate register, or authenticated external key lies outside this theorem. The p50 table does **not** supply an author-authenticated such update instruction; these remain alternative routes rather than inferred solutions.

**No original unknown-page plaintext, genuine cipher key, or final destination was recovered.** Source bytes and every exact code/invariant and native positive are reproducible in the linked read-only SFT.
