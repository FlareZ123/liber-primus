#include <algorithm>
#include <array>
#include <bit>
#include <bitset>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <limits>
#include <stdexcept>
#include <string>
#include <vector>
using namespace std;
constexpr int W=14,N=196,H=14,FIT=140,AL=29,MAXH=32,ST=MAXH*4;
constexpr double NEG=-1e100;
using Bits=bitset<64>;using Tape=array<int,N>;using Order=array<int,W>;
vector<int> primeclock(){vector<int> k;for(int n=2;k.size()<3500;n++){bool p=true;for(int d=2;d*d<=n;d++)if(n%d==0){p=false;break;}if(p)k.push_back((n-1)%29);}return k;}
vector<int> decode(const string&s){vector<int>a;for(char v:s){int x=v>='a'?v-'a'+10:v-'0';if(x<0||x>=AL)throw runtime_error("rune");a.push_back(x);}return a;}
Tape asTape(const vector<int>&a,int offset=0){if(offset+N>(int)a.size())throw runtime_error("length");Tape p;copy_n(a.begin()+offset,N,p.begin());return p;}
Tape encrypt(const Tape&p,const Order&o,const vector<int>&k,int origin){Tape c{};int q=origin;for(int i=0;i<N;i++){int v=p[i];c[(i/W)*W+o[i%W]]=v?(v+k[q++])%AL:0;}return c;}
struct Model{array<double,AL>u{};array<double,AL*AL>b{};array<double,AL*AL*AL>t{};Model(const vector<int>&v,int exclude){array<double,AL>uc{};array<double,AL*AL>bc{};array<double,AL*AL*AL>tc{};int total=0;for(int i=0;i<(int)v.size();i++)if(exclude<0||i<exclude||i>=exclude+N){int x=v[i];uc[x]++;total++;if(i>0&&(exclude<0||i-1<exclude||i-1>=exclude+N)){bc[v[i-1]*AL+x]++;if(i>1&&(exclude<0||i-2<exclude||i-2>=exclude+N))tc[(v[i-2]*AL+v[i-1])*AL+x]++;}}
 for(int x=0;x<AL;x++)u[x]=(uc[x]+.5)/(total+AL*.5);
 for(int a=0;a<AL;a++){double s=0;for(int x=0;x<AL;x++)s+=bc[a*AL+x];for(int x=0;x<AL;x++)b[a*AL+x]=(bc[a*AL+x]+5*u[x])/(s+5);}
 for(int a=0;a<AL;a++)for(int z=0;z<AL;z++){double s=0;for(int x=0;x<AL;x++)s+=tc[(a*AL+z)*AL+x];for(int x=0;x<AL;x++)t[(a*AL+z)*AL+x]=log((tc[(a*AL+z)*AL+x]+5*b[z*AL+x])/(s+5));}
 for(double&x:u)x=log(x);for(double&x:b)x=log(x);
 }};
struct Viterbi{double score=NEG;int h=0,hist=0;vector<int> path;};
Viterbi score(const Tape&c,const Order&o,const vector<int>&k,int origin,const Model&m,int start,int end,int h0=0,int hist0=0,bool trace=false){
 Tape x{};for(int i=0;i<end;i++)x[i]=c[i/W*W+o[i%W]];
 // h and the last two literal-hold flags uniquely determine previous runes.
 array<double,ST>a0,b0;double*a=a0.data();double*b=b0.data();fill_n(a,(h0+1)*4,NEG);a[h0*4+hist0]=0;int hz=h0;
 array<array<short,ST>,N>prev;array<array<unsigned char,ST>,N>sym;
 for(int i=start;i<end;i++){
  int v=x[i];if(hz+(v==0)>=MAXH)throw runtime_error("too many zeros");fill_n(b,(hz+1+(v==0))*4,NEG);for(int h=0;h<=hz;h++)for(int hist=0;hist<4;hist++){
   int st=h*4+hist;double base=a[st];if(base==NEG)continue;int last=-1,pen=-1;
   if(i>0)last=hist&1?0:(x[i-1]-k[origin+i-1-h]+AL)%AL;
   if(i>1)pen=hist&2?0:(x[i-2]-k[origin+i-2-h+(hist&1)]+AL)%AL;
   auto add=[&](int p,int nh,int hold){int ns=nh*4+((hist<<1)&3)+hold;double q=base+(i==0?m.u[p]:i==1?m.b[last*AL+p]:m.t[(pen*AL+last)*AL+p]);if(q>b[ns]){b[ns]=q;if(trace){prev[i][ns]=st;sym[i][ns]=p;}}};
   int p=(v-k[origin+i-h]+AL)%AL;if(p!=0&&p!=12&&p!=22)add(p,h,0);if(v==0)add(0,h+1,1);
  }
  if(v==0)hz++;swap(a,b);
 }
 int best=int(max_element(a,a+(hz+1)*4)-a);Viterbi out;out.score=a[best];out.h=best/4;out.hist=best%4;if(trace&&out.score!=NEG){out.path.resize(end-start);for(int i=end-1;i>=start;i--){out.path[i-start]=sym[i][best];best=prev[i][best];}}return out;
}
struct Tables{vector<array<Bits,AL>>good;Tables(const vector<int>&k):good(k.size()){for(int q=0;q<(int)k.size();q++)for(int c=0;c<AL;c++){if(q)good[q][c]=good[q-1][c]<<1;int p=(c-k[q]+AL)%AL;if(p&&p!=12&&p!=22)good[q][c].set(0);}}};
struct Fit{double score=NEG;int origin=-1;Order order{};uint64_t ties=0;};
struct Search{const Tape&c;const Tables&t;const vector<int>&k;const Model&m;int origin;uint64_t nodes=0,legal=0;Order a{};array<unsigned,H>zero{};Fit best{};
 Search(const Tape&c,const Tables&t,const vector<int>&k,const Model&m,int o):c(c),t(t),k(k),m(m),origin(o){for(int r=0;r<FIT/W;r++)for(int j=0;j<W;j++)if(!c[r*W+j])zero[r]|=1u<<j;}
 bool feasible(int d,unsigned chosen){Bits s(1);int left=(d+1)/2,right=W-d/2;for(int r=0;r<FIT/W;r++){auto step=[&](int slot){int v=c[r*W+a[slot]];Bits n=s&t.good[origin+r*W+slot][v];if(!v)n|=s<<1;s=n;return s.any();};for(int j=0;j<left;j++)if(!step(j))return false;int z=popcount(zero[r]&~chosen);for(int j=0;j<z;j++)s|=s<<1;for(int j=right;j<W;j++)if(!step(j))return false;}return true;}
 void dfs(int d,unsigned chosen){nodes++;if(!feasible(d,chosen))return;if(d==W){legal++;auto s=score(c,a,k,origin,m,0,FIT);if(s.score>best.score){best={s.score,origin,a,1};}else if(s.score==best.score)best.ties++;return;}int slot=d%2?W-1-d/2:d/2;for(int j=0;j<W;j++)if(!(chosen&(1u<<j))){a[slot]=j;dfs(d+1,chosen|(1u<<j));}}
};
int main(int argc,char**argv){if(argc!=5){cerr<<"usage: black-input full-native-input original|plant1|plant2 origin(-1 all three)\n";return 2;}ifstream f(argv[1]);string rawstr;f>>rawstr;ifstream g(argv[2]);string cstr,nstr;g>>cstr>>nstr;auto native=decode(nstr),k=primeclock();Tape raw=asTape(decode(rawstr));string mode=argv[3];int offset=mode=="plant1"?392:mode=="plant2"?980:-1;Model m(native,offset);Order truth=mode=="plant2"?Order{8,12,2,6,11,1,13,7,3,5,9,0,10,4}:Order{2,8,9,1,12,13,11,4,5,7,3,0,6,10};int planted=mode=="plant2"?3301:0;Tape p{};if(offset>=0){p=asTape(native,offset);raw=encrypt(p,truth,k,planted);}Tables t(k);Fit winner;int only=stoi(argv[4]);auto tm=chrono::steady_clock::now();for(int origin:{0,1033,3301}){if(only>=0&&origin!=only)continue;Search s(raw,t,k,m,origin);s.dfs(0,0);cout<<"origin "<<origin<<" nodes "<<s.nodes<<" keys "<<s.legal<<" best "<<s.best.score/FIT<<" ties "<<s.best.ties<<" order ";for(int j:s.best.order)cout<<j<<' ';cout<<'\n'<<flush;if(s.best.score>winner.score)winner=s.best;}
 if(winner.origin<0){cout<<"no fit\n";return 0;}auto prefix=score(raw,winner.order,k,winner.origin,m,0,FIT,0,0,true);auto suffix=score(raw,winner.order,k,winner.origin,m,FIT,N,prefix.h,prefix.hist,true);cout<<"winner "<<winner.origin<<" score "<<prefix.score/FIT<<" held "<<(suffix.score==NEG?NEG:suffix.score/(N-FIT))<<" h "<<prefix.h<<" seconds "<<chrono::duration<double>(chrono::steady_clock::now()-tm).count()<<'\n';auto pack=[](const vector<int>&x){string z;for(int p:x)z+=p<10?char('0'+p):char('a'+p-10);return z;};cout<<"prefix "<<pack(prefix.path)<<"\nsuffix "<<pack(suffix.path)<<'\n';if(suffix.score!=NEG){vector<int> path=prefix.path;path.insert(path.end(),suffix.path.begin(),suffix.path.end());if(encrypt(asTape(path),winner.order,k,winner.origin)!=raw)throw runtime_error("replay");}if(offset>=0){int cp=0,cs=0;for(int i=0;i<(int)prefix.path.size();i++)cp+=prefix.path[i]==p[i];for(int i=0;i<(int)suffix.path.size();i++)cs+=suffix.path[i]==p[FIT+i];cout<<"true origin "<<planted<<" order equal "<<(winner.order==truth)<<" prefix correct "<<cp<<" suffix correct "<<cs<<'\n';}
}
