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
