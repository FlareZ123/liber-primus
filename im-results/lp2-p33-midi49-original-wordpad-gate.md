# LP2 p33 versus the 2012 participant-specific 49-word MIDI list

**25 November source correction:** [native MIDI formatting audit](2012-midi-native-formatting-50entry-source-correction.md) establishes that the signed Track-1 submission register has **50 entries / 48 distinct**. BIRD and WATCH have the same 384-tick delimiter as every other entry pair. The archived 49-token words.txt merged them; preserve it solely as a historical derivative. The original 50-entry payload does not match p33's 49 complete black words. The direct decoder below remains a negative on the archived derivative. No entry may be dropped without a selector. The corrected p36 50-piece test also failed.

**Disposition for Director #2197: a bounded original-cipher negative.** No authenticated unknown LP2 plaintext or 2012-to-2014 key instruction was recovered. The literal 49-word alignment is geometrically exact, but a frozen GP29 wordwise repeated-key inverse produces nonprose on the whole p33 black text and a separate p34 holdout. Its correctness checks pass on both original inputs and a planted version of genuine solved p57 text. The test excludes this **one precisely specified decoder**; it does not exclude every imaginable use of 49 words.

## Why a human might attempt it, and the missing selector

The original 2012 signed MIDI exercise's Track 1 decodes to an instruction to encrypt, sign and return a recipient's word list. The archived recipient's list has **49 words / 47 different lexical types**, with `box` and `tray` occurring twice. The first-party introduction says to let the musical chorus guide decoding. The second track is Blake's poem used as the known note-to-letter mapping. A separate participant's surviving record describes a **unique** list and gives different example words. Thus the exact 49-word source is authentic for **one** historical participant, with a fulfilled immediate 2012 purpose, and it cannot be assumed to be universal.

The original LP2 p33 image (`resources/liber-primus/50.jpg`) has two red rubric pairs, at printed word indices **0–1 and 23–24** in its 53-word transcription. Together the red words contain **18 runes**. Removing them leaves exactly **49 black printed words totaling 196 GP29 runes**, with original punctuation and line wraps preserved. The common 49 count allows a literal ordered alignment, but the original signed 2012 message and original Stage11 2014 index do not instruct that reuse, explain a wordwise GP29 key, or select a direction. This is the critical missing historical step.

The prior investigations [2012 MIDI to 2014 7×7 value dictionary](2012-midi-onion7-49word-value-map.md), [2012 MIDI to p50 page/cell addresses](2012-midi-49word-p50-address-hotspot-gate.md) and [2012 list to PARABLE](2012-midi-49word-parable-continuation-gate.md) test different hypotheses. Their finite results are **not** repeated here. The original first-party source pointer and wordlist are `resources/external/cicada2012-midi-source.json` and `resources/historical/cicada2012-midi-49-words.txt`.

## One frozen, reversible original-cipher test

The specified candidate maps original word `j` to MIDI source word `j`, in original order `j=0..48`. Each English key word is converted to native GP29 symbols by the project's original 29-rune alphabet, greedily grouping the seven GP digraph tokens TH, NG, EO, OE, AE, IA, EA. Unavailable Latin K/V/Z are spelled C/U/S; the one source `Q` in `square` is frozen to C. No word keys are fitted to ciphertext.

Within each word, with zero-based rune position `i`, the complete candidate decryptor is

```text
P[j,i] = (C[j,i] - K[j, i mod len(K[j])]) mod 29
C[j,i] = (P[j,i] + K[j, i mod len(K[j])]) mod 29
```

Thus the key resets at every printed word, and neither source order nor key phase is optimized. The p34 holdout uses exactly the **same first 49 MIDI keys in the same order** at its first 49 printed words, with no new receiver-dependent secret. This is deliberately the easiest human-executable direct alignment. The original source did not select this cipher, and the test cannot be used to estimate the prior likelihood of every possible 49-word bridge.

The complete [standalone CommonJS SFT](../sims/lp2_p33_midi49_literal_wordpad_sft.cjs) loads the pinned original GP corpus and printed word transcription, checks the **214/261 original p33/p34 rune counts**, both identical original rune sequences, exact 18-rune red exclusion, all 49 authentic 2012 words, and the original solved p57 95-rune native spelling. It verifies exact forward replay of all tested original ciphertext and a solved-p57 planted-key positive. It was executed under **Node 22 on Windows**, [PASS run 45002418812](https://github.com/FlareZ123/liber-primus/actions/runs/45002418812).

## Full original output and held-out decision

Physical p33, all **196 black runes in 49 words**; GP29 rune-index IoC drops from original **0.03354265** to inverse **0.03260073**:

```text
OENG GEOSNCLATHEO PIAMEEOO IAEU MRS NCYAET PTB BIA XETHOYPX EOEAP THRS SYXTHUO SOYEW MTHOEMNGIRW YB UHEO UIA ER TM IAAS GAE GXEOIDT ICWWTHSS YEOEO NTA MAOH MEO OET YJNG RNG MYHB FW H THNOEXLYIOL RFOEUUYYAE GAPB LIAJT FEAGSWOEPBM DAENGX ADYXC FA GEOGJ GO AEOEBW UJAE AEFIJCSF EATN AENGTHBD TH
```

Physical p34 independent holdout, the **first 49 untouched printed words = 206 runes** under identical original key phase; inverse rune-index IoC **0.03319915**:

```text
FT SR EAOE OITHNG JEAG HFI EAWNGAAEP FBSNW IBIT THR TTHTHUDPO BIALDJPBAEO WRIGNG WIBAIW RAH NGEOY BNGL MJ RIJAAEJOPA CEAY JTHI AAENG NGPXNAEYIA AEYPH RD H PE EOBEOX XCNGNGMBNG OEAXOEE IAWTHRIADD ULL AUPMMYYC XSG HTEN HIBDEA EA RMEA ENGSO AHRD THOXL MEGOEFDY AEEAD EMYJJ IAGNXPPXS OLEO HPG BOUN NAENTH
```

Several short ordinary-looking GP fragments (`GO`, `ER`, `TH`, `H`) are expected by chance among 49 short words. Neither passage offers sustained GP-native English prose, an identifiable decoded Cicada instruction, or a transferable original plaintext island. Exact replay is an implementation invariant of any correct bijective additive cipher, including a wrong one.

## Decision and renewed research priority

**Retire the literal original-order 2012 MIDI wordwise repeating-GP29-additive key on p33, with p34 transfer, as an LP2 solution route.** The 49-entry correspondence refers to the derivative only. More phases, alternate 49 permutations, individual key tuning, foreign alphabet remappings or other unsourced 2012 reuse conjectures are not warranted by this failed decoder. A viable reopening needs an authenticated period clue selecting a **specific** 2012 list and indicating a different, uniquely motivated reversible LP2 operation, or a real original-cipher plaintext output that is independently transferable. This outcome does not require modifications to the established-results index.
