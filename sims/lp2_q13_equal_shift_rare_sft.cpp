// Exact equal-shift selected-set bound for literal-F period 13.
// Compile: g++ -std=c++17 -O3 lp2_q13_equal_shift_rare_sft.cpp -o q13_equal
// Input: base36 GP29 tape, p40..53 in original order (3008 symbols).
#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <random>
#include <string>
#include <vector>
using namespace std;
constexpr int Q=13,A=29,CAP=13;
using Mask=uint32_t;
int pc(Mask v){int n=0;for(;v;v&=v-1)n++;return n;}
struct Block{int n=0;Mask m[Q][CAP]{};};
struct Solver{
 vector<Block> blocks;vector<int> c;int h;
 Solver(vector<int> tape,int held):c(move(tape)),h(held){Block b{};int ct[Q][A]{};for(int x:c){if(x==h){blocks.push_back(b);b={};for(auto& row:ct)fill(begin(row),end(row),0);}else{int r=b.n++%Q,v=ct[r][x]++;if(v<CAP)b.m[r][v]|=Mask(1)<<x;}}blocks.push_back(b);}
 static int count(Mask S,const Mask*m,int limit){int v=0;for(int k=0;k<CAP;k++){Mask x=S&m[k];if(!x)break;v+=pc(x);if(v>limit)return limit+1;}return v;}
 int cost(Mask S,int d,int limit)const{array<int,Q> x{},y{};for(size_t i=0;i<blocks.size();i++){const auto& b=blocks[i];y.fill(limit+1);bool ok=false;for(int s=0;s<Q;s++){int v=x[s];if(v>limit)continue;v+=count(S,b.m[(Q-s)%Q],limit-v);if(v>limit)continue;v+=count(S,b.m[(Q+d-s)%Q],limit-v);if(v>limit)continue;int p=(s+b.n)%Q;y[p]=min(y[p],v);ok=true;if(i+1<blocks.size())y[(p+1)%Q]=min(y[(p+1)%Q],v+int((p==0||p==d)&&((S>>h)&1u)));}if(!ok)return limit+1;x=y;}return *min_element(x.begin(),x.end());}
 int direct(Mask S,int d)const{array<int,Q>x{},y{};for(int a:c){y.fill(1000000);for(int p=0;p<Q;p++){y[(p+1)%Q]=min(y[(p+1)%Q],x[p]+int((p==0||p==d)&&((S>>a)&1u)));if(a==h)y[p]=min(y[p],x[p]);}x=y;}return *min_element(x.begin(),x.end());}
 struct Result{int bound=CAP;Mask witness=0;uint64_t calls=0;};
 Result minimum(int d,int alphabet=A,int k=5)const{Result r;auto visit=[&](auto&& self,Mask S,int lo,int n)->void{for(int a=lo;a<=alphabet-(k-n);a++){Mask T=S|(Mask(1)<<a);int v=cost(T,d,r.bound-1);r.calls++;if(v>=r.bound)continue;if(n+1==k){r.bound=v;r.witness=T;}else self(self,T,a+1,n+1);if(r.bound==0)return;}};visit(visit,0,0,0);if(r.witness){assert(pc(r.witness)==k);assert(direct(r.witness,d)==r.bound);}return r;}
};
int main(int argc,char**argv){if(argc<2){cerr<<"expected base36 tape path\n";return 1;}ifstream f(argv[1]);string str;f>>str;vector<int>c;uint32_t hash=2166136261u;for(char a:str){int x=a<='9'?a-'0':a-'a'+10;assert(0<=x&&x<A);c.push_back(x);hash=(hash^x)*16777619u;}assert(c.size()==3008&&hash==1862123327u&&count(c.begin(),c.end(),0)==125);
 mt19937 rng(0x26061126);int checks=0;for(int t=0;t<20;t++){vector<int>toy(40+t*3);for(int& a:toy)a=rng()%7;Solver s(toy,rng()%7);for(int d=1;d<=6;d++){int best=CAP;for(Mask m=0;m<(1u<<7);m++)if(pc(m)==3){int v=min(CAP,s.direct(m,d));assert(s.cost(m,d,CAP-1)==v);best=min(best,v);checks++;}assert(s.minimum(d,7,3).bound==best);}}
 cerr<<"toy full-subset checks="<<checks<<"\n";int lo=argc>2?stoi(argv[2]):0,hi=argc>3?stoi(argv[3]):28;
 for(int h=lo;h<=hi;h++){Solver s(c,h);array<int,7>L{};for(int d=1;d<=6;d++){auto r=s.minimum(d);L[d]=r.bound;for(int j=0;j<8;j++){Mask M=0;while(pc(M)<5)M|=Mask(1)<<(rng()%A);assert(s.cost(M,d,CAP-1)==min(CAP,s.direct(M,d)));}cout<<"h="<<h<<" d="<<d<<" bound="<<r.bound<<" calls="<<r.calls<<" mask="<<r.witness<<"\n";}int b=(L[2]+2*L[3]+2*L[5]+L[6]+2)/3+(L[2]+L[3]+L[5]+1)/2+L[6];cout<<"historical h="<<h<<" rareLower="<<b<<"\n";}
}
