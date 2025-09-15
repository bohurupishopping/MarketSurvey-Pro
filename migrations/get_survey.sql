CREATE OR REPLACE FUNCTION get_survey_details(p_survey_id INT)
RETURNS JSONB AS $$
DECLARE
    survey_details_json JSONB;
BEGIN
    SELECT
        -- Use jsonb_build_object to construct the main JSON structure
        jsonb_build_object(
            'survey_id', s.survey_id,
            'survey_date', s.survey_date,
            'agent_notes', s.agent_notes,

            -- Nest agent details into a sub-object
            'agent', jsonb_build_object(
                'agent_id', ag.agent_id,
                'full_name', ag.first_name || ' ' || ag.last_name,
                'contact_number', ag.contact_number
            ),

            -- Nest respondent and their location details
            'respondent', jsonb_build_object(
                'respondent_id', r.respondent_id,
                'business_name', r.business_name,
                'respondent_name', r.respondent_name,
                'type', r.type,
                'location', jsonb_build_object(
                    'district', l.district,
                    'area_village', l.area_village,
                    'address', l.address_line,
                    'pincode', l.pincode
                )
            ),

            -- Aggregate all questions and answers into a JSON array
            'questions_and_answers', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'question_code', qm.question_code,
                        'question_bengali', qm.question_text_bengali,
                        'question_english', qm.question_text_english,
                        -- Combine text and numeric answers into a single 'answer' field
                        'answer', COALESCE(a.answer_text, a.answer_numeric::TEXT)
                    ) ORDER BY qm.question_code
                )
                FROM answers a
                JOIN question_master qm ON a.question_id = qm.question_id
                WHERE a.survey_id = s.survey_id
            )
        )
    INTO survey_details_json
    FROM
        surveys s
    JOIN
        agents ag ON s.agent_id = ag.agent_id
    JOIN
        respondents r ON s.respondent_id = r.respondent_id
    JOIN
        locations l ON r.respondent_id = l.respondent_id
    WHERE
        s.survey_id = p_survey_id
    GROUP BY
        s.survey_id, ag.agent_id, r.respondent_id, l.location_id;

    RETURN survey_details_json;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_survey_details(INT) IS 'Returns a full JSONB object with all details for a given survey ID, including agent, respondent, location, and all questions with their corresponding answers.';