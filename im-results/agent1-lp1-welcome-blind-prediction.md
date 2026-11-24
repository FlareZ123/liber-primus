# Blind LP1 WELCOME continuation — frozen prediction

**Status:** Prediction frozen before comparison with the withheld native plaintext. Do not edit or manually correct this sequence.

## Frozen inputs and derivation

- Cipher source: `resources/transcriptions/lp1_wulfic_canonical.txt`, second `$`-separated segment, 515 GP29 symbols.
- Gold-source use before prediction: only the first 16 GP29 symbols of section 1 (`0_welcome)), plus training sections 0, 2, 3, 4, 6, 7 and 8. No target symbols 16–514 were consulted.
- Known plaintext crib: `WELCOME WELCOME PI` (16 GP29 symbols).
- Crib difference stream: `DIUINITYDIUINITY`.
- Unique period among 1–13: **8**.
- Derived key: **DIUINITY**, matching the allowed source-derived description `DIVINITY → DIUINITY`.
- Cipher convention: additive GP29; plaintext F is transparent and does not advance the key. At ciphertext F, Viterbi branches between transparent plaintext F/no advance and encrypted non-F/advance.
- Language model: GP29 trigram model trained only on native plaintext sections [0, 2, 3, 4, 6, 7, 8], with additive smoothing alpha = 0.1; no cross-section trigrams.
- Viterbi state: (key position, previous two plaintext symbols).
- Best path: unique optimum; score `-1390.4722481220858`.
- Predicted continuation length: **499 GP29 symbols**.
- Inferred transparent plaintext-F positions (zero-based within the full 515-symbol section): `[48, 74, 84, 132, 159, 160, 250, 421, 443, 465, 514]`.
- Forward re-encryption of the crib plus prediction: **exact match across all 515 ciphertext symbols**.

## Frozen predicted continuation

The following is the exact Viterbi output, as GP29 transliteration tokens separated by spaces. No linguistic post-editing has been applied.

```text
L G R I M T O TH E G R EA T J O U R N E Y T O W A R D TH E E N D O F A L L TH NG S I T I S N O T A N EA S Y T R I P B U T F O R TH O S E W H O F I N D TH E I R W A Y H E R E I T I S A N E C E S S A R Y O N E A L O NG TH E W A Y Y O U W I L L F I N D A N E N D T O A L L S T R U G G L E A N D S U F F E R NG Y O U R I N N O C E N C E Y O U R I L L U S IA N S Y O U R C E R T A I N T Y A N D Y O U R R EA L I T Y U L T I M A T E L Y Y O U W I L L D I S C O U E R A N E N D T O S E L F I T I S TH R O U G H TH I S P I L G R I M A G E TH A T W E S H A P E O U R S E L U E S A N D O U R R EA L I T I E S J O U R N E Y D E E P W I TH I N A N D Y O U W I L L A R R I U E O U T S I D E L I C E TH E I N S T A R I T I S O N L Y TH R O U G H G O NG W I TH I N TH A T W E M A Y E M E R G E W I D S O M Y O U A R E A B E NG U N T O Y O U R S E L F Y O U A R E A L A W U N T O Y O U R S E L F EA C H I N T E L L I G E N C E I S H O L Y F O R A L L TH A T L I U E S I S H O L Y A N I N S T R U C T IA N C O M M A N D Y O U R O W N S E L F
```

Compact token concatenation (for checksum/reproduction only):

```text
LGRIMTOTHEGREATJOURNEYTOWARDTHEENDOFALLTHNGSITISNOTANEASYTRIPBUTFORTHOSEWHOFINDTHEIRWAYHEREITISANECESSARYONEALONGTHEWAYYOUWILLFINDANENDTOALLSTRUGGLEANDSUFFERNGYOURINNOCENCEYOURILLUSIANSYOURCERTAINTYANDYOURREALITYULTIMATELYYOUWILLDISCOUERANENDTOSELFITISTHROUGHTHISPILGRIMAGETHATWESHAPEOURSELUESANDOURREALITIESJOURNEYDEEPWITHINANDYOUWILLARRIUEOUTSIDELICETHEINSTARITISONLYTHROUGHGONGWITHINTHATWEMAYEMERGEWIDSOMYOUAREABENGUNTOYOURSELFYOUAREALAWUNTOYOURSELFEACHINTELLIGENCEISHOLYFORALLTHATLIUESISHOLYANINSTRUCTIANCOMMANDYOUROWNSELF
```

The withheld native plaintext comparison is deliberately not included here. It must be performed only after this prediction has been committed.
