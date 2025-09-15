
import React, { useState, useEffect, useCallback } from 'react';
import { RespondentType, Question, FullSurveyData, Agent, Respondent } from '../../types';
import { getQuestions, getAgents, submitSurvey, getRespondents } from '../../services/mockApi';
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/icons';

const SurveyFormPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
    const [formData, setFormData] = useState<Partial<FullSurveyData>>({
        respondent: {
            business_name: '',
            type: RespondentType.Retailer
        },
        location: {
            district: '',
        },
        answers: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [respondentMode, setRespondentMode] = useState<'select' | 'create'>('create');
    const [existingRespondents, setExistingRespondents] = useState<Respondent[]>([]);
    const [selectedRespondentId, setSelectedRespondentId] = useState<number | null>(null);
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [agentsData, questionsData, respondentsData] = await Promise.all([
                    getAgents(),
                    getQuestions(),
                    getRespondents()
                ]);
                setAgents(agentsData);
                setQuestions(questionsData);
                setExistingRespondents(respondentsData);
            } catch (error) {
                console.error("Failed to fetch initial data", error);
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (formData.respondent?.type) {
            const relevantQuestions = questions.filter(
                q => q.target_respondent === formData.respondent?.type && q.is_active
            );
            setFilteredQuestions(relevantQuestions);
        }
    }, [formData.respondent?.type, questions]);

    const handleRespondentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            respondent: { ...prev.respondent!, [name]: value },
        }));
    };
    
    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            location: { ...prev.location!, [name]: value },
        }));
    };

    const handleAnswerChange = (question_id: number, value: string | number) => {
        setFormData(prev => {
            const existingAnswers = prev.answers || [];
            const newAnswers = [...existingAnswers];
            const answerIndex = newAnswers.findIndex(a => a.question_id === question_id);
            const answer = {
                question_id,
                answer_text: typeof value === 'string' ? value : undefined,
                answer_numeric: typeof value === 'number' ? value : undefined,
            };

            if (answerIndex > -1) {
                newAnswers[answerIndex] = answer;
            } else {
                newAnswers.push(answer);
            }
            return { ...prev, answers: newAnswers };
        });
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    // Geolocation and geocoding functions
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }

        setIsGettingLocation(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await geocodeLocation(latitude, longitude);
            },
            (error) => {
                console.error('Error getting location:', error);
                let errorMessage = 'Unable to get your location. ';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Please allow location access in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'An unknown error occurred.';
                        break;
                }
                alert(errorMessage);
                setIsGettingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    };

    const geocodeLocation = async (latitude: number, longitude: number) => {
        try {
            // Using OpenStreetMap Nominatim API for geocoding (free and no API key required)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`
            );

            if (!response.ok) {
                throw new Error('Geocoding service unavailable');
            }

            const data = await response.json();

            if (data && data.address) {
                const address = data.address;
                const displayName = data.display_name;

                // Extract location details
                const district = address.state_district || address.county || address.state || '';
                const areaVillage = address.village || address.town || address.city || address.suburb || address.neighbourhood || '';
                const pincode = address.postcode || '';
                const fullAddress = displayName || '';

                // Update form data with geocoded information
                setFormData(prev => ({
                    ...prev,
                    location: {
                        ...prev.location!,
                        district: district,
                        area_village: areaVillage,
                        pincode: pincode,
                        address_line: fullAddress
                    }
                }));

                alert('Location detected and filled successfully!');
            } else {
                throw new Error('Unable to decode location');
            }
        } catch (error) {
            console.error('Error geocoding location:', error);
            alert('Unable to decode your location. Please enter the details manually.');
        } finally {
            setIsGettingLocation(false);
        }
    };

    // Respondent selection functions
    const handleRespondentModeChange = (mode: 'select' | 'create') => {
        setRespondentMode(mode);
        if (mode === 'create') {
            setSelectedRespondentId(null);
            // Reset respondent data when switching to create mode
            setFormData(prev => ({
                ...prev,
                respondent: {
                    business_name: '',
                    type: RespondentType.Retailer
                }
            }));
        }
    };

    const handleRespondentSelection = (respondentId: number) => {
        const selectedRespondent = existingRespondents.find(r => r.respondent_id === respondentId);
        if (selectedRespondent) {
            setSelectedRespondentId(respondentId);
            setFormData(prev => ({
                ...prev,
                respondent: {
                    respondent_id: selectedRespondent.respondent_id,
                    business_name: selectedRespondent.business_name,
                    respondent_name: selectedRespondent.respondent_name || '',
                    type: selectedRespondent.type,
                    contact_number: selectedRespondent.contact_number || '',
                    years_in_business: selectedRespondent.years_in_business || undefined
                }
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent double submission
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            await submitSurvey(formData as FullSurveyData);
            alert('Survey submitted successfully!');
            setStep(1); // Reset form
            setFormData({
                respondent: { business_name: '', type: RespondentType.Retailer },
                location: { district: '' },
                answers: []
            });
            setSelectedRespondentId(null);
            setRespondentMode('create');
        } catch (error) {
            console.error('Failed to submit survey', error);
            alert('Failed to submit survey. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="container mx-auto p-2 sm:p-4 lg:p-6 max-w-5xl">
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                    <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading survey form...</p>
                        <p className="text-gray-400 text-sm mt-1">Please wait while we prepare your questions</p>
                    </div>
                </div>
            </div>
        );
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <RespondentInfoStep
                        formData={formData}
                        agents={agents}
                        existingRespondents={existingRespondents}
                        respondentMode={respondentMode}
                        selectedRespondentId={selectedRespondentId}
                        onRespondentChange={handleRespondentChange}
                        onLocationChange={handleLocationChange}
                        onAgentChange={(e) => setFormData(prev => ({ ...prev, agent_id: Number(e.target.value)}))}
                        onGetLocation={getCurrentLocation}
                        isGettingLocation={isGettingLocation}
                        onRespondentModeChange={handleRespondentModeChange}
                        onRespondentSelection={handleRespondentSelection}
                    />
                );
            case 2:
                return (
                    <QuestionsStep
                        questions={filteredQuestions}
                        answers={formData.answers || []}
                        onAnswerChange={handleAnswerChange}
                    />
                );
            case 3:
                return <ReviewStep formData={formData} questions={questions} agents={agents} />;
            default:
                return <div>Survey Complete!</div>;
        }
    };
    
    const totalSteps = 3;

    return (
        <div className="container mx-auto p-2 sm:p-4 lg:p-6 max-w-5xl">
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
                <div className="p-4 sm:p-6">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 animate-in fade-in duration-500">Market Survey</h1>
                        <p className="text-gray-500 animate-in fade-in duration-500 delay-200">Please fill out the form carefully.</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full mb-6 animate-in slide-in-from-left duration-600 delay-300">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                        <span>Step {step} of {totalSteps}</span>
                        <span>{Math.round(((step-1) / totalSteps) * 100)}% Complete</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary to-primary-focus h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="animate-in fade-in duration-500 delay-400">
                        {renderStep()}
                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={step === 1}
                                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200"
                            >
                                <ChevronLeftIcon className="w-4 h-4 mr-2"/>
                                Back
                            </button>
                            {step < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-4 py-2.5 bg-gradient-to-r from-primary to-primary-focus text-white rounded-xl font-semibold flex items-center transition-all duration-200"
                                >
                                    Next
                                    <ChevronRightIcon className="w-4 h-4 ml-2"/>
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Survey'
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


const RespondentInfoStep: React.FC<{
    formData: Partial<FullSurveyData>;
    agents: Agent[];
    existingRespondents: Respondent[];
    respondentMode: 'select' | 'create';
    selectedRespondentId: number | null;
    onRespondentChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAgentChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onGetLocation: () => void;
    isGettingLocation: boolean;
    onRespondentModeChange: (mode: 'select' | 'create') => void;
    onRespondentSelection: (respondentId: number) => void;
}> = ({
    formData,
    agents,
    existingRespondents,
    respondentMode,
    selectedRespondentId,
    onRespondentChange,
    onLocationChange,
    onAgentChange,
    onGetLocation,
    isGettingLocation,
    onRespondentModeChange,
    onRespondentSelection
}) => (
    <div className="space-y-4 animate-in slide-in-from-right duration-500">
        {/* Capsule Tab Selector */}
        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                Respondent Details
            </h2>

            {/* Capsule Tabs */}
            <div className="flex bg-gray-100 rounded-full p-1 mb-4">
                <button
                    type="button"
                    onClick={() => onRespondentModeChange('select')}
                    className={`flex-1 py-2 px-4 rounded-full font-medium text-sm transition-all duration-200 ${
                        respondentMode === 'select'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    Select Existing
                </button>
                <button
                    type="button"
                    onClick={() => onRespondentModeChange('create')}
                    className={`flex-1 py-2 px-4 rounded-full font-medium text-sm transition-all duration-200 ${
                        respondentMode === 'create'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    Create New
                </button>
            </div>

            {/* Conditional Content Based on Mode */}
            {respondentMode === 'select' ? (
                <div className="space-y-3">
                    <select
                        value={selectedRespondentId || ''}
                        onChange={(e) => onRespondentSelection(Number(e.target.value))}
                        className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 bg-white"
                        required
                    >
                        <option value="" disabled>Select a Respondent</option>
                        {existingRespondents.map(respondent => (
                            <option key={respondent.respondent_id} value={respondent.respondent_id}>
                                {respondent.business_name} - {respondent.respondent_name || 'N/A'} ({respondent.type})
                            </option>
                        ))}
                    </select>

                    {selectedRespondentId && (
                        <div className="bg-primary/5 rounded-xl p-3 border border-primary/20 animate-in fade-in duration-300">
                            <p className="text-sm font-medium text-primary mb-1">Selected Respondent:</p>
                            <div className="text-sm text-gray-700">
                                <p><strong>Business:</strong> {formData.respondent?.business_name}</p>
                                <p><strong>Name:</strong> {formData.respondent?.respondent_name || 'N/A'}</p>
                                <p><strong>Type:</strong> {formData.respondent?.type}</p>
                                <p><strong>Contact:</strong> {formData.respondent?.contact_number || 'N/A'}</p>
                            </div>
                        </div>
                    )}

                    {existingRespondents.length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                👥
                            </div>
                            <p className="font-medium">No existing respondents found</p>
                            <p className="text-sm">Switch to "Create New" to add a respondent</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <input
                        type="text"
                        name="business_name"
                        placeholder="Business Name"
                        value={formData.respondent?.business_name}
                        onChange={onRespondentChange}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 bg-white sm:p-2.5 sm:rounded-xl"
                        required
                    />
                    <input
                        type="text"
                        name="respondent_name"
                        placeholder="Respondent Name"
                        value={formData.respondent?.respondent_name}
                        onChange={onRespondentChange}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 bg-white sm:p-2.5 sm:rounded-xl"
                    />
                    <select
                        name="type"
                        value={formData.respondent?.type}
                        onChange={onRespondentChange}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 bg-white sm:p-2.5 sm:rounded-xl"
                        required
                    >
                        {Object.values(RespondentType).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <input
                        type="tel"
                        name="contact_number"
                        placeholder="Contact Number"
                        value={formData.respondent?.contact_number}
                        onChange={onRespondentChange}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 bg-white sm:p-2.5 sm:rounded-xl"
                    />
                    <input
                        type="number"
                        name="years_in_business"
                        placeholder="Years in Business"
                        value={formData.respondent?.years_in_business || ''}
                        onChange={onRespondentChange}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 bg-white sm:p-2.5 sm:rounded-xl"
                    />
                </div>
            )}
        </div>

        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                Location Details
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <input type="text" name="address_line" placeholder="Address" value={formData.location?.address_line} onChange={onLocationChange} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 bg-white sm:p-2.5 sm:rounded-xl col-span-2" />
                <input type="text" name="area_village" placeholder="Area / Village" value={formData.location?.area_village} onChange={onLocationChange} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 bg-white sm:p-2.5 sm:rounded-xl" />
                <input type="text" name="district" placeholder="District" value={formData.location?.district} onChange={onLocationChange} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 bg-white sm:p-2.5 sm:rounded-xl" required />
                <div className="flex gap-2">
                    <input type="text" name="pincode" placeholder="Pincode" value={formData.location?.pincode} onChange={onLocationChange} className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 bg-white sm:p-2.5 sm:rounded-xl" />
                    <button
                        type="button"
                        onClick={onGetLocation}
                        disabled={isGettingLocation}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap"
                        title="Detect Current Location"
                    >
                        {isGettingLocation ? (
                            <>
                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1"></div>
                                <span className="hidden sm:inline">Detecting...</span>
                            </>
                        ) : (
                            <>
                                <span className="text-sm mr-1">📍</span>
                                <span className="hidden sm:inline">Detect</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>

        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                Agent Information
            </h2>
            <select name="agent_id" value={formData.agent_id || ''} onChange={onAgentChange} className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 bg-white" required>
                <option value="" disabled>Select an Agent</option>
                {agents.map(agent => <option key={agent.agent_id} value={agent.agent_id}>{agent.first_name} {agent.last_name}</option>)}
            </select>
        </div>
    </div>
);


const QuestionsStep: React.FC<{
    questions: Question[];
    answers: { question_id: number; answer_text?: string; answer_numeric?: number }[];
    onAnswerChange: (question_id: number, value: string | number) => void;
}> = ({ questions, answers, onAnswerChange }) => (
    <div className="space-y-4 animate-in slide-in-from-right duration-500">
        {questions.map((q, index) => {
            const answer = answers.find(a => a.question_id === q.question_id);
            return (
                <div key={q.question_id} className="bg-white rounded-2xl border border-gray-100 animate-in fade-in duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="p-4">
                        <div className="flex items-start mb-3">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 flex-shrink-0 mt-0.5">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <label className="block text-base font-semibold text-gray-800 mb-1">{q.question_text_english}</label>
                                <p className="text-sm text-gray-500">{q.question_text_bengali}</p>
                            </div>
                        </div>
                        <QuestionInput question={q} value={answer} onChange={onAnswerChange} />
                    </div>
                </div>
            )
        })}
    </div>
);

const QuestionInput: React.FC<{
    question: Question;
    value: { question_id: number; answer_text?: string; answer_numeric?: number } | undefined;
    onChange: (question_id: number, value: string | number) => void;
}> = ({ question, value, onChange }) => {
    switch (question.answer_format) {
        case 'Open Text':
            return <textarea value={value?.answer_text || ''} onChange={(e) => onChange(question.question_id, e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 bg-white resize-none" rows={3}></textarea>;
        case 'Numeric':
            return <input type="number" value={value?.answer_numeric || ''} onChange={(e) => onChange(question.question_id, parseFloat(e.target.value))} className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 bg-white" />;
        case 'Single Choice':
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {question.options?.map(option => (
                        <label key={option} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all duration-200 ${value?.answer_text === option ? 'bg-primary/10 border-primary' : 'border-gray-200'}`}>
                            <input type="radio" name={`q_${question.question_id}`} value={option} checked={value?.answer_text === option} onChange={(e) => onChange(question.question_id, e.target.value)} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary focus:ring-2" />
                            <span className="ml-3 text-gray-700 text-sm">{option}</span>
                        </label>
                    ))}
                </div>
            );
        case 'Rating Scale (1-5)':
            return (
                <div className="flex justify-center items-center space-x-2 p-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                        <label key={rating} className="flex flex-col items-center space-y-2 cursor-pointer">
                            <span className={`text-xs font-medium transition-colors duration-200 ${value?.answer_numeric === rating ? 'text-primary' : 'text-gray-400'}`}>{rating}</span>
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${value?.answer_numeric === rating ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                                <input type="radio" name={`q_${question.question_id}`} value={rating} checked={value?.answer_numeric === rating} onChange={(e) => onChange(question.question_id, parseInt(e.target.value))} className="w-3 h-3 text-primary bg-gray-100 border-gray-300 focus:ring-primary opacity-0 absolute" />
                            </div>
                        </label>
                    ))}
                </div>
            );
        default:
            return <input type="text" value={value?.answer_text || ''} onChange={(e) => onChange(question.question_id, e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 bg-white" />;
    }
};


const ReviewStep: React.FC<{
    formData: Partial<FullSurveyData>;
    questions: Question[];
    agents: Agent[];
}> = ({ formData, questions, agents }) => {
    const getQuestionText = (questionId: number) => {
        return questions.find(q => q.question_id === questionId)?.question_text_english || 'Unknown Question';
    };
    const getAgentName = (agentId?: number) => {
        if (!agentId) return 'N/A';
        const agent = agents.find(a => a.agent_id === agentId);
        return agent ? `${agent.first_name} ${agent.last_name || ''}`.trim() : 'Unknown Agent';
    }
    return (
        <div className="space-y-4 animate-in slide-in-from-right duration-500">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-4 border border-primary/20">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                    Respondent Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white/60 rounded-xl p-3 border border-white/40">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Business</p>
                        <p className="font-medium text-gray-800">{formData.respondent?.business_name || 'Not provided'}</p>
                    </div>
                    <div className="bg-white/60 rounded-xl p-3 border border-white/40">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Type</p>
                        <p className="font-medium text-gray-800">{formData.respondent?.type || 'Not provided'}</p>
                    </div>
                    <div className="bg-white/60 rounded-xl p-3 border border-white/40">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">District</p>
                        <p className="font-medium text-gray-800">{formData.location?.district || 'Not provided'}</p>
                    </div>
                    <div className="bg-white/60 rounded-xl p-3 border border-white/40">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Agent</p>
                        <p className="font-medium text-gray-800">{getAgentName(formData.agent_id)}</p>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                    Survey Answers
                </h3>
                <div className="space-y-3">
                    {formData.answers?.map((answer, index) => (
                        <div key={answer.question_id} className="bg-white rounded-xl p-3 border border-gray-100 animate-in fade-in duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                            <p className="font-medium text-gray-800 mb-1">{getQuestionText(answer.question_id)}</p>
                            <p className="text-primary font-semibold bg-primary/5 rounded-lg px-2 py-1 inline-block">
                                {answer.answer_text || answer.answer_numeric || 'No answer'}
                            </p>
                        </div>
                    ))}
                    {(!formData.answers || formData.answers.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                📝
                            </div>
                            <p>No answers recorded yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default SurveyFormPage;
