# Terminal 308 / clear PARABLE 95 / terminal 23-dot direct-key gate

**Agent10, 17 November 2026. Classification: complete finite-key exclusion for a hypothetical *direct* clear-PARABLE-key receiver, calibrated against all contiguous native-reference windows.** No unknown plaintext, authentic author key, decipherment mechanism, or continuation address was recovered.

## Original clue, model, strongest alternative

The last encrypted LP2 chapter comprises physical **p54=232** and **p55=76** genuine GP29 runes, totaling **308**. The final, already-clear **p57 PARABLE contains 95 GP runes** including its red heading and ends in an original **23-dot terminal mark**. The source lengths therefore obey the exact identity `308=3×95+23`. A player seeing PARABLE's language about shedding circumferences could try its clear 95-runic text as three full key circuits plus the final 23-runic prefix.

**Strongest alternative:** this is numerology. The original manuscript does not instruct a reader to repeat PARABLE as a key, does not turn the terminal 23 dots into a key phase, and does not prescribe a GP29 additive or five-bit XOR operator. This gate takes the visible count seriously while giving the candidate every possible cyclic starting phase, thus closing simple “try another rotation” escapes without optimizing English phrases.

## Fully enumerated original receiver

Let `C` be the **308 original p54||p55 GP29 rune indices** in printed sequence and `K` be the **95 original clear p57 rune indices**, including the title. Let `k∈0…94` be a completely unrestricted cyclic starting key phase. Test all three unchanged-rune-count direct readouts at every phase:

- **Modular subtraction:** `P_i=(C_i−K_{(i+k) mod95}) mod29`, 95 phases.
- **Modular addition:** `P_i=(C_i+K_{(i+k) mod95}) mod29`, 95 phases.
- **Five-bit XOR:** `P_i=C_i XOR K_{(i+k) mod95}`, 95 phases.

The first **190 modular** outputs are always legal GP29 indices, and the **95 XOR** outputs may include illegal five-bit indices 29–31. Every variant reencrypts the complete original ciphertext **308/308** and recovers an independent 308-rune native-GP plant **308/308** under its own encoder. Reencryption is an implementation check; there is no key-finding or plaintext fitting.

### Exhaustive phase result (not a cherry-picked offset)

| Original-source test | Exact result |
|---|---:|
| Tested direct modular sign/phase pairs | **190 of 190** |
| Maximum GP29 index of coincidence among all 190 | **0.03695164770083337**, plus sign, phase77 |
| Minimum GP29 IoC among all 190 | **0.032763653284825923**, plus sign, phase7 |
| Modular keys yielding a valid GP one-rune first word `A` or `I` | **11 of 190** |
| Tested direct five-bit XOR phases | **95 of 95** |
| Fewest XOR out-of-alphabet runes | **14/308**, phase44 |
| Most XOR out-of-alphabet runes | **37/308**, phase8 |
| Complete legal GP29 XOR outputs | **0 of 95** |

An unknown phase cannot rescue the five-bit direct XOR as a literal GP29 plaintext: **every** phase produces forbidden GP values, with at least fourteen violations.

The 190 modular candidates require a *language-register* comparison, since their arithmetic is bijective. Use the repository's pinned Gibran, Shakespeare and Emerson corpus texts and the exact canonical GP29 word encoder used in the established prior source-native controls: uppercase, `QU→CW`, `V→U`, `K/Q→C`, `Z→S`, greedy longest-first GP digraph tokenization. Compare the IoC of **every contiguous 308-rune window**, with stride one, to the *highest* original modular candidate IoC, **0.03695165**.

| Independent native-English GP corpus | Exhaustive windows of 308 runes | **Lowest** window IoC | Native windows reaching any candidate's best IoC |
|---|---:|---:|---:|
| Gibran, *The Prophet* | **62,807** | **0.05254029** | **0** |
| Shakespeare sample | **218,493** | **0.05015018** | **0** |
| Emerson essays | **324,323** | **0.04991751** | **0** |
| **Total** | **605,623** | **0.04991751** | **0** |

Even the most favorable original-phase modular output is below **all 605,623** authentic GP-English windows. This is a decisive negative for this exact native-register cipher family, independent of first-word crib choices. It is *not* a mathematical impossibility theorem for every imaginable English source or a different intermediate symbol register.

### 23-dot and zero-offset controls

The source's 23-dot terminal suggests one *additional, unverified* selector for showing concrete first words. Source-original p54 begins with the complete one-rune word `A`, then an eight-rune red title word. These six readouts were fixed before interpretation, while the all-phase census above removes any selection privilege from them:

| PARABLE entry | Operation | First output word | Second output word | Illegal five-bit outputs |
|---|---|---|---|---:|
| 0 | − mod29 | J | ABEAIJAEMN | 0 |
| 0 | + mod29 | H | XAEESOEOUF | 0 |
| 0 | XOR | NG | JBSIOEEA[30]AE | 26 |
| 23 | − mod29 | G | EAFWAFAEAE | 0 |
| 23 | + mod29 | P | IPIUROAEL | 0 |
| 23 | XOR | I | WFWAFEACE | 25 |

The seemingly promising 23-offset XOR `I` is a **one-letter accidental hit**; its second word is nonprose and 25 indices elsewhere are forbidden. Four anchored additive outputs fail their very first ordinary-English one-letter word. Full-phase frequency evidence independently excludes the 11 modular first-word survivors.

## Decision and reproducibility

**Retire the entire direct 95-rune cyclic PARABLE-key 29-symbol additive and literal five-bit XOR families on the original 308-rune terminal chapter.** The visual 308=3×95+23 equality remains a conjectural coincidence without an operator. Don't launch phase-tuned variants, arbitrary key transformations or XOR-escape repairs from this count alone. Reconsider this source if an independent authentic clue supplies a different **specified** operator, intermediate register, or source-derived key.

The [read-only Node22 CommonJS SFT](../sims/lp2_terminal308_parable95_23dot_direct_sft.cjs) asserts the 232/76/95/23 source lengths, original red-heading indices, all **285** phase/operator outputs, exact 308/308 round-trip and synthetic positives, all original IoC extrema and XOR-invalid extrema, and all **605,623** native English control windows. Original source: [canonical LP2 GP29 corpus](../resources/liber-primus/lp2-corpus.json); native controls: [Gibran](../resources/control/gibran_prophet_58585.txt), [Shakespeare](../resources/control/shakespeare_first300k.txt), and [Emerson](../resources/control/emerson_essays_2944.txt). Physical dot motif and first full word are separately recorded in [the original dot census](lp2-original-dot-punctuation-physical-census.md) and [p54–55 original boundary audit](lp2-original-page-boundary-audit-p32-p54-p55.md).

**Distinct earlier investigations:** [the 180-rune p56||p57 repeated-key transfer](lp2-solved-terminal-known-text-transfer-gate.md) targets the entire unknown manuscript, and [the original 308-unit known-hash bridge](lp2-terminal308-knownhash-fullsource-direct-pad.md) uses **85+128+95** adjacent source symbols. Neither tests the present complete 95-rune PARABLE cyclic key.
