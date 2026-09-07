export type ProductStatus = 'live' | 'in-development' | 'concept' | 'prototype';
export type ProductTier = 'flagship' | 'ecosystem' | 'lab';
export type FlagshipMockup = 'inspector' | 'dashboard' | 'creative';
/** Whether the project's URL is currently reachable — independent of maturity `status`. */
export type ProjectAvailability = 'active' | 'inactive';

export interface Project {
  readonly id: number;
  readonly tier: ProductTier;
  readonly groupTitle: string | null;
  readonly mockup: FlagshipMockup | null;
  readonly name: string;
  readonly category: string;
  readonly tagline: string;
  readonly status: ProductStatus;
  readonly url: string | null;
  readonly repoUrl: string | null;
  readonly screenshot: string | null;
  readonly availability: ProjectAvailability;
  readonly activationRequestedAt: string | null;
  readonly sortOrder: number;
}

export type ProjectInput = Omit<
  Project,
  'id' | 'screenshot' | 'activationRequestedAt'
>;

export type TodoStatus = 'todo' | 'in_progress' | 'done';
export type TodoPriority = 'low' | 'medium' | 'high';

export interface Todo {
  readonly id: number;
  readonly title: string;
  readonly description: string | null;
  /** Derived server-side from `progress` — never set directly. */
  readonly status: TodoStatus;
  readonly priority: TodoPriority;
  readonly progress: number;
  readonly diaryDate: string | null;
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TodoInput {
  readonly title: string;
  readonly description?: string | null;
  readonly priority?: TodoPriority;
  readonly progress?: number;
  readonly diaryDate?: string | null;
  readonly sortOrder?: number;
}

export interface DiaryEntry {
  readonly date: string;
  readonly notes: string;
}

export interface AuthSession {
  readonly authenticated: boolean;
  readonly username?: string;
}
