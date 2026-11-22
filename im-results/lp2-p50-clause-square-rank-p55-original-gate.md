# Original p50 5×5 clause-square rank transposition on the last 75 p55 runes

**Decision:** a finite, previously untested source-selected rank transposition fails to recover original plaintext. This is a negative result for a fixed numerical reading route, without imposing arbitrary glyph substitutions or optimizing a key. [Single-file Windows CJS reproducer](../sims/lp2_p50_clauseprime_frame_rank_p55_sft.cjs). **Windows-latest Node.js 22 CI PASS:** [run 44358707949](https://github.com/FlareZ123/liber-primus/actions/runs/44358707949).

The independent source clue is the *provisional* p57-parable prime-ordinal construction selecting an original 5×5 subrectangle of the 32×8 numeral table at rows21–25, columns1–5, with four corresponding corner values 224/115/73/75 under radix59. The same 25 original printed numerical cells can be sorted into an **ascending rank path**; Cicada's independently authenticated 2014 magic-square stage suggests a player might read a square in numerical order. Original p55 has a one-rune continuation from p54 followed by exactly **75 runes**, which partition into **three consecutive 5×5 squares** with no extra padding. This is the only alignment used.

### Frozen model and original outcome

Sort those 25 printed numeral values in ascending order with row-major tie-breaking. Read each successive 25-rune square in that single rank order; allow ascending or descending order and inverse/direct route conventions, yielding four independent reversible transports. The provisional base59 and conventional base60 readings induce **the identical ordering of all 25 entries**, so radix selection cannot rescue a different rank path here.

| Numeric rank order | Direction | Original GP trigram log-probability per transition |
|---|---|---:|
| Ascending | Read ranked cells | −4.720991 |
| Ascending | Undo ranked cells | −4.580835 |
| Descending | Read ranked cells | −4.352412 |
| Descending | Undo ranked cells | −4.757465 |

The untouched original p55 suffix is **−4.542704**; actual solved p57 75-rune positive control is **−2.540842**, in the same unchanged source-native Shakespeare GP29 trigram model. Every transported rune string is nonprose. The sole apparently improved candidate, −4.352412, remains far from the actual native-language control and gives no legible text, title, or instruction. All four inverse/forward original roundtrips and independently encrypted genuine clear-p57 75/75 positive controls pass. The full 25-value rank order, input and exact output text are printed by the SFT.

**Scope:** this rules out only these fixed *sort-and-read* 5×5 frame routes on the original 75-rune p55 suffix. It neither proves the p57 mathematical square is intentional nor excludes a nonlinear operation, a different recipient or another output register. The sibling [independently tested wordwise perimeter-prime receiver](lp2-p50-perimeter-wordseed-phi-p55-original-gate.md) also fails under its fixed clocks. Both results leave the **authored source-to-cipher decoder**, needed for plaintext recovery, unresolved.
