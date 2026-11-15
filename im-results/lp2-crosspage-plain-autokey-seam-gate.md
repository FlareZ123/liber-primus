# Page-rekeyed plaintext-autokey: 32 original cross-page word seams

**Original-input decision, Agent 1, 15 November 2026 (Director [#977](https://github.com/FlareZ123/liber-primus/issues/977)):** A minimal, fully reversible GP29 plaintext-one-back autokey cipher with a new independent additive key on each physical page is incompatible with 19 of the 32 exact source-printed cross-page words under the fixed 29-symbol native-English lexicon. Fifteen of the 25 seams capable of exposing a relative page key have no lexicon-compatible key difference. A full 12,956-rune original-layout native-word plant recovers all 32 source-layout seam words and retains all 25 genuine interpage key differences. **This excludes this specific direct native-lexicon model; no unknown LP2 plaintext, source-selected key, original cipher or destination was recovered.**

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

## Complete native GP positive, original geometry retained

Construct **2,896 genuine lexicon GP words**, each of exactly the associated original printed word's native-rune length, occupying all **12,956 source rune slots** and preserving every original page split and the exact 32 cross-page word cuts. Encrypt them under the specified recurrence with independently keyed physical pages, `k_p=(11p+7) mod29`. Feed the *synthetic* ciphertext into the identical blind seam check. All **32 / 32 source-layout complete plaintext words** remain among the independently sampled dictionary matches; each of the **25 / 25 key-identifying seam cuts** retains its planted true interpage key difference. Complete decryption and reencryption reproduce **12,956 / 12,956** planted runes exactly.

The original manuscript and genuine-language controls differ under the same code, dictionary, geometry and test. The native plant establishes that the original failure does not arise from failing to carry a word over the page break or from a broken decoder. It does not imply the original ciphertext has been deciphered.

## Research decision

**Retire the direct native-GP-English, no-insertions, independent-physical-page-key plaintext-one-back additive recurrence**. The exact 19/32 seam incompatibility also excludes key changes **only** at page boundaries within this frozen formula, because page values were arbitrary and eliminated from every tested equality. More frequent rekeying inside words, a plaintext register outside this finite dictionary, nonlinearity, changed printed spaces, a different feedback lag or an intermediate byte stream are materially distinct models requiring a new independent source clue. The observed original page-carry geometry remains a useful test for future *source-selected* page-key hypotheses, but general key sweeps over all 55 pages would duplicate weak prior work.

**Reproduce:** [original-input Windows/Node22/CommonJS SFT](../sims/lp2_crosspage_plain_autokey_seam_sft.cjs), [successful manual GitHub Actions run 43663241111](https://github.com/FlareZ123/liber-primus/actions/runs/43663241111), exact original layout, key-independent equations and planted full-length control.
