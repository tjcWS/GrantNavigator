import { apiRequest } from '@/shared/api';
import type { Grant } from '@/entities/grant/model/types';
import type { Project } from '@/entities/project/model/types';
import { Application, ApplicationListItem, ApplicationStatus, CheckResult, CheckIssue } from '../model/types';
type GrantWithIds = Grant & { sections: (Grant['sections'][number] & { id:number })[] };

interface ApiAnswer { section_id:number; content:string; updated_at:string }
interface ApiCheck { id:number; score:number; recommendations:string[]; checked_at:string; issues:{section_title:string;severity:'error'|'warning'|'ok';message:string}[] }
interface ApiApplication { id:number; project_id:number; grant_id:number; title:string; status:'preparation'|'ready'|'submitted'|'review'|'result'; created_at:string; updated_at:string; answers:ApiAnswer[]; latest_check:ApiCheck|null }
interface ApiProject { id:number; owner_id:number; title:string; short_description:string; full_description:string; goals:string; tasks:string; audience:string; results:string; created_at:string; updated_at:string }
interface ApiDirection {id:number;name:string}
interface ApiGrant {id:number;title:string;organizer:string;short_description:string;description:string;requirements:string[];criteria:string[];tags:string[];funding:string;deadline:string;directions:ApiDirection[];sections:{id:number;code:string;title:string;hint:string;order_index:number}[]}
const statusFromApi:Record<ApiApplication['status'],ApplicationStatus>={preparation:'preparation',ready:'ready',submitted:'submitted',review:'under_review',result:'result_received'};
const statusToApi:Record<ApplicationStatus,ApiApplication['status']>={preparation:'preparation',ready:'ready',submitted:'submitted',under_review:'review',result_received:'result'};
const mapProject=(p:ApiProject):Project=>({id:p.id,ownerId:p.owner_id,title:p.title,shortDescription:p.short_description,fullDescription:p.full_description,goals:p.goals,tasks:p.tasks,targetAudience:p.audience,expectedResults:p.results,createdAt:p.created_at,updatedAt:p.updated_at});
function mapCheck(check:ApiCheck|null, grant:GrantWithIds):CheckResult|null {
  if(!check)return null;
  const issues:CheckIssue[]=check.issues.filter(i=>i.severity!=='ok').map(i=>{
    const section=grant.sections.find(s=>s.title===i.section_title);
    const recommendation=check.recommendations.find(r=>r.includes(i.section_title)) ?? 'Уточните содержание раздела и добавьте конкретные сведения.';
    return {severity:i.severity==='error'?'error':'warning',sectionKey:section?.key ?? null,message:i.message,recommendation};
  });
  return {checkedAt:check.checked_at,score:check.score,summary:check.score>=85?'Заявка хорошо соответствует требованиям':check.score>=60?'Заявку стоит дополнить':'Нужно доработать обязательные разделы',issues};
}
function mapApplication(a:ApiApplication,grant:GrantWithIds):Application {
  const answers:Record<string,string>={};
  a.answers.forEach(answer=>{const section=grant.sections.find(s=>s.id===answer.section_id); if(section)answers[section.key]=answer.content;});
  const contentUpdatedAt=a.answers.reduce((latest,answer)=>answer.updated_at>latest?answer.updated_at:latest,a.created_at);
  return {id:a.id,projectId:a.project_id,grantId:a.grant_id,title:a.title,answers,status:statusFromApi[a.status],checkResult:mapCheck(a.latest_check,grant),createdAt:a.created_at,updatedAt:a.updated_at,contentUpdatedAt:contentUpdatedAt};
}
async function details(id:number) {
  const a=await apiRequest<ApiApplication>(`/applications/${id}`);
  const [rawGrant,rawProject]=await Promise.all([apiRequest<ApiGrant>(`/grants/${a.grant_id}`),apiRequest<ApiProject>(`/projects/${a.project_id}`)]);
  const grant:GrantWithIds={id:rawGrant.id,title:rawGrant.title,organizer:rawGrant.organizer,description:rawGrant.description,requirements:rawGrant.requirements.join('\n'),criteria:rawGrant.criteria,fundingAmount:Number((rawGrant.funding.match(/[\d\s]+/)?.[0]??'0').replace(/\s/g,'')),deadline:rawGrant.deadline,directions:rawGrant.directions.map(d=>d.name),sections:rawGrant.sections.map(s=>({id:s.id,key:s.code,title:s.title,hint:s.hint,required:true,maxLength:10000}))};
  const application=mapApplication(a,grant);
  return {application,grant,project:mapProject(rawProject)};
}
export interface ApplicationDetails { application:Application; grant:Grant; project:Project }
export const applicationApi={
  async list(filter:{status?:ApplicationStatus;projectId?:number}={}):Promise<ApplicationListItem[]> {
    const raw=await apiRequest<ApiApplication[]>('/applications');
    const rows=await Promise.all(raw.map(async a=>{const d=await details(a.id);return {...d.application,grantTitle:d.grant.title,grantDeadline:d.grant.deadline,projectTitle:d.project.title};}));
    return rows.filter(a=>(!filter.status||a.status===filter.status)&&(filter.projectId===undefined||a.projectId===filter.projectId)).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
  },
  getById:details,
  async create(input:{projectId:number;grantId:number}):Promise<Application> {
    const [project,grant]=await Promise.all([apiRequest<ApiProject>(`/projects/${input.projectId}`),apiRequest<ApiGrant>(`/grants/${input.grantId}`)]);
    const created=await apiRequest<ApiApplication>('/applications',{method:'POST',body:JSON.stringify({project_id:input.projectId,grant_id:input.grantId,title:`${project.title} — ${grant.title}`.slice(0,300)})});
    const prefill:Record<string,string>={relevance:project.full_description||project.short_description,goals:[project.goals,project.tasks].filter(Boolean).join('\n\n'),audience:project.audience,results:project.results};
    const content:Record<number,string>={};
    grant.sections.forEach(s=>{if(prefill[s.code])content[s.id]=prefill[s.code];});
    if(Object.keys(content).length) await apiRequest(`/applications/${created.id}/answers`,{method:'PUT',body:JSON.stringify({content})});
    return (await details(created.id)).application;
  },
  async save(id:number,input:{title:string;answers:Record<string,string>}):Promise<Application> {
    await apiRequest(`/applications/${id}`,{method:'PATCH',body:JSON.stringify({title:input.title})});
    const {grant}=await details(id); const content:Record<number,string>={};
    (grant as GrantWithIds).sections.forEach(s=>{content[s.id]=input.answers[s.key]??'';});
    await apiRequest(`/applications/${id}/answers`,{method:'PUT',body:JSON.stringify({content})});
    return (await details(id)).application;
  },
  async setStatus(id:number,status:ApplicationStatus):Promise<Application> {
    await apiRequest(`/applications/${id}`,{method:'PATCH',body:JSON.stringify({status:statusToApi[status]})});
    return (await details(id)).application;
  },
  async runCheck(id:number):Promise<Application> {
    await apiRequest(`/applications/${id}/check`,{method:'POST'});
    return (await details(id)).application;
  },
  async remove(id:number):Promise<void>{await apiRequest<void>(`/applications/${id}`,{method:'DELETE'});},
};
