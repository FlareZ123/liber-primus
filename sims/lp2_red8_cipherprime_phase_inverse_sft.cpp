// Agent24: one new mapped-red8 clock family. No p55 lexical fit.
// Reuse the already calibrated known-clock affine inverse, no new workflow.
#define main previous_line_sft_main
#include "lp2_red8_minimum_line_reset_sft.cpp"
#undef main
const vector<int> P55LINE{24,46,68};
const array<int,29> GPPRIME{2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109};
struct Params{int start,d,m,a,b;};
int inc(int x,const Params&t){return (t.d+t.m*GPPRIME[x])&7;}
vector<int> boundarySteps(const vector<string>&groups,const vector<int>&lines,const Params&t){
 vector<int> v(join(groups).size(),0);
 for(int i:boundaries(groups))v[i]+=t.a;
 for(int i:lines)v[i]+=t.b;
 return v;
}
unsigned reach(const string&c,const vector<int>&B,const Params&t,int start){
 unsigned mask=1u<<start;
 for(size_t i=0;i<c.size()&&mask;i++){unsigned next=0;int x=fixed::val(c[i]);
  for(int q=0;q<8;q++)if(mask&(1u<<q)){
   int j=(q+B[i])&7;
   if(!x)next|=1u<<j;
   if(x!=K[j])next|=1u<<((j+inc(x,t))&7);
  }mask=next;
 }return mask;
}
vector<Path> phasePaths(const string&c,const vector<int>&B,const Params&t,int start){
 vector<Path> out;Path p;p.start=start;
 function<void(int,int)> walk=[&](int i,int j){
  if(i==int(c.size())){p.end=j;out.push_back(p);return;}
  j=(j+B[i])&7;int x=fixed::val(c[i]);
  if(!x){p.key.push_back(-1);walk(i+1,j);p.key.pop_back();}
  if(x!=K[j]){p.key.push_back(K[j]);walk(i+1,(j+inc(x,t))&7);p.key.pop_back();}
 };
 walk(0,start);return out;
}
Plant phasePlant(const vector<string>&shape,const vector<string>&held,unsigned seed,const Params&t){
 mt19937 rng(seed);Plant p;for(int i=0;i<29;i++)p.pi[i]=i;
 shuffle(p.pi.begin()+1,p.pi.end(),rng);
 int scale=aff::inv[p.pi[19]];for(auto&x:p.pi)x=aff::mul[x][scale];
 auto ip=inverse(p.pi);auto choose=[&](int n){auto&v=fixed::by[n];return v[rng()%v.size()];};
 for(int i=0;i<47;i++)p.truth.push_back(choose(shape[i].size()));
 string carry=choose(11);p.truth.push_back(carry.substr(0,10));p.holdTruth.push_back(carry);
 for(size_t i=1;i<held.size();i++)p.holdTruth.push_back(choose(held[i].size()));
 string plain=join(p.truth)+carry.substr(10);for(size_t i=1;i<p.holdTruth.size();i++)plain+=p.holdTruth[i];
 auto B=boundarySteps(shape,LINE,t),H=boundarySteps(held,P55LINE,t);B.insert(B.end(),H.begin(),H.end());
 string cipher;int j=t.start;p.path.start=j;
 for(int i=0;i<int(plain.size());i++){
  j=(j+B[i])&7;int a=fixed::val(plain[i]);if(i<223)p.path.key.push_back(a?K[j]:-1);
  if(a){int x=ip[(p.pi[a]+p.pi[K[j]])%29];cipher+=fixed::SYM[x];j=(j+inc(x,t))&7;}else cipher+='0';
  if(i==222)p.path.end=j;
 }
 p.train=split(cipher.substr(0,223),shape);p.held=split(cipher.substr(223),held);return p;
}
bool phaseControl(const vector<string>&train,const vector<string>&held,unsigned seed,const Params&t){
 auto p=phasePlant(train,held,seed,t);Search s(p.train,p.path);s.run(120);
 bool exact=s.found&&s.answer==p.pi&&s.oov==0,truth=false;
 if(exact){auto w=split(decode(join(p.train),p.path,s.answer),p.train);
  for(auto&h:phasePaths(join(p.held),boundarySteps(p.held,P55LINE,t),t,p.path.end)){
   auto q=split(decode(join(p.held),h,s.answer),p.held);q[0]=w.back()+q[0];if(q==p.holdTruth)truth=true;
  }exact=exact&&w==p.truth;
 }
 cout<<"CIPHERPRIME CONTROL "<<seed<<" exact="<<exact<<" heldout="<<truth<<endl;
 return exact&&truth;
}
int main(){try{
 aff::init();fixed::dictionary();
 auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");
 auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": [")),held=fixed::strings(src,"groups",src.rfind("\"p55\""));
 auto C=join(train),H=join(held);
 fixed::require(train.size()==48&&C.size()==223&&held.size()==17&&H.size()==76&&train.back()=="63g2eis46q"&&held[0]=="l","profile");
 array<int,8> first{},joint{},paths54{},pathsJoint{};vector<Params> candidates;
 for(int m=0;m<8;m++)for(int d=0;d<8;d++)for(int a=0;a<8;a++)for(int b=0;b<8;b++){
  Params t{0,d,m,a,b};auto B=boundarySteps(train,LINE,t),G=boundarySteps(held,P55LINE,t);
  for(int start=0;start<8;start++){t.start=start;
   if(!reach(C,B,t,start))continue;
   first[m]++;auto pp=phasePaths(C,B,t,start);paths54[m]+=pp.size();int count=0;
   for(auto&p:pp)count+=phasePaths(H,G,t,p.end).size();
   if(count){joint[m]++;pathsJoint[m]+=count;candidates.push_back(t);}
  }
 }
 for(int m=0;m<8;m++)cout<<"STRUCTURAL m="<<m<<" p54="<<first[m]<<" histories="<<paths54[m]<<" joint="<<joint[m]<<" joint_histories="<<pathsJoint[m]<<endl;
 fixed::require(first==array<int,8>{1,1,5,0,2,1,0,1}&&paths54==array<int,8>{2,4,8,0,2,8,0,1},"V8 structural counts");
 fixed::require(candidates.size()==1&&joint[1]==1&&pathsJoint[1]==8,"joint gate");
 auto t=candidates.front();fixed::require(t.start==1&&t.d==2&&t.m==1&&t.a==1&&t.b==5,"frozen candidate");
 auto B=boundarySteps(train,LINE,t),G=boundarySteps(held,P55LINE,t);
 auto pp=phasePaths(C,B,t,t.start);
 vector<Path> eligible;
 for(auto&p:pp)if(reach(H,G,t,p.end))eligible.push_back(p);
 fixed::require(pp.size()==4&&eligible.size()==2,"two joint-compatible p54 histories");
 cout<<"CANDIDATE start="<<t.start<<" d="<<t.d<<" m="<<t.m<<" word="<<t.a<<" line="<<t.b<<" eligible="<<eligible.size()<<endl;
 bool u=phaseControl(train,held,3301,t),v=phaseControl(train,held,1033,t);
 if(!u||!v){cout<<"ORIGINAL GATED OFF"<<endl;return 2;}
 int exhausted=0,found=0;uint64_t nodes=0,joins=0,done=0,perms=0;
 for(size_t i=0;i<eligible.size();i++){
  auto&p=eligible[i];cout<<"ORIGINAL PATH "<<i<<" holds";for(size_t q=0;q<p.key.size();q++)if(p.key[q]<0)cout<<" "<<q;cout<<endl;
  Search s(train,p);s.run(240);nodes+=s.nodes;joins+=s.joins;done+=s.done;perms+=s.perms;
  if(s.found){found++;auto w=split(decode(C,p,s.answer),train);
   cout<<"TRAIN CANDIDATE "<<aff::str(s.answer)<<" OOV="<<s.oov;for(auto&x:w)cout<<" "<<x;cout<<endl;
   for(auto&h:phasePaths(H,G,t,p.end)){auto q=split(decode(H,h,s.answer),held);q[0]=w.back()+q[0];
    int hit=count_if(q.begin(),q.end(),[](const string&x){return fixed::dict.count(x);});
    cout<<"P55 LEXICAL HOLDOUT "<<hit<<"/17";for(auto&x:q)cout<<" "<<x;cout<<endl;
   }
  }else if(!s.timed&&s.done==s.total)exhausted++;
 }
 cout<<"CIPHERPRIME ORIGINAL exhausted="<<exhausted<<"/"<<eligible.size()<<" found="<<found<<" nodes="<<nodes<<" joins="<<joins<<" seeds="<<done<<" perms="<<perms<<endl;
 return exhausted==int(eligible.size())?0:1;
 }catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
