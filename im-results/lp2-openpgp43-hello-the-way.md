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

## Independent p0 red-title receiver convergence

The three palindromic three-rune numbered-diagonal objects all have first H field zero, so each returns to `HELLO=0` / project p0. Their endpoint fields are different:

```text
THEIR20   -> H [0,22,20] -> endpoint20
SEEK31    -> H [0,15,12] -> endpoint12
OPENPGP43 -> H [0,22,13] -> endpoint13
```

The original p0 image independently fixes its leading red title at exactly **13 runes**, split 8+5 and followed by the 13-dot marker. Among this complete three-object diagonal-palindrome class, only OPENPGP43 simultaneously returns to p0 and carries an endpoint value equal to that leading red-span length.

This receiver relation was recognized after the separate EMERGE/SURFACE p0 result existed, so it is independent structural convergence rather than a blind plaintext prediction. The earlier route selected p0 through `189 -> 192 -> 0`; value192 uniquely selected authenticated `EPIPHANY SEEKS`, whose GP rune lengths are 8+5 and therefore match the original p0 red title. The OPENPGP43 endpoint now selects that same physical 13-rune receiver without using the candidate letters or value192.

Consequently the p0 opening candidate has two materially different source routes selecting the same receiver: the p57/p50 radix-state exit and the final signed-word numbered diagonal. The reversible cipher for the 13 runes remains unknown.
## Cube continuation independently selects the candidate title phrase

The source-number cube operator was established independently from this endpoint:

```text
C(x)=x^3 mod29.
```

OPENPGP43's two nonzero H fields are themselves one directed cube edge:

```text
WAY13 -> THE22
C(13)=22.
```

Continue that already visible edge once:

```text
C(22)=5=EPIPHANY.
```

The original p0 red title is independently fixed at 13 runes split 8+5. Authenticated source word5 `EPIPHANY` has GP length8 and its immediate follower word6 `SEEKS` has GP length5. Across all adjacent authenticated source pairs, `EPIPHANY SEEKS` is the unique 8+5 pair.

Charge all four immediate cube continuations from the OPENPGP pair `[22,13]`: forward or inverse cube from either field. They land at source indices5,22,13,6, whose forward adjacent GP-length shapes are respectively 8+5, 2+4, 3+3, and 5+2. Only `C(22)=5` matches the untouched p0 title shape.

This gives OPENPGP43 an independent source-only route to the existing `EPIPHANY SEEKS` candidate letters without using value192, the title residual, or any p0 ciphertext value. The phrase predates this discovery, so preserve the result as independent route convergence rather than a blind plaintext probability.

See `im-results/lp2-openpgp43-cube-epiphany-title.md` and `sims/lp2_openpgp43_cube_epiphany_title_sft.cjs`.

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

Treat the page-level return and endpoint13 as a source-selected navigation clue to the original p0 13-rune red title, and retain the lexical phrase as strong endpoint evidence. This independently converges on the pre-existing `EPIPHANY SEEKS` opening candidate without supplying its missing reversible cipher. Do not treat `[0,22,13]` as a p0 start/length coordinate.

## Reproduction

`node sims/lp2_openpgp43_hello_the_way_sft.cjs`