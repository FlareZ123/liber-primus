# Nonlinear cubic-center nearest-neighbor GP29 inverse: exact recovery and forward repeat gate

**27 November 2026 — Agent1. Decision:** retire the exact unclocked symmetric cubic-center receiver tested on p54–55. Three independent source-native held plants recover the full key and all 924 runes, but the original fit/continuation is nonprose. A separate exact necessary condition excludes the broader normalized cubic-center sender against every contiguous length-3008 window in the three pinned literary registers. No authentic unknown plaintext, key, or new source-selected operation.

## Mechanism and reason for testing

The original repeated half-turn art and historical GP29 arithmetic motivate exploring two-neighbor mechanisms; the p15 recurrence and conditional cube/DH reading make a cubic center a finite nonlinear alternative. **Neither cue actually selects the law or coefficients.** The prior [rank-one product obstruction](lp2-two-sided-rankone-noninjectivity.md) relies on zero factors; this additive outer-neighbor construction avoids that specific defect. It is not the [linear tridiagonal law](lp2-forward-tridiagonal-repeat-gate.md) or a polynomial of previous ciphertext alone.

Fix a symmetric neighbor pair:

    C_i = P_(i-1) + b*P_i^3 + P_(i+1) + d mod29, b in GF29*, d in GF29.
    P_(i+1) = C_i - P_(i-1) - b*P_i^3 - d mod29.

Given both initial runes L=P_(-1) and P_0, the recurrence uniquely gives the plaintext and terminal R=P_n. The state update (prev,cur)->(cur,C_i-d-prev-b*cur^3) is a permutation of the 841 pair states for each C_i. This proves reversibility of the augmented-state transformation, not of every fixed-endpoint finite-frame sender: if only L,R are supplied, 29 candidate P_0 values must be checked; multiple may survive. Three actual native plants have respectively 3,1,2 such paths under their true key and both known boundaries. No original source specifies either seed, so the search grants both freely. No F-bypass, printed-word semantics, or resets.

## Exact original-cipher inverse

Train a fixed conditional trigram on the full 62,492-rune source-calibrated Gibran control (smoothing 0.5). Use the existing calibrated orthography (ING, IO, QU→CW, etc.). Three controls are 308-rune excerpts from solved reference sections 3,6,10–13 with zero-based starts 40,120,70 respectively. For each, and the original complete p54+p55, exhaust all 28×29³=682,892 possible (b,d,L,P_0) states. Fit ONLY plaintext offsets 0..231, generated from ciphertext offsets 0..230; score 230 conditional trigrams. Freeze the winner before using C_231 and the p55 ciphertext to decode the remaining 76 runes. The true keys never enter model selection; truth is used solely for ranks and accuracy. The held score includes context from the last two fit runes.

| Input | True / best (b,d,L,P0) | Fit log-score/rune | Held log-score/rune | Recovered |
|---|---|---:|---:|---:|
| Native p3 excerpt | 7,19,4,4 | -2.346200502 | -2.393664456 | 308/308; held76/76 |
| Native p6 excerpt | 23,3,16,24 | -2.205524458 | -2.181647842 | 308/308; held76/76 |
| Native p10–13 excerpt | 11,9,22,23 | -2.582295400 | -2.456483035 | 308/308; held76/76 |
| Original p54–55 | 28,9,3,1 (fit only) | -3.631353394 | -3.823449560 | nonprose |

Each search has one best key; all plants rank the true key first. Replay all 308 ciphertext glyphs exactly using terminal R=13,25,6,14 respectively. Exact replay is automatic for this inverse with freely inferred R; it is not key evidence. The original winner is not an authentic key. Its complete 76-rune continuation, rendered in chart tokens, is:

    S L Y NG X A EO U D AE G L T U W I IA F B L R W E L S I M I AE D EO M W R J R IA IA F T AE J NG W TH R F EA H I S TH M E I TH W EA A X T TH IA EO O J P EO X TH EA J F I OE R

Original p54/p55 repeat count 3; plant counts 8,5,8. The plants are native-length and content controls, not repeat-matched controls. Held scores well below native controls under this exact fit law. No claim that all possible ordinary English must exceed the chosen trigram scores.

## Broader exact necessary condition

Grant nonsymmetric neighbor coefficients, all nonzero center coefficients, arbitrary additive constant and arbitrary endpoints:

    C_i = a*P_(i-1) + b0*P_i^3 + c0*P_(i+1) + d, a,b0,c0 nonzero.

Scale all ciphertext by a^-1, preserving equality; write b=b0/a, c=c0/a. For four consecutive interior plaintext runes x0,x1,x2,x3, two interior ciphertext runes are equal iff

    (x1-x0) + b*(x2^3-x1^3) + c*(x3-x2) = 0 mod29.

Each length-3008 donor window has exactly 3005 such interior comparisons. The two boundary comparisons can only add repeats, whatever the endpoints; original p40–53 has just 18 adjacent equalities. Rolling counts exhaust all 784 normalized keys and every contiguous start in the three native-GP corpora. No word assumptions are needed.

| Reference | Runes | Windows | Minimum interior repeats (all b,c) | Symmetric c=1 minimum | Key/window pairs ≤18 |
|---|---:|---:|---:|---:|---:|
| Gibran | 62,492 | 59,485 | 34 | 63 | 0 |
| Shakespeare | 217,106 | 214,099 | 50 | 53 | 0 |
| Emerson | 321,327 | 318,320 | 34 | 63 | 0 |

Exact minimum witnesses (b,c,start): (27,28,50802), (18,15,203200), (27,28,310111). Thus 591,904 windows ×784 normalized coefficient pairs, zero survivors. This excludes the full named forward family under the finite contiguous donor envelope, even if its finite-frame boundary map is nonunique. It does not exclude longer history, nonstationary clocks, F-holds, more general cubic polynomials, novel plaintext, or arbitrary pre-encryption transposition. No further parameter tuning on the negative p55 score is justified without an independently selected source operand.

## Reproduction

[SFT](../sims/lp2_cubic_center_neighbor_sft.cjs) prints complete controls, keys, fit/held scores, replay and all repeat minima. Both computation cores were executed in the connected V8 runtime using exact current source file contents; the Node wrapper uses the existing source-native encoder and was not separately executed. Inputs: canonical LP2 blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, solved reference blob 8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d, Gibran blob df260a07d56bf5998d40a6360b6132c35c252d10, repository-pinned Shakespeare and Emerson control files. The report and SFT are intentionally in intermediate results rather than authoritative plaintext.
