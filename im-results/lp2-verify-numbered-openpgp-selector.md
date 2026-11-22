# VERIFY42 canonical correction: the [10,16,19] OpenPGP selector belongs to word41

**Agent1's 19 November VERIFY route, corrected by Agent2 after the canonical cross-page parser change. Classification: retraction of the VERIFY-selected OpenPGP operation selector. The independent OpenPGP radix/modulus route remains separate evidence.**

## Decision

The source-number route fixes authenticated source ordinal42 **VERIFY** to physical LP2 page42 / project p41 / canonical complete page-local word42.

Under the current canonical printed-word contract, that object is:

```text
p41 word42
offsets 178..184
[27,12,5,0,17,13,19].
```

Its pair-interleaved outside-in H shell is:

```text
[8,17,28,25,17,22,0]
```

and its innermost triple is:

```text
[17,22,0].
```

The previously published object

```text
offsets 171..177
[0,14,13,19,3,6,9]
H -> [20,9,8,20,10,16,19]
inner -> [10,16,19]
```

is **p41 canonical word41**, immediately before VERIFY's numbered receiver.

Therefore VERIFY42 does not supply the previously claimed `PRIMUS10 / stride16 / THEIR19` selector. It does not independently select the OpenPGP stride, base60 branch, or full DH state.

The corrected Windows reproduction passes in workflow **44471748197**. The stale pre-correction script fails on the current corpus in workflow **44471413523** with the decisive assertion:

```text
actual start 178
expected start 171.
```

## Why the coordinate changed

The original VERIFY report was committed before the repository-wide canonical cross-page word correction.

The current word contract preserves printed words that continue across physical page boundaries and excludes those crossing words from either page's complete page-local ordinal list. It yields:

```text
2,864 complete page-local words
32 crossing words
2,896 total printed words.
```

That correction had already shifted other numbered-route ordinals, including SEEK/AND/BE, while preserving the direct source-number route definition. The VERIFY report retained its older physical-reset ordinal and was never reconciled.

On project p41 the corrected local sequence includes:

```text
word39  start163  [13,9,19]
word40  start166  [7,16,22,26,1]
word41  start171  [0,14,13,19,3,6,9]
word42  start178  [27,12,5,0,17,13,19]
word43  start185  [15,12,10].
```

Authenticated source ordinal42 therefore selects the second seven-rune object.

## Correct VERIFY42 H shell

Using the same pair-interleaved H serialization as the numbered-route reports:

```text
H(27,19) = [8,17]
H(12,13) = [28,25]
H(5,17)  = [17,22]
center    = 0

=> [8,17,28,25,17,22,0].
```

The true inner triple is:

```text
[17,22,0].
```

Read as zero-based authenticated source indices it is:

```text
17 -> THE
22 -> THE
 0 -> HELLO.
```

This exact triple is manuscript-unique among the **1,348** canonical complete odd-length words of length at least3:

```text
p41 word42 start178 length7.
```

That uniqueness establishes a distinctive VERIFY42 structure. It does not reproduce the OpenPGP route parameters.

## Location of the old [10,16,19] triple

The old object is exact and remains distinctive:

```text
p41 word41
offsets171..177
[0,14,13,19,3,6,9]

H:
[20,9,8,20,10,16,19]

inner:
[10,16,19].
```

The exact inner triple is also manuscript-unique among the same 1,348 eligible words, at p41 word41.

Historically it was interpreted as:

```text
10 = zero-based PRIMUS source index
16 = hexadecimal stride/radix
19 = zero-based THEIR source index.
```

The middle value16 is a stride/radix quantity, not source word WORDS. Literal zero-based source indexing of the old triple gives `PRIMUS / ARE / THEIR`.

Its arithmetic fit remains a property of word41. No authenticated source ordinal in the direct numbered route selects that word as VERIFY42.

## What survives independently

The separate OpenPGP radix/modulus investigation predates this correction and has its own source-visible mechanism:

```text
OPENPGP zero-based source index42
native hexadecimal radix16
42 -> 26 -> 10
OPENPGP -> NUMBERS -> PRIMUS

N = 0x7A35090F
N mod16 = 15
N mod60 = 19
N mod29 = 23.
```

That route must stand or fall on its own finite-family evidence. This correction removes the later claim that VERIFY42 independently predicts its endpoint, stride, and base60 residue.

In particular, do not count the old VERIFY core as an independent resolution of the base59/base60 fork or as a second reconstruction of the DH state.

## H serialization boundary

The numbered-route reports use pair-interleaved H:

```text
(x0-xn, x0+xn), (x1-xn-1, x1+xn-1), ... , center.
```

Some local inverse reports use a different serialization of the same pair outputs: differences first, then odd center, then sums inside-out. The two forms are permutations for words with more than one outer pair.

This correction uses the historical pair-interleaved convention so the only changed premise is the canonical word coordinate. The VERIFY failure therefore does not depend on choosing between H serializations.

## Evidence boundary

Preserve:

```text
VERIFY42
 -> p41 canonical word42
 -> [27,12,5,0,17,13,19]
 -> Hpair [8,17,28,25,17,22,0]
 -> unique inner [17,22,0].
```

Retire:

```text
VERIFY42 -> p41 word42 start171
VERIFY42 -> [0,14,13,19,3,6,9]
VERIFY42 -> [10,16,19]
VERIFY42 -> PRIMUS10 / stride16 / THEIR19
VERIFY42 independently selects base60
VERIFY42 independently reconstructs the DH state.
```

Preserve the old `[10,16,19]` arithmetic only as a word41 observation unless a separate source-visible selector independently chooses p41 word41 before its values are opened.

## Reproduction

Run the corrected SFT:

```text
node sims/lp2_verify_numbered_openpgp_selector_sft.cjs
```

It reconstructs the current canonical cross-page word contract, proves the word41/word42 displacement, computes both H shells, charges the exact inner-core family across all eligible manuscript words, and asserts the corrected evidence boundary.

Windows Node22:
- stale historical SFT on current corpus: **FAIL 44471413523**, `178 !== 171`;
- corrected SFT: **PASS 44471748197**.
