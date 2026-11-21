# Atbash-order +3 composed with authenticated p56 prime-totient: original p55 gate

**21 November 2026, Agent10. A finite historical two-layer inverse produces no original LP2 plaintext or authenticated key.** Original original inputs are unchanged `resources/liber-primus/lp2-corpus.json` and `lp2-transcription.txt`. Windows Node.js 22 full-source test passed: [Actions run 44959809890](https://github.com/FlareZ123/liber-primus/actions/runs/44959809890).

## Source-constrained candidate

The archived 2014 fourth-onion participant reconstruction applies the two-step reversed-GP rune lookup and +3 rotation `A(i)=(2−i) mod29`; the exact page-06 `A COAN A MAN DECIDED TO` historical control fixes direction. **The rule is community-reconstructed, not an LP2-signed opcode.**

The original solved LP2 p56 cipher is independently verified as `C=P+(prime[k]−1) mod29` at index0 for each non-F plaintext GP rune; plaintext F/0 prints as ciphertext F/0 and does not consume a prime. It is a **different authenticated operation**. The question tested here is whether a two-layer composition of these particular historically used operations could yield original page55, immediately preceding the solved p56 leaf:

```text
C_original = A(C_phi)
C_phi     = A(C_original)
P         = inverse_plaintextF_transparent_phi(C_phi), key start 0
```

This is one fixed order, one canonical native GP29 alphabet and no private phase/offset/cipher search. It is an exploratory source-inspired composition; neither stage independently says the creator combined them on p55.

## Entire original 76-rune inverse

The original page55 contains exactly **76 GP runes in 17 printed words**, whose source-native length profile is `[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. Exhaustive exact state expansion under the authenticated plaintext-F branch rule finds precisely **six** complete original-cipher inverse paths, with literal-F skip sets:

```text
[13,58,59,62], [13], [58], [59], [62], []
```

Every returned candidate re-encrypts all 76 original runes exactly. Their ordinary GP29 indices of coincidence range from **0.0312281 to 0.0371930**, indistinguishable from uniform 1/29≈0.034483 and far from the genuine clear p57 at≈0.062710. Each preserves all 17 unchanged original word boundaries, but **all six have zero complete four-or-more-letter matches** in the pinned `english_wordfreq_textblob.txt` English reference. Sample source-shaped candidate words include `RHSX RIA EAM BEEYFOE XIWEOEE`; none forms a native GP sentence. These are algebraically valid wrong-key inverses.

Crucially, a fixed **76 original-source cyclic-rotation control** (same ciphertext multiset, no fresh random generation and no fitted key) yields **27/76** complete inverse survivors, with up to nine distinct paths. The authentic p55 offset0 has six paths. Thus bare mathematical feasibility is a weak event for a 76-rune packet under this rule; it is not evidence for plaintext.

## Exact authentic and planted positive controls

The same implementation takes independently established clear p56 `AN END WITHIN ...` and re-encrypts it **85/85** into unmodified original p56 glyphs under the actual prime/F rules. It then takes the original clear p57 **95 GP29 runes**, adds prime/F encryption and A, and recovers the entire genuine native-GP plaintext (95/95) under the same inverse. This discriminates implementation errors from source failure.

**Decision:** The locked two-layer A∘φ candidate for p55 produces **zero** unknown-page plaintext even though six formal inverses exist. Retire this particular source-inspired composition, including the temptation to pick an F-mask or extra transposition by word scores. Other creator-selected operations and missing keys are untouched by this test.

[Complete deterministic Windows-compatible CommonJS SFT](../sims/lp2_2014_atbash3_p56_phi_p55_sft.cjs) · [Passing Windows original-source Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/44959809890) · [Historical Atbash+3 source-strength and direction control](lp2-p0-red-dropcap-atbash3-message-gate.md).
