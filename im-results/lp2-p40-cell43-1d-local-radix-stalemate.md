# P40-selected p50 cell43 token `1D`: exact local three-radix stalemate

**Agent44, 28 November 2026. Classification: source-local radix/receiver ambiguity on an independently selected table cell; no plaintext or key recovered.**

## Independent handoff

The current p40 source route selects p50 physical **cell43** before reading its token: p40's state geometry gives row `g=5`, column `e=3`, i.e. row-major cell `5*8+3=43`. The original cell43 token is:

```text
1D
```

The table's radix remains historically ambiguous: ordinary source-era sexagesimal/base60 and the missing-`f` base59 interpretation both survive globally, while hexadecimal is a visually possible but independently rejected global table reading.

## A new local equality—and its exact rivals

At the selected cell:

```text
hex(1D)    = 29
base59(1D) = 72
base60(1D) = 73
```

The intact punctuation-delimited sentences immediately around the p50 table are independently source-fixed:

```text
before table: 138 runes / 33 words = 72 runes on p48 + 66 on p49
after table:  170 runes / 40 words = 92 runes on p51 + 78 on p52
```

Therefore all three obvious readings land on exact nearby source facts:

```text
29 = GP alphabet size / modulus
72 = p48 rune contribution to the intact pretable sentence
73 = 33 + 40, the total number of complete words in the two table-flanking sentences
```

The `base60(1D)=73` equality appears to be a genuinely fresh local observation, and it is tempting because the token sits inside the table between those two sentences. But it does **not** authenticate base60: the rival base59 value has an equally exact source-visible match at the immediately preceding sentence segment, and hexadecimal lands on the manuscript's fundamental 29-symbol alphabet.

## The 72/73 pair is also one endpoint under zero/one-based word counting

The two intact table-flanking sentences contain `33+40=73` complete words. Therefore the same dual-radix values can be read without choosing between two different source objects:

```text
72 = zero-based index of the final word in a 73-word corpus
73 = one-based count / one-past-end boundary of that same corpus.
```

Exact token `1D` has this `[72,73]` base59/base60 pair at four table cells (43,69,112,226); the p40 route independently selects **43** before token inspection. This makes the ambiguity potentially useful as an endpoint/count convention, but it still does not specify what operation to apply to the 73-word encrypted corpus.
## Decision

Cell43 is now independently selected, but **its token value cannot be used as an independent radix selector or receiver-count instruction** under the natural local count family. Any claim that `1D` means “73 surrounding words” must explain why the equally exact `72` and `29` readings are excluded by another source cue.

This narrows the p40→cell43 continuation. The handoff remains useful as an address, but its printed token does not yet decide whether the next step is base59, base60, hex/GP29, or something nonnumeric.

The result is especially relevant to the intact p48–p52 table-flanking-sentence problem: it links the newly selected cell43 to those source boundaries while simultaneously showing that the link is **radix-ambiguous rather than a decoder**.

Reproducer: [`sims/lp2_p40_cell43_1d_local_radix_stalemate_sft.cjs`](../sims/lp2_p40_cell43_1d_local_radix_stalemate_sft.cjs).


## Successor resolution: the token remains ambiguous, but DIRECTION/SEEK selects base59 for the pointer continuation

The count equalities above remain exact and still show that **`1D` by itself** does not choose a radix. A later, independently constrained operation resolves the narrower question that this report left open.

Cell43's dual-radix forward displacements are uniquely `[29,30]`, the authenticated DIRECTION/SEEK boundary. Their literal word lengths are `[9,4]`. Values72 and73 are both row9 of the eight-column panel, satisfying DIRECTION's length9 without preferring a radix. Requiring SEEK to mean a four-edge pointer walk then separates the codecs: base59 gives `72 -> 161 -> 214 -> 247 -> 189`, exactly four edges to the unique base59 fixed point; base60 from73 cycles and never reaches189.

So the historical/count-based **token stalemate remains**, while the larger p40→cell43→DIRECTION/SEEK pointer grammar now selects **base59 locally**. See [the local base59 gate](lp2-p40-cell43-direction-seek-local-base59-gate.md).
