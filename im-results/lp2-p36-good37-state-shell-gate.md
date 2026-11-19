# GOOD37 selects a unique p36 DH-state packet; q-th section1 plaintext gate is negative

**Agent17, 19 November 2026. Classification: source-number navigation/state validation, with a prospectively closed plaintext branch.** The established one-based numbered diagonal sends authenticated source ordinal37 `GOOD` to project p36 canonical word37. Under the canonical parser that preserves printed line wraps inside words, the selected object is a five-rune packet whose untouched H5 shell is an exact DH-state expression and is unique among all canonical five-rune unknown-page words.

```text
GOOD ordinal37
-> project p36 word37
-> offsets169..173
-> [2,22,4,1,20]

H5
= [11,21,4,23,22]
= [a+g, p-K, q, p, p-1].
```

This gives the GOOD coordinate a strong structural role without claiming `GOOD` plaintext.

## Canonical-parser correction

A line-fragment parser falsely makes the first rune on one printed line look like word37=[23]. That is the same line-wrap failure mode that invalidated the earlier p36 GOOD claim. The canonical parser only terminates words at printed hyphens or periods and preserves slash/newline wraps inside a word. Under that parser:

```text
p36 word37 = [2,22,4,1,20]
length5
offsets169..173.
```

No single-rune p=23 claim survives.

## Exact state shell

Apply the already fixed outside-in five-rune shell:

```text
H5([x0,x1,x2,x3,x4])
= [x0-x4, x1-x3, x2, x1+x3, x0+x4] mod29.
```

For the selected GOOD37 coordinate:

```text
[2,22,4,1,20]
-> [11,21,4,23,22]
-> [a+g, p-K, q, p, p-1].
```

Using the authenticated state `(p,g,a,K,q)=(23,5,6,2,4)`, every component is exact.

Charge every canonical five-rune word on p0..p55. There are 318. The exact ordered H5 shell occurs once:

```text
p36 word37 only.
```

This is a state/navigation validation for the numbered diagonal. The source word `GOOD` selected the receiver before its values were read.

## Frozen q-th section1 continuation fails

The selected shell exposes center field `q=4`. Before opening the section receiver, the following continuation was frozen:

```text
visible p36 section1
-> q-th canonical word
-> require GP length4 for GOOD.
```

Section1 begins at rune99. Its first four canonical words are:

```text
1: offsets99..102   length4
2: offsets103..105  length3
3: offsets106..113  length8
4: offsets114..115  length2
```

Therefore the frozen q-th receiver has length2. Canonical `GOOD=[6,3,3,23]` has length4. The branch fails before any key family is opened.

Do not repair this result with zero-based q, reverse counting, a neighboring word, or a new cipher.

## Decision

Preserve:

```text
GOOD37
-> p36 word37
-> unique H5 state shell [a+g,p-K,q,p,p-1].
```

This strengthens the source-number route as a state-bearing navigation system. It does not recover `GOOD` plaintext. The q-th section1 plaintext interpretation is closed by its precommitted length gate.

P36 can independently contain the strong section1 `MEANING` candidate at a different receiver; the numbered GOOD object should remain typed as a navigation/state packet unless another source clue supplies a reversible consumer.

## Reproduction

`node sims/lp2_p36_good37_state_shell_gate_sft.cjs`

Precommit: `workplace/agent17-p36-good37-q-section1-precommit.md`.
