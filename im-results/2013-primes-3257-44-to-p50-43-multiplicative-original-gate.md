# Conditional 2013 PRIMES whitespace to p50's 43-byte 193 bracket

**12 November 2026, Agent48. Classification: an independently sourced, *conditional* selector and a finite direct-inverse negative.** An original 2013 participant's `PRIMES` transcript provides one new way to identify the previously observed p50 table bracket. This materially narrows the source-selector question, but does **not** authenticate the subsequent operation, recover unknown LP2 plaintext or establish a Cicada-authored key. The original p55 test below is negative.

## What a 2013 participant could see

The now-recovered [8 January 2013 Pastebin `xGY4pbHV`](https://pastebin.com/raw/xGY4pbHV) preserves 1,387 bytes, SHA-256 `591b3cf337c803eef76a16466fa6ebc711aa1f0a3b26d1520573abda89889a94`. Its first-hand `primes` response prints exactly **284** primes: ordinal 1–20, then 201–464, ending with **3301**. The exact witness has **two double-space anomalies, after 29 and 3257**, giving `29  31` and `3257  3259` in context. This is a 2013 participant paste, without a Cicada signature or server-side capture; it is the earliest preserved source object used here. The independent [hash-checked recovery and its limitations](2013-first-onion-primes-xGY4pbHV-original-source.md) are essential.

**Additional original LP2 cross-chapter anchor:** The p33–39 chapter's repeated original-image Babylonian numeral motif explicitly reads **(55,1)₆₀=3301** and **(17,13)₆₀=1033** under its historically attested left-to-right sexagesimal notation ([original numeral-source audit](issue344-cuneiform-historical-template-gate.md)). Thus a 2014 player also sees **3301 on p33**, independently of the 2013 PRIMES endpoint. Joining p33's authentic 3301 to the earlier original PRIMES double-space at3257 would lead to the same 44th-prime=193 marker on the **different p49–51 table chapter**. This strengthens the *possible* original human navigation chain but does not make subtraction, ordinal lookup or later byte/rune inversion an author-given instruction.

The retrospective reconstructed [first-onion `server.py`](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/004-first-onion/server.py) uses `range(3301)`, which excludes 3301 and ends its printed list at 3299. This difference changes the arithmetic below, and the original 2013 witness ending 3301 must take precedence. The reconstruction can demonstrate what later solvers *thought* the command did; it cannot authenticate the original server.


## Independent original-ISO formatting objection (Agent18, 12 November 2026)

The original 2013 Cicada OS [`prime_echo` script](2013-first-onion-primes-xGY4pbHV-original-source.md#original-2013-iso-line-layout-comparison-agent18-12-november-2026) prints all 464 primes in rows of ten. The PRIMES paste's two double-space values **29** and **3257** are precisely prime ordinals **10** and **460**, the first and last complete original row endings. Of **28** row-ending primes retained in the 284-number paste, **26** have single spaces. The markers therefore align with an independently genuine source formatting convention, but the paste was not a simple unmodified line-break conversion. Their selective emphasis could still be intentional; the missing authored rule is exactly what would distinguish that explanation.

The subsequent 3257→44→193→43 arithmetic and frozen p55 direct-inverse negatives below are unchanged. This cross-source comparison reduces the evidence that the highlighted *left* neighbor is a unique selected operand; neither the OS layout nor the retrospective server recreation instructs endpoint subtraction, prime-ordinal lookup or a p55 cipher operation.

## One discriminating source-to-table step

Reading the source-marked **left** value 3257 as an address relative to the original response endpoint 3301 gives

`3301 − 3257 = 44` and `prime(44) = 193`.

The original pp49–51 numeric table has **256** cells, transcribed as [the source's 32×8 token grid](../resources/liber-primus/lp2-grid-256.json). Under its documented, still *hypothetical*, base60 value interpretation, **193 occurs exactly twice**, as the printed token `3D`, at zero-based row-major offsets **83 and 127**. Their difference is also **44**, with exactly **43 intervening bytes, offsets84–126**. Solved p57 says to shed circumferences, and p55 supplies **43** strict page-local word-interior GP29 runes; that independent 43:43 match is established in the older [integrated p50/p55 report](lp2-2016-p50-p55-43unit-source-selector-gate.md).

**Conditional radix discriminator:** Under the competing literal 59-symbol numeral alphabet obtained by omitting the unused lowercase `f`, both printed `3D` tokens at offsets83/127 represent **190**; numerical **193** instead occurs at offsets **61 and234**, which are **173** apart. Thus the PRIMES marker's derived 44th-prime=193 and 44-cell bracket agree specifically with the **base60** interpretation, whereas the natural base59 alternative fails. This is a consequence of a hypothetical endpoint subtraction; it does not independently prove that Cicada intended the step. A separate original GF29 polynomial factor experiment already conditionally favors base60 ([earlier bounded radix result](p50-p39-p3-field-remainder.md)).

This is a concrete linkage between first-hand 2013 source text and a 2014/2016 manuscript structure. It is stronger than choosing `43` directly because the historical whitespace fixes a specific 2013 number before consulting the p50 table. It remains **retrospective**: no original author instruction says to subtract from the endpoint, index a prime or treat equal table tokens as brackets. An independently chosen alternative matters: taking the *right* neighbor 3259 yields `3301−3259=42`, `prime(42)=181`, and **181 does not appear anywhere in the 256 table bytes**. The first marked value 29 and next value 31 would produce ordinal 3272/3270, outside the original table-byte range. No source forces treating the two marks differently.

There is also a prior, independent but *conditional* **44** construction from p55's 13/31 fold ornament and a reconstructed 2013 NUMBER `+` behavior. That selector already located 193 at83/127, so the new observation is **2013 PRIMES whitespace → endpoint subtraction → prime(44)**, not the table bracket itself; the existing context must be credited rather than rediscovered.

## One new complete direct consumer: GF29 multiplication

The existing [43-byte BASE29 key gate](p50-43byte-base29-p55-interior-key-gate.md) rejected direct additive application of either digit channel. To test a materially different but equally simple arithmetic operation, reduce each original interval byte mod29 to a field scalar. **All 43 scalars are nonzero**, permitting one-to-one multiplication in GP29. Frozen source order, p55 printed order, exact 43 runes, zero phase, no reset, no fitting:

- Interpret as a field-product cipher, `C_i = K_i P_i mod29`; decode `P_i = C_i / K_i mod29`.
- Independently test the opposite, `P_i = K_i C_i mod29`; the encoder divides by `K_i`.

Both have exact bijective forward encoders. These operations are motivated by first-onion prime arithmetic and the independently documented signed 2013 modular DH challenge; **neither source actually instructs multiplication of the p50 bytes into p55 rune values**.

| Frozen consumer | GP29 IoC of 43 output runes | Full output as GP rune tokens |
|---|---:|---|
| Original p55 43 interior ciphertext | 0.0343300111 | Unchanged source |
| Field division `C_i/K_i` | 0.0243632337 | I M S C NG A EO W Y H S F T TH L G G S OE W P O Y AE O A R J L Y B EO E AE I G B D M B T TH U |
| Field multiplication `K_i C_i` | 0.0476190476 | I M IA P I C I T I X TH F C NG C C N M A C R B B EA H OE W J C B O O IA OE EO L TH A M J W B C |

The outputs are complete, preserved in source order; neither is coherent GP-native English across the printed word-interior fragments. On each orientation, the direct encoder re-encrypts **43/43 original runes exactly**, and a separate **43-rune genuine solved p57 plaintext plant** round-trips **43/43**. That validates arithmetic correctness only. The short original IoCs should not be treated as statistically significant improvements, nor should one mistake the letters adjacent to GP digraphs for independently recovered English words.

## Full original 76-rune p55 transfer from the source-marked 44-cell span

A distinct, complete-page interpretation avoids presuming that the 33 p55 exterior runes are already plaintext. The two 193 markers lie exactly 44 cells apart. Reading **the left 193 marker plus the 43 enclosed bytes**, row-major offsets **83–126**, yields a 44-byte key. Reduce each byte mod29 and repeat that key from physical p55 local rune0 over all **76** original source symbols, with **32** key positions consumed after the first cycle. This uses the 2013 marker-derived 44 as a possible key *period* and the historically demonstrated direct GP29 Vigenère direction, but no original author instruction tells the solver to repeat the span or target p55.

Without phase, key rotation, reversal, resynchronization, or a fitted word split, two natural fixed directions give:

| Original-input model | Complete 76-rune IoC | Full original-word-preserving GP output |
|---|---:|---|
| Unchanged p55 original | **0.0378947368** | Encrypted source |
| `P_i=C_i−K_(i mod44)` | **0.0414035088** | TH YLSF WF MEA JSHBEOL SOEEALTHIA UEA SPSRWLSWMOEAEDG NTHEEABT YMOEG PD NGIOEJDTHE LNOEYBPM CM THOECBMF PHTH THLT |
| `P_i=C_i+K_(i mod44)` | **0.0305263158** | J AECX DC NI MNRFNGU XOLXHR PN MXXAPETOWDBBE FEAEAYNP HYTHR JP GYIAUCIEO TNGTHWTDJ EAAE HCSNGLEA RXF OTR |

Neither complete output is coherent GP-native English. Both operations re-encrypt **76/76** original p55 source runes and recover an independently encrypted, genuine **76-rune p57 plaintext plant** exactly. Thus this specific period44 direct key transfer, which would have supplied a reversible rule for *every* p55 symbol including exteriors, is rejected. A different historically attested consumer is required before treating the 44 marker as a full decoder. The SFT covers both this 76-rune gate and the separate 43-interior field-inverse gate above.

**Decision for Director #675:** The formerly missing 2013 PRIMES bytes now supply a *potential* source-specific 44→193 bracket selector, changing the candidate input provenance. **They still do not supply the creator-selected cipher operation, byte addressing convention or p55 insertion rule.** Do not continue with arbitrary multipliers, phases, word rotations or nested encodings. One authentic signed instruction prescribing the 3257→44 action and a reversible use of the 43-byte bracket would justify further work. The separate COUNT responses likewise provide numerical classifications without an authored LP2 decoder.

Reproduction: [passing final source-marker, base59 countermodel, complete p55 76-rune and inner43 original CI 43327481492](https://github.com/FlareZ123/liber-primus/actions/runs/43327481492) and [Node.js 22 CommonJS original-input SFT](../sims/lp2_2013_primes_44_p50_193_p55_multiplicative_sft.cjs), frozen original literal checks, alternative marker control, exact source-cipher round-trips and p57 source-native plant.
