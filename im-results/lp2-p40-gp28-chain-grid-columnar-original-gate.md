# LP2 p40–53 terminal GP29 chain → red8 transposition → grid28 inverse

**Agent40, 13 November 2026. Director [#696](https://github.com/FlareZ123/liber-primus/issues/696), complete original-input finite negative.** One frozen composite directly implements the three-stage order chosen by the Director. It reconstructs every ciphertext rune and passes native and exception-bearing plants; it **does not** recover unknown text, a historical source key, a verified cipher architecture, or a destination.

## Source-constrained motivation and prior-work boundary

The original LP2 physical p40–53 chapter begins with eight red heading runes (indices `0,9,19,26,6,23,25,8`), yielding the unique sort `[0,4,7,1,2,5,6,3]`. The remaining **3,000** source GP29 runes form a complete 375×8 columnar frame. Original physical pp49–51 print a 32×8, 256-cell table, conditionally interpreted as conventional base60 bytes in physical page-major row-major order.

Previous #657 tested original **columnar + GP29 additive table** and failed. #676 ruled out arbitrary **static repeated 256-cell GP29 permutations** for finite native-English controls. #684 found no historically selected table-state recurrence, while Agent19's original-input layer-order check showed **18** printed adjacent repeats versus **101** after reversing source-keyed columnar. None tested the present *terminal predecessor-chain + columnar + GP28 byte key* on this complete original text, so this test is genuinely distinct.

A historically known 2014 GP29 arithmetic step and separate columnar operation motivate combining operations, but no Cicada-authenticated source explicitly selects this exact cascade, maps identical adjacent runes to EA, or makes the 256 table bytes into a GP28 key. Accordingly, a mathematically valid inverse alone cannot count as authorial identification.

## Exact frozen reversible operation

Use `C[0..2999]` as the unmodified original p40–53 body. The preceding final red heading rune is index `8`, so `C[-1]=8` and `Δ[i]=(C[i]-C[i-1]) mod29`. For `Δ=0`, emit the distinguished GP rune **EA** (index28); otherwise map `Δ∈1..28` to a GP28 codeword `Δ−1∈0..27`. **No glyph is dropped** for an exception. Exactly 18 equal-adjacent original body transitions result in 18 zero steps, none at the first position.

Next split these 3,000 GP28-or-EA codewords into eight consecutive 375-rune blocks in red-heading-sorted column order `[0,4,7,1,2,5,6,3]`, restore columns 0..7, and read 375×8 row-major. At original restored `(row,col)`, if the rune is EA, preserve it; otherwise subtract `grid[8*(row mod32)+col] mod28` modulo28. The resulting GP28 index 0..27 or EA index28 is the complete candidate output. No phase, sign, zero symbol, table reorder, exceptional clock, page reset, or alphabet was optimized.

Forward inversion adds the same residue modulo28, restores the sorted block readout, sends GP28 rank `r` to step `r+1`, EA to zero step, then sums the 3,000 steps modulo29 from the original heading IV8. This reconstructs **3000/3000** original runes exactly, including all 18 zero differences. The fully independent solved-p57 3,000-rune repeated native GP plant and a separate plant with **18 EA positions** each recover 3,000/3,000, as asserted in the SFT. The original-source 2014 transposition/key sign remains unselected for the new GP28 application; fixed values here are hypotheses rather than authenticated commands.

## Original output and discriminating controls

| Quantity | Result |
| --- | ---: |
| Printed source body GP29 IoC | 0.034544403690 |
| Complete decoded 3,000-rune IoC | 0.035371346004 |
| Decoded last 300 **row-major** IoC | 0.035741360089 |
| Decoded 300 final **source-ciphertext-order** mapped rune IoC | 0.035161649944 |
| Wrong reversed-table key decoded IoC | 0.035278203846 |
| Wrong-key decoder → authentic-key encoder mismatch | 2897/3000 |
| Independently solved p57-native 3,000-rune repeat-plant IoC | 0.072106035345 |
| Original exceptions retained as EA | 18/18 |

A separately preserved native GP transliteration of the first 3,000 original source Gibran runes has **IoC 0.059365344004** (including the source's Gutenberg front matter), independently computed without fitting the decoder. The genuine p57 repeat plant has 0.072106035345. By comparison, the decoded full chapter's IoC 0.035371346004 remains close to a uniform 29-rune stream. Its 28 ordinary rune frequencies span **87–125** counts; the 18 EA exceptions occur only at the zero steps. No long recognizable native words, coherent sentences or Cicada instruction appear, including the untouched terminal p53 red block.

The GP transliteration begins (first 200 runes):

`HNGJWJEELNYNEOMWFTHMPNGSTWNGOEXUPNOEDORWNGIACOEWTHEOWBAEFFOFEXTUREAEOAUJTTWHXFRDXRADUXTHTHJJTMBBTHFCEMCTDMWOIAALOEOEOELSXAERNGAEHXPEODYDHTDXOEETHWMFORTDDAJNGHTNRCWCHAECHIEAOEMFRHNTTHETHCYHOTHXGOADELNGTHOTXUOEMEONGBIAWYIAUEUUOEOIAETHNGNCTMGEOEBMT`

The **last 300 original ciphertext positions**, mapped one by one to their actual separated row-major output positions, begin:

`SCPBCXNBGHAPIFSBNGGOUWRXGEYEAYREOPXSDDWXREOXUUJECEHTHHFNGIAJCEOIONGBTHBIAHRXBNLBJOTHEOEOGOEPPWGJYMWDBTHTEAENGNGTHEOLAYOESH`

The original p53 51-rune red closing span, projected in its printed source order through the composite inverse, reads:

`SHMMGJEOTHEOEORFAHBACCXBAFEOTHDGNMAEIAMUIALPAXNGAEEFLWTFIAEOARIB`

The sorted column inverse destroys the original printed word adjacency, so retaining spaces at their unchanged printed offsets would conflate ciphertext and proposed plaintext word positions; neither decoded row-major order nor the red closing span provides a usable word-boundary reading. Word boundaries were neither discarded from the source nor used as tuneable selectors. The 300-position source-order holdout and 300-row-major terminal sample both remain ciphertext-like.

## Entire 3,000-rune decoded candidate

Below are all **3,000** candidate GP symbols in exact decoder *row-major* position order, 100 runes per line. Hyphens separate rune tokens (e.g., `NG`, `IA`, `EA` each count as one token); line breaks are display-only and carry **no** decipherment significance.

```text
H-NG-J-W-J-E-E-L-N-Y-N-EO-M-W-F-TH-M-P-NG-S-T-W-NG-OE-X-U-P-N-OE-D-O-R-W-NG-IA-C-OE-W-TH-EO-W-B-AE-F-F-O-F-E-X-T-U-R-E-AE-O-A-U-J-T-T-W-H-X-F-R-D-X-R-A-D-U-X-TH-TH-J-J-T-M-B-B-TH-F-C-E-M-C-T-D-M-W-O-IA-A-L-OE-OE-OE-L-S-X
AE-R-NG-AE-H-X-P-EO-D-Y-D-H-T-D-X-OE-E-TH-W-M-F-O-R-T-D-D-A-J-NG-H-T-N-R-C-W-C-H-AE-C-H-I-E-A-OE-M-F-R-H-N-T-TH-E-TH-C-Y-H-O-TH-X-G-O-A-D-E-L-NG-TH-O-T-X-U-OE-M-EO-NG-B-IA-W-Y-IA-U-E-U-U-OE-O-I-AE-TH-NG-N-C-T-M-G-E-OE-B-M-T
M-AE-X-E-R-Y-M-I-J-E-T-P-O-N-X-NG-M-AE-O-S-J-D-E-OE-AE-EO-C-X-B-O-J-B-NG-D-A-Y-N-P-S-M-T-AE-T-L-OE-S-A-IA-J-N-P-A-EO-M-H-Y-N-OE-M-B-L-W-S-W-M-X-NG-EO-U-N-G-P-O-G-F-N-W-B-I-C-O-AE-OE-R-T-Y-T-N-D-OE-S-D-N-J-EO-TH-AE-R-B-OE
B-D-R-NG-J-D-L-U-X-F-G-N-G-NG-T-R-H-H-X-X-A-S-X-F-H-N-A-E-L-J-EA-D-S-I-IA-H-F-J-E-IA-S-OE-IA-M-NG-P-R-C-U-H-AE-C-OE-Y-X-D-N-Y-TH-R-E-G-IA-E-OE-OE-O-NG-EO-P-TH-P-C-NG-L-I-R-NG-H-M-TH-F-U-H-Y-TH-W-I-J-U-A-D-D-A-NG-W-IA-TH-NG-F
D-O-W-D-IA-N-OE-C-X-A-T-Y-OE-S-T-O-U-OE-E-OE-L-T-T-I-I-E-L-W-I-F-NG-AE-NG-P-T-B-N-NG-IA-U-B-J-M-R-E-D-TH-I-M-M-L-W-A-O-IA-NG-OE-NG-G-E-EO-E-M-B-T-O-D-D-D-EO-C-NG-AE-R-R-E-B-B-B-M-A-D-OE-NG-G-OE-M-X-C-I-L-E-Y-F-B-N-TH-O-N-M
T-R-N-Y-G-D-U-G-N-NG-EO-TH-O-X-OE-G-L-EO-IA-T-M-L-M-OE-A-B-D-E-AE-R-NG-TH-R-E-W-A-N-OE-TH-F-TH-G-M-M-I-G-NG-T-N-EO-EO-D-I-EA-E-O-AE-H-F-H-U-U-O-NG-B-U-J-EO-G-J-L-P-S-IA-NG-B-G-L-P-IA-G-AE-F-L-OE-IA-A-I-E-EO-NG-S-U-M-E-EO-E-OE-S-X
Y-E-NG-S-Y-A-G-F-D-D-E-C-S-EA-NG-Y-S-F-X-P-M-B-F-E-AE-J-N-B-F-T-C-M-E-X-IA-C-H-NG-S-D-Y-W-R-X-J-NG-C-C-OE-Y-T-N-F-J-OE-AE-R-NG-S-B-T-E-B-A-EO-N-EO-G-G-D-EO-S-U-NG-B-H-H-A-U-EO-P-N-P-A-NG-N-R-M-NG-F-N-P-AE-OE-M-AE-NG-P-W-I
T-O-I-I-B-W-M-F-X-B-OE-L-E-G-F-S-M-IA-L-C-I-G-OE-B-OE-P-M-A-Y-H-I-NG-OE-D-C-I-L-G-R-G-H-M-AE-J-X-A-C-O-R-G-T-B-O-X-EO-U-OE-J-EO-H-U-NG-OE-W-OE-T-S-X-R-P-M-R-OE-AE-N-O-X-H-W-X-W-X-M-A-B-G-I-G-W-J-N-S-I-I-H-E-Y-P-N-T
EO-P-M-Y-D-U-A-D-Y-TH-C-EA-R-G-T-IA-M-NG-R-Y-EO-A-EO-O-OE-Y-M-R-B-E-NG-J-P-O-R-EO-I-H-F-O-G-O-F-P-D-O-D-W-NG-I-M-X-F-AE-C-IA-X-A-IA-S-I-P-N-J-W-F-O-D-IA-G-H-D-G-IA-R-D-U-B-U-L-I-TH-U-W-Y-E-EO-EA-A-R-F-X-A-C-TH-B-IA-S-F-R
EO-O-C-AE-I-C-NG-EO-L-U-B-U-TH-P-J-X-OE-AE-Y-S-Y-F-EO-U-IA-P-M-L-T-Y-B-U-OE-T-EO-I-D-AE-F-J-EA-M-L-G-OE-Y-R-E-W-D-I-Y-L-H-O-C-F-L-EO-H-E-F-L-E-S-NG-C-Y-AE-J-T-H-P-H-M-R-U-Y-T-TH-C-M-N-OE-D-L-O-H-NG-IA-OE-D-L-M-I-F-C-Y-L-U
U-H-D-NG-AE-C-M-U-G-OE-EO-IA-P-NG-F-TH-I-IA-L-J-T-L-Y-X-Y-N-P-C-H-N-M-N-E-D-G-EO-P-P-IA-NG-S-E-W-I-I-F-G-NG-L-Y-P-O-C-D-E-J-W-M-O-NG-AE-U-O-L-F-F-L-B-IA-Y-O-F-OE-A-EO-TH-EO-W-O-X-OE-L-O-B-B-IA-IA-I-W-L-EO-IA-W-EA-L-EO-OE-F-F-H
B-S-Y-T-E-E-M-R-NG-X-T-S-X-E-S-X-J-AE-H-EO-W-L-N-B-Y-NG-P-EO-L-M-A-N-J-EO-W-M-W-X-C-L-M-A-J-O-R-NG-NG-B-EA-R-NG-Y-T-B-D-J-B-IA-EO-N-I-NG-Y-O-U-OE-U-R-G-Y-TH-TH-Y-L-B-U-X-L-A-EO-NG-N-U-R-E-IA-F-EO-O-T-Y-EO-M-U-J-G-O-G-D-O
W-C-AE-OE-M-Y-IA-B-NG-R-I-P-N-NG-B-R-OE-E-IA-P-N-TH-F-L-H-U-NG-W-Y-J-TH-P-EO-IA-E-G-EO-M-L-B-H-D-AE-J-I-Y-G-R-T-NG-TH-Y-P-O-J-A-X-EO-AE-M-L-W-G-F-OE-U-C-W-N-OE-TH-Y-EO-TH-D-D-AE-U-B-T-M-G-S-B-TH-Y-IA-A-N-E-H-TH-L-D-N-NG-AE-W-E-T
Y-D-P-M-S-NG-TH-E-L-M-D-OE-M-X-AE-AE-NG-AE-T-IA-P-U-N-NG-O-F-G-OE-OE-P-O-NG-X-R-U-W-R-N-A-TH-R-IA-M-G-A-TH-W-EO-C-S-E-M-OE-E-IA-L-W-F-U-H-G-N-NG-A-Y-TH-W-N-R-B-S-Y-T-TH-N-EA-B-W-P-OE-X-T-P-G-Y-TH-X-S-I-N-B-AE-F-W-NG-H-AE-IA-R-B
H-T-TH-J-J-X-O-W-I-G-W-AE-R-AE-D-G-G-U-S-EO-E-U-NG-A-E-S-U-J-F-TH-A-E-TH-AE-C-L-R-B-TH-G-G-F-IA-G-U-R-T-R-A-EA-OE-H-AE-T-NG-G-P-P-U-OE-D-S-M-P-E-TH-H-P-S-C-E-M-E-F-U-X-Y-B-TH-H-P-F-W-N-W-L-S-G-P-I-T-E-Y-U-H-L-F-M-M-W
D-X-OE-B-M-W-P-U-X-H-E-EO-IA-I-EO-X-E-EO-TH-E-W-B-P-J-O-EO-I-H-F-W-N-N-R-EO-Y-L-H-I-N-OE-W-Y-S-C-F-R-I-O-U-NG-Y-G-TH-NG-X-EO-W-S-P-TH-AE-B-H-P-N-C-J-S-C-S-EA-L-Y-EO-P-L-OE-G-W-D-C-T-C-H-Y-W-Y-IA-S-EO-B-R-W-G-T-EO-B-L-C-D
R-I-J-R-OE-Y-NG-D-A-P-B-OE-N-EO-TH-J-I-E-H-L-X-S-NG-Y-N-EO-R-U-C-W-AE-H-F-T-T-OE-C-S-H-H-O-EO-B-TH-L-U-Y-G-AE-F-A-A-I-B-S-AE-U-P-I-N-C-IA-F-D-EO-U-T-X-G-TH-P-C-IA-B-AE-C-I-U-N-O-X-Y-NG-I-L-D-J-J-F-T-B-AE-I-P-NG-U-O-Y-Y-E
TH-Y-AE-OE-G-F-X-N-IA-E-E-G-TH-G-A-B-H-M-TH-EA-W-J-P-U-T-B-W-R-P-T-AE-C-M-H-M-OE-A-A-EO-O-T-U-EA-C-Y-IA-G-OE-OE-T-G-TH-N-S-G-NG-E-L-L-TH-S-C-Y-B-EO-EO-NG-X-L-O-U-C-T-AE-R-G-N-S-F-F-R-X-L-B-IA-A-OE-TH-P-L-N-I-O-E-B-F-B-J-G-N
C-H-S-F-A-G-N-NG-I-U-X-C-T-B-I-OE-P-A-J-S-T-I-B-X-E-F-J-Y-E-W-TH-C-W-L-E-U-EO-G-J-O-U-EO-P-AE-X-O-U-D-S-J-T-O-E-AE-I-TH-M-H-NG-O-Y-P-NG-T-N-R-E-D-AE-U-H-OE-X-U-B-U-O-Y-B-F-A-OE-U-O-H-W-C-AE-I-H-U-J-D-R-C-E-D-B-D-AE
P-D-OE-M-B-R-E-J-X-AE-H-NG-B-E-AE-S-E-G-F-NG-H-D-D-EO-AE-Y-D-S-H-I-X-G-O-J-E-S-EO-N-J-R-U-X-N-M-R-EO-R-X-F-T-L-Y-L-N-A-TH-R-D-S-EO-P-A-X-D-O-B-U-Y-S-J-OE-TH-X-O-Y-J-T-X-L-EO-EO-E-Y-X-A-T-O-C-Y-R-M-T-D-I-B-NG-R-C-E-C
OE-N-OE-N-L-H-H-X-O-M-F-H-X-J-D-P-Y-IA-NG-B-W-L-P-U-T-P-L-J-C-A-S-I-B-I-OE-N-S-J-OE-NG-U-A-X-O-Y-B-J-OE-P-X-N-J-I-M-G-N-M-OE-E-L-AE-T-E-N-U-IA-F-X-N-J-OE-I-G-R-Y-AE-W-P-D-Y-X-OE-F-I-OE-E-X-L-O-Y-AE-H-B-TH-D-AE-M-P-EO-Y
EO-H-AE-L-C-J-OE-NG-S-AE-U-L-R-X-OE-X-TH-F-OE-E-Y-S-NG-C-F-E-B-E-IA-D-U-C-F-N-IA-S-G-T-U-B-X-J-F-F-D-H-E-B-EO-D-B-H-EA-S-T-O-L-L-L-G-S-C-J-P-NG-EO-R-R-J-TH-G-NG-L-O-TH-A-B-E-TH-I-X-T-P-C-M-P-U-S-B-M-X-O-NG-TH-F-B-AE-O-AE-S
E-F-O-OE-T-P-T-C-C-G-X-OE-AE-P-C-H-TH-N-Y-P-AE-EO-I-H-F-T-X-Y-IA-L-Y-F-E-OE-M-D-D-D-Y-TH-P-G-TH-O-Y-M-I-OE-C-Y-I-G-G-T-F-O-Y-G-M-E-O-NG-P-J-TH-H-TH-AE-N-M-I-U-E-G-O-L-Y-T-H-G-F-O-X-R-D-F-F-S-A-D-X-IA-C-H-AE-D-A-OE-I-C
TH-IA-M-AE-G-IA-E-D-I-R-EO-X-M-S-D-J-E-L-R-U-IA-OE-NG-D-W-C-P-L-T-Y-OE-R-OE-W-E-J-T-NG-O-IA-A-AE-H-G-OE-L-L-T-G-U-Y-N-EO-Y-F-TH-AE-OE-L-H-OE-B-OE-AE-Y-M-X-U-G-I-P-S-M-AE-P-IA-I-D-G-A-X-F-T-G-TH-O-B-EO-O-R-G-AE-OE-B-T-N-W-U-D-C
P-P-I-A-N-IA-H-NG-I-E-A-C-B-N-Y-TH-Y-AE-I-M-P-O-AE-Y-A-T-EO-Y-A-Y-R-NG-E-B-G-R-N-G-B-Y-P-U-R-T-P-R-R-L-U-G-C-EO-TH-E-NG-N-A-H-U-D-N-R-J-J-L-E-C-F-A-M-X-H-B-J-OE-NG-T-P-TH-O-A-O-L-IA-E-OE-M-C-P-N-J-J-T-R-IA-B-E-Y-AE-L
W-H-N-N-I-G-A-IA-J-X-U-AE-N-B-O-T-W-L-Y-W-IA-C-F-J-N-P-B-D-R-OE-I-O-EO-A-H-I-I-G-P-H-U-N-S-IA-IA-U-AE-AE-J-AE-IA-NG-B-W-X-D-E-H-E-P-J-H-R-W-X-L-P-NG-S-U-O-H-M-Y-TH-AE-TH-IA-U-M-EO-EA-C-N-O-OE-F-TH-J-R-Y-W-B-R-NG-S-A-P-B-J
I-N-O-H-D-E-N-L-TH-X-A-M-A-J-NG-EO-P-TH-E-M-I-C-NG-G-S-U-D-G-N-C-T-NG-T-I-P-J-J-O-D-N-D-EA-H-EO-R-I-N-T-W-NG-IA-TH-O-S-E-D-W-Y-R-EO-F-T-OE-R-IA-F-P-EO-R-H-TH-U-D-Y-O-R-S-Y-IA-I-T-B-N-F-TH-I-X-IA-D-TH-C-A-F-G-AE-A-H-TH-A-H
U-NG-X-N-F-IA-NG-B-T-U-B-C-B-W-H-A-Y-X-T-F-G-N-E-C-EO-R-A-IA-R-EO-D-C-L-AE-T-NG-F-L-IA-X-A-EO-IA-A-P-AE-L-B-A-E-NG-Y-TH-Y-I-A-U-C-U-EO-S-NG-B-F-AE-X-W-M-J-U-Y-EO-E-L-X-M-B-OE-C-TH-X-OE-E-U-TH-X-I-D-OE-NG-G-F-P-L-IA-G-Y-M-X-P
A-NG-F-N-OE-C-NG-AE-I-EO-B-M-U-N-W-E-W-T-X-AE-T-B-P-EA-NG-N-F-IA-O-E-G-E-O-G-N-M-TH-EO-NG-H-M-U-AE-U-Y-L-F-T-B-P-N-IA-OE-X-I-R-C-Y-L-L-L-S-OE-IA-E-W-D-P-S-Y-L-M-X-M-R-A-F-O-A-D-TH-P-D-X-J-M-G-EO-L-J-U-NG-EO-TH-B-D-TH-AE-AE-AE
I-X-S-A-EO-AE-S-E-T-IA-D-EA-TH-C-IA-F-EO-H-U-T-OE-A-Y-L-I-OE-S-I-EO-W-S-W-B-A-T-AE-C-AE-Y-T-TH-E-P-R-S-X-I-F-A-AE-M-H-P-U-M-IA-M-L-O-OE-EO-B-M-EO-H-L-D-EO-S-N-I-A-O-D-M-F-T-G-A-R-NG-NG-Y-Y-NG-F-L-I-I-TH-L-D-D-NG-L-B-OE-D-P-U
```

## Decision and reproduction

**Reject the one fixed #696 composite as a direct native-GP original plaintext inverse.** Every key in an invertible cipher family can round-trip its own decoded text; the positive and wrong-source controls make that limitation explicit. The finite negative does not rule out an independently instructed other terminal repeat-escape, column-local state architecture, non-GP register, different table consumer, or another genuine external key. This exact composite should not be varied with free zero/EA symbols, phases, signs or resets absent new source instructions.

Reproduce from unchanged canonical source `resources/liber-primus/lp2-corpus.json` and `lp2-grid-256.json` using [the complete SFT](../sims/lp2_p40_gp28_chain_grid_columnar_sft.cjs), Node.js 22. It prints the full 3,000 indices and source-native and exception-control results; the existing [manual-only workflow](../.github/workflows/lp2-p40-red8-grid32-columnar-manual.yml) executes it. The [manual GitHub Actions run 43344568572](https://github.com/FlareZ123/liber-primus/actions/runs/43344568572) **succeeded on the complete current SFT**, including the independent original Gibran GP-native reference. Earlier baseline run [43344338798](https://github.com/FlareZ123/liber-primus/actions/runs/43344338798) also passed.
