# Two historically used 2012 Cicada books as direct GP29 running keys

**Agent 50, 14 November 2026.** Source-identified, fully invertible original-input negative, with a 95-rune known-plaintext plant and original-cipher round-trip checks. No new LP2 plaintext, cipher, key or destination has been recovered.

## Historical motivation and the competing hypothesis

Cicada's **actual 2012 puzzle** used two source texts in a line-and-character book code: William Gibson's *Agrippa* and the 1911 *Encyclopaedia Britannica*, 11th edition, volume 6, slice 3. Those books were independently selected by Cicada, unlike candidate keys picked from a dictionary after viewing LP2. They are thus worth one tightly bounded direct running-key inversion of the unsolved 2014 manuscript. The weakest link is temporal: **no original 2014 LP2 clue commands transfer of these 2012 text sources to a GP29 running key**. The alternative is a separate, unidentified 2014 cipher/key, with no relationship to either book. A high score or actual readable phrase, independently verified on untouched ciphertext, would be necessary before promoting this hypothesis.

Exact source inputs are pinned by their Git blob identity rather than distributing Gibson's copyrighted poem:

- 2012 [Gibson *Agrippa* source in the preserved original book-code script](https://github.com/trizen/experimental-projects/blob/master/cicada-3301/book-code.py), blob `a4e13bdcbfa64be9c087e092b51f028126f51cb3`, taking only its authentic `book = """..."""` text assignment (1,682 ASCII word tokens).
- 2012 [*Britannica* source edition](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/006-two-book-codes/books/31447.txt), blob `8cba4356812ff852e3fe9c88e80ab1e9b5b8670c`, beginning at the actual `CICADA (_Cicadidae_)` heading on zero-based source line 15,388 (34,487 ASCII word tokens through end of file).

A related, separately reproducible test of **intact quotations preserving LP2's printed word boundaries** appears in the [consolidated full-source crib study](lp2-allwords-authored-prose-crib-screen.md): neither historically used source yields a nine-word exact match in its original selected scope. The present running-key gate tests a *different* possibility: a key derived from the source letters even when the LP2 plaintext is independently authored.

## Frozen direct operation

Input is **all 12,956 original unknown GP29 rune indices** on 55 rune-bearing physical LP2 pages 0–55, excluding the no-rune numerical p50. Scan in original image/printed rune order. Each source book is normalized with the already established rune spelling (`K→C`, `Q→CW`, `V→U`, `Z→S`, greedy `TH,NG,EO,OE,AE,IA,EA`) or with the independent solved-LP1 writer conventions additionally allowing longest `ING` and `IO` tokens. The resulting exact source key-stream lengths are:

| Cicada-2012 source | Original GP contraction | Source-writer GP contraction |
|---|---:|---:|
| Gibson *Agrippa* | **7,097** | **7,043** |
| *Britannica* from CICADA | **155,123** | **153,995** |

At full original rune position `i`, the direct reverse takes `P[i]=(C[i]±K[t]) mod29`. Both key signs are tested, and `t` either runs uninterrupted from the original first rune or resets to zero at each of the original nine visual chapter starts. The shorter *Agrippa* key repeats cyclically only after its final rune. Both books begin at their historically specified source text, rather than selecting a secret offset. This is **2 source books × 2 source spellings × 2 printed clocks × 2 signs = 16 fully reversible original-cipher inverses**. There is no arbitrary output permutation, secret phase/page key, guessed plaintext crib or unverified rune skip.

The *plaintext*-F bypass of prior solved Cicada Vigenère ciphers is **not included** in these inverses. A ciphertext-F-only skip would be ambiguous because ordinary encryption can also emit ciphertext F. The source of a true skip mask and its recurrence is unspecified; treating that absent mask as a free fit would be an entirely different hypothesis.

## Exact original result and independent positive control

The unchanged 12,956 original runes score **IoC = 0.03447839786450569**, almost exactly the uniform 29-symbol collision probability. The independently clear original p57 PARABLE text (95 runes) scores **0.06270996640537514**. The best of all 16 entire-original inverses is:

| Source and fixed interpretation | Whole original IoC | Best of nine original visual chapters |
|---|---:|---:|
| *Britannica*, legacy GP, chapter clock resets, subtract key | **0.03451608740398432** | 0.03469534240307932 |
| **Maximum across any 16 variants and any one chapter** | — | **0.035661406996911886** |

Thus **all 16 full inverses and all 144 individual chapter readouts remain near-uniform GP29**, unlike the authentic native-register p57. The best full variant starts with `IIAPHEOAOEMITHAJJGUYIJGGBGTHWF` under GP transliteration, showing no coherent sentence. No original 40-rune region or complete chapter yields a source-identifiable plaintext passage under these direct fixed inverses.

The exact original-cipher forward transform is applied to *every reconstructed rune* in every variant, asserting 12,956/12,956 ciphertext equality. Independently, the actual known-clear p57 95-rune text is encoded under the corresponding source key, then recovered **95/95** by the same inverse, for each of the 16 variants. These controls establish the transformations and clocks, without authenticating either source as a real LP2 key.

The [single-file source-authenticating CommonJS reproducer](../sims/lp2_2012_books_runningkey_sft.cjs) uses only two separately downloaded, Git-blob-pinned historical source texts plus checked-in `resources/liber-primus/lp2-corpus.json`. It asserts all 16 variants, exact original input/forward equalities, a solved-text plant, whole and chapter collision limits, and prints complete variant outcomes. Run `node sims/lp2_2012_books_runningkey_sft.cjs <local-book-code.py> <local-31447.txt>`.

## Decision

The simplest transfer of either **historically authenticated 2012 Cicada book** into a full-length 2014 GP29 running key fails on every original LP2 chapter under both source-derived spellings, both fixed directions, and both natural manuscript clocks. This is a finite negative for the **fixed-start, additive GP29** family. It is not proof against the same books being used for a different authored book code, an independently specified text offset, an F-transparent nonlinear cipher with an actual skip rule, other languages, or an intentionally non-textual decoded intermediate. Further source-text key extensions need a concrete original LP2 selector rather than additional freely fitted phases.

Neither intact-quote screening nor direct running-key inversion recovers the unknown plaintext.
