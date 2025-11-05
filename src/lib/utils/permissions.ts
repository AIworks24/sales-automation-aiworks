export type UserRole = 'admin' | 'manager' | 'rep';

export const permissions = {
  // Admin permissions
  canManageCompany: (role: UserRole) => role === 'admin',
  canManageTeam: (role: UserRole) => ['admin', 'manager'].includes(role),
  canManageBilling: (role: UserRole) => role === 'admin',
  canConfigureCRM: (role: UserRole) => role === 'admin',
  
  // Campaign permissions
  canCreateCampaigns: (role: UserRole) => ['admin', 'manager'].includes(role),
  canEditCampaigns: (role: UserRole) => ['admin', 'manager'].includes(role),
  canDeleteCampaigns: (role: UserRole) => role === 'admin',
  canViewAllCampaigns: (role: UserRole) => ['admin', 'manager'].includes(role),
  
  // Prospect permissions
  canViewAllProspects: (role: UserRole) => ['admin', 'manager'].includes(role),
  canEditAllProspects: (role: UserRole) => ['admin', 'manager'].includes(role),
  canAssignProspects: (role: UserRole) => ['admin', 'manager'].includes(role),
  canViewOwnProspects: (role: UserRole) => true, // Everyone can see their assigned prospects
  
  // Analytics permissions
  canViewCompanyAnalytics: (role: UserRole) => ['admin', 'manager'].includes(role),
  canViewTeamPerformance: (role: UserRole) => ['admin', 'manager'].includes(role),
  canViewOwnAnalytics: (role: UserRole) => true, // Everyone can see their own stats
  
  // Message permissions
  canSendMessages: (role: UserRole) => true, // Everyone can send messages
  canViewAllMessages: (role: UserRole) => ['admin', 'manager'].includes(role),
};

export const roleDescriptions = {
  admin: {
    name: 'Administrator',
    description: 'Full system access - manage team, campaigns, settings, and billing',
  },
  manager: {
    name: 'Manager',
    description: 'Manage campaigns, view all prospects and analytics, assign leads to reps',
  },
  rep: {
    name: 'Sales Representative',
    description: 'Work with assigned prospects, send messages, view own performance',
  },
};