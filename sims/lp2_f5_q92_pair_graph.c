/*
 * Original-image exact shared-background pair census for LP2 physical pp0..57.
 * All 58 original Q92 scans, any pair, full same-position luma quantized DCT.
 * Blocks are restricted to the fixed outer artwork region and count only when
 * 64 coefficients match exactly and a nonzero AC coefficient is present.
 * Pairs with >=200 identical nonzero AC coefficients are emitted.
 *
 * gcc -O3 -Wall -Wextra -o pairgraph lp2_f5_q92_pair_graph.c -ljpeg
 * pairgraph resources/liber-primus > pairs.csv
 */
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <jpeglib.h>
#define NN 58
#define NX 300
#define NY 450
#define NS (NX*NY)
#define START 17
typedef struct {uint64_t *hash; uint8_t *nnz; int q[64];} Frame;
static Frame frames[NN];
static uint64_t hashBlock(const JCOEF *b) {
  uint64_t h=UINT64_C(14695981039346656037);
  for(int k=0;k<64;k++) {
    unsigned short v=(unsigned short)(int16_t)b[k];
    h^=v&255; h*=UINT64_C(1099511628211);
    h^=(v>>8)&255; h*=UINT64_C(1099511628211);
  }
  return h;
}
static void readFrame(const char *dir,int page) {
  char name[4096];
  snprintf(name,sizeof(name),"%s/%02d.jpg",dir,page+START);
  FILE *f=fopen(name,"rb");
  if(!f){perror(name);exit(2);}
  struct jpeg_decompress_struct dec={0};
  struct jpeg_error_mgr err;
  dec.err=jpeg_std_error(&err);
  jpeg_create_decompress(&dec);
  jpeg_stdio_src(&dec,f);
  if(jpeg_read_header(&dec,TRUE)!=JPEG_HEADER_OK)exit(3);
  jvirt_barray_ptr *c=jpeg_read_coefficients(&dec);
  if(dec.comp_info[0].width_in_blocks!=NX||dec.comp_info[0].height_in_blocks!=NY)exit(4);
  for(int k=0;k<64;k++)
    frames[page].q[k]=dec.quant_tbl_ptrs[dec.comp_info[0].quant_tbl_no]->quantval[k];
  frames[page].hash=calloc(NS,sizeof(uint64_t));
  frames[page].nnz=calloc(NS,sizeof(uint8_t));
  if(!frames[page].hash||!frames[page].nnz)exit(5);
  for(int y=0;y<NY;y++) {
    JBLOCKARRAY row=(*dec.mem->access_virt_barray)(
      (j_common_ptr)&dec,c[0],y,1,FALSE);
    for(int x=0;x<NX;x++) {
      if(!(x*8<512||x*8>=1888||y*8<512||y*8>=3200))continue;
      int idx=y*NX+x;
      int count=0;
      for(int k=1;k<64;k++)count+=(row[0][x][k]!=0);
      if(count>0) {
        frames[page].hash[idx]=hashBlock(row[0][x]);
        frames[page].nnz[idx]=(uint8_t)count;
      }
    }
  }
  jpeg_destroy_decompress(&dec);
  fclose(f);
}
int main(int argc,char**argv){
  if(argc!=2){fprintf(stderr,"usage: %s jpeg_dir\n",argv[0]);return 1;}
  for(int i=0;i<NN;i++)readFrame(argv[1],i);
  printf("i,j,matching_nz_ac,matching_blocks\n");
  for(int i=0;i<NN;i++)for(int j=i+1;j<NN;j++) {
    if(memcmp(frames[i].q,frames[j].q,sizeof(frames[i].q)))continue;
    int ac=0,blocks=0;
    for(int k=0;k<NS;k++)
      if(frames[i].nnz[k]&&frames[j].nnz[k]&&
         frames[i].hash[k]==frames[j].hash[k]){
        blocks++; ac+=frames[i].nnz[k];
      }
    if(ac>=200)printf("%d,%d,%d,%d\n",i,j,ac,blocks);
  }
  for(int i=0;i<NN;i++){free(frames[i].hash);free(frames[i].nnz);}
  return 0;
}
