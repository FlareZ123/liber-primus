# Complete 29-entry nonlinear integrated-plaintext-feedback consensus test

**Agent7, 22 November 2026. Research status: conditional full-secret-key original-cipher exclusion against a finite native-GP English lexicon. No unknown LP2 plaintext, creator key or continuation recovered.** This experiment directly tests **all 29^29 possible prior-plaintext lookup tables without enumerating them**. The source-correct program is [one Windows Node22 CommonJS SFT](../sims/lp2_integrated_nonlin_plainpredecessor_fullsecret_sft.cjs).

## What a human might try and what remains unprinted

A plausible interpretation of the printed GP29 arithmetic, prime/totient guidance and scarcity of adjacent ciphertext repeats is to use the **preceding cipher rune as an integrator** while letting the *preceding plaintext rune* choose a nonlinear secret step. A source-adjacent p7 red five-word polynomial is one candidate for that step; the present experiment allows the step to be any globally unknown mapping. This is **different from direct predecessor feedback** `C_j=P_j+h(P_(j-1))`, which was previously tested at [a separate exact-all-secret source gate](lp2-direct-plain-predecessor-allsecret-lexicon-gate.md). The original book does not authenticate either architecture; a cipher consuming another register, changing word boundaries or using more state is the independent rival.

For every source-printed word `w`, the candidate exact reversible model is:

```text
C[w,0] = P[w,0] + IV[w] mod 29
C[w,j] = C[w,j-1] + P[w,j] - h(P[w,j-1]) mod 29  (j>=1)
P[w,j] = C[w,j] - C[w,j-1] + h(P[w,j-1]) mod 29
```

An **independent arbitrary initial ciphertext shift for every word** is allowed, much more generous than page keys. The secret function `h` has **29 completely unrestricted independent GP29 values**; it need not be affine, a permutation, a prime function or a power polynomial. If any particular native-GP candidate word `P` is the real decoding of a source word `C`, each interior pair fixes one secret table entry exactly:

```text
h(P[j-1]) = P[j] - (C[j] - C[j-1]) mod29.
```

Every repeated input `P[j-1]` must assign the **same** output; two different proposed original words must agree at *every* shared secret input. No choice of the remaining 29-way secret values or IV can repair a contradiction. This is an exact key-independent constraint on an otherwise huge secret space.

## Original long-word and independent positive results

Canonical source: all **12,956 original unknown GP29 runes**, exactly **2,896 intact printed words**, including all **32** real page-carry words. The finite native-English lexicon contains **12,231 distinct GP29 word spellings** obtained from the three pinned Shakespeare, Emerson and Gibran reference texts using the existing LP1/LP2 GP29 transliteration (including native ING/IO contractions). Test all **109 original long words length≥10**; anchor each **25 printed words length≥12**, and exhaust *every* same-length lexicon candidate plus all possible shared lookup values via exact partial-table compatibility.

| Exact shared-secret diagnostic | Authentic unknown original | Independent English plant |
|---|---:|---:|
| Original-length long words tested | 109 | 109 |
| Length≥12 anchor positions | 25 | 25 |
| Internally self-consistent anchor word candidates | **109** | **140** |
| Highest number of other long words compatible with one anchor | **1 / 108** | **108 / 108** |
| Highest other long words sharing at least three matching assigned lookup entries | **0 / 108** | **107 / 108** |
| Length≥10 original positions lacking even one lexical candidate | **6** | **0** |

The strongest original anchor with one weakly compatible other long word is `UNAFFRIGHTED`, at original printed word index376. It is a dictionary collision with **zero** other words agreeing on even three independently assigned lookup entries; there is no sustained shared key, sentence or plaintext.

For the independent plant, take exactly the 109 original target word lengths, choose genuine source-native GP English words independently of ciphertext, encrypt under the nonlinear hidden `h(x)=(GPprime[x]+1) mod29` and arbitrary distinct per-word initial cipher seeds. The key-independent decoder obtains **108/108** other-word matches for a valid anchor, and **107/108** with three genuine shared lookup entries. Every planted word round-trips exactly. A separately sourced solved-LP1 prose positive contains twenty long words, fourteen represented in this finite external dictionary; the same unmodified integrated feedback consumer yields **14/19** other long words compatible with its strongest solved-text anchor. The exact code asserts and prints both controls.

**Interpretation:** A single globally fixed previous-plaintext nonlinear step, no matter how arbitrarily chosen from 29^29 functions, cannot yield *all 109 original long words as members of the pinned native-English dictionary* while retaining the original word boundaries under this exact first-difference-integrated model. This is a **lexicon-conditional necessary-condition exclusion**, rather than proof about every possible authorial vocabulary; a rare deliberately invented word, change in segmentation, text in other languages, per-word-changing lookup, plaintext state not reset at a word, ciphertext-side mask, or additional encryption are distinct hypotheses outside scope. In particular the correct shared source function is **not recovered** from the original, and a fitted isolated dictionary word is not a solved rune.

**Research decision:** Retire this word-local *entire all-secret family*, which includes word-reset versions of source-quartic and prime/totient predecessor feedback. The earlier [specific p7 cross-word direct original-cipher inverse](lp2-p7-quartic-delta-plainfeedback-original-gate.md) separately rejects its tested concrete chapter receiver. Any attempt to rescue this family must supply an independent authored change to the input alphabet, word segmentation, state/reset schedule, or target register. Further dictionary or 29-entry key searches within this unchanged model add no decipherment potential.

**Reproduction:** [source-correct standalone CommonJS SFT](../sims/lp2_integrated_nonlin_plainpredecessor_fullsecret_sft.cjs). The exact original and independently encrypted positive counts were executed on the pinned GitHub source data through the connected JavaScript runtime; **no independent GitHub Actions run is claimed**. The SFT reads only checked-in source files, changes none, reconstructs all 2,896 words via the shared page-carry parser, checks the all-secret consistency conditions and both positive programs.
