# P0 source chain: exact FOUND -> GOOD -> LUCK -> PATHS inverses from p28 DH/HERE state

**Agent3, 19 November 2026. Classification: strong local plaintext/navigation chain with exact reversible inverses for FOUND, GOOD, LUCK, and PATHS. The navigation is increasingly source-constrained and now includes ciphertext-number return checks, while the exact key grammars remain post-label discoveries. Treat these as strong candidates rather than established plaintext until a key transition is fixed prospectively.**

## Result

The independently reconstructed p28 literal-DH line gives

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2.
```

Agent13's upstream WILL -> BE -> FOUND route selects p0 word26, offsets **117..121**, before its five ciphertext values are consumed:

```text
WILL GP0=57
K=2 base60 p50 hops: 57 -> 118 -> 35 = GP0(BE)
intermediate direction118 lies inside p0 117..121, length5
next authenticated word after BE is FOUND, also five GP runes.
```

The selected original ciphertext is

```text
[12,2,11,10,2].
```

Build the five-rune **Alice shell key** from the source DH state:

```text
outer shell: [K*a, A]       = [12,8]
inner shell: [g-a, a-g]     = [28,1]
center:      K*g            = 10

linear key = [K*a, g-a, K*g, a-g, A]
           = [12,28,10,1,8].
```

Subtracting modulo29 gives

```text
[12,2,11,10,2]
-
[12,28,10,1,8]
=
[0,3,1,9,23]
=
FOUND.
```

Re-adding the same key reconstructs the original ciphertext exactly.

The Bob-side role analogue is

```text
[K*b, g-b, K*g, b-g, B]
= [1,19,10,10,19]
```

and does not recover a signed five-rune word on the selected receiver.

## Why the shell form is source-connected

This formula is compact in the geometry already selected elsewhere in the manuscript.

The frozen reversible word-shell operation is

```text
H(x,y)=(x-y,x+y) mod29.
```

Under that shell, the recovered plaintext is itself a DH-state readout:

```text
FOUND = [F,O,U,N,D] = [0,3,1,9,23]

outer H(F,D) = [6,23] = [a,p]
inner H(O,N) = [23,12] = [p,K*a]
center U      = 1       = a-g
```

so

```text
H_shell(FOUND) = [a,p,p,K*a,a-g].
```

The second pair `[p,K*a]=[23,12]` is exactly the outer-H output of p28 line6 fragment4 `OMSN`, already present in the source-local DH reconstruction. The first pair `[a,p]` is the same typed DH pair independently encountered in the p0 THE work. The center is the visible one-step difference between line number `a=6` and fragment count `g=5`.

Equivalently, the key's shells are:

```text
outer [K*a,A]
inner [g-a,a-g]
center K*g.
```

This is substantially more constrained than an arbitrary five-symbol additive crib key. The remaining weakness is still real: the manuscript does not yet contain an independently authenticated instruction that says to assemble these exact DH quantities into this shell key.

## Broad role/permutation calibration

To avoid treating the exact order as automatically meaningful after seeing FOUND, charge a deliberately broader family:

- start with the Alice and Bob shell keys above;
- allow every unique permutation of each five-rune key;
- allow both additive signs;
- score against every distinct five-rune word in the authenticated 2016 carrier.

The seven target sequences are:

```text
HELLO EMPTY SEEKS LIBER WORDS FOUND FALSE
```

Because the Bob key has repeated values, the complete family has **300 distinct signed key configurations**.

On the selected p0 ciphertext there is exactly **1** family/target hit:

```text
Alice, original shell order, subtraction -> FOUND.
```

The exact finite GP29 coverage of that whole family is also easy to compute without Monte Carlo. Every family/target pair generates one ciphertext; after deduplication the family reaches **2,100** of the **29^5 = 20,511,149** possible five-rune ciphertexts:

```text
2100 / 20511149 = 0.00010238334283467006
```

The selected ciphertext has hit multiplicity exactly one.

This is a structural calibration of the admitted post-discovery family, not an authorship probability.

## Whole-manuscript signed-target control

There are **318** complete five-rune printed words across unsolved p0..p55, excluding rune-free p50.

Apply the same 300 family members to every one of them and score only against the same seven authenticated five-rune target sequences.

There is exactly **1** hit in the complete manuscript family:

```text
p0 word26, offsets117..121
Alice shell, subtraction
-> FOUND.
```

This also discriminates the separate p38 FOUND navigation candidate: that five-rune receiver does not hit any authenticated target under this family.

## Downstream recovery: FOUND -> GOOD

Once FOUND is recovered, its source number had not been used to construct the FOUND inverse:

```text
GP0(FOUND)=36
p50[36]=0s.
```

Charge every authenticated adjacent pair with literal digit-letter count **including zero**, both p50 radices, zero/one origin, p0 word start/end, and next-word GP length. The whole signed carrier has four compound hits:

```text
YOU   -> WILL : 2L, base60/zero, p0 word32 start141
FOUND -> GOOD : 0s, base59/one,  p0 word10 end52
GOOD  -> LUCK : 0d, base60/zero, p0 word7  start39
GOOD  -> LUCK : 0d, base59/zero, p0 word7  start39
```

The first new receiver is p0 word10, offsets **49..52**, cipher

```text
[24,21,26,14].
```

The frozen p28 state supplies:

```text
H(A,B) = [18,27]
DH-line[p] = line6 rune23 = 20

key = [H(A,B)[0], H(A,B)[0], p, DH-line[p]]
    = [18,18,23,20].
```

Subtracting gives

```text
[24,21,26,14] - [18,18,23,20]
= [6,3,3,23]
= GOOD.
```

Forward replay is exact. GOOD also has a compact frozen-H representation:

```text
H_shell(GOOD) = [12,0,0,6] = [K*a,0,0,a].
```

### GOOD family calibration

Charge both coordinates of `H(A,B)` independently in the first two key slots, every direct DH field in the third slot, every one-based DH-state lookup in either the HERE line or literal-DH line in the fourth slot, and both signs. The raw family has **784** configurations and exactly one authenticated four-rune target hit:

```text
[18,18,p,DH-line[p]], subtraction -> GOOD.
```

Then allow every permutation of the four source values. After deduplication there are **8,304** distinct signed keys. The selected ciphertext still has exactly one authenticated target hit, the same GOOD key.

Applied as a fixed key to all **514** complete four-rune words on unknown physical p0..p55, it hits the nine authenticated four-rune target sequences exactly once:

```text
p0 word10, offsets49..52 -> GOOD.
```

## Downstream recovery: GOOD -> LUCK

Recovered GOOD has

```text
GP0(GOOD)=35
p50[35]=0d.
```

Both conventional p50 radices give numeric value39, exactly the start of p0 word7, offsets **39..42**, length4. The next authenticated word is LUCK. Original cipher:

```text
[8,17,9,27].
```

The source-local key reuses the literal-DH pair, HERE geometry, and the B-indexed HERE-line rune already used in the independent YOU key:

```text
H(K,b) = [16,17]
reverse = [17,16]
|HERE| = 4
HERE-line[B=19] = 22

key = [17,16,4,22].
```

Subtracting gives

```text
[8,17,9,27] - [17,16,4,22]
= [20,1,5,5]
= LUCK.
```

Forward replay is exact. The plaintext shell is another compact state object:

```text
H_shell(LUCK)
= [15,25,25,6]
= [b,p+K,p+K,a].
```

### LUCK family calibration

Broaden the source grammar substantially:

- every ordered pair of distinct DH fields;
- fixed `H` or reversed `H` output order;
- each of eight p28/HERE/DH source scalars;
- every one-based DH-state lookup in either the HERE or DH line;
- both additive signs;
- all nine authenticated four-rune targets.

This is **18,816** raw configurations and **15,392** distinct signed keys after deduplication. On the prospectively selected receiver there is exactly one hit:

```text
H(K,b) reversed,
HERE output length,
HERE-line[B],
subtraction
-> LUCK.
```

The exact LUCK key also has one authenticated-target hit across all **514** complete unknown-page four-rune words, p0 word7 itself.

A still broader permutation audit admits a second algebraic alias for LUCK but no other authenticated target. The natural source order above is therefore key-selective only under the stated grammar, while the target remains stable under that broader charge.

## LUCK -> PATHS continuation

The LUCK plaintext number does produce a source-native continuation:

```text
GP0(LUCK)=31
p50[31]=2D
base60 = 133
base59 = 131
```

Position131 is exactly the start of p0 word30, offsets **131..134**, length4. Position133 lies inside that same word. In the authenticated carrier after LUCK, the remaining alphabetic words have GP lengths:

```text
BEWARE 6
FALSE  5
PATHS  4
VERIFY 6
OPENPGP 7
```

So PATHS is the first and only later four-rune target. This selector was recognized after the receiver values had already been observed in this invocation, so it is source-constrained but not a blind holdout.

The receiver is:

```text
[23,14,21,7].
```

A compact key follows the already frozen H geometry. The literal-DH source pairs A and B. Use the difference coordinate of H(A,B), K as the other outer-shell coordinate, and the repeated public value B as the inner pair:

```text
H(A,B)[0] = A-B = 18
outer key endpoints = H^-1(18,K) = H^-1(18,2) = [10,21]
inner key pair = [B,B] = [19,19]

key = [10,19,19,21].
```

Then

```text
[23,14,21,7] - [10,19,19,21]
= [13,24,2,15]
= PATHS.
```

Forward replay is exact.

The plaintext itself has an unusually compact shell tied to p28 and DH23:

```text
H_shell(PATHS)
= [27,28,22,26]
= [page28-1, page28, p-1, page28-K].
```

The key shell is also compact:

```text
H_shell(key)
= [18,2,0,9]
= [A-B,K,0,2B].
```

### PATHS family calibration

Charge the source shell grammar broadly:

- any ordered distinct DH field pair;
- either H coordinate from that pair as the first outer-shell coordinate;
- any DH field as the second outer-shell coordinate;
- any DH field repeated in the inner pair;
- both additive signs;
- all nine authenticated four-rune targets.

This produces **8,232** labeled configurations and **2,842** distinct numeric signed keys. The selected receiver has one numeric target hit: the key above, subtraction, yielding PATHS.

There are two labeled aliases for the same numeric key because the reconstructed state happens to satisfy

```text
p-g = A-B = 18.
```

The two source descriptions are therefore `H(p,g)[0]` and `H(A,B)[0]`; no second numeric key survives.

Applied unchanged to all **514** complete four-rune words on unknown physical p0..p55, the exact PATHS key produces one authenticated-target hit: p0 word30 -> PATHS.

### Ciphertext-number return checks

Two raw ciphertext numbers now point back to key/check sources without using the recovered plaintext.

For p0 GOOD:

```text
raw GP0([24,21,26,14]) = 85
p50[85] = 0S
base60 = base59 = 28.
```

Thus the selected GOOD ciphertext points directly to physical p28, the page supplying its key material. Among all complete four-rune p0 words, GOOD is the only word whose raw GP0 addresses a p50 token numerically equal to28.

For p0 PATHS:

```text
raw GP0([23,14,21,7]) = 65
p50[65] = 4F
base60 = 255
base59 = 251.
```

Position255 lies inside the already recovered p0 YOU receiver at254..256, whereas position251 lies inside the preceding nine-rune word. This supplies a post-discovery base60 closure back to YOU.

Together with the existing FOUND check

```text
raw GP0(FOUND receiver)=37
p50[37]=1K
base60=80
```

which returns to the READ OUT packet boundary, these support a dual-role hypothesis: plaintext numbers advance the signed-word route while raw ciphertext numbers can return to a source or previously recovered checkpoint. This is a stronger organizing hypothesis than a universal p50-offset rule and remains local until it predicts another unseen receiver.

### Authenticated-carrier DH crosslink

A separate source-only relation appears in the same authenticated tail. For zero-based signed-word index `i`, define

```text
delta(word) = i - GP0(word) mod29.
```

Then:

```text
YOU    -> 2  = K
WILL   -> 5  = g
LUCK   -> 6  = a
BEWARE -> 8  = A
PATHS  -> 15 = b
```

The full 43-word census contains other isolated state-valued deltas, so this is not a uniqueness proof. Its concentration in the recovered/tail vocabulary is a post-discovery crosslink worth preserving. It gives the signed carrier an independent DH-state geometry without using any LP2 ciphertext values.

## Scientific boundary

What is now reproducible:

- p0 117..121 and FOUND are selected upstream by the authenticated WILL -> BE -> FOUND chain before their values are consumed;
- the Alice shell key `[K*a,g-a,K*g,a-g,A]` recovers FOUND exactly with forward replay;
- FOUND under frozen H reads `[a,p,p,K*a,a-g]`;
- the 300-member FOUND family has one signed-target hit on the selected receiver and one across all 318 complete unknown-page five-rune words;
- recovered FOUND selects p0 GOOD through `36 -> 0s`, and the charged source family recovers GOOD exactly;
- GOOD's raw ciphertext number independently returns to physical p28, its key-source page;
- recovered GOOD selects p0 LUCK through `35 -> 0d`, and the charged source family recovers LUCK exactly;
- LUCK's `31 -> 2D` route selects a four-rune p0 receiver whose authenticated-tail length selects PATHS;
- the H-shell PATHS family has one numeric target hit among 2,842 distinct signed keys, and its exact key has one authenticated-target hit across all 514 unknown four-rune words;
- PATHS plaintext shell is `[27,28,22,26]=[page-1,page,p-1,page-K]`;
- PATHS raw ciphertext number closes by base60 onto the already recovered YOU receiver;
- the authenticated carrier independently gives state-valued index-minus-GP0 deltas at YOU, WILL, LUCK, BEWARE, and PATHS.

What remains unresolved:

- the FOUND, GOOD, LUCK, and PATHS key grammars were recognized after their plaintext labels were known or after their receiver values had been exposed;
- zero-count literal tokens are weak selectors in isolation;
- PATHS has two labeled source aliases for the same numeric key because `p-g=A-B`;
- no single first-party instruction yet states the complete key-assembly grammar across all recovered p0 words;
- the dual plaintext-number/ciphertext-number hypothesis is still a local synthesis and must make a fresh prediction before promotion.

The strongest next gate is now a prospective transition outside the already labeled FOUND/GOOD/LUCK/PATHS segment. A useful mechanism should predict the receiver, target class, and key construction before those ciphertext values are consumed.

## Reproduction

Run:

```text
node sims/lp2_p0_found_dh_shell_inverse_sft.cjs
```

The SFT reconstructs the p28 literal-DH/HERE state, reproduces FOUND, GOOD, LUCK, and PATHS with exact forward replay, exhausts their charged source families, verifies manuscript-wide fixed-key controls, checks the GOOD->p28 and PATHS->YOU ciphertext-number returns, and records the authenticated-carrier DH delta crosslink.
