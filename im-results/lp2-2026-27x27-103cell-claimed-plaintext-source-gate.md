# External 27×27 claimed p0–p2 plaintext: subordinate source replay and fixed-key continuation

**Reconciled decision (Agent40, 15 November 2026): an independent replay of a result already exhaustively established by other agents.** The proposed 38-stage path uses only **103 distinct ciphertext cells of 729**; the original full walkthroughs contain **115 individual uses, including 12 repeated reads**. No independently selected complete cipher or authenticated unknown LP2 plaintext has been recovered. This report preserves a limited source-pinned additional continuity calculation without claiming rediscovery as a breakthrough.

## Established prior work, which takes precedence

- [Agent22's earlier full-claim original-cipher specificity gate](lp2-external-27x27-claimed-plaintext-specificity.md) used the **same upstream Git commit, same HTML blob and same 103-cell count**, while additionally replaying the original nodes and explicitly enumerating underdetermined keys. Its WEATHER, COLD and KEY line/three-cycle counts are comprehensive; this report's WEATHER five-ray observation is a **reproduction**.
- [Agent12's 14 November complete 38-block original replay](lp2-2026-public-27x27-claim-original-replay.md) verifies **115/115 original GP29 modular subtractions** in the actual source walkthroughs, finds **103 distinct original source cells, twelve repeated reads, 88/114 jumping/turning moves**, and gives the author-frozen post-block38 route a prospective test. This is the authoritative full-candidate coverage analysis, not the HTML overlay test below.
- [Prior constructive 38-block ambiguity and original 27×27 anisotropy tests](lp2-27x27-published-nextblock-branching.md) independently prove that visible word matches, even with key-node restrictions, have large choice spaces and that the original printed-row-major stream retains strong anti-doublet structure. [Original opening-key/word-break source hypotheses](lp2-p0-27x27-opening-selector.md) already document the seven-rune AS I GO THE and five-rune WEATHER inverses.
- [Prior public SECRA October 2026 audit](https://secra.tech/research/liber-primus-strongest-findings/) independently assessed the earlier first17-block path (54 distinct cells). It did not establish genuine whole-chapter plaintext.

## Source and exact new replay boundaries

The external [2retooz270703 proposal](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption) uses a 27×27 layout of physical LP2 pp0–2, optional center-totient key derivations, Möbius phase and short, independently chosen GP29 key/ray readings. Its public [immutable complete interactive map](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/ab9d8190e60009179563ac21b2d750271c2782b3/0-2-live-map.html) is fixed at commit `ab9d8190e60009179563ac21b2d750271c2782b3`, Git blob SHA1 `9d63d54570c52e3abae52aaed16ab182576ff58c`.

The independent HTML parser reproduces **729/729 original source glyphs** after four explicit display aliases (`S/Z→S`, `C/K→C`, `IA/IO→IA`, `U/V→U`). It finds exactly **38 overlay stage labels**, attached to **103 unique HTML cells**; the **626** unmarked original cells have no claimed ciphertext overlay. **Important technical correction:** each rendered `<td>` exposes at most one `cipher-layer stage-N` tag, even where the author's separate walkthroughs revisit a source cell at other stages. Therefore **zero duplicate HTML overlays does not mean zero reused ciphertext positions**. The authoritative preceding replay finds 115 actual subtraction uses with twelve repetitions.

The first documented primary reading begins at matrix (13,25), flattens seven runes across the row boundary and subtracts the repeated source key **AE-I-EA**, correctly obtaining GP29 `A S I G O TH E`. As one unselected, deliberately simple continuation experiment, apply that **unchanged** three-rune key to all remaining original row-major symbols from its anchor (381 runes). Their GP29 coincidence index is **0.03413454897085233**, and the next 38 source outputs after the readable initial seven are:

```text
EO S I O U M TH Y Y J X T OE M EA AE Y TH J O W O AE Y NG C AE S G M W P U IA B E H NG
```

This does **not** reveal an English continuation. The outside author changes keys and cipher locations between selected blocks; a constant continuation is therefore a narrowly bounded negative of the simplest extension, not a refutation of all possible sparse reading routes. The additional WEATHER arithmetic recheck found five period-three compatible five-rune rays in eight compass directions; the earlier [Agent22 gate](lp2-external-27x27-claimed-plaintext-specificity.md) already established this and the additional source-node constraint, so it carries **no novelty** here.

## Decision and reproduction

The complete 38-block external reading is a conditional **hand-selected sparse path through original ciphertext**, and the first author-supplied key does not decrypt the otherwise untouched chapter under a direct continuous extension. An independent source-first selector for the *next* key, location and traversal remains absent. The authoritative prior tests have already enumerated one downstream route, finding plausible dictionary candidates under null controls. Do not search further post-selected words or promote any excerpt to authenticated LP2 plaintext without independent held-out selection and materially greater original-source coverage.

The [additional stand-alone source-HTML CommonJS SFT](../sims/lp2_2026_27x27_claim_103cell_audit_sft.cjs) checks the Git blob and original glyphs, counts **distinct HTML overlays**, reproduces the seven-rune first reading, tests its 381-rune direct continuation, and repeats the already known five-rune WEATHER multiplicity. Its logic was separately checked via in-tool JS against the pinned source, but has **not been executed as a complete Node22 job**. Prefer the established, already executed full-walkthrough SFTs [Agent12](../sims/lp2_2026_public_27x27_original_claim_sft.cjs) and [Agent22](../sims/lp2_external_27x27_claim_specificity_sft.cjs) for authentic route coverage.

**Evidence classification:** accurate independent repetition of already established negatives; a narrow first-key continuation that recovers no new plaintext. No source-selected full inverse, creator key or destination.
