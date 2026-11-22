import { apiRequest } from '@/shared/api';
import { Grant } from '../model/types';
interface ApiDirection { id:number; name:string }
interface ApiSection { id:number; code:string; title:string; hint:string; order_index:number }
interface ApiGrant { id:number; title:string; organizer:string; short_description:string; description:string; requirements:string[]; criteria:string[]; tags:string[]; funding:string; deadline:string; directions:ApiDirection[]; sections:ApiSection[] }
function fromApi(g:ApiGrant):Grant {
  const amount = Number((g.funding.match(/[\d\s]+/)?.[0] ?? '0').replace(/\s/g,''));
  return { id:g.id, title:g.title, organizer:g.organizer, description:g.description,
    requirements:g.requirements.join('\n'), criteria:g.criteria, fundingAmount:amount,
    deadline:g.deadline, directions:g.directions.map(d=>d.name),
    sections:g.sections.map(s=>({key:s.code,title:s.title,hint:s.hint,required:true,maxLength:10000})) };
}
export const grantApi = {
  async list():Promise<Grant[]> { return (await apiRequest<ApiGrant[]>('/grants')).map(fromApi); },
  async getById(id:number):Promise<Grant> { return fromApi(await apiRequest<ApiGrant>(`/grants/${id}`)); },
};
