#include <array>
#include <algorithm>
#include <chrono>
#include <cstdint>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>
using namespace std;
using U=uint32_t;
using I=uint64_t;
struct Seg{int n=0;bool zero=false;vector<array<int,29>> hist;};
template<int q> struct Solve{
 int m,lo=0,hi=28;U all;vector<Seg> seg;vector<vector<U>> allow,depth;vector<int>K,order,fixed;vector<vector<int>> domains;I tests=0,nodes=0,leaves=0;int bestE=-1,bestAny=-1,bestTarget=-1;vector<int>keyE,keyAny;chrono::steady_clock::time_point start;double limit;bool stopped=false;
 Solve(const vector<int>& C,double L):all((1u<<q)-1),K(q,-1),limit(L){
  seg.push_back(Seg{0,false,vector<array<int,29>>(q)});for(int c:C){if(!c){seg.back().zero=true;seg.push_back(Seg{0,false,vector<array<int,29>>(q)});}else{auto&s=seg.back();s.hist[s.n++%q][c]++;}}m=seg.size();
  allow.assign(q*29,vector<U>(m,all));depth.assign(q+1,vector<U>(m,all));domains.resize(q);
  // Bit s survives a run if assigned key digit j,k cannot decode a consuming F.
  for(int j=0;j<q;j++)for(int k=1;k<29;k++)for(int i=0;i<m;i++)for(int s=0;s<q;s++)if(seg[i].hist[(j-s+q)%q][k])allow[j*29+k][i]&=~(1u<<s);
 }
 U rot(U x,int n){n%=q;return ((x<<n)|(x>>(q-n)))&all;}
 bool extend(int d,int j,int k,U zero){tests++;U st=1;auto&a=depth[d];auto&b=depth[d+1];auto&v=allow[j*29+k];for(int i=0;i<m;i++){
  b[i]=a[i]&v[i];st=rot(st&b[i],seg[i].n);if(!st)return false;if(seg[i].zero)st|=rot(st&~zero,1);
 }return true;}
 // At fully assigned leaves, every surviving phase path is a legal inverse.
 int score(int tar){vector<int>a(q,-1),b(q);a[0]=0;for(int i=0;i<m;i++){
  fill(b.begin(),b.end(),-1);auto&s=seg[i];for(int p=0;p<q;p++)if(a[p]>=0&&(depth[q][i]&(1u<<p))){int v=a[p];for(int t=0;t<q;t++)v+=s.hist[t][(K[(p+t)%q]+tar)%29];int e=(p+s.n)%q;b[e]=max(b[e],v+(s.zero&&tar==0));if(s.zero&&K[e])b[(e+1)%q]=max(b[(e+1)%q],v+((29-K[e])%29==tar));}a.swap(b);
 }return *max_element(a.begin(),a.end());}
 void dfs(int d,U zero){nodes++;if((nodes&4095)==0&&chrono::duration<double>(chrono::steady_clock::now()-start).count()>limit){stopped=true;return;}if(d==q){leaves++;int e=score(18);if(e>bestE){bestE=e;keyE=K;}for(int t=1;t<29;t++){int z=t==18?e:score(t);if(z>bestAny){bestAny=z;keyAny=K;bestTarget=t;}}return;}int j=order[d];for(int k:domains[j]){if(d==0&&(k<lo||k>hi))continue;U z=zero|(!k?(1u<<j):0);if(extend(d,j,k,z)){K[j]=k;dfs(d+1,z);if(stopped)return;}}K[j]=-1;}
 void run(){start=chrono::steady_clock::now();for(int j=0;j<q;j++){order.push_back(j);for(int k=0;k<29;k++)if((fixed.empty()||fixed[j]==k)&&extend(0,j,k,!k?(1u<<j):0))domains[j].push_back(k);}stable_sort(order.begin(),order.end(),[&](int a,int b){return domains[a].size()<domains[b].size();});dfs(0,0);cout<<"range="<<lo<<"-"<<hi<<" q="<<q<<" complete="<<!stopped<<" leaves="<<leaves<<" nodes="<<nodes<<" tests="<<tests<<" E="<<bestE<<" any="<<bestAny<<" target="<<bestTarget<<" elapsed="<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<" keyE=";for(int k:keyE)cout<<k<<",";cout<<" keyAny=";for(int k:keyAny)cout<<k<<",";cout<<"\n";}
};
template<int Q> void run(const vector<int>&c,int argc,char**argv){Solve<Q> solver(c,argc>2?stod(argv[2]):12);if(argc>4){solver.lo=stoi(argv[3]);solver.hi=stoi(argv[4]);}if(argc>5){string k=argv[5];if(k.size()!=Q)throw runtime_error("wrong fixed key length");for(char a:k)solver.fixed.push_back(a<='9'?a-'0':a-'a'+10);}solver.run();}
int main(int argc,char**argv){string s;cin>>s;vector<int>c;for(char a:s)c.push_back(a<='9'?a-'0':a-'a'+10);int q=stoi(argv[1]);switch(q){case 2:run<2>(c,argc,argv);break;case 3:run<3>(c,argc,argv);break;case 9:run<9>(c,argc,argv);break;case 10:run<10>(c,argc,argv);break;case 11:run<11>(c,argc,argv);break;case 12:run<12>(c,argc,argv);break;case 13:run<13>(c,argc,argv);break;case 14:run<14>(c,argc,argv);break;default:return 1;}}
