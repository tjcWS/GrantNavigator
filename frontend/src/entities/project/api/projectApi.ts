import { apiRequest } from '@/shared/api';
import { Project, ProjectInput, ProjectWithStats } from '../model/types';

interface ApiProject { id:number; owner_id:number; title:string; short_description:string; full_description:string; goals:string; tasks:string; audience:string; results:string; created_at:string; updated_at:string; }
const fromApi = (p:ApiProject, applicationsCount=0):ProjectWithStats => ({
  id:p.id, ownerId:p.owner_id, title:p.title, shortDescription:p.short_description,
  fullDescription:p.full_description, goals:p.goals, tasks:p.tasks, targetAudience:p.audience,
  expectedResults:p.results, createdAt:p.created_at, updatedAt:p.updated_at, applicationsCount,
});
const toApi = (p:ProjectInput) => ({ title:p.title, short_description:p.shortDescription,
  full_description:p.fullDescription, goals:p.goals, tasks:p.tasks, audience:p.targetAudience, results:p.expectedResults });

export const projectApi = {
  async list():Promise<ProjectWithStats[]> {
    const [projects, applications] = await Promise.all([
      apiRequest<ApiProject[]>('/projects'), apiRequest<{project_id:number}[]>('/applications'),
    ]);
    const counts = new Map<number,number>();
    applications.forEach(a => counts.set(a.project_id, (counts.get(a.project_id) ?? 0)+1));
    return projects.sort((a,b)=>b.updated_at.localeCompare(a.updated_at)).map(p=>fromApi(p, counts.get(p.id) ?? 0));
  },
  async getById(id:number):Promise<ProjectWithStats> {
    const [p, applications] = await Promise.all([
      apiRequest<ApiProject>(`/projects/${id}`), apiRequest<{project_id:number}[]>('/applications'),
    ]);
    return fromApi(p, applications.filter(a=>a.project_id===id).length);
  },
  async create(input:ProjectInput):Promise<ProjectWithStats> {
    const p=await apiRequest<ApiProject>('/projects',{method:'POST',body:JSON.stringify(toApi(input))});
    return fromApi(p);
  },
  async update(id:number,input:ProjectInput):Promise<ProjectWithStats> {
    const p=await apiRequest<ApiProject>(`/projects/${id}`,{method:'PATCH',body:JSON.stringify(toApi(input))});
    return projectApi.getById(p.id);
  },
  async remove(id:number):Promise<void> { await apiRequest<void>(`/projects/${id}`,{method:'DELETE'}); },
};
