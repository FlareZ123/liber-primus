# Nine original LP2 red chapter headings: keyless substitution invariants

**Agent1, 21 November 2026; Director issue #2090.** This is a bounded negative on three heading-only, title-key hypotheses. **No new unknown plaintext, source-supplied key, original cipher receiver, or Cicada destination was found.** It does not exclude independently keyed polyalphabetic chapter ciphers or a separate external key.

## Original source and the fixed human-facing premise

The original-image heading/13-dot rule independently selects nine LP2 unknown chapter starts at physical pages **0, 3, 8, 15, 23, 27, 33, 40, 54**, in original release order. The first red rune spans are exactly **[13, 16, 12, 9, 16, 19, 10, 8, 9]** runes, totaling **112**. Their printed GP29 word lengths are, respectively:

```text
8+5 | 2+11+3 | 4+8 | 4+5 | 2+6+3+5 |
3+12+4 | 2+8 | 3+5 | 1+8
```

These are literal original printed word divisions, independent of any proposed title plaintext. P15's second adjacent red span is excluded; p33's second internal red span is excluded. Use `resources/liber-primus/lp2-corpus.json`, `lp2-transcription.txt`, and `lp2-ink-annotations.json`; the SFT asserts both heading offsets and every word-length signature. They are cryptograms, not established readable titles. Solved p56's red **AEJOESR** is encrypted to AN END by its independent, locally specified prime-totient mechanism; solved p57's PARABLE heading is already plaintext. The red-ink visual role alone therefore does not supply a common plaintext/key instruction.

The question is narrow: can the nine unknown red titles be plain English encrypted under a **single GP29 monoalphabetic substitution**, **separate monoalphabetic substitutions per title**, or **one shared position-dependent GP29 bijection restarting at each title**? Each architecture preserves a different ciphertext equality invariant even without learning any key.

## Exactly measured original-input invariants

| Necessary equality invariant | Exact source statistic | English control mean | Lowest / 30,000 | English controls at or below original |
| --- | ---: | ---: | ---: | ---: |
| Pooled repeated-symbol pairs across all 112 runes, preserved by one **global title substitution** | **217 / 6,216** pairs | 383.911 | 282 | **0** |
| Sum of repeated-symbol pairs *inside each of nine headings*, preserved by **independently rekeyed title monoalphabetic substitutions** | **27 / 700** pairs | 38.724 | 19 | **730** |
| Same ciphertext rune at the same local title offset, across all 36 pairs of headings; preserved by **one shared title-offset GP29 permutation** | **11 / 366** positions | 25.042 | 8 | **53** |

Each statistic uses the complete original nine-title sequence. The comparison distribution contains **30,000 independently sampled sets** of native-GP English words, with exactly the original 22 printed title-word lengths and nine title groupings. Source samples are drawn from the two existing pinned Shakespeare and Gibran corpora, using the canonical GP29 contractions/transliteration, one frozen `0x33012026` xorshift seed and a reproducible fixed enumeration. The empirical lower-tail add-one rates are, respectively, **1/30001 ≈ 0.00003333**, **731/30001 ≈ 0.02437**, and **54/30001 ≈ 0.00180**. The paired comparisons and same-heading dependencies are retained *per simulated complete title set*, so no binomial assumption treats correlated symbol pairs as independent.

The script also implements three bijective positive plants: a global affine GP29 symbol permutation preserves all three invariants; independent title Caesar shifts preserve each title's symbol-collision count; and a common per-position variable Caesar shift preserves title-position equality. All passed, confirming the necessary conditions are not artifacts of a particular guessed key.

## Decision and scope

A **global fixed GP29 substitution on these red titles** is strongly inconsistent with their proposed intact native-English plaintext register under the stated controls. A **single title-position key/transform reused at every red heading** is likewise disfavored, independent of its unknown substitution tables. Independent per-title fixed substitutions are disfavored more weakly under this model (about 2.4% lower-tail), and **should not** be treated as mathematically excluded for every kind of plaintext.

These original-input results do **not** reveal how to decrypt the titles or their chapter bodies. Alternative languages, deliberately unusual heading syntax, separate title-specific varying keys, an authenticated external key schedule, altered punctuation, and non-invertible or context-dependent coding remain outside this test. More important, **the historical release gives no title-to-operator mapping, direction or key/clock grammar**. The earlier nine-chapter and twelve-rubric **body-wide shared-pad gates** already reject a different, much longer chapter-reset family. This new test addresses only a *hypothetical heading-only* key channel and should not prompt further arbitrary shifts.

**Research action:** suspend a common monoalphabetic title shortcut and refrain from using the nine red headings as nine user-readable cipher instructions unless an independent 2014 source ties specific heading glyphs/illustrations to an executable operation. Future proposals need a frozen rule predicting unknown body plaintext in more than one section.

## Reproduction

- Exact independent SFT: [`sims/lp2_nine_red_heading_substitution_invariants_sft.cjs`](../sims/lp2_nine_red_heading_substitution_invariants_sft.cjs)
- Verified Node22 / Windows manual run: [GitHub Actions 44950459273](https://github.com/FlareZ123/liber-primus/actions/runs/44950459273) (success)
- Existing source-visible chapter map: [original visual chapter study](lp2-global-original-visual-section-map.md)
- Prompt-constrained decision: [Director #2090](https://github.com/FlareZ123/liber-primus/issues/2090)
