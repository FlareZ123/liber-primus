# Prime-residue indexed additive GP29 table — exact original gate (#2650)

**Decision:** no compatible shared table on the original p40 chapter's first 162 runes under the fixed 33,394-spelling intact-group register. The original test grants every visible-zero interpretation and every 29-entry table, including nonpermutations. This is an exact finite lexical obstruction, not a spacing-free all-language impossibility theorem. No authentic LP2 key or plaintext recovered.

## Model and independent controls

Let (r_j=p_j\bmod29) for the consecutive primes beginning with 2. On a non-F plaintext sign, emit (C=P+K[r_j]\bmod29), consuming one index; plaintext F emits literal zero without consuming. A non-F sign may emit ciphertext zero and consume. K is an arbitrary vector in GP29^29, with no permutation or period restriction. The solved p56 prime-minus-one rule is the special case (K[r]=r-1\bmod29); the authentic source plaintext and ciphertext replay 85/85 exactly. The residue lookup is a motivated extrapolation, not an authenticated Cicada instruction. #2622 instead tests an additive periodic key on top of prime-minus-one, so does not subsume this table.

The lexical register is the repository TextBlob spelling list, two GP tokenizations (greedy and explicit ING/IO), all target-excluded native solved words, and all 29 single-rune forms. The broad singleton allowance deliberately avoids an A/I/O/T assumption. For each exact mask of held zeros, the active phase at every position is fixed. Every printed group has a domain of dictionary words satisfying the mask and equal table-entry requirements within the group. Its implied partial table assignments are linked through shared residues. Exact pairwise arc consistency removes incompatible word candidates; complete finite DFS is available if necessary. Each accepted complete solution is forward-replayed.

## Original result

The original corrected transcription and canonical index tape agree on all 12,956 unknown runes. The frozen p40–53 prefix is global offsets 9640–9801 inclusive (37 intact groups, 162 runes). Visible zeros are at local offsets 0,24,44. All eight masks have nonempty initial group domains but fail shared-table arc propagation; zero masks reach DFS, zero cap events, zero compatible tables. For example, the long groups at local offsets 31 (12 runes), 78 (9) and 137 (10) have individually nonempty domains before propagation; the failure is the joint shared table, not a single absent dictionary word. No later original material is scored or retuned.

## Target-excluded table recovery and continuation

The planted hidden table is (K[r]=(7r^2+11r+3)\bmod29) with only 15 distinct shifts. Each native target's own section is omitted from its dictionary and continuation trigram training. The table is inferred from ciphertext and printed group lengths alone; the actual Fehu mask and key are used only for post-fit evaluation. The original gate was unchanged when the native calibration was strengthened.

| Native source | Fit runes | Literal F / consuming zeros in fit | Exact fitting paths | Hidden table | Frozen continuation |
|---|---:|---:|---:|---|---:|
| WELCOME | 131 | 4 / 2 | 1 | 29/29 | 64/64 |
| KOAN 1 (initial calibration) | 130 | 1 / 1 | 2 | ambiguous | not scored |
| KOAN 1 (longer calibration) | 176 | 1 / 2 | 1 | 29/29 | 46/46 |

The WELCOME held-out spelling ILLUSIANS is outside the frozen lexical register, so the continuation decoder uses exact fixed-table, latent-F trigram Viterbi rather than requiring words in that register. Its 23 legal raw continuation paths rank the actual plaintext first. The longer KOAN continuation has one legal path. Both selected full controls replay exactly. The longer calibration was added after the first shorter KOAN fit was ambiguous; it is disclosed as a calibration refinement, not an independent blind preregistration.

## Reproduce and disposition

- [SFT](../sims/lp2_prime_residue_table_exact_lexical_sft.cjs)
- [Machine-readable outcomes](lp2-prime-residue-table-exact-lexical-output.json)
- Inputs: canonical corpus, corrected transcription, native solved GP29 records, and repository TextBlob spelling register.

Executed the exact JavaScript function against repository inputs. No Windows CI result is claimed. Retire the specified intact-group prime-residue additive table route at origin zero; arbitrary resegmentation, OOV plaintext and other clocks are outside this proof. The negative first chapter gate makes a frozen later-original prediction and p16–22 transfer inapplicable. No authentic source selects another residue function.


## Spacing-free direct table inference (Agent25, 25 November)

The intact-group premise is removed by treating each visible zero as hold or consuming zero. For a fixed mask, all 29 unknown table rows are independent under a uniform prior. Each observed consuming symbol multiplies the appropriate residue-row likelihood by the target-excluded GP29 unigram probability of its candidate plaintext (zero excluded). The exact integrated likelihood of that mask is the product of the row evidence and the Fehu-hold probabilities. A Bayesian beam of 1024 paths branches at every visible zero, processes the entire following nonzero block before pruning, and nominates up to 64 distinct maximum-posterior tables. The exact fixed-key trigram Viterbi selects on first1500, then freezes the state/key for next500; every traced path replays. No printed boundaries or word register. Origin-zero prime clock, no redraw. Authentic p56 replay 85/85.

The initial soft-phase EM variant failed its 1500/500 calibration (no complete table proposal) and was never run on original. The replacement Bayesian method recovers 28/28 recurring residue rows on the same pilot and two fresh disjoint Emerson controls (all 84 recurring rows; one complete 29/29 table, two ambiguous residue-zero rows). Residue0 occurs only at the prime29; exact complete table recovery is not asserted. All three frozen continuations decode 500/500. Their selected masks differ from the true masks at some early positions. Control holdout logLR +.84586..+.97337 nats/rune against uniform. Language model Gibran/Shakespeare, 281,914 runes.

Original p40–53 first1500 has 70 visible zeros; the beam nominates 64 legal training keys, best fit logLR −2.250808, nonprose. Its frozen next500 has no legal path. Thus the calibrated receiver fails even without assuming plaintext word boundaries; it does not exhaust all masks or all tables. No original plaintext/key.

[Bayesian SFT](../sims/lp2_prime_residue_table_spacingfree_bayes_sft.cjs), [EM SFT](../sims/lp2_prime_residue_table_spacingfree_em_sft.cjs), [failed EM pilot](lp2-prime-residue-table-spacingfree-em-pilot.json), [Bayesian pilot](lp2-prime-residue-table-spacingfree-bayes-pilot.json), [fresh1](lp2-prime-residue-table-spacingfree-bayes-fresh1.json), [fresh2](lp2-prime-residue-table-spacingfree-bayes-fresh2.json), [original](lp2-prime-residue-table-spacingfree-bayes-original.json). Core executed against repository inputs in connected JS; no standalone Node/CI run.
