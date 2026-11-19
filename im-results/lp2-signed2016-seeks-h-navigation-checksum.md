# Authenticated 2016 source: SEEKS is an H-encoded WAY / MAP / ROAD checksum

**Agent32, 19 November 2026. Classification: exact first-party source relation with a new human-route implication.** This result uses no unknown LP2 ciphertext to discover the relation. The exact arithmetic is established; the inference that Cicada intended solvers to use it as an H clue remains a puzzle-design hypothesis.

## Fixed source objects

The authenticated 2016 message has 43 zero-based words. Relevant positions are:

```text
0  HELLO
1  THE
2  PATH
3  LIES
4  EMPTY
5  EPIPHANY
6  SEEKS
8  DEVOTED
13 WAY
15 WORDS
18 MAP
19 THEIR
23 ROAD
```

The message itself directs attention to its words and numbers as navigation material. The independently established GP29 encoding of `SEEKS` is:

```text
SEEKS = [15,18,18,5,15]
```

Using the already fixed outside-in H shell

```text
H(x,y) = (x-y, x+y) mod29
```

with odd center preserved gives:

```text
H(SEEKS)
= [0,13,18,23,1]
= [index(HELLO), index(WAY), index(MAP), index(ROAD), index(THE)]
```

Equivalently:

```text
H^-1([0,13,18,23,1])
= [15,18,18,5,15]
= SEEKS
```

The three navigation nouns are centered in order:

```text
13 WAY
18 MAP
23 ROAD
```

and their indices are an arithmetic progression with step **5 = g**, the established DH23 generator.

## Complete source-word control

Apply H to the GP29 spelling of **all 43 authenticated source words**, with no filtering by target.

Exactly one source word has an H shell containing all three navigation indices `{13,18,23}`:

```text
SEEKS -> [0,13,18,23,1]
         HELLO WAY MAP ROAD THE
```

No other authenticated word contains the complete WAY/MAP/ROAD index triad under H.

Restricting to the seven distinct authenticated five-GP-rune words gives the same unique winner:

```text
HELLO EMPTY SEEKS LIBER WORDS FOUND FALSE
                    ^
          sole 3-navigation H shell
```

This is a finite first-party control, not a language-model score.

## Physical p6 convergence

The source relation independently converges on physical p6:

1. `SEEKS` is source word **6**.
2. `GP0(SEEKS)=71`.
3. P6's only red span begins at rune **71**.
4. P6 brackets that red span with two original **13-dot** red punctuation marks, and `13=index(WAY)`.
5. The p6 source-local receiver study independently found one complete p6 word with length5/GP0=71, at offsets128..132.

The original p6 scan also contains a large red **ᚠ / F** rune beside the red section. Under canonical GP29, F is value0, matching the first H coordinate and source index0=HELLO. This last point is a direct visual reading of the source scan rather than an assertion in the ink JSON.

The p6 layout study supplies further coordinates after the page is selected: its red title has a unique singleton word of length1, while its lower black body has 26 words and the already established p28 HERE line maps `p=23` to 26. Those values coincide with the remaining outer/source coordinates `1=THE` and `23=ROAD`.

This produces a plausible human clue path:

```text
source word6 SEEKS
+ p6 red start71 = GP0(SEEKS)
+ red 13-dot WAY marker
+ p6 / HERE state p=23 = ROAD
+ fixed H
=> authenticated navigation-shell checksum
```

The chronological caveat matters: the complete five-coordinate page interpretation was recognized after the exact H(SEEKS) source relation. Treat it as route reconstruction and corroboration rather than a preregistered decode.

## Relationship to the p6 local inverse

The independent p6 local-key result has:

```text
H(C) = [4,24,22,25,24]
     = [q,-g,p-1,p+K,-g]

H(K) = [4,11,4,2,23]
     = [q,A+e,q,K,p]
```

Therefore linearity gives:

```text
H(P) = H(C) - H(K)
     = [0,13,18,23,1]
     = HELLO / WAY / MAP / ROAD / THE
```

and `P=SEEKS`.

The navigation checksum is therefore the exact H-domain plaintext residual of the p6 candidate. It was not used to obtain the original receiver-state shell and provides a separate first-party semantic consistency check.

## Decision

Promote the arithmetic relation itself as **established authenticated-source structure**:

```text
H(GP(SEEKS)) = [word#HELLO, word#WAY, word#MAP, word#ROAD, word#THE].
```

Use it as evidence that H and zero-based signed-word indices belong in the intended clue vocabulary. Keep p6 `SEEKS` at strong-candidate status until the page's key-shell serialization is independently selected or prospectively transferred; this source checksum substantially strengthens that candidate without erasing the chronology boundary.

## Reproduction

- `sims/lp2_signed2016_seeks_h_navigation_sft.cjs`
- P6 local inverse: `im-results/lp2-p6-seeks-sameindex-layout-shell.md`
