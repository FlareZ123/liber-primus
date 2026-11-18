# Original p50 as DES ciphertext under the solved DIVINITY key

**Decision (Agent40, 18 November 2026).** The original 32×8 base60 table, interpreted as 32 consecutive eight-byte DES ciphertext blocks and decrypted with the **literal eight-byte key `DIVINITY`** from the independently solved p57 PARABLE, yields neither a typed GP29 payload nor the separately known p57 plaintext in the independently recognizable terminal interior. **No original unknown-page plaintext, key, intended cipher or destination was recovered.** Retire this exact key-and-block hypothesis rather than expanding arbitrary DES key dictionaries or modes.

## Original clue and complete proposed readout

The untouched physical LP2 pp49–51 print **32 rows × 8 cells** in authentic base60, each reading as one byte (256 bytes). DES has an 8-byte block. The solved p57 instruction **FIND THE DIVINITY WITHIN** supplies the exact eight-character `DIVINITY` operand without guessing a password. For the source's 32×8 rectangle, shedding the exterior leaves **30×6 = 180** interior cell positions; the adjacent original terminal pages have **p55 76**, **p56 85**, and **p57 95** runes, so p56+p57 gives another 180. A literal provisional receiver puts the **95 independently known original p57 GP29 plaintext runes at interior positions 85–179**. This is a specific original-word/geometric hypothesis; no original page actually writes `DES`, names ECB/CBC, supplies an IV, or fixes row-major ordering.

Precommitted concrete checks: standard single DES decryption of the unchanged 256 original bytes in printed row-major order, using **`DIVINITY` ASCII**, in (a) independent ECB blocks and (b) CBC with a zero IV as an explicitly unauthenticated alternative. Compare the 180 interior plaintext bytes to the 29-index GP register and the last 95 interior residues to the solved original p57 indices. An authentic readout would need a full 95/95 independent plaintext recovery, and ideally a typed opening or independently authored alternative byte-to-GP transport.

## Actual original and original-independent results

| Measure | ECB | CBC, all-zero IV |
| --- | ---: | ---: |
| DES-decrypted bytes printable ASCII, /256 | 115 | 103 |
| GP29-range byte values in 180 interior cells | 20 | 30 |
| Exact known p57 GP indices matching, /95 | **0** | **0** |
| Decrypted byte modulo29 matching p57, /95 | **2** | **4** |
| Decrypted byte stream SHA256 | `a635ed1b53d770f00924d26794ed2d870030363b86f507e01a12e8f3b3a2d8bd` | `844509e83b010a9576c8dcb269ba1718c2a8119104760935d399cecc72c77b6b` |

Original source 256 bytes SHA256: `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Both direct typed GP and modular GP outputs are decisively incompatible with the 95 known consecutive runes. Printed ASCII-looking bytes are near the random expectation. This is a *complete exact-operation negative*, not evidence that the table contains no other ciphertext or cannot be a key in a different construction.

## Reproduction and disposition

The [single-file CommonJS SFT](../sims/lp2_p50_divinity_des_ciphertext_sft.cjs) reads the original `resources/liber-primus/base60-grid.json` and `lp2-corpus.json` at runtime. It first passes the independent NIST DES known-answer vector, then executes the complete unmodified table and known p57 check using Node's built-in EDE3 with three identical eight-byte keys, algebraically identical to single DES. [Windows Node22 workflow run **PASS**](https://github.com/FlareZ123/liber-primus/actions/runs/44219141631) contains the exact two JSON result records. Workflow is manual `workflow_dispatch` only.

**Research fork:** stop treating `DIVINITY` + eight printed columns as proof of DES or of a key handoff. A future DES return would require an independent first-party cipher instruction, an actual key/IV or a typed original ciphertext-to-byte transport. The physical exterior76/interior180 geometry remains a separate, previously researched observation; it does not become a decoder through this failed trial.
