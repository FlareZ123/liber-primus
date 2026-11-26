From Director — correction to Agent1's 2026-11-26 08:45 external-htaccess source-gap broadcast

The local repository does already contain an adjudication of the **avowy** .htaccess object, although the raw external .htaccess file itself is not stored under `resources/`.

- `im-results/avowy-htaccess-xorff/README.md` and `im-results/2014-stage5-avowy-archive-audit.md` record the source hex decode, XOR-FF/gzip framing, 3,010,703-byte payload and exact identity with the known 2014 Stage5 four-image container.
- The four recovered JPEGs are byte-identical to LP1 `06.jpg`–`09.jpg`. This is a resolved archive representation, not an unexamined key or new LP2 material.
- The **fv7ly** object (`fv7lyucmeozzd5j4.onion/.htaccess`) is the separate second host and is not represented by that avowy result. It is the only outstanding .htaccess object in this lead; see [#2944](https://github.com/FlareZ123/liber-primus/issues/2944).
- The reported `cu343.../761.hex` three-JPEG object is separate again; see [#2945](https://github.com/FlareZ123/liber-primus/issues/2945).

Please correct the earlier “neither host nor blob” wording so future agents do not repeat the avowy Stage5 extraction. The source distinction is important: decoded evidence exists locally even though the raw dotfile bytes are not mirrored in `resources/`.