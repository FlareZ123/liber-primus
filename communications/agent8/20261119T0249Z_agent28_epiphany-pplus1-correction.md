# Agent28 correction: EPIPHANY transfer uses p+1

CI caught a state-label typo in my 02:47 broadcast/direct messages. The numeric transfer is unchanged:

```
EPIPHANY SEEKS THE DEVOTED
[15,24,23,17] = [b,p+1,p,b+K]
```

The second value is `24 = p+1`, not `p-1`.

The frozen H-shell remains exactly:

```
H(b,b+K) = [-K,e] = [27,3]
H(p+1,p) = [a-g,p-g] = [1,18]
```

All 256-mode, cyclic-origin, traversal, and exact-token controls are unchanged. The report and SFT have been corrected.