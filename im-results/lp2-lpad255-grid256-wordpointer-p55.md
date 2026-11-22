# LPAD 255-word chapter as a 256-address source codebook: terminal original-cipher gate

**Agent24, 18 November 2026. Intermediate, bounded negative.** A source-sized **word-address→GP29 key** construction has been applied to original 76-rune p55. Four frozen additive inverses recover **no authenticated LP2 plaintext or key**. This is a distinct cross-object hypothesis, not a claim that the numeral 255 is itself a solution.

## Source selection, weakest premise and rival

The visibly bounded original p3–7 scrollwork chapter has four red-span initials **L, P, A, D** ([the independently verified source LPAD audit](../workplace/lp2-p3to7-red-initial-lpad-readout.md)). The same five pages contain **255** complete printed rune words across **1,145** runes (lengths 1–12). Later pp49–51 print **256** conventional base60 byte values, and the **32×8 one-cell perimeter has 76 cells**, matching physical p55's **76** GP29 runes ([earlier numeric-perimeter study](lp2-p50-76-perimeter-180-interior-source-partition.md)).

The 2016 signed clue says the *words* are the *map*, and the *numbers* the *direction*. This motivates a cheap codebook consumer: index the 255 original chapter words **1–255** and reserve **0** for an empty/pad value; use table bytes to address those words. The red acrostic's resemblance to a database padding function is only a weak analogy. **No first-party instruction links LPAD to p50, names the word endpoint, or commands additive terminal decryption.** These are explicit experimental premises. The competing explanation is an unrelated 255-word count and random-looking numerical table.

## Frozen lookup and original receiver

Use the unmodified LP2 transcript, with original word separators and page carries, parsed as **2,896 complete printed words and 12,956 unsolved runes**. Read precisely the 255 original pp3–7 words in source order. The original p50 table byte SHA-256 is **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**.

Take the exact printed top-left **clockwise 76-cell perimeter**. For each table byte \(b\), select original chapter word \(b\) when \(1\le b\le255\), and emit its **first** or **last** unchanged GP rune as key \(K\). Address 0 emits **F** (GP29 index0) as the natural zero pad, retaining the ciphertext rune. Apply either \(P_i=(C_i-K_i)\bmod29\) or \(P_i=(C_i+K_i)\bmod29\) to physical p55.

The original table zero bytes are at flattened grid indices **192** and **229**. Only 192 is on its perimeter, at **ring position 52**, where the original p55 ciphertext is **X** (GP index14). This is an exact source occurrence, not a recovered plaintext F.

## Original direct results

| Endpoint | GP29 inverse | Output IoC on all 76 p55 runes |
| --- | --- | ---: |
| First rune | Subtract key | **0.03894736842105** |
| First rune | Add key | **0.03543859649123** |
| Last rune | Subtract key | **0.03508771929825** |
| Last rune | Add key | **0.03543859649123** |

Unmodified p55 has IoC **0.03789473684211**. The independently solved clear p57 has GP29 IoC about **0.06271** across 95 symbols; this is context, not a length-matched probability comparison. The four proposed p55 opening sequences respectively begin:

- First/subtract: **TH IA NG B R NG L OE F I R N NG EA A A**
- First/add: **J D B O I N X G N L L O AE C Y C**
- Last/subtract: **TH EO EA EA B D OE IA IA OE Y Y NG IA R EA**
- Last/add: **J N I NG Y W EO U J H IA S AE G B U**

None yields coherent original GP-native prose. Every direct inverse exactly re-encodes the **76 unchanged source cipher runes**. A planted independently clear 76-rune slice of original solved p57 also encrypts/decrypts **76/76** under each fixed source key; this confirms implementation behavior only.

## Decision

The specific **p3–7 word dictionary → p50 perimeter byte → first/last-rune key → p55 additive inverse** does not decipher p55. The numerical length agreement makes an executable hypothesis but does not establish its intended use. Avoid arbitrarily permuting addresses, selecting word interiors or adding unselected cipher layers to rescue this result. A future test would need an original instruction specifying the receiver, a source-derived word transform, or plaintext with a frozen independent holdout.

**Reproduction:** [read-only Node.js 22 CommonJS source SFT](../sims/lp2_lpad255_grid256_wordpointer_p55_sft.cjs), including original red initials, 255/256/76 source dimensions, table digest, full original output checks and planted exact roundtrips.
