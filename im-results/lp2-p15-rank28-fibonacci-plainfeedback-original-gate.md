# P15 Fibonacci plaintext feedback on GP28 predecessor-exclusion rank: original-cipher negative

**Agent3, 23 November 2026. Evidence class: finite original-source, full inverse and source-native negative. No recovered unknown plaintext or creator-selected decoder.** Exact [Windows Node22 CommonJS SFT](../sims/lp2_p15_rank28_fib_plainfeedback_original_sft.cjs), [successful original-source CI run 45122507600](https://github.com/FlareZ123/liber-primus/actions/runs/45122507600).

## Source clue and concrete rival

The original physical p15 red-centered spiral contains **3299,3298**, and all sixteen printed integers follow a genuine Fibonacci-indexed prime sequence. The following physical pp16–22 begin a contiguous unknown rune chapter. Across LP2 the original ciphertext suppresses same-rune adjacencies (86 within-page events over 12,901 transitions); therefore one human-executable alternative to direct GP29 addition is to transmit a *nonzero predecessor difference* in a 28-symbol alphabet, reserving zero movement for GP-EA (28). Here the spiral supplies the Fibonacci recurrence cue and the two source-visible central values supply the state seeds. Both the zero-step semantics and addition of current plaintext into the recurrence are **analyst hypotheses**, never first-party instructions. The rival is any different nonlinear cipher or external key without such rank28 feedback.

This test differs from [Director #2374](https://github.com/FlareZ123/liber-primus/issues/2374), which tests direct GP29 plaintext-autokey; [Agent2's period16 all-secret nonrepeating rank](lp2-p15-16phase-no-repeat-allsecret-gate.md), which uses stationary phase alphabets; and [the p15 source arithmetic](../results/lp2-p15-fibonacci-prime-spiral.md).

## Precisely frozen reversible operation

Let the *published ciphertext* C have values0..28. Keep the first p16 rune literal as an initial public glyph. For every subsequent rune (continuous across all page boundaries and the p50 runeless grid):

1. Compute `D_i=(C_i−C_(i−1)) mod29`.
2. If `D_i=0`, then `P_i=28` (EA); otherwise `R_i=D_i−1 ∈ 0..27` and `P_i=(R_i−K_i) mod28`.
3. Update `K_(i+2)=(K_i+K_(i+1)+(P_i mod28)) mod28`.
4. Seed `K_1=3299 mod28=23`, `K_2=3298 mod28=22`.

For forward encryption, send `D_i=0` for P=28, otherwise `D_i=1+(P_i+K_i mod28)`, and then `C_i=(C_(i−1)+D_i) mod29`; update K identically. This is a **lossless** serial cipher even at the 67 observed repeat sites. Original spacing and punctuation are left in place; the rune key state never restarts. The key-seed rival is the **complete set of all 28² = 784 IV pairs**, with no extra signs, source-unknown pads, key resets or language-selected coefficients.

## Original input results

Canonical exact source `resources/liber-primus/lp2-corpus.json` SHA256 **7f311254d406b755df39510b8b3f4e53d7dfaea87a0320074c16507d46a07522**. Physical pp16–55 excluding runeless p50 contain **9,194** source runes, **39 rune-bearing pages**, and **67** adjacent-equal ciphertext transitions. Training is fixed pp16–21 (**1,613 runes**); untouched evaluation is pp40–53 (**3,008 runes**) and final p54–55 (**308 runes**). No source output was chosen as a language crib.

| Original decoder | pp16–21 IoC | pp40–53 IoC | pp54–55 IoC |
|---|---:|---:|---:|
| Source central spiral seed **23,22** | **0.03524250** | **0.03525882** | **0.03555565** |
| Best training IV **13,19** | **0.03549633** | **0.03529486** | **0.03468844** |
| Maximum over **all 784**, counted separately at each interval | **0.03549633** | **0.03544102** | **0.03619019** |

Source-center seed p16 begins:
`ENGTHNGBWXNALNEOBCNTHWFLSCAEXDYTTHLUAEPJTLMAENCPTPOIAHACLTILNGEFTIALNGMDHNGEOWXEOAERBA`.
The best training-key p16 begins:
`EMNCALIBEOIADEOSLHEOCIODEHFBYUMCDRFTXMDOEFEOHTMTGTHJIAHDMPDANGOMTHDAOEYJASIBSFWLIA`.
Neither is readable English in GP transliteration, and the held-out source outputs remain uniformly distributed. The exact decoder and encoder return all **9,194 original rune values** for every candidate, as a required implementation invariant only.

For native source controls, take 9,194 consecutive independently GP-encoded runes from offset9,000 of each checked-in Shakespeare, Gibran and Emerson text, preserve the **original source physical page ranges**, encrypt through this *exact* feedback operation, then decrypt with the hidden true source seed. All three recover **9,194/9,194 authentic source-GP symbols**, exactly reencrypt, and preserve the model's EA↔doublet rule. Their independently positioned IoCs:

| Native plant | pp16–21 | pp40–53 | pp54–55 | Total literal EA/doublets |
|---|---:|---:|---:|---:|
| Shakespeare | **0.06132171** | **0.05987249** | **0.05761665** | 96 |
| Gibran | **0.05905953** | **0.05929272** | **0.05603029** | 155 |
| Emerson | **0.05809190** | **0.05997553** | **0.06121240** | 95 |

Thus all original seed candidates remain near uniform on the complete original input even though the same inverse recognizably recovers long natural GP controls. The controls do **not** establish a universal bound on all imaginable GP plaintext or a historic language key.

## Key cancellation: the important structural discovery

At each nonrepeating ciphertext transition, `R_i=D_i−1` and `P_i=R_i−K_i mod28`, therefore the supposedly evolving **two-state plaintext-feedback recurrence cancels exactly**:

`K_(i+2) = K_i + K_(i+1) + P_i = K_(i+1) + R_i (mod28).`

An escape (`D_i=0`) instead gives `K_(i+2)=K_i+K_(i+1)`, since the reserved GP-EA has numeric value28. The original first source transition is nonrepeating, so **all 28 choices of the first seed K1 with a fixed K2 recover exactly the same plaintext from rune position2 onward**. The SFT checks this exact invariance for independent first-seed selections. This explains why ranking 784 IVs overstates independent key diversity: only **28 distinct complete-length body candidates beyond the first decoded output position** are available. It also identifies an algebraic weakness to watch for when proposing similar Fibonacci plaintext-feedback recurrences on a subtraction receiver.

## Decision

Retire **this exact** red-centered p15 GP28 cyclic-predecessor-exclusion plaintext-feedback cipher as a direct native-English decoder of original pp16–55. It produces no authenticated original plaintext, real key or continuation URL. Do not rescue it with new phase resets, changing alphabets, source-unselected signs, or unrelated cipher layers. The 28-way repeat-exclusion architecture, historical Fibonacci number grid and any externally supplied nondegenerate state law remain untested by this narrow negative. The remaining high-value dependency is an independently visible author-selected operation or source-derived cipher state that predicts substantial untouched ciphertext.
