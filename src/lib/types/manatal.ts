export interface ManatalCandidate {
  id: number;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  current_position: string | null;
  current_company: string | null;
  description: string | null;
  resume: string | null;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface ManatalEducation {
  id: number;
  school: string | null;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface ManatalExperience {
  id: number;
  company: string | null;
  title: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  is_current: boolean;
}

export interface ManatalSearchResponse {
  results: ManatalCandidate[];
  count: number;
  next: string | null;
  previous: string | null;
}
