#include <algorithm>
#include <array>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <iterator>
#include <stdexcept>
#include <string>
#include <vector>

// K[n] = b*(prime[n]-1) + R[n] mod 29.
// R affine order four: characteristic (X-1)*(X^4-a3 X^3-a2 X^2-a1 X-a0).
constexpr int Q=29,D=6,PD=5;
using Poly=std::array<int,PD>; using Row=std::array<int,D>; using State=std::array<uint8_t,D>;
struct Event{int pos,cipher;};
static const std::array<Event,18> SOURCE={{{3738,26},{3783,23},{3881,9},{4006,10},{4142,17},{4148,28},{4176,10},{4217,16},{4233,4},{4358,16},{4474,13},{4633,7},{4699,4},{4751,2},{4794,17},{5253,28},{5319,25},{5336,9}}};
static int inv[Q];
static int fm(int x){x%=Q;return x<0?x+Q:x;}
static bool allowed(int c,int k){const int p=fm(c-k);return p==24||p==10||p==3;}
static std::vector<int> primePhi(int n){
 std::vector<int> primes;
 for(int x=2;int(primes.size())<n;x++){bool prime=true;for(int p:primes){if(p*p>x)break;if(x%p==0){prime=false;break;}}if(prime)primes.push_back(x);}
 for(int &x:primes)x=fm(x-1);return primes;
}
static Poly mul(const Poly&u,const Poly&v,const Poly&c){
 int t[2*PD-1]={};for(int i=0;i<PD;i++)for(int j=0;j<PD;j++)t[i+j]+=u[i]*v[j];
 for(int k=2*PD-2;k>=PD;k--){int q=fm(t[k]);for(int j=0;j<PD;j++)t[k-PD+j]+=q*c[j];}
 Poly out{};for(int j=0;j<PD;j++)out[j]=fm(t[j]);return out;
}
struct Recurrence{
 Poly c;std::array<Poly,12> pow{};
 explicit Recurrence(const std::array<int,4>&a):c{fm(-a[0]),fm(a[0]-a[1]),fm(a[1]-a[2]),fm(a[2]-a[3]),fm(1+a[3])}{
  pow[0][1]=1;for(int j=1;j<int(pow.size());j++)pow[j]=mul(pow[j-1],pow[j-1],c);
 }
 Row row(int n,int t)const{Poly p{1,0,0,0,0};int j=0;while(n){if(n&1)p=mul(p,pow[j],c);n>>=1;j++;}return Row{p[0],p[1],p[2],p[3],p[4],t};}
};
struct ConstraintState{
 int rank=0,count=1;
 std::array<Row,D> B{},W{};std::array<int,D> pivot{};std::array<State,729> states{};
 bool advance(Row v,int cipher){
  Row weights{};
  for(int r=0;r<rank;r++){const int f=v[pivot[r]];if(!f)continue;for(int j=0;j<D;j++)v[j]=fm(v[j]-f*B[r][j]);for(int j=0;j<rank;j++)weights[j]=fm(weights[j]+f*W[r][j]);}
  int p=0;while(p<D&&v[p]==0)p++;
  if(p<D){
   if(rank>=D)throw std::runtime_error("rank overflow");const int scale=inv[v[p]];
   for(int j=0;j<D;j++)B[rank][j]=fm(v[j]*scale);for(int j=0;j<rank;j++)W[rank][j]=fm(-weights[j]*scale);
   W[rank][rank]=scale;pivot[rank]=p;
   const int vals[3]={fm(cipher-24),fm(cipher-10),fm(cipher-3)};
   for(int i=count-1;i>=0;i--){const State old=states[i];for(int k=0;k<3;k++){states[3*i+k]=old;states[3*i+k][rank]=uint8_t(vals[k]);}}
   count*=3;rank++;return true;
  }
  int kept=0;for(int i=0;i<count;i++){int sum=0;for(int j=0;j<rank;j++)sum+=weights[j]*states[i][j];if(allowed(cipher,fm(sum)))states[kept++]=states[i];}
  count=kept;return count!=0;
 }
 Row recover(const State&key)const{
  Row result{};for(int r=rank-1;r>=0;r--){int sum=0;for(int j=0;j<rank;j++)sum+=W[r][j]*key[j];for(int j=0;j<D;j++)if(j!=pivot[r])sum-=B[r][j]*result[j];result[pivot[r]]=fm(sum);}return result;
 }
};
static int dot(const Row&a,const Row&b){int sum=0;for(int j=0;j<D;j++)sum+=a[j]*b[j];return fm(sum);}
static std::vector<int> sourceGate(){
 const int gp[29]={5792,5794,5798,5801,5809,5811,5815,5817,5819,5822,5825,5828,5831,5832,5833,5835,5839,5842,5846,5847,5850,5853,5855,5854,5802,5803,5795,5857,5856};
 std::ifstream f("resources/lp2-transcription.txt",std::ios::binary);if(!f)throw std::runtime_error("Need original source transcription at repo root");
 std::string source((std::istreambuf_iterator<char>(f)),std::istreambuf_iterator<char>());
 std::vector<Event> events;std::vector<int> tape;int page=0,wordSize=0,start=0,letter=0;
 auto flush=[&](){if(wordSize==1&&start>=3603&&start<5506)events.push_back({start,letter});wordSize=0;};
 for(std::size_t i=0;i<source.size()&&page<55;){uint8_t b=uint8_t(source[i]);if(b==0xe1&&i+2<source.size()){
   int code=((b&15)<<12)|((uint8_t(source[i+1])&63)<<6)|(uint8_t(source[i+2])&63);if(code>=0x16a0&&code<=0x16ff){auto it=std::find(std::begin(gp),std::end(gp),code);if(it==std::end(gp))throw std::runtime_error("Unknown rune");if(!wordSize)start=int(tape.size());letter=int(it-std::begin(gp));wordSize++;tape.push_back(letter);i+=3;continue;}}
  if(b=='%'){page++;i++;continue;}if(b=='/'||b==' '||b=='\n'||b=='\r'||b=='\t'){i++;continue;}flush();i++;
 }
 flush();if(tape.size()!=12956||events.size()!=SOURCE.size())throw std::runtime_error("Source dimensions changed");
 for(size_t i=0;i<events.size();i++)if(events[i].pos!=SOURCE[i].pos||events[i].cipher!=SOURCE[i].cipher)throw std::runtime_error("Original singleton mismatch");
 std::cout<<"Verified all 18 source singleton coordinates in 12956 original runes.\n";return tape;
}
static void positive(const std::vector<int>&t,int origin){
 const std::array<int,4>a{3,7,2,9};const Row state{5,12,14,3,27,11};Recurrence rec(a);ConstraintState test;
 for(size_t j=0;j<SOURCE.size();j++){int n=SOURCE[j].pos-origin;Row row=rec.row(n,t[n]);const int p[3]={24,10,3};if(!test.advance(row,fm(dot(row,state)+p[j%3])))throw std::runtime_error("Positive lost");}
 bool found=false;for(int i=0;i<test.count;i++)if(test.recover(test.states[i])==state)found=true;
 if(!found||test.rank!=D)throw std::runtime_error("Positive seed recovery failed");
 std::cout<<"Positive full six-variable state recovery, states="<<test.count<<"\n";
}
static long long sweep(const std::vector<int>&t,int origin,int lo,int hi,const std::vector<int>&tape,const std::array<Event,18>&events=SOURCE,const std::vector<int>&expected={}){
 positive(t,origin);std::array<long long,20> hist{};long long survive=0,keys=0,count=0;auto start=std::chrono::steady_clock::now();
 for(int a0=lo;a0<hi;a0++)for(int a1=0;a1<Q;a1++)for(int a2=0;a2<Q;a2++)for(int a3=0;a3<Q;a3++){
  Recurrence rec({a0,a1,a2,a3});ConstraintState st;int j=0;
  for(;j<int(events.size());j++){int n=events[j].pos-origin;if(!st.advance(rec.row(n,t[n]),events[j].cipher))break;}
  hist[j+1]++;count++;
  if(j==int(events.size())){
   survive++;keys+=st.count;std::cout<<"SURVIVOR origin="<<origin<<" a="<<a0<<','<<a1<<','<<a2<<','<<a3<<" rank="<<st.rank<<" states="<<st.count<<"\n";
   for(int i=0;i<st.count;i++){Row key=st.recover(st.states[i]);std::cout<<"state=";for(int x:key)std::cout<<x<<',';std::cout<<"\n";
    if(st.rank==D&&!tape.empty()){
     const std::string digits="0123456789ABCDEFGHIJKLMNOPQRS";std::vector<int> plain;
     for(int n=0;n<5506-origin;n++)plain.push_back(fm(tape[origin+n]-dot(rec.row(n,t[n]),key)));
     if(!expected.empty()){
      if(plain!=expected)throw std::runtime_error("Blind held-out plant decoding failed");
      std::cout<<"Exact blind plaintext recovery: "<<plain.size()<<"/"<<expected.size()<<" runes, "<<plain.size()-events.size()<<" withheld from key constraints.\n";
     }else{std::cout<<"candidate=";for(int x:plain)std::cout<<digits[x];std::cout<<"\n";}
    }
   }
  }
 }
 std::cout<<"FINAL origin="<<origin<<" a0Range="<<lo<<','<<hi<<" coefficientTuples="<<count<<" survivingPolynomials="<<survive<<" survivingObservableAssignments="<<keys<<" elapsedMs="<<std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now()-start).count()<<"\n";
 for(size_t j=1;j<hist.size();j++)if(hist[j])std::cout<<"outcome "<<j<<": "<<hist[j]<<"\n";
 if(count!=1LL*(hi-lo)*Q*Q*Q)throw std::runtime_error("Coefficient coverage failure");
 return survive;
}
static void blindPositive(const std::vector<int>&t){
 const int origin=3612;const std::array<int,4>a{3,7,2,9};const Row state{5,12,14,3,27,11};
 Recurrence rec(a);auto events=SOURCE;const int p[3]={24,10,3};
 const std::string digits="0123456789ABCDEFGHIJKLMNOPQRS",p57="DO4OHKIKA5I2IA9FGO4G199IKLG32IF140O5I7IJ1FGF8IN3143795A451J0I4I95IF0A9N2INA1A9AGQ7A2A9O9NIJI46I";
 std::vector<int> plain(5506-origin),cipher(5506);
 for(size_t i=0;i<plain.size();i++)plain[i]=int(digits.find(p57[i%p57.size()]));
 for(size_t j=0;j<events.size();j++)plain[events[j].pos-origin]=p[j%3];
 for(size_t i=0;i<plain.size();i++)cipher[origin+i]=fm(plain[i]+dot(rec.row(int(i),t[i]),state));
 for(auto&e:events)e.cipher=cipher[e.pos];
 if(sweep(t,origin,0,29,cipher,events,plain)!=1)throw std::runtime_error("Blind planted key not unique");
}
int main(int argc,char**argv){
 for(int i=1;i<Q;i++)for(int j=1;j<Q;j++)if(i*j%Q==1)inv[i]=j;
 if(argc>1&&std::string(argv[1])=="--plant"){blindPositive(primePhi(1903));return 0;}
 const bool snapshot=argc>1&&std::string(argv[1])=="--snapshot";const auto tape=snapshot?std::vector<int>{}:sourceGate();
 const auto t=primePhi(1903);const int shift=snapshot?1:0;int origin=argc>1+shift?std::stoi(argv[1+shift]):3612;int lo=argc>2+shift?std::stoi(argv[2+shift]):0;int hi=argc>3+shift?std::stoi(argv[3+shift]):29;
 if((origin!=3603&&origin!=3612)||lo<0||hi>29||lo>=hi)throw std::runtime_error("Invalid source origin or tap partition");
 if(snapshot)std::cout<<"Exact fetched singleton snapshot, full source gate omitted locally.\n";
 sweep(t,origin,lo,hi,tape);
 if(argc==1)sweep(t,3603,0,29,tape);
}
