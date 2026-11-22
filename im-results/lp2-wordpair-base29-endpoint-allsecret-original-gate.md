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

## Source-visible chapter resets and five/ten-dot state-complexity frontier (Agent47, 22 November)

**Independent original pairing hypothesis.** A human solver may start a new consecutive-word-pair clock whenever a red chapter heading begins. There are **nine original author-visible red headings**; source-preserved chapter word counts are **158,255,383,437,224,326,378,669,66**. Four chapters have an odd number of complete printed words and therefore require an explicit singleton-handling rule if a two-word cipher resets within each chapter. Their terminal unpaired word indices are **412,795,1232,2829**. Preserve all actual words and allow these four exact singleton exceptions, rather than silently crossing a heading. The **1,446** remaining local chapter pairs have E=**1294** with one global mapping, E=**31** with separate ordered-length mappings (123 distinct contexts), and E=**6** with 530 independent original chapter×length-pair secret permutations. The latter matches the global-pair chapter×length score, despite source-visible re-pairing. Every one of **2,000** length-preserved source-native GP29 books per independent Shakespeare/Gibran/Emerson donor has **≥27,≥32,≥35** respective E values (all 6,000 exceed original6). This independently rejects rescue by red-heading clock resets within the exact last-rune bijective model. Original-input CJS SFT [same all-secret proof, extended](../sims/lp2_wordpair_base29_endpoint_allsecret_original_sft.cjs) and [Windows Node22 PASS45024228826](https://github.com/FlareZ123/liber-primus/actions/runs/45024228826).

**Fresh independently motivated changing-map question.** Five red-numbered items and original five-dot motifs could select a **5-phase** changing key. The original double ten-dot motifs could instead select a **10-phase** cycle. Let each adjacent original complete word pair use a different **arbitrary secret 841-way endpoint-rune permutation** according to a source-defined periodic phase, with optional independently keyed chapter, ordered word lengths, or both. Compare **all** possible secrets with the identical equality invariant separately in every fixed context. No guessed key or English-fitted map appears in the original test.

| Secret endpoint map scope | Original E for 5 phases | Distinct 5-phase secret maps | Original E for 10 phases | Distinct 10-phase secret maps |
| --- | ---: | ---: | ---: | ---: |
| Phase only, global book-pair index | 240 | 5 | 121 | 10 |
| Red-heading chapter × local pair phase | 34 | 45 | 19 | 90 |
| Ordered word-length pair × local pair phase | 9 | 403 | 7 | 603 |
| Chapter × ordered word-length pair × local phase | **2** | **1,030** | **2** | **1,195** |

The phase index restarts independently within each source-authored chapter for the chapter-specific tests; changing starting offset uniformly merely relabels secret maps. **Two thousand** exact-original-word-length real GP29-word books per source donor were tested for all eight frozen schemes.

| Source-native donor | Min E, 5-phase phase-only (actual240) | Min E, 5-phase chapter×length×phase (actual2), controls ≤2 | Min E, 10-phase phase-only (actual121) | Min E, 10-phase chapter×length×phase (actual2), controls ≤2 |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | **1,637** | **1; 7/2,000** | **791** | **0; 225/2,000** |
| Gibran | **1,506** | **2; 3/2,000** | **718** | **0; 150/2,000** |
| Emerson | **1,779** | **2; 1/2,000** | **882** | **0; 147/2,000** |

The 5- and 10-phase source-only mapping classes therefore remain far from even a conditional ordinary-GP word source. Increasing the state to **at least hundreds of wholly independent 841-state secret tables** is required before these GP-native donors approach the original terminal collision distribution. The 10-phase chapter×length×phase model **does survive** this particular necessary condition in dozens to hundreds of genuine control books, but only after **1,195 independently free secret maps**, almost one per physical two-word slot; a small first-party PRNG or derivation rule could compress this description, but the original artwork supplies **no** such generator or 2014-readable operand. The ten dots alone cannot select it.

**Actual source-language positive, not just test statistics:** encode a complete true 12,956-rune Shakespeare GP29 book with arbitrary independently randomized 841-way permutations in (i) each of five global phases, and separately (ii) each of 1,195 ten-phase chapter×length contexts. Both full secret inverses recover all 12,956 original native symbols exactly. The exact equality statistic is conserved **1,864→1,864** for five global secret tables and **8→8** for 1,195 independent ten-phase tables. These passing controls establish the quantified keyspace theorem is evaluating real reversible ciphers. [One-file Node22 source SFT](../sims/lp2_wordpair_dots5_10_statecomplexity_allsecret_sft.cjs), [Windows PASS45024342299](https://github.com/FlareZ123/liber-primus/actions/runs/45024342299).

**Research decision:** Every original-reader-plausible low-state **five-dot/ten-dot phase clock** by itself and when keyed by just red chapters remains inconsistent with the fixed native-GP control register. A high-capacity ten-phase chapter×word-length codebook cannot be statistically excluded, but is **not a defined human solve path** without an independent historical key generator. The first-party decorative marks alone have no verified instruction for mapping five or ten dots into any particular GP29 endpoint permutation. Search for a genuinely specified state-update/key source rather than enlarging free lookups, and explicitly leave an unobserved high-order digit mixer or nonstationary per-pair key outside these terminal-digit tests.

## An actual cross-digit reversibility attack from the printed 1033↔3301 cuneiform (Agent47, 22 November)

The original p33–39 heading prints **1033** and **3301**, an unmistakable **decimal digit reversal of each other**. Independently, signed2013 Cicada material explicitly serialized integers in BASE29. These source facts motivate, but do not authenticate, a concrete **reverse-the-complete-GP29-word-digits before/after two-word full-integer arithmetic** operation. Unlike the fixed terminal-pair substitution studied above, mixed-modulus carries in this reversed-digit register **can change the visible terminal pair according to high-order original digits**. It therefore bypasses the previously established endpoint-collision theorem by construction. This makes it a substantive independent architecture test rather than another low-digit key search.

The fixed reversible two-complete-word machine for widths n₁,n₂ is:
```text
X₁ := BASE29(reverse(plainWord₁)),   X₂ := BASE29(reverse(plainWord₂))
Y₁ := (X₁ + a·X₂) mod 29^n₁
Y₂ := (X₂ + b·Y₁) mod 29^n₂
cipherWord₁ := reverse(GP29_fixed_width(Y₁,n₁))
cipherWord₂ := reverse(GP29_fixed_width(Y₂,n₂))

Inverse from original ciphertext:
Y₁ := BASE29(reverse(cipherWord₁)), Y₂ := BASE29(reverse(cipherWord₂))
X₂ := (Y₂ − b·Y₁) mod 29^n₂
X₁ := (Y₁ − a·X₂) mod 29^n₁
plainWordᵢ := reverse(GP29_fixed_width(Xᵢ,nᵢ))
```
For the historical numeral cue, freeze **(a,b)=(1033,3301)** and all eight source-sized sign/order choices of these two source integers, with both original word widths preserved. As a much larger fully checked small-key class, test every global **a,b∈{0,…,28}**, all **841** aliases, without choosing the output from language scoring. The physical p0 first two red words establish the first pair and all **32** genuine cross-page words are retained intact.

Unlike prior original p16-only arithmetic tests, choose an **actual source-typed numbered-text train and holdout**: the complete **139-rune** first original numbered paragraph starts at p36 source-rune offset99; the complete **91-rune** second numbered paragraph begins at p37 offset0; plus a separate **200-rune** unrelated p40 source window. The exact source-original E statistics of the three unchanged ciphertext windows are 0.034198728 / 0.034676435 / 0.033517588; the signed-number variant 1033,3301 decodes to GP29 IoC **0.034720050 / 0.034188034 / 0.033618090** with **0 genuine native GP words** of length at least four among 17+14+27 complete printed word slots. The eight source sign/order variants all have **zero long word hits** and their smallest of the three IoCs is **≤0.035778895**. Across the **entire 841-key low-coefficient class**, not a single pair yields **IoC≥0.045 simultaneously** on all three original windows; the best of the three window-minima is **0.036331658** at (a,b)=(20,21), with zero full native-GP lexicon words in all three decoded windows. An actual 12,956-rune source-native Shakespeare plant (with *identical original word widths*) instead achieves GP IoCs **0.055677197 / 0.052258852 / 0.055678392** and **17/17+14/14+27/27** native dictionary words on these identical three windows.

**All code paths roundtrip truly:** the same whole-word cipher correctly enciphers and inverse-recovers every one of the **12,956 true Shakespeare GP native test runes**, and the authentic solved LP2 p57 95-rune plaintext in its natural complete printed words. Every fixed historical reverse-digit variant also forward-reencrypts all 12,956 *original* ciphertext runes exactly, a necessary implementation check that cannot itself validate a guessed plaintext. [Windows Node22 verified original SFT](../sims/lp2_cuneiform_1033_3301_reverseword_two_shear_original_sft.cjs) · [PASS45024848736](https://github.com/FlareZ123/liber-primus/actions/runs/45024848736).

**Decision:** This is a bounded rejection of **one specifically source-cued, whole-word two-shear high-to-low-digit mixer** plus all 841 small global key aliases and the eight explicit 1033/3301 signed variants. It demonstrates the previous low-digit theorem was not silently applied to architectures that violate its assumptions. The original 1033/3301 cuneiform speaks in numbers and numerical reversal but provides **no** first-party instruction to perform these shears, use this word pairing, or decode a numbered block. No actual unknown LP2 plaintext, key, five-part instruction or destination is recovered. New work would need independent source instructions for a different high-to-low mixer or an actual crib, rather than repeated arbitrary coefficient matrices.

## An original 256-cell p50 numerical-table receiver without ANY guessed secret permutation (Agent47, 22 November)

### Source-first intervention rather than another invented key

Original p49–51 contains one unusual **32-row×8-column table** of exactly **256 printed two-character tokens**. The original row-major stream has **161 distinct literal token spellings**; duplicated tokens are visually and digitally real. An intended human receiver might read a cell in sequence, apply that cell's secret alphabet to a whole pair of GP29 word-ending symbols, then continue to the next cell. Nothing in the source explicitly says to advance **one cell per two completed original words** or to read table data as paired-rune alphabet permutations; those remain two explicit unverified premises. This test grants the cipher maximum unknown-key capacity so they cannot be rescued by trying different 841-way permutations.

Let `i=0..1447` index each adjacent pair of the **2,896 unchanged complete printed p0–p55 words** (all 32 actual physical page-carry words joined). Let `e_i=29*lastRune(word[2i])+lastRune(word[2i+1])` in the **841 possible ordered GP29 terminal pairs**. Under each fixed observable source context `g_i` derived from table cell `i mod256`, allow a **distinct, arbitrary, secret bijection of 841 input symbols**. Then within-context equality
`E=Σ_gΣ_e binomial(count_g(e),2)` is **exactly conserved** by every possible permutation, even one created by a hidden cryptographic key generator. Six source-motivated context readings are frozen before comparing ciphertext:

| Candidate source context for word-pair clock | Distinct secret maps granted | Original E | Min E in 2,000 Shakespeare books | Min E in 2,000 Gibran books | Min E in 2,000 Emerson books |
| --- | ---: | ---: | ---: | ---: | ---: |
| **Every row-major cell index 0…255** | 256 | **3** | 15 | 11 | 16 |
| **Identical literal printed token** | 161 | **5** | 43 | 37 | 44 |
| Numeric byte high five bits (hypothetical base60) | 32 | 41 | 274 | 249 | 301 |
| Numeric byte low three bits (hypothetical base60) | 8 | 158 | 1026 | 956 | 1143 |
| Original row index (32×8) | 32 | 33 | 231 | 206 | 233 |
| Original column index (32×8) | 8 | 183 | 989 | 908 | 1095 |

Every null sample is a **complete 2,896-word genuine GP29-English control book**, drawing original Shakespeare, Gibran or Emerson source words with replacement inside **each exact original word-length bucket** (all 12,956 GP29 rune slots preserved). There are **6,000 fully sampled books** across three independent donor registers and **36,000 frozen context evaluations**; *zero* samples reach or fall below original E in **any** of the six settings. Add-one conditional empirical lower-tail **1/2001 ≈ 0.00050** per donor/context. The stronger literal-token equality test is independent of the unresolved **base59/base60 reading**, because the grouping uses the two printed characters verbatim.

**Real exact positive rather than merely a synthetic histogram:** Choose an actual complete original-length-matched Shakespeare GP29 plaintext book. For each source interpretation (256 cell indices, 161 printed token types, or 32 byte-high components), independently uniformly scramble each of the 841 possible input endpoint-pair symbols under a *different completely secret permutation*. Encode all **12,956 genuine plaintext runes** and invert the actual secret maps. Decoding recovers **12,956/12,956**, preserving the source-native exact contextual collision statistic: respectively **33→33**, **62→62**, and **333→333**. These establish the all-secret equality test's power on a genuine reversible native-English construction.

The source-original data and codebook-agnostic theorem are asserted in [single-file Windows Node22 reproducer](../sims/lp2_p50_256cell_wordpair_allsecret_original_sft.cjs), [PASS run45025409160](https://github.com/FlareZ123/liber-primus/actions/runs/45025409160). The original printed table, original GP29 corpus and original word boundaries are read as shipped; no output is written.

**Decision:** The p50 table's actual **256 observable cells** (and its 161 literal repeated tokens, 32 rows, eight columns, and byte 5/3 components) do not furnish a native-prose-compatible **static bijective receiver on two adjacent complete word-ending runes**, regardless of hidden alphabet selection. This is sharper than simply finding no key: the exact incompatibility applies to every secret 841-way substitution per source cell. It does **not** exclude a state update that changes within the *same cell context*, a receiver that changes higher-order word digits, a table encoding keys through a nonbijective/fractionated operation, authentic punctuation resegmentation, or a different plaintext register. No independently source-selected decoder, recovered LP2 key, unknown plaintext or destination is inferred.

## Exact decision and what remains to solve

**The tested entire global two-shear BASE29 keyspace fails** on independent original p16 and p40 windows. More importantly, **any two-word mechanism whose output last rune pair is a fixed invertible function of the plaintext last rune pair within its original chapter×ordered-length context** preserves the very sparse original six repeated endpoint pairs, inconsistent with all 6,000 sampled GP-native English word-length-matched books. Arbitrarily unknown chapter×length secret codebooks cannot repair that necessary equality invariant.

The proposed author's operation has **never been independently selected**; this is a falsifiable family decision, not a recovered LP2 decryption or universal English impossibility. A two-word cipher can escape via a *per-pair changing state*, a reversible high-order-to-low-order digit mixer whose outputs' last two runes depend on **other word digits**, nonstandard plaintext spelling, changed word boundaries, or unknown extra operands. These escape routes require a specific historically or source-selected reversible opcode, not an unsourced larger key search. No recovered key, unknown plaintext, or final destination resulted. Prioritize new independently typed cross-digit/variable-state rules over extending this exhausted static endpoint family.
