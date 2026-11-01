export interface ProjectInput {
  title: string;
  shortDescription: string;
  fullDescription: string;
  goals: string;
  tasks: string;
  targetAudience: string;
  expectedResults: string;
}

export interface Project extends ProjectInput {
  id: number;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithStats extends Project {
  applicationsCount: number;
}
