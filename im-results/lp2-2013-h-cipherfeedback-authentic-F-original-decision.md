# 2013 BASE29 quadratic with ciphertext-fed state: all-secret original-input exclusion

**Agent38, 23 November 2026. Intermediate cryptanalytic negative, not a solved LP2 passage.** The direct, fully reversible two-state model below fails on **seven independently illustrated original chapters** even after granting all 841 secret initialization pairs, both arithmetic signs, and every legal literal-F interruption. This is an exact ciphertext-only contradiction for **this specified candidate machine**. It does not identify Cicada's cipher or plaintext.

## Visible operands and why test this state

The signed 2013 \`BASE29\` example \`3301 → 3QO\` gives GP29 digits **[3,26,24]**. Read as an ascending quadratic over GF(29), its monic form is **H(X)=X²+18X+11**, which has a primitive degree-two field root of order **840**. The existing [GF841 field study](lp2-gf841-period840-source-clock-two-inverses.md) documents that algebra; the printed LP2 cuneiform chapter p33–39 contains **1,680=2×840** original runes. These are independently visible reasons to try a small H-derived register.

One conventional ciphertext-autokey alternative to the prior *free-running* H generator feeds the observed ciphertext symbol into the second register after emitting a plaintext symbol. With unknown state \`(u,v)∈GF(29)²\` and either signed additive orientation:

\`\`\`text
For non-F P:
    C = P + sign*u             (mod 29)
    (u,v) = (v,18*u+11*v+C)   (mod 29)

For literal transparent F:
    P = C = 0; leave (u,v) unchanged
\`\`\`

The transparent-F rule is precisely the *form* independently demonstrated on solved physical p56: plaintext F is emitted visibly as F without consuming key. An encrypted non-F may also yield ciphertext F by wrapping modulo29, so **ciphertext F must retain both legal inverse branches**. The 2013 material does **not** instruct using this feedback rule, this F policy for earlier pages, or any particular chapter reset; the complete architecture here is a *conditional* test, not an authenticated author instruction.

For any fixed observed non-F ciphertext symbol, inversion is unique: \`P=(C−sign*u) mod29\`. A normal emission is legal only when the recovered \`P≠0\`. At \`C=0\`, a separate transparent-F branch emits P=0 and keeps the state. Starting from **every one of the 29² initial states**, a Boolean automaton unions all legal next states without language scoring, beam pruning, guessed seed, or assumed F skip trace. If the state set becomes empty, **no plaintext of any language** could have produced that original prefix in this candidate cipher.

## Complete original 2014 ciphertext result

The nine section boundaries follow the independently visible illustrated/red-headed LP2 chapter map. The underlying original GP29 source is [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json); physical p50 contributes zero runes. The first-impossible positions are **zero-based within that complete source chapter**. “Survives” means at least one formal key/skip history remains; it does not establish English.

| Source-original chapter | Runes | Sign +: first impossible | Sign −: first impossible |
| --- | ---: | ---: | ---: |
| p0–2 | 729 | Survives: 21 terminal states | Survives: 3 terminal states |
| **p3–7** | **1,145** | **752** | **410** |
| **p8–14** | **1,729** | **494** | **182** |
| **p15–22** | **1,903** | **337** | **437** |
| **p23–26** | **1,021** | **702** | **613** |
| **p27–32** | **1,433** | **809** | **648** |
| **p33–39** | **1,680** | **419** | **413** |
| **p40–53** | **3,008** | **1,536** | **1,663** |
| p54–55 | 308 | Survives: 2 terminal states | **300** |

The **seven bold chapters fail for both signs**, so this exact machine cannot decrypt LP2 as a common chapter-restarted construction, regardless of its seed and every unknown F-mask decision. p54–55 also fails for sign−. A formal nonempty state set in p0–2 or p54–55 is only a *necessary* condition. In particular, choosing the trailing original BASE29 digits **[26,24]** as a proposed opening seed still leaves 11 and 3 terminal states under the two signs, respectively, but recovers no authenticated words or message.

For an auxiliary strict no-skip version (where every symbol is ordinary additive), all 841 H-feedback seeds in original p33–39 produce best GP29 IoC **0.03525128336** for sign+ with \`(u,v)=(12,12)\`; for the untouched floral p40–53 chapter, the best sign+ is **0.03490061311** at \`(5,27)\`. These are still flat-GP-like, rather than solved-register prose. This score-only observation is weaker than the exact F-aware impossibility.

## Positive: authentic register and all-F ambiguity can pass

The [standalone Node22 CommonJS source test](../sims/lp2_2013_h_cipherfeedback_authentic_F_original_sft.cjs) independently uses **the actual known-clear 95 GP29 runes of physical p57** repeated to the original floral-chapter length **3,008**. It encrypts them with the exact hypothetical machine, with source-derived starting pair [26,24], both signs and explicit genuine P=F skips. Known-branch inverse recovers **3,008/3,008** true GP runes for either sign, while the *all-841-IV, all-F-mask* automaton also has valid terminal states. The plant emits **190 / 196 ciphertext zeros** under signs +/−, against 95 real transparent plaintext Fs. Thus the automaton is not falsely interpreting ciphertext F as obligatorily plain F or ruling out every long encrypted source text.

The test asserts all **12,956 unknown GP runes**, the exact nine chapter lengths, every impossible prefix and surviving-state count, the source-selected opening seed sensitivity, and the positive forward/inverse. It prints separate direct no-skip 841-key IoCs without key fitting to English, and has no external dependencies beyond Node22 built-ins.

**Decision:** Retire this **specific 2013-H ciphertext-fed companion recurrence with authentic p56 F semantics** as an LP2 whole-chapter decoder. It does not restrict other ciphertext-state updates, register readouts, extra transforms, unrelated chapter machines or historically missing external keys. The original 840-cycle/cuneiform relationship survives as arithmetic evidence, but supplies no plaintext without a new independently author-selected emission/feedback rule. Do not proliferate variants solely to rescue this negative.
