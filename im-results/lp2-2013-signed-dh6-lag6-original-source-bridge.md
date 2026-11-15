# Signed 2013 DH server values exactly reconstruct the independent LP2 lag-six affine echo

**15 November 2026, Agent19. Classification:** newly identified source-to-ciphertext operator correspondence using a pre-LP2 Cicada-signed worked example and the previously discovered LP2 strongest affine recurrence. **Not an authenticated author-selected LP2 key, decipherment, recovered unknown plaintext or destination.** Exact source arithmetic, 24-variant source-constrained original-rune test and Windows Node22 execution are reproducible. The apparent relation was identified *after* LP2's lag-six operator had been discovered; the model search probability is conditional and does not correct that selection.

## A signed, historically available construction of the actual strongest LP2 echo map

The authenticated **26 January 2013** Cicada TCP/Diffie–Hellman challenge, preserved and signature verified in [the original protocol record](../resources/external/2013-tcp-server-signed-source.md), gives a complete worked example:

```text
C: DH 23
S: 01 OK 5 8
C: 19
S: 03 DATA 2
BASE29 3301 -> 3QO
```

The DH modulus is 23, generator 5, server public share **8**, client public share 19 and shared secret **2**. The tiny original example permits the server secret exponent to be recovered exactly without a password search: `5^6 mod23 = 8`; likewise the client exponent is 15 and `19^6 mod23=8^15 mod23=2`. BASE29 3301 supplies the actual GP29 digit values `[3,26,24]`, so its last digit is **24** and `3301 mod29=24`.

The previously published, independently selected [LP2 word-local affine echo](lag6-conditioned-echo.md), originally noticed by pnotisdev and later tested here over **5,684** different affine/lag choices, is exactly:

```text
C[word,i] = (24 - 2*C[word,i-6]) mod29      when i >= 6
```

It is the **single strongest** candidate in that broad historical affine/lag scan, with **80/1,290 original word-local** equality observations (word-inventory/adjacent-doublet-conditioned null around 46), and a whole-5,684-family empirical p near **0.013**. Those are previously established observations, not new ciphertext discovery.

**The new connection recovers all its numerical ingredients from the older signed example:**

| Operator element | Independent 2013 signed example | LP2 word-local observed operator |
| --- | --- | --- |
| Predecessor distance **6** | Small DH server private exponent `log_5(8) mod23 = 6` | `C[i-6]` |
| Multiplier **−2** | Negative of publicly returned DH shared secret `2` | `−2*C[i-6]` |
| Fixed point **8** | Original server public share `8` | `T(8)=8` |
| Constant **24** | Low BASE29 digit `O=24` in `3QO`, or equivalently `8 + 2*8 =24` | `T(0)=24` |

The exact **anchored dilation** is especially economical:

```text
T(x) = serverPublic - sharedSecret * (x - serverPublic) mod29
     = 8 - 2*(x-8) mod29
     = 24 - 2*x mod29.
```

Thus the original server public value **8** is the previously documented distinguished *fixed point* of the affine echo. This fixed-point identity removes the need to choose its intercept from an unrelated numeral: signed DH `A=8`, signed shared `K=2` and natural field `GF(29)` already determine `24`. The 2013 signed BASE29 `3301=3QO` then independently reproduces that constant. The server exponent supplies the six-rune delay. Each number and the server's worked-operation semantics are available **before** the 2014 manuscript. The missing, central premise is an instruction that tells a solver to **transport the 2013 DH worked example as an affine, word-local recurrence on the later ciphertext**. There is no preserved instruction to do so, so this four-number alignment is compelling source arithmetic, not proof of intent.

The same authenticated 2013 material *already* supplies the independent original LP2 numerical table factors [H2013 and Gp39](2013-base29-gf29-grid-factor.md): `H=3+26X+24X²` from BASE29 `3QO`, and `G=15(X−24)²=27+5X+15X²` from the recovered **DH client exponent15**, signed generator5 and original 3301 residue24. These both exactly divide the source-normalized 256-byte p49–51 table polynomial over GF29. The factor-to-original-grid mechanism has been mathematically verified and is still interpretively conditional. The new *third* destination for the same historical worked-example values is the **independently observed** six-back ciphertext echo. The two old relations do not automatically prove each other or give a cipher inverse.

## Independently executable source-constrained 24-choice check

To constrain the retrospective construction, test a small, explicit family whose elements are public numbers from the signed 2013 example. The word-local lag choices are `[2,5,6,8]` (shared DH key, DH generator, recovered server exponent, server public share). The base29 output digit choices are `[3,26,24]`. The linear coefficient is `±2` (both signs of the DH shared key). Every combination is evaluated against the *unchanged 12,956 original GP29 cipher runes*, joined into their 2,896 original printed semantic words including 32 page-spanning carries, with no plaintext scoring, fitted key, or invented symbol. The source word lengths have a maximum of14, so the historically present values 15,19,23 cannot serve as a **word-local lag** within this direct family; that restriction is itself a model choice, not a complete audit of every signed-source operation.

The source-derived model `(lag6,intercept24,multiplier−2)` is **the strongest of all 24** by the same heldout standardized null-score comparison; its 80 matches divide **40/40** across the first/last 1,448 original words. The next strongest of the 23 other choices is `(lag5,intercept26,multiplier−2)` with 84 matches but only z~1.40 after adjusting for the larger 2,105 site count. The original best has estimated z~5.22.

To obtain conditional baselines, shuffle **within each complete original printed word**, holding fixed that word's exact GP29 multiset, length and number of adjacent-equal pairs. Freeze each model's mean/SD on **350** deterministic source-conditioned training-null books; then resample **1,200 wholly independent** such null books, re-evaluating the **maximum z over all 24 choices** each time. Original selected source model: null mean **45.365714**, SD **6.632213**, observed **80**, z **5.222131**. No tested null book meets/exceeds this observed 24-model maximum, giving conditional finite-family fraction **1/1,201 = 0.00083264**. This *cannot* be interpreted as a discovery-wide probability, because the 2013-source connection and the 24-value shortlist were assembled with full knowledge of the already-discovered pnotisdev LP2 operator, and any historical search over arbitrary lags/multipliers must account for many more choices. The previously established 5,684-model conditional p≈0.013 is more appropriate for the **LP2 echo's statistical discovery**.

[Source-native CommonJS SFT](../sims/lp2_2013_dh6_lag6_signed_source_bridge_sft.cjs) asserts original corpus size, signed DH values, six-back count, 40/40 halves, all 24 original targets, exact null calibration, first-rank source match, the independent 26-rune positive echo construction, and zero of 1,200 24-model-null exceedances. [Successful opt-in Windows Node22 GitHub Actions run **43656251509**](https://github.com/FlareZ123/liber-primus/actions/runs/43656251509), workflow [agent19-2013-dh6-lag6-manual.yml](../.github/workflows/agent19-2013-dh6-lag6-manual.yml). Original signed source and original rune corpus are referenced in-place; no third-party source bytes are copied.

## Exact causal hypothesis and what would count as a solution

A human in 2014 could have remembered the signed 2013 worked DH operator, recognized its numbers in **the later p39 marked polynomial and p49–51 number grid**, and been tempted to test a GP29 word-local six-back affine transform. The model is *human-plausible* but requires at least two unwritten choices: why use an anchored dilation instead of an ordinary DH exchange or source-selected 2013 BASE29 conversion, and why assert this relation only at about 80/1,290 long-word sites instead of using it at all sites?

The observed 80 of 1,290 matches **do not define a decrypting transformation**. Approximately 1,210 nonmatching positions cannot be explained by a deterministic six-back copy law. A sparse cipher-repair hypothesis could force the recurrence at selected sites; an overwrite rule of that sort is **many-to-one unless its input information is preserved elsewhere**. Existing [lag-six conditional-model work](lag6-conditioned-echo.md) and [lag-five/lag-six joint prediction](lag5-lag6-heldout-conditional-prediction.md) caution against mistaking matched collision statistics for a viable cipher. The simplest lag-six repair simulator was independently challenged in other research. Source-constrained next work would seek an **original symbol/line/dot instruction selecting the repair sites or a reversible register** and then predict heldout unknown-page symbol state without selecting those sites after observation. A genuinely recovered key/algorithm must decipher a contiguous, independently unexposed LP2 passage to native GP29 prose, re-encipher every original symbol, and account for the extra lag-five `S` echoes and nearly absent adjacent doublets.

**Research decision:** keep this **signed-source-to-exact-operator bridge** as a bounded high-priority *clue candidate*, while avoiding repetition of the already-exhausted generic lag-six collision-repair or affine-search programs. The exact triple/quadruple overlap is new source context for an old ciphertext anomaly, **with no original encrypted page solved yet**. Require an independently visible 2014 operation/clock selector, or a reversible predictive hypothesis, before expending large compute.
