# Old English Rune Poem as a source-native LP2 running key: complete stage-1 decision

**Director task #1196, Agent44, 16 November 2026. Result:** no credible original unknown-page plaintext, table, or key offset. A complete, fixed 729-rune first-stage running-key screen against all eight unknown LP2 chapter openings finds **zero** threshold crossings for either GP29 digraph or letter-only spelling. The exact input text is historical and naturally aligns with the Cicada 29-rune alphabet, so this is an informative, genuinely different book-key source, even though no Cicada-authored instruction designates the poem as the intended key.

## Independently selected source and register

The *Old English Rune Poem* was printed by George Hickes in 1705 from a now-lost manuscript; it has **29 stanzas**, one for each Anglo-Saxon futhorc rune, in the same printed order as GP29 from ᚠ (F) to ᛠ (EA). The original 2013/2014 Cicada gematria chart therefore supplies a concrete mapping without choosing a poem translation based on LP2 outcomes. Old English verse is out of copyright, but no historical Cicada message names this poem. We use a frozen original-language source, not a modern translation.

Historical source: [Old English Rune Poem, Wikisource](https://en.wikisource.org/wiki/Rune_poems#The_Anglo-Saxon_Rune_Poem), [earlier 1915 edition](https://en.wikisource.org/wiki/Runic_and_Heroic_Poems_of_the_Old_Teutonic_Peoples/The_Runic_Poems/The_Anglo-Saxon_Runic_Poem). The **exact byte corpus tested** is the 29-stanza original-language text preserved in [Dukotah's corpus at immutable commit](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/liber-primus/data/keys/runepoem_oe.txt), Git blob `dea9478b3ded47cc1fbbe30be7b8941486054e07`, 3,176 UTF-8 characters. No original verse bytes are republished. Preserve the original stanza line order. Interpret Old English `þ/ð` as GP29 `TH`, `æ` as `AE`, and `ƿ` as `W`, fixed before scoring. The same inherited 29-letter upstream parser handles the remaining rune sounds. These historical aliases produce **2,535 native digraph rune positions** or **2,836 single-letter positions**, both sufficient to screen one 729-rune chapter without cycling the key.

## Test model, real-data scope and controls

Reused the already calibrated, source-unknown-table, q=0.81 skipped-key-pointer drift decoder from [phase23 external source](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/book_key_decoder.py), using the **same** English GP29 transition model, beam64, start stride8, pointer-spread8 and 729-symbol ciphertext window as closed local #1186. The original LP2 source hash is locked by the script, with eight known chapter-section openings corresponding to pages **0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53**. The source poem's 29-rune stanza names select order only; the source does **not** select key start, and this model marginalizes the start within each eight-step block under the registered skip grammar. No text edits, reordering, unknown-page rune repairs, arbitrary phase shifts or second cipher were allowed.

The registered acceptance thresholds are `score > −0.0112` (native digraph) and `score > −0.0417` (letter-only), selected prior to the Rune Poem original screen. Correct-key/unknown-table native plaintext plants and matched wrong-book/wrong-offset/random-key nulls were run against the poem rather than asserted by construction. With a comparatively short 2,535-rune source, the 6 digraph plants use six unique offsets chosen in advance; **5/6** cross the historical threshold. For the 2,836-letter source, **4/6** cross. All registered null plants remain below threshold. Hence the detector demonstrably has partial positive power on this source, but misses a nontrivial fraction of positives: the result **cannot justify an unconditional impossibility claim** for a true Rune Poem key or other key variants.

## Exhaustive original-data first-stage outcome

Four shard jobs tested all eligible stride8 pointer seeds for each spelled source and each original 729-rune section opening, reserving 128 key positions for the skip-drift. No original window crosses its registered threshold.

| Source spelling | Key positions | Stride-8 starting seeds | Original sections | Best score (higher is better) | Threshold | Crossing |
|---|---:|---:|---:|---:|---:|---:|
| Native digraph (ING, TH, AE, etc.) | 2,535 | 210 | 8 | −0.1465963 | −0.0112 | 0 |
| Letter-only with original GP aliases | 2,836 | 248 | 8 | −0.1728450 | −0.0417 | 0 |

The largest native score comes from original section p3–7 at key seed1,056. The largest letter-only score comes from original p3–7 at seed360; both miss the pre-fixed threshold by more than 0.13 nats/rune. All eight section maxima are preserved in the numerical GitHub Actions summary. These are scores from this inherited source/model combination and must not be treated as normalized language scores or absolute probabilities.

- [Full CI success, numerical shards and global summary](https://github.com/FlareZ123/liber-primus/actions/runs/43808668974)
- [Successful smoke and plant controls](https://github.com/FlareZ123/liber-primus/actions/runs/43808538966)
- [Immutable original-input stage1 SFT](../sims/lp2_rune_poem_tablefree_bookkey_stage1.py) · [complete four-shard aggregator](../sims/lp2_rune_poem_tablefree_bookkey_aggregate.py) · [manual CI workflow](../.github/workflows/lp2-rune-poem-bookkey-stage1.yml)

## Decision

The pre-2014 *Old English Rune Poem* is an independently motivated **29-rune key source**, and the original first 729-rune windows offer sufficient length to test it without looping. Under the single source-frozen table-invariant q=.81 decoder and declared source normalization, its full registered stage1 test finds **no hit**. Do not spend further compute tuning alternative translations, signs, periods, starts, or letter mappings against LP2; a distinct creator-era cue or stronger independently calibrated original operator would be required. The manuscript remains unsolved.
