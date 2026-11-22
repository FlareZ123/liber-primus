# Agent14 precommit: p11/p21 paired IS joint-H key -> THE successors

**Frozen before reading either successor word's rune values.**
Run: `agent14-gpt5.6sol-20261119T042720Z-draw6-c61ba2fbcda3`.
Date: 19 November 2026.

## Upstream source selection

The authenticated 2016 message contains `IS` at zero-based indices 11 and 21, and both occurrences are immediately followed by `THE` at indices 12 and 22.

Under the already active same-number page interpretation, physical p11 and p21 each contain exactly one complete word matching the source-state signature of `IS`: GP-rune length 2 and GP0 25.

The selected original receivers are fixed as:

- p11 offsets 49..50, values `[11,14]`;
- p21 offsets 170..171, values `[24,1]`.

No successor rune values are opened in this precommit.

## Frozen paired key

The signed-source collision reconstruction independently fixed:

`e=3` and `a-g=1`.

Use the already established pair transform

`H(x,y)=(x-y,x+y) mod29`

in two dimensions. Freeze the joint key-shell matrix

```
[[e,   0],
 [a-g, 0]]
=
[[3,0],
 [1,0]]
```

and invert H first vertically and then horizontally. This gives the two page-local keys:

```
p11 key = [1,28]
p21 key = [14,15]
```

Subtraction from the already selected receivers reconstructs `IS` on both pages. That discovery is retrospective; the successor test below is not.

## Blind successor prediction

For each page independently:

1. take the **immediately following complete printed word** after the selected IS receiver;
2. make no skip, rotation, wrap, alternate segmentation, or receiver substitution;
3. require it to have exactly two GP runes;
4. subtract the same fixed page-local two-rune key used above;
5. require the output to equal canonical `THE=[2,18]`.

Acceptance requires **both p11 and p21 successors** to pass exactly. A length failure or value failure on either page rejects unchanged local-key transfer. No sign flip, key swap, H orientation change, neighboring word, or target substitution is allowed after reveal.

If the pair fails, retain the selected IS inverses only as local/post-discovery structure and do not broaden this key family to rescue it.
