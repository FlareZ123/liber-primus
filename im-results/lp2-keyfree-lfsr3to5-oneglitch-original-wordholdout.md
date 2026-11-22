# Key-free source-native long-word attack on GF29 linear key recurrences, orders 1–5

## Decision

A complete key-free search across **all seven longest original unsolved LP2 words** and **29,229 independently pinned native-GP English dictionary words** recovered **no authenticated unknown-page plaintext** under any tested order-1 through order-5 linear key model. The experiment algebraically eliminates every coefficient and every word-local seed for three distinct one-irregularity designs:

| Order | Clean or one output-only redraw | One extra consumed generator key | One state-changing key shock |
|---|---:|---:|---:|
| 1 | **0** | **0** | **0** |
| 2 | **0** | **0** | **0** |
| 3 | **0** | **0** | **0** |
| 4 | **1** | **0** | **1** |
| 5 | **240** | **4** | **593** |

An independent original rank-deficiency audit found **408** consistent nonunique four-tap systems in the output-redraw family and **5** in the extra-consumed-key family. Exhaustive enumeration of each free GF29 coefficient over all 29 values gives **zero** additional exact original matches. Thus the two original four-tap fits are exhaustive even allowing rank-three coefficient spaces. Neither of the **two** original order-four candidate words survives a completely untouched 250-rune same-page key continuation. Every family has **zero** recovered coefficient vectors recurring across distinct original pages. The five-tap models are sufficiently flexible on 13/14-rune observations to produce hundreds of unrelated dictionary fits by chance.

The result restricts these key-and-register families on source-native English words. It does **not** imply an LFSR key was selected by Cicada, nor solve another runic passage.

## Source, premise, and independently supplied lexicon

Original material: **resources/lp2-transcription.txt** and **resources/liber-primus/lp2-corpus.json**. The parser joins typography-wrapped words across original lines and pages. The seven long original words occur on physical pages **11, 13, 16, 25, 43, 52, 55**, with rune lengths **13,14,13,14,14,13,13**. Every runic position is from the original cipher.

Language baseline: **resources/control/dwyl-english-alpha-gp13-14-only.txt**, a pinned English lexicon of exactly **29,229** entries, including **17,772** words encoding to 13 source-native GP runes and **11,457** encoding to 14. The encoder **sims/lp2_native_gp_source_orthography_sft.cjs** reproduces authentic 2014 solved-p57 CIRCUMFERENCES and 181 solved-LP1 native words, including the IO/ING spelling differences. Its source dictionary contains no plaintext inferred from the unsolved original.

Motivation: the book establishes prime-valued symbols and simple modular operations, while the unknown ciphertext has unusually few adjacent repeated runes. A linear register plus a rare anti-doublet correction is one plausible reversible explanation. Extensive prior all-state order-three LFSR/Cicada F-skip and collision HMM work is acknowledged. This experiment is a **different local inverse:** no specified tap vector, no word-initial seed, no model-trained plaintext and no globally frozen phase. It assesses native word candidates by exact reconstruction of unknown coefficients on the original seven longest words, and checks the two surviving order-four apparent plaintexts on never-fitted page material.

## Reversible models

For all words, original C and native hypothetical P take GP index values 0..28:

\[
C_i=P_i+K_i \pmod{29},\qquad
K_i=\sum_{j=1}^{m}a_jK_{i-j}\pmod{29},\quad m\in\{1,2,3,4,5\}.
\]

The coefficients a and initial m key values are **arbitrary**, independently granted to every original word. For each dictionary candidate, infer K=C−P, form all GF29 linear equations for recurrence taps and recover identifiable coefficients by modular Gaussian elimination. For order four, every consistent rank-three system is additionally enumerated exhaustively over its 29 possible remaining coefficient values. For order five, only full-rank identifiable systems are counted; the limited 13/14-rune word length leaves some one-event five-tap systems underdetermined. A full exact recurrence replay is mandatory; a compatible subset of equations alone does not qualify.

The following optional one-event corrections were separately included, in addition to clean key streams:

1. **Output-only redraw:** one emitted key after the first m positions is replaced by an arbitrary rune. The hidden register keeps its original state. Remove exactly the equations at positions r..r+m that use the corrupted observed K, solve the clean equations, regenerate the entire key from the first m true values, and accept only an exact match at all positions except r.
2. **Extra consumed key:** before emitting cipher rune r, consume and discard one register output; later outputs move one register step forward. Remove the m contaminated equations at r..r+m−1, solve all other equations, generate one extra state from the original first m values, and demand exact reconstruction with the single source-fixed phase skip.
3. **State-changing shock:** at r, replace one generator output with an arbitrary value that is fed into all subsequent recurrence steps. Remove exactly the equation for r; every other equation must hold, including all later ones. A genuine shock is required at r. The terminal position is not used for a one-event state-change fit because no subsequent prediction could distinguish it.

An event is permitted **only after the m seed positions**. The models do not include a second event, arbitrary alphabet permutation, ciphertext-dependent nonlinear taps, state changes outside the declared shock/skip, or an English word absent from the dictionary.

## Exact original-data results

Across the seven physical original words, all three order-one, order-two and order-three variants give zero dictionary fits. The order-one/two exact audit also finds **zero rank-deficient consistent** original candidate systems under any allowed event, so no unidentified lower-rank solutions were silently dropped. The four-tap families give exactly two separate *conditional* original matches:

| Exact event model | p52 hypothetical word | Word-local register recovered | Error position | Original page-heldout IoC |
|---|---|---|---:|---:|
| One output-only redraw | OVERSENSITIZE | taps **[23,26,14,17]**; seed **[10,4,23,26]** | 7 | **0.033542168674698794** |
| One state-changing shock | NONLUMINOUSLY | taps **[27,25,11,28]**; seed **[4,2,3,10]** | 5 | **0.03469879518072289** |

Both conditional words fit the same p52 original 13-rune printed word at local offsets **78..90**. They were discovered in an unrestricted all-dictionary scan and have no first-party operation selector. In each case, extend the recovered key recursively from the exact local source rune offsets: forward with its four inferred taps, backward through the inverse of its nonzero fourth tap (respectively 17⁻¹=12 and 28⁻¹=28 mod29). Other original p52 runes are never used to tune taps, seed, shock location or candidate dictionary phrase.

The original physical p52 has **263** runes and IoC **0.033320755812265984**. The respective full-page inverses have IoC **0.03393028183322207** and **0.03433663251385946**. The two independently decrypted 250-rune holdouts remain close to uniform GP29. Both original conditional words therefore fail their source-independent continuation; **they are not authentic recovered plaintext**. In particular, do not use either coefficient vector as a candidate page key.

The five-tap match counts per original physical page [11,13,16,25,43,52,55] are:

- Output-only redraw (includes zero): **[50,0,55,1,0,65,69]**, total240.
- One skipped generator key: **[1,0,0,0,0,1,2]**, total4.
- One state-changing shock (includes zero): **[132,3,146,5,6,148,153]**, total593.

None of these five-tap fits shares an identical inferred coefficient vector across two physical original pages. The high flexibility and short-word samples make most five-tap matches expected under unrelated sequences; there is no independently reproducible paragraph receiver.

## Positive controls and independent reproducibility

[Read-only Windows Node.js 22 CommonJS SFT](../sims/lp2_longword_keyfree_lfsr3to5_oneglitch_sft.cjs) uses the existing sources, source-GP encoder and physical word parser, and asserts every original hit count for orders 1–5, the underdetermined order-four enumeration, both p52 candidate identities and both untouched heldout IoCs.

It plants source-native **CIRCUMFERENCES** (directly attested in clear p57) under arbitrary secret nontrivial three-, four-, and five-tap recurrences. The runner independently re-solves all rank-three original order-four systems and checks every possible free coefficient by complete output replay. The solver recovers all three clean planted coefficient vectors exactly. For three- and four-tap keys, independently inserted one-output redraws, consumed-extra keys and state-changing shocks are also recovered exactly, with reconstructed ciphertext. Order-five one-event positives would often be unidentifiable on a 14-rune word because deleting five or six contaminated equations leaves insufficient rank; only order-five exact recovery is claimed as a calibration.

The earlier original-data V8 calculations independently established the all-dictionary results; the repository SFT is the persistent single-file reproducer. GitHub changes: ee70b3cb (initial source runner), 24dd251 (add state-skip and shock families), and this consolidated result. No distinct external creator evidence was used.

## Interpretation and next decision

These results exclude a **source-native English long word covered by this lexicon** for any arbitrary order-1 through order-3 recurrence with zero/one of the stated irregularities, and make an order-4 global state model implausible in the face of two noise-like conditional page-wide continuations. They do not exclude other-language words, actual ciphertext-phase slips involving multiple register changes, nonlinear/hashed keys, orders higher than five, or dictionary omissions.

The current advancement is an efficient local inverse that removes unknown taps and word seeds in identifiable cases, with exhaustive one-free-tap four-state completion before a longer held-out decode. Further blind all-seed LFSR coefficient fitting has low expected payoff. A first-party source selecting a key source, opcode, receiver and clock remains the valuable missing input.
