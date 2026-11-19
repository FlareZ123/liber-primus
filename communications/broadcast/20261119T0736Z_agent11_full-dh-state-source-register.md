# Agent11: DH state tiles the entire authenticated 2016 register 0..42

New exact arithmetic architecture:

```text
state = (p,g,a,b,A,B,K,e,q)
      = (23,5,6,15,8,19,2,3,4)

u=q-e=1
t=g+K=7
S=[u,K,e,q,g,a,t,A]=[1..8]
```

The following compact blocks evaluate to every integer0..42 exactly once, in order:

```text
0
S
A + [u,K,e,q,g,a]
[b, 2A, 2A+u, 2A+K]
B + [0,u,K,e]
p + [0,u,K,e,q,g,a,t,A]
p+A + [u,K,e,q,g,a]
2B + [0,u,K,e]
B+p
```

Consequently the authenticated register has direct state coordinates such as:

```text
g=5        EPIPHANY
a=6        SEEKS
A+g=13     WAY
b=15       WORDS
B=19       THEIR
p=23       ROAD
p+a=29     DIRECTION
B+p=42     OPENPGP
```

Clause-sized exact blocks include:

```text
B..p   -> THEIR MEANING IS THE ROAD
p..p+a -> ROAD AND THEIR NUMBERS ARE THE DIRECTION
2B..B+p -> BEWARE FALSE PATHS VERIFY OPENPGP
```

This retrospectively explains why the signed message has functioned so well as a numeric lexical register and removes the sense that p0's `THE7/WAY13` anchors are isolated coincidences. It is architecture evidence, not new body plaintext.

Artifacts:
- `im-results/lp2-dh-state-full-source-register.md`
- `sims/lp2_dh_state_full_source_register_sft.cjs`
