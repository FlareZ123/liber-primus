# p15 absolute-distance prime clock: source-indexed original inverse

**Agent9, 27 November 2026 — scoped negative, not recovered plaintext.** The p15 numerical spiral is solved by |3301 − prime(F+1)| at the 16 distinct Fibonacci indices F. The established p56 prose receiver uses consecutive prime-minus-one shifts with plaintext-F bypass. This experiment transfers the *absolute-distance operator* to a consecutive prime clock, not the Fibonacci-index stride itself. The drawn infinity sign motivates trying a continuing clock but does not authenticate the transfer, its receiver or a starting phase. #2854 found no independent historical sign-transition instruction; this is a new speculative original-cipher test, not evidence that this operation is intended.

## Exact decoder

Let p_j be the zero-based positive-prime list. K_j = s (|3301−p_(o+j)|−d) mod 29, s in {+1,−1}, d in {0,1}. The candidate starts o are precisely the 16 source-selected Fibonacci indices, not a free search over arbitrary primes. Two frames: physical p16–22, 1,744 runes; p15 black body (after 20 red runes) continuing through p22, 1,883 runes. No printed-word boundary assumptions or further resets. Ordinary inverse P=(C−K) mod29 consumes one key per glyph. Authentic F-hold inverse permits literal P=C=0 without consuming; consuming P=0 is forbidden. A dynamic program tracks every reachable consuming-clock index and returns the exact first impossible rune, if any. The ordinary variants always replay exactly; replay is an implementation check, not key identification.

The source corpus is blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165. The script independently checks the 16 source-grid values, and validates the historical p56 rule against all 85 original ciphertext runes using the independently known native spelling (including EUERY and SEEC). Synthetic fold-key controls repeat this p56 plaintext to each full receiver length and retain at least one exact legal F-hold history in every tested case; these validate reachability, not blind uniqueness or independent prose recovery. A smoothed bigram diagnostic trained only on p57 is deliberately weak, not a calibrated significance or language-exclusion test.

## Results and next decision

```json
{
  "nativeReplay": 85,
  "gridCells": 16,
  "foldPrimeIndex": 463,
  "origins": [
    0,
    1,
    2,
    3,
    5,
    8,
    13,
    21,
    34,
    55,
    89,
    144,
    233,
    377,
    610,
    987
  ],
  "rows": 128,
  "originalFholdComplete": 0,
  "plantComplete": 128,
  "maxPrefix": 299,
  "perFrame": {
    "p16": {
      "length": 1744,
      "maxPrefix": 299,
      "ordinaryBest": -3.5170277317254213,
      "ordinaryWorst": -3.5572224411808255,
      "controlScore": -3.1594203903347804
    },
    "p15black": {
      "length": 1883,
      "maxPrefix": 274,
      "ordinaryBest": -3.508941685665801,
      "ordinaryWorst": -3.5670558412945157,
      "controlScore": -3.1608068658289854
    }
  },
  "longest": [
    {
      "frame": "p16",
      "length": 1744,
      "origin": 8,
      "delta": 1,
      "sign": -1,
      "Fhold": {
        "length": 299,
        "terminalStates": 0
      },
      "plantTerminalStates": 4,
      "ordinaryScore": -3.5277269172967802,
      "ordinarySample": "E B T J IA EO R B NG C M N A C NG Y EO E EO C L L E E W W EO EO EO OE G L L L NG U A X B L L R H L A AE S TH I N IA M C E TH TH D B OE H OE NG O W TH G AE C NG Y Y TH C NG TH J L P B W",
      "FholdScore": null,
      "FholdSample": null,
      "controlScore": -3.1594203903347804
    },
    {
      "frame": "p16",
      "length": 1744,
      "origin": 21,
      "delta": 0,
      "sign": -1,
      "Fhold": {
        "length": 274,
        "terminalStates": 0
      },
      "plantTerminalStates": 3,
      "ordinaryScore": -3.528526299521084,
      "ordinarySample": "NG OE B I Y J O L Y IA X TH B D EO B C J U NG W U J J R D Y A EA J OE J W O H P N A G M P X E C W R D G E S R NG O L X EO IA NG O X W IA J S X E G S G S W EO NG TH E D Y NG P C",
      "FholdScore": null,
      "FholdSample": null,
      "controlScore": -3.1594203903347804
    },
    {
      "frame": "p15black",
      "length": 1883,
      "origin": 8,
      "delta": 1,
      "sign": -1,
      "Fhold": {
        "length": 274,
        "terminalStates": 0
      },
      "plantTerminalStates": 3,
      "ordinaryScore": -3.533747331633265,
      "ordinarySample": "I A TH T R C T EA E NG L A L S EO E EO F TH B D J I I I EA EA EO T G W R TH C S G O EA AE U O P O R Y N IA IA E S TH P X EA R M W N M N E W C P U S NG O AE R E U H EO M Y M B U X",
      "FholdScore": null,
      "FholdSample": null,
      "controlScore": -3.1608068658289854
    },
    {
      "frame": "p16",
      "length": 1744,
      "origin": 610,
      "delta": 1,
      "sign": -1,
      "Fhold": {
        "length": 161,
        "terminalStates": 0
      },
      "plantTerminalStates": 2,
      "ordinaryScore": -3.5233184582014268,
      "ordinarySample": "C T NG A M U EA U B M E E EO B A H G OE L D B TH L W X C OE U J T EO IA H EO IA S S M N N X I A AE T R I S TH W H EO G I I E Y U Y OE D Y OE C A B NG D L I Y EO TH Y D R AE W NG IA",
      "FholdScore": null,
      "FholdSample": null,
      "controlScore": -3.1594203903347804
    }
  ],
  "bestOrdinary": [
    {
      "frame": "p15black",
      "length": 1883,
      "origin": 21,
      "delta": 0,
      "sign": 1,
      "Fhold": {
        "length": 110,
        "terminalStates": 0
      },
      "plantTerminalStates": 2,
      "ordinaryScore": -3.508941685665801,
      "ordinarySample": "W TH B T EO B W IA IA B Y J J OE AE X OE E EA A C W OE U N EO C A W W E D H M T S E OE G AE EO N W T S OE D I N EO J C X S N C O P T OE X S M I I W IA B E N I N U S W OE R H T X",
      "FholdScore": null,
      "FholdSample": null,
      "controlScore": -3.1608068658289854
    },
    {
      "frame": "p15black",
      "length": 1883,
      "origin": 610,
      "delta": 0,
      "sign": -1,
      "Fhold": {
        "length": 23,
        "terminalStates": 0
      },
      "plantTerminalStates": 2,
      "ordinaryScore": -3.514675705520219,
      "ordinarySample": "IA A H U Y A EO P S W L C N EA T U W C J W NG D P F E IA I TH T U X EO L IA OE NG A C E L IA L L I M E D EO J X P W T NG P W J D A A L P AE EO A IA E OE AE E M EO G E EO L AE EO G G",
      "FholdScore": null,
      "FholdSample": null,
      "controlScore": -3.1608068658289854
    }
  ]
}
```

All tested F-hold cases reject before the indicated longest legal prefix, if zero complete histories as reported above. Ordinary inverses produce nonprose samples and no readable passage; the bigram comparison is descriptive. In particular a start that dies before reaching prime 3301 does not test the later sign switch, while the two source origins beyond the pivot exercise the post-pivot branch. Do not treat this as evidence against any arbitrary prime origin, private clock, different Fibonacci index schedule, or an authenticated sign-change receiver. Do not promote to results/README: there is no new original plaintext or key. Retire this specific source-indexed folded consecutive-prime law absent independently sourced new operands.

Reproducer: [script](../sims/lp2_p15_folded_prime_clock_agent9.cjs). Full output: [JSON](lp2-p15-folded-prime-clock-agent9.json). Exact core executed in connected JS; standalone Node wrapper was not separately executed.
