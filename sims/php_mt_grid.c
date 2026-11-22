/* Historical PHP 5.x MT19937 as candidate LP2 256-byte grid generator.
 * Exhaustive unsigned 32-bit seeds; high/low-8 output; 8 row/column/serpentine
 * traversals; every cyclic offset. Require 8 consecutive byte matches.
 */
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <inttypes.h>
#include <time.h>
#define HEADSIZE (1u<<24)
#define NSLOTS (8u*256u)
#define TEST_BYTES 8
typedef struct {uint32_t state[624];int pos;} MT;
static void init(MT*g,uint32_t seed){
 g->state[0]=seed;
 for(int i=1;i<624;i++){uint32_t x=g->state[i-1];g->state[i]=1812433253u*(x^(x>>30))+(uint32_t)i;}g->pos=624;
}
static void twist(MT*g){
 for(int i=0;i<624;i++){
  uint32_t x=g->state[i],y=g->state[(i+1)%624];
  uint32_t both=(x&0x80000000u)|(y&0x7fffffffu);
  g->state[i]=g->state[(i+397)%624]^(both>>1)^((x&1u)?0x9908b0dfu:0u);
 }g->pos=0;
}
static uint32_t next32(MT*g){
 if(g->pos==624)twist(g);
 uint32_t x=g->state[g->pos++];x^=x>>11;x^=(x<<7)&0x9d2c5680u;
 x^=(x<<15)&0xefc60000u;x^=x>>18;return x;
}
static uint32_t head[HEADSIZE],links[NSLOTS];
static uint8_t grid[256],order[8][256];
static uint64_t match3,match4,match5,match6,match7,match8;
static int selftest(void){
 const uint32_t expected[6]={963932192u,1273124119u,1535857466u,324735766u,1294424481u,1842424189u};
 MT r;init(&r,0u);
 for(int j=0;j<6;j++)if((next32(&r)>>1)!=expected[j])return 0;
 return 1;
}
static void orders(void){
 for(int n=0;n<256;n++){
  int row=n/8,col=n%8;
  order[0][n]=(uint8_t)n;
  order[1][n]=(uint8_t)(255-n);
  order[2][n]=(uint8_t)((n%32)*8+n/32);
  order[3][n]=(uint8_t)(((255-n)%32)*8+(255-n)/32);
  order[4][n]=(uint8_t)(row*8+(row%2?7-col:col));
  int r=(255-n)/8,c=(255-n)%8;
  order[5][n]=(uint8_t)(r*8+(r%2?7-c:c));
  int cc=n/32,rr=n%32;
  order[6][n]=(uint8_t)((cc%2?31-rr:rr)*8+cc);
  cc=(255-n)/32;rr=(255-n)%32;
  order[7][n]=(uint8_t)((cc%2?31-rr:rr)*8+cc);
 }
}
static uint8_t table(int slot,int i){
 int traversal=slot/256,offset=slot%256;
 return grid[order[traversal][(offset+i)&255]];
}
static void setup(void){
 orders();memset(head,0xff,sizeof(head));
 for(uint32_t slot=0;slot<NSLOTS;slot++){
  uint32_t h=((uint32_t)table(slot,0)<<16)|((uint32_t)table(slot,1)<<8)|table(slot,2);
  links[slot]=head[h];head[h]=slot;
 }
}
static void scan(uint32_t seed){
 MT g;init(&g,seed);uint8_t high[TEST_BYTES],low[TEST_BYTES];
 for(int i=0;i<TEST_BYTES;i++){
  uint32_t v=next32(&g);high[i]=(uint8_t)(v>>24);low[i]=(uint8_t)((v>>1)&255u);
 }
 for(int mode=0;mode<2;mode++){
  const uint8_t *v=mode?low:high;
  uint32_t h=((uint32_t)v[0]<<16)|((uint32_t)v[1]<<8)|v[2];
  for(uint32_t slot=head[h];slot!=UINT32_MAX;slot=links[slot]){
   match3++;int len=3;
   while(len<TEST_BYTES&&v[len]==table(slot,len))len++;
   if(len>=4)match4++;if(len>=5)match5++;if(len>=6)match6++;
   if(len>=7)match7++;
   if(len>=8){
    match8++;
    printf("HIT seed=%" PRIu32 " reducer=%s traversal=%u offset=%u bytes=8\n",
      seed,mode?"low8":"high8",slot/256,slot%256);fflush(stdout);
   }
  }
 }
}
int main(int argc,char **argv){
 if(!selftest()){fputs("Historical PHP MT reference FAILED\n",stderr);return 1;}
 if(argc<4){fputs("Usage: php_mt_grid grid.bin seed_start seed_end_exclusive [plant_seed]\n",stderr);return 2;}
 FILE*f=fopen(argv[1],"rb");if(!f){perror(argv[1]);return 3;}
 if(fread(grid,1,256,f)!=256||fgetc(f)!=EOF){fputs("Grid must have exactly 256 bytes\n",stderr);fclose(f);return 4;}fclose(f);
 uint64_t start=strtoull(argv[2],NULL,10),end=strtoull(argv[3],NULL,10);
 if(start>=end||end>UINT64_C(4294967296)){fputs("Invalid seed interval\n",stderr);return 5;}
 if(argc==5){
  uint32_t plant=(uint32_t)strtoul(argv[4],NULL,10);
  MT g;init(&g,plant);
  for(int i=0;i<TEST_BYTES;i++)grid[i]=(uint8_t)(next32(&g)>>24);
 }
 setup();clock_t t=clock();
 for(uint64_t seed=start;seed<end;seed++)scan((uint32_t)seed);
 printf("SUMMARY seeds=%" PRIu64 " signatures=%u orientations=8 offsets=256 reducers=2 match3=%" PRIu64 " match4=%" PRIu64 " match5=%" PRIu64 " match6=%" PRIu64 " match7=%" PRIu64 " match8=%" PRIu64 " cpu_s=%.3f\n",
  end-start,NSLOTS,match3,match4,match5,match6,match7,match8,(double)(clock()-t)/CLOCKS_PER_SEC);
 return 0;
}
