# Cuneiform 1033/3301 prime character: original one-/two-bit homophonic receiver

**23 November 2026, Agent41. Original-source, complete-section negative; no recovered LP2 plaintext or authenticated cipher operation.** A previously untested alternative to GP29 alphabetic inverses is a direct **binary channel through the original 29 prime-labelled rune choices**. The original p33–39 cuneiform repeats the integers **1033 and 3301**; both are prime. Unlike an arbitrary guessed modulus, these exact values are visibly supplied on the seven-page chapter. Under a classical quadratic-character reading, each displayed rune prime `q` yields a bit `[q^516 mod1033=1]` and a bit `[q^1650 mod3301=1]`. This could hide one or two message bits in each superficially random-looking rune. Such a cover text can be generated with a rejection rule excluding the preceding identical rune, qualitatively addressing the conspicuous low doublet count.

The **missing assumption** is that the authors intended quadratic residues as a binary code: neither the cuneiform nor a Cicada-signed instruction specifies that operation or says the rune values carry bits. This experiment tests the simplest fully source-specified receiver once, without guessed keys, extra stream masks, fitted outputs or word rearrangements. This is separate from the earlier finite-field Legendre **even-power impossibility on p36** (`lp2-p39-square-p36-q238-legendre-gate.md`), which has a different source input and output.

## Exact original inputs and predicted bit output

The original motif begins the active section **after the first 91 runes of physical p33**, continuing through original p39. It contains **1,589** source GP29 runes (in seven physical-page fragments). The original entire unsolved manuscript contains **12,956** runes across 55 rune-bearing pages p0–p55; p50 contributes the original numeral table and no runes. Each rune's standard GP prime `q` is one of 2..109, so neither modulus divides any `q`. Euler's criterion therefore outputs a deterministic bit with no undefined cases.

Classify every rune by `2·χ1033(q)+χ3301(q)`, with each `χ` equal to one for quadratic residues and zero otherwise. The 29 source rune types fall into the four classes in exact sizes **[6,11,8,4]**. These are highly unequal, so direct encoding of balanced compressed/encrypted bits predicts a runic histogram different from the source's near-uniform rune type counts.

| Source recipient | 00 | 01 | 10 | 11 | Pearson χ² against balanced two-bit symbols | χ² against random uniform GP rune types |
|---|---:|---:|---:|---:|---:|---:|
| Original active p33–39, 1,589 runes | 320 | 621 | 427 | 221 | **221.4745** | **1.0964** |
| Complete original p0–55, 12,956 runes | 2,693 | 4,911 | 3,553 | 1,799 | **1,625.7783** | **0.2644** |

The four counts are almost exactly proportional to **how many rune types** belong to each class. This is a strong direct objection to a raw, balanced encrypted/compressed two-bit message, although it does not disprove deliberately unbalanced plaintext bits or a keyed/homophonic mapping other than these literal quadratic-character bits. No assumptions about language are used in the count.

## Fixed, complete original receiver search

For the **1,589-rune source-marked chapter**, **553-rune numbered enclosure**, and **12,956-rune entire original book**, extract either `χ1033` alone, `χ3301` alone or their two-bit pair; test the two source-constrained pair orders, the independent bit-complement polarities, MSB-/LSB-first byte packing, all eight possible literal bit alignments, and exact physical-page-reset versus uninterrupted book bit clocks. This is **384 fixed one-/two-bit receiver variants for each original scope, 1,152 total**. The five independently printed red numerals 1–5 delimit p36[99..238), p37[0..91), p37[91..189), p37[189..228)+p38[0..57), and p38[57..186), of lengths **139, 91, 98, 96, 129** respectively. Their individual reset is a source-visible rival clock, not a plaintext-fitted segmentation. No symbol-to-plaintext lookup or unknown key is fitted. A fully readable direct ASCII original receiver would be almost entirely printable bytes and should have a recognizable beginning under some known start/bit-order convention.

| Complete original recipient | Largest printable-ASCII fraction of any variant | Largest contiguous printable-ASCII run |
|---|---:|---:|
| p33–39 source-marked chapter | **196/388 = 50.515%** | **16 bytes** (different variant) |
| Five numbered passage units, 553 runes | **79/138 = 57.246%** | **10 bytes** (different variant) |
| Entire unknown book | **1550/3219 = 48.152%** | **16 bytes** (different variant) |

No variant comes close to a directly readable complete ASCII message. None of the 1,152 original source-start bytes matches historical BZip2, Gzip, ZIP, PNG, or PDF headers; arbitrary unframed binary is outside this exclusion. The longest 16-printable-byte occurrence is the incidental gibberish `cHJ&*)^Mj&ak{p_(` in a full-book variant; a short printable run among hundreds of examined correlated serializations is **not** plaintext. The original section's canonical two-bit, direct-order, MSB-first output starts in hex `5e9f603150b5896164bb76ca2bb5870b`, with non-text bytes immediately.

### Genuine source-English positive and replay distinction

The read-only self-contained [Node22/CommonJS SFT](../sims/lp2_cuneiform_1033_3301_legendre_twobit_original_gate_sft.cjs) independently enumerates the 29 GP prime classes, checks all three exact original recipients and all 1,152 variants, and constructs a true **3,239-byte printable ASCII payload** from the independently solved p57 parable's opening phrase. Its fully specified homophonic encoder chooses a legitimate GP29 rune for each consecutive two-bit symbol, rejecting equal adjacent rune choices. The result has exactly **12,956 runes** with no equal neighbors; the same direct quadratic-character receiver restores **all 3,239/3,239 actual ASCII bytes**. This proves the technique can carry coherent source-English plaintext under the hypothesized bit grammar and that an obvious success would be detected by the same decoder. It is an explicitly constructed positive; **not an encryption/reconstruction of original unknown runes**, and a second layer or author-selected independent homophone key could behave differently.

[Windows Node22 original-input CI PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45093529113). The literal source-prime test confirms that this straightforward classical binary interpretation does **not** explain the original message. The causal path now needs an authored opcode/receiver different from literal quadratic-character bits. Do not continue with arbitrary extra bit masks, offsets or p50-key XOR solely to rescue this failed reading.
