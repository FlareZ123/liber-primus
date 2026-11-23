# GP29 digraph ambiguity: reversible binary and whole-word carriers, no recovered key or plaintext

**Agent7, 23 November 2026 · [Director #2424](https://github.com/FlareZ123/liber-primus/issues/2424) · Scope:** original 55 rune-bearing unknown LP2 physical pages p0–55, unaltered 12,956 runes and 2,896 printed complete words. This is a source-typed **candidate hidden channel** with a genuine reversible positive plant. **No original plaintext, creator-selected key, deciphering instruction or Cicada destination was found.** The mechanism's capacity is demonstrable, while its use by the 2014 author is unsupported.

## First-party source fact, compared against #2420's geometry result

The published Gematria Primus chart gives 22 one-Latin-letter runes and seven two-letter runes TH, EO, NG, OE, AE, IA, EA. #2420 established that applying a canonical greedy Latin→GP renderer to the original ciphertext spellings fails on **175** of **2,896** printed words: 97 words lose 100 printed rune positions; 78 words retain the same length but change rune boundaries. This is a property of the original ciphertext, and a *natural random-cipher baseline* is an independent alternative to any embedded payload. [Earlier 1,200-shuffle null](lp2-prerune-latin26-divinity-original-geometry-gate.md) already found these exception counts unremarkable.

A previously under-tested **exactly two-rune, fixed-length** part of the ambiguity has a more promising reversible geometry. There are **seven** Latin three-letter sequences that can each be printed using either (digraph + singleton) or (singleton + digraph), always in exactly two GP29 rune slots:

| Three Latin letters | Left-pair interpretation (bit 0) | Right-pair interpretation (bit 1) |
|---|---|---|
| EOE | EO + E | E + OE |
| OEO | OE + O | O + EO |
| OEA | OE + A | O + EA |
| AEO | AE + O | A + EO |
| AEA | AE + A | A + EA |
| IAE | IA + E | I + AE |
| EAE | EA + E | E + AE |

Thus a *public*, completely reversible binary-choice **carrier** can exist without a private Latin26 table, an extra physical rune, a changed printed word length, or oracle plaintext. Physical GP rune segmentation already records the two-way choice. Its proposed message readout is a new, separable hypothesis: concatenate left=0/right=1 in actual book and word reading order. A human could notice these two-glyph spelling equivalences from the original rune chart. Yet **no independently dated first-party instruction specifies that bit convention, bit frame, consumer, or even directs the solver to inspect these rare triples**.

## Exact source census and solved controls

The nine original illustrated chapters and word boundaries were retained verbatim. Source-determined word counts and all noncanonical greedy re-tokenizations:

| Original page chapter | Source words | Noncanonical words | Fewer rune slots | Same-length different pair |
|---|---:|---:|---:|---:|
| p0–2 | 158 | 7 | 6 | 1 |
| p3–7 | 255 | 7 | 3 | 4 |
| p8–14 | 383 | 28 | 17 | 11 |
| p15–22 | 437 | 29 | 15 | 14 |
| p23–26 | 224 | 17 | 11 | 6 |
| p27–32 | 326 | 17 | 10 | 7 |
| p33–39 | 378 | 18 | 9 | 9 |
| p40–53 | 669 | 46 | 23 | 23 |
| p54–55 | 66 | 6 | 3 | 3 |
| **Total** | **2,896** | **175** | **97** | **78** |

There are **50** whole printed words touching an original colored-red span, of which **three** are noncanonical; the other **172** noncanonical words are outside those spans. The three red examples are the original p0 opening word SHEOGMIAF, p15 AEAYOEA, and p33 XCFIAWHG (chart spellings, **not decoded English**). These red positions do not supply a universal explicit escape marker, and unchanged physical punctuation does not fix a missing decoder.

Across **all adjacent two-rune pairs within printed words**, **170** have one of the seven two-way overlapping triple spellings: **84 left** versus **86 right**. A deterministic left-to-right scan that never double-counts a shared rune yields **162 nonoverlapping sites**, with **79 left/83 right**. For robust *independent bit insertion*, retain only sites whose individual flip preserves every detected site coordinate in that source word, with at least one intervening rune between retained two-rune sites. This source-only geometry filter leaves **154 stable sites**, enough for **19 full bytes plus two bits**.

All **740 solved-native original-source words**, across nine separately preserved solved texts including LP1, p56 and direct-clear p57, contain **zero** overlapping three-letter pair sites under the same parser. Their ordinary English spellings do not provide a live example of the proposed secret hidden-bit channel. The seven triples are rare in natural English. Their abundant occurrence in the unknown near-uniform cipher is not itself a plaintext decoding.

## Independent reversible 128-bit positive

The exact original source tape was frozen *before* planting. Take the first 16 ASCII bytes of genuinely solved p57's first sentence, **`LIKE THE INSTAR `**. Convert each byte MSB-first and use its **128** bits to replace the first 128 safe source pairs with their left or right two-rune interpretation. The plant changes **126 original GP rune positions**; all **2,896** printed word lengths, all 12,956 rune slots, and *every word's entire expanded Latin spelling* remain identical. All original site locations remain identical under a fresh independent scan. Without access to the donor text, the same public decoder recovers **all 128 bits** and every ASCII byte exactly. This proves a genuine capacity and a correct source-shaped inverse, not that the unknown original carried the donor.

The **unchanged** original 154-bit readout under that frozen convention begins with the 19 complete bytes:

```text
8c dd bd 5b 04 e7 dc 04 c7 e4 23 df e9 0c de 1c 59 35 87
```

Only **4/19** bytes are printable ASCII in direct MSB order; literal within-byte reversal and bit complementation also produce no connected natural-language message. No heading, red dot, or solved-page operator independently selects a different framing. It would be unjustified to hunt arbitrary offsets/keys or declare the random-looking bytes a hidden payload.

## Stronger exact-word mixed-radix register (subsequent code extension)

The initial 154-bit subset is **not the maximum source-geometry-preserving capacity**. A later extension in the same [CommonJS reproducer](../sims/lp2_gp29_digraph_overlap_hiddenbit_original_sft.cjs) exhaustively enumerates every GP29 tokenization of each original whole-word *Latin spelling* having exactly its printed number of rune slots, with a deterministic source-chart index order. **204 of 2,896** printed words admit multiple choices, **54** admit more than two, and no word has more than **seven**. The product of these wordwise radices exceeds 2^248, permitting an arbitrary **31-byte** payload under this mathematical carrier. The unchanged original mixed-radix rank is exactly `0x18d11b78ee49747821c208d169910de9e849127bc0c8e87c9ad5e93dc257da1` (a 249-bit integer).

The updated code reconstitutes all **2,896 original words** from that rank, and a separately planted **31-byte** solved-p57 excerpt (`LIKE THE INSTAR TUNNELING TO TH`) is recovered byte-for-byte while retaining each printed word's GP rune count and expanded Latin letters. This is an *encoding-capacity demonstration*. The numerical rank is fully determined by observed ciphertext segmentation; assigning it to an ASCII frame, a cryptographic key or a creator-authored hidden message would require an independent instruction. The exact original rank produces **no demonstrated message or genuine original-page plaintext**. The subsequent code extension postdates the linked Windows job for the smaller 128-bit test; that job must not be cited as execution evidence for the expanded assertions.

## Exact original-distribution null

A frozen **1,000-trial** xorshift32/Fisher–Yates null (`0x33012026`) independently permutes the genuine GP rune identities **within each of the nine source chapters**, preserving those original glyph inventories and the exact 2,896 printed word lengths. The same deterministic left-to-right nonoverlap scanner yields:

| Measurement | Original | Null mean | Null SD | Add-one upper-tail probability |
|---|---:|---:|---:|---:|
| Nonoverlapping three-letter carrier sites | **162** | **166.653** | 11.837 | **0.6513** |
| Of those, right-pair bits | **83** | **81.427** | 8.659 | **0.4456** |

The source data are therefore **not enriched** in the proposed ambiguity sites and show no evidence of a deliberately selected bit orientation distribution. A cryptographically encrypted hidden key would also appear random, so these comparisons cannot rule out a concealed source-selected payload. Their correct consequence is that **the mere presence of 154 reversible carrier sites is no evidence that this carrier was actually used.**

## Decision on Director #2424

The exact chart alone provides two genuine reversible *local* rune pair encodings. It supplies **no deterministic, source-authorized rule for all 175 original noncanonical words**: 97 shrink when greedily rendered and require an additional method or lossless framing, and the remaining 78 may involve multiple overlapping choices. Physical word boundaries and red accents do not fix those choices as a deciphering operation. Both the binary subset and the expanded exact-word rank therefore fail #2424's necessary external-opcode gate; the literal binary original readout also has no natural-language interpretation. No 150-rune original p16–21 plaintext or 200-rune p40–53 holdout is available; inventing a payload or fitting an unconstrained key would only conceal that absence.

**Preserve these carriers as *bounded optional source-native steganographic primitives*, not asserted messages or author-selected ciphers.** A successor is useful only if an independently authenticated Cicada clue selects GP overlapping digraph spelling, a concrete binary convention and an original receiver, so that the **same frozen 154-bit original readout** can be tested without retrospective selection. Otherwise redirect resources to keys and substantive cipher operations.

**Reproducer and independent execution:** initial binary-subset [Windows Node.js 22 PASS, Actions run 45259358597](https://github.com/FlareZ123/liber-primus/actions/runs/45259358597) · [single-file complete original input, 740 solved controls, 128-bit plant and 1,000-trial null](../sims/lp2_gp29_digraph_overlap_hiddenbit_original_sft.cjs). The source files are `resources/liber-primus/lp2-corpus.json`, `lp2-transcription.txt`, `lp2-ink-annotations.json` (classification), and `resources/external/relikd-solved-gp29-native-v1.json`.
