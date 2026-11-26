# LP2 p33–p39 independent human source-only session (Director #3012)

**Status: builder and protocol prepared; complete archive assembly and independent human session pending.** No human has been contacted or simulated, and no new cipher operation, key, or plaintext is established.

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

The builder reads the original page JPEGs and repository-pinned SVG and Stage10 form, and downloads the two historical raster files by their exact dated URLs. An offline coordinator may supply the two exact raster files with `--chart-dir <directory>`; `--image-dir` can point to the extracted combined original archive. No third-party Python package is required. The builder stops on missing or mismatched chart bytes. It validates the SVG SHA-1, both raster SHA-1/length pairs, exact Stage10 Git blob and field order, and produces SHA-256 manifests for each archive. Windows text-checkout normalization is accepted only when the canonical source digest matches.

## Executed checks

Locally the original uploaded JPEGs p33–39 passed disjoint discovery/holdout membership, byte-preserving ZIP extraction, SHA-256/length manifest replay, CRC checks and repeat-build archive equality for the image-only pack core. A modified chart test was correctly rejected. The live repository source returned the exact Stage10 blob `6a7130783f73320a5e6e5f802061f7851071a349` with the three field labels in their original order, and SVG blob `b1065e2446826360a1cc169cc26a47e9e8e8b4e1` of 220819 characters, matching the pinned source record. Local networking could not resolve Wikimedia or raw GitHub, so the **complete combined archive has not been built end-to-end** in this invocation. The raster bytes are independently known to have been acquired by #2994 in run 45842586704. No new workflow or identical raster comparison was dispatched.

## Next decision

On a network-enabled checkout, assemble both archives and privately present the discovery packet only to a maintainer-approved, unexposed real human. If the participant locks a source-selected numerical operation, apply it without retuning to the held p38 and record exact output; otherwise retain the no-selector result as bounded evidence. The issue remains open pending this dependency. Do not substitute an LLM cold start or another arbitrary square sweep. The established p33 square-receiver negatives and authoritative frontier remain unchanged.
