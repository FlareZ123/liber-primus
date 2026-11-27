# Doublet-triggered multiplicative state synchronization (#3210)

## Decision

A genuinely synchronizing, lossless ciphertext-controlled product-state receiver exists; its observable synchronizer is any literal equal ciphertext pair. Three matched native plants recover its hidden key after synchronization and predict disjoint held frames exactly, unlike the matched hold-at-doublet rival. The original p0 fit has an all-key concentration obstruction against all 1,882 equal-length windows in the nine-record native register, and the frozen p1 continuation is nonprose. Retire the specified receiver. No source-authenticated reset law, actual original key, or unknown plaintext.

## Independent starting observation and distinctions

Original LP2 has only 86 adjacent equalities in the 12,956-rune continuous tape. Those exact, already documented events are the candidate markers; we do not mine words or select an original substring based on language score. The two-letter marker is literal: for any x in GP29, the ciphertext word xx has the property proved below. A mathematical exploratory construction is not a claim that Cicada selected these markers. Authentic F holds preserve state/clock rather than resetting it, and do not authenticate this mechanism.

Preflight: #2913 shows that scalar constant-coefficient affine feedback cannot synchronize unless it degenerates to one-lag feedback; #3189 studies two-ended recency insertion and 28-distinct-glyph cover; #3164 lacks a source-fixed repeated rubric/marker; #562's DJU BEI state crib and stationary affine q<=6 failed. #3204's predictive-state equivalence does not identify a reset. #3208's predecessor-indexed repeat branch is a different state law, with an arbitrary complement row; here the complement is coupled through a single nonzero product register, and zero difference collapses that register. #2943's multiplicative receiver stores the last nonzero C, not a product since the latest doublet. No arbitrary pattern search, latent exception mask, or new alphabet.

## Model and exact synchronization

Use GP ordinals in F29, all-consuming; this is not the solved literal-F clock. With predecessor ciphertext x and nonzero state s, secret repeat label r in F29 and reset scale k in F29*, the sender and receiver are

    d = s * (p-r) mod29
    c = x+d mod29
    p = r+d/s mod29
    s' = k if d=0, otherwise s*d mod29
    x' = c

This is bijective on the 29 plaintext symbols conditional on current state and predecessor; d=0 iff p=r. State stays nonzero. Given an IV and first-symbol convention, the entire message replays. Controls choose c0=p0 for convenience and an independent nonzero starting state; this is not claimed to be the manuscript's initialization. Original inverse begins strictly after the first doublet and grants arbitrary earlier state.

For a literal word cc, after its first c the predecessor is c, whatever the initial predecessor/state; after its second c, d=0 and (x',s')=(c,k) exactly. Thus the *same observable word*, chosen independently of r,k, synchronizes every permissible initial state for each key, although the value k remains unknown until key recovery. Exhaustively check all 28 keys x 29 words x 29 incoming predecessors x 28 incoming scales = 659,344 cases. No state or predecessor is assumed known at the first c. The nonsynchronizing rival retains s on d=0 and otherwise has the identical product transition and output. For a fixed incoming predecessor, multiplying a nonzero difference is a permutation on nonzero s and retaining s is identity. No literal word can collapse all scales for that rival.

## Exact finite key reduction

After the first doublet set z=1. Before each subsequent emitted symbol d, s=k*z, so

    P = r + k^(-1) * d/z mod29
    z' = 1 if d=0, otherwise z*d.

The normalized tape u=d/z is entirely ciphertext-determined; all 812 possible (r,k) are precisely affine relabelings of one tape. All keys preserve the sorted symbol histogram, pair collision count, and IoC. There is no need to estimate or optimize hidden state. The rival normalizes z from frame start, keeping z at a doublet, with a common unknown initial scale k across its fit/held frames.

## Suppression-matched native controls

Original p0: 262 runes, two within-frame repeats at zero-based indices 122,207. Original p1: 266 runes, one at 194. Freeze those two frame sizes, repeat counts and first synchronization positions. Use three deterministic pairs of distinct solved source records, chosen by exact repeat-label count/first-position constraints, not language score:

| Plant | r,k | Fit source and offset | Held source and offset | Fit repeat indices |
|---|---|---|---|---|
| 1 | 28,7 | WELCOME 88 | LOSS OF DIVINITY 136 | 122,212 |
| 2 | 27,13 | LOSS OF DIVINITY 171 | KOAN1 319 | 122,221 |
| 3 | 21,17 | WELCOME 252 | KOAN1 192 | 122,157 |

All held repeat indices are exactly 194. These plants match length/count/first-sync position, not the second original fit event; exact full event-profile matching is not claimed. Source records are disjoint within each fit/held pair but reused across plants. Exclude all three donor records from training. Generate both synchronizing and rival ciphertext from each exact plaintext pair; both have the same repeat event positions by construction. Independent hidden IVs for the synchronization plants; shared hidden start k for the rival. Fit both receivers over all 812 keys using only fit suffix GP trigram/bigram score from six remaining records; freeze winning key before the held frame. Test only suffixes after first doublet for both receivers, 139 fit and 71 held runes.

| Actual law | Receiver | Keys | Exact held runes |
|---|---|---:|---:|
| sync | sync | 3/3 | 213/213 |
| sync | hold | 0/3 | 0/213 |
| hold | hold | 3/3 | 213/213 |
| hold | sync | 0/3 | 0/213 |

All six complete control pairs replay with their known planting IVs; correct-model held scores -2.7544, -3.0483, -2.6127 nats/rune. Matched wrong-law held scores -3.66 to -3.74. Fit-only control key margins >=0.705 nats/rune under the correct law.

## Original decision

Use exactly p0 after its first doublet and p1 after its first doublet, no rephasing. The winning p0 key r=26,k=24 has fit score -3.566013 and next-key margin only 0.006676. Frozen p1 suffix scores -3.708361, nonprose; the same frozen key on the entire continuous book after first doublet (12,833 runes) scores -3.690285. All three suffixes replay exactly, which is algebraically expected and no evidence of correct plaintext.

Stronger language-score-independent result: every possible key gives p0's 139-rune suffix ordered equal-symbol pair count exactly 648, IoC .03378167, modal count 9. Exhaustively compare all 1,882 contiguous 139-rune windows of each of the nine complete native records (no windows crossing record boundaries). The minimum ordered pair count is 980 (IoC .05108956, WISDOM offset9), and minimum modal count is 12. Zero windows match or fall below the original pair count. Thus no key can make this exact original suffix match any plaintext with the observed native-register concentration floor. This is a finite-register all-key exclusion, not a theorem about all conceivable novel prose. The whole-book continuous normalized IoC .03527410 likewise cannot be changed by any (r,k).

The synchronizer reduces the state to a key-dependent scale and genuinely works in plants, but no first-party instruction binds doublets to this operation. No unknown plaintext or authenticated key, no general rejection of nonpermutation state machines, private key changes, other resets, or alternate source registers.

## Reproduction

- [SFT](../sims/lp2_doublet_product_sync_sft.cjs), latest commit 56814bfbb136a72c05d2b08cb840c8e0cd507745.
- [Raw result](lp2-doublet-product-sync-output.json), latest commit 921e6199651caf1ba935d18d70cce9cd17048bd5.
- Core executed in connected V8, plus independent execution of exact suffix replay and finite-register count code. Node wrapper not independently run, no CI.
