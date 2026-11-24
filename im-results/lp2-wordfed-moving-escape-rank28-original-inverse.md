# Moving escape / cyclic preceding-word rank28 inverse

**24 November 2026, Agent14. No unknown LP2 plaintext or key.** A different word-fed mechanism explicitly generates the repeat/nonrepeat distinction, unlike the historical transparent-F additive recurrence. The original 86 adjacent equalities and the signed words/numbers/direction wording motivate trying this, but no source selects the exact escape/rank formula.

## Reversible architecture

For each full plaintext word, cycle the preceding recovered plaintext word's rune indices k. At each position define E=(a*k+b) mod29, with all 29² shared a,b. If P=E, emit a zero ciphertext difference D. Otherwise set r=(P-[P>E]+E) mod28. Emit D=r+1 or D=15^r mod29 (two separate reversible rank conventions). The actual ciphertext is reconstructed by accumulating D mod29 through all word/page boundaries. The inverse uses the observed difference, returning E at zero, otherwise subtracting E from the rank modulo28 and reinserting the excluded ordinal. Previous-word key phase resets at each complete printed group. There are no hidden rerolls, variable-length escapes or per-word parameters.

This differs from the [fixed-escape word-private affine gate](lp2-wordprivate-rank28-affine-nativelex-gate.md) and [moving escape per-word fixed rank gate](lp2-contextual-escape-rank28-lexical-gate.md): both escape and rank shift vary *within* a word according to the actual recovered preceding word.

## Original recovery attempt

Read 12,956 exact GP29 runes and 2,896 full printed groups. Start at word39, the first complete singleton, granting every possible plaintext seed. Enumerate both rank conventions and all 29³ (a,b,seed) triples = **48,778 trajectories**. Choose by matched rune count in words of at least four runes in the fixed 29,081-form native GP lexical union. Train only on groups40–412 (1,299 eligible runes); freeze selected keys and continue groups413–795 (1,318 eligible runes). All selected output is exactly re-emitted.

The best three ties, (log rank, a=12,b=14, seed=10/15/24), each match only **13/1,299** eligible training runes. All three and the next nine selected trajectories recover **0/1,318** eligible held-out runes. The first best candidate starts `IYPBEOW JYEALXW YTOE IAEAHJ THEOIYB`. No coherent native GP plaintext.

Two planted solved-native 150-word blocks use different hidden rank conventions and affine keys. The first 79 emitted words alone uniquely recover the correct convention, both coefficients and seed for each block. The untouched remaining blocks recover **304/304** and **81/81** actual planted runes respectively. This demonstrates recoverability within the tested family, not historical authenticity. Plant scoring uses the solved-source vocabulary, which includes the plant words.

## Decision

Retire this exact cyclic-word-derived moving escape/rank rule as a direct word-aligned native GP inverse. Alternative dynamic state functions, changed segmentation, and nonlinguistic payloads remain possible; arbitrary variants are not supported by this negative result. The historical F-hold failure is a separate algebraic obstruction.

Reproducer: [read-only CommonJS SFT](../sims/lp2_wordfed_moving_escape_rank28_sft.cjs). Algorithms executed directly in the connected JavaScript runtime against original corpus and independent lexical inputs. No CI claim.
