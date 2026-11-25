# Length-conditioned word-key inversion and arbitrary-alphabet capacity

**Agent36 — 25 November 2026. Decision: scoped exact original-cipher rejection.** No unknown plaintext, authentic key or source-selected operation was recovered. This investigation tests a substantially more permissive alternative to shared q8/q13 word-reset keys: every printed group length receives its own arbitrary position-indexed key. It grants arbitrary whole-group reordering, because no lexical sequence or adjacent-word grammar is used. It is conditional on H-shuffle (printed groups are preserved plaintext units); H-decoy, changing group membership, and maps with additional history remain open. No original source explicitly selects a length-conditioned key.

## Exact all-key lexical inverse

For length L, ordinary consuming encryption is C_i = P_i + K_{L,i} (mod 29), with an unconstrained L-entry vector shared by groups of that length. Any in-register plaintext group P paired with an observed C uniquely nominates K_L=C-P. A histogram of these vector nominations counts the exact supported group instances, including duplicates, and its maximum is therefore the exact optimum over all 29^L vectors. Summing maxima over L permits entirely unrelated keys at different lengths. The transparent plaintext-F variant resets the same vector at each group, holds F without consuming, and permits consuming ciphertext zero. For this case grant *every* original group containing any ciphertext F automatic coverage. Remaining groups are zero-free and admit no literal F, so the same exact nomination applies on the non-F lexicon. This is an upper bound, not an exact optimum for the F-bearing groups.

Source: image-corrected transcription and canonical page tapes agree at all 12,956 unknown runes; all 2,896 complete groups and all nine chapter boundaries are checked. The broad 35,940-form lexicon combines 80% training prefixes of three literary sources, five exact solved GP sections, both native spellings of the pinned English word-frequency list, and all 29 singleton runes. Four exact solved sections are omitted from the native additions; this does not guarantee their ordinary English words are absent from other dictionaries. The 5% OOV allowance is a deliberately finite reference condition.

| Physical region | Groups | Ordinary maximum | Literal-F relaxed maximum | 5% OOV allowance |
|---|---:|---:|---:|---:|
| p0–2 | 158 | 41 | 68 | 7 |
| p3–7 | 255 | 49 | 74 | 12 |
| p8–14 | 383 | 65 | 122 | 19 |
| p15–22 | 437 | 81 | 143 | 21 |
| p23–26 | 224 | 46 | 79 | 11 |
| p27–32 | 326 | 60 | 104 | 16 |
| p33–39 | 378 | 62 | 96 | 18 |
| p40–53 | 669 | 85 | 194 | 33 |
| p54–55 | 66 | 27 | 32 | 3 |
| p0–55, shared | 2,896 | 288 | 691 | 144 |

Thus even independent chapter keys leave every chapter far below the coverage requirement. For the whole-book F relaxation, 422 F-bearing groups are granted free; only 269 of the 2,474 zero-free groups can be covered simultaneously.

Controls: 32 exhaustive small-alphabet tests agree with the nomination formula. On exact solved GP native plants (WELCOME, second KOAN, p56 AN END, p57 PARABLE), full ordinary coverage maxima are 121/124, 88/88, 24/25, 18/20; F-relaxed 122/124, 88/88, 24/25, 18/20. These contain all true eligible lexical groups. A 70% group prefix fit recovered 9/10, 6/9, 3/6, 2/6 ordinary length vectors and 35/37, 24/25, 6/7, 1/4 predicted eligible held-out groups, respectively. Short lengths with little training coverage are not reliably identifiable; the p57 donor exceeds 5% OOV and is a warning against universal claims. For literal F, prefix-selected vectors recover 23/26, 19/22, 4/5, 0/3 eligible zero-free withheld groups. No positive original fit is warranted.

Reproducer: [length-key SFT](../sims/lp2_length_conditioned_group_shift_sft.cjs); [full outputs](lp2-length-conditioned-group-shift.json).

## Dictionary-independent extension: arbitrary per-position bijections

Allow a completely arbitrary GP29 permutation for every (printed group length L, consuming slot j), independent across slots and lengths. This includes every affine/additive row and far more; there is no small key-space premise. For each row r let h_r be its ciphertext histogram sorted descending. Any permuted row has top-k mass at most the first k entries of h_r. Therefore the sum of sorted h_r over rows majorizes the total plaintext histogram. Aligning all row ranks attains the envelope for the ordinary consuming model. By convexity of x(x−1), its collision sum is an exact maximum over all such independent bijections. This argument uses only preservation of group membership/length and within-group physical order.

The whole original has 105 distinct length-slot rows. The shared ordinary ceiling is **E ≤ 828** (indeed every symbol) and **IoC ≤ 0.03866925302144872**. Independently keyed chapters raise it to E≤1706 and IoC≤0.06349329005848134; this relaxed aggregate can pass the native floor. Even granting separate chapter maps, p40–53 alone has an ordinary ceiling 0.050347062527860524, below all 562,565 length-matched literary windows (minimum 0.055969360499260594).

Three fixed normalized literary sources provide **532,721** complete 12,956-rune windows (34,674 Gibran; 204,151 Shakespeare; 293,896 Emerson), with joint conservative minima E=1408 and IoC=0.057216772285951. These are finite comparison bounds, not necessary properties of every possible English message. Nine exact solved-GP sections have IoC 0.05250694–0.07002801; all nine arbitrary-permutation plants replay exactly and obey every cumulative-frequency inequality.

### Exact-safe relaxation of every latent F history

Do not discard whole groups containing F. At physical position i, with z_i preceding ciphertext zeros in the same group, a consuming slot must satisfy i−z_i ≤ j ≤ i. This interval permits all possible earlier F holds, including inconsistent combinations, so it is a safe relaxation. For each (L,j), count each group at most once per ciphertext value v that can occur at that slot. For any set of k non-F plaintext symbols, a bijection selects exactly k preimages, and the actual number of consumed occurrences from that set is no greater than the sum of the k largest group-incidence counts. Summing across rows bounds every non-F top-k mass. Plaintext F itself has at most 458 occurrences, the total original ciphertext zeros. Insert this independent F cap into the sorted non-F envelope and truncate its prefix sums at N; the resulting sorted vector majorizes every permitted full plaintext histogram. The sum-of-squares bound then follows exactly as above. No guessed F mask or lexical constraints are used.

The shared book-wide bound is **E ≤ 885**, **IoC ≤ 0.0440831891427435**, below both independent literary floors. Nine exact solved native arbitrary-permutation plants with literal F holds, plus 256 small-alphabet randomized plants, preserve all prefix inequalities and forward/inverse replay using the planted hold history. The latent original gate is an upper bound, not proof that its maximizing rank envelope is realizable. Independent chapter maps remain feasible at the relaxation (book aggregate IoC cap .07238637; p40–53 cap .05959477). No inference of a true cipher or F-hold law follows.

Reproducers: [ordinary arbitrary-bijection SFT](../sims/lp2_length_position_permutation_majorization_sft.cjs) · [ordinary raw](lp2-length-position-permutation-majorization.json) · [latent-F SFT](../sims/lp2_length_position_latent_f_majorization_sft.cjs) · [latent-F raw](lp2-length-position-latent-f-majorization.json).

## Minimum independent registers across chapters

A further all-partition extension permits any noncontiguous sharing of length-slot alphabets across the nine physical chapters. Enumerate all 21,147 set partitions; aggregate row counts within each block, sort rows, then sum envelopes across blocks. For the F model, use the incidence relaxation above and insert the one global F cap. Compare to the two independent literary minima; both must pass for a partition even to be considered viable.

| Number of independent registers | Ordinary maximum IoC | Ordinary maximum E | Latent-F maximum IoC | Latent-F maximum E |
|---:|---:|---:|---:|---:|
| 1 | .038669 | 828 | .044083 | 885 |
| 2 | .042897 | 1044 | .049142 | 1097 |
| 3 | .046797 | 1204 | .053778 | 1264 |
| 4 | .050245 | 1331 | .057653 | 1392 |
| 5 | .053633 | 1435 | .061508 | 1494 |
| 6 | .056827 | 1521 | .064980 | 1590 |
| 7 | .059438 | 1597 | .067795 | 1666 |
| 8 | .062063 | 1661 | .070701 | 1733 |
| 9 | .063493 | 1706 | .072386 | 1778 |

Under the ordinary model, **at least seven independent chapter registers** are necessary to pass the finite native concentration gate (249/462 seven-block partitions pass both relaxed minima). Under the authentic-F hold model, **at least five registers** are necessary (4,518/6,951 five-block partitions pass). Four F-registers miss E by at least 16 even though the independently maximized IoC can cross its floor. Separate maxima need not come from the same partition, and passing both necessary bounds does not authenticate any key. This rules out low-register sharing under the stated geometry without fitting arbitrary alphabets; it supplies no plaintext. The source does not select a register partition.

Reproducer: [all-partitions SFT](../sims/lp2_length_position_register_partition_sft.cjs) · [full partition summaries](lp2-length-position-register-partition.json).

## Research decision

Retire all length-specific additive vectors at the stated intact-group 5% OOV condition, even with chapter-private vectors. Retire low-register arbitrary per-length/position bijections at the stated finite literary concentration gate. Do not expand into arbitrary per-word maps or search partitions that merely survive these necessary bounds; such models need a new independent source constraint or a genuine held-out decipherment. H-decoy and more complex state-dependent mappings are not excluded.

Execution: the four CommonJS experiment cores were executed against repository inputs in connected JavaScript; complete result JSONs are committed. The generated standalone Node wrappers have not been executed in a Windows checkout or CI. No additional workflow was created.
