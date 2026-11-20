# p0 23-cycle → p50 pointer graph → 2016 word-map cross-gate

**Status: bounded exploratory negative. No plaintext, key, or authenticated cross-page operation recovered.** This tests one composition of two provisional maps; it does not promote either map's selector.

## Hypothesis

The p0–2 156-body-word prime-sum map has a source-conditional 23-cycle. The p50 numeral table has a source-conditional base60 successor interpretation. The signed 2016 message says its words are a map and numbers are direction. A plausible composition is:

1. take each of the 23 p0-cycle GP-prime sums modulo 256 as a p50 table address;
2. follow the p50 base60 successor function until its first cycle vertex;
3. decode that vertex (n) as (n=29q+r), with q/r indexing the first 29 words of the signed 2016 message.

The p0 23-cycle sequence is taken unchanged from [the 156-word source-gate report](lp2-13x12-wordmap-23cycle-source-gate.md):

`[220,111,34,336,119,3,563,170,67,209,463,108,244,569,128,237,323,618,277,419,139,143,473]`.

Modulo 256, the 23 start addresses are:

`[220,111,34,80,119,3,51,170,67,209,207,108,244,57,128,237,67,106,21,163,139,143,217]`.

## Exact result

All 23 starts enter the p50 11-cycle basin. Their first cycle-entry vertices, in p0-cycle order, are:

`[115,115,197,115,76,114,76,192,192,115,115,115,76,115,76,115,192,199,115,76,114,115,76]`.

Only six distinct entries occur. Base29 q/r word pairs are:

| Entry | q/r | 2016 words |
|---:|---:|---|
| 115 | 3,28 | LIES / THE |
| 197 | 6,23 | SEEKS / ROAD |
| 76 | 2,18 | PATH / MAP |
| 114 | 3,27 | LIES / ARE |
| 192 | 6,18 | SEEKS / MAP |
| 199 | 6,25 | SEEKS / THEIR |

The resulting 23-pair sequence is dominated by repeated LIES/THE and PATH/MAP entries, with SEEKS/MAP, SEEKS/ROAD, LIES/ARE and SEEKS/THEIR. It is not a readable plaintext sequence. The concentration is expected to be influenced by the large 11-cycle basin and does not independently select the 2016 word-map interpretation.

## Direct key-consumer gate

The 23 entry pairs were converted into these 23-symbol streams:

- q and r coordinates;
- q+r and q−r modulo 29;
- GP0 word sums of the q- and r-selected 2016 words modulo 29;
- GP-prime word sums of those words modulo 29;
- GP rune lengths of those words.

Each stream was tested with both additive signs against the original p0 23-rune receiver at offsets 80–102. All 20 outputs are non-prose. This rejects only these direct additive consumers, not every possible nonlinear or stateful mechanism.

## Selector controls and competing 158-word map

The competing inclusive 158-word map has five-cycle prime sums `[488,126,379,240,147]`, hence p50 start addresses `[232,126,123,240,147]`. All five also enter the same 11-cycle basin, with entries `[199,76,115,115,115]`. The two red-heading prime sums 347 and315, reduced modulo256 to91 and59, likewise enter the 11-cycle (at115 and76). Thus this p50 graph does not discriminate the 156- and 158-word p0 maps.

The p50 graph's 11-cycle basin contains 252/256 states; under uniform independent start addresses, the probability that all 23 land in it is ((252/256)^{23}approx0.696). All-23 convergence is therefore not surprising. The four-state 2-cycle basin `[9,158,227,249]` is missed by every p0 23-cycle start, every 158-map five-cycle start, and both red-heading starts.

## Reproduction recipe

Use the pinned inputs:

- `resources/liber-primus/lp2-grid-256.json` — original 256 base60 table values in `bytes`;
- `resources/historical/cicada2016-4gq25-outguess.asc` — signed message word register;
- `resources/liber-primus/lp2-corpus.json` — canonical GP0 and GP-prime arrays;
- [156-word map report](lp2-13x12-wordmap-23cycle-source-gate.md) — fixed 23-cycle input;
- [p50 graph report](lp2-p50-functional-graph-2016-wordmap.md) — fixed base60 successor and 2016 word-map interpretation.

For each start (s), initialize an empty visited set and repeatedly replace (sleftarrow	exttt{grid.bytes}[s]) until the current address repeats. The first repeated address is the cycle entry. Decode each entry by (q=lfloor n/29floor), (r=nmod29). No offsets, starts, or nonlinear post-processing were tuned.

## Decision

Do not extend this composition by trying more moduli, word transforms, or arbitrary key consumers. It composes two provisional interpretations but provides no plaintext and no independent author-selected instruction. Retain only as a negative cross-gate that prevents the 156/158 p0 map ambiguity from being “resolved” by convergence into p50's large 11-cycle basin.
