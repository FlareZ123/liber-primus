# PARABLE edge-75 key against the carried p55 body

**Classification (17 November 2026, Agent21): source-exact cardinality and a bounded direct-key negative. No unknown LP2 plaintext, authentic key, cipher or destination was recovered.**

## Observable instruction and exact original input

The genuinely solved physical p57 says **“WE MUST SHED OUR OWN CIRCUMFERENCES.”** Counting its physical printed text **including the heading PARABLE**, p57 contains 95 authentic GP29 rune glyphs in **20 complete words**, with lengths `[7,4,2,6,7,2,2,7,2,4,4,3,3,14,4,2,8,5,3,6]`. Its clear 95-rune stream agrees exactly between `lp2-transcription.txt` and `lp2-corpus.json`.

The immediately preceding physical p55 has exactly **76** runes. Its initial **NG** is an original word carried in from p54, and the remaining **75** p55 glyphs occupy 16 complete printed words. This creates a simple *conditional* length match:

```
p57: 95 original runes − one leading/trailing rune from each of 20 words = 75
p55: 76 original runes − one carried NG glyph = 75
```

One could imagine a player reading `shed circumferences` as an instruction to trim an edge per complete p57 word, then using the surviving 75 GP29 values to unmask the adjacent 75 p55 glyphs. This is **weaker than an authored instruction**: the actual phrase says circumferences in the plural, does not choose first versus last edge, and does not specify Vigenère, sign, clock or the use of the heading word. The match was noticed retrospectively, and direct one-edge trimming is therefore only an explicitly bounded candidate. **Importantly,** the more literal removal of *both* word edges leaves **55** PARABLE runes. That distinct, independently published source analysis already supplies a conditional 55-step prime-totient page walk that ends at p49, or Josephus elimination that leaves p50 ([prior source navigation gate](lp2-parable55-totient-josephus-p50-original-route.md)). The earlier 55-rune result has a stronger reading of the actual wording; it neither endorses this new half-shell 75 alignment nor supplies its missing value-changing opcode.

## Frozen direct-key test

Parse all p57 printed words with physical line continuations joined. Form two candidate 75-rune keys, respectively deleting the **first** or **last** rune of every word, retaining source order and the PARABLE heading. Freeze the p55 operand to its exact glyphs **after** the incoming NG. Test only conventional GP29 additive receivers `P=(C−K) mod29` and `P=(C+K) mod29`, with no rotation, word-local reset, external keystream, key derivation, hidden F bypass, phrase search or resegmentation.

| p57 one-edge deletion | Cipher receiver | Original p55 75-rune output GP29 IoC | Typed output |
| --- | --- | ---: | --- |
| First rune of each complete word | C−K | **0.039639639640** | No coherent GP29 prose |
| First rune of each complete word | C+K | **0.034234234234** | No coherent GP29 prose |
| Last rune of each complete word | C−K | **0.033513513514** | No coherent GP29 prose |
| Last rune of each complete word | C+K | **0.038198198198** | No coherent GP29 prose |

For comparison, the exact **21 sliding 75-rune windows** of clear original p57 have a GP29 IoC of **0.059459459459** or greater; entire p57 has **0.062709966405**. A 75-rune sample is small, so IoC alone would not be a universal language rejection. Here every complete source-ordered proposed plaintext also lacks a recognizable sentence. The reproducer prints all four complete Latin transliterations for inspection and asserts the numerical results, exact source word boundaries and full reversible modular encryption for each candidate. Round-trip is only an arithmetic control.

**Original-source reproduction:** [single-file CommonJS SFT](../sims/lp2_p57_edge75_p55_carry_source_sft.cjs), [passing original-resource Node22 CI run 43987830151](https://github.com/FlareZ123/liber-primus/actions/runs/43987830151). It uses `resources/liber-primus/lp2-transcription.txt` and `resources/liber-primus/lp2-corpus.json`, reading the real 29th GP rune IA correctly and retaining the p54→55 carried word. No alternate base alphabet is fitted.

## Decision

**Retire the precisely declared original p57 one-edge 75-rune additive pad for p55.** Its exact length agreement is an observable source alignment but does not reveal a decipherment operation. It gives no independent reason for choosing one edge, an F-skip law or a 75-position receiver. A viable successor would require new source-specific instructions selecting a distinct reversible transformation plus a blind original plaintext prediction. This has no bearing on other circumference, table-perimeter or 43-interior mechanisms already scoped separately.
