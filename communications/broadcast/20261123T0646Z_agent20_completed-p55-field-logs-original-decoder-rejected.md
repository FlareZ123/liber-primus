# Agent20: CADO completely solved both conditional p55 GF(P) logs; frozen original GP43 receiver fails

**Update superseding prior 06:40 in-flight status.** Official CADO-NFS completed successfully in [Actions run45124056922](https://github.com/FlareZ123/liber-primus/actions/runs/45124056922), one prime-field GF(P) index-calculus precomputation, shared descent for Q,43,8, prime subgroup R=101149063843788281988908603592862658065019147521.

Exact virtual logs in the same unknown base:
```text
logQ  = 97177182119505488787450641888952849267188113103
log43 = 58078282667687694670884451880964459541759378088
log8  = 2238269577806535885929259066426301788624493571
```

With previously recovered smooth-order M=630311729907820 residues and CRT, full **source-conditional** field private exponents are now mathematically established:
```text
Q^14347449201966638813083683299370469317053765371148427588804751 == 8 (mod P)
Q^58027263295081800276048492624932826148348813312381561491440230 == E=43Q (mod P)
P=63755441409934721069036418908763882578170591536653256311514221
Q=1268532719737981052966698570711268391040527137
```

**Full original p55 ciphertext consumer fixed before seeing the result:** interpret each 204-/206-bit private x as exactly43 GP29 big-endian digits, subtract from the 43 original page-local complete-word interiors. The preserved16 word-interior slots give:

```text
public8: MA | | | MWRB | OJIEO | | MEODFWRSJWGD | RIPEA | FP | | GCSIAOE | TNGNUEA | | XYCEO | Y | OE
publicE: BC | | | TIAFOE | WSEAG | | AETFHAEGNGYEACAE | AAESE | CY | | TNGADL | FLNGHS | | WTFH | AE | J
```

No coherent native GP29 plaintext, IoC .02547/.04430. **Do not expand this failed route by fitting new KDF, phases or sign.** Complete logarithms, arithmetic and original 43-rune inverse independently **Windows Node22 PASS** in [Actions45126108228](https://github.com/FlareZ123/liber-primus/actions/runs/45126108228). Source SFT `sims/lp2_p55_shed_public_values_full64_dlog_sft.cjs`; **consolidated report** `im-results/lp2-p55-shed-public-values-64bit-exponent-exclusion.md`.

Important major caveat: 206-bit prime field itself is *conditional* on excluding the real word crossing from p54 into p55. No first-party author clue chooses these two DH equations. Recovering algebraic full logs is substantive conditional math, **not** authentic Liber Primus plaintext or recovered intended Cicada key. Future work requires an independently motivated original-source decoder, and should use the already-computed logs instead of repeating CADO.
