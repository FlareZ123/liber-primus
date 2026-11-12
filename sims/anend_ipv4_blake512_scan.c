#define _GNU_SOURCE
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <omp.h>

static const uint64_t IV[8] = {
  0x6a09e667f3bcc908ULL,0xbb67ae8584caa73bULL,0x3c6ef372fe94f82bULL,0xa54ff53a5f1d36f1ULL,
  0x510e527fade682d1ULL,0x9b05688c2b3e6c1fULL,0x1f83d9abfb41bd6bULL,0x5be0cd19137e2179ULL
};
static const uint64_t C[16] = {
  0x243f6a8885a308d3ULL,0x13198a2e03707344ULL,0xa4093822299f31d0ULL,0x082efa98ec4e6c89ULL,
  0x452821e638d01377ULL,0xbe5466cf34e90c6cULL,0xc0ac29b7c97c50ddULL,0x3f84d5b5b5470917ULL,
  0x9216d5d98979fb1bULL,0xd1310ba698dfb5acULL,0x2ffd72dbd01adfb7ULL,0xb8e1afed6a267e96ULL,
  0xba7c9045f12c7f99ULL,0x24a19947b3916cf7ULL,0x0801f2e2858efc16ULL,0x636920d871574e69ULL
};
static const uint8_t SIGMA[10][16] = {
 {0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15},
 {14,10,4,8,9,15,13,6,1,12,0,2,11,7,5,3},
 {11,8,12,0,5,2,15,13,10,14,3,6,7,1,9,4},
 {7,9,3,1,13,12,11,14,2,6,5,10,4,0,15,8},
 {9,0,5,7,2,4,10,15,14,1,11,12,6,8,3,13},
 {2,12,6,10,0,11,8,3,4,13,7,5,15,14,1,9},
 {12,5,1,15,14,13,4,10,0,7,6,3,9,2,8,11},
 {13,11,7,14,12,1,3,9,5,0,15,4,8,6,2,10},
 {6,15,14,9,11,3,0,8,12,2,13,7,1,4,10,5},
 {10,2,8,4,7,6,1,5,15,11,9,14,3,12,13,0}
};
static inline uint64_t rotr64(uint64_t x, unsigned n) { return (x >> n) | (x << (64-n)); }
static inline uint64_t load_be64(const uint8_t *p) {
  return ((uint64_t)p[0]<<56)|((uint64_t)p[1]<<48)|((uint64_t)p[2]<<40)|((uint64_t)p[3]<<32)|
         ((uint64_t)p[4]<<24)|((uint64_t)p[5]<<16)|((uint64_t)p[6]<<8)|(uint64_t)p[7];
}
static inline void store_be64(uint8_t *p,uint64_t x){
  p[0]=x>>56;p[1]=x>>48;p[2]=x>>40;p[3]=x>>32;p[4]=x>>24;p[5]=x>>16;p[6]=x>>8;p[7]=x;
}
#define G(a,b,c,d,e) do { \
  v[a] += (m[SIGMA[q][e]] ^ C[SIGMA[q][(e)+1]]) + v[b]; \
  v[d] = rotr64(v[d] ^ v[a],32); \
  v[c] += v[d]; \
  v[b] = rotr64(v[b] ^ v[c],25); \
  v[a] += (m[SIGMA[q][(e)+1]] ^ C[SIGMA[q][e]]) + v[b]; \
  v[d] = rotr64(v[d] ^ v[a],16); \
  v[c] += v[d]; \
  v[b] = rotr64(v[b] ^ v[c],11); \
} while(0)

/* One-block BLAKE-512 specialization for messages of 0..15 bytes.
   Canonical dotted-quad IPv4 strings are 7..15 bytes. */
static inline void blake512_short(uint8_t out[64], const uint8_t *data, size_t len) {
  if (len > 15) abort();
  uint8_t first16[16] = {0};
  uint64_t m[16],v[16],t=(uint64_t)len*8;
  memcpy(first16,data,len);
  first16[len]=0x80;
  m[0]=load_be64(first16);
  m[1]=load_be64(first16+8);
  for(int i=2;i<=12;i++)m[i]=0;
  m[13]=1; m[14]=0; m[15]=t;
  for(int i=0;i<8;i++) v[i]=IV[i];
  v[8]=C[0];v[9]=C[1];v[10]=C[2];v[11]=C[3];
  v[12]=C[4]^t;v[13]=C[5]^t;v[14]=C[6];v[15]=C[7];
  for(int r=0;r<16;r++){
    const int q=r%10;
    G(0,4,8,12,0);G(1,5,9,13,2);G(2,6,10,14,4);G(3,7,11,15,6);
    G(0,5,10,15,8);G(1,6,11,12,10);G(2,7,8,13,12);G(3,4,9,14,14);
    (void)q;
  }
  for(int i=0;i<8;i++) store_be64(out+8*i,IV[i]^v[i]^v[i+8]);
}
static int hexval(char c){if(c>='0'&&c<='9')return c-'0';if(c>='a'&&c<='f')return c-'a'+10;return -1;}
static void parsehex(const char*s,uint8_t*out){for(int i=0;i<64;i++){int a=hexval(s[2*i]),b=hexval(s[2*i+1]);if(a<0||b<0){fprintf(stderr,"bad hex\n");exit(2);}out[i]=(a<<4)|b;}}
static void decbyte(unsigned x,char out[3],int *n){if(x>=100){out[0]='0'+x/100;out[1]='0'+(x/10)%10;out[2]='0'+x%10;*n=3;}else if(x>=10){out[0]='0'+x/10;out[1]='0'+x%10;*n=2;}else{out[0]='0'+x;*n=1;}}
int main(int argc,char**argv){
  const char *target="36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
  uint8_t targetb[64],out[64];parsehex(target,targetb);
  uint8_t zero=0;const char *kat="97961587f6d970faba6d2478045de6d1fabd09b61ae50932054d52bc29d31be4ff9102b9f69e2bbdb83be13d4b9c06091e5fa0b48bd081b634058be0ec49beb3";
  uint8_t katb[64];parsehex(kat,katb);blake512_short(out,&zero,1);if(memcmp(out,katb,64)){fprintf(stderr,"BLAKE-512 KAT failed\n");return 2;}
  int a0=0,a1=255; if(argc>1)a0=atoi(argv[1]);if(argc>2)a1=atoi(argv[2]);if(a0<0||a1>255||a0>a1){fprintf(stderr,"usage: %s [first_octet_start first_octet_end]\n",argv[0]);return 2;}
  char dec[256][3];int dl[256];for(int i=0;i<256;i++)decbyte(i,dec[i],&dl[i]);
  volatile int found=0;int completed=0;unsigned long long total=0;double t0=omp_get_wtime();
  #pragma omp parallel for schedule(dynamic,1) reduction(+:total)
  for(int a=a0;a<=a1;a++){
    uint8_t buf[16],h[64];
    for(int b=0;b<256;b++)for(int c=0;c<256;c++)for(int d=0;d<256;d++){
      int p=0;memcpy(buf+p,dec[a],dl[a]);p+=dl[a];buf[p++]='.';
      memcpy(buf+p,dec[b],dl[b]);p+=dl[b];buf[p++]='.';
      memcpy(buf+p,dec[c],dl[c]);p+=dl[c];buf[p++]='.';
      memcpy(buf+p,dec[d],dl[d]);p+=dl[d];
      blake512_short(h,buf,p);
      if(!memcmp(h,targetb,64)){
        #pragma omp critical
        {printf("MATCH BLAKE-512 %.*s\n",p,buf);fflush(stdout);found=1;}
      }
      total++;
    }
    #pragma omp critical
    { completed++; if(completed%8==0 || completed==a1-a0+1) fprintf(stderr,"progress first_octets=%d/%d\n",completed,a1-a0+1); }
  }
  printf("DONE a=%d..%d candidates=%llu blake512=%s threads=%d seconds=%.3f\n",a0,a1,total,found?"hit":"no-hit",omp_get_max_threads(),omp_get_wtime()-t0);
  return 0;
}
