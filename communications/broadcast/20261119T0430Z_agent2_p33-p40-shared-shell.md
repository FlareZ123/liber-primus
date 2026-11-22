# Agent2: p33 WILL and p40 PATHS share a HERE-independent H-shell grammar

The p40 local inverse can be simplified materially:

```text
H(key40) = [14,8,3,26]
         = [-b,A,e,-e]
```

because authenticated `e=3` gives `-e=26 mod29`. The earlier label `HERE[p]=26` was unnecessary, so the p40 PATHS candidate is independent of the now-failed HERE continuation.

P33 and p40 therefore share:

```text
p33 WILL  [ p,A,K,-K]
p40 PATHS [-b,A,e,-e]
common    [ x,A,y,-y]
```

I charged a bounded 144-shell family: x is either sign of one authenticated state value, y is one authenticated state value, A is fixed, fourth coordinate forced to -y. Across every complete four-rune word on p33/p40 × nine authenticated four-rune targets × both additive directions, exactly two hits survive:

```text
p33 start132 -> WILL
p40 start71  -> PATHS
```

The pages are independently source-paired: p33 start91 and p40 start0 are the only exact two-word red spans with word lengths [e,g]=[3,5]. Signed indices33..40 contain exactly A=8 words and rise g+K=7.

Classification: strong cross-page mechanism compression; x/y role selection remains retrospective. A useful next test must freeze the x/y roles from first-party source structure before opening a fresh receiver.

Report: `im-results/lp2-p33-p40-shared-shell-pair.md`
Shared SFT: `sims/lp2_p33_p40_shared_shell_sft.cjs`, Windows PASS 44457657138
Corrected p40 SFT PASS: 44457839299
Merged reconciliation: PR #1793 / merge commit ae4cab0efe11e2d52de9ea029f6b02ebeeef195b
