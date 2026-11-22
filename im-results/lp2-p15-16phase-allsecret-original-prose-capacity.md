# Original LP2 p15 4×4 → p16–p21: an exact all-secret 16-phase substitution obstruction

**Agent 10, 22 November 2026. Classification: original-input conditional cipher-family exclusion.** The unknown pages are **not deciphered**. This result rejects a direct fixed sixteen-phase GP29 rune substitution of ordinary source-native prose even if an adversary chooses sixteen completely unknown 29-symbol substitution alphabets. It does not exclude a stateful or polygraphic cipher, a transposition, unusual plaintext, or an external key.

## Human-visible hypothesis and competing mechanism

Original physical LP2 p15 (scan 32.jpg) prints a literal 4×4 numeric square, including a single red 3299, immediately before six mostly monochrome text-only pages p16–p21. A human might use its **sixteen** entries as a cyclic key, perhaps one substituted 29-rune alphabet per entry. This is a source-selected *clock length*, although the drawing does not actually prescribe substitution, entry order, whether to reset on new pages or words, or how to derive any secret alphabet.

The competing hypothesis is that the square participates in a genuinely changing-state cipher, or is an instruction unrelated to the adjacent text. **Crucial prior-art correction:** Agent25's [13 November original p15 all-secret sixteen-phase test](lp2-p15-period16-allsecret-source-gate.md) already excluded this fixed-alphabet family over **p16–p23 and 3,942 native-GP windows**, using an exact permutation-invariant within-phase coincidence test. The present result is **an independent rank-capacity restatement, with a new disjoint p40–p53 holdout**, rather than a discovery of a previously untested cipher class. It is not stronger than Agent25's earlier original-language exclusion. Existing p15 Hill/block tests also failed (#1999).

## A ciphertext-only, key-independent proof

Let each original GP29 symbol be an integer in 0…28. Fix one of three physically identifiable clocks: continuous through a chosen original region; restart phase 0 on each page; or restart phase 0 on each complete printed word. Let C_i = Q_phase(i)(P_i), with sixteen fixed but entirely arbitrary **permutations** Q_0…Q_15 of all twenty-nine rune identities. There is no assumption about the key, its magnitude, its numerical derivation or its algebraic form.

For phase s, the original ciphertext itself fixes the 29-bin histogram n[s,c]. Since the substitution row is bijective, decrypting that phase **can only permute its bin counts**. Hence for any set of k GP plaintext rune identities, the number of plaintext positions belonging to that set is at most the sum of the k largest original ciphertext-bin counts in every phase:

\[
B_k=\sum_{s=0}^{15}\operatorname{TopKSum}_k(n[s,0],\dots,n[s,28]).
\]

In particular, the global k most common plaintext glyphs must obey that same ceiling. This remains true for all 29!^16 unknown tables and needs no search. A native-GP text whose global top-k count exceeds the bound cannot be produced by **any** such model, no matter how the secret alphabet rows are chosen.

Every original rune is included. For a word-reset clock, word positions are taken from the canonical 2,896 complete printed word tokens; the 32 true cross-page word continuations remain joined.

## Exact untouched original-cipher bounds

| Source ciphertext | Fixed 16-phase clock | Max plaintext top-one | Max plaintext top-five |
| --- | --- | ---: | ---: |
| p16–p21, 1,613 runes | Continuous | 122 | 502 |
| p16–p21 | Each printed page resets | 126 | 507 |
| p16–p21 | Each printed word resets | 102 | 444 |
| p40–p53, 3,008 runes, independent visual chapter | Continuous | 196 | 839 |
| p40–p53 | Each printed page resets | 192 | 834 |
| p40–p53 | Each printed word resets | 175 | 762 |

These are upper bounds even if the secret Q rows are selected in the most advantageous way *after seeing the original*. The independent floral chapter is a test of the **same algorithm class** on a distinct contiguous source segment, not evidence that p15 actually supplies its key.

## Source-native calibration and actual reversible plants

The existing source-calibrated GP spelling encoder recovers **all 181 printed LP1 solved words** in its fixture and all **95 original solved p57 runes**. Reuse its exact encodeSourceNativeGP mapping, including source-witnessed NG/ING and IA/IO spellings. For each of three pinned control corpora, generate sixty 12,956-rune authentic-word-length-matched GP29 sources by drawing replacement words of the **same GP rune length** at every original word slot; retain the actual original p16–p21 and p40–p53 position cuts. No text is selected based on output score.

| Reference GP corpus | p16–p21 top-one range | p16–p21 top-five range | p40–p53 top-one range | p40–p53 top-five range |
| --- | ---: | ---: | ---: | ---: |
| Gibran, *The Prophet*, 60 | 169–223 | 646–714 | 324–400 | 1,188–1,298 |
| Shakespeare, 60 | 161–220 | 622–702 | 314–407 | 1,185–1,292 |
| Latin Vulgate, 60 | 179–222 | 735–825 | 334–388 | 1,381–1,514 |

**All 180 original-shaped GP-native controls violate both top-one and top-five bounds under each of all three fixed-phase clocks, in both disjoint original regions.** These are conditional source-control observations, not universal theorems about every conceivable English, Latin or invented rune register.

For genuine positive controls, pick sixteen independent secret full permutations with a seeded Fisher–Yates shuffle, encrypt GP-native Gibran donor text, invert every rune by its correct phase-specific inverse, and independently check that every observed native plaintext top-k count is below the corresponding cipher-bin envelope. All six region×clock planted inversions recover the entire native plaintext exactly: p16–p21 1,613/1,613 and p40–p53 3,008/3,008, for continuous, page, and word clocks. This tests the code's direction, nontrivial secret alphabets, and the claimed necessary invariant; merely reencryping an arbitrary original gibberish candidate would not authenticate plaintext.

## Decision at the cipher-design gate

**Reconfirm the already-excluded stationary sixteen-phase symbol-substitution interpretation of the p15 number square**, now under a different exact top-k proof and over the genuinely disjoint floral p40–p53 original receiver. Agent25's earlier within-phase IoC exclusion remains the primary reference; these tests add an independently implemented capacity argument and a source-matched chapter holdout.

A genuinely different architecture would need a phase/key state that **changes in response to an input or to a separately specified recurrence**, a multi-rune fractionation, an external keystream, or a non-native GP plaintext register. The p15 spiral makes a changing-state successor concept conceivable, but no original source presently specifies an update equation, initial state, output lookup and synchronization. A random rotor or nonlinear feedback program invented to rescue the bound has no justified path to original plaintext. Next discriminating step: obtain an original instruction that fixes such an evolution or recover independent unknown-page plaintext, then use p16–p21 and p40–p53 as separately sealed receivers.

No unknown LP2 plaintext, genuine author key, or final Cicada destination was produced.

**Reproduce**: [exact Node.js 22 CommonJS original-corpus and native-positive SFT](../sims/lp2_p15_16phase_allsecret_prose_capacity_sft.cjs) · [Windows GitHub Actions PASS, run 45011928045](https://github.com/FlareZ123/liber-primus/actions/runs/45011928045) · original printed corpus in resources/liber-primus/lp2-corpus.json and canonical transcription.
