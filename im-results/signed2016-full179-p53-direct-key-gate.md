# Canonical signed-2016 full 179-GP length versus original LP2 p53

**Decision: retire this exact-length match as a direct GP29 additive key route.** The source-length arithmetic is reproducible, the tested six original-cipher inverses fail, and neither the signed instructions nor the manuscript prescribe this use of the text. No unknown plaintext, authentic key, full mechanism or destination is recovered.

## Original source and precise candidate

The fully preserved, 2016 GPG-verified [signed OutGuess message](../resources/historical/cicada2016-4gq25-outguess.asc) consists of seven prose paragraph units, from `Hello.` through `Beware false paths. Verify OpenPGP 7A35090F.` The canonical rune mapping uses `TH` and `EA` as GP digraphs, `K→C` and `V→U` for absent English letters, while retaining ordinary separate `I+NG` and `I+O` rather than the unselected ING/IO aliases recently [retracted for a 59-rune count](signed2016-59prime-p29-selector.md).

On that mapping the **whole signed cleartext body**, excluding packet framing, signature and numerals but retaining the letters **A/F within the final hexadecimal OpenPGP identifier**, has **exactly 179 GP symbols**. Physical unsolved LP2 **page53 uniquely has 179 original runes** among all 56 unknown pages. This suggests a simple, cheap original-cipher test: interpret the canonical signed 179-symbol text as a one-to-one page53 keystream.

**Strongest objection:** a player might properly treat the hexadecimal key ID as metadata rather than GP prose. Excluding `7A35090F` entirely reduces the key to **177 runes**, for which **no unknown page has a matching rune count**. The original text does not direct solvers to include the A/F hexadecimal letters, use rune-count matching, or take the 2016 message as an encryption key. This interpretation was also noticed after corpus-page lengths were already known, so the numerical agreement is postselected.

## Frozen reversible original-cipher consumers

Take the exact p53 rune values `C[0..178]` in printed order; choose the exact 179 matching signed source rune values `K[i]`. The signed message's word-number phrasing and the already solved p56 phi-prime cipher motivate exactly **three natural GP29 numeric representations** of each key rune:

- Its GP ordinal `K[i]` in `0..28`.
- Its printed GP prime weight `p[K[i]] mod29`.
- The corresponding prime totient `(p[K[i]]−1) mod29`, the known solved p56 key operand.

For each numeric register test both reversals `P[i]=(C[i]−k[i]) mod29` and `P[i]=(C[i]+k[i]) mod29` starting at the first page53 rune, with no fitted offset, state, page boundary manipulation, key skip, guessed phrase or language optimization.

| Signed-message numeric register | Minus-key p53 IoC | Plus-key p53 IoC |
| --- | ---: | ---: |
| GP ordinal | **0.0314481200** | **0.0339589480** |
| GP prime weight | **0.0349632791** | **0.0359048396** |
| Prime totient | **0.0349632791** | **0.0359048396** |

The unchanged original p53 GP-index collision index is **0.0335195531**. The independently solved original p57 message has **IoC 0.0627099664**. All six candidates remain close to the uniform GP29 baseline `1/29≈0.03448`; none begins with coherent native-GP language or yields a recognized instruction.

Every decoded original candidate re-encodes to all **179/179** exact original ciphertext runes. All six variants also recover **179/179** original-source GP symbols from synthetic ciphertext generated from genuine solved p57 runes. The positive controls establish the inverse's correctness without authenticating the key interpretation.

## Decision and relation to current routes

The **179/179** count deserves no further direct additive key search. It is structurally weaker than a key instruction because it hinges on counting A/F in a numeric fingerprint. The whole-source trial differs from earlier selective 2016-word, Fibonacci-source, 2013/H/G, or p50 TEA probes, yet it has the same plaintext failure. Absent a creator-side directive selecting the signed body as a running key and specifying a different reversible operation, the bounded family is closed.

The separate original p53 **179 + p54 one enlarged symbol + p55 76 = 256** terminal-frame geometry remains an independent observation; this source-key gate does not validate or refute proposed table linkage through that frame.

**Reproducer:** [`sims/signed2016_full179_p53_direct_key_sft.cjs`](../sims/signed2016_full179_p53_direct_key_sft.cjs) (Node.js 22, built-in-only CommonJS), reading `resources/liber-primus/lp2-corpus.json` and the archived signed 2016 source. Exact source, original-input and plant controls passed in [manual GitHub Actions run 43063788179](https://github.com/FlareZ123/liber-primus/actions/runs/43063788179) via the `signed2016-p53-179` option in [`2016-message-prime-layers.yml`](../.github/workflows/2016-message-prime-layers.yml).
