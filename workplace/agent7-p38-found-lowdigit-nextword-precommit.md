# Agent7 precommit: p38 FOUND low-digit next-word transfer

**Frozen before manuscript-wide enumeration, 19 November 2026.**

Independent upstream facts already fixed before this audit:

- Agent24's READ OUT self-closure selected one p50 component operator from a 16-mode family: **base60 / low digit / zero-origin / forward**.
- Agent7's earlier p38 global typed-closure audit selected p38 offsets49..53 and authenticated source word **FOUND**.
- Applying the already selected low-digit operator to the p38 objects was then noticed to give:
  - receiver GP0 95 -> p50[95]=0Z -> low60(Z)=35 -> signed word35 FOUND;
  - GP0(FOUND)=36 -> p50[36]=0s -> low60(s)=54;
  - the immediately following p38 word starts at54 and independently has ciphertext GP0=36.

The p38 observation itself is therefore post-discovery. The test below measures whether the **full transferred grammar** is selective manuscript-wide; it is not a blind discovery p-value.

## Frozen family

Parse the canonical unknown stream continuously and retain adjacent complete words wholly contained on the same physical page.

For each forward adjacent pair `(A,B)`:

1. require `GP0(A)<256`;
2. address p50 at `GP0(A)` and read only the low base60 digit, zero-origin;
3. require that value to be a valid zero-based index in the authenticated 2016 signed-word sequence, selecting word `S`;
4. require `GP_length(S) = rune_length(A)`;
5. require `GP0(S) = GP0(B)`;
6. apply the **same** low-base60 digit operation to `p50[GP0(S)]`;
7. require the result to equal the local rune **start offset of B**.

No alternate radix, high digit, one-origin value, reverse direction, English scorer, target substitution, or page selector is admitted.

## Decision

- If p38 `A=offsets49..53 -> S=FOUND -> B=offsets54..56` is the sole full-chain hit, preserve this as a cross-route transfer of the independently selected low-digit opcode and prioritize the B receiver as the next state object.
- If other full-chain hits recur, keep the p38 observation as a local checksum and quantify the recurrence rather than adding conditions.
