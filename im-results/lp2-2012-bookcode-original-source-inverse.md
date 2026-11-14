# Two historically used 2012 Cicada books as direct GP29 running keys

**Agent 50, 14 November 2026.** Source-identified original-input negative with two independent modes: 16 fully reversible direct inverses and **an exact exhaustive state test of the authenticated Cicada plaintext-F-bypass rule**, without guessing a skip mask. Controls include the actual solved 85-rune p56 cipher and 95-rune p57 plaintext plants. No new LP2 plaintext, cipher, key or destination has been recovered.

## Historical motivation and the competing hypothesis

Cicada's **actual 2012 puzzle** used two source texts in a line-and-character book code: William Gibson's *Agrippa* and the 1911 *Encyclopaedia Britannica*, 11th edition, volume 6, slice 3. Those books were independently selected by Cicada, unlike candidate keys picked from a dictionary after viewing LP2. They are thus worth one tightly bounded direct running-key inversion of the unsolved 2014 manuscript. The weakest link is temporal: **no original 2014 LP2 clue commands transfer of these 2012 text sources to a GP29 running key**. The alternative is a separate, unidentified 2014 cipher/key, with no relationship to either book. A high score or actual readable phrase, independently verified on untouched ciphertext, would be necessary before promoting this hypothesis.

Exact source inputs are pinned by their Git blob identity rather than distributing Gibson's copyrighted poem:

- 2012 [Gibson *Agrippa* text used by Cicada's original book code](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/006-two-book-codes/books/agrippa.txt), blob `673ba225d1277945f2d2e5056bf025db8e89bb92`, excluding the source file's five title/byline lines as the original decoder did (1,682 ASCII poem word tokens). The later [2013 solution script](https://github.com/trizen/experimental-projects/blob/master/cicada-3301/book-code.py) independently quotes the same poem word sequence.
- 2012 [*Britannica* source edition](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/006-two-book-codes/books/31447.txt), blob `8cba4356812ff852e3fe9c88e80ab1e9b5b8670c`, beginning at the actual `CICADA (_Cicadidae_)` heading on zero-based source line 15,388 (34,487 ASCII word tokens through end of file).

A related, separately reproducible test of **intact quotations preserving LP2's printed word boundaries** appears in the [consolidated full-source crib study](lp2-allwords-authored-prose-crib-screen.md): neither historically used source yields a nine-word exact match in its original selected scope. The present running-key gate tests a *different* possibility: a key derived from the source letters even when the LP2 plaintext is independently authored.

## Frozen direct operation

Input is **all 12,956 original unknown GP29 rune indices** on 55 rune-bearing physical LP2 pages 0–55, excluding the no-rune numerical p50. Scan in original image/printed rune order. Each source book is normalized with the already established rune spelling (`K→C`, `Q→CW`, `V→U`, `Z→S`, greedy `TH,NG,EO,OE,AE,IA,EA`) or with the independent solved-LP1 writer conventions additionally allowing longest `ING` and `IO` tokens. The resulting exact source key-stream lengths are:

| Cicada-2012 source | Original GP contraction | Source-writer GP contraction |
|---|---:|---:|
| Gibson *Agrippa* | **7,097** | **7,043** |
| *Britannica* from CICADA | **155,123** | **153,995** |

At full original rune position `i`, the direct reverse takes `P[i]=(C[i]±K[t]) mod29`. Both key signs are tested, and `t` either runs uninterrupted from the original first rune or resets to zero at each of the original nine visual chapter starts. The shorter *Agrippa* key repeats cyclically only after its final rune. Both books begin at their historically specified source text, rather than selecting a secret offset. This is **2 source books × 2 source spellings × 2 printed clocks × 2 signs = 16 fully reversible original-cipher inverses**. There is no arbitrary output permutation, secret phase/page key, guessed plaintext crib or unverified rune skip.

**The authentic Cicada plaintext-F bypass is also tested separately as an exact decision procedure.** If plaintext `P=F` (GP rune0), ciphertext must be `C=F` and no key tick is consumed. For ordinary `P≠F`, ciphertext is `C=P±K[t] mod29` and the key clock advances. Inverting `C=F` therefore allows both a transparent-F branch and, when the active key is nonzero, an ordinarily enciphered non-F branch. Inverting `C≠F` forces one clock advancement and forbids `C=±K[t]`, which would otherwise produce the impermissible ordinary plaintext F. An exact set of all reachable key-consumption counts per ciphertext position handles the full ambiguity; there is **no guessed skip mask, language pruning or hidden key phase**.

## Exact original result and independent positive control

The unchanged 12,956 original runes score **IoC = 0.03447839786450569**, almost exactly the uniform 29-symbol collision probability. The independently clear original p57 PARABLE text (95 runes) scores **0.06270996640537514**. The best of all 16 entire-original inverses is:

| Source and fixed interpretation | Whole original IoC | Best of nine original visual chapters |
|---|---:|---:|
| *Britannica*, legacy GP, chapter clock resets, subtract key | **0.03451608740398432** | 0.03469534240307932 |
| **Maximum across any 16 variants and any one chapter** | — | **0.035661406996911886** |

Thus **all 16 full inverses and all 144 individual chapter readouts remain near-uniform GP29**, unlike the authentic native-register p57. The best full variant starts with `IIAPHEOAOEMITHAJJGUYIJGGBGTHWF` under GP transliteration, showing no coherent sentence. No original 40-rune region or complete chapter yields a source-identifiable plaintext passage under these direct fixed inverses.

## Exact language-independent transparent-F contradiction

Under the real historical Cicada plaintext-F bypass, **all eight source×spelling×sign keys are already impossible on the original opening p0 segment**. The first source-scope contradiction for the p0-started uninterrupted key occurs at the following original rune offsets, before any language scoring:

| Historical source | GP spelling | Subtract-key branch first impossible rune | Add-key branch first impossible rune |
|---|---|---:|---:|
| *Agrippa* | legacy | 36 | 1 |
| *Agrippa* | LP1 writer | 128 | 1 |
| *Britannica* CICADA-to-end | legacy | 4 | 111 |
| *Britannica* CICADA-to-end | LP1 writer | 4 | 138 |

Importantly, **every one of the nine original visual chapters also becomes algebraically impossible when independently restarted with each source/key/sign**, even granting a fresh key clock at all nine source-visible boundaries. In original chapter order, the earliest local impossible rune positions are:

| Source, spelling, direction | Local impossible indices for the nine separately reset chapters |
|---|---|
| *Agrippa*, legacy, subtract | 36, 24, 98, 133, 16, 0, 33, 58, 22 |
| *Agrippa*, legacy, add | 1, 7, 19, 124, 95, 6, 6, 94, 40 |
| *Agrippa*, LP1, subtract | 128, 70, 123, 133, 16, 0, 78, 58, 27 |
| *Agrippa*, LP1, add | 1, 7, 19, 124, 42, 6, 6, 94, 20 |
| *Britannica*, legacy, subtract | 4, 5, 16, 41, 4, 6, 3, 4, 0 |
| *Britannica*, legacy, add | 111, 16, 1, 134, 14, 16, 38, 23, 7 |
| *Britannica*, LP1, subtract | 4, 5, 16, 41, 4, 6, 3, 4, 0 |
| *Britannica*, LP1, add | 138, 16, 1, 70, 14, 16, 38, 23, 7 |

Each impossibility is exact and **independent of a plaintext-language model**, because the key-conserving skip rule would be violated for *every possible assignment* of transparent F sites. Eight whole-stream keys and 72 independently restarted chapter/key tests fail. The apparent contradictory use of GP rune F as cipher F versus plaintext F is resolved by carrying *both* legal branches at every ciphertext F. This is stronger than a low frequency score, but applies only to the specific source-started book keys and the historically real GP-additive/F-bypass rule.

The F-bypass algorithm itself is checked against **the actual original solved p56 ciphertext**: the 85 runes of AN END decode with the authentic prime-totient key, and the sole transparent F at position56 leaves exactly 84 prime ticks. Its exact forward re-encryption reproduces all **85/85** original ciphertext runes, and the ambiguity-preserving inverse retains the correct terminal tick84. For **every one of the eight book-key/sign pairs**, an independently created authentic clear-p57 95-rune plant is then forward-encoded with the same plaintext-F rule; the exhaustive inverse retains its true consumed-key state. Positive controls are not fitted to any unknown original page.

The exact original-cipher forward transform is applied to *every reconstructed rune* in every variant, asserting 12,956/12,956 ciphertext equality. Independently, the actual known-clear p57 95-rune text is encoded under the corresponding source key, then recovered **95/95** by the same inverse, for each of the 16 variants. These controls establish the transformations and clocks, without authenticating either source as a real LP2 key.

The [single-file source-authenticating CommonJS reproducer](../sims/lp2_2012_books_runningkey_sft.cjs) uses only two separately downloaded, Git-blob-pinned historical source texts plus checked-in `resources/liber-primus/lp2-corpus.json`. It asserts all 16 unambiguous original transforms, exact original forward equalities, complete authentic plaintext-F branch-exhaustion on all nine original chapters, the historical p56 prime/F control, planted p57 controls, and prints the exact rejection sites. Run `node sims/lp2_2012_books_runningkey_sft.cjs <local-agrippa.txt> <local-31447.txt>`.

## Decision

The simplest transfer of either **historically authenticated 2012 Cicada book** into a full-length 2014 GP29 running key fails on every original LP2 chapter under both source-derived spellings and both fixed directions. This is established both by 16 exact ordinary additive inverses remaining nonlinguistic and by **all 72 exact authentic plaintext-F-bypass chapter gates reaching logical contradictions**. This is a finite negative for the **fixed-start, additive GP29** family under the two stated key clocks. It is not proof against the same books being used for a different authored book code, an independently specified text offset, an F-transparent nonlinear cipher with an actual skip rule, other languages, or an intentionally non-textual decoded intermediate. Further source-text key extensions need a concrete original LP2 selector rather than additional freely fitted phases.

Neither intact-quote screening nor direct running-key inversion recovers the unknown plaintext.
