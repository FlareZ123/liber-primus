# Agent20: authenticated 2016 tail is a p28-DH state tape; state75 warning packet geometry is source-selected

Strong new source-only structure, independent of the candidate plaintext rune values.

Frozen p28 state: `p=23,g=5,a=6,b=15,A=8,B=19,K=2,e=3`, `H(x,y)=(x-y,x+y) mod29`.

## Final warning lengths and packet geometry

Signed final five words:

```text
BEWARE FALSE PATHS VERIFY OPENPGP
len:  6     5     4      6       7
```

Exactly:

```text
[a, g, a-K, a, g+K]
```

Total=28=29-1. Literal FALSE has length `g=5`; removing it leaves `p=23`.

P0 state75 packet selected by `GP0(OPENPGP)=75 -> p50[75]=2v -> base60/zero center177` has printed word lengths:

```text
7,3,1,6,6 = [g+K,e,K-1,a,a]
```

Joining the 3|1 boundary gives logical `[7,4,6,6]=[g+K,a-K,a,a]`, total `g+3a=p`. Across 2,713 complete five-word windows on unknown pages, exact printed `[7,3,1,6,6]` occurs once: p0 offset166. On p0 the logical boundary schedule around a word-start center also has one solution: center177, required boundaries 166,173,177,183,189, with sole extra boundary176 inside the PATHS-sized segment.

## Signed-carrier H coordinates

For each signed word use `delta=index-GP0 mod29`, then frozen `H(delta,length)`:

```text
BEWARE  index38 delta8  len6 -> [2,14]  = [K,B-g]
FALSE   index39 delta20 len5 -> [15,25] = [b,p+K]
PATHS   index40 delta15 len4 -> [11,19] = [a+g,B]
VERIFY  index41 delta11 len6 -> [5,17]  = [g,b+K]
OPENPGP index42 delta25 len7 -> [18,3]  = [p-g,e]
```

Read residues >14 as signed offsets around center177:
OPENPGP diff18=-11 -> packet start166;
FALSE sum25=-4 -> logical PATHS start173;
VERIFY start0=center177, diff5 -> VERIFY end182;
direct a=6 -> BEWARE start183;
PATHS diff11 -> packet end188.
So source carrier H geometry reproduces all logical packet bounds before ciphertext is read.

## Candidate packet values

The structurally selected span still has candidate crib:
`OPENPGP | PATHS (crosses printed 3+1 boundary) | VERIFY | BEWARE`.
Existing charged segment keys reproduce all four, but those formulas remain retrospective. The structural placement no longer depends on them.

Report: `im-results/lp2-p0-openpgp-warning-packet.md`
SFT: `sims/lp2_openpgp_verify_dh_inverse_sft.cjs`

## Broader tail tape

Immediately preceding source sentence has lengths:

```text
SEEK AND YOU WILL BE FOUND GOOD LUCK
4    3   3   4    2  5     4    4
= [a-K,e,e,a-K,K,g,a-K,a-K]
```

Its first carrier deltas are `[e,a-K,K,g,-1,-1,a-g,a]`. The final warning continues with `[A,b+g,b,a+g,p+K]`. This suggests the authenticated tail is intentionally carrying the p28 DH state, not merely offering isolated crib words.

Highest-value next task: derive one uniform key/operation schedule from this source-side tape that predicts an untouched ciphertext target. Do not multiply the warning packet's fitted-key hit rates; the independent breakthrough is receiver/segmentation/source-H geometry.
