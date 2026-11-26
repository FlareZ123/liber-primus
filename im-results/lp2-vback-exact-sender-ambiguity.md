# Exact V-BACK inverse: stochastic rejection is not self-decoding (#2886)

**Decision:** the literal Dukotah C9 backstep sender with 0 < supp < 1 is not injective, even when the periodic key and its starting phase are given. For the authentic historical WELCOME offset vector used as a fixed experimental periodic key, the complete original terminal p54–55 section admits exactly **6,241 distinct plaintext tapes**. A fixed final pointer does not generally remove the ambiguity. Exhaustive native-register ranking of those tapes yields no readable candidate. No new plaintext, authentic LP2 key or source-selected randomness channel. This is an identifiability result and a scoped fixed-key negative; it is not a rejection of every V-BACK key, statistical decoding, or nonmonotone clock.

## Published operation and exact relation

Reference: [Dukotah C9 sender](https://github.com/Dukotah/cicada3301/blob/master/challenges/c9_rejection_loops.py), blob `93b0a419f318c4ecfb1c7681cae0d3c8e351f337`; [Round 47 synthesis](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round47/SYNTHESIS.md). For plaintext p, next absolute key pointer j, preceding ciphertext a, the sender tries p+K[j] modulo 29. If this equals a and j>0, a Bernoulli(supp) decision may decrement j and retry. It eventually emits c and increments the pointer. This is the actual sender, without an added F-hold, null or forward skip. The first rune never rejects.

For arbitrary fixed K, exactly r backward decisions (0<=r<=j) are possible iff, with u=j-r and p=c-K[u] mod29, all K[v] for u<v<=j satisfy p+K[v]=a mod29. The accepted attempt at u has nonzero probability when 0<supp<1; if c=a and u>0 it needs a final non-rejection, otherwise acceptance is forced. Next pointer u+1. Each run terminates after at most j decrements. Its conditional coin probability is supp^r times (1-supp) if that final attempt is rejectable, otherwise supp^r. This handles actual ciphertext repeats, and admits the no-backstep path for **every** ciphertext and **every** key. Thus ciphertext-only reachability cannot reject any key (this is not a statement about likelihood). At supp=1 the acceptance condition changes: an emitted repeat requires u=0; at supp=0 the no-backstep path is the only path.

Freeze the historically verified WELCOME key offsets [23,10,1,10,9,10,16,26] from [native key report](lp2-native-key-postshuffle-phase-graph.md), extend periodically, start at j=0. All cyclic neighbors differ, so at most one decrement can occur on an emitted rune. For t>0 the exact graph has:
- Normal: p=c-K[j], next j+1, always permitted.
- Back: if j>0 and c-a=K[j-1]-K[j], p=c-K[j-1], next j.
All arithmetic is mod29. These two edges have different plaintext labels whenever both exist. Therefore different path histories have different plaintexts (at the first divergence), and forward dynamic-program counts are exact counts of distinct tapes, without beam pruning. For this key and supp=1 all repeats after the first rune are impossible, because j>=1 and a decrement changes the output. The actual p54 pair at local offsets 19,20 (21,21) contradicts that deterministic special case, but **does not** contradict the published stochastic sender.

## Controls

[Exact SFT](../sims/lp2_vback_exact_ambiguity_sft.cjs), commit `10bdd239fb5cb0e8e88f0cd5563969e2541f0975`. The genuine p56 prime-minus-one/literal-F control reproduces 85/85 ciphertext runes with 84 consuming primes. It is a separate historical positive, not an added rule in V-BACK. Enumerate every 29^2 plaintext under two distinct-neighbor two-symbol keys and both possible coin policies; all 1,682 ciphertext/key bucket counts agree with exact DP.

Twelve deterministic target-excluded p56/p57 donor-window plants (seed 0x76b2886, supp .81, rotated WELCOME keys, lengths 80–93) expose 6–87 distinct tapes even with the correct key. True plaintext path retained 12/12. An oracle giving the actual final pointer still leaves 2–14 tapes in 11/12 plants; the one zero-backstep plant has a unique endpoint-conditioned path. All eight rotations remain reachable for all 12 ciphertexts, so this exact constraint cannot recover a hidden rotation by itself. Supplying the entire known plaintext as a diagnostic crib selects the correct rotation 12/12. The experiment is internally blind to truth during enumeration but is not an independently externally sealed recovery benchmark. There is no claim of unique unknown-key or known-key plaintext recovery.

## Complete original test

Canonical p54 (232) + p55 (76) is the final 308-rune section, including red heading and the 11-rune cross-page word. The selected key is a historical calibration, not an authenticated LP2 key. Exact total: 6,241 tapes, 254 of 308 positions admit more than one rune. Endpoints and counts:

| Final absolute pointer | Tapes |
|---:|---:|
|295|896|
|296|672|
|297|224|
|298|1216|
|299|552|
|300|308|
|301|488|
|302|292|
|303|836|
|304|511|
|305|157|
|306|74|
|307|14|
|308|1|

At local offset54 the preceding ciphertext is 5 and current ciphertext 28; j=54, K[j]=16, K[j-1]=10. Normal plaintext 12 and backstep plaintext 18 both emit 28, the latter rejecting 18+16=5 first. Constructive complete witnesses (always accept, or reject only at t=54) re-encrypt every original rune and differ in 254 plaintext positions. There are also two distinct complete one-backstep witnesses at t=265 and 275 with the **same** final pointer 307, differing at ten plaintext positions. The full set would require a worst-case 13-bit distinguishing index absent any plaintext/key constraint (ceil(log2 6241)); even at endpoint307, 14 alternatives remain. The physical p55-alone reset variant admits 13 distinct tapes with 73 ambiguous positions, but is not the selected complete-section test.

[Complete candidate-ranking SFT](../sims/lp2_vback_exact_original_rank_sft.cjs), commit `bccedc61d14388bccabe14c3965ddaae3aaed9ce`. Enumerate all 6,241 original tapes and score every one using add-.5 GP29 trigram log likelihood trained on 2,836 runes of the repository's normalized LP1 plaintext reference (excluding p56/p57), with the explicit GP orthography mapping in the script. The 66 printed groups use the corrected p54/p55 carry and exact tape identity; lexical diagnostic is merely the 243 distinct training word forms, not a complete English dictionary. Results:

| Tape | Nats/rune |
|---|---:|
| Best original candidate | -3.421584 |
| Runner-up | -3.423099 |
| Uniform reference | -3.367296 |
| Genuine held-out p56 | -2.763359 |
| Genuine held-out p57 | -2.665779 |

The best original candidate has seven backsteps, zero exact training-vocabulary groups, and full replay. Maximum across all candidates is one known group of 66. It begins `U NLPENGIAPAE BOEOEOLLIAAE GDJ EONGJINGIA NA TONNN NNX NOE FIN`; this is not credible prose. The small reference corpus and heuristic score are not a formal all-language exclusion. The exact enumeration is independent of that scoring choice. Both SFT cores were executed in the connected V8 runtime with repository inputs; standalone Node wrappers were not separately run.

## Consequence

Close #2886 on the non-injectivity / missing-selector fork. The stochastic sender can explain suppressed doublets but does not supply a uniquely decodable mechanism merely by exposing a backstep edge. Preserve external team's distinct statistical-beam project: it can potentially resolve ambiguity using independent language or key evidence; this report does not refute its 32/40 development result. A proposed LP2 continuation needs an authentic key/coin-state selector or a discriminating original plaintext prediction. Do not expand this fixed historical key to arbitrary rotations, rescue loops or sidecars as a new original search without independent evidence.
