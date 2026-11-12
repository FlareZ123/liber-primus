# A 252-symbol table quotient as nine chapter keys: direct GP28 inverse

**Decision (12 November 2026):** The source-derived p50 quotient has exactly 252 symbols, while the original book has nine visually marked unknown chapters and GF(29) has 28 nonzero elements. A fixed 9×28 quotient-to-key interpretation was tested directly against all **12,956 original unsolved runes**. Its decoded GP29 IoC is **0.0352768489** and every original chapter remains nonlinguistic. This excludes the frozen decoder and adds a key-independent necessary-condition test for **any 28-way secret substitution at each nonzero-step chapter phase**, under native GP28 English. No unknown plaintext is recovered.

## Source clues and weakest assumption

The printed 32×8 table on physical pp49–51, read with the conditional conventional base60 codec, defines a degree-255 descending-coefficient polynomial P over GF29. The authenticated 2013 BASE29 example 3301 → 3QO gives H(X)=3+26X+24X². The p39 red triad and the archived DH23 example together suggest G(X)=27+5X+15X². Direct long division by F=H·G=[23,21,11,17,12] ascending leaves an exact zero remainder and a **252-symbol quotient Q**, source-order high coefficients first.

The nine original red-heading/preceding-red13 visual chapters are **pp0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53, 54–55**, with exact rune lengths **729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308**. Thus 252=9×28 supplies exactly 28 key symbols per chapter. The independent red source field element 15 is a primitive root mod29 (28 nonzero residues), suggesting a GP28 difference cipher that gives a potential account of the unusual shortage of repeated ciphertext runes.

**Unsupported premise:** no original instruction currently says to use Q as a nine-chapter key. The numerical fit motivates this single bounded test and does not authenticate the architecture.

## Frozen original-input decoder

For chapter s and its 28-symbol quotient block Q_s, preserve the first original ciphertext rune unchanged as the chapter IV. Each subsequent ciphertext rune C_i uses its original predecessor C_(i−1). Compute d=(C_i−C_(i−1)) mod29. If d=0, output GP EA (index28). Otherwise decode

\[
P_i=(\log_{15}(d)-Q_s[k\bmod 28])\bmod28,
\]

where k starts at zero and increments only on nonzero d; quotient symbols are reduced mod28. The fixed sign follows the historically demonstrated GP additive subtraction convention. The forward map adds Q in the exponent, exponentiates base15, and accumulates mod29. No phase, orientation, source reset, word-offset or alphabet search is fitted.

## Original readout

| Physical chapter | Original GP29 IoC | Decoded GP29 IoC |
| --- | ---: | ---: |
| p0–2 | 0.034083 | 0.035590 |
| p3–7 | 0.034634 | 0.035148 |
| p8–14 | 0.034460 | 0.035392 |
| p15–22 | 0.034502 | 0.035411 |
| p23–26 | 0.034274 | 0.034668 |
| p27–32 | 0.034186 | 0.035544 |
| p33–39 | 0.034360 | 0.035058 |
| p40–53 | 0.034543 | 0.035219 |
| p54–55 | 0.033821 | 0.034435 |

Across all 12,956 ciphertext runes, the decoder outputs no independently readable GP29 words or phrases. For example, the initial transliteration excerpts are **STHNGGDHFRHPJTHNGLICYMIPYLSGFCOAOTWROTFU** from p0–2 and **AASTHIPFIANGXWTTFOEYAEDAJEALOETJOEFUFU** from p54–55. Isolated word-like fragments within uniformly distributed text are not decryption evidence.

The inverse reencrypts the entire original book **12,956/12,956**. A separate positive source control uses the known p57 native-GP plaintext (95 runes), cyclically tiled to match all nine chapter lengths, encrypts with the identical quotient keys, and independently decodes **12,956/12,956** native runes; positive source IoC is **0.0723358065**. The tiled positive verifies functionality and is not presented as a matched statistical language null.

## Full secret-permutation obstruction for the nonzero-step clock

A source-exact equality invariant strengthens the direct-key result. At each chapter, discard its first IV and the source's 86 adjacent-equal ciphertext sites, then count only nonzero predecessor steps. Assign each retained step to its own chapter and phase modulo28. In the original book this gives **12,861** GP28 observations in **252 chapter/phase bins**.

Within each bin, any invertible hidden 28-rune alphabet changes labels while preserving which symbols are equal. The original log15 difference channel, equivalently the observed nonzero difference minus one, yields **14,513 equal-rank pairs among 407,716 within-bin pairs**, a collision rate of **0.03559585594**. This invariant cannot be changed by the proposed quotient key, an unknown additive key, or **any arbitrary secret bijection at each of the 252 states**.

As a native source control, the fixed first 300,000 Shakespeare characters were normalized to GP tokens using the repository's existing mapping (QU→CW, V→U, K→C, Z→S, greedy digraphs), with EA removed to match the nonzero-step register. The result contains **217,167** GP28 positions. Its **16 disjoint**, consecutive 12,861-position source windows were projected into exactly the same original nine chapter/phase bins. Their within-bin collision rates range **0.0594040950 to 0.0633259426** (median **0.0619156472**); **0/16** are at or below the original. These controls are descriptive, with correlated lexical style and one author, but the difference is large and the criterion is invariant under every stationary secret alphabet.

**Decision from the invariant:** Even a perfect unknown 252-alphabet key would not recover ordinary GP28 English from this exact **nonzero-step** chapter clock. This is a necessary-condition obstruction under the conditional EA marker and native-English premises, and it is stronger than the failure of the literal Q key alone. Arbitrary changing internal state, another preprocessing register, non-English source, or a different clock remains open.

This extends rather than duplicates [Agent31's earlier nine-chapter quotient gate](lp2-grid-q252-ninechapters-rank28-key-gate.md), which tested **source-position** period28 clocks with sorted and cyclic predecessor ranks and their own arbitrary-secret invariant. Here the key advances **only on nonzero steps**, and the fixed direct inverse uses **discrete logarithms base15** rather than either earlier rank order. Both results independently reject their own specified stationary mechanisms.

## Research decision

Retire the direct source-order Q252 nine-chapter period-28 log-step transfer. Its failure does not negate the exact p50 factors, the chapter boundaries, or any independently justified key source. Further operations need a new original instruction or a decisive fresh plaintext prediction rather than more unselected quotient orientations. The separate all-secret nonzero-clock invariant also makes guessing better 28-substitution permutations unproductive under the same native-English assumptions.

Reproducer: [source-exact CommonJS SFT](../sims/lp2_q252_ninechapter_gp28_step_sft.cjs). Prior separately scoped work: [p50 factors and quotient](p50-p39-p3-field-remainder.md) and [source visual chapter atlas](lp2-global-original-visual-section-map.md).
