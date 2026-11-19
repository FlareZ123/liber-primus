# P6 red-heading route yields a local SEEKS inverse

**Agent9, 19 November 2026. Classification: strong local plaintext candidate with an exact reversible inverse and a source-visible page/receiver route. The five-coordinate heading-feature serialization was recognized after the inverse, so this is not yet an authenticated reusable cipher mechanism.**

## Source selection

The authenticated 2016 message places `SEEKS` at zero-based word index 6. The independent signed-word DH reconstruction assigns that same source position as `a=6`, with the fixed state

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3, q=4
```

and canonical

```text
SEEKS = [15,18,18,5,15]
length = 5
GP0    = 71
```

Physical p6 is therefore a natural same-number receiver candidate before its local rune values are used.

## P6 independently exposes SEEKS=71

Original p6 has ten printed rune lines with counts

```text
20,24,24,3 | 18,19,20,24,22,22
```

The four-line upper black passage therefore contains exactly

```text
20+24+24+3 = 71 runes = GP0(SEEKS).
```

At offset71 the page prints a large red thirteen-dot mark and an 11-rune red heading. A second large red thirteen-dot mark is at offset82, immediately after the heading.

The red heading has four canonical words with lengths and GP0 sums

```text
lengths [4,1,4,2]
GP0    [71,19,65,26]
```

so its first red word independently repeats `GP0(SEEKS)=71`.

A manuscript control over every red span on same-index signed-source pages 0..42 finds exactly one span whose first red word GP0 equals the authenticated source word GP0 at that physical page index:

```text
p6 -> SEEKS -> 71
```

No other source-indexed red span has this property.

## Source-visible receiver

The red span ends at offset82. Use the already source-derived DH fields `K=2` and `p=23` as a forward distance:

```text
82 + K*p
= 82 + 2*23
= 128.
```

Offset128 is exactly the start of a complete five-rune p6 word:

```text
p6[128..132] = [14,10,22,15,10]
GP0          = 71
```

Thus the route selects the receiver without scanning p6 for a desired key:

```text
signed SEEKS at a=6
-> physical p6
-> upper passage length71
-> red heading starts at71
-> red heading ends at82
-> advance K*p=46
-> receiver128..132
```

## Exact inverse

The exact subtraction key required for SEEKS is

```text
cipher [14,10,22,15,10]
SEEKS  [15,18,18,5,15]

key = cipher - SEEKS mod29
    = [28,21,4,10,24].
```

The frozen outside-in H transform gives

```text
H(key) = [4,11,4,2,23].
```

Those five coordinates are all visible or independently source-derived:

```text
4  = red-heading word count
11 = red-heading rune count
4  = maximum red-heading word length
2  = number of bracketing large red markers
23 = p
```

So the compact local decoder is

```text
shell = [word_count, rune_count, max_word_length, marker_count, p]
      = [4,11,4,2,23]

key = H^-1(shell)
    = [28,21,4,10,24]

p6[128..132] - key mod29
= [15,18,18,5,15]
= SEEKS.
```

Forward replay is exact.

## Finite controls

### Local state-shell family

Charge every complete five-rune p6 word, all seven distinct authenticated five-rune targets, both additive directions, and the 729 shells

```text
[v,R,v,x,y]
```

where `R=11` and `v,x,y` independently range over the nine source-derived state fields `{p,g,a,b,A,B,K,e,q}`.

This is

```text
5 * 7 * 2 * 9^3 = 51,030
```

labeled configurations. Exactly one hits:

```text
start128 -> SEEKS
subtraction
shell [q,R,q,K,p]
     = [4,11,4,2,23].
```

### Exact-key manuscript control

Hold key `[28,21,4,10,24]` fixed across all 317 complete five-rune words on unknown p0-p55, the same seven authenticated targets, and both signs.

Exactly one hit remains:

```text
p6 start128 -> SEEKS under subtraction.
```

### Wider red-span/receiver family

Because the visible feature order was recognized after the inverse, charge substantially more freedom:

- every same-index source page with a five-rune authenticated target and a red span;
- all 120 permutations of the five features `word_count, span_length, max_word_length, marker_count, p`;
- every distinct product of two state values as a signed step after the red span, 41 distinct magnitudes;
- both additive directions.

After requiring the stepped location to be an actual complete five-rune word, 2,400 valid receiver trials remain.

The only decryption is still p6 start128 -> SEEKS, with step `K*p=46`, forward direction, subtraction, and shell `[4,11,4,2,23]`. Two raw permutation records are identical because p6 word count and maximum word length both equal4.

The preferred feature grammar gives no same-index five-rune transfer on the other red-span pages p0, p15, or p39.

## Adversarial boundary

Do not claim that the shell values alone identify start128.

If shell coordinates are allowed to be chosen in arbitrary order from a broader visible/state scalar pool, p6 start103 also admits a SEEKS subtraction fit with

```text
H(key) = [11,15,19,13,3].
```

Therefore the independently readable receiver formula

```text
red_end + K*p = 128
```

is essential evidence. The local result becomes weak if that receiver route is removed.

Likewise, the feature serialization itself was recognized after the SEEKS inverse was known. The p0/p15/p39 transfer negatives show that it is not yet a universal red-heading key schedule.

## Decision

Preserve

```text
p6 offsets128..132
cipher [14,10,22,15,10]
key    [28,21,4,10,24]
subtract
-> SEEKS [15,18,18,5,15]
```

as a **strong local SEEKS plaintext candidate**.

Its causal path is substantially better than a free crib fit:

```text
authenticated SEEKS index = a = 6
-> p6
-> 71-rune upper passage and red-heading start = GP0(SEEKS)
-> unique same-index first-red-word GP0 echo
-> red end82 + K*p = receiver128
-> visible heading feature shell
-> exact reversible SEEKS
```

The remaining weak link is chronology: the exact five-feature H-shell serialization was identified after the target inverse. Promotion to a reusable cipher mechanism requires an unchanged fresh transfer or an independent first-party clue that dictates that serialization before the receiver is opened.

## Reproduction

Run:

`node sims/lp2_p6_seeks_red_heading_local_inverse_sft.cjs`

Windows Node22 generic runner passed the original complete gate in Actions run **44458253259**. The SFT is subsequently strengthened with the unordered-shell rival assertion and should be rerun after that checkpoint.
