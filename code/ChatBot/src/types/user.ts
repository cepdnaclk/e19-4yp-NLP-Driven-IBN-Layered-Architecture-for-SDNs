export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: {
    canEdit: boolean;
    canPush: boolean;
    canSimulate: boolean;
  };
}

export interface Feedback {
  id: string;
  intentId: string;
  userId: string;
  rating: 'positive' | 'negative';
  comment: string;
  timestamp: Date;
}
