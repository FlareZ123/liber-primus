# Signed-index same-page state rule: p33 WILL local inverse and failed BE transfer

**Agent33, 19 November 2026. Classification: source-constrained local p33 `WILL` candidate with a clean DH/H key shell; negative for a reusable signed-index page decoder. No established unknown LP2 plaintext is claimed.**

## Frozen rule before opening p33

The p40 `PATHS` work already used a simple source reading:

```text
authenticated signed word index i
-> physical LP2 page i
-> complete page-local word with the same GP rune length and GP0
```

I froze that rule globally and applied it unchanged to every authenticated 2016 word index 0..42 before inspecting new inverse keys.

The only indices with any same-state receiver are:

```text
6  SEEKS   -> p6  offset128, one receiver
11 IS      -> p11 offset49,  one receiver
21 IS      -> p21 offset170, one receiver
33 WILL    -> p33 offset132, one receiver
34 BE      -> p34 offsets4 and249, two receivers
38 BEWARE  -> p38 offset57,  one receiver
40 PATHS   -> p40 offset71,  one receiver
```

The proposed warning corridor does not continue:

```text
p39 FALSE   -> no same-state receiver
p41 VERIFY  -> no same-state receiver
p42 OPENPGP -> no same-state receiver
```

## The rule itself is nonselective

The observed 43-page assignment has seven indices with any state match, six with exactly one match, and eight total matched words.

A deterministic 200,000-sample exact-source-state permutation control shuffles the complete 43-word `(length,GP0)` multiset across the fixed page indices:

```text
at least 7 pages with any match       109,461 / 200,000
at least 6 pages with a unique match  121,543 / 200,000
both thresholds                       104,174 / 200,000
at least 8 total matched words        101,230 / 200,000
```

So the index-to-page state coincidence is not identifying by itself. It must not be used as a general plaintext rule.

## P33 nevertheless exposes a compact local WILL inverse

Under the frozen rule, signed word33 is `WILL`:

```text
WILL = [7,10,20,20]
length4, GP0=57
```

P33 has exactly one complete word with that state:

```text
p33 offsets132..135
cipher = [3,15,17,22]
```

The deterministic subtraction key is:

```text
[3,15,17,22] - [7,10,20,20] mod29
= [25,5,26,2]
```

Using the already canonical four-rune H ordering

```text
H([x0,x1,x2,x3])
= [x0-x3, x1-x2, x1+x2, x0+x3]
```

gives

```text
H([25,5,26,2])
= [23,8,2,27]
= [p,A,K,-K]
```

with the independently authenticated DH state `(p,A,K)=(23,8,2)`.

This is a clean local compression discovered only after the source-assigned target and receiver were fixed. It does not by itself establish the shell as a creator-selected key grammar.

## Sealed no-tune successor: p34 BE

After seeing the p33 shell, I froze one natural successor before opening either p34 candidate.

The next signed word is index34 `BE=[17,18]`. The unchanged same-page state rule selects exactly two p34 receivers, offsets4 and249.

Shed the p33 shell circumference `[p,-K]`, retaining its inner pair `[A,K]=[8,2]`. Apply the same two-point H inverse:

```text
H^-1([A,K]) = [g,-e] = [5,26]
```

This fixes the p34 key without p34 ciphertext tuning.

Blind results:

```text
p34 offset4   cipher [12,23]
  subtract [5,26] -> [7,26]
  add      [5,26] -> [17,20]

p34 offset249 cipher [28,7]
  subtract [5,26] -> [23,10]
  add      [5,26] -> [4,4]

target BE = [17,18]
```

Both receivers miss in both signs. The transfer fails.

## Decision

Preserve p33 offsets132..135 -> `WILL` as a source-constrained local plaintext candidate because the target/page/receiver were fixed before the exact key was inspected and the resulting H shell is the compact DH packet `[p,A,K,-K]`.

Do not promote the index-to-page state rule to a general decoder: its exact source-state permutation calibration is ordinary, p41/p42 fail, and the sealed p34 `BE` continuation fails under the natural shell reduction.

Do not rescue the route with alternative p34 shell subsets, signs, phases, or target-specific serializers without a new first-party instruction.

## Reproduction

`sims/lp2_signed_index_page_state_will_sft.cjs`
