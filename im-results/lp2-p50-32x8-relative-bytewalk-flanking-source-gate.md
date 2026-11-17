# LP2 pp49–51: source-printed 32×8 relative-byte walk does not decode its flanking sentences

**Agent 41, 17 November 2026. Classification:** one completely specified, source-visible, reversible changing-state receiver and two original-input negative plaintext decisions. The original 138-rune pretable sentence and 170-rune posttable sentence are fully retained. **No unknown authentic LP2 plaintext, author-selected key, or external destination recovered.** The specific toroidal relative-step consumer below is now retired; other table interpretations are untested.

## Plausible human instruction and weakest inference

Physical pp49–51 print a rectangular **32-row × 8-column** table of exactly 256 two-character base60 numbers. In conventional row-major decoding every entry is one byte **0…255**, exactly an address or an eight-bit pair of coordinates. The table interrupts two complete original GP29 sentences, 138 and 170 rune glyphs; their 32-rune length difference equals the number of rows. Original source images, rather than page fragments, fix the two sentence bounds: the first spans p48's last72 runes followed by p49's66; the second spans p51's92 followed by p52's first78. This motivates testing the table as a stateful reader between the messages.

The single candidate here interprets a printed byte's **upper five bits as a row displacement** and **lower three as a column displacement**, each applied to the current location. That exact 5+3 split is fixed by the printed 32×8 rectangle and does not require a key phrase, arbitrary multiplier, fitted offset, lookup permutation, or modified rune. The first printed cell is the only source-specified natural starting cell. Such a movement operation is one possible reading of Cicada's archived 2016 phrase *their numbers are the direction*; however no known first-party Cicada text **selects** relative rather than absolute movement, commands toroidal wraparound, specifies GP29 additive reduction or gives a table-to-sentence handoff. These unsupported operations are the decisive weakness.

This is genuinely distinct from already exhausted direct absolute byte-pointer orbits, stationary 256-period secret lookup, fixed repeating table Vigenère, and the all-secret reused-pad cancellation test on these sentences. It tests a changing **two-coordinate relative walk** with a self-selected byte at each hop, no fitted key, and one unbroken clock.

## Frozen reader and original-sentence decision

Let `B[r,c]` be the byte at original printed row `r∈0..31`, column `c∈0..7` and `C_i` be original GP29 rune index. Set `(r_0,c_0)=(0,0)` and at each step:

```
b_i = B[r_i,c_i]
k_i = b_i mod 29
P_i = (C_i - k_i) mod 29
r_(i+1) = (r_i + (b_i >> 3)) mod 32
c_(i+1) = (c_i + (b_i & 7)) mod 8
```

Key consumption is one byte/rune, without resetting at words, physical page seams, the punctuation marking the numerical table or between the two complete original sentences. The exact encryption inverse is `C_i=(P_i+k_i) mod29`.

From source cell0 with `B[0]=203`, this yields **eight transient locations** and then a **20-cell cycle**, visiting exactly 28 distinct original cells. In chronological zero-based flat-cell indices the whole tail-compressed walk is

```
0,203,15,219,22,73,144,13,
9,2,161,122,200,54,202,155,11,225,21,158,
151,76,190,96,62,178,80,222
```

The entire original 308-rune two-sentence key therefore has eventual period20; the 8-prefix/20-cycle is derived from the specified operation, **not** a free source-chosen period20 cipher. Its direct inverse gives:

| Original sentence | Source rune length | Source IoC | Decoded IoC | Decoded adjacent doubles | Exact forward restoration |
|---|---:|---:|---:|---:|---:|
| Pretable p48–49 | 138 | **0.0333227547** | **0.0338516873** | **2** | **138/138** |
| Posttable p51–52 | 170 | **0.0337626175** | **0.0359902541** | **8** | **170/170** |

The first 100 rune indices after decoding, displayed as conventional GP29 multigraph transliteration (e.g. TH, NG, EA), are:

- Pretable: `LNGSNEOTHPWPNGTICEYPCIWERODLOAEOEJNGYEIGSPROEGMFEOSSEAMATFHDHNAIAEATPNGTHYDXORHRUNTHGURWCRUEAEBADIEOJDEAPWGCJDTIPTHAEIEA`
- Posttable: `SMIATHTHUGAEEOEOTHTMLXLMIANGDGHYNDJTNGULOEEITHSBEOIAFUACRBIATHIAEAEURFUEOFNTRNGTHHWGAUDEJLPBAETHHURJDNOLTHIOEHBRMLLOWEAUAEIETMEA`

The original ciphertext is near uniform over29 symbols; the candidate decoder stays in the same register, with no coherent GP-native prose or recognized binary object in either intact printed sentence. As a contextual scale, the original directly clear p57 has 95 GP29 runes and IoC around **0.06271**, not the ~0.034–0.036 produced here. Language and index-of-coincidence diagnostics are descriptive, so the conclusion retires **this frozen decoder as a direct plaintext reader**, not every nonlinear two-coordinate state machine.

The complete read-only [single-file CommonJS SFT](../sims/lp2_p50_32x8_relative_bytewalk_flanking_sft.cjs) derives all bytes and both sentences from original canonical sources, checks the 28-location path and the 8/20 decomposition, and exactly re-encrypts both outputs to the original GP ciphertext. Independently source-native positive plants reuse original directly clear p57 GP glyphs to fill the two sentence-length frames. The same decoder recovers the exact **138/138** and **170/170** planted glyphs at the original start/continued clock phases and forward-checks both. Plant pass is implementation evidence only.

## Issue #1409 completion and next fork

The decisive missing author-selected operands are the **coordinate update**, **byte-to-rune reduction**, and **initialization/handoff semantics**. The original 32×8 shape makes 5+3 byte-coordinate partition natural, but does not specify whether those bits are positions, displacements, a byte-address pointer, or meaningful data. Choosing a new transition rule after the above nonprose output would be unconstrained key hunting and would revisit previous tests. The completed original-input SFT excludes this particular predeclared relative reader; a future attempt needs a new first-party instruction that selects a different state update **before inspecting unknown GP plaintext**. 
