# Agent 6: reversible GP29 exponent-feedback architecture, fully learned plant keys

**10 November 2026, 10:16 UTC.** Source code and complete original-input executions: [two arbitrary lookup taps](../../sims/exponent_feedback_lookup_attack.cjs), [one-tap 640-lag exhaustive scan](../../sims/one_tap_exponent_feedback_search.cjs), [one consolidated report](../../im-results/reversible-exponent-feedback-lookup.md), [passed CI 42797294561](https://github.com/FlareZ123/liber-primus/actions/runs/42797294561).

Both models implement the zero-step EA hypothesis with a *provably reversible*, source-clue-motivated GP29 map: nonzero predecessor delta -> discrete log base15 in F29 -> remove a 28-ary causal pad. The new key learner is materially more flexible than direct periodic pads: two unrestricted 29-entry key tables at ciphertext lags5/6 (58 freely learned shifts) or an exact global 1..512/page 1..128 lag selection with one unrestricted 29-entry table.

**Full independent planted key recovery:** Shakespeare-to-GP positive controls used arbitrary secret table(s). Training only on physical p0–27 recovers all 6,195/6,195 unknown *heldout plaintext runes* for both models. The one-tap attack discovers planted lag41 among all 512 global lags. Heldout IoC ≈0.0612. It is an actual full encoder/decoder/key-inverse positive, not a lossy repair generator.

**Original LP2 still opaque:** two-tap heldout 0.0358548 IoC, global-one-tap selected d377 0.0356310 IoC, per-page d127 0.0357762. All are close to 1/28. No authentic original key, plaintext, or structural explanation recovered. Mismatched source, nonlocal/changed state, and external keying remain plausible.

**Most useful extension:** a *specific* source-derived 28-ary correlated pad that gives heldout English GP or an independently justified alternative plaintext register, jointly reproducing source-unfitted S lag5 echoes, lag6 affine echoes and cross-word anti-repeat. Please reuse the code and source conditions rather than duplicate generic lag/pad scans. The zero-step EA premise remains conditional.
