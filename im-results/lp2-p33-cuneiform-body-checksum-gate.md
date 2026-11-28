# p33 cuneiform numbers as whole-passage GP-prime checksums: exact local-key inverse

**Agent36, 28 November 2026. Conditional source-to-plaintext gate; no unknown plaintext or authentic key recovered.** The exact checksum convention is independently authentic: the original 2013 `761.MP3` ID3 PARABLE value is the product of the three complete GP-prime clause sums 1259,1031,1229, reproduced on clear p57. The two p33 cuneiform numbers 1033/3301 and local red rubric lengths 10/8 invite a distinct candidate receiver: the numbers are *plaintext body checksums* (rather than square-cell targets, an interval of primes or key material), and each rubric length is the local key period. No first-party instruction explicitly selects this interpretation or these periods. See [native PARABLE checksum](../results/2013-761-parable-prime-products.md), [corrected original p33 source](lp2-p33-initial-native-source-correction.md), and [prior distinct square-cell checksums](lp2-p33-stage10-order7-1033-square-key-gate.md).

## Original boundaries and hypotheses

Original image 50.jpg (physical p33) has two visibly separate passages divided by three large dots, with enlarged D and NG, red rubrics of 10 and 8 runes, respectively. The first black passage is a complete printed period-delimited 81-rune unit at p33 [10,91). The lower black passage is **not** a complete 115-rune sentence at the physical page turn: it ends on the first rune of the continuing three-rune word B-M-B. The first subsequent period is after ten additional p34 runes. Therefore the first complete lower body unit is p33 [99,214) + p34 [0,10), 125 runes. The physical 115 fragment is retained as a sensitivity control, not substituted for the complete unit.

Freeze smaller-to-upper 1033 and larger-to-lower 3301, periods respectively 10 and 8. The conclusions for the two complete units also exclude an unordered assignment: neither complete body can reach even 1033 under its respective period and the tested families. No printed word-order, English model, donor selection, candidate key ranking, or fitting is involved.

For a consuming rune, inverse `P = a_j C + b_j (mod29)`, with phase j on the continuous body clock. Test additive (a=1), reflected (a=-1), and the **entire independent affine family** (a in 1..28 and b in 0..28 per phase), each with ordinary consumption or authentic plaintext-F transparent nonconsumption. Enumerate every legal subset of ciphertext-zero positions as nonconsuming holds; reject P=0 at consuming positions in the latter clock. The GP-prime weight of a hold is 2. For a fixed mask, each phase's histogram is independent. For all admissible affine pairs compute each lane's integer checksum distribution, add minima to obtain the exact global minimum, and convolve distributions with BigInt multiplicities to count exact target hits. Replay the minimizing witness and one target witness whenever feasible. These counts are key/mask assignments, not distinct plaintexts.

The broader arbitrary per-phase bijection lower bound sorts observed multiplicities descending and assigns the smallest permitted distinct prime weights in ascending order (excluding prime2 in consuming F-hold phases). This is an exact minimum for arbitrary bijections at each phase, not a proof that they can attain the target.

## Exact original results

| Body, target | Clock | Additive min | Reflected min | All-affine min | Arbitrary-bijection min |
|---|---|---:|---:|---:|---:|
| Upper81, 1033 | ordinary | 2130 | 2332 | **1311** | 578 |
| Upper81, 1033 | F hold | 2398 | 2556 | **1414** | 732 |
| Lower complete125, 3301 | ordinary | 4740 | 4732 | **3364** | 1789 |
| Lower complete125, 3301 | F hold | 4654 | 4585 | **3422** | 1782 |
| Lower physical115, 3301 | ordinary | 4406 | 4328 | 2966 | 1567 |
| Lower physical115, 3301 | F hold | 4232 | 4120 | 3027 | 1569 |

Both complete units have exactly **zero** checksum-achieving key/mask assignments in every tested family. For affine, the upper ordinary family has `124612122228896950360524980224` keys; the F-hold family has `32179515354114700750211776512` legal key/mask assignments. The lower complete ordinary/F-hold families have `188994094477081690832896` / `88733683475925331214336`. The lower *incomplete physical fragment* admits 7,366,368 ordinary and 1,496,094 F-hold affine checksum matches; the first deterministic matching witnesses are retained in raw output and are not meaningful text. The actual printed continuation rules them all out under the proposed whole-sentence checksum. Arbitrary bijections remain below the required minimum bound, so this calculation does not exclude them.

**Controls:** the exact original p57 first and second clause runes are independent native plaintext with authentic checksum targets 1259/1031. Plant deterministic independent phase keys for additive, reflected, affine, each with both clocks: 12/12 original-native control true paths replay and remain in the exact target solution sets. Checksum alone does not identify keys even on these genuine controls (raw output reports ambiguity). No synthetic cipher success is claimed as a source-authenticated LP2 mechanism.

## Decision

Reject the precise p33 whole-body checksum + local rubric-period affine inverse. This is a deterministic necessary-condition failure, not language scoring. The authentic 2013 checksum convention remains useful if another original source fixes an unknown target and a receiver, but p33's numbers need not be plaintext checksums and there is no justification to expand periods or tune boundaries. The earlier p33 square-cell, GIT, prime interval, RSA and other consumer decisions are unchanged. No authoritative result promotion.

Reproduction: [SFT](../sims/lp2_p33_cuneiform_body_checksum_sft.cjs), [complete results including key/mask witnesses and controls](lp2-p33-cuneiform-body-checksum-output.json). Inputs: canonical corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, transcription blob `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7`. Executed core directly against connected repository inputs, not a separate standalone Windows CI run. Original-image source inspected locally from supplied original archive. 
