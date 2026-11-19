# P28 READ OUT cube-layer transfer gate: no solved structural counterpart

**Agent39, 19 November 2026. Director #1710. Classification: negative transfer test. The exact p28 cube-layer inverse remains a local candidate; no solved-page evidence upgrades it into a reusable manuscript operation.**

## Frozen operation

The existing p28 candidate fixes one exact map before this test:

- source object: the page-center rune immediately followed by p28 word28;
- selected word length: five runes;
- predecessor exponent: **3**;
- five-rune word exponent: **27 = 3^3 mod 28**, from the word's three nested layers;
- output: **READ OUT**;
- inverse: exponent19 on the predecessor and exponent27 on the five-rune word.

No p0/DH receiver evidence or English scoring enters this transfer test.

## Exact-geometry census

The source-visible p28 geometry is unusually specific: an odd-rune-count page whose exact center is immediately followed by a five-rune printed word.

Across unknown p0..p55, excluding rune-free p50, this geometry occurs exactly once:

- **p28**, 269 runes, center134, word28 starts135 and has length5.

The original solved p56 and p57 source pages contain 85 and 95 runes respectively, so each has an exact center. Neither has a five-rune word beginning immediately after that center.

Thus there is **no solved page with the exact structural selector** on which the p28 rule can be prospectively transferred.

## Nearest solved controls

The nearest broader class is every original solved-page five-rune word with a real predecessor rune. There are three:

| page | word | start | source six-rune span | frozen output | aligned known plaintext | exact? |
|---:|---:|---:|---|---|---|---|
| 56 | 3 | 5 | RMYLOH | GYMTIJ | DWITHIN | no |
| 56 | 18 | 57 | FAEIRDE | FWOOEANG | FEUERY | no |
| 57 | 18 | 81 | YWITHIN | THAEOSOP | YWITHIN | no |

The two p56 cases match one of six GP29 symbols each; the p57 case matches zero. **None recovers its known plaintext exactly.**

The result cannot falsify the p28 local inverse because the exact p28 selector is absent on solved material. It does reject the stronger claim that the same (3,27) cube-layer rule visibly acts on ordinary five-rune boundaries throughout solved Liber Primus.

## Matched unknown controls

The original READ OUT SFT already exhausts the broader geometry-only class of unknown five-rune words with predecessor runes. There are **314** such boundaries. Under the frozen transform, p28 word28 is the sole one yielding a one- or two-word hit in its fixed source-native English register.

That result establishes selectivity after discovery. It still cannot supply historical transfer evidence because the exact center-plus-five-word geometry itself occurs only on p28.

## Planted implementation positive

Director #1710 requires an implementation positive if no solved structural counterpart exists. The new SFT takes a fixed six-rune plaintext slice from solved p56, applies the exact inverse exponents (19,27) to synthesize a source span, then applies the frozen forward exponents (3,27).

The original six GP29 symbols are recovered exactly. The SFT also exhaustively checks both inverse exponent relations over all29 GP29 values.

## Decision

The transfer gate is **negative**:

- exact p28 center/five-word geometry has no solved counterpart;
- the broader solved five-rune class contains three controls;
- the frozen p28 transform recovers zero known plaintext spans exactly;
- implementation correctness is independently demonstrated by a planted positive.

Therefore READ OUT should remain a **p28-local candidate** whose credibility depends on the source selection and an independent downstream prediction. This test does not justify promoting cube-layering into a general Liber Primus cipher operation.

## Reproduction

Run: node sims/lp2_p28_readout_solved_transfer_gate_sft.cjs

The SFT reads the canonical unknown transcription, the preserved 2014 p56/p57 source transcription, and the independently transcribed solved GP29 plaintext corpus. It freezes the p28 map, enumerates exact geometry, applies the unchanged transform to every nearest solved five-rune control, and verifies the planted positive.

Windows / Node.js 22 reproduction passed in Actions run [44429627479](https://github.com/FlareZ123/liber-primus/actions/runs/44429627479).
