
import { Agent, Respondent, Question, Survey, Answer, RespondentType, QuestionGroup, AnswerFormat, FullSurveyData } from '../types';
import sql from './db';

// Agents API
export const getAgents = async (): Promise<Agent[]> => {
  const result = await sql`SELECT * FROM agents WHERE is_active = true`;
  return result as Agent[];
};

export const addAgent = async (agent: Omit<Agent, 'agent_id'>): Promise<Agent> => {
  const { first_name, last_name, contact_number, email, hire_date, is_active } = agent;
  const result = await sql`INSERT INTO agents (first_name, last_name, contact_number, email, hire_date, is_active) VALUES (${first_name}, ${last_name || null}, ${contact_number}, ${email || null}, ${hire_date || null}, ${is_active !== undefined ? is_active : true}) RETURNING *`;
  return result[0] as Agent;
};

export const updateAgent = async (updatedAgent: Agent): Promise<Agent> => {
  const { agent_id, first_name, last_name, contact_number, email, hire_date, is_active } = updatedAgent;
  const result = await sql`UPDATE agents SET first_name = ${first_name}, last_name = ${last_name || null}, contact_number = ${contact_number}, email = ${email || null}, hire_date = ${hire_date || null}, is_active = ${is_active} WHERE agent_id = ${agent_id} RETURNING *`;
  return result[0] as Agent;
};

export const deleteAgent = async (agentId: number): Promise<{ success: boolean }> => {
  await sql`UPDATE agents SET is_active = false WHERE agent_id = ${agentId}`;
  return { success: true };
};

// Respondents API
export const getRespondents = async (): Promise<Respondent[]> => {
  const result = await sql`SELECT * FROM respondents`;
  return result.map(row => ({
    ...row,
    type: row.type as RespondentType,
  })) as Respondent[];
};

// Questions API
export const getQuestions = async (): Promise<Question[]> => {
  const result = await sql`SELECT * FROM question_master WHERE is_active = true`;
  return result.map(row => ({
    ...row,
    question_group: row.question_group as QuestionGroup,
    target_respondent: row.target_respondent as RespondentType,
    answer_format: row.answer_format as AnswerFormat,
    options: [], // Options not stored in DB, can be added separately if needed
  })) as Question[];
};

export const addQuestion = async (question: Omit<Question, 'question_id'>): Promise<Question> => {
  const { question_code, question_text_bengali, question_text_english, question_group, target_respondent, answer_format, is_active } = question;
  const result = await sql`INSERT INTO question_master (question_code, question_text_bengali, question_text_english, question_group, target_respondent, answer_format, is_active) VALUES (${question_code}, ${question_text_bengali}, ${question_text_english || null}, ${question_group || null}, ${target_respondent || null}, ${answer_format}, ${is_active !== undefined ? is_active : true}) RETURNING *`;
  return result[0] as Question;
};

export const updateQuestion = async (updatedQuestion: Question): Promise<Question> => {
  const { question_id, question_code, question_text_bengali, question_text_english, question_group, target_respondent, answer_format, is_active } = updatedQuestion;
  const result = await sql`UPDATE question_master SET question_code = ${question_code}, question_text_bengali = ${question_text_bengali}, question_text_english = ${question_text_english || null}, question_group = ${question_group || null}, target_respondent = ${target_respondent || null}, answer_format = ${answer_format}, is_active = ${is_active} WHERE question_id = ${question_id} RETURNING *`;
  return result[0] as Question;
};

export const deleteQuestion = async (questionId: number): Promise<{ success: boolean }> => {
  await sql`UPDATE question_master SET is_active = false WHERE question_id = ${questionId}`;
  return { success: true };
};

// Surveys API
export const getSurveys = async (): Promise<Survey[]> => {
  const result = await sql`SELECT * FROM surveys`;
  return result as Survey[];
};

export const getSurveyDetails = async (surveyId: number): Promise<any> => {
  const result = await sql`SELECT get_survey_details(${surveyId}) as details`;
  return result[0].details;
};

export const deleteSurvey = async (surveyId: number): Promise<{ success: boolean }> => {
  // Delete answers first (due to foreign key constraints)
  await sql`DELETE FROM answers WHERE survey_id = ${surveyId}`;
  // Delete the survey
  await sql`DELETE FROM surveys WHERE survey_id = ${surveyId}`;
  return { success: true };
};

export const submitSurvey = async (data: FullSurveyData): Promise<void> => {
  // Insert respondent
  const respondentResult = await sql`INSERT INTO respondents (business_name, respondent_name, type, contact_number, years_in_business) VALUES (${data.respondent.business_name}, ${data.respondent.respondent_name || null}, ${data.respondent.type}, ${data.respondent.contact_number || null}, ${data.respondent.years_in_business || null}) RETURNING respondent_id`;
  const respondent_id = respondentResult[0].respondent_id;

  // Insert location
  await sql`INSERT INTO locations (respondent_id, address_line, area_village, district, pincode, latitude, longitude) VALUES (${respondent_id}, ${data.location.address_line || null}, ${data.location.area_village || null}, ${data.location.district}, ${data.location.pincode || null}, ${data.location.latitude || null}, ${data.location.longitude || null})`;

  // Insert survey
  const surveyResult = await sql`INSERT INTO surveys (respondent_id, agent_id, survey_date, agent_notes) VALUES (${respondent_id}, ${data.agent_id}, ${new Date().toISOString()}, ${data.agent_notes || null}) RETURNING survey_id`;
  const survey_id = surveyResult[0].survey_id;

  // Insert answers
  for (const answer of data.answers) {
    await sql`INSERT INTO answers (survey_id, question_id, answer_text, answer_numeric) VALUES (${survey_id}, ${answer.question_id}, ${answer.answer_text || null}, ${answer.answer_numeric || null})`;
  }
};
