# Period-available anti-repeat cipher survey: no source-selected GP29 inverse

**Decision, 12 November 2026 (Director #457):** A deliberately finite search of pre-May-2014 cryptographic and constrained-coding literature found a concrete historical *paired-output* restriction (Playfair), a known ciphertext-feedback architecture, and numerous storage-oriented run-length-limited codecs. None provides an original-LP2-selected, 29-symbol, reversible operation that predicts unknown plaintext. A key-independent test contradicts conventional Playfair pairing on the original LP2 ciphertext even when each physical page is granted its own independently chosen parity. Treat the 86 doublets as a real original-source constraint, not a license to fit an arbitrary predecessor-exclusion encoder.

## Frozen input and independent reproduction

The immutable input is [resources/liber-primus/lp2-corpus.json](../resources/liber-primus/lp2-corpus.json): 55 rune-bearing original physical pages p0–p55 (p50 has no runes), 12,956 GP29 runes, 12,901 within-page transitions and 86 adjacent identical-rune pairs. The [standalone CommonJS original-input gate](../sims/lp2_historical_playfair_repeat_gate_sft.cjs) reproduces these quantities and tests the exact historical 1928 positive control printed below.

Count each equal adjacent pair by the parity of its **zero-based first rune position inside its physical page**. Exactly 35 start at even positions and 51 at odd positions. Any Playfair-like direct ciphertext pairing chooses either (0,1),(2,3),… or (1,2),(3,4),…; within every such pair the two cipher symbols must differ. There are **14 original pages** with equal adjacent pairs on *both* parities. Granting an arbitrary independent binary phase to each of the 55 pages still leaves **17** equal-within-pair events, by summing the smaller of the two parity counts on each page. This contradiction is independent of the keyed square. It is **not** an exclusion of an extra-symbol, variable-size, word-internal, changed-alphabet, interleaved or dynamically re-paired construction. These would need an original-source rule and recoverable state.

### Finite pre-2014 literature register

| Period-authentic source | Actual published algorithm/property | Exact GP29 transfer decision |
| --- | --- | --- |
| Parker Hitt, *Manual for the Solution of Military Ciphers* (1916), Chapter VIII | Keyworded 5×5/25-symbol Playfair square; encipher fixed pairs, insert a dummy when two plaintext symbols in a pair are the same; every *cipher* pair has distinct symbols. Requires an even count of output letters. | The original 29-rune alphabet has no supplied 25-symbol reduction/key square, and its 86 same-rune pairs cannot be partitioned into distinct-symbol pairs by either page phase. Exact source-level obstruction above. |
| M. E. Ohaver, “Solving Cipher Secrets,” *Flynn's* (25 February 1928), Playfair Cipher No. 136 | Explicit diagnostic: no cipher pair contains the same letter twice. The article prints 60 two-letter cipher groups with this invariant and a keyed Playfair example. | Frozen 60/60 historical positive-control pairs pass the same test; original LP2 fails (minimum 17 after granting pagewise phases). |
| Parker Hitt (1916), concluding summary of polyalphabetic methods | Describes a running-key cipher where each ciphertext letter supplies the key for enciphering the next. This is a known, reversible ciphertext-autokey family, but it does **not** prohibit equal adjacent ciphertext letters. | The canonical simple GP29 difference stream has Shannon entropy **4.83073159 bits** on 12,901 transitions and a nearly flat distribution among nonzero differences (401–510 occurrences), versus just 86 zero differences. The previously established *key-independent* preceding-ciphertext alphabet gate already measures H(C_i\|C_{i−1})=**4.78530674 bits**, above all 89 GP-English controls (max **4.28910**); it excludes even a separate arbitrary 29-symbol secret permutation keyed only by the previous ciphertext rune, under that fixed-English register. Do not re-run this covered family. |
| Jian Luo, *M-ary run length limited coding* (Rochester Institute of Technology thesis, 1996) | Finite-state constrained **recording-code** design with chosen (M,d,k), capacity calculation, state splitting and codeword-rate tradeoffs. It maps data blocks to allowed recording symbols, not a named word/rune cipher. | No original clue selects M=29, (d,k), encoder FSM, input length, codeword boundaries or reverse map; it supplies no rule producing precisely 86 repeat exceptions. |
| A. Iketani, M. Kobayashi, S. Tazaki, “A Systematic Construction Method of Run Length Limited Codes” (1998) | Block/variable-length binary NRZL RLL storage codes with constrained consecutive bit runs, explicit selection and concatenation rules. | The documented binary constraints and varying codeword rates have no GP29 serialization or source-visible expansion/side information. They cannot be transferred without inventing a codec and stream boundaries. |
| O. F. Kurmaev, “Coding of Run-Length-Limited Sequences,” *Problems of Information Transmission* 37 (2001) | Enumerative block encoder for binary sequences whose runs of **zeros** obey given length constraints; recurrence for bit weights. | Does not constrain adjacent equality over 29 runes. No period-observed LP2 clue selects a binary expansion, a run limit or block rank. |
| O. F. Kurmaev, “Enumeration of constant-weight run-length limited binary sequences” (2011) | Binary constant-weight constrained enumerative encoder and decoder. | Same absent 29-rune alphabet, bit serialization and key/length selector. No original plaintext prediction. |

All entries are algorithms or period-verifiable descriptions, rather than retrospective modern blog attributions. **Neither a storage-code's known existence nor a true 29-symbol collision deficit implies the puzzle uses that code.** The authors' historical availability is established only in the weak sense that these texts existed by 2014. No Cicada source links them to LP2.

### Exact historical positive control

Ohaver's printed 25-February-1928 Cipher No. 136, in six rows of ten printed digraphs:

    UL.WR.AM.HQ.FW.RU.GC.HY.IO.KL.
    BG.FI.QB.AP.YP.AB.DC.ET.CO.AL.
    KF.PU.SL.LI.LH.IM.FB.PB.MI.HL.
    DO.IB.KF.LN.EL.CO.FC.KA.LI.AL.
    KF.LB.MK.RN.UE.OM.TM.UN.CD.OI.
    BA.MC.PZ.AB.FU.MB.BG.FE.HV.YV.

All sixty ciphertext digraphs have two distinct letters, as the historical source predicts. The SFT asserts this control before examining the original LP2 runes.

### Historical counterexample that does not select LP2

Major H. D. Josse's **1889** keyed ciphertext-autokey manuscript was recovered and analyzed in scholarly papers in **2020–2021**. Its published inverse contains the statewise relation P_i=S⁻¹(S(C_i)−S(C_{i−1})−1), so a ciphertext doublet necessarily maps to one distinguished plaintext letter. This is an important *conceptual* demonstration that rare doubles need not require an irreversible collision-rewriter. It is not an authenticated pre-May-2014 source available to a Cicada player: the manuscript's modern public rediscovery was after LP2 was issued, and no Cicada source selects Josse's exact key derivation. It remains within the original-source **ciphertext-feedback** statistical gate above for fixed GP29 English controls; it is not an actionable key recovery.

## Why no additional key/clock sweep follows

The [pre-existing lossless-capacity proof](lp2-anti-repeat-lossless-capacity.md) shows any universal fixed-length GP29 encoder yielding **at most 86** same-rune transitions over these 55 fixed page lengths needs an auxiliary plaintext-dependent channel of **at least 326 bits**. A published recording code can spend extra length, and Playfair spends filler symbols; LP2 provides no source-selected account of that expenditure. The reversible 43-step synthetic exclusion mechanism recently studied elsewhere is *not* rescued by this survey: it lacks a historically selected state clock and plaintext prediction.

**Completion criterion:** The frozen 1916/1928 classical-cipher register and the 1996/1998/2001/2011 coding register yield **zero** independently source-selected GP29 inverses and **zero** withheld original-text predictions. The Playfair family has a direct original-cipher contradiction. The known ciphertext-feedback family is already bounded under native-English controls. Retire literature-led “no identical adjacent rune” searches at this evidence level, and reopen only on an independent original-LP2 instruction fixing an alphabet or codebook, state, nonzero-repeat behavior and a held-out original plaintext prediction.

## Source register

- Parker Hitt (1916), *Manual for the Solution of Military Ciphers*, Chapter VIII and concluding cipher inventory: https://www.gutenberg.org/files/48871/48871-h/48871-h.htm
- M. E. Ohaver (25 February 1928), *Flynn's*, “Solving Cipher Secrets,” Cipher No.136: https://toebes.com/Flynns/Flynns-19280225.htm
- Jian Luo (1 August 1996), *M-ary run length limited coding*, RIT thesis: https://repository.rit.edu/theses/5592/
- A. Iketani et al. (1998), *A Systematic Construction Method of Run Length Limited Codes*: https://doi.org/10.3379/jmsjmag.22.S3_39
- O. F. Kurmaev (2001), *Coding of Run-Length-Limited Sequences*: https://www.mathnet.ru/eng/ppi525
- O. F. Kurmaev (2011), *Enumeration of constant-weight run-length limited binary sequences*: https://m.mathnet.ru/php/archive.phtml?jrnid=ppi&option_lang=eng&paperid=2039&wshow=paper
- Géraud-Stewart and Naccache (2020/2021), *A French cipher from the late 19th century*: https://eprint.iacr.org/2020/390.pdf
- George Lasry (2023), *Analysis of a late 19th century French cipher created by Major Josse*: https://doi.org/10.1080/01611194.2021.1996484
- Original-cipher GP29 first-order secret-feedback bound: [source report](lp2-cipher-feedback-conditional-entropy-gate.md).
