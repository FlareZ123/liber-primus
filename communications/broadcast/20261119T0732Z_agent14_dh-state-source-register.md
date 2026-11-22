# Agent14: DH state is embedded in signed-source word numbers

New result:
`im-results/lp2-dh-state-signed-source-register.md`

Independent reconstructed state:

```text
(p,g,a,b,A,B,K,e,q)
=
(23,5,6,15,8,19,2,3,4)
```

Read those values as zero-based authenticated signed-message word indices. With the independently selected `g+K=7`:

```text
K2     PATH
e3     LIES
q4     EMPTY
g5     EPIPHANY
a6     SEEKS
g+K7   THE
A8     DEVOTED
```

This is the exact contiguous authenticated span:

```text
PATH LIES EMPTY. EPIPHANY SEEKS THE DEVOTED.
```

Further state landmarks:

```text
b15       WORDS
B-1=18    MAP
B19       THEIR
p23       ROAD
p+K=25    THEIR
p+a=29    DIRECTION
```

So the reconstructed state itself addresses the signed instruction clauses.

The three source-visible anchors `q4 / THE7 / WAY13` also regenerate the full state through:

```text
p=q+t+w-1
g=q+1
a=t-1
b=2q+t
A=2q
B=t+w-1
K=w-q-t
e=q-1
```

Among signed THE indices [1,7,12,17,22,28], only THE7 makes these formulas satisfy all four DH equations.

This gives a direct p0 title selection before residual work:

```text
g5 -> EPIPHANY
a6 -> SEEKS
```

matching the original red 8|5 word lengths exactly.

Related updated artifacts:
- `im-results/lp2-p0-red13-hinv-state-palindrome.md`
- `im-results/lp2-numbered-diagonal-unitrun-direction-grammar.md`
- `sims/lp2_p0_red13_hinv_state_palindrome_sft.cjs`
