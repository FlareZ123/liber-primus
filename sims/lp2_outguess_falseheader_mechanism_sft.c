/* Original-JPEG OutGuess v0.4 false-header mechanism, C11/libjpeg read-only SFT.
 * From repo root, use resources/liber-primus as the optional image directory.
 * Pinned OutGuess source 24810e14327c2bbeedeaadd3e24491f2a4425c02:
 * src/jpg.c, src/jpeg-6b-steg/jdcoefct.c, src/arc.c, src/iterator.c.
 */
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <jpeglib.h>
typedef struct { uint8_t s[256],i,j; } arc4;
typedef struct { int scan; unsigned long long bits; int completes; } page_t;
static const uint8_t SK[16]={0x41,0xd7,0xfc,0x24,0x3c,0xfe,0x67,0x27,0x47,0xc0,0x14,0x0b,0xeb,0x27,0x7c,0x15};
static const uint8_t EK[16]={0x6c,0x76,0x68,0x0b,0x91,0xd5,0x19,0xb9,0xb7,0x8a,0xfc,0x6d,0x96,0xad,0x4e,0xe9};
/* SK=MD5("SeedingDefault key"), EK=MD5("EncryptionDefault key"). */
static void mix(arc4*a,const uint8_t*k,int n){
 a->i--;
 for(int t=0;t<256;t++){a->i++;uint8_t v=a->s[a->i];a->j+=(uint8_t)(v+k[t%n]);a->s[a->i]=a->s[a->j];a->s[a->j]=v;}
}
static uint8_t next(arc4*a){
 a->i++;uint8_t v=a->s[a->i];a->j+=v;uint8_t w=a->s[a->j];a->s[a->i]=w;a->s[a->j]=v;return a->s[(uint8_t)(v+w)];
}
static uint32_t word(arc4*a){uint32_t x=0;for(int k=0;k<4;k++)x=(x<<8)|next(a);return x;}
static arc4 init(const uint8_t*k){arc4 a={0};for(int i=0;i<256;i++)a.s[i]=(uint8_t)i;mix(&a,k,16);return a;}
static void measure(const char*path,unsigned long long*capacity,int*seed,int*length,int*end){
 FILE*f=fopen(path,"rb");if(!f){perror(path);exit(1);}
 struct jpeg_decompress_struct j={0};struct jpeg_error_mgr error;
 j.err=jpeg_std_error(&error);jpeg_create_decompress(&j);jpeg_stdio_src(&j,f);
 if(jpeg_read_header(&j,TRUE)!=JPEG_HEADER_OK)exit(1);
 jvirt_barray_ptr*planes=jpeg_read_coefficients(&j);
 *capacity=0;
 for(int c=0;c<j.num_components;c++){
  const jpeg_component_info*ci=j.comp_info+c;
  for(JDIMENSION y=0;y<ci->height_in_blocks;y++){
   JBLOCKARRAY r=j.mem->access_virt_barray((j_common_ptr)&j,planes[c],y,1,FALSE);
   for(JDIMENSION x=0;x<ci->width_in_blocks;x++)for(int k=0;k<64;k++)
    if(r[0][x][k]!=0&&r[0][x][k]!=1)(*capacity)++;
  }
 }
 uint8_t bits[600]={0};int count=0;
 const int mw=(int)((j.image_width+8*j.max_h_samp_factor-1)/(8*j.max_h_samp_factor));
 const int mh=(int)((j.image_height+8*j.max_v_samp_factor-1)/(8*j.max_v_samp_factor));
 for(int my=0;my<mh&&count<600;my++)for(int mx=0;mx<mw&&count<600;mx++)
  for(int c=0;c<j.num_components;c++){
   const jpeg_component_info*ci=j.comp_info+c;
   for(int v=0;v<ci->v_samp_factor;v++){
    JDIMENSION y=(JDIMENSION)(my*ci->v_samp_factor+v);
    if(y>=ci->height_in_blocks)continue;
    JBLOCKARRAY r=j.mem->access_virt_barray((j_common_ptr)&j,planes[c],y,1,FALSE);
    for(int h=0;h<ci->h_samp_factor;h++){
     JDIMENSION x=(JDIMENSION)(mx*ci->h_samp_factor+h);
     if(x>=ci->width_in_blocks)continue;
     for(int k=0;k<64&&count<600;k++){
      const JCOEF z=r[0][x][k];if(z!=0&&z!=1)bits[count++]=(uint8_t)(z&1);
     }
    }
   }
  }
 jpeg_destroy_decompress(&j);fclose(f);
 if(count!=600){fprintf(stderr,"Too few eligible header coefficients: %s\n",path);exit(1);}
 arc4 it=init(SK),crypt=init(EK);int off=(int)(word(&it)%32);uint8_t h[4]={0};
 for(int i=0;i<4;i++){
  for(int b=0;b<8;b++){h[i]|=(uint8_t)(bits[off]<<b);off+=(int)(word(&it)%32)+1;}
  h[i]^=next(&crypt);
 }
 *end=off;*seed=h[0]+(h[1]<<8);*length=h[2]+(h[3]<<8);
}
static int body_completes(int bits,int seed,int length,int*failed_at){
 if(length>(bits+7)/8){*failed_at=-2;return 0;}
 arc4 it=init(SK);int off=(int)(word(&it)%32);
 for(int i=0;i<32;i++)off+=(int)(word(&it)%32)+1;
 const uint8_t key[2]={(uint8_t)seed,(uint8_t)(seed>>8)};mix(&it,key,2);
 for(int remaining=length;remaining>0;remaining--){
  const int available=bits-off,span=bits/32;
  const double factor=available>span?2.0:2.0-(span-available)/(float)span;
  if(available<=0||factor<=0.0){*failed_at=length-remaining;return 0;}
  const unsigned skip=(unsigned)(factor*available/(8.0*remaining));
  if(!skip){*failed_at=length-remaining;return 0;}
  for(int b=0;b<8;b++)off+=(int)(word(&it)%skip)+1;
 }
 *failed_at=-1;return 1;
}
static int recorded(int s){
 const int a[]={17,21,43,57,58,59,60,61,62,63,64,65,68,69,70,71};
 for(size_t i=0;i<sizeof(a)/sizeof(a[0]);i++)if(s==a[i])return 1;
 return 0;
}
static int cmp(const void*aa,const void*bb){
 const page_t*a=aa,*b=bb;return a->bits>b->bits?-1:a->bits<b->bits?1:a->scan-b->scan;
}
int main(int argc,char**argv){
 if(argc>2){fprintf(stderr,"Usage: outguess_falseheader_mechanism [jpeg-directory]\n");return 2;}
 const char*root=argc==2?argv[1]:"resources/liber-primus";char path[4096];
 const int history[]={6,7,8,9};
 const unsigned long long expected[]={800881,804376,578114,704507};
 for(int i=0;i<4;i++){
  int seed,length,end;unsigned long long bits;
  snprintf(path,sizeof path,"%s/%02d.jpg",root,history[i]);
  measure(path,&bits,&seed,&length,&end);
  if(bits!=expected[i]){fprintf(stderr,"Historic capacity mismatch: %02d\n",history[i]);return 1;}
  printf("HISTORIC %02d.jpg: %llu usable bits\n",history[i],bits);
 }
 const int control[]={0,8},seeds[]={163,38},lengths[]={2899,140};
 for(int i=0;i<2;i++){
  int seed,length,end;unsigned long long bits;
  snprintf(path,sizeof path,"%s/%02d.jpg",root,control[i]);
  measure(path,&bits,&seed,&length,&end);
  if(seed!=seeds[i]||length!=lengths[i])return 1;
  printf("REAL_CONTROL %02d.jpg: seed=%d length=%d\n",control[i],seed,length);
 }
 page_t pages[58];int matches=0;
 for(int i=0;i<58;i++){
  int seed,length,end,failed;unsigned long long bits;const int scan=17+i;
  snprintf(path,sizeof path,"%s/%02d.jpg",root,scan);
  measure(path,&bits,&seed,&length,&end);
  if(seed!=41408||length!=58152||end!=547){fprintf(stderr,"Header mismatch scan %d\n",scan);return 1;}
  const int completion=body_completes((int)bits,seed,length,&failed);
  pages[i]=(page_t){scan,bits,completion};
  matches+=(completion==recorded(scan));
  if(completion!=recorded(scan)){fprintf(stderr,"Completion mismatch scan %d\n",scan);return 1;}
  printf("LP2 %02d.jpg: %llu bits, 41408/58152, complete=%d, failureByte=%d\n",scan,bits,completion,failed);
 }
 qsort(pages,58,sizeof pages[0],cmp);
 for(int i=0;i<58;i++)if(pages[i].completes!=(i<16))return 1;
 if(pages[15].scan!=68||pages[15].bits!=692043||pages[16].scan!=18||pages[16].bits!=687226)return 1;
 printf("PASS: 58/58 shared headers; 58/58 extractor completion outcomes; all four historic capacities and two genuine positive controls.\n");
 return matches==58?0:1;
}
