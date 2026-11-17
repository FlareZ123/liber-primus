#include <array>
#include <algorithm>
#include <cstdio>
#include <vector>
#include <string>
#include <stdexcept>
#include <fstream>
#include <iterator>

// Exhaustive additive fifth-order AFFINE GP29 keystream inverse.
// Characteristic (x-1) times any monic order-five GF29 polynomial.
// Covers arbitrary secret five-dimensional affine state matrices,
// biases, starting states, fixed linear output maps, including degenerate cases.
// Original p15--22: 18 one-rune words, allowed plaintext A/I/O.
// Re-parses the exact source: 12,956 runes and all 83 original singletons.
using V = std::array<int,6>;
static constexpr int MOD=29;
static int inverse[MOD];
static int fm(int x){x%=MOD;return x<0?x+MOD:x;}
struct Event {int pos; int cipher;};
static const std::array<int,83> POS={176,244,350,530,644,792,967,1025,1062,1250,1316,1545,1814,2148,2375,2428,2476,2566,2659,3002,3095,3222,3275,3347,3738,3783,3881,4006,4142,4148,4176,4217,4233,4358,4474,4633,4699,4751,4794,5253,5319,5336,5635,5699,5976,5991,6256,6563,6793,6924,6990,6994,7132,7185,7311,7480,7522,7683,7781,8098,8278,8327,8559,8678,9072,9246,9402,9555,9776,9946,10851,10972,10995,11086,11526,11647,11802,11951,12165,12233,12254,12648,12770};
static const std::array<int,83> SYM={28,15,9,1,0,21,8,7,2,27,26,19,8,10,3,10,9,6,10,14,26,1,7,11,26,23,9,10,17,28,10,16,4,16,13,7,4,2,17,28,25,9,24,23,16,6,26,13,21,15,11,19,3,19,19,20,8,11,13,13,23,22,4,7,18,12,2,8,20,22,26,16,3,16,13,17,6,1,22,28,19,24,21};

static V mul(const V& u,const V&v,const V&coeff){
  int t[11]={0};
  for(int i=0;i<6;i++)for(int j=0;j<6;j++t[i+j]+=u[i]*v[j];
  for(int k=10;k>=6;k--){const int q=fm(t[k]);for(int j=0;j<6;j++t[k-6+j]+=q*coeff[j];}
  return V{fm(t[0]),fm(t[1]),fm(t[2]),fm(t[3]),fm(t[4]),fm(t[5])};
}
struct Poly {
 V c;
 std::array<V,14> powers{};
 explicit Poly(V coeff):c(coeff){powers[0]=V{0,1,0,0,0,0};for(int i=1;i<14;i++)powers[i]=mul(powers[i-1],powers[i-1],c);}
 V row(int n)const{
  V v{1,0,0,0,0,0};int i=0;
  while(n){if(n&1)v=mul(v,powers[i],c);n>>=1;i++;}
  return v;
 }
};
static int rank6(const V*rows,int n){
 int m[6][6]={0};for(int i=0;i<n;i++)for(int j=0;j<6;j++m[i][j]=rows[i][j];
 int r=0;
 for(int j=0;j<6&&r<n;j++){
  int k=r;while(k<n&&m[k][j]==0)k++;if(k==n)continue;
  for(int col=0;col<5;col++)std::swap(m[r][col],m[k][col]);
  int v=inverse[m[r][j]];for(int col=j;col<5;col++)m[r][col]=fm(m[r][col]*v);
  for(int i=r+1;i<n;i++){int q=m[i][j];for(int col=j;col<5;col++)m[i][col]=fm(m[i][col]-q*m[r][col]);}
  r++;
 }
 return r;
}
static void invert(const int in[6][6],int out[6][6],int n){
 int m[6][12]={0};
 for(int i=0;i<n;i++){for(int j=0;j<n;j++)m[i][j]=in[i][j];m[i][n+i]=1;}
 for(int col=0;col<n;col++){
  int k=col;while(k<n&&m[k][col]==0)k++;if(k==n)throw std::runtime_error("Singular selected basis");
  for(int j=0;j<2*n;j++)std::swap(m[col][j],m[k][j]);
  int v=inverse[m[col][col]];for(int j=col;j<2*n;j++)m[col][j]=fm(m[col][j]*v);
  for(int i=0;i<n;i++){if(i==col)continue;int q=m[i][col];for(int j=col;j<2*n;j++)m[i][j]=fm(m[i][j]-q*m[col][j]);}
 }
 for(int i=0;i<n;i++)for(int j=0;j<n;j++)out[i][j]=m[i][j+n];
}
static int search(const V& c,const std::vector<Event>& events,bool verbose=false){
 Poly poly(c);
 V basis[6],old[83];int chosen[6]={0},r=0,end=0;
 const int base=events.front().pos;
 for(;end<int(events.size());end++){
  V now=poly.row(events[end].pos-base);old[end]=now;
  V trial[6];for(int j=0;j<r;j++)trial[j]=basis[j];trial[r]=now;
  if(rank6(trial,r+1)>r){basis[r]=now;chosen[r]=end;r++;}
  if(r==6){end++;break;}
 }
 int piv[6]={0},p=0;
 for(int col=0;col<6&&p<r;col++){
  int m[6][6]={0};for(int i=0;i<r;i++){
   for(int j=0;j<p;j++)m[i][j]=basis[i][piv[j]];
   m[i][p]=basis[i][col];
  }
  int qrank=0;
  for(int j=0;j<=p;j++){
    int k=qrank;while(k<r&&m[k][j]==0)k++;if(k==r)continue;
    for(int z=0;z<=p;z++)std::swap(m[k][z],m[qrank][z]);
    int inv=inverse[m[qrank][j]];for(int z=j;z<=p;z++)m[qrank][z]=fm(m[qrank][z]*inv);
    for(int z=qrank+1;z<r;z++){int k0=m[z][j];for(int w=j;w<=p;w++)m[z][w]=fm(m[z][w]-k0*m[qrank][w]);}
    qrank++;
  }
  if(qrank>p)piv[p++]=col;
 }
 if(p!=r)throw std::runtime_error("Failed to choose independent pivots");
 int mat[6][6]={0},invMat[6][6]={0};
 for(int i=0;i<r;i++)for(int j=0;j<r;j++)mat[i][j]=basis[i][piv[j]];
 invert(mat,invMat,r);
 int possibilities=1;for(int j=0;j<r;j++)possibilities*=3;
 int keys[729][6]={0};
 for(int i=0;i<possibilities;i++){
  int x=i;for(int j=0;j<r;j++){
   const int plain=(x%3==0?24:(x%3==1?10:3));x/=3;
   keys[i][j]=fm(events[chosen[j]].cipher-plain);
  }
 }
 bool alive[729];std::fill(alive,alive+possibilities,true);
 int survivors=possibilities;
 for(int i=0;i<int(events.size());i++){
  V row=i<end?old[i]:poly.row(events[i].pos-base);
  int weights[6]={0};
  for(int j=0;j<r;j++)for(int k=0;k<r;k++)weights[j]+=row[piv[k]]*invMat[k][j];
  for(int j=0;j<r;j++)weights[j]=fm(weights[j]);
  const int c0=fm(events[i].cipher-24),c1=fm(events[i].cipher-10),c2=fm(events[i].cipher-3);
  for(int k=0;k<possibilities;k++)if(alive[k]){int v=0;for(int j=0;j<r;j++)v+=weights[j]*keys[k][j];v=fm(v);
      std::printf("  forced K=%d plaintext=%d (allowed 24,10,3)\n",v,fm(events[i].cipher-v));
    }
  }
  for(int k=0;k<possibilities;k++)if(alive[k]){
   int v=0;for(int j=0;j<r;j++)v+=weights[j]*keys[k][j];v=fm(v);
   if(v!=c0&&v!=c1&&v!=c2){alive[k]=false;survivors--;}
  }
  if(!survivors)return i+1;
 }
 if(verbose){std::printf("AFFINE5 ROOT1 coeff=%d,%d,%d,%d,%d,%d survivingSeeds=%d\n",c[0],c[1],c[2],c[3],c[4],c[5],survivors);}
 return int(events.size())+1;
}
static void sourceGate(){
 const int gp[29]={5792,5794,5798,5801,5809,5811,5815,5817,5819,5822,5825,5828,5831,5832,5833,5835,5839,5842,5846,5847,5850,5853,5855,5854,5802,5803,5795,5857,5856};
 std::ifstream f("resources/lp2-transcription.txt",std::ios::binary);
 if(!f)throw std::runtime_error("Need original LP2 transcription in repository root");
 std::string source((std::istreambuf_iterator<char>(f)),std::istreambuf_iterator<char>());
 std::vector<Event> events;int page=0,runeCount=0,wordSize=0,start=0,letter=0;
 const auto flush=[&](){if(wordSize==1)events.push_back({start,letter});wordSize=0;};
 for(std::size_t i=0;i<source.size()&&page<55;){unsigned char b=static_cast<unsigned char>(source[i]);
  if(b==0xe1&&i+2<source.size()){
   unsigned char d=static_cast<unsigned char>(source[i+1]),e=static_cast<unsigned char>(source[i+2]);
   const int code=((b&15)<<12)|((d&63)<<6)|(e&63);
   if(code>=0x16a0&&code<=0x16ff){
    auto it=std::find(std::begin(gp),std::end(gp),code);
    if(it==std::end(gp))throw std::runtime_error("Unknown rune");
    if(wordSize==0){start=runeCount;}
    letter=static_cast<int>(it-std::begin(gp));wordSize++;runeCount++;i+=3;continue;
   }
  }
  if(b=='%'){page++;i++;continue;}
  if(b=='/'||b==' '||b=='\n'||b=='\r'||b=='\t'){i++;continue;}
  flush();i++;
 }
 flush();
 if(events.size()!=83||runeCount!=12956)throw std::runtime_error("Original source dimensions changed");
 for(int i=0;i<83;i++)if(events[i].pos!=POS[i]||events[i].cipher!=SYM[i])throw std::runtime_error("Original word mismatch");
 std::printf("SOURCE verified 12956 original runes and 83 unchanged GP29 singleton words\n");
}
static void positiveGate(const std::vector<Event>&scope){
 const V cf=V{25,24,25,21,14,8};
 Poly poly(cf);
 V initial{5,12,14,3,27,9};
 std::vector<Event> plant=scope;
 for(auto& e:plant){
  V row=poly.row(e.pos-scope.front().pos);int k=0;for(int i=0;i<6;i++)k+=row[i]*initial[i];
  e.cipher=fm(k+24+(e.pos%3==1?15:(e.pos%3==2?8:0)));
 }
 if(search(cf,plant)!=int(scope.size())+1)throw std::runtime_error("Affine order5 source-shaped positive failed");
}
static void sweep(const std::vector<Event>&events,const char* name){
 if(events.size()<12)throw std::runtime_error("Scope too short for original test");
 positiveGate(events);
 int hist[85]={0};long count=0;int survived=0;
 for(int a0=0;a0<29;a0++)for(int a1=0;a1<29;a1++)for(int a2=0;a2<29;a2++)for(int a3=0;a3<29;a3++)for(int a4=0;a4<29;a4++){
  const V cp=V{fm(-a0),fm(a0-a1),fm(a1-a2),fm(a2-a3),fm(a3-a4),fm(1+a4)};
  const int decision=search(cp,events);hist[decision]++;count++;
  if(decision==int(events.size())+1){survived++;if(survived<=5)std::printf("SURVIVOR %s a=%d,%d,%d,%d,%d\n",name,a0,a1,a2,a3,a4);}
 }
 std::printf("SCOPE %s events=%zu candidates=%ld survive=%d\n",name,events.size(),count,survived);
 for(int i=1;i<=int(events.size())+1;i++)if(hist[i])std::printf("  outcome after %d events: %d\n",i,hist[i]);
 if(count!=20511149)
  throw std::runtime_error("Original exact affine-order5 exhaustive certificate changed");
}
int main(){
 for(int i=1;i<29;i++)for(int j=1;j<29;j++)if((i*j)%29==1)inverse[i]=j;
 sourceGate();
 std::vector<Event> all,chapter;
 for(int i=0;i<83;i++){
  Event e{POS[i],SYM[i]};all.push_back(e);
  if(e.pos>=3603&&e.pos<5506)chapter.push_back(e);
 }
 if(chapter.size()!=18)throw std::runtime_error("Source chapter 15-22 singleton count changed");
 sweep(chapter,"physical-p15-p22");
 return 0;
}
