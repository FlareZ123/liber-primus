# 2013 BASE29 quadratic with ciphertext- or plaintext-fed state: all-secret original-input exclusions

**Agent38, 23 November 2026. Intermediate cryptanalytic negative, not a solved LP2 passage.** Both direct, fully reversible two-state models below fail on **seven independently illustrated original chapters** after granting all 841 secret initialization pairs, both arithmetic signs, and every legal literal-F interruption. This is an exact ciphertext-only contradiction for **these specified candidate machines**. It does not identify Cicada's cipher or plaintext.

## Visible operands and why test this state

The signed 2013 \`BASE29\` example \`3301 → 3QO\` gives GP29 digits **[3,26,24]**. Read as an ascending quadratic over GF(29), its monic form is **H(X)=X²+18X+11**, which has a primitive degree-two field root of order **840**. The existing [GF841 field study](lp2-gf841-period840-source-clock-two-inverses.md) documents that algebra; the printed LP2 cuneiform chapter p33–39 contains **1,680=2×840** original runes. These are independently visible reasons to try a small H-derived register.

Two conventional feedback alternatives to the prior *free-running* H generator feed either the **observed ciphertext C** or the **just-recovered plaintext P** into the second register after each ordinary emission. Both are invertible with a specified starting state and F-mask. With unknown state \`(u,v)∈GF(29)²\` and either signed additive orientation:

\`\`\`text
For non-F P:
    C = P + sign*u             (mod 29)
    (u,v) = (v,18*u+11*v+Z)   (mod 29)
    Z = C (ciphertext-feedback model) or P (plaintext-feedback model)

For literal transparent F:
    P = C = 0; leave (u,v) unchanged
\`\`\`

The transparent-F rule is precisely the *form* independently demonstrated on solved physical p56: plaintext F is emitted visibly as F without consuming key. An encrypted non-F may also yield ciphertext F by wrapping modulo29, so **ciphertext F must retain both legal inverse branches**. The 2013 material does **not** instruct using either feedback rule, this F policy for earlier pages, or any particular chapter reset; the complete architecture here is a *conditional* test, not an authenticated author instruction.

For any fixed observed non-F ciphertext symbol, inversion is unique: \`P=(C−sign*u) mod29\`. A normal emission is legal only when the recovered \`P≠0\`. At \`C=0\`, a separate transparent-F branch emits P=0 and keeps the state. Starting from **every one of the 29² initial states**, a Boolean automaton unions all legal next states without language scoring, beam pruning, guessed seed, or assumed F skip trace. If the state set becomes empty, **no plaintext of any language** could have produced that original prefix in this candidate cipher.

## Complete original 2014 ciphertext result

The nine section boundaries follow the independently visible illustrated/red-headed LP2 chapter map. The table presents **two independent state machines** with the same first-party operands, not two post-fit keys. The underlying original GP29 source is [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json); physical p50 contributes zero runes. The first-impossible positions are **zero-based within that complete source chapter**. “Survives” means at least one formal key/skip history remains; it does not establish English.

| Original chapter | Runes | Cipher-feedback + / − | Plaintext-feedback + / − |
| --- | ---: | ---: | ---: |
| p0–2 | 729 | Survive 21 / 3 states | Survive 14 / 2 states |
| **p3–7** | **1,145** | **752 / 410** | **547 / 459** |
| **p8–14** | **1,729** | **494 / 182** | **589 / 790** |
| **p15–22** | **1,903** | **337 / 437** | **319 / 354** |
| **p23–26** | **1,021** | **702 / 613** | **790 / 610** |
| **p27–32** | **1,433** | **809 / 648** | **669 / 729** |
| **p33–39** | **1,680** | **419 / 413** | **379 / 421** |
| **p40–53** | **3,008** | **1,536 / 1,663** | **1,664 / 682** |
| p54–55 | 308 | Survive 2 / **300** | Survive 2 / 3 states |

The **seven bold chapters fail for both signs**, so neither H-injected-feedback machine can decrypt LP2 as a common chapter-restarted construction, regardless of its seed and every unknown F-mask decision. In the short terminal p54–55 chapter, **only ciphertext feedback sign−** fails, at original offset300; the other three cases survive formally without plaintext. A formal nonempty state set in p0–2 or p54–55 is only a *necessary* condition. In particular, choosing the trailing original BASE29 digits **[26,24]** as a proposed opening seed still leaves 11 and 3 terminal states under the two signs, respectively, but recovers no authenticated words or message.

For an auxiliary strict no-skip version (where every symbol is ordinary additive), all 841 H-feedback seeds in original p33–39 produce best GP29 IoC **0.03525128336** for sign+ with \`(u,v)=(12,12)\`; for the untouched floral p40–53 chapter, the best sign+ is **0.03490061311** at \`(5,27)\`. These are still flat-GP-like, rather than solved-register prose. The corresponding plaintext-feedback sign+ best on p33–39 is **0.03507331461** at `(22,28)`, and on p40–53 is **0.03480221681** at `(23,25)`. All are flat-GP-like. These no-skip score-only observations are weaker than the exact F-aware impossibilities.

## Positive: authentic register and all-F ambiguity can pass

The [standalone Node22 CommonJS source test](../sims/lp2_2013_h_cipherfeedback_authentic_F_original_sft.cjs) independently uses **the actual known-clear 95 GP29 runes of physical p57** repeated to the original floral-chapter length **3,008**. It encrypts them with **both candidate feedback machines**, with source-derived starting pair [26,24], both signs and explicit genuine P=F skips. Known-branch inverse recovers **3,008/3,008** true GP runes for each of all four feedback/sign variants, while the *all-841-IV, all-F-mask* automaton also has valid terminal states. For ciphertext feedback, the plant emits **190 / 196 ciphertext zeros** under signs +/−, against 95 real transparent plaintext Fs. Both plaintext-feedback variants also exercise encrypted non-F to ciphertext-F wrapping. Thus the automaton is not falsely interpreting ciphertext F as obligatorily plain F or ruling out every long encrypted source text.

The test asserts all **12,956 unknown GP runes**, the exact nine chapter lengths, every impossible prefix and surviving-state count for **both** feedback models, the source-selected opening seed sensitivity, and four independent positive forward/inverses. It prints separate direct no-skip 841-key IoCs without key fitting to English, and has no external dependencies beyond Node22 built-ins.

**Decision:** Retire both **specific 2013-H ciphertext-fed and plaintext-fed companion recurrences with authentic p56 F semantics** as an LP2 whole-chapter decoder. It does not restrict other ciphertext-state updates, register readouts, extra transforms, unrelated chapter machines or historically missing external keys. The original 840-cycle/cuneiform relationship survives as arithmetic evidence, but supplies no plaintext without a new independently author-selected emission/feedback rule. Do not proliferate variants solely to rescue this negative.
