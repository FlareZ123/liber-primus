# Corrected original 2014 circumference key, exact LP2 transfer

**Decision (15–17 November 2026):** The historically validated 13-rune GP29 key is **`FIRFUMFERENFE`**, with F at position 12 (one-based). It is exactly `CIRCUMFERENCE` with all three C letters changed to F, a source-text observation without an authenticated general key-generation rule. An older report incorrectly retained C at that position. The corrected fixed-phase Vigenère and word-interior transfers yield no unknown plaintext. **A stronger, exhaustive p56-style literal-F bypass gate excludes the fixed historical-key decoder even with unrestricted page-local phase and independently chosen arithmetic sign.** Original p0 permits only plus-sign phases 3–5, while consecutive p1 permits only minus-sign phases 7,10,11, so no one sign can cover both. More strongly, **25 of 55 original rune-bearing unknown pages**, including original p3, admit neither sign under any of 13 phases. Source-native positives and original historical-key controls are checked. **A separately tested ciphertext-collision rejection extension using this same authenticated key, all 13 phases, both additive signs, both native GP spellings and independently original p55 and p0 target runes also produces no plaintext. Its 52 native-English 76-rune positive controls recover exactly, establishing the decoder's capability under the declared model; the collision-retry operation itself is conjectural.** A source-selected different operation remains open.

## The two authentic historical keys as a p57-directed cascade (17 November, Agent42)

The first-party clear p57 parable specifically says to **shed circumferences** and **find the divinity within**. The two nouns independently name both demonstrated LP1 Vigenère keys: the correct **`FIRFUMFERENFE`** (historical GP spelling of CIRCUMFERENCE, length 13) and **`DIVINITY`** (GP spelling `DIUINITY`, length 8). This presents a materially different, author-visible alternative to applying the circumference key alone: encrypt an inner DIVINITY layer, then an outer CIRCUMFERENCE layer. A solver would peel the outer key and find DIVINITY within, with both original layers using exactly the historical *plaintext-F-transparent/nonconsuming* rule. The reversed historical-key order is an independently fixed control; no unknown symbol map or learned key is introduced.

The source exact detector implements both forward Vigenère layers and a **complete F-ambiguity inverse state machine**. Every ciphertext F may represent literal intermediate F bypass or a nonzero intermediate encrypted to F; the same branching is applied independently to the interior layer. A state is just the two key phases (13×8 = **104** possibilities). Full inverse reachability across every phase pair is exhaustive; it makes **no English, language or beam-pruning assumption**. The positive encrypts the **actual 95 clear p57 runes** with both authentic keys and both authentic F-skip rules, then recovers legal full inverse histories under each order, preventing a false negative caused by skipping F in the wrong layer. Neither key is reseeded within a chapter.

| Original unknown LP2 chapter | Runes | Outer CIRCUMFERENCE, inner DIVINITY: longest legal prefix across 104 phases | Opposite layer order: longest legal prefix |
| --- | ---: | ---: | ---: |
| pp0–2 | 729 | 155 | 41 |
| pp3–7 | 1,145 | 116 | 73 |
| pp8–14 | 1,729 | 95 | 125 |
| pp15–22 | 1,903 | 79 | 91 |
| pp23–26 | 1,021 | 74 | 29 |
| pp27–32 | 1,433 | 122 | 133 |
| pp33–39 | 1,680 | 148 | 93 |
| pp40–53 | 3,008 | 67 | 110 |
| pp54–55 | 308 | 114 | 38 |

**Result:** no phase survives to the end of **any of the nine complete original unknown chapters** under either key order. In source-fixed phase zero, the intended circumference-outer ordering already encounters a non-invertible F transition on p0 after only **five** runes. These are impossibility results for this **specific constant-period dual Vigenère/F-bypass cipher** on authentic original bytes, not a global claim against other multi-layer, word-state or source-key mechanisms. The p57 phrasing has no extra source selector for a different operation.

Exact [self-contained CommonJS source gate](../sims/lp2_p57_two_historical_keys_stack_sft.cjs) and [successful original-input Windows Node22 CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43999552894). This finite negative adds no unknown plaintext; it closes a particularly natural compositional reading of the two already-solved historical key names without another unconstrained key search.

## Why the correction matters

The primary physical 2014 LP1 pages 14–15 (the first two Stage10 JPEGs, original scan files `14.jpg` and `15.jpg`) contain 319 encrypted runes. The first 36 form the recoverable plaintext `A COAN DURNG A LESSON THE MASTER EXPLAINED THE I` when read as GP29 rune tokens, with `NG` a single glyph. Under `P_i=(C_i-K_{i\bmod13})\bmod29`, the corrected key recovers **36/36**, while the prior key misses **exactly original positions 11 and 24**, both at its erroneous key slot. This check is on the original source transcription, rather than an inferred LP2 candidate. Both have exactly 13 positions; the corrected index11 is F=0 where the obsolete index11 is C=5.

The 2014 sixth-onion `/008` historical README/solving program uses the less successful spelling `FIRFUMFERENCE`, while its later `/009` README and independent 2014 walkthrough use `FIRFUMFERENFE`. The original fully solved first 36 runes independently resolve the spelling disagreement. The former report's claims that `/008` and an archived 317-rune positive established the obsolete spelling were too strong, particularly against the 319-rune original physical record. Plaintext-F skipping can change alignment later in the solved passage, but none of the first 36 known runes requires such skipping. The corrected key is not newly recovered LP2 key material.

Original source and independent context:
- [Original 2014 sixth-onion solved-page materials](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/008-sixth-onion)
- [Original 2014 stage report with the corrected string](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_(2014))
- Original `resources/transcriptions/liber_primus_master.txt` and `resources/liber-primus/lp2-corpus.json`

## Full original LP1 second-koan positive: 319/319 and one continuous key clock

The historical FIRFUMFERENFE control now extends from the first 36 glyphs to **all 319 original encrypted GP29 runes** on LP1 physical pp14–15, containing **88 printed words**. The original independent master and second LP1 transcription agree on every glyph. Source-calibrated GP29 encoding of the pre-existing independently solved English reference also produces exactly **319** plaintext runes.

Under the original plaintext-F nonconsuming bypass, the only true plaintext F positions are **49 and 58** (zero-based). The authenticated 13-symbol key [0,10,4,0,1,19,0,18,4,18,9,0,18] consumes **317** positions with one uninterrupted running clock. Source-native forward encryption reproduces **319/319** original ciphertext runes. No physical-page or quotation reset is needed on this solved source.

More significantly, the [unchanged original GP29 lexical Viterbi](../sims/lp2_ftransparent_original_lexical_viterbi_sft.cjs) selects **both original bypass positions** from the full ciphertext and historical key without receiving either the known plaintext or bypass mask, recovering **319/319** correct runes and **86/88** dictionary-supported words. All three original solved-cipher controls now total **919/919**, including all **14** authentic bypasses. [Complete method and evidence](lp2-ftransparent-word-lexical-viterbi.md) · [successful manual Node22 run](https://github.com/FlareZ123/liber-primus/actions/runs/43734906770).

This is a stronger authentic decoder positive and fixes the historical cipher clock across this second koan. It supplies **no LP2 p0–55 key or plaintext**; the separate original 25-page impossibility of directly reusing this key with its literal-F protocol remains intact.
## Two original LP2 inverses, source-corrected

The externally supplied LP2 cue remains the solved p57 admonition to shed one's circumferences. That gives a motivated historical key to test, although it does **not** specify applying it to unknown LP2 or resetting its clock.

**Direct full-rune schedule:** At zero phase, concatenate all 55 rune-bearing unknown physical pages p0–55 (12,956 ciphertext runes; p50 has none), and subtract the 13-rune correct key, without reinserting a skip or changing the input alphabet. The exact corrected GP indices are `[0,10,4,0,1,19,0,18,4,18,9,0,18]`; corresponding shifts `[29,19,25,29,28,10,29,11,25,11,20,29,11]`. Original raw IoC is 0.034478397865; corrected output IoC is **0.034483056926**. All three GP29-trigram scores remain at the original cipher's random-like level:

| Independently trained 700-rune native GP model | Original ciphertext | Corrected continuous inverse |
| --- | ---: | ---: |
| Emerson | −4.361516 | **−4.355107** |
| Gibran | −4.437846 | **−4.420092** |
| Shakespeare | −4.435810 | **−4.412554** |

These are small improvements of 0.0064–0.0233 nats/rune, versus native p56/p57 scores around −2.6 to −3.0. The 12,956-rune inverse contains no coherent passage, so this does not recover unknown plaintext.

**Word-interior schedule:** Under the independently source-visible p57 “circumferences” hypothesis, strip the first/last rune of each of 2,896 original complete unknown words, preserving words continued across line/page breaks. Concatenate **7,247** interior runes and apply the same corrected key from phase zero. Raw interior IoC is 0.034473457585; corrected IoC **0.034443331001**. The corrected scores worsen on all three matched models:

| Model | Original 7,247 interiors | Corrected key inverse |
| --- | ---: | ---: |
| Emerson | −4.357298 | **−4.381539** |
| Gibran | −4.429005 | **−4.444168** |
| Shakespeare | −4.424953 | **−4.451088** |

These two **frozen** no-skip inverses lack source-native GP prose. The following key-independent feasibility test also closes the natural, source-authenticated literal-F-bypass extension across the first two original unknown pages, including every starting phase. Alternative changing-state, transposed, whole-word or otherwise instructed cipher consumers remain open.

## Complete original p0/p1 literal-F-bypass transfer, all key phases and both signs

The original 2014 LP1 p14–15 source key is proven on its first **36/36** known GP runes, using the first 36 original encrypted runes, and a false historic variant produces mismatches at offsets 11 and24. A source-visible interpretation of its spelling is `CIRCUMFERENCE` with **all three C replaced by F**, matching the GP F=0/no-shift character at the changed key sites. This exact character rule identifies no additional LP2 recipient or key. Unlike the initial no-skip transfers above, the new test takes seriously the *first-party p56* running-prime cipher exception: a ciphertext F may be the unchanged literal plaintext F, in which case **no key element is consumed**; otherwise the input must decrypt to a non-F GP character by one additive shift.

For the authentic 13-rune historic key `K=[0,10,4,0,1,19,0,18,4,18,9,0,18]`, test every initial phase `0..12` and **both** additive signs. Each printed C=F admits the skip interpretation and an ordinary shift branch if its resulting plaintext is non-F; any mandatory shifted plaintext F is invalid under the p56-style transparent-F protocol. Exactly enumerate the key consumption count after each original rune, collapsing paths with identical consumed count since they have the same future transitions. Thus **no search approximation, fitted plaintext, beam pruning or phase inference** enters the result. The original p0 has 262 source runes and 14 ciphertext F; the immediately consecutive p1 has 266 runes and 13 ciphertext F. Each original page can receive its **own unrestricted 13-way initial phase**, which is strictly more permissive than a continuous-key assumption.

| Original source receiver | Minus-key direction `P=C−K` | Plus-key direction `P=C+K` |
| --- | --- | --- |
| p0 (262 runes, 14 F) | **0/13 phases legal** | **3/13 phases legal: 3, 4, 5** |
| p1 (266 runes, 13 F) | **3/13 phases legal: 7, 10, 11** | **0/13 phases legal** |
| p0 then p1 as one continuous 528-rune key clock | **0/13 phases legal** | **0/13 phases legal** |

The most favorable plus-key phases on p0 reach **original global rune349** before the forced disallowed F in p1; the first impossible positions of all thirteen combined plus-sign trials are **[35,47,47,349,349,349,16,35,35,5,148,148,14]** (zero-based). All negative-sign p0 trials are already impossible by or before original local rune255. The authentic glyphs are unmodified, and every skip pattern on all **27** F positions is subsumed by this exact DP. Consequently there is **no single additive direction** able to decode even the first two original unknown LP2 pages under *any independent page phase*, and no book-continuous version using this fixed historical key either.

Two original/source-native positives prevent falsely excluding the actual cryptographic rules. First the authentic historical LP1 p14 first36 directly recover the correct key from unchanged original 319-rune koan source, with the obsolete 12th-letter-C key failing exactly twice. Second the genuine original 85-rune p56 prime-totient decryption with its established single **fourth ciphertext-F** bypass recovers all known plaintext and re-encrypts 85/85 native cipher runes; 26 independent native p57 positive controls encrypt all 95 known runes under the 13 historic-key phases and both signs with a literal-F bypass, and the identical DP accepts each actual key-consumption path.

**Stronger all-original page-local rekey exclusion.** Free the sign as well as the phase **independently for each physical page**, an even more permissive architecture than the first-two-page requirement. Repeat the exact 26 phase/sign DP possibilities on all **55 rune-bearing unknown physical pages** (p50 contains no runes). The following **25** original pages have **zero valid phase/sign choices whatsoever**: **p3, p4, p8, p10, p16, p19, p20, p25, p26, p27, p29, p30, p31, p34, p35, p37, p38, p40, p41, p43, p44, p45, p46, p48, p54**. In particular, the third-next p3 independently rejects every source-key phase and both signs without needing cross-page key reuse. The exact 25-page set is source-asserted in the revised standalone reproducer. Thus alternating the arithmetic sign, restarting the historical key arbitrarily at each page or choosing the more favorable direction **cannot** rescue the fixed literal GP29 Vigenère plus p56-style F protocol.

**Scope and decision:** This is an **absolute algebraic inconsistency** for the fixed 13-letter historical key under the p56-style **position-preserving** per-rune additive-plus-literal-F protocol. It holds even when both arithmetic direction and phase may change without restriction between every original physical page; 25 original page receivers are individually impossible. A richer changing-key operation, different F policy, source-independent key material or non-GP register can evade it. The original p56 exception is authenticated; transferring it to p0–55 remains a conditional hypothesis. No unknown LP2 plaintext, cipher, creator key or continuation is recovered.

The [single-file source-exact CJS SFT](../sims/lp2_2014_firfumferenfe_fskip_allphase_sft.cjs) verifies every original input, all 13 phases, both signs, continuous and page-local clocks, exact impossibility indices, the **25 impossible source physical pages** under even arbitrary page-local sign and phase, full historical solved-key/solved-page positives, and all 26 native planted positives.

## Distinct ciphertext-collision retry transfer (Agent32, 16 November 2026)

The authentic LP1 fixed 13-rune key is reused here as `[0,10,4,0,1,19,0,18,4,18,9,0,18]`. Unlike the exhaustive **literal plaintext-F bypass** above, this hypothesizes an encoder that, for plaintext rune P, tries `C=(P±K_j) mod29` and **only when the trial equals the previous emitted ciphertext** may skip that key symbol and retry the *same* P with the next key symbol. At each collision the key is rejected with a fixed hypothetical probability **0.81**. An emitted repeat is possible with probability 0.19. The operation is a conjecture motivated by the independently observed 86/12,901 doublets; neither the 2014 original source nor p57 establishes this LP2 transport or reuse of the key.

The inverse uses a within-printed-word native-English GP trigram model and an exact local collision-consistency rule, with a width-130 key-pointer beam. Both seven-digraph GP spelling and LP1-authored `ING/IO` orthography are evaluated independently. Original receivers are **p55's 76 runes** (including the one-rune incoming p54 carry, whose source appearance is not changed) and the **262 runes of original physical p0**, with all **13 key phases and both signs**. The physical p0 source runes are asserted against the independent original transcription, and printed p55 fragment lengths are frozen as `[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`.

| Native GP spelling | Original p55 best phase/sign | Original p55 total trigram+skip score | Original p0 best phase/sign | Original p0 score | Smallest independently planted 76-rune source-English score |
| --- | --- | ---: | --- | ---: | ---: |
| Legacy 7 digraphs | 1 / + | **−218.8603** | 8 / − | **−848.2017** | **+108.8533** |
| Authored ING/IO | 1 / + | **−207.8927** | 8 / − | **−818.0645** | **+108.7583** |

Every one of **52 heldout 76-rune Gibran plaintext implants** at all phases and signs was recovered **exactly** with its key-rejection count by the same inverse. Best original p55 rune readout in both spellings is `JNGMNBSEAIUGEOBDNGNGFYCBTYEABIFRGMFSPMBTHOMYDBNFTEEOTHFMENGGRTHSBAEEOPIAFGTHRCEGMRADOEYEANI`; no coherent GP29 native plaintext or new source-selected key clock is found. The strongest original p0 readouts likewise remain nonlinguistic. Source-native controls demonstrate the instrument works for this family but cannot establish it as historical. Because beam pruning can miss paths, the outcome is a **bounded negative original-cipher screen**, and should not be cited as an all-secret impossibility proof.

[Exact original-input Node22 CommonJS SFT](../sims/lp2_firfumferenfe_collision_skip_original_sft.cjs) (reuses the documented 2013-book inverse module) and [passed two-test GitHub Actions run43806278159](https://github.com/FlareZ123/liber-primus/actions/runs/43806278159). Further search of these identical 52 cells is not justified without original authored material identifying the cipher transition or plaintext register. Other nonadditive operations remain open.

## Reproduction

The fixed-phase no-skip [standalone Windows/Node CJS reproducer](../sims/lp2_2014_firfumference_vigenere_gate.cjs) verifies the original 319-rune LP1 input and 36/36 source-key control, positively diagnoses the obsolete key's exactly two mismatches, checks the corrected key vector, evaluates all original 12,956 LP2 runes and all 7,247 interior runes, and includes a 700-rune synthetic encrypt/decrypt positive.

Use `node sims/lp2_2014_firfumference_vigenere_gate.cjs` for the prior complete no-skip source test, and `node sims/lp2_2014_firfumferenfe_fskip_allphase_sft.cjs` for the independently stronger all-phase literal-F gate. Both use pinned native original data without writing intermediate files. Any study importing `FIRFUMFERENCE` as an authentic source key must correct the spelling to `FIRFUMFERENFE` or explicitly label it a different speculative key. The full 56 unknown physical LP2 pages remain undeciphered.
