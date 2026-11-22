# Floral 13/31 p50 left33 source stream as a p55 exterior→interior two-stage decoder

**Agent 2, 22 November 2026. Original-cipher bounded negative under a fixed recently discovered clue path.** This tests a genuinely different source route from the earlier literal self-key p55 exterior decoder: [Agent12's red floral 13/31 p50 graph pointer](lp2-floral-red13-31-bookend-p50-p55-navigation.md) supplies an independent 33-position source key stream. No actual unknown LP2 plaintext or source-authenticated cipher key emerges.

## Human solve-path premise

P57's clear instruction to **“shed our own circumferences, find the divinity within”** and the original p55 printed word lengths suggest treating word exteriors as a cipher register for the strict interiors. Original p55 has **76 runes**, split unambiguously under this proposed rule as **33 first/last word-exterior runes** and **43 strict interior runes**, including the one-rune carry from p54. Source word lengths and both exact streams were independently reconstructed before this test.

The red heading motif on source physical pp40/53 recently selected 13/31, yielding original p50 base59 graph seeds110/251 under that hypothesis. Left walk has **33 consecutive distinct nodes** before reaching fixed189:

```text
110 32 113 141 45 105 62 122 85 28 148 242 41 83
190 167 244 22 58 144 123 53 168 236 234 193
153 33 112 72 161 214 247
```

The right seed251 reaches the same node72 after two hops and joins the final route through161,214,247,189. The joined node72 is independently also source scan **`72.jpg`**, which is physical LP2 p55 in the original May 2014 full-image 00–74 enumeration. This scan-index observation was recognized after the graph merger and does not authenticate it as the intended pointer. The source-selected p57 **60→59 SHED** numeral-state transition is a conditional separate motivation for this **post-SHED** base59 graph; p29/p39 GF29 double-root24 still selects base60 for an earlier possible phase.

The important improvement over earlier all-self-key p55 tests is a **specific source-generated 33-symbol stream** capable of transforming the exteriors into an independent unknown key or plaintext register. This test does not require the exterior output to be readable before the second stage.

## Two-stage reversible transport and native receiver

For each left source node `t_i` at path index i=0..32, freeze three simple source-bearing GP29 projections: the node's original address `t_i mod29`, its printed base59 **emitted byte** `table59[t_i] mod29`, or its originally source-defined **SHED difference** `(table60[t_i]−table59[t_i]) mod29`. Freeze both `±` additive signs per stage, with no fitted alphabet, key phase, offsets, word clock or guesses. First recover all33 exterior symbols:

```text
outerPlain[i] = (outerCipher[i] ± source33[i]) mod29
```

Then treat all33 outputs as a possibly high-entropy **unknown key** for the 43 strict interior runes, in original source order, cycling once after position32:

```text
innerPlain[i] = (innerCipher[i] ± outerPlain[i mod33]) mod29
```

That specifies **three source quantities × two first signs × two second signs = 12 full original76-rune, reversible transformations**. Their source red/p55 counts and stage alignment are fixed; all original output ciphertext values are independently replayed exactly. To verify the construction could work, each model also plants a distinct complete native positive: source-valid original clear p57 43-rune interior text, source-valid 33-rune shell (with the exact five original two-rune printed word positions populated by attested `IN`), then encrypts and decrypts both registers. **12/12 two-stage plants return the exact source plaintext**, and all 12 return **76/76 original rune ciphertext** when replayed.

## Original output

The previously recognized five complete **two-rune words** on p55 are *entirely exterior positions*, at original p55 offsets5,7,21,46,62. If the model decrypts whole source-preserved English words, all five exterior outputs must independently form native-GP two-rune English tokens. Compare them against four pinned, independently encoded source corpora: Shakespeare, Gibran, Emerson, TextBlob. No cipher outputs all five correctly.

| Stage1 source stream | Additive sign | Five original exterior two-rune outputs | Number attested in at least one independent English corpus |
|---|---:|---|---:|
| Left-node address GP residue | − | MU, AES, YNG, PJ, EOX | **0/5** |
| Left-node address GP residue | + | JR, OD, BT, JAE, NGU | **1/5** |
| Base59 emitted byte GP residue | − | EAEA, IP, AH, CD, DE | **2/5** |
| Base59 emitted byte GP residue | + | THG, EAE, MF, MP, IY | **0/5** |
| Literal p50 SHED-difference | − | XS, PB, GO, IB, FOE | **2/5** |
| Literal p50 SHED-difference | + | TM, SNG, HC, XM, ROE | **3/5** |

The exact **12 original interior GP43 outputs** are printed by the SFT. All remain nonlinguistic. Their IoC range is **0.02436–0.04651**, with maximum under address stream (+,+) giving:

```text
CNTBIACNGTJROBUDEPBDPOTNOLUFPIALXTHCJIAUGFOPPYCB
```

This is not recovered English even though the source stream had no fitted parameters.

If the exterior outputs were instead an intentionally **unreadable binary key**, failure of the five word checks alone would be irrelevant; however, the independently decrypted **inner43** also lacks convincing plaintext under either second-stage sign. Thus neither plausible consumer interpretation succeeds with these fixed original operations.

## Decision and scope

Retire this **12-case source-defined left33→p55 exterior33→inner43 sequential additive transport**, keeping the original graph, scan72 join and native33/43 split as hypotheses rather than declaring any of them a key. An independent first-party transformation defining the 33-byte register, nonadditive alphabet update, or authentic external key would be required before expanding this branch. The source graph's 33/43 matching is a plausible human heuristic with a weak retrospective premise; this experiment does not demonstrate intentional authorship or recover unknown plaintext.

**Reproducer:** [read-only original and planted-source Node22 test](../sims/lp2_floral13_31_left33_p55_two_stage_original_sft.cjs) · [Windows CI PASS run44995370758](https://github.com/FlareZ123/liber-primus/actions/runs/44995370758). The earlier [direct exterior-self-key negative](p55-exterior-interior-direct-selfkey-gate.md) and [five two-rune words obstruction](p55-original-33-exterior-43-interior-source-framing.md) establish the original source partition but tested different key inputs.
