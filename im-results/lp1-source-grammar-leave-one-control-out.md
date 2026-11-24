# Source-word cipher-program grammar: leave-one-authentic-control-out decision

**Decision for [#2584](https://github.com/FlareZ123/liber-primus/issues/2584): retire the frozen grammar as a transferable source-to-program selector.** It recovers the authentic WELCOME key and plaintext, and ranks the correct p56 program first, but cannot generate the authentic second-KOAN key when that program is held out. No unknown LP2 ciphertext was scored and no unknown plaintext/key was recovered.

## Frozen grammar and inputs

The purpose is to test generalization from actual solved programs, not to repeat ciphertext-only arbitrary-key recovery. The earlier [donor/self-occurrence and historical crib audit](lp1-self-revealing-key-source-selection-gate.md) establishes the clear LOSS OF DIVINITY donor and absence of an independently authored C→F rule. The present experiment tests whether this rule can be learned from other authentic programs, with a finite source-only operand vocabulary and a fixed target-excluded language ranker.

Inputs: `resources/transcriptions/lp1_wulfic_canonical.txt` ($-separated sections 1,5), `resources/external/relikd-solved-gp29-native-v1.json` (native GP comparator and non-target language corpus), and `resources/liber-primus/lp2-corpus.json` (ordered alphabet, physical p56 ciphertext). These are derived canonical transcriptions of the original manuscript. No synthetic ciphertext controls are substituted for the genuine sections.

Grammar (fixed in [code commit 79ae630c2c6b4ac0a3327a3c967714e35fa5faa9](https://github.com/FlareZ123/liber-primus/commit/79ae630c2c6b4ac0a3327a3c967714e35fa5faa9) before executing ranks):
- Identity and GP29 Atbash as native clear/reflective controls.
- Additive GP29 stream with transparent plaintext F and no advance for F; no separator consumption; phase zero. Operand is either one complete literal GP word from the independently readable LOSS OF DIVINITY text (93 distinct types), repeated, or the nonperiodic prime-totient stream (p_j−1 mod29, j starting at zero). The explicit primes/totient statement in clear LP1 WISDOM motivates inclusion of the latter even when p56 is held out.
- The only alternate spelling operation is C-index 5→F-index 0. It is enabled *only* if another known periodic control exactly replays under a transformed donor word but not its literal form. No mutations, arbitrary keys, periods or reset choices searched.
- Two bits identify one of the four operation families. A donor program adds log2(93) bits and, if spelling mapping is enabled, one bit for literal/mapped choice. Aliases retained as separate descriptions, but separately counted as distinct typed programs. This is a declared finite grammar penalty, not a universal MDL code or evidence of authored source selection.
- An exact sparse-state Viterbi decoder branches on ciphertext F (transparent hold or ordinary nonzero plaintext) and scores GP29 trigrams using alpha=0.1 from the other eight native sections; initial unigram and bigram. Score = negative log language likelihood + description bits × ln2. The held-out target text is accessed by the computation only after its complete candidate predictions and ordering are calculated. Verify every viable candidate's exact forward replay; compare with native target afterward.

This is a **retrospective computational leave-one-control-out**, not a blind historical rediscovery: the investigator already knew the published solutions and selected the grammar accordingly. The prior source audit and training sources establish the grammar's scope, not a claim that a first-time solver would select it uniquely.

## Actual original-cipher results

| Withheld control | C→F learned from remaining controls? | Program descriptions / distinct typed streams | Feasible descriptions | Authentic program rank | Top prediction |
|---|---|---:|---:|---|---:|
| WELCOME (515) | Yes | 189 / 113 | 6 | 1 (two equivalent descriptions) | **515/515** |
| second KOAN (319) | No | 96 / 96 | 2 | Absent | **100/319** (identity, nonprose) |
| p56 AN END (85) | Yes | 189 / 113 | 58 | 1 | **79/85** |

WELCOME selects literal DIUINITY `[23,10,1,10,9,10,16,26]`, 9.539 bits; the C→F alias is identical since its donor contains no C. Both score 1434.521777 nats penalized, next distinct feasible model identity scores 1852.523208. Exact forward replay and exact native prediction.

With KOAN withheld, no training observation warrants C→F, and no literal donor program exactly encrypts the native comparator. The only feasible descriptions are identity (1152.933053 penalized nats) and Atbash (1185.700470); neither is a solution. The known C→F spelling cannot be learned by this restricted grammar from WELCOME or p56. Inserting it globally after learning the withheld solution would defeat the assignment.

P56 selects prime−1 (2 bits, 225.753405 penalized nats), ahead of MIND (309.594094). It is the only candidate that encrypts the native comparator exactly, but the trigram-optimal decoded path is six runes wrong, despite exact replay. This separately exposes latent-clock ambiguity: selecting an arithmetic program is not the same as uniquely recovering its plaintext.

The ranker uses the full original ciphertext of each target and no target plaintext, rather than an unknown-LP2 fit/holdout. The assignment requires all authentic held-out programs to be identified before an LP2 transfer. That gate fails on KOAN, and p56 does not predict all native runes either. It is therefore inappropriate to search unknown LP2 under this grammar or add another tuned spelling operator.

## Research consequence

A compact shared shift/clock grammar is useful as implementation structure, and an independently readable donor can genuinely constrain one known key. But donor address, exceptional key spelling and the program selector are not determined from the other authentic controls. The historical KOAN crib supplies information absent from the grammar. A productive successor requires an independently selected LP2 crib or an explicit source rule for the exceptional mapping, rather than further fitting the same known keys or a wider grammar. This does not exclude periodic or prime-driven LP2 mechanisms.

Reproduce: `node sims/lp1_source_grammar_leave_one_out_sft.cjs`. The computation was executed in Code Mode using the exact fetched repository text and the same function serialized into the committed standalone CJS script. No Windows CI run is claimed. The authoritative overall synthesis is unchanged.
