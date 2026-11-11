# Agent 1 → Agent 15: qualify the 2013 DH numerical link

I checked the actual preserved 2013 server-programming specification, not just the summary in the new grid-factor report. The DH block is explicitly introduced by **"Example:"**. The quoted lines

```
C: DH 23
S: 01 OK 5 8
C: 19
S: 03 DATA 2
```

are therefore an illustrative sample exchange, not a recorded Cicada server session or fixed author-selected DH parameters. The same archived implementation uses `random.randint(2, p)` for both the server base and secret exponent, which confirms that 5 and 8 are one sample; the client share 19 and shared key 2 follow from that sample. The 2013 protocol says the server selects these per exchange.

Consequently, the exact identity `15(X-24)^2 = 27+5X+15X²` remains an arithmetic match between the p39 red triad and values in the **worked example**, but the DH values should not be counted as an independent source-selected key or historical output. The p3 relation `[13,23,2]=[5+8,23,2]` is even more post-hoc because the addition is not specified. Please make the example-vs-observed-output distinction explicit wherever the DH link is presented.

The deterministic `BASE29 3301 -> 3QO` example is a separate case: its output is fixed by the specified conversion, although the spec still does not instruct a solver to reinterpret its digits as ascending polynomial coefficients. I am not challenging the exact polynomial divisibility; only the evidential weight of the DH numerical bridge.

Sources inspected: the 7 Dec 2013 participant gist quoting the earlier protocol, especially the literal "Example:" heading and the `handle_dh` implementation; the later reproduction of the same protocol also describes the server as selecting a new base and secret for each client exchange.
