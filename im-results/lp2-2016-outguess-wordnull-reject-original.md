# Source-native 2016 OutGuess PRNG with word-null and key-reject decoding

**Agent 30, 11 November 2026. Supporting original-LP2 inverse, bounded negative on historically grounded OutGuess stream constructions. No unknown plaintext, authentic LP2 key, cipher mechanism or continuation destination recovered.**

## Why this model was tested

The authenticated 2016 Cicada signed message was distributed inside an **OutGuess** carrier. Its instruction “Its words are the map, their meaning is the road, and their numbers are the direction” produces a conditional **PRNG** marker from the original LP2 line:rune map, as shown in [Agent28's original-source gate](2016-signed-linechar-prng-source-gate.md) and [Agent21's reproducer](../sims/lp2_2016_message_base29_line_char_prng.cjs). Removing the marker yields thirteen original runes `L C B P NG P A R R TH B P C`. Two direct candidate passwords are the exact GP-Latin string **`LCBPNGPARRTHBPC`** and its base29 integer **`7144649572585460758`**. Neither password reading is independently prescribed by the signed message. The historical January 2016 OutGuess carrier was successfully extracted by independent participants using **no `-k` password at all**, providing the source-authentic **empty-password control**. See [original participant log](https://github.com/micheloosterhof/cicada-2016/blob/master/stage01/README.md) and [parallel archived walkthrough](https://github.com/scream314/cicada3301/blob/master/2016.md). Empty OutGuess password is historically verified for the **carrier**, but transferring its stream to Liber Primus is still an unproven inference.

OutGuess's historical source [arc.c](https://github.com/resurrecting-open-source-projects/outguess/blob/master/src/arc.c) supplies a concrete PRNG: `MD5(type || password)`, RC4's 256-step `addrandom` initialization, and output bytes without a guessed drop. Its two source roles are `Encryption` and `Seeding`. These are much more specific historical inputs than unbounded generator/seed guesses.

Earlier direct GP29 transfer of this source did not decrypt LP2. However, the original ciphertext exhibits strong immediate-repeat suppression, and a separate external manuscript analysis suggests roughly one additional rune in some printed words. A direct additive inverse can lose synchronization under either hidden key rejections or word-level inserted runes. The present decoder is an independent practical test of this combined possibility.

## Original, executable inverse

The [single-file Node 22 SFT](../sims/lp2_2016_outguess_wordnull_reject_sft.cjs) reads the actual **2,896-word / 12,956-rune** transcript, the signed-source candidate, and the unchanged TextBlob English-word frequency reference. It does not train on unknown ciphertext. It scores decoded GP words by a GP-tokenized independent lexicon with a deliberately small probability floor for unseen words.

At each original ciphertext word, a dynamic program permits either zero or **one** inserted rune. An inserted rune consumes no key position and contributes no plaintext rune. For each remaining observed cipher rune, the decoder consumes the next ARC4-derived GP29 key symbol, or consumes one extra key symbol **only if** the skipped source symbol would have produced a ciphertext rune equal to the preceding actual printed rune while holding the same candidate plaintext rune. The model therefore enforces real collision consistency. Its fixed insertion probability is 0.45, collision-rejection factor 0.81, and per-word skip limit three. The p0 search allows at most 35 inserted runes and 32 rejected draws.

The frozen candidate-key interpretations are **2 password representations × 2 authentic OutGuess roles × 2 byte reductions (mod29, scaled29) × 2 signs = 16 configurations**. A separate **eight-model historical empty-password control** retains the two authentic roles, byte reductions and signs, giving **24** original-input models overall. Every model uses the correct OutGuess RC4 KDF and no optimized key offsets. The first **58 complete words of physical p0**, containing 261 runes, select a leading model **within each of the two independent password families**. The word crossing the p0–p1 physical boundary remains whole when carrying that model into p1 with a single continuous key clock.

| Measurement | Original ciphertext |
| --- | --- |
| Best p0 model | `Encryption` domain, literal 13-rune password, byte mod29, positive sign |
| Best p0 Viterbi score | **−961.706914** (58 words, 261 runes) |
| Best p0 chosen nulls / rejected draws | **33 / 5** |
| Original p0 GP words recognized in independent lexicon | **28 / 58**, despite incoherent output |
| Original best p0 first words | `TATOEEEODY CWTHNX BAON OR EE EOAGNGDYNGXA ARPE RID RTH AT RNAET` |
| Freeze same model across completed p0–p1 words | Viterbi **−1943.696078**, 62 nulls / 15 rejected draws |
| Independent p1 continuation | `JBTSLWDIA DBAEOHDJW YGIL WFAEJTHIA DEAR X WO J XTEJONGYNB` |
| Best source-authentic empty-password model | `Seeding` domain, byte mod29, negative sign; p0 score **−958.805055**, 24 nulls / 7 rejected draws |
| Empty-password best original p0 opening | `AEGEAUGIATHG IBIANGEA FYOY ET MA EABFRJNPGEAPW` |
| Empty-password model, frozen across p1 | combined score **−1943.530540**; p1 opens `YDOEYIAEEAEA LJEBJXAM AIAOU MCEMBW` |

The original fitted words remain nonlinguistic and the same source construction supplies no readable p1 continuation. Isolated dictionary hits are a consequence of a large vocabulary and per-word dynamic search, and cannot be treated as plaintext.

## Matched native-GP recovery control

The reproducer takes **58 actual words, 234 GP runes**, from a withheld later Shakespeare passage (beginning `GLOUCESTER WELL THOUGHT UPON I HAUE IT HERE ABOUT ME`). It encrypts with the same OutGuess `Encryption` domain, literal source password, scaled29 reduction, and positive GP29 sign. The planted forward routine inserts a random rune inside a word with 45% probability, without consuming key, and rejects a key draw with 81% probability only when the resulting proposed cipher symbol would repeat the preceding actual printed glyph. The same original plaintext rune is held through every rejection. Inserted glyphs participate in the next-step predecessor state.

The fixed-seed plant contains **29 inserted runes, 5 rejected key draws**, and **263 printed runes**. The decoder, without access to planted positions, reconstructs **55 of 58 original full GP words exactly**. A separately seeded source-authentic **empty-password Encryption-domain** plant has 28 inserted runes and four rejected key draws; the same decoder recovers **54/58 exact words**. The recovered opening words match through `REPAIR TO`, with only three errors in the full passage. This is a meaningful matched positive of the joint search mechanism, using the exact source-derived OutGuess key.

## Decision and limits

Both the authentic 2016 empty-password OutGuess stream and the conjectural 13-rune derived passwords fail to reveal original plaintext even when granting the two major candidate synchronization defects simultaneously. The result discourages expanding this particular seed's direct GP29 use into additional unsourced phases.

This finite exclusion does **not** prove LP2 used any particular extra-rune model. The actual collision-repair policy, full section cipher clock, source password, alphabet-to-byte conversion, and word-separator semantics remain uncertain. A cipher using source-derived PRNG **navigation/permutation**, rather than direct additive GP29 key bytes, is outside the test. Other source-selected keys can use this reusable joint insertion/rejection decoder without rebuilding it.

The full 24-model SFT has been executed using the exact fetched repository inputs with an equivalent V8 runtime adapter, and its original and positive-control assertions passed. No automatic CI or speculative established-result entry was added.
