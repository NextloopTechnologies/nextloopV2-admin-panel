export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      applied_jobs: {
        Row: {
          cover_letter: string | null
          created_at: string
          email: string
          fullname: string
          github_url: string | null
          id: number
          job_id: number | null
          linkedin_url: string | null
          phone: string
          resume_id: string | null
          resume_url: string
          experience: string | null
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          email: string
          fullname: string
          github_url?: string | null
          id?: number
          job_id?: number | null
          linkedin_url?: string | null
          phone: string
          resume_id?: string | null
          resume_url: string
          experience?: string | null
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          email?: string
          fullname?: string
          github_url?: string | null
          id?: number
          job_id?: number | null
          linkedin_url?: string | null
          phone?: string
          resume_id?: string | null
          resume_url?: string
          experience?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applied_jobs_job_id_jobs_id_fk"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      author: {
        Row: {
          created_at: string
          designation: string | null
          id: number
          name: string | null
          profile: string | null
        }
        Insert: {
          created_at?: string
          designation?: string | null
          id?: number
          name?: string | null
          profile?: string | null
        }
        Update: {
          created_at?: string
          designation?: string | null
          id?: number
          name?: string | null
          profile?: string | null
        }
        Relationships: []
      }
      blogs: {
        Row: {
          author_id: number | null
          created_at: string
          descp: string | null
          id: number
          image: Json | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          author_id?: number | null
          created_at?: string
          descp?: string | null
          id?: number
          image?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: number | null
          created_at?: string
          descp?: string | null
          id?: number
          image?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blogs_author_id_author_id_fk"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "author"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiry: {
        Row: {
          contact: string | null
          created_at: string
          email: string
          fullname: string
          id: number
          subject: string
          message: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          email: string
          fullname: string
          id?: number
          subject: string
          message: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          email?: string
          fullname?: string
          id?: number
          subject?: string
          message?: string
        }
        Relationships: []
      }
      ideas: {
        Row: {
          created_at: string
          id: number
          idea_descp: string
          mail: string
        }
        Insert: {
          created_at?: string
          id?: number
          idea_descp: string
          mail: string
        }
        Update: {
          created_at?: string
          id?: number
          idea_descp?: string
          mail?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          created_at: string
          descp: string | null
          id: number
          job_mode: Database["public"]["Enums"]["enum_job_mode"] | null
          job_type: Database["public"]["Enums"]["enum_job_type"] | null
          location: string | null
          qualifications: string[] | null
          responsibilities: string[] | null
          skills: string[] | null
          title: string | null
          updated_at: string | null
          visibility: boolean
        }
        Insert: {
          created_at?: string
          descp?: string | null
          id?: number
          job_mode?: Database["public"]["Enums"]["enum_job_mode"] | null
          job_type?: Database["public"]["Enums"]["enum_job_type"] | null
          location?: string | null
          qualifications?: string[] | null
          responsibilities?: string[] | null
          skills?: string[] | null
          title?: string | null
          updated_at?: string | null
          visibility?: boolean
        }
        Update: {
          created_at?: string
          descp?: string | null
          id?: number
          job_mode?: Database["public"]["Enums"]["enum_job_mode"] | null
          job_type?: Database["public"]["Enums"]["enum_job_type"] | null
          location?: string | null
          qualifications?: string[] | null
          responsibilities?: string[] | null
          skills?: string[] | null
          title?: string | null
          updated_at?: string | null
          visibility?: boolean
        }
        Relationships: []
      }
      offer_applications: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          id: number
          mobile: string
          name: string
          offer_id: number | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          id?: number
          mobile: string
          name: string
          offer_id?: number | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          id?: number
          mobile?: string
          name?: string
          offer_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_applications_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          active: boolean
          created_at: string
          description: string
          id: number
          "t&c_points": string[] | null
          title: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description: string
          id?: number
          "t&c_points"?: string[] | null
          title: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          id?: number
          "t&c_points"?: string[] | null
          title?: string
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          active: boolean
          created_at: string
          descp: string | null
          id: number
          image: Json[] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          descp?: string | null
          id?: number
          image?: Json[] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          descp?: string | null
          id?: number
          image?: Json[] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          comp_and_desig: string | null
          created_at: string
          feedback_by: string | null
          feedback_descp: string | null
          id: number
        }
        Insert: {
          comp_and_desig?: string | null
          created_at?: string
          feedback_by?: string | null
          feedback_descp?: string | null
          id?: number
        }
        Update: {
          comp_and_desig?: string | null
          created_at?: string
          feedback_by?: string | null
          feedback_descp?: string | null
          id?: number
        }
        Relationships: []
      }
      user: {
        Row: {
          created_at: string
          email: string
          id: number
          name: string
          password: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          name: string
          password: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          name?: string
          password?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      aal_level: "aal3" | "aal2" | "aal1"
      action: "ERROR" | "TRUNCATE" | "DELETE" | "UPDATE" | "INSERT"
      code_challenge_method: "plain" | "s256"
      enum_job_mode: "Remote" | "On-site" | "Hybrid"
      enum_job_type: "Full Time" | "Part Time" | "Contract"
      equality_op: "in" | "gte" | "gt" | "lte" | "lt" | "neq" | "eq"
      factor_status: "verified" | "unverified"
      factor_type: "webauthn" | "totp"
      key_status: "expired" | "invalid" | "valid" | "default"
      key_type:
        | "stream_xchacha20"
        | "secretstream"
        | "secretbox"
        | "kdf"
        | "generichash"
        | "shorthash"
        | "auth"
        | "hmacsha256"
        | "hmacsha512"
        | "aead-det"
        | "aead-ietf"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never





    
export type IJob = TablesInsert<'jobs'>

export type IAppliedJob = TablesUpdate<'applied_jobs'> & IJob 

export type ITestimonial = TablesInsert<'testimonials'>

export type IEnquiry = TablesInsert<'enquiry'>

export type IIdea = TablesInsert<'ideas'>

export type IBlogMutate = TablesInsert<'blogs'>

export type IPortfolioMutate = TablesInsert<'portfolio'>

export type IAuthor = TablesInsert<'author'>

export type IUser = {
  id: number;
  name: string;
  email: string;
}

export type IUserMutate = TablesInsert<'user'>