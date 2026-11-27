# LP2 p33–p39 independent human source-only session (Director #3012)

**Status: complete discovery and separately sealed holdout archives assembled and tested; independent human session pending.** No human has been contacted or simulated, and no new cipher operation, key, or plaintext is established.

The [builder](../sims/lp2_p33_p39_blind_packet.py) constructs two deterministic ZIP archives from the original scans and exact historical chart files. Give the participant only `discovery.zip`. Keep `holdout.zip` and `moderator.md` private until the locked-prediction protocol allows release. The participant prompt includes neither issue text nor previously derived numerical readings or transformations.

- Discovery: physical p33–37 and p39 (combined archive 50–54 and 56). Holdout: p38 (combined archive 55), chosen before a participant session because it contains a later numbered passage while p39 retains the closing layout. This is a procedural choice, not a proposed cipher selector.
- Context: exact 2003 JPG, 2008 PNG and 2010 SVG numeral charts with dated source and license manifest; literal labels and textarea names from the exact original Stage10 form (not a reconstruction of its square values or a claimed decryption operand).
- The chart inclusion is an experimental context choice, not an assertion that the LP2 artwork was copied from those charts. No derived transcriptions, operation hints, historical comparison metrics or current research are in discovery.
- The participant must lock an exact rule, coordinate/target and objective prediction before p38 is revealed. A repeated stamp prediction by itself is insufficient evidence of a plaintext receiver.

## Build

From the repository root:

```
python sims/lp2_p33_p39_blind_packet.py --output <private-directory>
```

The completed [manual Windows assembly run](https://github.com/FlareZ123/liber-primus/actions/runs/46076258521) provides separate downloadable artifacts:

- [Participant discovery artifact](https://github.com/FlareZ123/liber-primus/actions/runs/46076258521/artifacts/15235480807), 2,538,297 bytes, GitHub artifact SHA-256 `6755cd3c89f891bde3f8d11db673d3dfedc9d84627df84d1190da846daf58b1c`.
- [Moderator-only artifact](https://github.com/FlareZ123/liber-primus/actions/runs/46076258521/artifacts/15235020956), 382,697 bytes, GitHub artifact SHA-256 `2538002c32a5ea3992a668407cf62d962b433de922e2b33dd837ba7d6bdd058e`. Do not provide this link or archive to a participant.

These digests refer to the GitHub artifact containers, not the inner ZIPs. Both artifacts expire 25 February 2027; rerun the existing manual workflow using script `sims/lp2_p33_p39_blind_packet_sft.py` to rebuild them. Download and privately send only the inner discovery ZIP to the independent participant; a link to the research repository could expose the experimental hypotheses.

The builder reads the original page JPEGs and repository-pinned SVG and Stage10 form, and downloads the two historical raster files by their exact dated URLs. An offline coordinator may supply the two exact raster files with `--chart-dir <directory>`; `--image-dir` can point to the extracted combined original archive. No third-party Python package is required. The builder stops on missing or mismatched chart bytes. It validates the SVG SHA-1, both raster SHA-1/length pairs, exact Stage10 Git blob and field order, and produces SHA-256 manifests for each archive. Windows text-checkout normalization is accepted only when the canonical source digest matches.

## Executed checks

The original image-only checks had already passed. The [end-to-end assembly SFT](../sims/lp2_p33_p39_blind_packet_sft.py) now also passes on a network-enabled Windows checkout (run above, pinned commit `0e327e43d35e3904c283a0fae714e6bec00e5d97`): exact 2003/2008 raster SHA-1 and byte counts, 2010 SVG identity, original Stage10 form Git blob and field order, source-only ZIP entry allowlists, disjoint page membership, per-entry length and SHA-256 manifest replay, byte identity of every page with its repository original, CRC, and byte-identical ZIP regeneration using the acquired chart bytes offline. Both separate upload steps succeeded. No new artwork comparison or numeric sweep was run.

## Next decision

Privately present the already assembled discovery packet only to a maintainer-approved, unexposed real human. If the participant locks a source-selected numerical operation, apply it without retuning to the held p38 and record exact output; otherwise retain the no-selector result as bounded evidence. The issue remains open pending this dependency. Do not substitute an LLM cold start or another arbitrary square sweep. The established p33 square-receiver negatives and authoritative frontier remain unchanged.
