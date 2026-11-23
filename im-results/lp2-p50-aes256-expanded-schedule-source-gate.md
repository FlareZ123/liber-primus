# Physical LP2 256-cell table as FIPS AES-256 key schedule plus IV: exact original exclusion

**Agent4, 23 November 2026. Classification: complete source-natural, no-unknown-key arithmetic negative; 0 genuine unknown plaintext/keys recovered.**

## Candidate and its potential payoff

The original physical LP2 p49–51 32×8 numeral panel encodes exactly **256 source bytes** under the familiar two-digit base60 convention. The standardized **AES-256 key expansion** has exactly **240 round-key bytes** for 14 AES rounds; an AES block's initialization vector requires **16 bytes**. Thus the full panel fits a **240-byte AES-256 expanded key schedule plus one IV**, without padding or dropped cells. Had the schedule matched, its first **32 bytes** would have exposed a genuine 256-bit key, and the remaining 208 scheduled bytes would have authenticated that reconstruction extraordinarily strongly. This is a candidate explanation for the original table's physical 256-byte size, **not an original Cicada author instruction**.

[NIST FIPS 197 (updated 2023), Section 5.2, KEYEXPANSION()](https://csrc.nist.gov/pubs/fips/197/final) specifies that the AES-256 expanded-key words satisfy

```
w[i] = w[i − 8] XOR w[i − 1]
```

for every word position **i=8…59** except where **i mod8 = 0 or4** (the two nonlinear substitution positions). That gives **39 compulsory four-byte equations, or 156 separately checkable byte equalities**, for *every* possible AES-256 secret key. The 39-word subset needs **no unknown S-box choice, key guess, IV interpretation, plaintext, ciphertext or cipher mode**.

## Unmodified source and exhaustive finite gate

Input: [`resources/liber-primus/lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json), with its verified original 32×8 grid and exact two-character base60 tokens. Grant all 1,024 flips of the ten previously contested `I/l` glyphs, although the original high-resolution JPEG source now fixes their case independently. No other cell is changed. For every assignment, test:

1. Four fixed direct read orders of the authentic printed 32×8 table: physical row-major, whole reversal, physical column-major, whole reversal.
2. The 16-byte IV at the start or the end, leaving the other 240 contiguous bytes as the proposed AES-256 round-key schedule.
3. All 156 FIPS-mandated XOR-byte conditions for a complete AES-256 schedule.

| Scope | Exact result |
|---|---:|
| Original panel | 256 bytes (32×8) |
| Case assignments including actual source case | 1,024 |
| Physical whole-table read orders | 4 |
| 16-byte IV positions | 2 |
| **Complete source-derived candidate schedules** | **8,192** |
| Mandatory XOR byte equations per candidate | 156 |
| **Maximum byte-equation matches in any candidate** | **0 / 156** |
| **Candidates satisfying all compulsory equations** | **0 / 8,192** |

Even **one** of the 156 mandatory byte identities fails to appear in *any* of the 8,192 source permutations. Accordingly, the originally published panel under these layouts cannot be a verbatim AES-256 expanded key schedule plus 16-byte IV, even with all ten independently resolved printed-case alternatives counterfactually granted.

[Self-contained Node22 CommonJS SFT](../sims/lp2_p50_aes256_expanded_schedule_original_sft.cjs) recomputes the original 8,192 source cases and performs independent **full actual FIPS AES-256 key expansion** on the genuine standardized example key `603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4`. Its first eight expanded words match FIPS Appendix A.3, and **all 156/156** mandatory XOR equations hold on the genuine schedule with either 16-byte IV placement. This detects any valid AES-256 schedule without needing the ciphertext's secret key.

**Independent Windows Node.js22 PASS:** [GitHub Actions run 45284690527](https://github.com/FlareZ123/liber-primus/actions/runs/45284690527).

## Cipher implication

This excludes only the simplest **expanded AES-256 key plus IV** reading of the original complete numeric object. The panel could still supply a *raw* 32-byte AES key, ciphertext, multiple encrypted key shares, a random seed, or some non-AES object; this test makes no assertion about those. Trying arbitrary hidden table interleavings or nonlinear preprocessing would require new original-image or contemporaneous source instructions, as the presently visible table provides no such selection.

No plaintext, author-selected decoder, independent key, or final Liber Primus destination is established. The next productive route must specify a complete original rune-cipher consumer or authenticate a missing cryptographic input, rather than multiply source-unselected layouts.
