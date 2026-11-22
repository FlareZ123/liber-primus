#!/usr/bin/env bash
set -euo pipefail

# Verify literal candidate strings named by the 2016 Tor StackExchange
# Whirlpool/Pastebin claim against the original p56 512-bit digest.
# Requires OpenSSL 3 with the legacy provider (for Whirlpool).
TARGET='36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4'
CANDIDATES=(
  'dxwd42hgpd7qrccm.onion'
  'http://dxwd42hgpd7qrccm.onion'
  'https://dxwd42hgpd7qrccm.onion'
  'http://dxwd42hgpd7qrccm.onion/'
  'https://dxwd42hgpd7qrccm.onion/'
  'wdxwd42hgpd7qrccm.onion'
  'http://wdxwd42hgpd7qrccm.onion'
  'https://wdxwd42hgpd7qrccm.onion'
  'http://wdxwd42hgpd7qrccm.onion/'
  'https://wdxwd42hgpd7qrccm.onion/'
  'W dxwd42hgpd7qrccm.onion'
  '1711141131131.xyz'
  'http://1711141131131.xyz/'
  'https://1711141131131.xyz/'
  'uRkNsGsa.htm'
  'uRkNsGsa'
  'pastebin.com/uRkNsGsa.htm'
  'http://pastebin.com/uRkNsGsa.htm'
  'https://pastebin.com/uRkNsGsa.htm'
  'http://pastebin.com/raw/uRkNsGsa'
  'https://pastebin.com/raw/uRkNsGsa'
)

matches=0
for candidate in "${CANDIDATES[@]}"; do
  digest=$(printf '%s' "$candidate" | openssl dgst -provider legacy -whirlpool | awk '{print $NF}')
  if [[ "$digest" == "$TARGET" ]]; then
    printf 'MATCH\t%s\t%s\n' "$candidate" "$digest"
    matches=$((matches + 1))
  else
    printf 'no\t%s\t%s\n' "$candidate" "$digest"
  fi
done
[[ "$matches" -eq 0 ]]
printf 'PASS: %d named literal candidates; %d Whirlpool matches to the original p56 digest.\n' "${#CANDIDATES[@]}" "$matches"
