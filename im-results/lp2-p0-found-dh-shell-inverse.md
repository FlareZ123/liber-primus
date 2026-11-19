# P0 117..121: exact FOUND inverse from the p28 DH23 Alice shell

**Agent3, 19 November 2026. Classification: strong local plaintext candidate with an exact reversible inverse and a receiver/target selected before this word's values were consumed. The key grammar was recognized after the target was known, so this is not yet established plaintext. Its value is that a compact source-state shell key survives broad finite controls and yields a new source-native continuation.**

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

## Prospective consequence after FOUND

Once FOUND is recovered, its source number had not been used to build the inverse:

```text
GP0(FOUND)=36
p50[36]=0s.
```

If digit zero is admitted literally, the next authenticated word **GOOD** contains zero `s` letters. Charge every authenticated adjacent pair with:

- literal digit-letter count, including zero;
- base60 and base59;
- zero- and one-origin numeric readings;
- p0 word start and word end;
- selected p0 word length equal to the next authenticated word's GP length.

The complete family has only four hits:

```text
YOU   -> WILL : 2L, base60/zero, p0 word32 start141
FOUND -> GOOD : 0s, base59/one,  p0 word10 end52
GOOD  -> LUCK : 0d, base60/zero, p0 word7  start39
GOOD  -> LUCK : 0d, base59/zero, p0 word7  start39
```

Thus recovering FOUND predicts a new local receiver for the next signed word:

```text
p0 word10, offsets49..52, length4.
```

This is only a navigation prediction. Zero-count clues are intrinsically much weaker than the positive `2L` WILL clue, and no value-changing GOOD inverse is claimed here.

## Scientific boundary

What is now reproducible:

- the p0 117..121 receiver and FOUND label are selected upstream by the authenticated WILL -> BE -> FOUND chain before the receiver values are consumed;
- a compact Alice-side shell key built solely from the independently reconstructed p28 DH state recovers FOUND exactly;
- the inverse re-encrypts the original ciphertext;
- FOUND under the frozen H shell reads `[a,p,p,K*a,a-g]`;
- a 300-member role/permutation family has one signed-target hit on the selected ciphertext;
- the same full family has one signed-target hit among all 318 complete unknown-page five-rune words;
- the exact family covers 2,100/29^5 possible ciphertexts, and the selected ciphertext has multiplicity one;
- recovered FOUND gives the untouched source-number consequence `36 -> 0s -> GOOD`, selecting p0 word10's end under the charged local family.

What remains unresolved:

- the exact shell-key assembly was recognized after the target FOUND was known;
- no first-party instruction yet says to use `[K*a,g-a,K*g,a-g,A]`;
- p0 word10 is not decrypted to GOOD;
- this result does not reinstate a global p50 numeral-to-LP2-offset rule.

The next useful test is an independently selected consequence of the Alice shell grammar, or a source-visible clue that fixes its shell assembly before another plaintext target is opened.

## Reproduction

Run:

```text
node sims/lp2_p0_found_dh_shell_inverse_sft.cjs
```

The SFT reparses the canonical manuscript and authenticated 2016 carrier, reconstructs the p28 literal-DH state, selects the p0 FOUND receiver through the K=2 WILL -> BE walk, recovers FOUND, checks exact re-encryption, exhausts the 300-member role/permutation family over all318 five-rune words, computes the exact GP29 coverage, and verifies the prospective FOUND -> GOOD compound receiver.
