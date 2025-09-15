-- SQL Schema for Market Survey Data on Neon DB (PostgreSQL)

-- First, create custom types (ENUMs) to ensure data consistency and avoid string errors.
CREATE TYPE respondent_type AS ENUM ('Distributor', 'Retailer', 'Bulk Buyer');
CREATE TYPE question_group AS ENUM ('Business Profile', 'Market Demand', 'Product Preference', 'Pricing and Margins', 'Logistics', 'Competitor Analysis', 'Customer Insights');
CREATE TYPE answer_format AS ENUM ('Open Text', 'Numeric', 'Date', 'Single Choice', 'Multiple Choice', 'Rating Scale (1-5)');


-- Table 1: Information about the survey agents
CREATE TABLE agents (
    agent_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    contact_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    hire_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE agents IS 'Stores details of the field agents conducting the surveys.';


-- Table 2: Information about the businesses/people being surveyed
CREATE TABLE respondents (
    respondent_id SERIAL PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    respondent_name VARCHAR(255), -- Name of the person providing the answers
    type respondent_type NOT NULL, -- 'Distributor', 'Retailer', or 'Bulk Buyer'
    contact_number VARCHAR(20),
    years_in_business INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE respondents IS 'Stores details of the individuals or businesses being surveyed.';


-- Table 3: Location details for each respondent
CREATE TABLE locations (
    location_id SERIAL PRIMARY KEY,
    respondent_id INT UNIQUE NOT NULL, -- Each respondent has one primary location
    address_line TEXT,
    area_village VARCHAR(255),
    district VARCHAR(100) NOT NULL,
    pincode VARCHAR(10),
    latitude DECIMAL(9, 6), -- Optional: For GIS mapping and analysis
    longitude DECIMAL(9, 6),
    FOREIGN KEY (respondent_id) REFERENCES respondents(respondent_id) ON DELETE CASCADE
);
COMMENT ON TABLE locations IS 'Geographical information of the respondents.';


-- Table 4: Tracks each individual survey instance
CREATE TABLE surveys (
    survey_id SERIAL PRIMARY KEY,
    respondent_id INT NOT NULL,
    agent_id INT NOT NULL,
    survey_date TIMESTAMPTZ DEFAULT NOW(),
    agent_notes TEXT, -- For any general observations by the agent during the survey
    FOREIGN KEY (respondent_id) REFERENCES respondents(respondent_id) ON DELETE RESTRICT,
    FOREIGN KEY (agent_id) REFERENCES agents(agent_id) ON DELETE RESTRICT
);
COMMENT ON TABLE surveys IS 'A record for each completed survey session, linking agent and respondent.';


-- Table 5: A master list of all survey questions (with Bengali as the default language)
CREATE TABLE question_master (
    question_id SERIAL PRIMARY KEY,
    question_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., 'D01', 'R05' for easy reference
    question_text_bengali TEXT NOT NULL, -- Bengali question text is mandatory
    question_text_english TEXT, -- English question text is optional
    question_group question_group, -- Helps in categorizing questions
    target_respondent respondent_type, -- Which group this question is intended for
    answer_format answer_format NOT NULL, -- Specifies the expected answer type
    is_active BOOLEAN DEFAULT TRUE
);
COMMENT ON TABLE question_master IS 'A central repository for all survey questions, with Bengali as the primary language.';


-- Table 6: The core table to store all the answers
CREATE TABLE answers (
    answer_id BIGSERIAL PRIMARY KEY,
    survey_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_text TEXT, -- Used for 'Open Text', 'Single Choice', 'Multiple Choice'
    answer_numeric NUMERIC, -- Used for 'Numeric' and 'Rating Scale' values
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES question_master(question_id) ON DELETE RESTRICT,
    UNIQUE (survey_id, question_id) -- Ensures one answer per question in a single survey
);
COMMENT ON TABLE answers IS 'Stores the actual response for each question in a survey.';