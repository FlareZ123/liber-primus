# Exact syllable-group capacity gate (#2744)

## Result
The fixed architecture (one printed group per spoken syllable, native GP spelling, no rune or phoneme deletion, length-preserving cipher) fails on all windows of the pinned literary register, even before any particular syllabification alignment is chosen. This is a finite register exclusion, not a universal claim about English or all possible boundary schemes.

| Region | Observed groups | Gibran minimum | Emerson minimum | Shakespeare minimum | Total windows | Joint survivors |
|---|---:|---:|---:|---:|---:|---:|
| Full unknown text | 2896 | 4153 | 4355 | 3966 | 562060 | 0 |
| Opening p0–2 | 158 | 213 | 216 | 196 | 598741 | 0 |
| Terminal p54–55 | 66 | 82 | 84 | 78 | 600004 | 0 |

The full text contains 12956 runes, 83 singleton groups and 531 groups of length at most two. Even the independent lower bounds for each of the latter two statistics exceed the corresponding original counts in every full-register window.

## Method
Use the pinned CMU dictionary 1.1.3 first pronunciation and count vowel nuclei (ARPAbet stress digit); historical counting principle: https://www.nltk.org/book_1ed/ch02.html . Grant every out-of-vocabulary word one syllable. For each complete word with native GP length L and s nuclei, any allocation of its runes into s nonempty groups requires at least s groups, max(0,2s-L) singletons, and max(0,ceil((3s-L)/2)) groups of length at most two. A particular onset/coda assignment cannot reduce these bounds. Grant all contributions of words cut by window endpoints to be zero; even impossible cases s>L are relaxed. Minima in the table are independent lower bounds, not necessarily attained by the same window. No cipher scoring or alignment fitting is needed after the group-count gate fails.

Native controls: LP1 p10–13, 181 words / 755 runes / at least 261 syllables; LP2 p57, 20 words / 95 runes / at least 31 syllables. Source-native GP word calibration matches actual rune groups. Exhaustive 1023 toy partitions confirm the inequalities. Corrected transcript and all input provenance are embedded in the raw output.

- Reproducer: [sims/lp2_syllable_group_capacity_sft.py](../sims/lp2_syllable_group_capacity_sft.py)
- [Raw JSON](lp2-syllable-group-capacity-output.json)
- [Successful CI](https://github.com/FlareZ123/liber-primus/actions/runs/45586039220)

Retire the proposed fixed architecture on this finite register. Merged syllable groups, deleted phonemes/runes, or a different register are outside the tested architecture and require independent motivation. No plaintext or cipher key recovered.
