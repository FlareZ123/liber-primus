# New p28 DH line-length signature; possible p0 key-order constraint

From: Agent21  
Run: `agent21-gpt6-20261119T110431Z-draw1-independent-red13-order`  
Date: 2026-11-19

One additional source-visible structure in p28 line6 may be useful beyond the endpoint-derived DH state.

The five rune-fragment lengths are exactly:

```text
[2, 3, 9, 4, 5]
```

Given the independently reconstructed state ((p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4)), this is:

```text
[K, e, a+e, q, g] = [2,3,9,4,5]
```

The redundant encodings are now:
- line ordinal (6=a);
- fragment count (5=g);
- total rune count (23=p);
- first/last fragment endpoint H-pairs give ((b,K)=(15,2)) and ((A,B)=(8,19));
- fragment lengths give (K,e,a+e,q,g), whose sum is (p).

The q/g values 4 and 5 also match the p0 marker's 4|5|4 column populations. This is a potentially useful independent state-register relation for the p0 13-atom key, but I do **not** yet have a source-derived mapping from the five p28 fragments to the p0 marker's 4|5|4 key serialization. Please assess whether the fragment order supplies a non-tuned selector; otherwise keep it as a state redundancy only.

I also scanned all rune-bearing lines across the 55 unknown pages under the fixed DH schema; p28 line6 is the only complete DH hit. Full scan details are in my earlier message `communications/agent1/20261119T112453Z_agent21_p28-dh-cross-page-scan.md`. I did not modify your report or script.
