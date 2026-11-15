# Page-rekeyed plaintext-autokey: 32 original cross-page word seams

**Original-input decision, Agent 1, 15 November 2026 (Director [#977](https://github.com/FlareZ123/liber-primus/issues/977)):** A minimal, fully reversible GP29 plaintext-one-back autokey cipher with a new independent additive key on each physical page is incompatible with 19 of the 32 exact source-printed cross-page words under the fixed 29-symbol native-English lexicon. The stronger, complete **29-coefficient affine plaintext-one-back family** has **16/32 original crossing words incompatible under every slope**. Fifteen of the 25 seams capable of exposing a relative page key have no lexicon-compatible key difference for the fixed slope one. A full 12,956-rune original-layout native-word plant recovers all 32 source-layout seam words and retains all 25 genuine interpage key differences for both slope one and an independent slope-17 plant. **This excludes this specific direct native-lexicon model; no unknown LP2 plaintext, source-selected key, original cipher or destination was recovered.**

## Human-visible clue and competing route

Physical LP2 p0–55 has 55 rune-bearing pages (p50 contains only a numeric table), 12,956 unchanged canonical GP29 runes, and 2,896 complete original printed words. **Exactly 32 single printed words continue across a physical page boundary**, including the genuine p48→49 and p51→52 carries around numeric-grid p50. A player might infer that some cipher register is page-keyed while a *plain-language word* survives the join. This gives a small source-bounded opportunity to recover relative page keys from the continuity of complete words. The strongest rival explanation is that the real cipher is continuous across page breaks, uses a changing state or applies another plaintext register. The surviving words alone do not instruct any particular cipher.

Earlier source work already excluded shared page-local static keys and fixed page-phase substitutions, as summarized in [the integrated decision](../workplace/integrated-original-inversion-challenge.md); this experiment uses a **different, plaintext-dependent recurrence** and directly examines complete words that bridge a page-key change. It does not rerun generic Caesar, periodic pads, previous-*ciphertext* feedback or old page-carry counts.

## One fully specified reversible cipher and its decisive seam equation

Assign a new arbitrary secret `k_p ∈ F29` to each physical rune-bearing page `p`. Preserve the exact printed symbol and page positions, printed word boundaries and rune order, with no escaping or F bypass. For global source rune index `i`, let `P[-1]=0`:

```text
Encryption: C[i] = (P[i] + P[i-1] + k[physicalPage(i)]) mod 29
Decryption: P[i] = (C[i] - P[i-1] - k[physicalPage(i)]) mod 29
```

Every plaintext sequence and key schedule has a unique ciphertext and exact inverse. The secret page keys are **never guessed or optimized** against the original LP2 ciphertext. For any source-printed word with original glyphs `C[0..L-1]` and candidate GP29 plaintext `P[0..L-1]`, wherever `j≥2` and the printed positions `j-1` and `j` remain on the *same* physical page, the unknown key cancels:

```text
C[j] - C[j-1] = P[j] - P[j-2] (mod 29)
```

The relation holds even when `j-2` lies on the preceding page. At the one internal page seam `j=s≥2`, the same candidate word **fixes** the relative page key:

```text
k[nextPage] - k[previousPage]
    = C[s] - C[s-1] - P[s] + P[s-2] (mod 29)
```

If the carry consists of only one pre-seam rune (`s=1`), `P[s-2]` lies in an unknown preceding printed word; the isolated word does **not** identify a relative page key. We therefore distinguish all 32 cross-page words from the 25 with `s≥2`, and grant all possible page-key values in either case.

## Fixed original GP source and lexicon

The [canonical corpus](../resources/liber-primus/lp2-corpus.json) is checked position-by-position against the [verbatim page-aware rune transcript](../resources/liber-primus/lp2-transcription.txt). The splitter treats physical page marks `%`, slashes and newlines as *continuations*, not word terminators; actual punctuation closes a word. The physical page labels jump from p49 to p51 because p50 carries no runes. The exact same transcript yields the earlier source-verified 2,896/12,956/32 word counts.

Independently freeze the existing [29,157-entry TextBlob English spelling list](../resources/control/english_wordfreq_textblob.txt), deduplicated by GP29 spelling at each rune-word length. Use the same original-project native spelling mapping `QU→CW, K/Q→C, V→U, Z→S`, greedy `ING, TH, NG, EO, OE, AE, IA, EA` composites with `ING→NG`. This is an explicitly **finite contemporary dictionary register**, not a claim to include every historical, Cicada-specific or archaic spelling. No candidate from this dictionary is selected according to its English meaning or cipher fit: **all** candidates of the exact source-printed rune-word length are tested.

## Original-cipher compatibility: 19 complete seams fail

Each candidate native word must satisfy **all its same-page two-step difference identities**, one observed GP29 residue equation per eligible original position. The table shows especially discriminating failures; `cut` is the count of source word runes printed on the preceding physical page.

| Original crossing word | Rune length | cut | Independent same-page constraints | Distinct native-GP spellings tried | Complete compatible words |
| --- | ---: | ---: | ---: | ---: | ---: |
| p0→p1 | 6 | 1 | 4 | 4,600 | **0** |
| p5→p6 | 7 | 1 | 5 | 4,731 | **0** |
| p9→p10 | 11 | 10 | 8 | 1,548 | **0** |
| p21→p22 | 10 | 8 | 7 | 2,385 | **0** |
| p23→p24 | 7 | 4 | 4 | 4,731 | **0** |
| p42→p43 | 11 | 9 | 8 | 1,548 | **0** |
| p45→p46 | 9 | 2 | 6 | 3,334 | **0** |
| p46→p47 | 11 | 8 | 8 | 1,548 | **0** |
| p47→p48 | 8 | 4 | 5 | 4,209 | **0** |
| p48→p49 | 9 | 8 | 6 | 3,334 | **0** |
| p52→p53 | 10 | 5 | 7 | 2,385 | **0** |
| p54→p55 | 11 | 10 | 8 | 1,548 | **0** |

The complete original 32-row output is recorded verbatim by the SFT rather than hand-copied into a second table. **19 of 32** have zero complete candidate spellings; **13 of 32** retain at least one spelling. Among the **25 seam cuts ≥2**, **15** have no viable candidate and thus no lexicon-compatible relative key. Some short words are intentionally nondiscriminating (e.g., p19→20 length3, cut2: all 748 length-three spellings survive); this is an honest ambiguity, not a recovered plaintext. Because no candidate survives in numerous long original words, fitting individual unknown `k_p` cannot restore this specified model's complete native-English word plaintext.

The 32 observed seams connect only 32 of the possible 54 adjacent page relationships. As a graph on the **55 rune-bearing physical pages**, there are **23 disconnected components**. Even if a genuine candidate supplied and fixed every observed relative key, these source-only seams would leave at least one unfixed absolute page-key reference per connected component. They do not themselves furnish a complete global key schedule.

## Strengthening: all 29 affine plaintext-feedback slopes

The first decoder fixed the previous-plaintext multiplier to one. A natural **strict finite enlargement** permits an unknown but *globally fixed* `a ∈ F29`, while keeping every physical page's additive key arbitrary and unknown:

```text
C[i] = (P[i] + a*P[i-1] + k[physicalPage(i)]) mod 29
P[i] = (C[i] - a*P[i-1] - k[physicalPage(i)]) mod 29
```

Inside one physical page, at a word position `j≥2`, the corresponding key-independent constraint is

```text
C[j]-C[j-1] = P[j] + (a-1)*P[j-1] - a*P[j-2] (mod 29).
```

At the seam `j=s≥2`, the relative physical-page key becomes `C[s]-C[s-1]-P[s]-(a-1)*P[s-1]+a*P[s-2]` modulo 29. Neither formula depends on any chosen absolute page key.

**Exact finite exhaustive test:** For *every* original cross-page word, test *every* deduplicated source-GP dictionary word with its original length under **all 29 possible multipliers** `a=0..28`. Each source-printed word is compared against *all* its eligible same-page constraints. **16 of 32 crossing words have zero matching native-GP words under *any* of the 29 slopes**. Thirteen of these 16 have seven or more GP runes; particularly decisive original source spans include p9→10 (11 runes, eight equations), p42→43 (11 runes, eight), and p54→55 (11 runes, eight). No globally shared affine slope survives all 32 seams, and allowing each seam to choose its *own* slope cannot restore the 16 zero words. Hence freely guessing additional independent page keys or a shared slope cannot rescue this entire frozen affine original-cipher architecture under the finite native lexicon.

**Independent constructive control:** Encode the exact same 12,956-source-slot native GP words with the affine equation, authentic physical page layout and a *different true slope `a=17`*. All **12,956 / 12,956** source words' rune slots decrypt and exactly reencrypt; the true complete word satisfies the constraints at **32 / 32** original-layout crossing seams, and its actual relative page key is recovered at **25 / 25** suitable cuts. This rules out merely implementing the slope-one case correctly while incorrectly rejecting the general affine recurrence.

The original failure remains conditional on the source-native GP spelling register, exact printed word identities and page-only additive rekeying. This calculation is a **bounded stronger exclusion** rather than a historical clue that Cicada used affine autokey; it does not justify searching new nonlinear coefficients, rescoring ciphertext, or altering word boundaries to save the family.


## Independent historical-language GP29 controls

The same 32 original physical-page crossing words and **all 29 affine multipliers** were checked against the existing native GP29 Latin Vulgate and corrected Old English Beowulf word registers. The literal numeric GP29 encoding of each reference was preserved; no English re-spelling was imposed.

| Fixed native source | Source whole words | Deduplicated GP29 words | Original crossing words with zero candidates under all 29 slopes | Zero cases with at least 7 runes |
| --- | ---: | ---: | ---: | ---: |
| English spelling lexicon | 29,157 | length-specific | **16/32** | **13** |
| Latin Vulgate New Testament | 39,835 | 7,305 | **17/32** | **13** |
| Old English Beowulf | 10,885 | 3,372 | **17/32** | **13** |

The **same thirteen long crossings** lack any complete candidate in all three source registers: p5→6, p9→10, p21→22, p23→24, p24→25, p29→30, p42→43, p45→46, p46→47, p47→48, p48→49, p52→53, p54→55. This is a stronger finite, independent-language exclusion of the exact fixed geometry and affine recurrence, not a proof about arbitrary archaic words or differently segmented text.

For each of the two added sources, a separate planted GP29 word was selected for every original crossing seam, retaining its printed word length and physical page cut. At known affine multiplier 17 and the same independent page-key schedule, the original cipher/inverse recover **all 32 true native-language seam words** and **all 25 informative relative keys**, with no ciphertext alteration. The existing English positive additionally checks all **12,956** complete-book slots. Both additional original-language input checks and positives are implemented in the same linked CommonJS SFT.


## Complete native GP positive, original geometry retained

Construct **2,896 genuine lexicon GP words**, each of exactly the associated original printed word's native-rune length, occupying all **12,956 source rune slots** and preserving every original page split and the exact 32 cross-page word cuts. Encrypt them under the specified recurrence with independently keyed physical pages, `k_p=(11p+7) mod29`. Feed the *synthetic* ciphertext into the identical blind seam check. All **32 / 32 source-layout complete plaintext words** remain among the independently sampled dictionary matches; each of the **25 / 25 key-identifying seam cuts** retains its planted true interpage key difference. Complete decryption and reencryption reproduce **12,956 / 12,956** planted runes exactly.

The original manuscript and genuine-language controls differ under the same code, dictionary, geometry and test. The native plant establishes that the original failure does not arise from failing to carry a word over the page break or from a broken decoder. It does not imply the original ciphertext has been deciphered.

## Research decision

**Retire the direct printed-word-preserving, no-insertions, independent-physical-page-key affine plaintext-one-back recurrence for all 29 slopes in the three frozen finite native-GP English, Latin and Old English registers**. The exact 19/32 seam incompatibility also excludes key changes **only** at page boundaries within this frozen formula, because page values were arbitrary and eliminated from every tested equality. More frequent rekeying inside words, a plaintext register outside this finite dictionary, nonlinearity, changed printed spaces, a different feedback lag or an intermediate byte stream are materially distinct models requiring a new independent source clue. The observed original page-carry geometry remains a useful test for future *source-selected* page-key hypotheses, but general key sweeps over all 55 pages would duplicate weak prior work.

**Reproduce:** [original-input Windows/Node22/CommonJS SFT](../sims/lp2_crosspage_plain_autokey_seam_sft.cjs), [successful manual GitHub Actions run 43663241111](https://github.com/FlareZ123/liber-primus/actions/runs/43663241111), exact original layout, key-independent equations and planted full-length control.
