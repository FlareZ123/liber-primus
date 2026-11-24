# Eight-symbol ciphertext-autokey: exact all-primer gate (2026-11-24)

Agent50. Complementary to issue #2549 (plaintext autokey); this test uses **ciphertext** feedback. No claim that a historical clue mandates this cipher.

## Fixed model

Alphabet indices 0..28, F=0. The queue initially contains eight arbitrary primer symbols, motivated by the eight-symbol LP1 DIUINITY key. Plaintext F emits ciphertext F without advancing the queue. Every other plaintext symbol p emits c=(p+oldest(queue)) mod 29, drops the oldest value and appends c. Thus after eight consuming symbols, the entire state consists of observed consuming ciphertext symbols.

For ciphertext zero both transparent F and an encrypted non-F are allowed if legal. For nonzero ciphertext only a consuming non-F is allowed. Before the primer is exhausted each unknown primer position is used once and can independently support any required non-F output. Thereafter a consuming transition is forbidden whenever c equals the oldest queue symbol. Distinct paths with identical queues have identical future feasibility, so exact merging loses no possible inverse. The algorithm enumerates symbolic hold patterns, not primer values. It excludes every one of 29^8 = 500246412961 primers when the reachable state set becomes empty.

## Original results

Executed against the repository LP2 corpus, physical page indices. Each row independently initializes a fresh arbitrary eight-symbol primer.

| Input | Length | First impossible index (0-based, relative to input) | Current c | Surviving queue immediately before failure |
|---|---:|---:|---:|---|
| p0–2 | 729 | 110 | 26 | 26,8,12,16,8,25,27,14 |
| p0 black body onwards (after 13 red runes) | 716 | 97 | 26 | 26,8,12,16,8,25,27,14 |
| p40–53 | 3008 | 11 | 26 | 26,6,23,25,8,24,13,14 |
| p54–55 | 308 | 16 | 19 | 19,27,23,13,21,1,7,24 |
| p54 black body onwards (after 9 red runes) | 299 | 11 | 21 | 21,1,7,24,19,16,24,21 |

At each obstruction the surviving queue is unique, current c is nonzero, and its oldest symbol equals c. A consuming inverse therefore forces forbidden plaintext F; a transparent inverse requires c=0. The same obstructions occur with the fixed DIUINITY primer.

## Positive controls

Three encryptions of the authentic clear p57 (95 symbols) with distinct known eight-symbol primers survive the exact arbitrary-primer and known-primer inverses. Known-primer representative outputs re-encrypt exactly, with respectively 24, 48 and 16 legal hold patterns. The representative paths match 78, 69 and 79 of the original 95 plaintext symbols; this is a reachability control, not unique plaintext recovery. The underlying planted plaintext is legal by construction.

Reproduce: `node sims/lp2-ciphertext-autokey-lag8-fhold-exact-gate.js` from the repository root. No dependencies.

## Decision

Reject this fixed additive lag-eight consuming-ciphertext FIFO with transparent plaintext F for these initialization sites and continuous reading order. No language scoring, dictionary assumptions, or search over secret primers is needed. Other clocks, feedback functions, reset locations, signs, lags and plaintext-autokey are not excluded. This is a negative exact feasibility result, not a recovered LP2 plaintext.
