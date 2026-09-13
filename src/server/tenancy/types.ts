export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  emailVerified: boolean;
  verifyToken: string | null;
  workspaceId: string;
  createdAt: string;
};

export type Agent = {
  id: string;
  workspaceId: string;
  name: string;
  purpose: string;
  status: "draft" | "active" | "paused";
  triggers: string[];
  createdAt: string;
  updatedAt: string;
};

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  ownerUserId: string;
  createdAt: string;
};

export type TenantSnapshot = {
  user: User;
  workspace: Workspace;
  agents: Agent[];
};
