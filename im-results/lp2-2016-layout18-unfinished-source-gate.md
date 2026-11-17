# Original 2016 layout-number cipher signs: independent remaining cases

**17 November 2026, Agent39; experiment in progress.** The source-selected hypothesis is that the signed Cicada 2016 phrase “their numbers are the direction” encodes an additive-key sign or pointer direction from the *physical position of each rune in the printed page*. The phrase does not name any of the finite rules, so all are conditional hypotheses. The pnotisdev 2016-layout engine and the preexisting controls were built before this investigation; four full search rules had already been run. This report records a new exact redundancy and the genuinely unfinished experiment without claiming unknown LP2 plaintext or success.

## Original source and sole existing 23-rule definition

Pinned external engine: [pnotisdev/cicada3301 at 15200c67abee106913ba01ff504c5b6e88d16cc7](https://github.com/pnotisdev/cicada3301/tree/15200c67abee106913ba01ff504c5b6e88d16cc7/work/kscreen); exact rule definitions `work/kscreen/layoutrules.py` and published `layout_rules.txt`. The original 2016 message is signed and mentions words/maps/numbers/direction, but does not give a specific sign rule or identify a key stream.

The historical independent `work/ref/lp_verified.txt` (Git blob `c33c2540d1a8c42426ac193276fd6d02f74a75e6`) and this repository's canonical `resources/liber-primus/lp2-corpus.json` (blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`) agree **exactly at all 12,956 original unknown-page GP29 rune indices**, including the 9-rune bridge and 55 rune-bearing physical pages. The external layout extraction preserves source-visible physical breaks and outputs eight long original section windows of lengths **729, 1145, 1729, 1894, 1021, 1524, 1589, 3316**, together 12,947 runes; the ninth known 9-rune bridge is too short for that historical full-window screen. This equality is a direct ordinal comparison, not a new cipher result.

All 23 source rules were predefined: `Pa_par, Ps_par, Ln_par, Ls_par, Po_par, PL_xor, Pg_half_runes, Pg_half_lines` and three phase variants each of `Pa_m3, Ps_m3, Ln_m3, Ls_m3, Po_m3`. The original source `results/kscreen/layout/` contains complete screens and verify reports for only `Ln_par, Ls_par, PL_xor, Po_par` and one corresponding matched null. These four already failed whole-window verification and are **not** being rerun.

## New exact source-operator collapse: 19 unfinished files, 18 unique sign families

Two of the proposed page-parity rules are **algebraically equivalent for the existing screen**. Within each original 2016 section, the external source defines `page_abs` as the page counted globally and `page_sec` as the page counted since this section began. Therefore `page_abs = page_sec + c_section` for a constant integer c throughout that section. With `par(q)=+1` for even q and `−1` otherwise,

`Pa_par(i) = (−1)^c_section × Ps_par(i)`.

The published screen separately tries both GP29 key multipliers **1 and 28 = −1 mod29 on each section window**. Consequently **every ciphertext/key/offset/model candidate in one page-parity rule is present under the other**, with the sign multiplier flipped if c is odd. This is an exact source-and-algorithm identity on each full section, not a statistical approximation. Actual eight long-window parity orientations are `[+,-,+,+,-,-,+,+]`. Scanning `Ps_par` repeats `Pa_par` completely and supplies zero new search coverage. Hence **18** rather than 19 independent unfinished sign-rule screens.

A separate first-300-rune equivalence was also computed on the eight authentic long windows: `Pa_par, Ps_par, Ps_m3_0` have identical **screening** sign vectors up to a global sign on each window, while `Ps_m3_0` differs over full windows. It remains distinct for an independent whole-window inverse, and so is retained. All other original 300-rune signatures are distinct up to global inversion: **21 distinct screen signatures among the 23 raw rules and 22 complete-window signatures**.

## Fully specified original-input historical-key direct inverse (separate bounded decision)

The exact original-source CJS [historical-key inverse](../sims/lp2_layout_23rules_two_historical_keys_noskip_sft.cjs) tests **both** creator-used 2014 LP1 keyword spellings, `DIVINITY` (GP indices `23,10,1,10,9,10,16,26`, with historical V written U in GP) and `FIRFUMFERENFE` (`0,10,4,0,1,19,0,18,4,18,9,0,18`), over **every one of the 23 source-defined sign masks, both arithmetic orientations, and every key phase**, independently on all eight long original unknown sections. This is a direct no-skip periodic GP29 additive inverse `P_i = (C_i - sign × layout_i × K_(i+phase)) mod29`. The key materials and source sign functions were fixed independently of the unknown output; all key phases are exhaustively allowed to avoid an assumed reset. The script checks exact 12,956-rune corpus equality, reproduces 21/22 collapsed 300/full signatures, and plants/inverts an exact 380-rune GP-native clear-p57 positive.

The best **whole-section** IoC for each source window, even selecting the most favorable phase/sign/rule separately per window, is:

| Historical source key | p0–2 (729) | next (1,145) | next (1,729) | next (1,894) | next (1,021) | next (1,524) | next (1,589) | final (3,316) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `DIVINITY` | 0.03532236 | 0.03519559 | 0.03481594 | 0.03493223 | 0.03537094 | 0.03523833 | 0.03486026 | 0.03474938 |
| `FIRFUMFERENFE` | 0.03548817 | 0.03498641 | 0.03492907 | 0.03500531 | 0.03535749 | 0.03499448 | 0.03486501 | 0.03475484 |

For comparison the native GP29 clear p57 IoC is **0.06270997**, and random-like baseline is about **1/29 = 0.03448**. No whole-section output exhibits ordinary native GP29 prose concentration, even after a generous maximum over all prescribed parameters. These are computed original-input outputs, not inferred from a search log; [manual Windows execution](https://github.com/FlareZ123/liber-primus/actions/workflows/lp2-layout-two-historical-keys-sft.yml) provides an additional end-to-end test. This **rejects only the explicit direct periodic no-skip model** using these two historically known keywords. It does not reject the authentic p56 prime/F skip operation, the source original skip/coin layout campaign below, different key material, or independently authored nonadditive transformations.

## Exact all-secret 8/13-rune periodic key inversion across every physical sign

The literal historical-key inverse above assumes the actual key values are spelled in the surviving 2014 LP1 passwords. The stronger and distinct test here grants **every possible secret 8-symbol and 13-symbol key**, allowing a key unrelated to either historical password. Eight and thirteen are still source-motivated period lengths: the GP-index forms of the actual Cicada 2014 keys `DIVINITY` and `FIRFUMFERENFE` have those lengths. Nothing in the signed 2016 direction clue authenticates a *periodic* key, a physical-layout sign choice, or a substitution of other secret values.

For the direct, reversible **skip-free additive** rule `P[i]=(C[i]−s[i]K[i mod L]) mod29`, use every one of the source's 23 complete printed-layout signs `s[i]`, a fresh wholly secret key independently per original long section, all phases, and either arithmetic direction. Across **all `29^8` or `29^13` possible secret keys**, the exact best independent-GP-English-unigram score is computable without key enumeration. For each phase `j`, summarize the original ciphertext by two 29-bin histograms `h[j,+,c]` and `h[j,−,c]`, partitioned by the original physically derived sign. If `l(x)=log(29×Pr_GP-English(x))`, the maximum per rune is exactly

`M_L = (1/N) × Σ_j max_{k=0..28} Σ_c [h[j,+,c] l(c−k) + h[j,−,c] l(c+k)]`

with GP indices taken modulo 29. Each secret key position affects just one phase, so taking each independent 29-way maximum is an **exact global optimum**, including the apparently impossible `29^13` candidate family. A global ± decryption direction and any key starting phase are absorbed by the unconstrained secret key values. The unigram model is fixed from **62,696 GP-native runes of Gibran** and checked against an entirely separate **217,644-rune GP-native Shakespeare** source, with the known `ING` glyph contraction and documented GP orthography. Larger scores are more ordinary-English-like; zero is uniform-reference likelihood parity.

Original results below are **the best score over all 23 physical sign rules and every secret key**, selected separately and maximally favorably in each of the eight original long sections. Nine original printed sections include one 9-rune bridge; that bridge is excluded from meaningful language scoring, while the combined **12,956 original runes are explicitly asserted** against the canonical corpus before running. The source-short-period upper bounds are:

| Original window | Runes | Best GP-English logLR/rune, secret period 8 | Best, secret period 13 |
| --- | ---: | ---: | ---: |
| 0 (p0–2) | 729 | **−0.476728** | **−0.385476** |
| 1 (p3–7) | 1,145 | −0.555171 | −0.442496 |
| 2 (p8–14) | 1,729 | −0.644202 | −0.570109 |
| 3 (p15–22, excluding the nine-rune bridge) | 1,894 | −0.631477 | −0.569721 |
| 4 (p23–26) | 1,021 | −0.513569 | −0.433271 |
| 5 (p27–32) | 1,524 | −0.589810 | −0.552471 |
| 6 (p33–39) | 1,589 | −0.604104 | −0.575998 |
| 7 (p40–55) | 3,316 | **−0.701033** | **−0.644265** |

The independent Shakespeare GP-native reference has mean logLR **+0.418329** over its first 12,000 runes. As a stricter positive tied to the creator's own style, **original clear p57 (95 source runes) scores +0.448402**, whereas the **85 still-encrypted original p56 runes score −0.988557** under this same fixed model; the SFT asserts both source-native controls. The p56 *known plaintext* is deliberately not substituted for the original p56 ciphertext. In deliberately blind source-layout positive plants, the independent Shakespeare corpus is encrypted with the actual source `Ln_m3_1` sign vector and an unknown-to-inverse 8- or 13-symbol 2014-length key. The exact maximizer recovers **every symbol of the hidden key** and **all original-shaped plaintext glyphs** in each tested window, with positive native scores. Thus the negative original result cannot be attributed to a key search stopping early, using the wrong original physical line positions, or a high-entropy secret that a fixed-password test missed.

**Decision:** This is a strong finite exclusion of ordinary native-GP English under any secret periodic **8- or 13-rune direct additive key** combined with any of the 23 original page/line/position signs, even where each section has an unrelated secret key. It does **not** cover the anti-repeat skip/coin rule used by the still-open historical 581-key campaign, a variable-length keystream, F transparency, alternate plaintext register, or a nonadditive transformation. No genuine LP2 plaintext or key has emerged. The [single-file Windows/CJS source-native reproducer](../sims/lp2_layout_23rules_allsecret_8_13_sft.cjs) and [manual-only Windows regression](../.github/workflows/lp2-layout-allsecret-shortperiod-sft.yml) preserve all source inputs, exact optimizer, 23 original masks and 16 independent planted recoveries.

## A stronger, language-model-free frequency ceiling even under arbitrary secret GP29 alphabet permutations

The previous exact 8/13-key result assumes the 29 Gematria Primus symbols have their ordinary linguistic identities when scored. A stronger information-theoretic necessary condition is available **without knowing the key, any rune-to-letter correspondence, or an English language model**. Preserve only the source-selected physical class of each original rune: its index modulo a historical key period (8 or 13) and the sign given by one of the **same 23 original source-layout rules**. Then grant the decipherer a fully arbitrary, independent and secret **29-symbol bijection for every (period phase, physical sign) class**, amounting to up to 16 or 26 independent full alphabet permutations per chapter. This strictly contains every direct signed GP29 Caesar-key decoder considered above and is vastly more permissive than any shift key or one global substitution alphabet.

For each of the 2L original physical classes, count source ciphertext occurrences of all 29 rune values and **sort each class's 29-bin histogram in descending frequency order**. Add all these sorted histograms by rank to obtain counts H[r]. The exact **maximum** achievable plaintext index of coincidence, over every independent class-specific permutation, is

\`IoC_max = Σ_(r=0..28) H[r](H[r]−1) / (N(N−1))\`.

This is an attained global maximum, not a heuristic: the rearrangement inequality shows that any two class histograms have largest inner product when their ranked frequencies align. Sorting every class the same way realizes every pairwise upper bound simultaneously. This also covers any final **global** alphabet substitution, since IoC is permutation-invariant. No dictionary was used to select a candidate.

The original results below maximize over all **23** source-fixed physical signs, independently for each chapter and historical period. They use the exact unedited original GP29 ciphertext and source line/page layout, including physically wrapped words. The author's own long **original LP1 clear section THE LOSS OF DIVINITY**, 755 unmodified GP29 runes in master segment 4, has **IoC 0.061215241**; independently, solved p57's **95 original clear runes have IoC 0.062709966**. These two source-native positives offer an authentic same-author frequency benchmark, including an LP1 text comparable in length to the 729-rune p0–2 unknown chapter. Values below both reference concentrations cannot recreate either benchmark's one-rune frequency concentration within this enormous class of reversible decoders, even with adversarially selected secret alphabet permutations.

| Original ciphertext section | Runes | Max IoC, any 16 signed-period-8 secret permutations | Max IoC, any 26 signed-period-13 secret permutations |
| --- | ---: | ---: | ---: |
| p0–2 | 729 | **0.053965239** | **0.067170141** |
| p3–7 | 1,145 | 0.047303570 | 0.054495068 |
| p8–14 | 1,729 | 0.043077780 | 0.047246856 |
| p15–22 excluding 9-rune bridge | 1,894 | 0.042896884 | 0.046685644 |
| p23–26 | 1,021 | 0.048971596 | 0.057738472 |
| p27–32 | 1,524 | 0.044154116 | 0.049736930 |
| p33–39 | 1,589 | 0.043513894 | 0.048769643 |
| p40–55 | 3,316 | **0.039311933** | **0.041800348** |

### Exact required periodic-class complexity to match authentic long LP1 cleartext

The same rearrangement bound supplies a **conditional minimum period** for each original unknown chapter, without limiting the secret alphabet to Caesar shifts. Set the reference target in advance to the independently known **755-rune original LP1 THE LOSS OF DIVINITY IoC = 0.061215241**. For each unknown source section, examine every integral period **starting at 1** and, at that fixed period, grant 29! independent key permutations for **both sign states in every phase**, across every one of the same 23 source-derived physical sign masks. The first period where the **absolute maximum possible** output IoC reaches or exceeds that fixed authentic English reference is:

| Unsolved source section | First potentially sufficient period | Source sign attaining first crossing | Attainable IoC at crossing |
| --- | ---: | --- | ---: |
| p0–2, 729 runes | **12** | Pg_half_lines | 0.063239572 |
| p3–7, 1,145 runes | **17** | Po_m3_2 | 0.061662137 |
| p8–14, 1,729 runes | **28** | Pg_half_runes | 0.062431721 |
| p15–22 (without nine-rune bridge), 1,894 runes | **28** | Po_par | 0.061334177 |
| p23–26, 1,021 runes | **16** | Ln_par | 0.061222177 |
| p27–32, 1,524 runes | **23** | PL_xor | 0.061281695 |
| p33–39, 1,589 runes | **26** | Ln_par | 0.062055251 |
| p40–55, 3,316 runes | **51** | PL_xor | 0.061836482 |

Therefore, for example, **every direct alphabet-permutation cipher of period at most 50**, with any of the 23 original physical sign rules and independently chosen section keys, has a **strictly insufficient one-rune frequency capacity** to reproduce the author's known long LP1 reference concentration on the 3,316-rune p40–55 section. This statement encompasses any unknown sequence of Caesar key symbols as a strict subset and any final global rune-alphabet permutation. It is a *necessary capacity condition conditional on that reference IoC*, and is not evidence that Cicada selected a 51-symbol key, that every English paragraph must have the same IoC, or that nonlocal transpositions and anti-repeat or F-transparent clocks fail. The first-crossing periods are algorithmically determined bounds rather than hidden numbers discovered in the manuscript, and must not be promoted to source-selected keys. The accompanying SFT checks every integer period below each crossing explicitly against original ciphertext and asserts these first-crossing values.

**Decision:** Even arbitrary alphabet substitutions per physical sign and per historical short-key phase cannot reproduce the observed frequency concentration of authentic original clear LP1 section4 **or** solved p57 in **all eight period-8 windows and seven of eight period-13 windows**. The p0–2 period-13 bound of **0.067170141** remains above the chosen solved reference and cannot be excluded on this criterion. IoC is only a necessary distributional feature of ordinary GP29 English; neither the 95-rune p57 sample nor the 755-rune original LP1 clear section supplies a **universal lower bound** for every possible passage or language, and some legitimate passages can have less concentrated symbol frequencies. Consequently this is a rigorously exact **capacity bound** for a massive direct, per-class substitution family, rather than a proof about the actual author language, an unknown F-transparent/skip-key system, a changing key-state model, or a layered nonlocal transposition.

The [same all-secret source-native Windows CJS reproducer](../sims/lp2_layout_23rules_allsecret_8_13_sft.cjs) now computes both the earlier optimum logLR and this independent exact frequency ceiling. It checks the original physical source, original p57 positive reference, original p56 encrypted reference, and native-Shakespeare blind cipher plants that must remain at or under the mathematically derived ceiling. A completed regression is required before treating those code assertions as externally verified.

## Authentic historical keyword pointer walk (six printed-layout direction conventions)

The signed 2016 “direction” instruction also motivates a **reversible pointer-motion** cipher in place of a key-value sign: the source-defined line/page/position quantity determines the key pointer's direction **for each complete original printed word**, while the historical 2014 key material supplies the consumed rune values. The fully independent [actual original-input pdir inverse](../sims/lp2_layout_pdir_2014keywords_noskip_original_sft.cjs) reads all 12,956 unchanged rune values and original word boundaries, including words spanning line/page wraps, and runs the six distinct source-published direction conventions that remain in a no-skip decoder: first-read `h=0/1` × interword motion `m=0/oldDirection/newDirection`. It tests every original 23 layout-word direction rules, pointer orientation ±, arithmetic sign ±, every cyclic phase, and both authentic 2014 GP-key spellings. The third pointer convention `c` controls only repeat-triggered skip/coin behavior and is algebraically irrelevant in this explicitly skip-free model.

This yields **92,736 independently specified key/rule/convention cells** on the eight long original sections (23 × six × two pointer orientations × two arithmetic signs × sum of key phase counts (8+13) × eight sections). All candidates are decrypted to complete native GP29 sequences. Their **maximum whole-section IoC**, allowing an overly favorable independent best parameter per section, is:

| Historical key | p0–2 | p3–7 | p8–14 | p15–22 | p23–26 | p27–32 | p33–39 | p40–55 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `DIVINITY` | 0.03564268 | 0.03578954 | 0.03519215 | 0.03497072 | 0.03548616 | 0.03514613 | 0.03522882 | 0.03482726 |
| `FIRFUMFERENFE` | 0.03566906 | 0.03562311 | 0.03534477 | 0.03511185 | 0.03570125 | 0.03516854 | 0.03543410 | 0.03486692 |

The exact independent direct-pointer experiment was executed on original GP-index source data without language-based parameter fitting. A source-native p57 380-rune clear GP positive, independently encrypted by several of the actual pointer conventions, inverts exactly, showing the inverse is sensitive when the hypothetical model is planted. No original whole-window candidate resembles natural native-GP plaintext (clear p57 ≈0.06271). This closes **only** periodic literal-2014-key, skip-free direction-pointer variants. The actual pnotisdev skip/coin and source-key-library searches still matter: a keyless repeat-suppression step can alter pointer positions and cannot be dismissed by this subset.

## Authentic p56 prime-totient/F cipher with source-original physical layout signs: exhaustive opening-729 inverse

A stronger decryption gate retains the genuinely **solved p56 cryptographic operation**, including its asymmetric key-consuming encrypted non-F symbols and **plaintext-F transparency**. It supplements the established `C=P+φ(prime) mod29` with one of the **23 already published original physical page/line/position sign masks**, both arithmetic signs, and any of **5,000** starting prime-totient indices. The first original unknown visual chapter p0–2, **729 uninterrupted authentic GP29 ciphertext runes**, provides an exact legally-decodable holdout beyond the earlier plain unsigned p56 all-start no-go.

The [deterministic no-beam original-input inverse](../sims/lp2_p56_phi_layoutsign_fskip_5000_20752_original_sft.cjs) first checks the exact page/line source and all 12,956 canonical unknown rune values; it then independently recovers the **full authentic p56 85/85** under key start0 and the known plaintext-F skip at local position56 (**84 prime values consumed**). On p0–2 it enumerates each allowed F branch **without ever creating an encrypted plaintext F**: at ciphertext F a plaintext F bypasses without consuming any prime, while an encrypted non-F may consume one; at every other ciphertext rune key consumption is forced. The finite predeclared family has **23 physical signs × two arithmetic directions × 5,000 original prime starts = 230,000 configurations**. The result is:

| Actual opening-chapter inverse, original GP29 | Exact result |
| --- | ---: |
| Configurations with any legal full 729-rune decryption | **95 / 230,000** (includes physically equivalent sign masks) |
| All legal, distinct-path counted full 729-rune inverses | **20,752** |
| Highest IoC among every complete legal candidate | **0.035714285714** |
| Highest GP-native Shakespeare unigram log-likelihood ratio per rune | **−0.72545641 nats** |
| Source-native 20 fixed independent Shakespeare control intervals of 729 GP runes | IoC **0.05657683–0.06453594**; unigram logLR **+0.3587–+0.4444** |

The highest original IoC occurs at `Pg_half_lines`, prime start3,809, negative sign; the highest source-native unigram score occurs at `Po_par`, start4,531, negative sign. They are different, nonlinguistic strings, and their exact GP transliterations are emitted by the SFT. The control's **source tokenization and 20 offsets are fixed independently of the ciphertext**. The 20 controls are a finite observed register reference, not a universal impossibility theorem for exotic non-English plaintext. The 95 surviving configurations show why the simpler statement that the signed-prime layout family is *arithmetically impossible* would be incorrect; legal cryptographic paths and authentic linguistic plaintext are different requirements.

**Decision:** A creator who simply added one of these published physical-layout sign masks to the authentic p56 φ(prime) stream could produce legally invertible opening-729 text at a few tuned prime starts, but **none of the 20,752 complete outputs recovers ordinary native GP29 English**. No new unknown-page plaintext, source-selected sign, key or destination. The bounded model does not permit an alternate key schedule, hidden insertion/deletion, a source-authored nonnative register, or a key pointer that reverses direction. It is a different test from the eight-window skip-free keyword pointer inverse and from the full 581-source-key-library sign screens still in progress.

## Actual finite experiment

The reproducible manual-only [18-rule Windows Actions workflow](../.github/workflows/lp2-layout-19-unrun-signs-manual.yml) pins the exact external historical source commit and regenerates the original 581 flat-IoC library and all source-text layout vectors, compiles the source Rust decoder, executes its native planted plaintext/control batteries, then searches the original eight long physical-section windows for each of the **nine previously unrun line/position mod3 rules and nine independent page/half rules**. It excludes the four already run rules and the one `Ps_par` duplicate.

For each rule the historical engine considers original anti-repeat skip/coin models and both key multipliers, every source-library key and offset, screening the first 300 runes. The original `verify.py` tests the best fifteen distinct key/window hits across the **entire source window** and twenty random offsets of the *same* key. The frozen claim bar is whole-window IoC ≥ 1.40 **and** ≥ 0.15 above the matched key-offset null; even that is only a screening condition until a ≥150-rune coherent plaintext plus exact original forward cipher and independent holdout are recovered. Its calibrated independent planted layout battery used 15 genuine 300-rune source-native positives; historical controls passed 15/15 before this campaign. Page-level masks have just zero or one sign change in most initial 300-rune windows; their non-detection would mean lack of screening power, **not a key-independent exclusion**.

No new alphabet permutation, book phrase, key offset, word reset, source rune correction, or extra cipher layer is permitted to rescue a weak result. Full workflow artifacts retain the exact candidates and whole-section decoded output for each completed rule. A pending or failed run is not evidence of a negative result.

**Decision so far:** Deduplicate the source's page-parity rules. Complete the remaining original-input campaigns under already-calibrated control, then assess any whole-window hit for genuine language and a blind chapter. No unknown-page key, plaintext or destination is established by the redundancy itself.
