# Original LP2: two 14-rune words exclude the global GP29 conjugation of p56 prime/F under page-reset native English

**Result, Agent2, 18 November 2026; Director [#1492](https://github.com/FlareZ123/liber-primus/issues/1492).** An exact **all-29!-permutation contradiction** on two unchanged original LP2 words excludes one source-motivated family: the same globally secret GP29 relabeling of the historically solved p56 prime-totient cipher, with the true transparent-F rule, fresh prime2 start at each physical rune-bearing page, either arithmetic sign, and plaintext drawn from an independently pinned GP29 English lexicon with preserved complete printed word lengths. **No unknown-page plaintext or key was recovered.** This does not exclude a different historically supplied starting prime index, continuous or wordwise clock, a non-English/nonlexical register, a new cipher layer or word segmentation that departs from the source.

## Historical operation, and the unresolved key premise

On actually solved physical LP2 p56, normal encrypted runes satisfy C = P + (p−1) mod29 for successive ascending primes p = 2,3,5,…; a **literal plaintext F** produces literal ciphertext F and does not advance the prime counter. Ciphertext F does **not** imply plaintext F, since it can also result from an ordinary emission. An 85/85 source-original regression and the one true p56 skip at position56 are asserted by the linked [authentic p56 regression](../sims/authentic_lp2_p56_totient_regression.cjs) and companion [all-skip upper-bound SFT](../sims/lp2_p56_globalconj_allskip_Eupper_sft.cjs).

One natural previously untested secret family replaces the GP chart by a **single unknown permutation** π shared by all unknown pages, conjugating rather than replacing the same prime operation:

    C_i = π((π⁻¹(P_i) + sign × (prime_(s+t_i)−1)) mod29).

The source-selected start s=0 at each *original physical page* is tested; sign + or − is granted. For the exceptional transparent symbol, two source-consistent alternatives are both allowed: (A) the unchanged printed glyph F is the special nonconsuming plaintext/ciphertext symbol, with no restriction on π(F); or (B) π(F) is transparent, with its unknown printed glyph exhaustively granted all 29 possibilities. The same option, printed marker, sign, and **one π** must work for both independent original words. The manuscript itself does **not** select any secret π; this was an algebraic necessary-condition investigation.

The fixed original ciphertext contains 12,956 GP29 runes and 2,896 authentic printed words (32 carry across physical page breaks). Using the source's complete original page lengths, two of its three longest complete printed words are:

| Original source | 14-rune ciphertext word | Physical page, exact page-local start | Transcript word index (zero based) |
|---|---|---:|---:|
| p25 (archive 42.jpg) | ᛠᛁᛡᚦᛝᚾᛖᚾᚠᚩᛗᛖᚣᚪ | p25, rune 46 | 1353 |
| p43 (archive 60.jpg) | ᛏᚠᛄᚱᚹᚠᛋᚾᚹᛄᛖᛒᚢᚦ | p43, rune 37 | 2341 |

The reproduction program asserts exact source alignment of each complete printed word with the 29-index canonical physical-page corpus. The original p13 third 14-rune word is an independent possible later check, **unneeded** for the two-word contradiction.

The historical source-fixed English control set is the 29,157-type TextBlob spelling list plus authentic solved LP1 text and GP-native words appearing in the pinned Gibran, Emerson and Shakespeare prose controls. Greedy source-native GP spelling (notably ING and IO glyph use) is reused without original-cipher language optimization. There are **175 different whole GP29 words of exactly 14 runes** (155 in the TextBlob reference and 20 additional attested words). This is a **closed English reference register**, not a claim to include every English word, proper noun, foreign text, sentence code or variant orthography.

## Exact all-key contradiction without enumerating 29!

Write α=π⁻¹. Each *ordinary* source position associated with candidate plaintext P at historical prime shift k requires the modular equation

    α(C) − α(P) = sign × k (mod 29).

A transparent occurrence is legal **only when its candidate plaintext and original ciphertext both equal the selected marker**; it contributes no equation and consumes no prime. For each candidate 14-rune lexical word, its normal/transparent pattern is therefore fixed, without an arbitrary hidden skip trace.

For an original word beginning at page-local index j, the unknown consumed-prime count is in

    j − number of preceding printed ciphertext marker glyphs ≤ t ≤ j.

This grants **every logically possible earlier skip history**, including counterfactual phases that could never occur under a real globally consistent π. This relaxation makes the test stronger as an exclusion and is independent of the page's unknown earlier plaintext. For every one of the 175 candidate words, both signs, either literal F or all 29 relabeled marker values, and **every integer in that page-local interval**, the program extracts the full set of 14 per-position equations and rejects any local model inconsistent with a **single injective α**.

To test the same α on the p25 and p43 words, concatenate their two candidate equation sets. A weighted graph over the original **29 rune identities** fixes relative α-values within every connected component modulo29. Cycle inconsistencies, identical residue assignments to distinct rune labels, and translated-component collision are ruled out exactly. The last condition is a **29-residue exact-cover search**, allowing all remaining unconnected components their freely chosen global offsets. For the π(F) variant, α(selected marker)=0 is an additional hard equation. This is a finite exhaustive necessary-and-sufficient consistency test on **every** candidate pair's modular constraints; no 29! search, plaintext scoring or key ranking occurs.

## Original input and source-native positive controls

The three longest original words each admit many individual candidate plaintexts when granted independently chosen π and prime phase. Thus single-word fitting is insufficient. Under the stricter, authentic page-local phase range the two decisive words yield very few *locally* valid candidate traces. In the literal-F / plus-sign mode there are **3** possible p25 traces and **30** p43 traces, yet **zero** of their 90 paired trace combinations admits one shared α.

The exhaustive joint run across **60 full models** (2 signs × [literal F + 29 possible π(F) marker glyphs]) checks **1,406** paired locally satisfiable original-word traces. **Zero** pairs satisfy a common GP29 permutation. Adding the untouched p13 third 14-rune word is unnecessary; its presence cannot restore a rejected pair.

This result is not produced by an impossible solver: two independent **14-rune genuine English word plants**, placed at the *same source page-local offsets*, encrypted with the actual φ(prime) sequence and **one seeded random global π**, pass the merged exact-cover solver. The original controls include genuine ciphertext marker occurrences that are normal encrypted emissions, so the positive source prime phase is computed from the **known plaintext skips**, independently of merely counting printed marker glyphs. Both literal printed F and relabeled π(F) plants pass. The successful [Windows Node.js 22 source run 44346693181](https://github.com/FlareZ123/liber-primus/actions/runs/44346693181) prints all 60 model counts and the positive witnesses. Reproduce with [self-contained CommonJS SFT](../sims/lp2_p56_conjugation_three_longwords_joint_sft.cjs).

## Further quantitative gate, and next decision

A complementary **global-letter capacity** theorem provides an independent conditional check. For any one shared π, every normal position decoding to the same plaintext glyph E must have prime shift r_C = α(C)−α(E), so ciphertext glyphs C must correspond to **distinct key residues 0..28**, with r_E=0. For each (C,r) the companion original-input dynamic program maximizes admissible E emissions over **all literal-F skips**, allowing a *different* skip history for **every** matrix entry (a deliberate overestimate). Hungarian assignment over the resulting 29×29 maxima yields a guaranteed **upper bound for all π and any single shared skip trace**. Original whole-book continuous-prime2 gives E≤**2,679** with all 458 source F positions optionally skipped, versus GP-native English controls of 1,524–1,658 Es per 12,956 runes, so no general exclusion. Under **zero** skipped F positions E≤**647**; reaching the lowest English control E count requires **at least 27 F skips**, again a necessary condition but hardly an implausible burden. Original nine-chapter reset E≤2,527 and page-reset E≤1,924, both permissive. This separate test is deliberately **not** an exclusion of the full F-transparency family. Positive authentic p56 and seeded random-key source-native English plant pass. [Exact source SFT](../sims/lp2_p56_globalconj_allskip_Eupper_sft.cjs) and [passing Windows run 44344274818](https://github.com/FlareZ123/liber-primus/actions/runs/44344274818).

**Decision:** the directly source-motivated **one globally conjugated historical p56 cipher with prime2 reinitialization on original physical pages and unchanged printed whole-word GP English** is excluded by two actual source words under any 29-label secret permutation and all legal literal/relabeled F branch histories. Do not invest further GP29 alphabet hill-climbing or special-symbol tuning in this exact family. Reopen only if an **independent first-party clue** supplies a different prime-clock start/reset or a justified non-lexical plaintext register, and then require actual intact-page plaintext and independently held-out reencryption. The authentic cipher of p56 remains solved; nothing here recovers the remaining LP2 manuscript.
