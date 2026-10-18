export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  problemStatement: string;
  purpose: string;
  mainGoal: string;
  expectedOutcome: string;
  scope: string;
  requirements: string;
  links: string;
  additionalInformation: string;
  /** true while the project still holds the bundled demo content */
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}
