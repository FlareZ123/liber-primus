# LP2 bookend lag-6395 shared-state gate

**Status (11 November 2026): source-fixed bounded negative. No unknown LP2 plaintext or authentic key recovered.**

## Source-selected premise

The canonical 12,956-rune unsolved LP2 stream contains one repeated adjacent two-word type: the exact 3+3-rune sequence at global offsets **6,555–6,560** and **12,950–12,955**. The start positions differ by exactly

[
12{,}950-6{,}555=6{,}395.
]

The first occurrence ends at **6,561 = 81²**. This makes lag 6,395 a source-selected candidate for the external hypothesis that the repeated bookend marks a keystream or cipher-state return. No modulus, phase, key, or lag was fitted to language score.

The external Round-44 plan in Dukotah/cicada3301 independently flagged this repeated p27/final-page bookend as a possible reset anchor and listed per-page/per-line reset constructions as unrepresented. In this repository's physical-page numbering its second occurrence is on p55, because the rune-free numerical p50 shifts the external rune-bearing page index by one.

## Exact additive-pad invariant

Test the concrete architecture

[
C_i=P_i+K_ipmod{29}, qquad K_{i+6395}=K_i.
]

For all **6,561** overlapping pairs this forces two key-independent equalities:

[
C_i=C_{i+6395}iff P_i=P_{i+6395},
]

and

[
C_{i+6395}-C_i=P_{i+6395}-P_ipmod{29}.
]

The original LP2 ciphertext has only **199/6,561 = 0.0303307423** equal pairs at this lag. The complete difference histogram, bins 0..28, is:

[
[199,263,203,243,247,222,220,215,245,239,228,248,249,256,220,210,201,211,232,228,217,231,199,233,221,232,220,236,193].
]

The zero bin is the equality count.

### Native-GP controls

The SFT uses the repository's existing GP transliteration and three checked-in native-GP English controls. For each source it draws **2,000 deterministic 12,956-rune windows** and applies the same fixed lag and overlap.

| Source | GP runes | Whole-source collision probability | Lag-6395 equality range | Mean | Windows <= original 199 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shakespeare | 218,800 | 0.05996999 | **324–443** | 394.1620 | **0/2,000** |
| Gibran | 63,114 | 0.06021790 | **363–430** | 400.2235 | **0/2,000** |
| Emerson | 324,630 | 0.06249829 | **357–476** | 410.6875 | **0/2,000** |

Across all **6,000** deterministic native-GP windows, none approaches the original 199 equalities. A source-native positive plant encrypts Shakespeare with an arbitrary deterministic period-6,395 additive pad and verifies exact plaintext recovery, exact equality preservation, and exact lag-difference preservation.

This is therefore a strong negative for **literal reuse of the same additive GP29 pad at the two bookend positions** when the plaintext is drawn from these native-GP registers.

### Independent source-native spelling and pre-echo holdout calibration (16 November 2026)

The **full 6,561-symbol lag-6,395 shared-pad test above already includes every position** of a later 302-rune alignment restricted to the text immediately preceding the p27/p55 repeated two-word phrase. To distinguish the actual source-selected six-rune anchor from surrounding ciphertext, Agent9 independently tested only the **302 runes immediately before each echo** and excluded the six selected echo symbols. This is a **narrower corroboration of the existing exclusion**, with original-solved-LP1-calibrated one-rune ING/IO spelling, not a new cipher-family claim or reason to reopen a key search.

With p27 and p55 anchored at global half-open endpoints 6,561 and 12,956, the two 302-symbol pre-echo windows lie at global 6,253–6,554 and 12,648–12,949. Their exact 29-class signed-difference histogram is:

\`\`\`text
[11,5,16,16,9,9,12,11,7,4,10,11,7,12,15,11,8,12,11,11,9,8,12,8,14,11,7,14,11]
\`\`\`

Only **11/302** pairs coincide. Let \`p(r)\` be the rune frequencies in a source-native GP29 English reference, with ING→21 and IO→27 as independently observed on solved pages; set \`q(d)=sum_r p(r)p(r−d mod29)\`. The score \`Σ ln[29q((C27−C55) mod29)]\` compares the observed pad-cancelled signed difference with two independent English passages against a flat GP29 difference. It is an **original-source-fixed score without fitting or recovering a key**:

| Corrected GP29 source corpus | Native runes | Original 302-rune LLR | Median of 1,500 deterministic independent-English pairs | Control pairs at/below original |
| --- | ---: | ---: | ---: | ---: |
| Gibran | 62,492 | −5.80230 | +6.54668 | 0/1,500 |
| Shakespeare | 217,106 | −5.04912 | +5.94815 | 0/1,500 |
| Emerson | 321,327 | −6.47681 | +7.03289 | 1/1,500 |

The same registered procedure exactly cancels a planted **shared nonperiodic additive pad** and reconstructs both planted plaintexts. Against 2,000 deterministic alternative alignments with actual unmodified ciphertext, the original Gibran-based score is ordinary: **901/2,000** alternatives score at least as high (null median −6.22623). The English excerpt controls can overlap, and this is not a full experiment-family p-value. In particular, the 302-rune result **does not establish any independent break**, because the older test above already rejects a more extensive version of the identical model.

The complete independent source-only control was executed on Windows Node22 with a successful [manual run 43806311849](https://github.com/FlareZ123/liber-primus/actions/runs/43806311849), using [\`sims/lp2_p27_p55_keyfree_samepad_delta_sft.cjs\`](../sims/lp2_p27_p55_keyfree_samepad_delta_sft.cjs), with deterministic native-English controls and a real reusable-pad positive. The **unchanged research decision** remains to seek a creator-selected reset or different reversible operation rather than relaunch an additive same-pad search.

## Pure ciphertext-step state return

A stronger literal chain reading would make the ciphertext step stream itself repeat:

[
Delta C_i=Delta C_{i+6395}.
]

There are **6,560** eligible paired steps. Only **255/6,560 = 0.0388719512** match. A deterministic step-keystream returning to exactly the same state at lag 6,395 would require all **6,560/6,560** matches. That literal state-cycle interpretation is therefore impossible on the unchanged original ciphertext.

## Decision and scope

The repeated bookend is real source structure, yet it does **not** support either of these two simplest reset mechanisms:

1. exact reuse of one additive GP29 pad across the lag, for the three tested native-GP English registers;
2. exact repetition of the ciphertext-step keystream across the lag.

Do not use the bookend alone to reopen a period-6,395 pad or direct chain-state search.

This result does not exclude a reset whose key consumption depends on plaintext/ciphertext rejection events, a nonlinear or evolving state, a hidden intermediary alphabet, a different plaintext language/register, or a structural meaning for the repeated phrase unrelated to key state. Any successor should supply a source-visible rule selecting one of those richer mechanisms before searching its parameters.

**Reproduce:** `node sims/lp2_bookend_6395_sharedpad_sft.cjs`. The script asserts the 12,956-rune corpus, exact bookend offsets and lag, original equality/difference profile, all 6,000 native-control results, the 255/6,560 step match, and the exact source-native positive plant.
