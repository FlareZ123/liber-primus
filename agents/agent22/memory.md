# Agent22 memory

Run: `agent22-gpt5.6sol-20261119T014722Z-draw7-d76b962f1779`
Claimed: `2026-11-19T01:47:22.302757Z`

## Strongest current conclusions

### 1. Signed OpenPGP key ID independently reconstructs the p28 DH/GCD state

Authenticated 2016 source explicitly contains `Verify OpenPGP 7A35090F`.

Hex nibbles:
```text
[7,10,3,5,0,9,0,15]
```

Raw state serialization:
```text
[g+K, K*g, e, g, F, b-a, F, b]
```

Outside-in H shell:
```text
[21,22,10,10,23,12,5,5]
=
[p-K,p-1,K*g,K*g,p,K*a,g,g]
```

This reconstructs:
```text
p=23,g=5,K=2,a=6,b=15,e=3
A=g^a mod p=8
B=g^b mod p=19
```

The structural orientation test charges all 16 cyclic/reversed presentations of the printed nibbles and only the printed unrotated orientation survives the combined H/raw-state constraints. This is retrospective template recognition, but it is an overdetermined authenticated-source cross-check independent of p28 ciphertext values.

The independently selected p50 dual-radix source triad PRIMUS, NUMBERS, OPENPGP occurs at signed-word indices 10,26,42, exactly 16 apart. Raw base60 outputs reduce mod29 to `[A,B,e]=[8,19,3]`; raw base59 outputs reduce to `[a,H(K,b)[0],F]=[6,16,0]`. This independently cross-checks the key-ID state and `b*e mod22=1`.

Files:
- `sims/lp2_openpgp_keyid_dh_state_reconstruction_sft.cjs`
- `im-results/lp2-openpgp-keyid-dh-state-reconstruction.md`
- `.github/workflows/agent22-openpgp-keyid-dh-state.yml`

### 2. NUMBERS gives a source-only direction opcode and deterministic AND recovery

Authenticated signed phrase includes `... ROAD, AND THEIR NUMBERS ARE THE DIRECTION.`

`GP0(NUMBERS)=83 -> p50[83]=3D`.
Base59/base60 with one-based p0 receiver semantics land adjacent starts189/192 with lengths3/4, exactly the GP lengths of the two immediately preceding authenticated source words AND/THEIR.

Complete source-family charge:
- only PRIMUS, NUMBERS, OPENPGP produce any adjacent dual-radix p0 word-start pair;
- only NUMBERS matches its two preceding source-word GP lengths.

Immediately preceding p0 word41 at183..188:
```text
cipher [0,20,7,12,16,25]
H shell [4,25,4,7,24,19]
      = [K^2,p+K,K^2,g+K,p+1,B]
sum = 83 = GP0(NUMBERS)
```
Exact ordered shell unique among all 252 complete unknown six-rune words. Among the complete three-case adjacent-dual-radix source family, only NUMBERS has predecessor-shell-sum = source GP0.

Token `3D` is uniquely `(e,p)` among authenticated source-address tokens: high digit3=e and GP(D)=23=p.

AND receiver p0 189..191 cipher `[0,6,9]`:
- token gives `H(p,e)=[p-e,p+e]`;
- predecessor shell ends in B;
- odd key shell `[B,p-e,p+e]`;
- inverse H gives exact key `[g,p+e,b]=[5,26,15]`;
- decrypts exactly to canonical AND.
A complete 84-key family `[x,H(p,e)[j],y]`, distinct x/y in `{g,a,b,A,B,K,e}`, has exactly one authenticated three-rune hit, same AND.

THEIR receiver p0 192..195 cipher `[19,12,20,9]`:
complete 98-key family `[H(p,x)[j],p,K*y,y]` has exactly one authenticated four-rune hit:
```text
THEIR key [p-a,p,K*g,g] = [17,23,10,5]
```
Competing PATHS inverse at the same receiver remains live. Treat THEIR as strong candidate under NUMBERS-token mechanism, not settled plaintext.

ROAD zero-bracket geometry independently selects seven-rune p0 228..234. Raw H shell:
```text
[b-a,K*a,A+e,B,H(A,B)[0],g,a-g]
```
Exact unique among all 214 unknown seven-rune words. Shell sum75=GP0(READOUT), and p50[75]=2v base60=177, exact center of independently fixed whole READOUT 166..188. Existing B-boundary join and A/K selector return to THE ROAD.

NUMBERS plaintext candidate key:
```text
[16,14,7,13,19,0,1]
H shell =
[b,H(K,b)[1],A+a,A+a,H(K,b)[1],p+e,p-K*g]
```
Among authenticated seven-rune targets DEVOTED/NUMBERS/OPENPGP only NUMBERS passes the charged mirrored-core + state-expression criterion. Criterion was recognized after target, so candidate-level.

Files:
- `sims/lp2_road_numbers_readout_state_bridge_sft.cjs`
- `im-results/lp2-road-numbers-readout-state-bridge.md`
- `.github/workflows/agent22-road-numbers-readout-state.yml`

### 3. PRIMUS selects a unique H-state pair and generic IS recovery

`GP0(PRIMUS)=62 -> p50[62]=24`.
Base59/base60 zero-based outputs land adjacent p0 starts122/124.

p0 word27 shell:
```text
[18,15] = [H(A,B)[0],b]
```
p0 word28 shell:
```text
[27,25,21] = [H(A,B)[1],p+K,p-K]
```

Exact ordered state-packet pair unique among all 123 adjacent complete 2->3 unknown word pairs. It reconstructs A,B,p,K,b,e.

Generic cross-receiver rule charged across all 123 pairs:
- shell right three-rune word;
- key for left two-rune word = reversed outer shell coordinates;
- score only authenticated two-GP source targets THE/IS/BE.
Exactly one hit: p0 122..123 -> IS with key `[21,27]`.

Adjacent p0 124..126 decrypts to WAY with compact state key `[B,p+e,K]=[19,26,2]`; fixed key applied to all 726 complete unknown three-rune words has one authenticated hit, WAY. Local key order was target-aware, but WAY itself was independently reconstructed earlier by p29/2013 work and later closed into historical 133/331.

Files:
- `sims/lp2_primus_is_way_state_pair_sft.cjs`
- `im-results/lp2-primus-is-way-state-pair.md`
- `.github/workflows/agent22-primus-is-way-state-pair.yml`

### 4. FOUND -> GOOD -> LUCK shell compression

FOUND shell `[6,23,23,12,1]`. Four natural center-drop/junction-H variants per authenticated five-rune source, seven sources =28 configurations. Exactly one authenticated 5->4 hit: FOUND -> GOOD using reverse endpoints and H-difference junction. Nine solved native 5->4 controls: zero.

GOOD shell `[12,0,0,6]`; LUCK shell `[15,25,25,6]`; delta `[3,25,25,0]=[e,p+K,p+K,0]`. In 225 charged `[x,y,y,0]` updates from 15 frozen scalars, only LUCK is an authenticated target from GOOD. Eighteen solved adjacent 4-rune controls miss the shape. Direct-key recurrence was decisively rejected.

Files:
- `sims/lp2_good_luck_gcd_shell_transition_sft.cjs`
- `im-results/lp2-p0-found-good-luck-hshell-compression.md`

### 5. THEIR -> WILL -> FOUND and LUCK/PATHS -> ROAD local state graph

Authenticated source THEIR:
`GP0(THEIR)=34 -> p50[34]=3H`.
Among four radix/origin modes only base60/one lands p0 word start196. Raw five-rune shell is unique exact `[p,B,b,p,F]`; sum80. Same mode:
`p50[80]=2M -> start141` = WILL receiver.
Recovered WILL:
`GP0(WILL)=57 -> p50[57]=1w -> start117` = FOUND receiver.
Same numeric rule stops at FOUND and cannot manufacture GOOD.

Two-stage source/mode charge gives nine survivors; only source identity THEIR reaches WILL.

LUCK:
`GP0(LUCK)=31 -> p50[31]=2D`; only base59/zero lands start131, independently preferred PATHS receiver. Raw PATHS-receiver shell `[H(K,b)[0],a-g,p-1,a]`, exact unique among 514 four-rune words; sum45; same mode p50[45] -> start105 ROAD receiver. Only LUCK reaches ROAD in complete two-stage family.

GOOD:
`GP0(GOOD)=35 -> p50[35]=0d -> base59/zero start39`, independently recovered LUCK receiver. Raw shell-sum graph over every p0 word and all four modes has no self-loops and exactly one mutual two-cycle, p0 words7<->9 under base59/zero, with return shell sum35=GP0(GOOD).

Files:
- `sims/lp2_their_state80_will_found_bridge_sft.cjs`
- `im-results/lp2-their-state80-will-found-bridge.md`

## Repository synthesis / communications updated

- `results/README.md` updated with NUMBERS direction/AND, PRIMUS/IS, and independent OpenPGP full-state reconstruction.
- broadcasts:
  - NUMBERS/PRIMUS state architecture
  - OpenPGP full-state reconstruction

## Evidence boundaries

- OpenPGP state templates are dense and overdetermined, but were recognized after the p28 state was already known. Treat as powerful independent authenticated-source corroboration, not a blind discovery statistic.
- AND now has the cleanest source-selected key construction in this run.
- THEIR has a much tighter bounded family but still competes with PATHS at the same receiver.
- NUMBERS receiver is strongly corroborated but its mirrored key-shell criterion remains retrospective.
- IS has a generic charged-family cross-receiver rule; WAY target is independently fixed but local key order remains retrospective.
- H-shell reductions/sums discovered after raw receivers were opened are mechanism compression unless separately source-selected.

## High-value next actions

1. Use the OpenPGP-key-ID reconstructed state to derive **predeclared** key-order rules for THEIR/WAY/NUMBERS before opening another target.
2. Audit whether the 16-word-spaced PRIMUS/NUMBERS/OPENPGP source triad was intentionally visible in historical formatting or gives another source-native operation.
3. Try to turn the NUMBERS seven-rune candidate key shell into a source-selected construction using the now independent OpenPGP state packet.
4. Preserve the competing PATHS model at p0 192..195 until an independent discriminating prediction resolves it.
5. Reuse the exact finite families and Windows SFTs rather than repeating unconstrained state-expression searches.
