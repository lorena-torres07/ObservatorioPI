export type UserRole = 'admin' | 'student' | 'professor' | 'partner';
export type ProjectStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'featured' | 'rejected';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: UserRole;
          avatar_url: string | null;
          bio: string;
          institution: string;
          course: string;
          linkedin_url: string;
          github_url: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      classes: {
        Row: {
          id: string;
          name: string;
          course: string;
          year: number;
          semester: '1' | '2';
          professor_id: string | null;
          description: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['classes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['classes']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          title: string;
          short_description: string;
          description: string;
          status: ProjectStatus;
          class_id: string | null;
          owner_id: string;
          cover_image_url: string | null;
          repository_url: string;
          demo_url: string;
          video_url: string;
          technologies: string[];
          semester_year: string;
          is_public: boolean;
          view_count: number;
          featured_at: string | null;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at' | 'view_count'>;
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['project_members']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['project_members']['Insert']>;
      };
      evaluations: {
        Row: {
          id: string;
          project_id: string;
          professor_id: string;
          overall_score: number | null;
          feedback: string;
          strengths: string;
          improvements: string;
          status: string;
          evaluated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['evaluations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['evaluations']['Insert']>;
      };
      evaluation_criteria: {
        Row: {
          id: string;
          name: string;
          description: string;
          max_score: number;
          weight: number;
          category: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['evaluation_criteria']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['evaluation_criteria']['Insert']>;
      };
      privacy_consents: {
        Row: {
          id: string;
          user_id: string;
          version: string;
          ip_address: string;
          user_agent: string;
          consented_at: string;
          revoked_at: string | null;
          is_active: boolean;
        };
        Insert: Omit<Database['public']['Tables']['privacy_consents']['Row'], 'id' | 'consented_at'>;
        Update: Partial<Database['public']['Tables']['privacy_consents']['Insert']>;
      };
      project_tags: {
        Row: {
          id: string;
          project_id: string;
          tag: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['project_tags']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['project_tags']['Insert']>;
      };
      ai_recommendations: {
        Row: {
          id: string;
          project_id: string;
          type: string;
          title: string;
          content: string;
          source: string;
          is_applied: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ai_recommendations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['ai_recommendations']['Insert']>;
      };
      class_professors: {
        Row: {
          id: string;
          class_id: string;
          professor_id: string;
          assigned_at: string;
        };
        Insert: Omit<Database['public']['Tables']['class_professors']['Row'], 'id' | 'assigned_at'>;
        Update: Partial<Database['public']['Tables']['class_professors']['Insert']>;
      };
      class_students: {
        Row: {
          id: string;
          class_id: string;
          student_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['class_students']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['class_students']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      project_status: ProjectStatus;
    };
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type Class = Database['public']['Tables']['classes']['Row'];
export type Evaluation = Database['public']['Tables']['evaluations']['Row'];
export type EvaluationCriteria = Database['public']['Tables']['evaluation_criteria']['Row'];
export type ProjectMember = Database['public']['Tables']['project_members']['Row'];
export type AiRecommendation = Database['public']['Tables']['ai_recommendations']['Row'];
export type ClassProfessor = Database['public']['Tables']['class_professors']['Row'];
export type ClassStudent = Database['public']['Tables']['class_students']['Row'];
