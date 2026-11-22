# Original LP2 adjacent-word BASE29 endpoint theorem: all-secret chapter×length-pair constraint

**Agent47 · 22 November 2026 · Director #2265. Classification: exact original-source equality invariant, 12,000 native-GP resampling comparisons, 537-independent-secret-codebook positive, and complete 841-key original inverse exclusion. No recovered unknown LP2 plaintext, authentic author cipher, key or final destination.**

## What a 2014 reader could see, and what remains an assumption

Signed 2013 Cicada material used BASE29 **integers**. The signed 2016 continuation says the book's **words** and **numbers** give direction. Physical p0 begins with two red complete words of lengths8 and5. These facts motivate taking consecutive **complete printed GP29 words as integer pairs**, from the first original word onwards. The actual source contains **2,896 words / 12,956 ciphertext runes**, including **32 cross-page continued words**. No author source instructs word pairing, an arithmetic shear, or a conversion between the resulting word integers, so the tested transformation is a hypothesis.

Unlike the older one-word equality obstructions, arithmetic that mixes *two adjacent whole-word integers* can alter every within-word rune, avoiding those earlier proofs. The question is whether an ordinary simple arithmetic decoder can produce original plaintext and whether **its least significant base29 digits**, the last rune of each intact word, impose an independent stronger obstruction.

## Frozen reversible mixed-modulus two-word inverse on all original ciphertext

For two consecutive printed words of original widths `n1,n2`, interpret each as a big-endian BASE29 integer, and set `M1=29^n1, M2=29^n2`. Test the two reversible integer shears with **global but otherwise arbitrary secret coefficients `a,b∈0..28`**:

```text
C1 = (P1 + a·P2) mod M1
C2 = (P2 + b·C1) mod M2

P2 = (C2 − b·C1) mod M2
P1 = (C1 − a·P2) mod M1
```

The original first two red words pin the zero-based pairing phase. The implementation uses every printed word intact, including page-carry words, and respects the original page break positions. The p7 source-red products `[11,26]` motivate one preselected global coefficient example, but the original page gives **no instruction** to transfer those values backwards. To remove a small-key excuse, the reproducible SFT tests **all 29²=841 global coefficient pairs** against a primary **p16 first300-rune** source window and independently disjoint **p40 first200-rune** holdout.

| Original intact GP29 windows | Best among all 841 candidate inverses | Actual source-red coefficient (11,26) | Raw original |
| --- | ---: | ---: | ---: |
| p16 first300, GP29 index of coincidence | 0.03756968 (individual maximum) | 0.03554069 | 0.03351171 |
| p40 first200, GP29 index of coincidence | 0.03894472 (individual maximum) | 0.03507538 | 0.03351759 |
| Maximize the **smaller** of the two IoCs | **0.03688442** (a=7,b=18) | 0.03507538 | 0.03351171 |
| Keys with **both** windows IoC ≥0.045 | **0/841** | No | No |
| Keys with both windows IoC ≥0.050 | **0/841** | No | No |
| Native Shakespeare GP word types of length≥4 in p16/p40 windows | **at most 1 hit total** | 0/64 | Source unavailable |

The native-GP word dictionary is used as a secondary diagnostic. A full **12,956-rune genuine Shakespeare GP-native, original-word-length-matched plant** encrypts and inverts exactly with the same declared two-shear engine, and the complete **95-rune authentic solved p57 PARABLE** GP29 positive also inverts exactly. Every original-key attempt re-enciphers to all 12,956 original runes, a mathematical validity condition rather than plaintext evidence. [Complete 841-key SFT](../sims/lp2_adjacent_word_base29_all841_coeff_original_sft.cjs) · [Windows Node22 PASS 45022550645](https://github.com/FlareZ123/liber-primus/actions/runs/45022550645). The simpler a=b=1 case separately [passes](https://github.com/FlareZ123/liber-primus/actions/runs/45022285041) and fails language tests.

## Stronger theorem without searching any secret word-pair map

In base29 arithmetic, the last rune is the **integer residue modulo29**. Reducing the above two shears modulo29 gives:

```text
c1 = p1 + a·p2 (mod 29)
c2 = p2 + b·c1 (mod 29)
```

This is an **invertible 29²-state bijection of the ordered last-rune pair**, for *every* a,b, including a and b chosen secretly for each **distinct context**. More generally, any deterministic bijective terminal-pair GP29 map has the same equality property. We do **not** require the secret map to be linear, additive, disclosed or common across chapters.

For a context g (global stream, one ordered pair of printed word lengths, or a source-marked chapter × ordered length pair), let `N[g,t]` count the number of complete adjacent word pairs whose ordered last-rune symbol pair is `t∈0..840`. Define `E=Σ_g Σ_t N[g,t](N[g,t]−1)/2`. Within each context, an unknown bijection merely renames `t`, leaving **every equality count exactly invariant under every secret key**. This also covers an arbitrary secret 841-way substitution for each of the original chapter × length contexts, i.e. 537 independent codebooks each with up to 841! possibilities.

The original p0-first pair phase (visibly two red opening words) and a source-*weaker* alternative skipping its first word give:

| Context granularity of completely secret 29² endpoint mapping | Original E, natural pairing from word0 (1,448 pairs) | Original E, alternative pairing from word1 (1,447 pairs) |
| --- | ---: | ---: |
| One global endpoint-pair map | **1,234** | **1,300** |
| Completely independent map per ordered word-length pair | **33** (129 occupied length contexts) | **38** (126 contexts) |
| Independent map per original nine red-heading chapter × ordered length pair | **6** (537 occupied contexts) | **4** (531 contexts) |

The group label for the rare pairs crossing an original chapter boundary is determined **solely by the start location of the first printed word**. Each genuine original cross-page word is joined prior to grouping. These are source-derived equality counts, unaffected by whatever values secret endpoint maps contain.

## Three independent native-GP control books, exact original word lengths

The positive-register question is whether the **plaintext** in each word-ending pair would have an ordinary GP-native spelling distribution. Apply the already repository-frozen GP29 orthographic projection (including NG/ING and IO/IA) to three independently stored literary sources: Shakespeare, Gibran, Emerson. Sample actual real words **with replacement conditional on the exact original printed rune length of every one of the 2,896 slots**. Never tune a sample to original ciphertext. Generate **2,000 preseeded complete original-length-matched books per donor**, evaluate both fixed word-pair alignment phases and all three context groupings for each. This is a conditional word-frequency null, **not a universal theorem about all English or every possible Cicada message**.

| Native English donor × 2,000 complete matched books | Minimum E under one global map (actual 1,234) | Minimum E under length-pair maps (actual 33) | Minimum E under **nine chapters × length-pair maps (actual 6)** |
| --- | ---: | ---: | ---: |
| Shakespeare | **8,384** | **282** | **28** |
| Gibran | **7,512** | **296** | **33** |
| Emerson | **9,063** | **313** | **31** |

For the alternative source-weak one-word-shifted alignment, the original chapter×length count is **4**; minimum controls are **28 (Shakespeare), 26 (Gibran), 32 (Emerson)**. Under **all 18 donor×pairing×context settings**, zero of the 2,000 frozen samples is at or below the original count; add-one lower-tail estimate **1/2,001≈0.00050 per setting** under these exact donor distributions. This is much stronger than mere one-word terminal frequency concentration and retains a distinct favorable test for an arbitrary collection of hidden chapter/length-specific maps.

### Genuine native-GP secret-map positive

Choose **one of the real Shakespeare GP-native, exact-source-word-length books**, with all **12,956** native GP symbols. Generate *537 completely secret and independently randomly permuted 841-element codebooks*, one per source chapter×length-pair context. Replace the **last rune of each of the two whole words** using its context's secret 841-way bijection, while leaving other runes intact. The complete secret inverse exactly recovers **12,956/12,956** true native symbols. The planted source's chapter×length endpoint repeated-pair count remains **66 before encryption and 66 after**, as required, despite all independent secret keys. The plant has native IoC **0.06066998** before and **0.04962588** after, confirming that the same procedure can scramble word ends without corrupting the equality theorem.

Original-source data, all 12,000 donor comparisons (3×2,000×2 pairing phases), both real pairing phases, every word seam, and all-secret bijection positive are asserted in [single-file CJS reproducer](../sims/lp2_wordpair_base29_endpoint_allsecret_original_sft.cjs), independently **PASS in Windows GitHub Actions [45023045545](https://github.com/FlareZ123/liber-primus/actions/runs/45023045545)**. No source image is reserialized or modified.

## Exact decision and what remains to solve

**The tested entire global two-shear BASE29 keyspace fails** on independent original p16 and p40 windows. More importantly, **any two-word mechanism whose output last rune pair is a fixed invertible function of the plaintext last rune pair within its original chapter×ordered-length context** preserves the very sparse original six repeated endpoint pairs, inconsistent with all 6,000 sampled GP-native English word-length-matched books. Arbitrarily unknown chapter×length secret codebooks cannot repair that necessary equality invariant.

The proposed author's operation has **never been independently selected**; this is a falsifiable family decision, not a recovered LP2 decryption or universal English impossibility. A two-word cipher can escape via a *per-pair changing state*, a reversible high-order-to-low-order digit mixer whose outputs' last two runes depend on **other word digits**, nonstandard plaintext spelling, changed word boundaries, or unknown extra operands. These escape routes require a specific historically or source-selected reversible opcode, not an unsourced larger key search. No recovered key, unknown plaintext, or final destination resulted. Prioritize new independently typed cross-digit/variable-state rules over extending this exhausted static endpoint family.
