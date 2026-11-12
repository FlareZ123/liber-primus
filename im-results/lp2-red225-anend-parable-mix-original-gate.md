# Red225 terminal row and literal solved-page mixing: original-input decision

**Status (12 November 2026):** Source-visible 225-rune count and tentative instruction with four bounded original-input negative gates: global transposition, solved-page additive mixing, paired 105-rune arithmetic, and full 1,680-rune p33–39 title-key tensor inverse. No unknown LP2 plaintext, historical cipher inverse, authentic key, or destination is recovered. Reproducers: [red-channel SFT](../sims/lp2_red225_mix_end_parable_sft.cjs) and [complete p33–39 title-key tensor SFT](../sims/lp2_red357_tensor_p33_39_sft.cjs); both passed original-source manual CI ([red-channel run 43248483709](https://github.com/FlareZ123/liber-primus/actions/runs/43248483709), [p33–39 run 43250279752](https://github.com/FlareZ123/liber-primus/actions/runs/43250279752)).

## Source premise and risk

The canonical original-image ink transcription contains **225 red GP runes** across physical pp0–57. A possible 15×15 row-major view places 210 red runes above a terminal row `XIMAEJOESRPARABLE`. Its pieces are original p54's **last three** red runes `XIM`, p56's complete **five** red title runes `AEJOESR`, and p57's complete **seven** clear red title runes `PARABLE`.

The authenticated solved p56 Euler-totient/prime inverse maps its red `AEJOESR` to `ANEND`. Reversing just the p54 three-rune tail gives a readable **MIX AN END PARABLE**. This is an intelligible candidate operation selector. Its weakest premise is the choice to reverse exactly those three letters: the original p54 title has **nine continuous red runes**, with one red 13-dot punctuation mark after all nine and no delimiter before the final three (direct source-JPEG audit of `resources/liber-primus/71.jpg`). Hence `XIM` is a retrospectively selected three-rune suffix of one heading. Nor is a 15-column square printed. The 15×15 shape is one factorization of the red count; it is a reconstruction, not a source-visible cipher layout. Nothing selects a mixing algebra, target, direction, or starting offset. Treat the proposed instruction as **hypothetical**, not plaintext recovery.

The calculation uses source `resources/liber-primus/lp2-ink-annotations.json`, the original page indices in `lp2-corpus.json`, and the exactly solved p56/p57 prose in `lp1-plaintext-reference.txt`. The p57 encoder is checked against all 95 original GP symbols and handles printed ING as one NG symbol.

## A necessary all-key bound on red210 transposition

The original first 210 red-rune counts in GP index order are:

```text
[7,7,9,6,3,11,9,5,9,5,8,6,12,7,10,7,9,7,3,11,8,8,4,9,9,5,5,7,4]
```

Any **pure transposition** preserves this vector. Even if the author used **one arbitrary secret permutation of all 29 output rune identities**, the best possible Shakespeare-trained unigram log-likelihood is exactly obtained by matching the sorted count vector to the sorted reference probabilities. The optimal original score is **−3.7134864978 per rune**. All **54,202** contiguous 210-rune GP-native holdout Shakespeare windows score higher under that **same full 29! optimization**; their minimum is **−3.0753973027**. No sequence of positional rearrangements, including unknown keyed or 7/15-column transpositions, can overcome the original score when judged against that fixed native-GP one-gram model. This is a finite English-reference condition, not an impossibility for other languages, independently encrypted readouts, or changing-symbol transformations.

## Literal MIX of the two solved passages

The known p56 plaintext has 85 GP runes. The directly printed p57 plaintext has 95 GP runes. Concatenating them in both orders, or interleaving by successive rune with either page first and appending p57's ten unpaired tail runes, gives **four source-frozen 180-rune GP29 keys**. On the complete original p54–55 chapter (232+76=308 runes), apply each as a repeating direct additive key from **p54 local position zero**, continuous across the page transition, with each sign: **eight candidates total**. No fitted offsets, skipped symbols, page resets, or arbitrary alphabets.

The original GP trigram score is **−6.4428454**. The best of eight is **−6.1359962** (`zip57then56`, decode `C+K`), opening `HXTOTHLNMWNGXLIJIAYFYFUIRFAERTHLDCTH`; the others score **−6.2680 to −6.7415**. All are below the **worst −2.7348194** among **54,104** matched-length Shakespeare holdout GP windows. Exact original-cipher re-encoding succeeds for each candidate as an implementation invariant; exact native plaintext plants also recover for all four keys.

This **rejects only the literal frozen-key additive mix** as normal GP29 prose on complete p54–55. Another operation on AN END and PARABLE, or another target, remains open if separately selected by an original clue.

## Source-anchored 3×5×7 two-register MIX gate

There is a second, less arbitrary way to exploit the literal proposed footer as an instruction: its hypothesized **three parts have GP lengths 3, 5 and 7**, and exactly

    225 = 2×(3×5×7) + (3+5+7) = 105 + 105 + 15.

The *same* initial 210 original red runes therefore form two complete **3×5×7** consecutive tensors, with the terminal 15-rune hypothetical message left clear. There is a real independent structural anchor for the **first 105-rune split**: the original colored-rune spans cumulatively total exactly **105 at the end of p23's red 16-rune title**, and the next red span is the **19-rune opening of the p27 chapter**. Thus tensor B starts precisely at a printed chapter heading. However, the **second 105-rune boundary at red index210** cuts **six glyphs into p54's uninterrupted nine-rune red heading** (the span occupies red indices204–212). That unprinted cut is required to expose the final three `XIM` letters. These asymmetric alignment facts favor treating this as a clue worth preserving, with no authenticated division into exactly two 105-rune blocks. This provides a **frozen reversible candidate operation without a secret key**: use the first 105 source runes as register A and the next 105 as register B, combine each corresponding GP29 position as A−B, B−A, A+B or −A−B modulo29. The 3/5/7 word lengths also fix one natural axis order. The only additional orientation allowance is each independent reversal of its three axes **on B** (8 possibilities), giving **32 fully enumerated original-input candidates**. The all-zero reversal is ordinary unpermuted half-versus-half subtraction.

**No candidate yields native GP29 prose.** The best original trigram score of all 32 is **−5.7056957422** (axis reversal mask5, A−B), whereas the worst of **54,307** independently held-out 105-rune GP-native Shakespeare windows is **−2.9492991131** under the same scorer. To bound even a completely unknown **global 29! rune identity permutation of the final output**, optimize each candidate's one-gram likelihood by exactly pairing sorted symbol frequencies with sorted corpus probabilities. The best 32-case original upper bound is **−3.2836892228**, below the worst of all **54,307** equally optimized native windows (**−3.1185692361**). Thus even a hidden global substitution cannot make these literal two-register mixes match the native reference's one-gram distribution; this conclusion is invariant to any subsequent pure positional transposition. **32/32** independent native-plaintext plants recover their original 105-rune plaintext exactly under the declared forward/inverse operation.

This construction makes the tentative footer's 3/5/7 lengths causally relevant to a clear, cheap decipherment. The source has **no printed 3×5×7 tensor** and does not affirm that the last three p54 title runes should be reversed and isolated. The finite negative retires the exact source-order paired-mix family and its eight axis reflections as directly readable GP29 prose. It does not exclude other mixing algebras, altered text registers, evolving keys or hidden external material; no plaintext was recovered.

## Full p33–39 original 16×105 title-key tensor inverse

An additional **source-visible input size** allows a complete original-cipher inverse rather than a decoding only of the two red105 registers. The independent original visual chapter **physical pp33–39 contains 1,680 runes**, exactly **16×(3×5×7)**. The three candidate terminal words \`MIX\`, \`ANEND\`, \`PARABLE\` have GP29 key-index vectors \`[19,10,14]\`, \`[24,9,18,9,23]\`, \`[13,24,4,24,17,20,18]\`. Build for each length n the cyclic-convolution matrix \`M[r,c]=key[(r-c+n)%n] mod29\` and tensor-compose on the x/y/z axes of each consecutive 105-rune block. The source's visual p33 chapter starts phase zero, uses original page order and no skipped rune; no secret key fitting, symbol substitutions or extra IV. The original p33 second red heading at page-local offset **91** falls **inside** the proposed first 105-cell tensor, so this artificial tensor boundary is not selected by that inner printed rubric.

All three exact 3×3, 5×5 and 7×7 matrices are invertible over GF29, so their inverse tensor recovers all **1,680** original cipher positions and re-encodes them exactly. The tentative plaintext stays statistical ciphertext: smoothed original GP trigram **−6.4161582074** versus raw **−6.5545599893**, and decoded IoC **0.03485067642** versus raw **0.03436002155**. The worst of the **selected, nonoverlapping-step 1680-rune native GP Shakespeare holdout windows** is **−2.5522654283** under the same model. A planted 1,680-rune GP-native plaintext is recovered byte-for-byte from an independent exact title-key tensor encryption. The full ciphertext inverse remains unreadable.

This is a complete-section negative for the **literal 3/5/7 cyclic-convolution operator** with the proposed header as its three keys and original chapter clock. The coincidence of 1,680 with 16×105 does not independently authorize a Hill tensor or show that the p54 footer should serve as a key for p33; it only makes the proposed operation finite, reversible and source-size complete. No other 3D cipher, nonlinear mixing, altered plaintext register or general red-channel role is excluded.

[Standalone original-source CJS test](../sims/lp2_red357_tensor_p33_39_sft.cjs) · [passed manual-only CI run 43250279752](https://github.com/FlareZ123/liber-primus/actions/runs/43250279752).

## Research decision

The symbol inventory is the decisive obstruction to reading the 210 red-rune payload as transposed ordinary GP-native text, regardless of how rows or columns are mixed. If this row is intentionally instructive, a successful decoder must change rune identities, use a different plaintext register, or read the red material as key/cipher metadata rather than direct English. Avoid more keyless transposition sweeps. The p54 `XIM` reversal and 15×15 view need an independent page-level reading instruction before a broader search is justified.
