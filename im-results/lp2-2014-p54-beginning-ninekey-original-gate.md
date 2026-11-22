# May 2014 p54 “A BEGINNING”: original nine-shift derivation and unguessed original-text test

**Agent4, 15 November 2026. Decision for Director #1026:** The originally proposed p54 **A BEGINNING** heading and the accompanying nine signed shifts are a **crib-fitted participant guess**, followed by an immediate negative original-ciphertext holdout. A literal period-nine extension also fails the solved-p56-style transparent-F rule before completing p54. **No original unknown-page plaintext, creator key or source-selected decryption is recovered.**

## Recovered contemporary evidence

Original Freenode source is the exact 18,487,233-byte, Git-blob-SHA1-verified `#cicadasolvers.freenode.log` at commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3` (blob `bdd277c14f94c34b5ae714cd00c238065beeed4e`). These are **participant** statements, not signed Cicada text:

- **20 May 2014 L183375:** `zentikiti` suggested p54 could start “A beginning” or “A teaching”.
- **21 May L185483:** `Mothwing` reported that using a Fibonacci-based shift beginning with zero had failed.
- **23 May L186651:** `Mothwing` explicitly wrote that p54 might be “A Beginning”, but **“beginning doesn't fit”**.
- **24 May L188635:** `Totry` stated `was sure 54 is 'a beginning' ie 0,-2,-3,-17,-17,-22,-5,0,-27`. This is the full previously unspecified nine-number vector, recovered from an independently dated primary transcript.
- **25 May L189413–14:** `sol1ton` again guessed that the first one-rune A should be literal (zero shift).

[Original Git-blob Windows extraction](https://github.com/FlareZ123/liber-primus/actions/runs/43670751269) · [historical source witness SFT](../sims/lp2_p54_2014_beginning_source_sft.cjs).

## Exact arithmetic on untouched original physical p54

The source's first two printed words are GP `A` followed by eight-rune `M NG D IA TH X I M`; the assumed plaintext `A BEGINNING` in GP-native orthography has nine symbols `A B E G I N N I NG`. With GP rune indices 0..28 as published:

```text
Original C:    [24,19,21,23,27, 2,14,10,19]
Assumed P:     [24,17,18, 6,10, 9, 9,10,21]
(P − C) mod29: [ 0,27,26,12,12, 7,24, 0, 2]
Signed shifts: [ 0,-2,-3,-17,-17,-22,-5, 0,-27]
```

These signed shifts are **exactly** the plaintext assumption minus the visible ciphertext, with no residual or independent key-generation rule. Their nine-rune “success” is algebraically predetermined by the guessed text. The author's “beginning doesn't fit” already correctly warns against adopting the crib.

To test one **fully frozen, no-free-parameters continuation**, repeat the nine-shift vector from the next original ciphertext position. The **very next complete printed eight-rune word**, which was never used in the fit, is:

```text
Original p54 next word: IA D P NG U W A M
Forced plaintext:       IA NG I R P X M M
```

This is not ordinary GP-native English. The complete 232-rune no-skip inversion has GP29 IoC **0.036236751754**; the 223 unguessed runes alone have **0.036440027471**. Authentic solved p57 GP-native clear text has IoC **0.062709966405**. An exact reencryption of a fitted period-nine Vigenère key is tautological, so that is not proof of a historical cipher.

**Stronger original p56-style F-transparency certificate:** Under the authentic p56 convention, any plaintext F (index0) passes through as *ciphertext F* and does not consume a shift. We grant **every legal mask** on all original p54 ciphertext F positions `[41,65,195]`, allowing each to be a bypass or an ordinarily encoded non-F letter. Dynamic programming over all nine key phases finds **no legal complete-page inverse**: all paths have died at original zero-based p54 rune offset **57**, where printed ciphertext is `O`, the only surviving phase is 2, and `O + (−3) ≡ F (mod29)`. A plaintext F there would be required to have appeared as unencrypted ciphertext F instead. The implementation encrypts and decrypts a **232-rune positive GP-native plant** from the authentic solved p57 sequence under the same repeated nine-key and legal transparent-F convention; all 232 symbols round-trip and the dynamic check admits the plant. The rejection therefore reflects source data, not a broken F implementation.

## Boundary and decision

The original May 2014 participant did **not** specify a repeating nine-position key, a source-authored formula to extend these values, a secret reset, or a cipher state. Our exact contradiction rejects only that **one natural period-nine transfer of a tautologically fitted heading key**. Any claim that another p54 key or changing generator begins with this nine-value prefix still needs independent instructions and a complete originally unseen word, since the prefix contains no information beyond the chosen heading.

**Retire the circular A BEGINNING/nine-shift p54 proposal as a solution route.** Preserve the now-recovered nine exact contemporary numbers for historical source integrity and avoid trying modified periods or offset repairs. P54 remains undeciphered.

[Passing complete 232-rune original key/F/holdout Windows CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43671279440) · [Original 232-rune key/F/holdout single-file SFT](../sims/lp2_p54_2014_beginning_original_key_sft.cjs) · [primary IRC 2014 source extraction](../sims/lp2_p54_2014_beginning_source_sft.cjs) · [source witness Windows run](https://github.com/FlareZ123/liber-primus/actions/runs/43670751269).
