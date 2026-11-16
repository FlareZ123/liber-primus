# P55 shed-circumference two-register inverse: frozen original-cipher negative

**Classification (16 November 2026): one reversible original-input decoding model, not an authenticated Cicada cipher.** The exact candidate recovers no original LP2 plaintext, key, or destination. This is the bounded decision for [Director Issue #1261](https://github.com/FlareZ123/liber-primus/issues/1261).

## Source premise, rival, and 76-rune commitment

The clear original LP2 p57 PARABLE says, “We must shed our own circumferences. Find the divinity within and emerge.” Physical p55 in original `72.jpg` has 76 GP29 runes. Its first page-local one-rune fragment continues a word across the p54–55 boundary; there are then exactly 16 complete printed words. The source-audited segment lengths are `[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. Treat the first/last runes of complete words plus the carry singleton as an exterior register **E (33)**, and strictly internal runes as **I (43)**; original order and full interleaving are retained. The source corpus indices, exterior 33, interior 43, and SHA-256 of the 76 original index bytes (`9a991437b541673c35cca0ba877eddee719c6fad7ec68c495100d2e27c61529f`) are asserted in the SFT.

The competing explanation is that the p57 phrase is a spiritual instruction whose word geometry does not specify a cryptographic operation. The page supplies no explicit double-register clock or subtraction. This experiment is consequently an **exploratory, source-motivated** test of one simple reversible mechanism, not an author-selected decoder.

## Frozen, entirely specified decoder

Let `C_E[0..32]` and `C_I[0..42]` be the two ordered ciphertext registers. Work in GP29 integers 0..28, with no secret seed, phase, other corpus key, or permission to discard symbols. The decoding sequence implements “shed the exterior, then recover the interior” as two additive triangular passes:

1. `P_E[i] = C_E[i] - C_I[i] (mod29)` for `0 <= i < 33`.
2. `P_I[j] = C_I[j] - P_E[j mod33] (mod29)` for `0 <= j < 43`.

The ten extra interior positions use the same decoded exterior register cyclically. Original p55 source order fixes both stream orientations, and both clocks start at zero. This is bijective with a unique inverse: first `C_I[j] = P_I[j] + P_E[j mod33]`, then `C_E[i] = P_E[i] + C_I[i]`. Interleave at all 76 original positions. It is a two-stage deterministic additive cipher with no hidden key, unlike already tested direct exterior-to-interior one-pass masks, period-19 p57 key candidates, and the p50 polynomial register.

## Original output and source-native control

Running the standalone [CommonJS original-corpus SFT](../sims/lp2_p55_circumference_two_stream_feistel_sft.cjs) yielded:

```text
Recovered exterior 33:
THSANDEONGLHATHWMWOEEARYLIAPNGLTHDITRBTJA
Recovered interior 43:
BABYFMGRNIYOEAOYEOINJUOETHTHWJXTHTHGEIAALITWNCIAIAXOD
Recovered all 76 in original printed-word slots:
TH SBAA ND EONG LBYFMH AGRNITH WM WYOEAOYEOINJUOEOE ETHTHWJA RXTHY LIA PTHGEIAANG LLITWNTH DI TCIAIAXR BOT JDA
```

These are literal GP29 *inventory-label* transliterations: `TH`, `NG`, `IA` and `EO` are each one rune, so Latin character length must not be mistaken for rune length. There is no complete intelligible plaintext message or original p54–55 sentence.

| 76-rune register | GP29 index of coincidence |
| --- | ---: |
| Original p55 ciphertext | 0.037894737 |
| Frozen two-stream decoded p55 | 0.036140351 |
| Independent original clear p57 first 76 source runes | 0.059649123 |

Both negative and positive correctness invariants are exact: **76/76** original ciphertext symbols are recovered by re-encrypting the decoder output, and a separate original clear p57 76-rune sequence encrypted under the defined forward mechanism is recovered **76/76** by the inverse. Since all bijective key choices round-trip, this verifies the implementation but does not authenticate the proposed decoder; the absence of a coherent 76-rune message is the substantive negative result.

## Resulting decision

Retire this *one exact*, source-aligned, reversible `33→43` additive triangular receiver. Preserve the original 33/43 geometry as an observation. This test does not refute every two-stream cipher, all meanings of “shed circumferences,” or an original key encoded elsewhere. In particular it supplies no basis for trying new ad hoc phases, alternate symbols, or nonlinear layers on the same output. To justify another p55 decoder, seek an additional first-party source clue selecting its operation or a **complete independently identified original plaintext crib**; Director #41 remains waiting for that stronger handoff.

No overall result-synthesis change is warranted: the 56 unsolved physical pages remain undeciphered.
