#define _GNU_SOURCE
#include <openssl/sha.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <omp.h>
static int hv(char c){if(c>='0'&&c<='9')return c-'0';if(c>='a'&&c<='f')return c-'a'+10;return -1;}
static void parsehex(const char*s,uint8_t*out){for(int i=0;i<64;i++){int a=hv(s[2*i]),b=hv(s[2*i+1]);if(a<0||b<0)exit(2);out[i]=(a<<4)|b;}}
static void decbyte(unsigned x,char out[3],int*n){if(x>=100){out[0]='0'+x/100;out[1]='0'+(x/10)%10;out[2]='0'+x%10;*n=3;}else if(x>=10){out[0]='0'+x/10;out[1]='0'+x%10;*n=2;}else{out[0]='0'+x;*n=1;}}
int main(int argc,char**argv){
 const char*target="36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
 const char*kat="ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f";
 uint8_t targetb[64],out[64],katb[64];parsehex(target,targetb);parsehex(kat,katb);SHA512((const unsigned char*)"abc",3,out);if(memcmp(out,katb,64)){fprintf(stderr,"SHA-512 KAT failed\n");return 2;}
 int a0=0,a1=255;if(argc>1)a0=atoi(argv[1]);if(argc>2)a1=atoi(argv[2]);if(a0<0||a1>255||a0>a1)return 2;
 char dec[256][3];int dl[256];for(int i=0;i<256;i++)decbyte(i,dec[i],&dl[i]);
 volatile int found=0;int completed=0;unsigned long long total=0;double t0=omp_get_wtime();
 #pragma omp parallel for schedule(dynamic,1) reduction(+:total)
 for(int a=a0;a<=a1;a++){
  uint8_t buf[16],h[64];
  for(int b=0;b<256;b++)for(int c=0;c<256;c++)for(int d=0;d<256;d++){
   int p=0;memcpy(buf+p,dec[a],dl[a]);p+=dl[a];buf[p++]='.';memcpy(buf+p,dec[b],dl[b]);p+=dl[b];buf[p++]='.';memcpy(buf+p,dec[c],dl[c]);p+=dl[c];buf[p++]='.';memcpy(buf+p,dec[d],dl[d]);p+=dl[d];
   SHA512(buf,p,h);if(!memcmp(h,targetb,64)){
    #pragma omp critical
    {printf("MATCH SHA-512 %.*s\n",p,buf);fflush(stdout);found=1;}
   }
   total++;
  }
  #pragma omp critical
  {completed++;if(completed%8==0||completed==a1-a0+1)fprintf(stderr,"progress first_octets=%d/%d\n",completed,a1-a0+1);}
 }
 printf("DONE a=%d..%d candidates=%llu sha512=%s threads=%d seconds=%.3f\n",a0,a1,total,found?"hit":"no-hit",omp_get_max_threads(),omp_get_wtime()-t0);return 0;
}
