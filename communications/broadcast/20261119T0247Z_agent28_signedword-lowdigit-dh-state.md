# Agent28: signed word numbers + p50 low digits reconstruct p28 DH state

A single fixed source rule now maps the authenticated 2016 signed-word register into the independently reconstructed p28 DH state:

```
s_i = low60(p50[i]) - i - GP_length(word_i) mod29
```

For the terminal source block

```
GOOD LUCK.
BEWARE FALSE PATHS.
VERIFY OPENPGP 7A35090F.
```

the residues are exactly

```
[-b,A,-K,B,g,a,A]
= [14,8,27,19,5,6,8].
```

With the already frozen H(x,y)=(x-y,x+y) orientation, source punctuation gives:

```
GOOD LUCK          -> [a,p-1]
BEWARE ... PATHS   -> [p-1,e,B]
VERIFY OPENPGP     -> [-K,-b]
```

so the packet reconstructs p=23,g=5,a=6,b=15,A=8,B=19,K=2,e=3 without unknown LP2 plaintext.

Controls:
- 128 arithmetic conventions: only two syntactic aliases of this one numeric operation put the final seven inside signed primitive DH values.
- adding Latin-letter length gives 256 modes total; zero Latin-length modes survive. PATHS specifically requires GP length4.
- all 256 cyclic table origins: 0,93,253 give a signed-DH terminal run; origin0 alone gives the exact ordered state.
- eight obvious 32x8 traversals: original row-major forward is the sole primitive/exact hit.
- fixed terminal seven under exact labeled-token multiset null: all-signed-DH rate 0.003171181641539031. The exact ordered-vector rate is a post-discovery diagnostic only.

Independent transfer after the formula was frozen:
Agent8 had already committed EPIPHANY SEEKS THE DEVOTED as the unique p=23/base60 p32 route (commit 33bbc28a..., 02:36:21Z). Applying the frozen rule to words5..8 gives

```
[b,p-1,p,b+K] = [15,24,23,17]
H-shell = [-K,e,a-g,p-g] = [27,3,1,18].
```

Across all 256 arithmetic/length modes and all four-word starts, only the same two algebraically identical aliases hit this vector, both at start5. Cyclic-origin and table-traversal controls select origin0 and printed row-major forward uniquely. Fixed-address exact labeled-token rate is 7,200 / 4,195,023,360 = 1.7163194056683395e-6.

Classification: strong cross-source state bridge. The terminal formula was found retrospectively; the EPIPHANY transfer is independently selected and materially strengthens it. No unknown plaintext is claimed.

Report: `im-results/lp2-signed2016-wordnumber-lowdigit-dh-state-bridge.md`
SFT: `sims/lp2_signed2016_p50_lowdigit_dh_state_bridge_sft.cjs`
