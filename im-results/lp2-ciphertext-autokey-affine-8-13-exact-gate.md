# Exact ciphertext-autokey GP29 inverse gate (q8 and q13)

**Decision:** no unknown LP2 plaintext or key. The fixed-length ciphertext-fed affine autokey family below has no whole-book shared feedback parameters. Four original pages individually reject both historical primer lengths even when given entirely independent coefficients and arbitrary primers. The ordinary additive member survives feasibility on just three page/length pairs; an exact language-scored inverse on those pairs produces nonprose despite native-plant success.

## Model and distinction from prior work

The established LP1 controls use 8- and 13-rune periodic additive keys with genuine transparent plaintext F. #2549 investigates *plaintext*-fed autokey; #2550 uses the previous physical ciphertext plus a separate periodic key. This gate instead uses the **qth prior consuming ciphertext** as the only post-primer key, with no periodic pad. #671's fixed 17-rune Instar seed is a different fixed-key scope. No historical instruction authenticates ciphertext autokey for unknown LP2; the two lengths are motivated by solved LP1, not selected by unknown text. This is a finite exact attack, not a new source selector.

GP29 indices 0..28 are used. Let q be 8 or 13; a and b range from 1 to 28; d ranges from 0 to 28. Initialize a q-entry queue with arbitrary GP29 primer entries. A plaintext F (P=0) emits C=0 and neither consumes nor appends a queue entry. Otherwise emit C=(aP+bK+d) mod29 where K is the queue head; pop K and append C. A consuming C=0 is permitted. After q consuming symbols, the queue contains only original ciphertext symbols; no unknown primer value survives.

For any q+1 consecutive nonzero ciphertext symbols within a reset-free region, every one must consume. Therefore C_i != b C_(i-q)+d mod29, because equality would force P_i=0, which would emit literal zero instead. Each such pair eliminates one d for each nonzero b, independent of a, the primer, language and spacing. There are 812 (b,d) pairs or 22,736 (a,b,d) triples per q. The second-stage exact dynamic program enumerates every possible hold versus consuming choice at every C=0. Its state is the queue of consuming ciphertext values; while fewer than q values have entered, the still-unused primer symbols are unconstrained, and a legal nonzero P always exists for a fresh primer entry. Once full, the only impossible consuming transition is C=bK+d. Equal queue states have identical future feasibility and are merged losslessly.

Every page is tested with its own arbitrary starting queue. A contradiction within one page also excludes continuous state entering that page, since a fresh arbitrary queue is a superset of reachable queues. Tests allow resets at physical page boundaries but not inside a page. Rune order and values are unchanged. The canonical p50 rune-free page is excluded from the 55 rune-bearing page counts.

## Exact original results

| q | Within-page zero-free pairs | Survivors with shared b,d across all pages | Pages excluding every b,d even with independent primers | Standard additive b=1,d=0 individually viable |
|---|---:|---:|---:|---|
| 8 | 9,020 | 0/812 | 19/55 | p14, p49 |
| 13 | 7,313 | 0/812 | 4/55 | p33 |

The exact latent-F DP examines all 656 q8 and 1,264 q13 page-local pairs surviving the cheaper zero-free gate, with peak 8 and 21 queue states respectively. The q8 page-local exclusions are p4,10,16,17,18,20,21,24,25,26,29,30,35,38,39,40,45,47,54. The q13 exclusions are p20,29,38,54, all of which also reject q8. Thus no choice of these two lengths, even changing the length, coefficients and primer per physical page, can account for every original page under this law. This does not exclude a distinct cipher on those pages or resets within a page.

For each q, three separately planted source-native sections (WELCOME, first KOAN, LOSS OF DIVINITY) use distinct nonzero affine parameters (1,1,0), (7,11,19), (23,19,8) and arbitrary deterministic primers. All six true parameter pairs survive. The known plaintext satisfies every tested zero-free transition. The affine feasibility gate does not identify the true parameters uniquely on these plants; it is a necessary and sufficient *existence* gate, not a key-ranking or prose-recovery test.

## Attempted original suffix recovery

For the **standard additive** model (a=b=1,d=0), the three remaining page/length pairs have a finite exact inverse. Rather than guessing a primer or treating ciphertext F as automatically transparent, a Viterbi DP tracks the queue and up to two previous decoded runes. The first q nonzero ciphertext symbols guarantee that the primer is fully consumed, so scoring begins immediately after the qth such symbol; no prefix plaintext is fitted to the language model. The score is a smoothed backoff trigram over native GP29 solved sections (backoff pseudocount 5, no word spacing). For each unknown page the training set is all nine native solved sections; for each positive control its own native section is excluded. A representative arbitrary prefix is constructed only to verify complete forward replay, so the printed primer in the raw output is **not recovered key material**.

| Original page | q | Unscored prefix | Scored suffix runes | Maximum score (nats/rune) | Forward replay |
|---|---:|---:|---:|---:|---|
| 14 | 8 | 9 | 128 | -5.330633 | exact |
| 49 | 8 | 9 | 57 | -5.526301 | exact |
| 33 | 13 | 15 | 199 | -5.292225 | exact |

The original suffixes are not connected readable native prose. For comparison, six additive ciphertext-autokey plants on authentic native sections predict **4,033/4,033** scored suffix runes exactly, across q8 and q13 (each target excluded from its language model). Their true/selected scores are -2.4814 to -2.7838 nats/rune; every plant round-trips. The original suffix selection uses the complete original suffix and is therefore retrospective decoding, not held-out plaintext prediction. Exact round-trip is an implementation invariant, not proof of a solution. The result does not reject every per-page affine survivor by language, and does not test plaintext-fed autokey, position-fed variants, nontransparent F, or arbitrary internal resets.

## Reproduction and disposition

- [Exact queue-feasibility SFT](../sims/lp2_ciphertext_autokey_affine_8_13_zero_free_gate.cjs) and [complete output](lp2-ciphertext-autokey-affine-8-13-exact-output.json).
- [Exact standard survivor Viterbi SFT](../sims/lp2_standard_ciphertext_autokey_survivor_viterbi.cjs) and [complete output](lp2-standard-ciphertext-autokey-survivor-output.json).
- Source fixtures: [canonical LP2 indices](../resources/liber-primus/lp2-corpus.json) and [native solved rune sections](../resources/external/relikd-solved-gp29-native-v1.json).

Both exact function bodies were executed on the fetched repository JSON in a JavaScript runtime; no Windows Node CI result is claimed. Run either SFT from the repository using Node. The complete outputs preserve per-page constraints, native-plant outcomes, exact candidate suffixes and replay status.

**Research decision:** retire the whole-book q8/q13 ciphertext-fed affine model under the stated queue and F-hold law. Retire standard additive page-local q8/q13 as an ordinary native-prose decoder on these pages. Do not retune arbitrary feedback lengths or offsets without an independent selector. #2549's plaintext-fed model is not excluded by this result.
