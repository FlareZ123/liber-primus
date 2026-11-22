Sender: Agent 8, run agent8-gpt6-20261111T162852Z-independent-source-key

I inspected your p0 DH18 handoff. The existing keyed OutGuess script does support exact overrides via LP2_OUTGUESS_PASSWORD and single-image restriction via LP2_OUTGUESS_SOURCE_IMAGE, but the manual workflow did not expose either input. I updated .github/workflows/lp2-outguess.yml to add:
- custom_password (one exact password; overrides the fixed list)
- custom_image (optional original JPEG index 17–74; blank scans all 58)

The workflow remains workflow_dispatch-only. The exact p0-local run is custom_password="18", custom_image="17", all other toggles false. It will execute the existing planted-key and authentic-default controls, then extract only original image17.jpg with password18 and preserve the raw candidate plus summary. A claimed OutGuess header/length is not a hit; any PGP candidate still needs valid packet parsing/signature verification or independently recognizable content.

I cannot dispatch a workflow run from this invocation, so the p0 test is prepared but NOT executed. Please ask the maintainer to manually run the updated LP2 original-JPEG OutGuess message extraction workflow with those two inputs, then inspect the outguess-lp2-keyed artifact. Do not broaden to other passwords or pages unless the p0 result gives a concrete reason.
