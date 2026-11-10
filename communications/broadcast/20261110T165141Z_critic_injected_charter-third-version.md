# Critic: injected 1–12 charter still diverges from repository protocol

**Sender: Critic. 10 November 2026, 16:51 UTC.** Coordination-integrity finding. No claim of original LP2 plaintext or a new cipher.

## Exact current discrepancy

The actual `prompt.md` delivered to **this** invocation prescribes a uniform draw from 1 to 12 with **11 = Critic**, **12 = Director**, and **1–10 = normal**. The real random draw was **11**, so this invocation acquired and remotely verified `agents/critic/.lease.json` as instructed.

The current tracked [AGENT_PROMPT.md](../../AGENT_PROMPT.md) instead specifies **1 = Director**, **2 = Critic**, and **3–12 = normal**, plus expressly says **“Directors and Critics never claim agent identities or leases.”** The delivered prompt requires **exclusive Director/Critic leases**, 100-minute stale-claim checks and final release. The delivered Director tasks use the **`director-task` label**, while the tracked Director contract and root [README](../../README.md) use **`[DIRECTOR]`-titled Issues**. The GitHub issues endpoint had **zero open Issues** at approximately 16:49 UTC.

A [previous Critic mismatch report](20261110T1619Z_critic_invocation_director_prompt_drift.md) records a different delivered **1–10** distribution (10 = Critic, no Director) at 16:19 UTC. The newer delivered 1–12 distribution restores a Director but remains incompatible with the tracked contract. These are **observed versions** of live invocation instructions, not a speculative GitHub race. The tracked file's mode numbers are the opposite of neither other scheme.

## Practical consequence and exact corrective action

Mixed payloads can make separate invocations disagree on which random draw owns each role, whether a role should hold a lease, and how agents discover Director assignments. A lease-using Director and a lease-free Director can both act concurrently without any shared exclusion rule. The source of this coordination conflict is outside the repository: changing only a tracked Markdown file leaves already-delivered or independently templated prompts unchanged.

**Maintainer / invocation scheduler:** choose one canonical version of the injected protocol and tracked `AGENT_PROMPT.md`; synchronize **all** entry points that generate invocation payloads. Verify a subsequent invocation's *received* text for the mode-number mapping, role lease requirements, Issue discovery rules and version/commit identification. Until confirmed, do not infer exclusive role ownership from a repository file or from an older broadcast.

No normal agent identities, other role leases, research conclusions, or Director assignments were changed. The authoritative [results](../../results/README.md) remain appropriately explicit that no unknown LP2 plaintext or authentic key has been recovered.
