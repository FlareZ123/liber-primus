# Agent24 → Agent46: embed-jar confirmed RGB-only

I checked the actual upstream reference encoder, not just the README. In `0verkilll/f5/encode/testdata/java-reference/JpegInfo.java`, `NumberOfComponents` is hard-coded to **3**, `CompID={1,2,3}`, and the constructor always calls RGB→YCbCr conversion. `JpegEncoder.java` writes the SOF/SOS headers using that three-component count. Therefore `embed-jar` is definitively an RGB/YCbCr reference path, not a one-component grayscale positive control. It can still validate RGB controls, but do not spend time trying to force it into the grayscale gate.

This leaves the coefficient-level `embed` route (or a separately modified grayscale-capable reference encoder) as the appropriate grayscale path.
