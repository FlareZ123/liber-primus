# LP2 word-number → line:character self-book-code gate

**Decision: REJECTED.** The experiment was motivated by two independently established Cicada conventions: the 2012 round's line:character book-code grammar and the signed 2016 instruction that words are a map and their numbers give direction. The specific LP2 mapping tested here is a hypothesis, not a first-party instruction. See the [original 2012 book-code source and implementation](https://github.com/neuroretransmit/cicada/tree/main/2012/006-two-book-codes).

## Frozen hypothesis

For each word on the 55 rune-bearing LP2 pages p0–55:

- **line** = the sum of that word's Gematria Primus prime values;
- **character** = the number of runes in that word;
- use one-based global line and character coordinates;
- read the selected character from the complete Liber Primus transcription, pages 0–74.

The target is the full manuscript's line layout, not an external book. The extraction preserves the transcription's physical line order and counts its hyphens and periods as characters. Structural markers `&`, `$`, `%`, and `§` are not text lines; the trailing `/` marks a line boundary and is not itself counted. No modulo, reversal, coordinate swap, per-page reset, offset fitting, or alternate segmentation was tried.

## Source inputs and parsing

- `resources/liber-primus/lp2-corpus.json` (blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`): the 29 rune identities, transliterations, and prime values.
- `resources/liber-primus/lp2-transcription.txt` (blob `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7`): canonical word parser; first 55 physical blocks yield 2,896 words / 12,956 runes. The remaining two blocks provide the p56/p57 control (45 words).
- `resources/transcriptions/liber_primus_master.txt` (blob `ba553b1d43bc491a1bab66ebd02534249263ae90`): complete manuscript transcription; after excluding structural marker lines, 797 target lines, maximum line length 36.
- `resources/control/dukotah_english_quadgrams.txt` (blob `da56c2e11e004ad24454750dba8fbe2e19abbc71`): fixed English quadgram-count model.

The word segmentation and prime sums follow the existing canonical parser in `sims/lp2_2013_number_word_sum_factor_index_sft.cjs`; this test changes only the proposed consumer to the historically attested line:character form.

## Result

**2,870 / 2,896** unknown-page pointers are in range (99.10%). This high coverage is mechanical: the full book has 797 lines and the character coordinates are only 1–14. It is not evidence of a correct key.

The selected unknown-page characters comprise 2,197 GP runes, 559 hyphens, 45 periods, and 69 other characters. After GP transliteration, the output begins:

```text
MOEGEE  EA  PHOIA PWX EAUPA   ATHBNGLHO WMOE NG T EL G AEXJUE SBLJWNGU JOEEWOCIA EAJTHBOETH FYBTH O AENUTMITHM L WSAUDEUMW  AELOEIAEEA EX  NGLGL  UH AEGEI OEL NYXF THI PYIAIEHS EXCOPBONGDIU OIA F HWLFJXXM   AN IAN WSNGSNNGF  EOU THF   JIAAE
```

The fixed English quadgram score is **−14.58854**. In 1,000 deterministic nulls that independently shuffle the line and character coordinates while preserving both marginal distributions, the mean is **−14.41061**, SD **0.06146**; the observed score is **z = −2.90**, with only **2/1,000** nulls scoring as low or lower (0.002 lower tail). The null replicates average **98.61%** valid coverage, so their score comparison is not driven by a material coverage difference. The known p56/p57 words are also nonlinguistic under the same mapping: 45/45 valid, score **−14.6532**. The checked-in script reproduced these figures under Node 22.23.4 in GitHub Actions run [#415](https://github.com/FlareZ123/liber-primus/actions/runs/44332585024).

## Interpretation

The direct one-based mapping `(GP prime sum, rune length) → (global line, character)` does not recover English and performs worse than the shuffled-coordinate null. Retire this exact self-book-code route. Do not rescue it with modulo, reverse coordinates, page-local resets, fitted offsets, or alternate line counts absent a new source-selected instruction.

This does **not** rule out the historically attested 2012 book-code grammar with a different, independently selected pointer list or target text. It also does not prove that the 2016 signed direction message is irrelevant; it only rejects this concrete interpretation against the current full-manuscript transcription. The line layout is a derived transcription, not a pixel-by-pixel remeasurement of every original page. No LP2 plaintext, key, cipher mechanism, or destination is recovered.

## Reproduction

Run from the repository root:

```bash
node sims/lp2_2016_wordnumber_linechar_self_bookcode_sft.cjs
```

The script uses a fixed xorshift32 seed `0x133331`, 1,000 null replicates, and only repository inputs listed above.
