/*
 * Conditional first-three-word crib of LP2 page 0 against PHP 5.x mt_rand().
 * Word lengths 8/5/4 are preserved in the transcription. All tested cipher
 * forms are modulo-29 additive, direct or ciphertext-chained, both signs.
 * Up to one key rejection per word and two total may occur only if a discarded
 * draw would have emitted the previous ciphertext rune. Result does not prove
 * an untested word spelling or generator impossible.
 *
 * Dictionary format: packed records of 9 bytes, one unsigned length (4/5/8)
 * plus a little-endian 64-bit base-29 Gematria Primus word.
 */
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <inttypes.h>
#include <time.h>
#define H 262144u
#define MASK (H-1)
static uint64_t dict8[H];
static uint8_t *dict5,*dict4;
static uint8_t ct[17]={15,8,18,3,6,19,27,0,15,26,18,21,5,2,11,6,25};
static uint64_t hits1,hits2,hits3;
typedef struct {uint32_t a[624];int pos;} MT;
static void mt_init(MT *r,uint32_t seed){
 r->a[0]=seed;
 for(int i=1;i<624;i++){uint32_t v=r->a[i-1];r->a[i]=1812433253u*(v^(v>>30))+(uint32_t)i;}
 r->pos=624;
}
static void mt_reload(MT *r){
 for(int i=0;i<624;i++){
  uint32_t u=r->a[i],v=r->a[(i+1)%624],x=(u&0x80000000u)|(v&0x7fffffffu);
  r->a[i]=r->a[(i+397)%624]^(x>>1)^((u&1)?0x9908b0dfu:0u);
 }
 r->pos=0;
}
static uint32_t mt_next(MT *r){
 if(r->pos==624)mt_reload(r);
 uint32_t x=r->a[r->pos++];
 x^=x>>11;x^=(x<<7)&0x9d2c5680u;x^=(x<<15)&0xefc60000u;x^=x>>18;
 return x>>1;
}
static unsigned int keymap(uint32_t n,int mode){
 switch(mode){
 case 0:return (unsigned int)((29ULL*n)>>31);
 case 1:return n%29u;
 case 2:return 1u+(unsigned int)((28ULL*n)>>31);
 case 3:return 1u+n%28u;
 default:return (n&255u)%29u;
 }
}
static int mod29(int x){x%=29;return x<0?x+29:x;}
static uint32_t hash(uint64_t v){
 v^=v>>33;v*=0xff51afd7ed558ccduLL;v^=v>>33;v*=0xc4ceb9fe1a85ec53uLL;v^=v>>33;
 return (uint32_t)v&MASK;
}
static int contains8(uint64_t v){
 uint32_t h=hash(v);
 while(dict8[h]!=UINT64_MAX){if(dict8[h]==v)return 1;h=(h+1u)&MASK;}
 return 0;
}
static int contains(int n,uint64_t v){
 return n==8?contains8(v):n==5?(v<20511149u&&dict5[v]):(v<707281u&&dict4[v]);
}
static int load_words(const char *name){
 FILE *f=fopen(name,"rb");if(!f){perror(name);return 0;}
 dict5=calloc(20511149u,1);dict4=calloc(707281u,1);
 if(!dict5||!dict4){fclose(f);return 0;}
 for(int i=0;i<H;i++)dict8[i]=UINT64_MAX;
 int count[9]={0};unsigned char row[9];
 while(fread(row,1,9,f)==9){
  int n=row[0];uint64_t v=0;
  for(int i=0;i<8;i++)v|=(uint64_t)row[1+i]<<(i*8);
  if(n==8){uint32_t h=hash(v);while(dict8[h]!=UINT64_MAX&&dict8[h]!=v)h=(h+1u)&MASK;dict8[h]=v;count[8]++;}
  if(n==5&&v<20511149u){dict5[v]=1;count[5]++;}
  if(n==4&&v<707281u){dict4[v]=1;count[4]++;}
 }
 fclose(f);
 fprintf(stderr,"Dictionary: n8=%d n5=%d n4=%d\n",count[8],count[5],count[4]);
 return count[8]&&count[5]&&count[4];
}
static int selftest(void){
 const uint32_t seeds[]={0u,1u,2u,3301u,1356998400u,UINT32_MAX};
 const uint32_t vectors[][12]={
  {963932192,1273124119,1535857466,324735766,1294424481,1842424189,1170127713,1819459251,909791748,1339092841,770137596,1316527631},
  {1244335972,15217923,1546885062,2002651684,2135443977,1865258162,1509498899,2145423170,1837306065,1634983062,1956263230,1300815158},
  {1216699170,1761292401,2082109824,2000468772,1180391179,2035235989,1223905695,1095219027,902732980,688346755,1426299943,331628760},
  {1405942902,1597094570,984984073,940074847,1460650220,1544539323,1037946300,1178146517,1755252058,1247128299,881740015,2146658823},
  {1944345792,1597443343,1627386164,47957214,668663861,420878668,814895448,1208981608,1717229960,253652124,988599255,757986552},
  {209663185,1896011239,1959327238,927834965,464842412,1008044630,1675044971,1654882557,38525164,608944016,55783497,1083160893}
 };
 for(int i=0;i<6;i++){MT r;mt_init(&r,seeds[i]);for(int j=0;j<12;j++)if(mt_next(&r)!=vectors[i][j])return 0;}
 fprintf(stderr,"Six historical PHP seed reference vectors PASS\n");return 1;
}
typedef struct {int offset,skips;uint64_t word;} Hit;
static int words(const unsigned int *key,int start,int size,int offset,int chain,int sign,int skipped,Hit *out,int cap){
 int n=0;
 for(int skip=-1;skip<size;skip++){
  if(start==0&&skip==0)continue;
  if(skip>=0&&skipped>=2)continue;
  uint64_t word=0;int valid=1;
  for(int j=0;j<size;j++){
   int p=start+j,k=offset+j+(skip>=0&&j>=skip);
   int prev=p?ct[p-1]:0,shift=chain?prev:0;
   int letter=mod29((int)ct[p]-shift-sign*(int)key[k]);
   if(j==skip&&mod29(shift+letter+sign*(int)key[k-1])!=prev){valid=0;break;}
   word=29u*word+(uint64_t)letter;
  }
  if(valid&&contains(size,word)&&n<cap)out[n++]=(Hit){offset+size+(skip>=0),skipped+(skip>=0),word};
 }
 return n;
}
static void print_word(uint64_t v,int len,char *out){
 static const char *alpha[]={"F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"};
 int digits[8];for(int j=len-1;j>=0;j--){digits[j]=v%29;v/=29;}
 out[0]=0;for(int j=0;j<len;j++)strcat(out,alpha[digits[j]]);
}
static void candidate(uint32_t seed){
 MT r;mt_init(&r,seed);uint32_t raw[22];
 for(int i=0;i<22;i++)raw[i]=mt_next(&r);
 unsigned int key[22];Hit a[9],b[6],c[5];
 for(int mode=0;mode<5;mode++){
  for(int i=0;i<22;i++)key[i]=keymap(raw[i],mode);
  for(int chain=0;chain<2;chain++)for(int sign=-1;sign<=1;sign+=2){
   int na=words(key,0,8,0,chain,sign,0,a,9);hits1+=na;
   for(int i=0;i<na;i++){
    int nb=words(key,8,5,a[i].offset,chain,sign,a[i].skips,b,6);hits2+=nb;
    for(int j=0;j<nb;j++){
     char x[32],y[32];print_word(a[i].word,8,x);print_word(b[j].word,5,y);
     printf("PAIR seed=%" PRIu32 " mode=%d chain=%d sign=%+d words=%s %s skips=%d\n",seed,mode,chain,sign,x,y,b[j].skips);
     int nc=words(key,13,4,b[j].offset,chain,sign,b[j].skips,c,5);hits3+=nc;
     for(int k=0;k<nc;k++){
      char z[32];print_word(c[k].word,4,z);
      printf("HIT seed=%" PRIu32 " mode=%d chain=%d sign=%+d words=%s %s %s skips=%d\n",seed,mode,chain,sign,x,y,z,c[k].skips);fflush(stdout);
     }
    }
   }
  }
 }
}
static void plant(uint32_t seed){
 const unsigned int pt[17]={23,10,1,10,9,10,16,26,20,10,6,8,16,8,3,20,26};
 MT r;mt_init(&r,seed);int last=0;
 for(int i=0;i<17;i++){
  int x;do{x=mod29(pt[i]+last+(int)keymap(mt_next(&r),0));}while(i>0&&x==last);
  ct[i]=x;last=x;
 }
}
int main(int argc,char **argv){
 if(!selftest())return 1;
 if(argc<4){fprintf(stderr,"Usage: %s dictionary.bin seed_start seed_end_exclusive [plant_seed]\n",argv[0]);return 2;}
 if(!load_words(argv[1]))return 3;
 uint64_t start=strtoull(argv[2],NULL,10),end=strtoull(argv[3],NULL,10);
 if(end<=start||end>UINT64_C(4294967296)){fprintf(stderr,"Invalid seed range\n");return 4;}
 if(argc>=5)plant((uint32_t)strtoul(argv[4],NULL,10));
 clock_t t=clock();
 for(uint64_t s=start;s<end;s++)candidate((uint32_t)s);
 printf("SUMMARY seeds=%" PRIu64 " word1=%" PRIu64 " word2=%" PRIu64 " word3=%" PRIu64 " cpu_s=%.3f\n",end-start,hits1,hits2,hits3,(double)(clock()-t)/CLOCKS_PER_SEC);
 return 0;
}
