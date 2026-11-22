# Source-derived 9×28 polynomial as a nonlinear previous-plaintext key

**Original-cipher decision (Agent 18, 15 November 2026):** A distinct, fully executable source-derived feedback mechanism fails to recover readable GP-native plaintext anywhere in the original 12,956-rune LP2 unknown corpus. Even after granting all **29 possible chapter-initial plaintext runes**, all nine original chapter outputs remain close to uniform rune frequencies. The original data, all seeds, four exact coefficient/sign conventions and positive controls were executed on Windows Node.js 22 in [manual CI 43670864157](https://github.com/FlareZ123/liber-primus/actions/runs/43670864157). No unknown plaintext, authentic key, destination or authored cipher operation was recovered.

## Specific clue-to-consumer proposal

The **source-authentic 2013 Cicada BASE29 3301 example** supplies a GF29 quadratic `H(X)=3+26X+24X²`; the original physical LP2 p39 red triad supplies `G(X)=27+5X+15X²`. Both divide the original 256-symbol table polynomial exactly, yielding a **252-symbol quotient** `Q` over GF29. The manuscript visibly divides into **nine illustrated/red-heading chapters**. Thus `252=9×28` yields exactly **28 source-supplied coefficients per chapter**.

The quotient has previously been tested as periodic additive keys and previous-*ciphertext*-difference/rank keys, which failed on the original manuscript, including their all-secret invariants ([prior GP28 rank gate](lp2-grid-q252-ninechapters-rank28-key-gate.md), [original chapter log-step gate](lp2-q252-ninechapter-gp28-step-gate.md)). This experiment tests a **distinct nonlinear, previous-*plaintext*-driven source consumer**. For each chapter `s`, use its untouched 28 quotient entries as the coefficients of a polynomial `f_s` of degree at most 27 over GF29. A degree-27 polynomial can represent a nonlinear 29-input function while retaining exactly the source's per-chapter coefficient count. The proposed complete original GP29 cipher is

```text
C[s,0] = P[s,0]                // visible leader or unknown IV
C[s,i] = P[s,i] - sign*f_s(P[s,i-1]) mod 29,  i>=1
P[s,i] = C[s,i] + sign*f_s(P[s,i-1]) mod 29
```

This uses genuine plaintext feedback rather than the predecessor ciphertext or a 28-symbol repeating phase. It can produce nonuniform ciphertext under a state-dependent rule, even when the source key is given. The source **does not instruct a solver to use polynomial evaluation or this feedback**, so the proposed operation is a falsifiable hypothesis rather than an identified historical cipher. The first GP rune in every chapter is either transmitted unchanged (natural proposal) or one freely chosen unknown initial rune from GP29, making the finite seed search complete.

The source grid byte SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The original source-order table is reduced modulo29 and divided by the **original descending factor** `HG=[12,17,11,21,23]`. The exact original remainder is `[0,0,0,0]`; the quotient begins `[0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21]`. The 9 chapters are the frozen physical page ranges `0–2,3–7,8–14,15–22,23–26,27–32,33–39,40–53,54–55`, with rune lengths `729,1145,1729,1903,1021,1433,1680,3008,308`. No original ciphertext is modified.

## Entire original-input inverse

Four conventions were frozen: quotient entries as **highest-power first** (the mathematically natural original long-division order) versus ascending-power control, and both additive feedback signs. Every chapter is decoded with natural `P[0]=C[0]` and **also all 29 possible values of P[0]**. The ranking below exhausts 4×9×29 complete chapter candidates, without choosing a dictionary, crib, key or local phase.

| GF29 polynomial coefficient order | Feedback sign | Natural-seed full-book GP29 IoC | Highest chapter IoC among all 29 IVs |
| --- | --- | ---: | ---: |
| Source quotient high-degree first | minus (decode C−f) | **0.034481460** | 0.0351556 |
| Source quotient high-degree first | plus (decode C+f) | **0.034450038** | **0.035281** |
| Reverse quotient, ascending order | minus (decode C−f) | **0.034467018** | 0.034748 |
| Reverse quotient, ascending order | plus (decode C+f) | **0.034470641** | 0.034756 |

Every chapter remains near the uniform GP29 benchmark `1/29=0.034482759`, including the best freely selected IV for every chapter. A longer genuine GP-native English page would ordinarily have substantially greater letter concentration, and even the original **95-rune solved p57** has IoC **0.062709966**. The small original maxima are measured *after* choosing each seed and provide no source-independent plaintext. The naturally decoded output is random-looking, and the full 12,956-rune stream has no recovered words that satisfy a reproducible source-selected decryption claim.

## Reproduction and decision

The [single runnable original-input CJS](../sims/lp2_q252_chapter_polynomial_plainfeedback_sft.cjs) asserts the canonical table hash and 4-symbol zero remainder; checks all original chapter lengths and 29-symbol inputs; decodes every original rune under all source variants and IVs; forward reencrypts each natural-seed output; and encrypts **the exact known 95-rune p57 PARABLE plaintext** under each of the 36 chapter/sign/order combinations. Every planted ciphertext decodes exactly **95/95** symbols, proving that a native-GP message under this specific nonlinear feedback would be recovered. It performs no writes and needs only Node.js 22 built-ins.

The bounded conclusion retires the natural **source-Q252 → nine arbitrary degree-27 GF29 polynomial lookup tables → one-step plaintext feedback** as a direct original GP29 decryptor under the tested source orientations and signs. This is separate from earlier nine periodic-key and previous-ciphertext gates. It says nothing about separately keyed feedback on words or pages, non-GP intermediate text, additional encryption layers, source-prescribed nonlinear clocks or whether the two original table factors were deliberately planted. A new branch should require an original clue for a different *consumer*, since further IV and coefficient-order fitting has no evidence of recovering plaintext.
