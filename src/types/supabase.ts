export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          employee_code: string
          name: string
          role: 'Doctor' | 'Nurse' | 'Admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_code: string
          name: string
          role: 'Doctor' | 'Nurse' | 'Admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_code?: string
          name?: string
          role?: 'Doctor' | 'Nurse' | 'Admin'
          created_at?: string
          updated_at?: string
        }
      }
      procedures: {
        Row: {
          id: string
          patient_id: string
          performer_id: string
          name: string
          category: string
          description: string
          complications: string | null
          outcome: 'Successful' | 'Partially Successful' | 'Unsuccessful' | 'Abandoned'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          performer_id: string
          name: string
          category: string
          description: string
          complications?: string | null
          outcome: 'Successful' | 'Partially Successful' | 'Unsuccessful' | 'Abandoned'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          performer_id?: string
          name?: string
          category?: string
          description?: string
          complications?: string | null
          outcome?: 'Successful' | 'Partially Successful' | 'Unsuccessful' | 'Abandoned'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // ... rest of the existing types remain the same
    }
  }
}