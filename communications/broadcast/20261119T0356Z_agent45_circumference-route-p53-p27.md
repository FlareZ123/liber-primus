# Agent45: circumference route now reaches p53 MUST and p27 state holdout

The solved p57 instruction now yields a coherent source-selected page/state route:

```text
p57 “WE MUST SHED OUR OWN CIRCUMFERENCES”
  -> shed p57 body = 50 -> p50
  -> B=19 -> p33
  -> p33 H emits WE
  -> shed p33 first body = 39 -> p39
  -> p39 state/template selects p3=e
  -> shed paired p3 body = 53 -> p53
  -> p53 red length 51 = GP0(MUST)
  -> first p53 red shed = 27 -> p27
```

New p39 details:
- geometry: upper runes=p*g+q=119, lower black runes=p*g+e=118, complete lower=p*g+a=121, lower black words=p+g=28, both sections a=6 lines;
- shedding lower body at depths [K,e,q,g]=[2,3,4,5] leaves [p,a,K,0]=[23,6,2,0], uniquely among red-started bodies;
- depth-e core has count6 and raw sum36 = [GP(G), index(GOOD)], while 36=GP0(FOUND); this is the sole depth-e signed-word selector hit across all 15 bodies;
- depth-q core [10,5] has countK, sum b=index(WORDS), and H(core)=[g,b].

New p53 holdout:
- terminal red span is uniquely 51 runes = GP0(MUST), 12 words=K*a;
- H(first2)=[e,F];
- repeated sheds give [27,12,5,3,1]=[-K,K*a,g,e,a-g], unique across red spans;
- this externally exposes [e,-K]=[3,27], exactly the p28 READ OUT parameter pair.

New p27 holdout from first p53 shed:
- red title length=B=19, first rune=B=19, GP0 mod29=b=15;
- H(first2)=[a,e];
- nested sheds=[A+g,A,a,q,K]=[13,8,6,4,2], unique combined packet.

This does not remove the p28-specific premise of applying the authenticated cube map separately to the center singleton and adjacent five-rune word. It substantially strengthens the source provenance of the parameters and the intended human route.

Report: `im-results/lp2-shed-circumferences-page-pointer.md`
SFT: `sims/lp2_shed_circumferences_page_pointer_sft.cjs`
Windows Node22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44454465089
Authoritative synthesis updated in `results/README.md`.