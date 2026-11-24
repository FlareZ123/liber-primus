#include <algorithm>
#include <array>
#include <bit>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>
using namespace std;
constexpr int W=7,N=1729,O=3302;
using Mask=__uint128_t;using Order=array<int,W>;using Tape=array<int,N>;
vector<int> primes(){vector<int> k;for(int n=2;k.size()<O+N+W;n++){bool p=true;for(int d=2;d*d<=n;d++)if(n%d==0){p=false;break;}if(p)k.push_back((n-1)%29);}return k;}
Tape decode(const string&s){if(s.size()!=N)throw runtime_error("length");Tape a{};for(int i=0;i<N;i++){int v=s[i]>='a'?s[i]-'a'+10:s[i]-'0';if(v<0||v>=29)throw runtime_error("rune");a[i]=v;}return a;}
Tape encrypt(const Tape&p,const vector<int>&k,int origin,const Order&o){Tape c{};int j=0;for(int i=0;i<N;i++){if(!p[i])c[i]=0;else{c[i]=(p[i]+k[origin+(j/W)*W+o[j%W]])%29;j++;}}return c;}
struct Search{
 const Tape& c;const vector<int>& k;int origin;Order a{};uint64_t nodes=0,solutions=0;vector<Order> winners;
 Search(const Tape&x,const vector<int>&v,int o):c(x),k(v),origin(o){a.fill(-1);if(count(c.begin(),c.end(),0)>=128)throw runtime_error("hold capacity");}
 bool feasible(unsigned avail){Mask s=1;for(int i=0;i<N;i++){
  Mask next=!c[i]?s<<1:0,ss=s;
  while(ss){int h=uint64_t(ss)?countr_zero(uint64_t(ss)):64+countr_zero(uint64_t(ss>>64));ss&=ss-1;int j=i-h,q=j/W*W+origin,t=j%W;bool valid=false;
   if(a[t]>=0)valid=k[q+a[t]]!=c[i];
   else{unsigned remaining=avail;while(remaining){int u=countr_zero(remaining);remaining&=remaining-1;if(k[q+u]!=c[i]){valid=true;break;}}}
   if(valid)next|=Mask(1)<<h;
  }s=next;if(!s)return false;
 }return true;}
 void dfs(int depth,unsigned avail){nodes++;if(!feasible(avail))return;if(depth==W){solutions++;winners.push_back(a);return;}int phase=depth%2?W-1-depth/2:depth/2;for(unsigned s=avail;s;s&=s-1){int u=countr_zero(s);a[phase]=u;dfs(depth+1,avail^(1u<<u));a[phase]=-1;}}
};
int main(int argc,char**argv){if(argc!=6){cerr<<"input first-origin last-origin original|plant plant-origin\n";return 2;}ifstream f(argv[1]);string x,y;f>>x>>y;auto c=decode(x),p=decode(y);auto k=primes();int start=stoi(argv[2]),end=stoi(argv[3]),o0=stoi(argv[5]);if(start<0||end>=O||start>end||o0<0||o0>=O)throw runtime_error("origin");Order truth{};for(int i=0;i<W;i++)truth[i]=(3*i+1)%W;if(string(argv[4])=="plant")c=encrypt(p,k,o0,truth);uint64_t n=0,s=0;auto t=chrono::steady_clock::now();for(int o=start;o<=end;o++){Search a(c,k,o);a.dfs(0,(1u<<W)-1);n+=a.nodes;s+=a.solutions;for(auto&v:a.winners){cout<<"origin "<<o<<" order ";for(int z:v)cout<<z<<' ';cout<<'\n';}}cout<<"origins "<<start<<".."<<end<<" nodes "<<n<<" solutions "<<s<<" seconds "<<chrono::duration<double>(chrono::steady_clock::now()-t).count()<<'\n';}
