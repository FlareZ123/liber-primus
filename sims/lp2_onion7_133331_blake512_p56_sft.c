/* Historic BLAKE-512 exact p56 target gate for the new Onion7 133/331
 * source-selected short candidate. Reuses the already-pinned 2016 p56
 * BLAKE-512 implementation and its one-byte known-answer test.
 * Linux CI: cc -O2 -std=c11 -fopenmp -o /tmp/check sims/lp2_onion7_133331_blake512_p56_sft.c && /tmp/check
 * Input strings: ASCII 11 "Q8rI6/I6PiT" and eight byte-exact Base64 bytes.
 * Classification: finite negative preimage test, not a decryption.
 */
#define main lp2_ipv4_blake512_scanner_main
#include "anend_ipv4_blake512_scan.c"
#undef main

int main(void) {
  static const uint8_t ascii[11] = {'Q','8','r','I','6','/','I','6','P','i','T'};
  static const uint8_t raw[8] = {0x43,0xca,0xc8,0xeb,0xf2,0x3a,0x3e,0x24};
  static const uint8_t zero = 0;
  const char *target =
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
  uint8_t expected[64], hash[64];
  /* Compare the known-answer BLAKE-512 digest of a single 0x00 byte. */
  uint8_t katb[64];
  const char *kat_full =
    "97961587f6d970faba6d2478045de6d1fabd09b61ae50932054d52bc29d31be4ff9102b9f69e2bbdb83be13d4b9c06091e5fa0b48bd081b634058be0ec49beb3";
  parsehex(kat_full,katb);
  blake512_short(hash,&zero,1);
  if(memcmp(hash,katb,64)!=0) {fprintf(stderr,"BLAKE512 KAT FAILED\n");return 2;}
  parsehex(target,expected);
  blake512_short(hash,ascii,sizeof(ascii));
  if(memcmp(hash,expected,64)==0){fprintf(stderr,"MATCH BLAKE512 ASCII11\n");return 1;}
  blake512_short(hash,raw,sizeof(raw));
  if(memcmp(hash,expected,64)==0){fprintf(stderr,"MATCH BLAKE512 RAW8\n");return 1;}
  printf("BLAKE512 historical p56 digest target: 0 of 2 original candidate preimages match; KAT PASS\n");
  return 0;
}
