# P7→P8 five-dot conditional-keyskip attack with exact reversible GP29 source-cube receiver

**Agent 3, 22 November 2026. Classification:** original LP2 ciphertext inverse attempt using a source-derived finite-state key schedule and a new variable-length key clock. **Bounded negative:** no unknown original manuscript plaintext, creator-authenticated key, or continuation was recovered.

## Original visible route and its weakest premise

P7 ends in five intact red GP29 words. Multiplying each word's original GP29 ordinal glyphs yields **[11,26,8,15,2]** in the printed order. Those five coefficients form a fifth-order GF29 linear recurrence with exactly **1876=28×67** state period. P8's red opening includes Roman **XIX**, and **67** is the nineteenth Gematria Primus prime. P8's second complete eight-rune red word has GP29 product **3**, whose inverse exponent on the 29-element field is **19**, because 3×19≡1 (mod28). These arithmetic checks are made directly against the original indexed runes in the committed test.

The original p7 five-dot visual motif is an additional plausible invitation to a *five-position accept/reject rule*, but **there is no authenticated instruction** to reject key values or to use the red products as the key recurrence. The strongest independent alternative explanation remains that these source arithmetic and geometric relationships are structural decoration or a navigation system rather than a cipher opcode.

## Explicit finite-state hypothesis

Take the two source-derived candidate initial GF29 states:

- `[23,2,5,2,19]`, the already independently reconstructed historical 2013 DH23 tuple.
- `[11,26,8,15,2]`, the five original red-word products themselves.

Generate `K` with `K[j]=11K[j−1]+26K[j−2]+8K[j−3]+15K[j−4]+2K[j−5] (mod29)`. The candidate cipher emits either **direct** `C_i=E(P_i)+T(K_j) (mod29)`, or **integrated** `C_i=C_(i−1)+E(P_i)+T(K_j) (mod29)`. Test exactly three value operations: `E(P)=P, T(K)=K`; `E(P)=P, T(K)=K³`; and `E(P)=P³, T(K)=K`. For the last case the inverse uses `P=(C−K)¹⁹ (mod29)`, since 19 is the inverse exponent of 3 modulo28.

For each next ciphertext rune, a candidate emission equal to the previous emitted ciphertext is **rejected and the key clock advanced**, except at one of the five key phases (phase0..4), where the candidate is allowed. The first rune is unconditional. The key stream has no five consecutive equal key draws in the tested 5000-key window for either source seed, so the longest valid rejection chain contains at most four skipped draws. All four are enumerated, with **no fitted free key skips**. For each potential inverse rune, every hypothetical rejected candidate is required to reproduce exactly the preceding original ciphertext value, and every accepted candidate must obey the phase rule. A native-GP trigram Viterbi score only chooses between genuinely legal inverse histories.

The fixed attack grid is 2 seeds × 3 value operations × 2 previous-cipher registers × 2 original scopes (physical pp8–14: 1729 runes; or after the first p8 red12: 1717 runes) × 2 source-start phases (0 or14) × 5 ungated five-dot positions, exactly **240** original-cipher cases.

## Actual original outputs

| Exact original-input result | Outcome |
| --- | ---: |
| Cases evaluated | **240** |
| Cases with any complete algebraically legal key history | **90** |
| Cases with no legal full-length inverse | **150** |
| Highest-scoring legal original decoder | **−4.19309518** nats per GP rune |
| Independently held-out genuine GP-English native-source score, Gibran | **−2.32703840** nats/rune |
| Independently held-out genuine GP-English native-source score, Shakespeare | **−2.33146120** nats/rune |

The best original case used the *literal five-word-product seed*, cubic key, integrated ciphertext feedback, full p8–14 chapter, key start0, and ungated phase2. It had 36 surviving complete histories, 16 key skips, and a nonlinguistic decoded beginning:

`BDXDOINONGOEBNGDOEEIOWLEOIACXEOLCBCGUIAPCUIFEHGWHXFAEUXEATHDIEMXIAGDRCWWAERSDICHPAJRAEEAEIAIAPNGIAESJUGLSIAAXUUIEOD`

The displayed beginning is a mechanical GP transliteration and **not plaintext**. Every original-case mean log-likelihood was at least **1.86 nats/rune below** the lower-scoring native-English control, despite selecting the best of all 240 possibilities. Trigram training used the *first 150,000 encoded Shakespeare GP runes only*, with later Shakespeare and the entire Gibran passage held out; original output did not train or tune the language model.

**All 24 original-shaped positive plants** (two seeds × three value operations × two registers × two independent English passages) successfully replayed their planted ciphertext exactly under the inferred inverse histories. The Viterbi-best path recovered between **1726 and 1729 of 1729** genuine plaintext runes per plant; these near-exact results validate the variable-clock inverse and the scoring sensitivity. This is an independent source-text implementation control, not evidence of a recovered unknown LP2 word.

## Cryptanalytic decision

The p7 source red-product GF29 recurrence together with a **five-position collision-rejection key clock** does not recover native-GP English on the original p8–14 physical chapter under any frozen candidate source seed, cubic transform, additive/integrated register, page-start interpretation or guarded five-phase alignment above. The earlier 1876-period *fixed-clock* tests cannot exclude such a variable-clock architecture; this test closes the motivated next step using a real skip-aware inverse.

An author-selected different way to advance the state after a rejection, a second source-defined key, a non-GP plaintext register, or extra layers remain logically open. Without a new first-party opcode or key selector, extending this test with arbitrary rejection phases and extra transformations would multiply search degrees of freedom without a persuasive route to plaintext. The authentic p7→p8 arithmetic observations remain valid but do not establish a cipher.

**Reproduction:** [single-file Node22 CommonJS test](../sims/lp2_p7_fivetap_5dot_keyreject_viterbi_sft.cjs), reading the checked-in original LP2 corpus/ink, the original red words and two pinned English control files. Script source has been syntax-compiled and the full original-input SFT executed with exact project source data and a source-native GP encoder in the research runtime; all core assertions and plant replay checks passed. The confirmed raw original and control metrics above are direct outputs of that run. No overall plaintext-solution claim is changed.
