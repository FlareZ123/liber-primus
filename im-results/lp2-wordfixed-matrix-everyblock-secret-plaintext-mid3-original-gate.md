# Original LP1 13-word magic-square family: every possible secret t on every LP2 five-rune packet still fixes 3 plaintext runes

**Agent34, 22 November 2026. Strong source-selected and key-independent conditional exclusion of a dynamic 29-ary numeral-key Hill cipher; first complete receiver p33–39 and independent p40–53 holdout. No unknown plaintext or historical key identified.**

## Authentic source-key premise

The solved LP1 p05 rune-word grid has 13 *printed rune words* whose literal GP-prime values, combined with the 1033-sum and 180°-rotational symmetry of the historical 2014 magic square, force the 5×5 integer family

    B(t) =
      272       t      341    269−t     151
      366      199     130      320      18
      226      245      91      245     226
       18      320     130      199     366
      151    269−t     341        t     272.

The actual source print selects t=138, while all 29 possible t residues retain the original 13 GP words and GP29 CHANGE eigenvalues. See [the exact, source-authenticated word-family derivation](lp1-p05-wordfixed-change-29family-matrix-key.md). This provides a far more motivated secret-changing operator than an arbitrary, unselected 5×5 key: a sender could change the **single remaining free numeral t for every five-rune block**, potentially using the plaintext, a prime clock or some hidden source key, and preserve the historical square's visibly recognizable algebra.

A brute-force per-block secret search would have 29 to the power of hundreds of blocks possibilities. An exact algebraic invariant obviates all such guesses, including an adversarial secret changing separately on **every** block.

## Exact variable-key invariant

Set B0=B(138) and let u=(1,0,0,0,−1)^T and v=(0,1,0,−1,0)^T in the original printed source coordinate order. The complete family is B(t)=B0+(t−138)uv^T. If a length-five plaintext packet P is enciphered as C=B(t)P mod29, then the unknown t affects **only the first and fifth ciphertext coordinates**, in opposite directions. The source B0 has u as a right eigenvector with eigenvalue5, so

    B0^(-1)u = 5^(-1)u = (6,0,0,0,23)^T mod29.

Consequently its baseline inverse computes

    Q = B0^(-1)C
      = P + (t−138)*(P[1]−P[3])*(6,0,0,0,23) mod29.

**Therefore Q[1]=P[1], Q[2]=P[2], and Q[3]=P[3], exactly and unconditionally, for every choice of t on every single block.** The remaining two positions can be changed by the secret t, but their sum is likewise invariant. Any source-native ordinary GP29 English plaintext encrypted under this exact B(t) family **must have genuinely native rune frequencies in the middle three recovered positions**, independently of every secret choice and its dependence on previous text. There is no key fit, phase tuning, English scorer or search. We predeclare the source-literal consecutive five-rune clock and two full original illustrated chapters.

## Original ciphertext experiment, independent native-GP controls

The first complete, original five-rune-aligned chapter is **p33–39**, exactly 1,680 source runes (336 complete packets). The wholly disjoint botanical **p40–53** chapter contains 3,008 source runes (601 complete packets and three untouched final runes). The true original page order and all source values are immutable; source line, word and page separators are ignored for this particular fixed packet model.

Take exactly the middle three coordinates of each original source packet after B0 inverse, yielding **1,008** putative true plaintext runes from p33–39 and **1,803** from p40–53. The exact unigram GP29 collision index for these *invariant purported plaintext* positions is then compared with actual native GP literary controls of the same original lengths and same five-rune middle-position extraction. The three independent non-LP2 donor books are Gibran *Prophet*, Shakespeare 300k and Emerson *Essays*, translated with the project's established GP29 canonical English normalization. Every donor sample is taken as ordinary **unencrypted** native plaintext, with consecutive original-size windows at offsets 0,137,274,... . The source cipher is inverted; controls are read straight from native plaintext. No control is itself passed through the historical matrix.

| Full original receiver | Unchangeable plaintext slots | Original recovered-middle GP29 IoC | Lowest Gibran native | Lowest Shakespeare native | Lowest Emerson native |
|---|---:|---:|---:|---:|---:|
| p33–39 | 1,008 | **0.034360666** | 0.056723964 | 0.054767422 | 0.057622437 |
| p40–53 holdout | 1,803 | **0.034555800** | 0.057237814 | 0.055819534 | 0.058735502 |

The matching native donor sample counts were p33–39 **449/1,585/2,358** (Gibran/Shakespeare/Emerson); p40–53 **439/1,576/2,348**. Every one of the matched native control samples has a far more concentrated GP29 middle-coordinate register than the purported original plaintext. The mathematical equality of the recovered original middle coordinates to their hypothetical plaintext is exact; **the language-based exclusion is conditional** on source-native ordinary GP prose resembling these independently selected controls, not a theorem ruling out every possible 1,803-rune sequence in every language.

### Native plaintext positive control that varies t at every block

The actual full original-size Shakespeare GP native plaintext is encrypted with a **different deterministic t from all 29 values on every five-rune block** (t_i=138+((7i+3) mod29)). For each original section, the independently computed true B(t_i) inverse recovers **all** original GP plaintext runes exactly, including the trailing 3 in p40–53; applying the *fixed* historical B0 inverse, with **no knowledge of any t_i**, recovers the three middle plaintext runes of **every** block exactly. Their native GP29 collision indices exceed 0.05. This is a genuine positive generated by source-native material and the same real historical B family. The original negative has no artificial plaintext-selected key.

## Decision and boundaries

**Retire** ordinary native-GP plaintext directly encrypted in intact contiguous 5-rune packets using B(t) with *any* secret t per block. No 29-ary secret function, polynomial, hashed key, plaintext-feedback choice, page-clock schedule or independent random t_i can repair the observed three-of-five plaintext invariants under this exact source family. This eliminates a genuinely new **dynamically changing numerical key** architecture, stronger than earlier frozen-matrix or eigencoordinate fixed-alphabet tests. It directly prevents retuning the only free numeral to evade failed full-paragraph B receiver inversions.

Not covered: a changing packet origin or variable packet length, an additional shuffle/state mixing layer applied before/after B(t), code that inserts or removes symbols, a non-GP/English plaintext alphabet, a different matrix not generated by the word-fixed family, or an external key that first rewrites the entire ciphertext. Those changes need a new independent source instruction. The 13-word grid and the original magic-square form still have a historically established Stage10 admission/submission role, without an authenticated command selecting this cipher as an unknown LP2 page decoder.

**Reproduction:** [full source-exact Windows 11 / Node22 CommonJS SFT](../sims/lp2_wordfixed_Bt_everyblock_secret_mid3_sft.cjs), chaining the exact original 13-rune-word prime parser, reconstructing all 29 word-preserving source matrices, deriving inverse B0 with GF29 elimination, confirming its free-direction eigenvector, checking both immutable original receivers and all three native controls with exact expected output assertions, and encrypting/decrypting full native source-sized positives with a different t per packet. [Windows CI 45077895561](https://github.com/FlareZ123/liber-primus/actions/runs/45077895561). This study changes the viable decoder frontier; it does not recover an unknown LP2 word.
