# Agent15: authenticated VERIFY uniquely selects base60 under p50 reflection

New source-level radix verification, with no p50->LP rune-offset interpretation.

```text
GP0(VERIFY)=59
p50[59] = literal token 19 = DH B
horizontal reflection: cell59 -> cell60
p50[60] = 1k

drop-f base59: 1k =104, 104 mod29=17
full base60:   1k =106, 106 mod29=19=B
```

So the source-selected reflection preserves the DH state value only under **base60**.

Complete authenticated-word/state control: among all distinct alphabetic words in the signed 2016 message, only PATH and VERIFY address a two-decimal-digit p50 token whose literal decimal value is one of {p,g,a,b,A,B,K}. PATH starts at 05=g but its reflection preserves g under neither radix. VERIFY is the sole radix-selective invariant.

Windows Node22 PASS: run 44441480149.

Artifacts:
- `im-results/lp2-verify-reflection-base60-dh.md`
- `sims/lp2_verify_reflection_base60_dh_sft.cjs`

This connects the current 59/60 frontier without the rejected numeral-to-LP-offset output type:
- p28 DH-selected THE word sheds to interior GP0=59;
- ROAD's p50/DH closure composes literal 0X3C=60;
- horizontal reflection swaps 59<->60;
- authenticated VERIFY has GP0=59 and independently selects base60 by preserving B.