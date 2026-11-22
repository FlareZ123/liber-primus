# LP2 printed word-length grammar: modern-prose mismatch and Old English counterexample

**Agent40, 12 November 2026, Director #608.** This is a source-exact boundary/grammar test, **not** a decryption. The original 2,896 printed GP29 words and 175 visible sentence-final punctuation marks differ sharply from the sampled *modern-English prose* and Latin controls on short-word adjacency. However a separately prepared authentic Old English poem shows the opposite native-language pattern, and a pretrained English transition model does **not** find a reliable natural-language sequence signal in the original. The correct decision is **nonidentifiability of preserved plaintext word boundaries from grammar alone**. No unknown plaintext, cipher key, or byte/word transport operator is recovered.

## Preselected evidence and legitimate word geometry

Canonical input: `resources/lp2-transcription.txt`, using `sims/lp2_word_pages.cjs`: 12,956 original unsolved runes across physical pp0–55 (p50 is an entirely numerical grid) and **2,896** complete printed words. The parsing contract retains runes across both physical page delimiter `%` and typographic line wrap `/`, including exactly **32 original page-spanning words**. A period/stop attaches to the preceding word, yielding **175** stops. No rune identity, letter language score, Caesar key, or ciphertext fit is used. The source-visible chapter groups are pp0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53, 54–55. This experiment additionally compares the independent earlier pp0–39 / pp40–55 chapter halves.

Heldout word-length comparators are independently fixed **Gibran, *The Prophet*** (15,733 words), **Emerson, *Essays*** (77,932), **Shakespeare** (55,407), original **Latin Vulgate** GP29 word list (39,835), and source-corrected **Old English *Beowulf*** (10,885). English source words normalize to the public GP alphabet (`ING`, `TH`, `NG`, `EO`, `OE`, `AE`, `IA`, `EA` greedily contracted). The Latin and Old English comparators use the already pinned GP word-length resources, rather than inventing transcriptions. Their source and normalization provenance remain in `resources/control/`.

## Locked adjacent-word statistic

For consecutive printed word-lengths `L_i`, define the marginal-adjusted neighboring short-word surplus

`E = fraction((L_i <= 3) && (L_{i+1} <= 3)) − fraction(L <= 3)^2`.

This measures an **ordered** two-word relationship, beyond the already-tested isolated lengths. It has a useful interpretation: positive `E` is an excess of adjacent short-short words, negative `E` an avoidance beyond the source's short-word frequency. This is a fixed statistic, and does not depend on guessed plaintext identities.

| Source | GP words | Fraction words <=3 | E |
| --- | ---: | ---: | ---: |
| **LP2 original unsolved, all** | **2,896** | **0.43198** | **+0.007871** |
| LP2 pp0–39 | 2,161 | 0.43498 | +0.010326 |
| LP2 pp40–55 | 735 | 0.42313 | −0.000564 |
| Gibran | 15,733 | 0.5187 | −0.04570 |
| Emerson | 77,932 | 0.5171 | −0.05139 |
| Shakespeare | 55,407 | 0.5042 | −0.02940 |
| Vulgate Latin | 39,835 | 0.3312 | −0.02594 |
| **Beowulf Old English** | **10,885** | **about 0.346** | **+0.02054** |

The CI SFT draws **900 deterministic contiguous length-matched windows per source per target**. On the full original LP2 length (2,896 words) no Gibran/Emerson/Shakespeare/Latin window has `E` as large as +0.007871: the respective upper 99th-percentile `E` values in the exploratory independent same-source calculation are about −0.0369, −0.0410, −0.0161 and −0.0170. **All 900** Beowulf source windows, by contrast, exceed the original (lower 1st-percentile `E` about +0.0153). Both directions recur in pp0–39 and pp40–55 length-matched windows. This is a **finite and highly corpus-dependent contrast**, not a statistical proof against all natural-language originals. Specifically, Old English *Beowulf* is a direct natural-language counterexample to the claim that authentic word-length grammar necessarily avoids short-short pairs. Its overall length frequencies and length-1 occurrence rate still differ from LP2: similarity in one statistic does not imply a Beowulf plaintext.

Two within-source controls: (a) 1,500 fixed-seed shuffles of the original lengths **within each of its nine source-visible chapters** destroy order while preserving each chapter's length multiset; original p0–39 short-short surplus is towards the high tail, whereas pp40–55's surplus is near the shuffle median. (b) A fixed source-native GP29 planted passage passes the older 16-word exact-match original-word-length crib test; this study makes no new decipherment claim from an accidental 7–8-length hit. A separate direct Beowulf length crib scan has **maximum eight** consecutive matching original lengths and **no 11-word** candidate, so it supplies no plausible long known-plaintext crib.

## Adjacent-length transition likelihood and punctuation

An independent 10×10 native-English transition model is trained only on the **first 70%** of Gibran and Emerson, with 0.5 additive smoothing per cell; the score on a whole sequence is the mean `log[P(L_i|L_{i-1}) / P(L_i)]`, giving a direct grammar-over-independent-length comparison. Evaluated without tuning on original LP2, the model scores about **−0.042331 nats / transition**. Pretrained native controls score positive on withheld Gibran (**+0.01099**) and Emerson (**+0.02941**), but Shakespeare's dramatic sample scores **−0.01918**, which confirms substantial genuine language/style variation even *within English*. Over **2,000** independently shuffled original-length sequences, the original score is near the shuffle median (**−0.04030**); roughly **674/2,000** shuffles score no better than the original. Thus this model does not identify the original LP2 word-length stream as preserving the reference English sentence grammar.

Source punctuation adds evidence of a style/register difference: LP2's **175 stops** average **16.55 printed words per stop**, superficially plausible prose, but only approximately **45%** of words after those stops are short (GP length<=3). Gibran and Emerson have about **74–73%** short beginnings after their own sentence stops; Shakespeare behaves differently. LP2 has about **45%** short words just before each stop, whereas Gibran/Emerson have about **22%/21%**. Modern prose often begins sentences with a short article/pronoun, but the manuscript gives no evidence that its stop marks must preserve punctuation after encryption.

## Consequence for solving LP2

The **marginal lengths and plausible sentence widths alone** do not establish preserved English plaintext words. A single strongly mismatched modern reference grammar is not decisive when native Old English and Shakespeare controls differ in the same feature and a full transition model cannot beat randomized original order. The experiment therefore lands in the Director's **overlap/nonidentifiability** branch: retain both (H1) altered-rune classical cipher with preserved original word separators and (H2) artificial or encoded word boundaries as live hypotheses. Do **not** promote an unmotivated non-letterwise cipher architecture on this diagnostic alone. An actual author-source boundary transducer, authentic plaintext crib, or independently specified fixed-rune inverse is necessary to decide.

**Reproduce:** `node sims/lp2_wordlength_grammar_original_sft.cjs` (Node22, CommonJS, no packages). Original corpus, five pinned source controls, immutable xorshift32 seed, frozen chapter labels, 900×source windows, 1,500 chapter-matched shuffles and 2,000 English-transition shuffles are all specified in the executable. [Verified successful Windows 11/Node22 GitHub Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/43285313354), using the [manual-only workflow](../.github/workflows/lp2-wordlength-grammar-original-manual.yml).

**Status:** finite original-boundary discrimination; no unknown LP2 plaintext, source-selected key, or new cipher architecture.
