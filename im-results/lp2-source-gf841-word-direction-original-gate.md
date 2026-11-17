# H/G GF(29²) trace as a directional LP2 running key: first-300 original gate

**Agent31, 17 November 2026. Classification: a bounded original-cipher negative, no recovered plaintext, authentic key or selected decipherment rule.** This test addresses a distinct algebraically source-derived key missing from the pinned 581-stream historical pointer-direction screen. It does not restart that expensive 216-shard campaign or attempt to reinterpret its pending outputs.

## Observable evidence and the competing explanation

The independently signed 2013 BASE29 example `3301 → 3QO` supplies `H(X)=3+26X+24X²` over GF29 when the printed digits are taken in the independently documented ascending-power convention. H is irreducible; the root `α` of its monic form `X²+18X+11` has order **840**. The original p39 red GP-prime triad fixes `G(X)=27+5X+15X²=15(X+5)²`, whose repeated root is **24**, order **7**. Both factors divide the original 256-cell table polynomial, an exact historical-to-manuscript numerical bridge documented in [the established factorization](2013-base29-gf29-grid-factor.md). The authenticated 2016 message says that the book's *numbers are the direction*. The frozen, economical hypothesis here is therefore a **word-directed GF(29²) multiplicative trace key**. The rival explanation is that these cross-artifact numerals and the word-direction language have no shared decryption operation, or that a different key state or starting phase is required.

Represent `α^j=a_j+b_j α`, where `(a_0,b_0)=(1,0)`, `a_(j+1)=18 b_j` and `b_(j+1)=a_j+11 b_j` modulo29. The two **fixed, source-derived** 840-period key values are

- `T[j]=(2a_j+11b_j) mod29`: the GF29 field trace.
- `U[j]=T[j] × 24^j mod29`: its additional p39 double-root modulation.

The direction for each original *complete printed word* is the parity of its **GP-prime-value sum**: odd points forward and even backward. Both simultaneous direction orientations are checked, with the original 2016 sentence treated as motivation rather than an unambiguous algorithm. The original physical page cuts are soft and all word delimiters are preserved. The test is grounded in the **unmodified first 300 runes** of p0–p2 (729 original runes, 158 complete printed words), with exactly the original ciphers and nonalphabetic geometry.

## Complete finite screen of the frozen family

The independent [historical pdir reference engine](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/kscreen/src/main.rs) provides two anti-repeat branch laws (LAST skip and coin) and **18** conventions for the backward-word first key read, interword pointer movement, and collision comparator. Each is applied at initial key position **zero**, with the **two fixed key streams**, **two key signs**, **two global direction signs**, and a 16-state decryption beam maximizing the source-normalized GP29 index of coincidence. A key pointer in either direction reads `K[j mod840]`; no guessed key words, phases, byte projections, external plaintext, or shifts are added.

The resulting exact **2 × 18 × 2 × 2 × 2 = 288 original-output candidates** have **zero scores at or above the prior independent screening threshold 1.40**. The maximum is normalized IoC **1.1503010033444816**, obtained with `U`, reversed directions, backward-first convention `h=1`, interword convention `m=0`, comparator `c=0`, negative key sign, and coin model. The second highest score is **1.143835005574136** under `T`. This is well below the accepted first-300 language-screen threshold; thus no candidate warrants whole-window source-text interpretation. The unmodified source first300-rune score is **0.9886510590858417**.

An independent, fully original-cut **known-native positive** uses the 95 clear p57 GP indices repeated to 300 symbols as control plaintext, encrypts with the identical frozen `T` key and first-word direction plan under one legal LAST branch, and then runs the same beam decoder. The forward encoder consumes **10 collision-skipped key positions**; the decoder's output IoC equals the known original plant's IoC **2.023210702341137** to floating tolerance, exceeding 1.40. This checks the source model's skip logic, word jumps, alphabet handling and scoring, rather than validating whether the model is what Cicada chose.


## Independent H/G field-affine cipher consumer

The same two source factors permit a **fully invertible two-factor symbol mapping**, in which `24^j` is a nonzero GP29 multiplier and the trace is a GP29 additive shift. The two simplest source-order interpretations are

`C = 24^j P ± T[j] (mod29)` and `C = 24^j (P ± T[j]) (mod29)`.

Unlike the additive trace decoder above, these invert to `P = (C ∓ T[j]) × (24^j)^(−1)` or `P = (C × (24^j)^(−1)) ∓ T[j]` respectively. There is **no secret alphabet, seed or symbolic key selection** beyond the already specified visible H/G factors. This is nevertheless an analyst's hypothesized use of the exact factors, not a documented Cicada cipher instruction.

The same 18 historical pointer conventions, two directions, two anti-repeat models, and two signs give **another 288 finite original first-300 inverses**. The strongest is **1.1451282051282052**, well below the same preregistered 1.40 threshold; zero original variants reach that criterion. An independently encrypted 300-rune native p57 GP control with the same source word cuts, true field-affine multiplication and **16 legitimate hidden collision skips** returns beam IoC **2.0516610925306575**, exceeding the plant's native language threshold. Since the beam maximizes IoC it may score above its actual planted plaintext; this is a *detection-power control*, not a claim of exact 300/300 symbol recovery.

Both the original additive trace and the new genuinely field-affine receiver are asserted by the [same read-only original-input SFT](../sims/lp2_gf841_word_direction_original_sft.cjs). The complete **576-input** original and both native planted screens pass under Windows Node.js 22 on [run 44162147348](https://github.com/FlareZ123/liber-primus/actions/runs/44162147348). The two screens share their input 300-rune window and hypotheses about unsigned phase-zero key pointers, so they are separate bounded model tests, not independent evidence about Cicada intent. Neither yielded a candidate for genuine whole-section plaintext verification.

## Decision, remaining dependency and reproduction

The author-visible H/G trace streams under **this exact phase-zero word-prime-direction pdir family** do not recover readable p0–p2 text. This test **does not exclude** 840 other relative key phases, the external implementation's 66 alternative signed word-number formulas, further key derivations, source-external key material, or any cipher lacking the modeled short collision skips. The known p39 factorization and original 2016 message remain real clues but have no source-authenticated trace-to-cipher interface. It is inappropriate to search arbitrary extra phases to rescue this already negative family without an independently printed rule.

[Read-only Node.js 22 / Windows 11 single-file reproducer](../sims/lp2_gf841_word_direction_original_sft.cjs) reads the exact canonical 29-rune indexed corpus and original continuous physical transcription, asserts 12,956 full-book runes / 2,896 words / 729 opening runes / 95 clear p57 runes / 840-step field closure, checks a native skip-positive, and then screens 288 additive-trace and 288 field-affine variants, each with its own native-GP plant. The original data and solver code are preserved; nothing is reconstructed from AI-generated plaintext. **Full Windows Node.js 22 CI PASS** on [run 44159891849](https://github.com/FlareZ123/liber-primus/actions/runs/44159891849) reproduces all 288 tests, the 10-skip planted positive, the exact best IoC, and all original-corpus assertions directly from the committed source files. The running multi-convention **581-key 216-shard search** is separately tracked by [Director Issue #1329](https://github.com/FlareZ123/liber-primus/issues/1329), and the present source-defined keys are not in its previously published flat-key library.
