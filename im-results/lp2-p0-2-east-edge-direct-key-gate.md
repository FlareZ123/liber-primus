# Map east-edge keys: direct GP29 and two exact GP28 successor inverses

**Decision:** source-selected eastern column keys do not recover plaintext under direct repeating-key GP29 on original p55. A distinct lossless GP28 predecessor-exclusion consumer using the p0–p2 27×27 east edge also fails on the next two untouched illustrated chapters p3–7 and p8–14, under both natural rank conventions, three source-derived key numeric registers, both signs and both repeated-rune clock policies. These are two bounded cipher-family decisions, not a test of the external project's own three-rune-node / totient / Möbius route. No authentic unknown plaintext or key has been found.

## Avoiding duplicated p3 work

The repository already contains `sims/lp2_27x27_eastmap_p32_to_p3_sft.cjs`. It tested the p0–p2 east edge on untouched p3, including a totient-of-GP-prime mapping, and tested the p32 11×11 east edge on p3. This report does **not** repeat or claim those p3 results. The new experiment is limited to p55.

## Two map candidates

### p0–p2 27×27 map (conditional external hypothesis)

The canonical transcription `resources/liber-primus/lp2-corpus.json` (Git blob SHA `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`) contains exactly 729 = 27×27 runes across p0–p2. The 27th column, read top-to-bottom, is:

`[17,17,21,25,7,11,25,28,1,4,16,6,9,24,28,5,1,8,6,19,8,16,18,20,7,21,7]`

The phrase “the key is to go to the east of the map” comes from an external, not first-party-authenticated candidate decoding. Taking the edge as a repeating key is a literal, cheap interpretation, not an established instruction.

### p32 11×11 map (independently source-selected partition)

Original p32 has 121 runes in an 11×11 square. Its top-row GP-prime weights sum to **563** and its first-column weights sum to **569**, matching the exact dimensions of the independently signed 2016 tree image. This fixes the 11×11 image partition/orientation, but does not itself instruct the solver to use the eastern edge as a cipher key. See `im-results/lp2-p32-signed2016-tilepixel-key-gate.md`.

The p32 11th column, top-to-bottom, is:

`[21,7,2,23,14,17,7,2,11,24,12]`

Using this edge as a key is therefore a testable interpretation of a source-selected map, not an authenticated cipher rule.

## Frozen p55 model

Original p55 has **76 runes**: one incoming carry rune from p54 and 75 body runes. Its ciphertext-F positions are **[15,25,41]** (page-local, zero-based).

I applied the authentic p56 **transparent plaintext-F** convention: a selected literal plaintext F emits ciphertext F and does not consume a key position; a ciphertext F not selected as literal may decrypt to a non-F rune. Any key-consuming position that decrypts to plaintext F is invalid under this rule. All (2^3=8) subsets of the three ciphertext-F positions were enumerated.

For each edge, I tested three fixed rune-to-key mappings, each top-to-bottom and bottom-to-top:

1. Raw GP29 rune index.
2. GP prime weight modulo 29.
3. Euler φ of the GP prime weight, i.e. `(prime[index] - 1) mod 29`.

Only subtraction (P=C-Kpmod{29}) was used, matching the solved p56 inverse direction. No arbitrary key phase was searched.

The p0–p2 key period is 27. The 729-rune map consumes 27 periods; the continuous no-prior-F-skip phase at p55 is (12{,}880mod27=1), alongside page-reset phase 0.

The p32 key period is 11. Its source-fixed clocks are page-reset phase 0; continuous from p32 through p54, (4{,}920mod11=3); and continuous from p0 through p54, (12{,}880mod11=10). Both continuous clocks explicitly assume **no earlier plaintext-F bypasses**. If such bypasses occurred earlier, their consumed-key count would change the phase. These phases are bounded controls, not authenticated states.

This gives **240** total combinations: 96 for the p0–p2 map and 144 for p32. Only **13** satisfy the transparent-F consistency rule; the other **227** would require at least one plaintext F to consume a key symbol and are invalid.

## Results

The 75-rune p55 body has original IoC **0.0385586** and mean English-quadgram score **−15.5857843**. A 75-rune clear p57 control scores **−9.9588446** under the same scorer (79,495 quadgrams, `resources/control/duko_round27_english_quadgrams.txt`).

**p0–p2 map: 8 valid candidates**

| Key mapping / direction | Phase | Literal F positions | Mean quadgram score | IoC |
|---|---:|---|---:|---:|
| Raw index, down | 1 | 25, 41 | **−15.0642884** | 0.034595 |
| Raw index, down | 1 | 15, 41 | −15.3102623 | 0.033874 |
| φ(GP prime), down | 0 | 41 | −15.4012964 | 0.035315 |
| Raw index, down | 1 | 15, 25 | −15.4273081 | 0.032072 |
| φ(GP prime), up | 0 | 15, 25 | −15.7156794 | 0.032432 |
| Raw index, up | 0 | 15 | −15.7549799 | 0.035315 |
| Raw index, up | 0 | 25 | −16.0602863 | 0.035315 |
| Raw index, up | 0 | 41 | −16.3765185 | 0.030991 |

**p32 map: 5 valid candidates**

| Key mapping / direction | Phase | Literal F positions | Mean quadgram score | IoC |
|---|---:|---|---:|---:|
| GP prime mod29, down | 3 | 15 | **−15.7676520** | 0.037838 |
| φ(GP prime), down | 0 | 41 | −15.7699083 | 0.043964 |
| GP prime mod29, down | 3 | 25 | −15.8780116 | 0.039640 |
| φ(GP prime), down | 0 | none | −16.0008193 | 0.041081 |
| Raw index, up | 3 | 41 | −16.5104781 | 0.030631 |

The p0–p2 map's best output is:

```text
RDOAEMEPSEAGYEAOLEAMEIAYXEPIWFWOETHNNGYAENGJSEABEEFEOJYGEALTHNGSWXHUIALGAWMONGUEORIISEIOEJEATH
```

The p32 map's best output is:

```text
WTLTHWWTHIAAEWRCEAGFOETWOENBEASIYACJLOENGETEDTAEEMOBAEEWODSNPTHAETHXAEPPDEAEOPWNGIPNCBTJRGOEWGE
```

Neither is coherent GP-native plaintext. The p0–p2 candidate's modest score improvement is the best of 96 postulated combinations and remains far below clear p57. The p32 map's best score is **worse than untouched p55**. No GP-prime-mod-29 variant for p0–p2 survives the plaintext-F consistency condition; the p32 survivors are listed above.

A synthetic 76-rune p57 plant encrypted and decrypted under every edge/key representation and every tested clock passes exact recovery, including the transparent-F skip semantics (30 positive controls). Thus the negative is not an implementation failure.

## Decision and limits

Reject the direct **map east-edge repeating key + p56-style transparent-F** model for p55 under these six fixed key mappings and five source-motivated clocks. This does not reject a different eastward traversal, the external three-rune-node decoder, a non-Vigenère use of either map, or a key/state derived from another independently authenticated source.

The φ-of-GP-prime mapping is not the authentic p56 consecutive-prime key stream; it is an explicitly tested candidate mapping of edge runes. Likewise, continuous phases assume no earlier F skips. Neither assumption is promoted to fact.

## Distinct original GP28 anti-repeat consumer: two untouched follow-on chapters (Agent10, 17 November 2026)

The prior direct p3 test used ordinary modulo-29 Vigenère. That operation alone cannot explain the original manuscript's very low adjacent-equal-rune rate. A separate executable proposal uses the same east-column key but **a fully invertible anti-repeat receiver**: for each output rune after a first public-IV rune, assign the 28 GP rune values other than the preceding ciphertext rune to rank 0–27. A repeated ciphertext rune represents exactly GP plaintext index28 (EA), so all 29 plaintext symbols are represented. This receiver explicitly explains how literal repeats could survive without losing information.

Two fixed, natural rankings of permitted successor runes are tested: the original GP index order with the predecessor skipped, and cyclic order starting one glyph after the predecessor. The unmodified 27 east-edge GP indices are mapped to the **raw indices**, **GP primes**, or **prime totients**; each key value is reduced modulo28. The unknown receiver addition is checked in both directions. The repeated-output EA marker either consumes a key tick or does not, since the source does not specify its treatment. All **3×2×2×2 = 24** variants are frozen before reading the original receivers. No fitted start phase, trial location, word-level exception or language-targeted key is used. The first rune of each independent chapter is passed through as its own public IV.

| Original receiver | Rune count | Cipher IoC | Highest IoC in 24 source-fixed inverses |
| --- | ---: | ---: | ---: |
| First consecutive illustrated chapter p3–7 | **1,145** | **0.0346337069** | **0.0357605277** |
| Independent next illustrated chapter p8–14 | **1,729** | **0.0344604835** | **0.0355281901** |
| Actually clear and independently readable p57 | **95** | **0.0627099664** | Not altered |

The p3–7 leading candidate uses **prime totients, cyclic successor order, subtraction, and EA events that do not advance the key**. Its first 38 decoded runes transliterate as `L S A TH A OE B AE EO EO OE A G W U A N A AE P C B EO F B E OE H B NG B M L M Y F X T`, with no recognizable prose. Even its IoC remains close to the uniform GP29 baseline 1/29. The independent p8–14 receivers similarly remain nearly uniform under all 24 variants, including the highest-IoC one, so this result does not select a plausible shared decryption rule.

The [read-only, Windows-compatible standalone SFT](../sims/lp2_p0_east_gp28_successor_inversion_sft.cjs) additionally synthesizes a **1,145-rune native-p57-derived message with five inserted EA markers**, encrypts it in all 24 complete receiver configurations, and recovers all 1,145 plaintext symbols exactly in every case. The 24/24 recoveries were independently executed on the exact original source in the connected research runtime. Thus an invertible receiver and explicit candidate key do exist and work as implemented; **they do not unlock original LP2 p3–14**. The corresponding manual Node22 workflow is `.github/workflows/agent10-east-gp28-manual.yml`.

This distinct trial is motivated by the external, unauthenticated phrase “east of the map” and the authentic original adjacent-doublet deficit. Its negative cannot exclude a different east-key derivation, a nonperiodic changing key, independently keyed pages, unfamiliar plaintext register or a creator-specified cipher that does not rank predecessor-avoiding successors. Stop treating the map east edge alone as a reproducible key for these two receiver families; a genuine new clue is needed to motivate another consumer.

## All-secret 27-phase successor tableaux: native-GP equality invariant

The fixed-key inverse above checks a transparent 27-rune key read as numbers. A materially stronger, **key-independent** question is whether the printed 27 eastern positions select **27 entirely unknown, separately keyed 28-symbol substitution alphabets** after the same reversible predecessor-exclusion GP28 receiver. This grants all `(28!)^27` secret alphabet schedules, rather than guessing 24 additive variants.

For original successive ciphertext runes, decode the public numeric- or cyclic-sorted **28 eligible successor ranks**. A repeated ciphertext rune is the reserved `EA` index28. The key phase advances at every noninitial rune, or only on a nonrepeated rank, in two explicitly separate clock conventions. At clock phase `t mod27`, the hypothetical phase-specific hidden alphabet `π_t` maps native GP29 plaintext indices 0–27 bijectively to observed successor ranks. For every phase the **number of equal-symbol pairs** in its ciphertext rank histogram is therefore *mathematically identical* to the number in its unknown plaintext histogram: an arbitrary secret alphabet merely renames its 28 output symbols. No secret key needs to be fitted or disclosed for that invariant to hold.

Use the independently authentic, **already-solved Cicada LP1+p56+p57 GP-native rune corpus** (2,979 actual runes, joining its nine solved source sections) as a primary register comparator; independently use the repository's **204,802-rune, word-preserving Latin Vulgate New Testament GP29 reference** as an alternative historical-language comparator. The first 1,145 native runes match the first untouched p3–7 chapter length; the next 1,729 match independent p8–14. Use the same independently preselected window lengths for Latin; neither comparator is tuned to the original text. All observed repeated-source runes and candidate reserved native EA positions are omitted from the nonreserved 28-symbol histogram exactly as the model prescribes. The eight frozen original/native pairwise collisions are:

| Receiver and phase clock | Original p3–7 collision IoC | Solved-native p3–7 | Original p8–14 | Solved-native p8–14 |
| --- | ---: | ---: | ---: | ---: |
| Numeric-sorted, full clock | 0.03411614 | 0.06329277 | 0.03503202 | 0.06226014 |
| Numeric-sorted, skip repeat | 0.03484946 | 0.06352064 | 0.03625731 | 0.06313809 |
| Cyclic-sorted, full clock | 0.03522630 | 0.06329277 | 0.03699991 | 0.06226014 |
| Cyclic-sorted, skip repeat | 0.03715567 | 0.06352064 | 0.03378817 | 0.06313809 |

The second, historically plausible **Latin** register independently strengthens the same objection. For all eight original rank/clock combinations, the profile of the corresponding actual Latin GP29 source passage is **0.07193555–0.07445503**, also far above the entire original **0.03378817–0.03715567** span. Its exact four unique original-window counts are p3–7 full-clock **3,484/47,250**, p3–7 skip-clock **3,518/47,250**, p8–14 full-clock **7,804/108,486**, and p8–14 skip-clock **7,922/108,486**. The register is a specific historical Latin source, and the test does not rule out all other languages or artificial plaintext.

For example, the **p3–7 numeric/full** original has exactly **1,598 equal ordered rank pairs of 46,840**, whereas native author prose in its matching 27 phase strata has **2,954/46,672**. In the **p8–14 cyclic/skip** original there are **3,640/107,730**, whereas native prose has **6,778/107,352**. These differences cannot be altered by any of the `28!` independent bijections at each of the 27 phases. The original is near the independently uniform baseline 1/28; authentic solved GP prose has substantially more repeated symbols inside the same phases.

This all-key test also contains a **strict positive**: assign a distinct, deterministic secret random bijection of 28 symbols to each of the 27 phase positions and encrypt actual solved-source native GP runs with the previous-cipher anti-repeat emitter. In all eight chapter/rank/clock combinations for **each of the two independently preselected registers**, the source-length synthetic ciphertext inverts **every GP plaintext rune** exactly, including the EA repeated-rune escapes, and reproduces the source-native or Latin collision counts *bit for bit* under its actual secret bijections. The original fails while the genuinely keyed positive preserves the asserted invariant. The original source and solved GP comparator were executed directly with the committed reproduction code in an independent runtime.

**Decision:** a static 27-phase independently unknown **bijection-only** rank28 tableau is inconsistent with the tested source-native register on both untouched original chapters, regardless of its 27 secret alphabets. This is a much stronger conditional exclusion than all 24 direct key representations; it does **not** exclude independently changing row tables after every rune, different source plaintexts, encrypted/resegmented word divisions, nonbijective or state-dependent output, irregular non-source-selected phase clocks, or another cipher layer. The p0–2 27×27 map and its east instruction remain unauthenticated hypotheses, and no original LP2 plaintext is recovered.

**Exact source-dependent reproducer:** [`sims/lp2_p0_east_gp28_27phase_allsecret_sft.cjs`](../sims/lp2_p0_east_gp28_27phase_allsecret_sft.cjs). It freezes both original chapter lengths, the 27 source edge values, all eight original and solved-native histograms plus all eight Latin counterparts, **16/16** all-secret hidden-table plants and exact inverse recovery of **22,992** planted rune slots.

## Reproduction

From the repository root:

```sh
node sims/lp2_p0_2_east_edge_p55_key_gate.cjs
```

The script reads the canonical corpus and pinned 79,495-entry quadgram file, asserts both map edges, p55 F positions, all source clock arithmetic and valid/invalid masks, prints all thirteen surviving strings, and verifies 30 source-native synthetic positive controls.
