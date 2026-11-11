# Source-selected p55 fold recovers CIRCUMFERENCE and two historical key totals

**Status:** strong source-constrained intermediate mechanism. It does not yet decrypt unknown LP2 plaintext.

## Route from the authenticated 2016 clue

The authenticated 2016 sentence contains **“epiphany seeks the devoted.”** Under the previously documented GP-prime / 58-page address rule:

- `seeks` has GP-prime sum **253**, selecting p21:w4, whose unchanged printed ciphertext is the literal word **MY**.
- `the` has GP-prime sum **72**, selecting p14:w1, whose unchanged printed ciphertext is the literal word **FOLD**.

So the adjacent source phrase **“seeks the”** maps to the adjacent readable instruction **“MY FOLD.”** Its two destination numbers are also tightly related: `MY=174=3×58`, `FOLD=171`, hence their difference is **3**.

The already established next address from **FOLD=171** is p55:w2.

## Fold the 17 printed words of p55

Physical p55 contains exactly **17** printed words. Folding the word sequence about its unique middle word gives the involution

```text
i <-> 16-i
```

The source-selected p55:w2 therefore pairs with p55:w14.

| role | index | printed GP word | GP-prime sum |
|---|---:|---|---:|
| FOLD-selected word | 2 | `SB` | 114 |
| mirror partner | 14 | `CEAIMCX` | 284 |
| natural fold pivot | 8 | `MSDIAPF` | 365 |

The mirror pair gives

```text
114 + 284 = 398 = GP-prime sum(CIRCUMFERENCE)
```

The unique fold pivot gives

```text
365 = GP-prime sum(FIRFUMFERENFE)
```

`FIRFUMFERENFE` is the historical Gematria spelling used as the known A-KOAN key for **CIRCUMFERENCE**. The numerical difference is exactly explained by the three C→F substitutions in that spelling: each substitution changes the prime value by `13-2=11`, so `398-3×11=365`.

## The p32 source counts recover DIVINITY and the same historical key total

Two p32 counts were established independently before this fold result:

- p32 contains exactly **22 printed words**.
- its first punctuated clause contains exactly **33 runes**.

Those counts give

```text
398 - 22 = 376 = GP-prime sum(DIVINITY)
398 - 33 = 365 = GP-prime sum(FIRFUMFERENFE)
```

This makes the solved p57 instruction “shed our own circumferences / find the divinity within” numerically concrete: subtract the p32 word count from **CIRCUMFERENCE** and the result is exactly **DIVINITY**. Subtract the p32 first-clause rune count and the result is exactly the historical CIRCUMFERENCE-key spelling.

The result does not yet specify which unknown ciphertext should be decrypted with either key.

## P55 literally realizes “divinity within”

The cross-page-aware circumference strip on physical p55 leaves exactly **43 interior runes**. D is GP index23 and occurs in that interior stream exactly at positions **5 and23**. The two markers have **17** runes strictly between them, position difference **18**, and inclusive span **19**. The span folds outer-to-inner as **100000000₂=256** and has center rune **I**, whose GP prime is **31**.

This geometry has a precise conditional link to the ornament/table route: under conventional base60, historical NUMBER(193) gives **391=17×23**, and the separate factor-index reduction yields **X**, uniquely matching p57 word **DIVINITY**. Independent controls show that this is not yet a source-selected navigation rule. NUMBER's factors 17/23 read as GP prime weights are G/H; selecting D requires reinterpreting raw 23 as zero-based GP ordinal23. The same interior also contains X at positions **13 and31**, with the same 17-between / 19-inclusive spacing and the same fold mask 256. Further, radix59 makes the printed `3D` token 190, and NUMBER(190) factors directly as **2×5×19**. Finally, deriving 95 from D's first position and span length, reversing it to 59, then applying NUMBER(59) to recover 5 and19 is circular and does not independently resolve the formerly free divisor59. Preserve the D positions and center-I fact as geometry, not as an authenticated selector.

The p27 title fold independently selects **P/P**, with P at GP index13. Pairing that selected P with the p55 span center I gives a plausible **PI** mnemonic for circumference, while the ornament values 13/31 match P's index and I's prime. Because that comparison mixes an alphabet index with a prime weight, retain PI as semantic corroboration rather than a key derivation.

The 17 runes strictly between the two D markers also admit one source-constrained FOLD continuation. Interpreting DIVINITY's p57 graph sign as the negative operator, outer-to-inner left-minus-right GP29 folding starts with **T W O** and recursively terminates at **P**. The joint TWO-prefix/final-P signature is unique across every 17-rune window of the 7,247 strict interiors in unknown LP2. Two P prime weights total **86**, selecting p57 word **WE**, which is uniquely sum86 and is the shared node of the two five-cycles. The independently selected p27 P/P pair totals86 as well. This is a routing hypothesis; it does not turn either historical key into a working LP2 decryptor.

## Corpus discriminator

The page and fold were selected before this check: FOLD points to p55:w2, and a 17-word sequence has one natural center.

Across all **34** unsolved LP2 pages with an odd printed-word count of at least five:

- p55 is the **only** page whose center word has GP-prime sum **365**.
- p55 is the **only** page whose fixed index-2 mirror pair has GP-prime sum **398**.
- p55 is therefore the only page satisfying both conditions.

This strongly favors an intentional word-fold interpretation of p55 over a generic page-number coincidence.

## Scoped negatives

Two immediate continuations were tested and rejected:

1. The known first A-KOAN reversed-GP ±3 operation, suggested by `MY-FOLD=3` and the independent `A KOAN=243` sum, does not decrypt the p30–33 pages selected by the surrounding source words `epiphany` and `devoted`.
2. Direct Vigenere-style application of **DIVINITY** or **FIRFUMFERENFE** to p32 and its natural concentric square interiors does not recover readable plaintext under the straightforward historical variants.

These failures narrow the problem to **where and how the recovered key material is meant to act**. They do not weaken the exact p55 fold equalities.

## Applying the same frozen 58-page map to the three fold totals

A bounded second-order test applies the already frozen address rule to the three totals themselves, without changing modulus or indexing:

| Fold total | Address | Selected original item | Selected value mod 29 |
|---:|---|---|---:|
| CIRCUMFERENCE 398 | p50:w6 | table token `1p` = 111 under the conventional base-60 codec | **24** |
| DIVINITY 376 | p28:w6 | rune word `NG`, GP-prime sum 79 | **21** |
| FIRFUMFERENFE 365 | p17:w6 | rune word `NGAELOEIEOY`, GP-prime sum 511 | **18** |

All three quotients are **6**; the page residues are 50, 28, 17 (gaps 22 and 11). The selected values reduce to **24, 21, 18**, a descending step of 3. This is a source-constrained candidate 3-symbol state/key, and its 24/3 values also occur in the independent Ac-root and MY−FOLD observations. It is nevertheless a second-order use of the provisional address rule, not an authenticated cipher instruction.

The simplest direct application, periodic GP29 addition/subtraction of `[24,21,18]` across the original 76 p55 runes, fails in both directions. The exact transliterations are nonlinguistic:

- C−K: `YRUSSYOEOEULLBEAIWCGGOEPEOEOEOEARHAESIAEOINGMYEADADCONGJOETDILFRYNGJOEBLYYBIPDDPIAPISIATMTHOEGAEFS`
- C+K: `TBHCEAREOGHIRAEDXAMPEOYMTHAEGDNGOCJMFCYTEOUXWEOOECEEOFUFRWDIEAUGAIIRWDLPWLBYBCJDNSFAENWC`

No phase, orientation, or alternative cipher-family sweep was performed. This rejects the direct periodic additive use of the three-symbol candidate, not every possible operation.

## Withheld `seeks` prediction and matched controls

The frozen map gives `seeks` (prime sum 253) → p21:w4 = `MY`, while the adjacent source word `the` gives p14:w1 = `FOLD`. The `seeks` word lies outside the original 16-word sentence used to motivate the map. In the complete authenticated 2016 payload there are ten five-letter word tokens; only `seeks` maps to a two-rune destination. The only other five-letter-plus-`the` adjacent pair is `Hello The`, which maps to `BIARFEIW FOLD`, not `MY FOLD`.

Across all 58 page-phase shifts, only phase 0 gives both `seeks` → `MY` and `the` → `FOLD`; exact `seeks` → `MY` also occurs only at phase 0. This is a useful matched source-word/phase control, but it is conditional on the provisional address rule and the already selected FOLD anchor. It strengthens the withheld `MY FOLD` reading without proving a cipher.

A separate source-motivated circumference interpretation was also tested: the 76-cell clockwise perimeter of the 32×8 table as a one-to-one GP29 additive key for p55's 76 runes. Both the 2014 `sexagesimal.bin` and LP2 canonical tables, two natural byte-to-GP29 maps, and both signs produced **0/8** language-positive variants; every output scored below all 22,621 held-out native 76-rune Gibran windows. Details and reproducible gate: [terminal-grid/perimeter report](../im-results/terminal-grid-xor-anend-digest.md) and `sims/p55_table_perimeter_key_sft.cjs`. This rejects the direct table-ring Vigenère reading, not the distinct word-level fold hypothesis.

## Historical A-KOAN key operation and exact p55 transfer test (Agent 8, 2026-11-11)

The fold's `FIRFUMFERENFE` is the same 13-rune key used in the community reconstruction of LP1 page14, **A KOAN (the circumference)**. The spelling is the GP transliteration of `CIRCUMFERENCE`: the lossy alphabet maps C to the F rune. The historical operation is Vigenère over the 29-symbol GP order, normal decryption `P = C − K (mod 29)`, repeating the 13-rune key. Literal F runes are *interrupters*: a selected F may be dropped from plaintext and, when dropped, does not advance the key; other F runes are decrypted normally. Thus not every F is automatically null.

Evidence is a later community reconstruction, not a primary Cicada instruction: [iBotPeaches page14 walkthrough](https://github.com/iBotPeaches/cicada_3301/blob/master/liber_primus/markdown/14.md) records key `FIRFUMFERENFE` and the older fixed skip offsets65,76; [its Vigenère implementation](https://github.com/iBotPeaches/cicada_3301/blob/master/tool/app/Actions/Runes/TranslateVigenere.php) and [GP alphabet enum](https://github.com/iBotPeaches/cicada_3301/blob/master/tool/app/Enums/Rune.php) specify the arithmetic. An independent later reproduction, [Dukotah's page14 script](https://github.com/Dukotah/cicada3301/blob/master/analysis/reproduce/reproduce_page_14.py) and [corpus report](https://github.com/Dukotah/cicada3301/blob/master/corpus/B-liber-primus/REPORT-B.md), uses the more general F-interrupter rule and reproduces the A-KOAN page. The older skip numbers are **1-based raw character offsets** in its single-line input (spaces count), not rune ordinals; both happen to point at F runes in that A-KOAN ciphertext.

I tested the exact historical mechanism on the source-selected p55 page, not a guessed variant. The original p55 page has76 runes and literal F occurrences at one-based rune positions16,26,42. I enumerated all eight possible null/keep subsets of those three F occurrences, using the 13-rune key and normal `C−K mod29` direction. The same 79,495-entry English quadgram scorer used by the independent reproduction ranked the best case (only F at42 dropped) at **−7.2726 per quadgram**; its output begins `NGSSIGAEBAESYOGCTHSAEIADIACEOOS...` and remains nonlinguistic. The other seven subsets score worse. The old fixed offsets65,76 also fail as a transfer: on p55's normalized single-line text they point to G and TH, not F. No skip-position or key-phase sweep was performed.

**Decision:** the p55 fold independently selects the historical key spelling, but it does not select the A-KOAN Vigenère/interrupter operation or its page-specific null pattern. Exhausting the source-bounded three-F choices yields no p55 plaintext. Treat `FIRFUMFERENFE` here as a recovered historical key/semantic echo of CIRCUMFERENCE, not as an LP2 decryption key; do not continue Vigenère variants on p55.
## Historical NUMBER applied once to the three fold totals (Agent 8, 2026-11-11)

The source-derived inputs are reproducible: p55 mirror words `w2+w14` have GP-prime sum398 (114+284); the p32 word count22 gives `398−22=376`, the GP-prime sum of DIVINITY; the p32 first-clause rune count33 gives `398−33=365`, the GP-prime sum of FIRFUMFERENFE.

Applying the historical 2013 NUMBER operation exactly once (reverse decimal digits, then factor) gives:

| Input | Reversed | Factorization | Direct GP interpretation |
|---:|---:|---:|---|
| 398 | 893 | 19×47 | both are GP prime weights, mapping to `WX` |
| 376 | 673 | prime | outside the 29 GP prime weights |
| 365 | 563 | prime | outside the 29 GP prime weights |

Wrong-fold-pair and adjacent-word controls do not make this signature distinctive. Neighboring mirror pairs include `w1+w15=351 → 153=3²×17`, `w3+w13=206 → 602=2×7×43`, and `w7+w9=734 → 437=19×23` (also two GP prime weights, mapping to `WH`). Other mirror controls yield prime/semiprime factorizations as well. Adjacent controls include `w0+w1=301 → 103` (a GP prime weight), `w5+w6=313` (prime), and `w7+w8=961 → 169=13²`. Thus “prime or semiprime after NUMBER” is not a unique property of the selected totals.

The arithmetic correspondence is exact: under the *later-recorded* NUMBER interpretation, `365→563`; 563 equals the authenticated 2016 tree JPEG's width and the unique first-row GP-prime sum on the p32 tree page. The same 11×11 p32 grid has unique first-column sum569, matching the JPEG height. These values were independently recomputed; the 365→563 output is unique among the tested p55 mirror-pair and adjacent-word controls. The other outputs remain unresolved: 398→`WX`, while 673 is prime but outside GP29.

**Critical provenance limitation (see closed #113 and Critic correction on #141):** the contemporaneous 2013 Twisted witness cited in #71 documents a different TCP service and contains no NUMBER/PRIMES command. The surviving NUMBER/PRIMES transcripts are retrospective (2022/2025), and the reconstructed `server.py` is not the original 2013 server. Therefore the reverse-digit/factor operation is not independently authenticated as a 2013 Cicada instruction. The 563 match is a conditional numerical correspondence, **not a source-selected navigation address**; “numbers are the direction” does not specify this transform. Retain it as an intermediate lead only. Do not open a successor or extend to arbitrary reductions without an independent source selecting NUMBER and predicting a held-out original-cipher result.
## Next decisive question

The historical A-KOAN Vigenère/interrupter transfer to p55 is negative. The one-step NUMBER branch now has a source-linked 563→p32-tree/first-row target; any successor must find one source-selected operation on that row and a held-out prediction, without extending to arbitrary mappings of673/893.

## Reproduction

Run:

```text
node sims/lp2_2016_p55_fold_keys.cjs
```

The script recomputes the 2016 source addresses, the MY/FOLD destinations, the p55 fold, the historical key totals, the p32 22/33 counts, and the complete odd-page uniqueness check.
