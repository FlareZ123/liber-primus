# LP2 206-symbol printed-line word-initial acrostic gate

## Conclusion

The source-exact line-initial channel contains 206 symbols: the first rune on each of 55 rune-bearing pages, plus 151 line starts that begin a new word. The other 388 printed-line starts continue a word. The 206-symbol sequence does not directly expose readable plaintext under the natural acrostic readings tested below.

This is a bounded negative result, not a cipher-family exclusion. It does not explain the earlier conditional line-start frequency residual (reported at p=0.0057), and it does not justify treating the 206 symbols as a key.

## Exact extraction

Inputs:
- `resources/transcriptions/liber_primus_master.txt`
- `resources/liber-primus/lp2-corpus.json`
- The existing physical-layout parser `sims/physical_line_initial_crosspage_heldout.cjs`

Reuse the parser's original page and line segmentation rather than infer boundaries from rune statistics. For each rune-bearing LP2 page p0–p55 (excluding the grid-only p50), select:
1. the first rune of the page; and
2. the first rune at each `beginWords` position, where the current printed line begins a new word rather than continuing the previous line's word.

The parser independently asserts the original 12,956-rune sequence and 594 printed lines. Counts are:
- 55 page starts;
- 151 line-leading new-word starts;
- 388 within-word continuations;
- 206 selected symbols total.

The 206-symbol GP transliteration is:

```text
SOPSOENGAUPOEDLYBPCLTHPRGEOPEAXWGAXCXHTHDXPJYYFOEYEOOCYEAYIALHEAPCGYHPGILHTEOCOEFLIAEMYLXEAOEFJPNXNAPOEAIDECOEPUIAWYNGAUNGDIADAEEHYSGIAEAMAEEAIUAEPDAJTHTHWPDOEEAXYBTHHLOELIADPNGMHNGDYLEONFDNGUHCNGAESIADFDFEAHHEOEAXDYHFEAIAAEEACWMRYDHIAEAPBCEOHNGWXNGIAWPIAEOYUAOESNGEO
```

## Decisive simple tests

- Direct reading: no recognizable plaintext.
- All 29 constant Caesar shifts over the GP29 alphabet: no recognizable plaintext.
- Atbash, reverse, and reverse-Atbash: no recognizable plaintext.
- The p56/p0 source-motivated `phi(prime) mod 29` stream, starting at prime 2 (the solved-page start) or prime 3 (the p0 red-heading DH candidate), in either additive direction: no recognizable plaintext.

The script `sims/lp2_206_word_initial_acrostic_gate.cjs` reproduces the extraction, asserts the counts, and emits the tested variants.

## Interpretation and next decision

The line-start distribution anomaly remains an empirical layout-conditioned observation, not a recovered message. The simple acrostic hypothesis is not supported. Do not spend further effort on Caesar/Atbash or the same prime-totient starts over this 206-symbol stream. A future revisit needs a distinct source-selected operation or independent evidence that the line-initial subset is intended as a separate ciphertext channel.
