#include <array>
#include <cassert>
#include <cmath>
#include <cstdint>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>
#ifdef _OPENMP
#include <omp.h>
#endif

// Exhaustive GP29 primitive-quintic seed inversion. All 29^5 secret states
// and both signs are tried; there is no search cutoff, guessed prefix or key.
static const char *ORIGINAL =
"1b170d150107181310181515021b070f080a05190d190603130a181203100703001a01100b020b1c1205091c051c120403010e17070811150018050b01030b1b1c0a14060811010b0e1805071b13030d1a171b140d0c0a02041a06130e16060f130d0b161716101b1610150a13151a181915041a0b0914010e11080d0b031c0619070e0f1705011016080c090d101c1a11010606180c09060312141311021a1b160c1a130516021214040c0d04171a0e17151a0d0f120e07050600170412171207030c16080316110f081c18050a130e0b13121314060310020e121c04061a1519130a070f110e130f0c06170219001b181105010704111c000e0a1301050d0815140c130f171b0d0011080c050c121c120a060e060f120f0c0202120f0216051c0a13050e170b0111120a";
// Original LP2 solved physical p57 (95 runes), independent native test.
static const char *P57 =
"0d180418111412140a051202120a090f10180410010909121415100302120f010400180512071213010f100f081217030104030709050a04050113001204120905120f000a09170212170a010a090a101a070a020a09180917121312040612";
// Known GP29 LP1 prose source positions 500:799 held out of language training.
static const char *HELDOUT =
"09121a1712120d070a020a091809171a0301070a14141804040a01120301100f0a1712140a051202120a090f1018040a100a0f0309141a02040301060806030a15070a020a09021810071213181a121312040612070a0f1703131a03011804121811120a15010910031a0301040f1214001a030118041218141807010910031a0301040f1214001c05080a09101214140a06120905120a0f0803141a000304181414021810140a01120f0a0f0803141a18090a090f10040105100a0309050313131809171a0301040307090f121400070a0f170313050309100a090112171a03011804121811120a15010910031a0301040f1214001a030118041218141807010910031a0301040f1214001c05080a09101214140a06120905120a0f0803141a000304181414021810140a";
// Native GP29 training counts, disjoint from withheld 299-rune reference.
static constexpr int FREQ[29] = {47,147,111,268,186,92,40,94,87,179,211,3,0,42,5,197,194,39,371,79,96,29,0,125,215,2,72,0,19};
static constexpr uint32_t NSTATE=20511149, SECRET=1428357;
using Text=std::vector<int>;
struct Tables {std::array<int,29> language{};std::array<uint8_t,24389> first{};std::array<uint8_t,841> last{};std::array<uint8_t,57> mod{};};
static Tables build(){
 Tables t;int total=0;for(int n:FREQ)total+=n;
 assert(total==2950);
 for(int i=0;i<29;i++)t.language[i]=int(std::round(1024*std::log(29.0*(FREQ[i]+1)/(total+29.0))));
 for(int i=0;i<57;i++)t.mod[i]=uint8_t(i%29);
 for(int a=0;a<29;a++)for(int b=0;b<29;b++)for(int c=0;c<29;c++)t.first[a*841+b*29+c]=uint8_t((29-(21*a+17*b+28*c)%29)%29);
 for(int d=0;d<29;d++)for(int e=0;e<29;e++)t.last[d*29+e]=uint8_t((29-(17*d+6*e)%29)%29);
 return t;
}
static Text hex(const char*s){Text a;std::string z(s);assert(z.size()%2==0);for(size_t i=0;i<z.size();i+=2){int k=std::stoi(z.substr(i,2),nullptr,16);assert(k>=0&&k<29);a.push_back(k);}return a;}
static std::array<int,5> digits(uint32_t seed){std::array<int,5>a{};for(int&i:a){i=seed%29;seed/=29;}assert(seed==0);return a;}
static int next(std::array<int,5>&a,const Tables&t){int k=a[0],z=t.mod[t.first[a[0]*841+a[1]*29+a[2]]+t.last[a[3]*29+a[4]]];a[0]=a[1];a[1]=a[2];a[2]=a[3];a[3]=a[4];a[4]=z;return k;}
static Text transcode(const Text& in,const Tables&t,uint32_t seed,int sign){Text out;out.reserve(in.size());auto a=digits(seed);for(int p:in){int x=p+sign*next(a,t);if(x<0)x+=29;if(x>=29)x-=29;out.push_back(x);}return out;}
static int measure(const Text&native,const Tables&t){int sum=0;for(int x:native)sum+=t.language[x];return sum;}
struct Best{int score=-2147483647;uint32_t seed=0;int sign=-1;};
static Best exhaustive(const Text&cipher,const Tables&t){
 Best best;
 #pragma omp parallel
 {
  Best local;
  #pragma omp for schedule(static)
  for(int64_t s=0;s<NSTATE;s++){
   auto a=digits(uint32_t(s));int minus=0,plus=0;
   for(int c:cipher){int k=next(a,t),p=c-k,q=c+k;if(p<0)p+=29;if(q>=29)q-=29;minus+=t.language[p];plus+=t.language[q];}
   if(minus>local.score)local={minus,uint32_t(s),-1};
   if(plus>local.score)local={plus,uint32_t(s),+1};
  }
  #pragma omp critical
  {if(local.score>best.score)best=local;}
 }
 return best;
}
static void run(const char*label,const Text&cipher,const Tables&t,const Text*expected=nullptr){
 Best b=exhaustive(cipher,t);Text plain=transcode(cipher,t,b.seed,b.sign);
 assert(measure(plain,t)==b.score);
 assert(transcode(plain,t,b.seed,-b.sign)==cipher);
 std::cout<<label<<" length="<<cipher.size()<<" seeds="<<NSTATE<<" signs=2"
          <<" optimum="<<std::fixed<<std::setprecision(6)<<b.score/(1024.0*cipher.size())
          <<" state="<<b.seed<<" sign="<<(b.sign<0?"minus":"plus")<<'\n';
 if(expected){const int truth=measure(*expected,t);assert(b.score==truth);assert(plain==*expected);std::cout<<" control recovered="<<plain.size()<<'/'<<cipher.size()<<" score="<<truth/(1024.0*cipher.size())<<'\n';}
 else {
  static const char *gp[29]={"F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"};
  std::cout<<" preview=";for(int i=0;i<40&&i<int(plain.size());i++)std::cout<<gp[plain[i]]<<(i==39?'\n':' ');
 }
}
int main(){
 const Tables t=build();const Text c=hex(ORIGINAL),native=hex(HELDOUT),p57=hex(P57);
 assert(c.size()==299&&native.size()==299&&p57.size()==95);
 const Text c54(c.begin(),c.begin()+223), c55(c.begin()+223,c.end());
 const Text n54(native.begin(),native.begin()+223),n55(p57.begin(),p57.begin()+76);
 run("plant299",transcode(native,t,SECRET,+1),t,&native);
 run("original299",c,t);
 run("plant223",transcode(n54,t,SECRET,+1),t,&n54);
 run("original223",c54,t);
 run("plant76",transcode(n55,t,SECRET,+1),t,&n55);
 run("original76",c55,t);
}
