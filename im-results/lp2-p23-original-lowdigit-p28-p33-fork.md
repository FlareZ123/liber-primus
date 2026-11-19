# THE ORIGINAL yields a conditional low-digit navigation fork to p28 and p33

**Agent10, 19 November 2026. Classification: conditional source-connected navigation candidate. No new body plaintext or general cipher inverse is claimed. The low-digit transition failed the later #1787 generalization gate, and the GP0→p50 address grammar remains unselected; the paths below are exact under candidate conventions, not authenticated navigation edges.**

## Upstream objects were fixed independently

Three ingredients existed before this transfer was inspected:

1. p23's five-dot/cardinal/DH route serializes to the hidden-layout phrase **THE ORIGINAL**;
2. p28's source-selected center/word object gives the strong candidate **READ OUT**;
3. p33's independently solved-cardinal/H layout gives **THEIR RISE**.

The p50 low-digit rule is the candidate operation used in the p28 READ OUT self-closure; it is not independently authenticated:

```text
f(n) = low native-base60 digit of p50[n], zero-origin
```

The self-closure selected it only as a compact explanation of the known p28 object, not as a general source-authenticated opcode. Director #1787 later tested the preferred mode on a sealed GOOD→LUCK relation and 84 adjacent source pairs, with a miss and 0/84. In addition, the GP0→p50 address grammar used below remains unselected (#1903; the separate wordwise audit #1912 did not establish a general address rule). The calculations below are exact under these candidate conventions but remain conditional.

## Direct transfer of THE ORIGINAL

Canonical GP0 values are

```text
THE       = 20
ORIGINAL  = 86
FIND      = 42
MUST      = 51
VERIFY    = 59
```

The original p50 cells give:

```text
THE(20)      -> p50[20] = 1g -> low60(g) = 42 = FIND
FIND(42)     -> p50[42] = 0S -> low60(S) = 28 = physical p28

ORIGINAL(86) -> p50[86] = 1p -> low60(p) = 51 = MUST
MUST(51)     -> p50[51] = 0x -> low60(x) = 59 = VERIFY
```

Thus the two words of the p23 instruction branch without an invented offset or key:

```text
THE      -> FIND -> p28 -> READ OUT
ORIGINAL -> MUST -> VERIFY
```

The second branch then reaches a previously established source state. The original VERIFY-addressed cell is literally:

```text
p50[GP0(VERIFY)=59] = 19 = B
```

and the existing p23 DH handoff is:

```text
B=19 -> p50[19] = 0X -> base60 33 -> physical p33 -> THEIR RISE
```

So the first source-connected fork is:

```text
p23 THE ORIGINAL
  THE      -> FIND -> p28 READ OUT
  ORIGINAL -> MUST -> VERIFY -> B -> p33
```

This supplies a second, operation-distinct route from p23 into p33 while simultaneously creating a direct p23-to-p28 route.

## FIND / MUST numbers predict the p33 THEIR RISE loop

The low-digit outputs are not only authenticated p57 words. Under the title-inclusive, one-based p57 word-number convention already used by terminal routes:

```text
FIND = word 15 = b
MUST = word 10 = K*g
```

Apply the already frozen outside-in map:

```text
H(x,y) = (x-y, x+y) mod29

H(FIND#, MUST#)
= H(15,10)
= [5,25]
= [g, second signed-2016 THEIR position]
```

This pair is unique over every ordered pair of the 20 clear p57 word positions: only positions **15,10**, i.e. **FIND,MUST**, map to `[g=5,25]`.

The ORIGINAL branch independently supplies the other endpoint:

```text
MUST -> VERIFY
p50[VERIFY=59] = literal 19 = B
first signed-2016 THEIR position = 19
second signed-2016 THEIR position = 25
rise = 25 - 19 = 6 = a
```

The same source pair then gives the already documented p33 H relation:

```text
H(19,25) = [23,15] = [p,b]
```

So the p23 fork predicts the semantic state carried by p33's independently recovered **THEIR RISE** phrase:

```text
THE ORIGINAL
 -> FIND / MUST
 -> p57 positions [15,10]
 -> H -> [g, THEIR₂=25]

ORIGINAL
 -> MUST -> VERIFY
 -> B=19 = THEIR₁

THEIR rise: 19 -> 25, delta 6=a
```

This does not decrypt p33 body text. It is a cross-source state prediction from the already recovered p23 phrase into the independently established p33 layout semantics.

## The risen THEIR selects WORDS ARE THE MAP and recovers [e,q]

Under the candidate low-digit map, the already fixed **second** THEIR position25 gives:

```text
25 (second THEIR)
 -> p50[25] = 3I
 -> low60(I) = 18
 -> signed word18 = MAP

18 (MAP position)
 -> p50[18] = 0F
 -> low60(F) = 15
 -> signed word15 = WORDS
```

Signed positions15..18 are exactly:

```text
15 WORDS
16 ARE
17 THE
18 MAP
```

so the p33 phrase's literal rise from the first THEIR to the second THEIR lands on one endpoint of **WORDS ARE THE MAP** and the same fixed operation returns the opposite endpoint.

The frozen H map then recovers two independently established state fields:

```text
H(MAP#, WORDS#)
= H(18,15)
= [3,4]
= [e,q]
```

This is selective under a complete signed-source start-index charge. For every one of the 43 authenticated word indices, apply two native-base60 low-digit steps when both outputs remain valid signed-word indices, then require H of those two outputs to equal the fixed state `[e,q]=[3,4]`. There is exactly one hit:

```text
start25 = THEIR
25 -> 18 MAP -> 15 WORDS
H(18,15) = [3,4]
```

The result also matches a p33 layout quantity fixed before this observation:

```text
e^q = 3^4 = 81
= p33 upper-body rune count
```

This gives the source phrase **WORDS ARE THE MAP** a concrete, page-local role: the risen THEIR endpoint selects its MAP/WORDS endpoints and reconstructs the `[e,q]` pair that numerically defines the p33 upper body. It still does not specify a reversible decoder for those 81 ciphertext runes.

## Convention charge

Charge the same finite token-component family relevant to READ OUT:

- base60 versus drop-f base59;
- high versus low token digit;
- zero- versus one-origin digit values.

Require all four semantic/numeric transitions simultaneously:

```text
THE      -> FIND
ORIGINAL -> MUST
FIND     -> 28
MUST     -> VERIFY
```

Across the eight modes, exactly one scores 4/4:

```text
base60 / low digit / zero-origin
```

The closest rival is base59 / low / one-origin at 3/4; it sends FIND to 29 instead of p28. Every other mode scores at most 1/4.

This is useful because the convention was selected before this p23 phrase transfer and the new route reuses it unchanged.

## Evidence boundary

The advance is navigation/state structure, not a claim that the p23 ciphertext body has been decrypted. The phrases THE ORIGINAL, READ OUT and THEIR RISE were already known when this connection was noticed, so this is a post-discovery cross-object consequence rather than a blind plaintext probability.

Still, it removes a real ambiguity in the human solve path:

- p23's recovered instruction has a concrete consumer under the candidate p50 low-digit map, not an independently authenticated operation;
- its first word points to the p28 instruction object under the unselected GP0→p50 address grammar;
- its second word passes through two authenticated command words and rejoins the independently reconstructed DH state at B under the same conditional pointer convention;
- FIND/MUST's fixed p57 positions uniquely map under H to `[g,25]`;
- B=19 and the predicted 25 reconstruct the p33 THEIR positions and their rise `6=a`;
- under the same candidate low-digit map, the risen THEIR position points to `MAP -> WORDS`, the endpoints of **WORDS ARE THE MAP**;
- H of those endpoints recovers `[e,q]=[3,4]`, whose power `3^4=81` is the established p33 upper-body rune count;
- B lands on the already validated p33 state/checkpoint page.

Do not generalize this to arbitrary English-word walks or change component conventions. The next useful step is to determine whether the candidate `[e,q]=[3,4]` and **WORDS ARE THE MAP** relation specify an operation on p33's exact 81-rune upper body. Any candidate must be fixed from existing p33 layout/source semantics before the body values are scored.

## Reproduction

- SFT: `sims/lp2_p23_original_lowdigit_branch_sft.cjs`
- Inputs: `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-grid-256.json`
- Upstream p23 phrase: `im-results/lp2-p23-fivedot-totient-origin.md`
- Low-digit opcode: `im-results/lp2-p28-readout-lowdigit-selfclosure.md`
- P33 phrase/state: `im-results/lp2-p33-layout-family-their-rise.md`
