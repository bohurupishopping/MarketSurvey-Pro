
export enum RespondentType {
  Distributor = 'Distributor',
  Retailer = 'Retailer',
  BulkBuyer = 'Bulk Buyer',
}

export enum QuestionGroup {
  BusinessProfile = 'Business Profile',
  MarketDemand = 'Market Demand',
  ProductPreference = 'Product Preference',
  PricingAndMargins = 'Pricing and Margins',
  Logistics = 'Logistics',
  CompetitorAnalysis = 'Competitor Analysis',
  CustomerInsights = 'Customer Insights',
}

export enum AnswerFormat {
  OpenText = 'Open Text',
  Numeric = 'Numeric',
  Date = 'Date',
  SingleChoice = 'Single Choice',
  MultipleChoice = 'Multiple Choice',
  RatingScale = 'Rating Scale (1-5)',
}

export interface Agent {
  agent_id: number;
  first_name: string;
  last_name?: string;
  contact_number: string;
  email?: string;
  hire_date?: string;
  is_active: boolean;
}

export interface Respondent {
  respondent_id: number;
  business_name: string;
  respondent_name?: string;
  type: RespondentType;
  contact_number?: string;
  years_in_business?: number;
}

export interface Location {
  location_id: number;
  respondent_id: number;
  address_line?: string;
  area_village?: string;
  district: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

export interface Survey {
  survey_id: number;
  respondent_id: number;
  agent_id: number;
  survey_date: string;
  agent_notes?: string;
}

export interface Question {
  question_id: number;
  question_code: string;
  question_text_bengali: string;
  question_text_english?: string;
  question_group?: QuestionGroup;
  target_respondent?: RespondentType;
  answer_format: AnswerFormat;
  is_active: boolean;
  options?: string[]; // For single/multiple choice
}

export interface Answer {
  answer_id: number;
  survey_id: number;
  question_id: number;
  answer_text?: string;
  answer_numeric?: number;
}

export interface FullSurveyData {
  respondent: Omit<Respondent, 'respondent_id'>;
  location: Omit<Location, 'location_id' | 'respondent_id'>;
  agent_id: number;
  answers: { question_id: number; answer_text?: string; answer_numeric?: number }[];
  agent_notes?: string;
}
