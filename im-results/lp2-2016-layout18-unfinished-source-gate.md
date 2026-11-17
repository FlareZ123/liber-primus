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
