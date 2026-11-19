# OPENPGP43 selects a unique p42 H packet reading HELLO THE WAY

**Agent16, 19 November 2026. Classification: source-selected structural/lexical endpoint; page-level return clue, with a failed literal coordinate consumer.**

## Independent selection

The established one-based numbered diagonal uses authenticated source zero-based index `n` as project page `n` and within-page zero-based word index `n`. The final authenticated alphabetic source word is:

```text
index 42 = OPENPGP
```

so it selects project p42 / physical page43 / canonical word43 before this word's values are interpreted.

The selected untouched word is:

```text
p42 word43
offsets203..205
[11,13,11].
```

## Fixed H readout

Use the already established outside-in odd-length H ordering:

```text
H3([x0,x1,x2]) = [x0-x2, x0+x2, x1] mod29.
```

Then:

```text
H3([11,13,11])
= [0,22,13].
```

Read those values in the authenticated zero-based 2016 word register:

```text
0  -> HELLO
22 -> THE
13 -> WAY

=> HELLO THE WAY
```

The same numeric shell is also `[F,p-1,b-K]` under the established DH state `(p,b,K)=(23,15,2)`.

## Manuscript-wide controls

Under the same canonical page-local parser there are **726** three-rune unknown-page words. Exactly **one** has H3 shell `[0,22,13]`: p42 word43 itself.

There are **32** palindromic three-rune words, because H3 first field zero is equivalent to `x0=x2`. If the two nonzero H fields are interpreted as authenticated source-word indices and required to spell a forward adjacent source bigram, six manuscript words qualify. The p42 result is one of those six.

The stronger selection comes from the numbered diagonal. Across all 43 source-numbered objects, only three are palindromic three-rune words:

```text
THEIR20  -> p19 [11,20,11] -> H [0,22,20]
SEEK31   -> p30 [22,12,22] -> H [0,15,12]
OPENPGP43-> p42 [11,13,11] -> H [0,22,13]
```

Only **OPENPGP43** has nonzero H fields whose source-word labels form an authenticated forward adjacent bigram: `22 THE -> 13 WAY` spells the signed-message bigram `THE WAY` by token identity. Thus within the preselected diagonal-palindrome class the result is unique.

The first H field `0=HELLO` independently returns the numbered route to project p0 at page level. This is consistent with the final signed instruction `VERIFY OPENPGP` producing a return-to-beginning clue, while `THE WAY` quotes the authenticated clause `LIBER PRIMUS IS THE WAY`.

## Rejected literal coordinate consumer

A stricter numerical reading `[page=0,start=22,length=13]` was checked before opening those segment values. It fails at layout level: p0 offsets22..34 cut across canonical words5–7 rather than selecting a whole-word receiver. No shifted origin or neighboring offset is admitted.

## Decision

Preserve:

```text
OPENPGP43
-> project p42 word43
-> fixed H3 [0,22,13]
-> HELLO THE WAY
-> page-level return HELLO=0
```

Treat the page-level return as a source-selected navigation clue and the lexical phrase as strong endpoint evidence. Do not treat `[0,22,13]` as a p0 start/length coordinate.

## Reproduction

`node sims/lp2_openpgp43_hello_the_way_sft.cjs`