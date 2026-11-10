/*
 * Exact whole-seed PHP 5.x MT19937 test of the LP2 p15 nine-rune Fibonacci
 * heading. Plaintext FIBONACCI is an independently motivated, UNPROVEN crib.
 * The red title is printed above the Fibonacci/prime square (32.jpg).
 *
 * Share the authenticated PHP 5.x mt_rand() MT implementation, reductions,
 * and six reference seed vectors with php_mt_wordscan.c. Each candidate
 * tests exact nine-rune add/subtract/Beaufort and cipher-chained relations,
 * with or without a literal first F interrupter. All matches must be tested
 * on independent original ciphertext before calling them decryptions.
 *
 * Usage: php_mt_fibonacci_crib SEED_START SEED_END_EXCLUSIVE
 * Both bounds are unsigned; end may be 4294967296.
 */
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <inttypes.h>
#include <time.h>
#define main php_mt_original_main_unused
#include "php_mt_wordscan.c"
#undef main
static const int headingC[9]={0,1,20,19,24,28,26,22,24};
static const int headingP[9]={0,10,17,3,9,24,5,5,10};
static uint64_t hitsByForm[3]={0,0,0};
/*
 * fmode 0: all nine runes encrypted, key pointer consumes F.
 * fmode 1: first F literal, key pointer does NOT consume F.
 * fmode 2: first F literal but the key clock DOES consume one F draw.
 */
static int check(const uint32_t raw[9],int reducer,int sign,int chain,int carrier,int fmode){
  int matches=0;
  for(int i=(fmode?1:0);i<9;i++){
    int kindex=i-(fmode==1);
    int key=(int)keymap(raw[kindex],reducer);
    int plain=carrier?28-headingP[i]:headingP[i];
    int prev=chain&&i?headingC[i-1]:0;
    if(mod29(plain+sign*key+prev)==headingC[i])matches++;
  }
  return matches;
}
static void fibonacci_candidate(uint32_t seed){
  MT mt;mt_init(&mt,seed);
  uint32_t raw[9];
  for(int i=0;i<9;i++)raw[i]=mt_next(&mt);
  for(int reducer=0;reducer<5;reducer++)
  for(int sign=-1;sign<=1;sign+=2)
  for(int chain=0;chain<2;chain++)
  for(int carrier=0;carrier<2;carrier++)
  for(int fmode=0;fmode<3;fmode++){
    int match=check(raw,reducer,sign,chain,carrier,fmode);
    int required=fmode?8:9;
    if(match!=required)continue;
    hitsByForm[fmode]++;
    printf("HIT seed=%" PRIu32 " reducer=%d sign=%+d chain=%d carrier=%d Fmode=%d matches=%d\n",
      seed,reducer,sign,chain,carrier,fmode,match);
  }
}
static int planted(void){
  const uint32_t seed=777;
  MT m;mt_init(&m,seed);
  uint32_t raw[9];for(int i=0;i<9;i++)raw[i]=mt_next(&m);
  for(int fmode=0;fmode<3;fmode++){
    int printed[9]={0};
    for(int i=0;i<9;i++){
      if(fmode&&i==0){printed[i]=0;continue;}
      int at=i-(fmode==1);
      printed[i]=mod29(headingP[i]+(int)keymap(raw[at],0));
    }
    int match=0;
    for(int i=(fmode?1:0);i<9;i++){
      int at=i-(fmode==1);
      if(mod29(printed[i]-headingP[i])==(int)keymap(raw[at],0))match++;
    }
    if(match!=(fmode?8:9))return 0;
    printed[5]=mod29(printed[5]+1);
    match=0;
    for(int i=(fmode?1:0);i<9;i++){
      int at=i-(fmode==1);
      if(mod29(printed[i]-headingP[i])==(int)keymap(raw[at],0))match++;
    }
    if(match!=(fmode?7:8))return 0;
  }
  return 1;
}
int main(int argc,char **argv){
  if(!selftest()||!planted()){fprintf(stderr,"Reference or planted test FAILED\n");return 1;}
  if(argc!=3){fprintf(stderr,"usage: %s start end_exclusive\n",argv[0]);return 2;}
  const uint64_t begin=strtoull(argv[1],NULL,10);
  const uint64_t end=strtoull(argv[2],NULL,10);
  if(begin>=end||end>UINT64_C(4294967296))return 3;
  const clock_t tick=clock();
  for(uint64_t seed=begin;seed<end;seed++)fibonacci_candidate((uint32_t)seed);
  printf("SUMMARY begin=%" PRIu64 " end=%" PRIu64
    " seeds=%" PRIu64 " noF=%" PRIu64 " literalF_skip=%" PRIu64
    " literalF_consume=%" PRIu64 " cpu_s=%.3f\n",
    begin,end,end-begin,hitsByForm[0],hitsByForm[1],hitsByForm[2],
    (double)(clock()-tick)/CLOCKS_PER_SEC);
  return 0;
}
