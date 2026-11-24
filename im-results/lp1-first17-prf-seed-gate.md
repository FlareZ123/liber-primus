# LP1 first-release material as a deterministic PRF seed: bounded negative

**Agent20, 24 November 2026.** This tests one participant-suggested first17-derived key route. It does not establish that the creator intended LP1 to seed LP2, and it recovers no unknown plaintext.

## Motivation and weakest premise

A January 2016 discussion includes a participant's suggestion involving “560.17” and “the first seventeen pages.” The adjacent 10 January post conjectures that the first17 decipher the last57, but neither message is a Cicada-signed instruction or fixes a key derivation. The historical source audit therefore treats LP1-first17 → LP2-last57 as participant speculation, not an author-selected route. This experiment asked whether a tightly bounded, conventional PRF expansion of the LP1 first-release transcription could nevertheless yield the LP2 key stream.

The LP1 input is the canonical source transcription at resources/transcriptions/lp1_wulfic_canonical.txt, interpreted with its established seven-section partition, known section recipes, and F-hold patches. The resulting two seed serializations were fixed before testing:

| Seed | Construction | Length | SHA-256 |
| --- | --- | ---: | --- |
| lp1-gp-prime-runes-mod29 | Each of 2,797 recovered LP1 rune positions mapped to its GP prime value, then reduced mod29 | 2,797 | 0e6c4fb3efacd4b96de132ceb61f21195f13c7055760110480b01cf0b54bbbd4 |
| lp1-gp-prime-runes-plus-39-numbers-mod29 | Same rune stream with the 39 printed decimal tokens included, each reduced mod29 | 2,836 | 22aded5a12218d5f37cc00152739ed14f8a2f018d1072a58c8ad51668c8a441d |

These are derived inputs, not newly authenticated plaintext keys. Their exact Git blob identities and construction are emitted by sims/agent20_lp1_first17_sha_prf_skipaware.py.

## Frozen test

The pinned decoder is Dukotah/cicada3301 commit f63501d8f2d835b80c30230eb89a1110fb9197d2, Campaign XVIII collision-key-skip additive GP29. The test used:

- SHA-256 counter, SHA-512 counter, HMAC-SHA-256 counter and HMAC-SHA-512 counter expansions (the shared helper's fixed 8-byte big-endian counter);
- byte mod29, both additive signs, phase/offset zero;
- one continuous key/collision clock across all 55 rune-bearing unknown pages (p0–p49 and p51–p55), 12,956 runes;
- no arbitrary salt/offset search, reverse stream, Atbash, page resets, or additional seed dictionary.

This gives exactly 2 seed serializations × 4 generators × 2 signs = 16 candidates.

## Results

All 16 candidates produced legal, exactly re-encryptable p0 screen-prefix paths under the 400-wide beam. Their best p0 scores were poor; the top four were:

| Candidate | Sign | p0 score | End cursor | Skips |
| --- | ---: | ---: | ---: | ---: |
| LP1 rune-only / SHA-512 counter | −1 | −6.94527397 | 90 | 0 |
| LP1 rune-only / HMAC-SHA-256 | −1 | −6.95620023 | 94 | 4 |
| LP1 rune-only / HMAC-SHA-256 | +1 | −7.02576260 | 92 | 2 |
| LP1 rune-only / SHA-256 counter | +1 | −7.09160351 | 94 | 4 |

The four strongest p0 candidates were then decoded over the full 12,956-rune stream with beam width 500. None had an exact full-stream re-encryption path. Their full-stream scores were −7.292220, −7.287820, −7.353063 and −7.318424 respectively; previews were nonlinguistic rune transliterations. The other 12 candidates were not full-stream decoded. Thus this is a bounded rejection of the screened top candidates, not an exhaustive full-stream test of all 16.

The generic decoder control recovered its planted plaintext exactly. All four derived-PRF controls also recovered exactly, with 5, 5, 5 and 9 planted skips respectively. The negative result is not explained by a broken PRF expander or a decoder that cannot handle those four counter families on a known plant.

Reproduction: run the existing manual workflow at .github/workflows/agent20-lp1-first17-sha-prf-skipaware.yml with seed_source=lp1-first17. The completed [GitHub Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/45386890955) uploaded the raw JSON artifact agent20-lp1-first17-sha-prf-skipaware.

## Decision

Do not continue tuning these exact two LP1 seed serializations against these four PRF families, signs and phase-zero continuous clock. They produced no credible plaintext and the strongest full-stream candidates failed exact replay. This does not exclude other LP1-derived operations, other source-selected keys, or the separate p49–51 grid-as-seed hypothesis. It also does not authenticate the historical “first17” suggestion. The upstream missing input remains an author/source-visible rule that selects the LP1 material, LP2 receiver, and reversible operation together.

Related source decisions: [2016 adjacent-message audit](lp2-2016-first17-adjacent-source-artifacts-gate.md) · [LP1 typed-method transfer gate](lp1-first17-typed-method-transfer-original-source-gate.md) · [560.17 p0–p16 XOR negative](lp2-2013-56017-p0-p16-fivebit-xor-negative.md).
