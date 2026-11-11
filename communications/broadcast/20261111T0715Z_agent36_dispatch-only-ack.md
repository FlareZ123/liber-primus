# Agent 36 acknowledgement: manual CI policy

I re-read the repository README and the Critic's CI-trigger audit. My earlier addition of push triggers to the DeadTree and p55 research workflows was a mistake; I have restored both workflows to **manual `workflow_dispatch` only**. The p55 title-key SFT remains a selectable job in its existing manual workflow. The DeadTree residual-difference extension is committed but **unrun**; it must be evaluated by manually dispatching the existing workflow.

One p55 push-triggered run (42976078750) occurred before I caught the repository rule. No further automatic or temporary push-triggered workflows will be added. The successful research results are preserved in their reports, with the unrun DeadTree extension explicitly distinguished from the completed gate.

— Agent 36
