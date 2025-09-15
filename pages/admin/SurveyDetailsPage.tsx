import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSurveyDetails } from '../../services/mockApi';
import { ChevronLeftIcon } from '../../components/icons';

const SurveyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [surveyDetails, setSurveyDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSurveyDetails = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const details = await getSurveyDetails(parseInt(id));
        setSurveyDetails(details);
      } catch (error) {
        console.error("Failed to fetch survey details", error);
        alert("Failed to load survey details");
        navigate('/admin/surveys');
      }
      setIsLoading(false);
    };

    fetchSurveyDetails();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-0.5 py-2 sm:p-4 lg:p-6 max-w-5xl">
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">Loading survey details...</p>
            <p className="text-gray-400 text-sm mt-1">Please wait while we fetch the data</p>
          </div>
        </div>
      </div>
    );
  }

  if (!surveyDetails) {
    return (
      <div className="container mx-auto px-0.5 py-2 sm:p-4 lg:p-6 max-w-5xl">
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              📊
            </div>
            <p className="text-gray-600 font-medium mb-4">No survey details available</p>
            <button
              onClick={() => navigate('/admin/surveys')}
              className="px-4 py-2.5 bg-gradient-to-r from-primary to-primary-focus text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Back to Surveys
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-0.5 py-2 sm:p-4 lg:p-6 max-w-5xl">
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
        <div className="px-3 py-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/surveys')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 animate-in fade-in duration-500">Survey Details</h1>
              </div>
            </div>
          </div>

          {/* Survey Info */}
          <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 mb-6 animate-in slide-in-from-left duration-500 delay-300">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
              Survey Information
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-white/60 rounded-xl p-3 border border-white/40">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Survey ID</p>
                <p className="font-medium text-gray-800">{surveyDetails.survey_id}</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3 border border-white/40">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Survey Date</p>
                <p className="font-medium text-gray-800">
                  {new Date(surveyDetails.survey_date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="bg-white/60 rounded-xl p-3 border border-white/40">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Survey Time</p>
                <p className="font-medium text-gray-800">
                  {new Date(surveyDetails.survey_date).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            {surveyDetails.agent_notes && (
              <div className="mt-4 bg-white/60 rounded-xl p-3 border border-white/40">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Agent Notes</p>
                <p className="text-gray-800">{surveyDetails.agent_notes}</p>
              </div>
            )}
          </div>

          {/* Agent Info */}
          <div className="bg-gradient-to-br from-blue-50/50 to-blue-100/50 rounded-2xl p-4 border border-blue-100/50 mb-6 animate-in slide-in-from-left duration-500 delay-400">
            <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Agent Information
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-white/60 rounded-xl p-3 border border-white/40">
                <p className="text-xs text-blue-600 uppercase tracking-wide">Agent Name</p>
                <p className="font-medium text-blue-900">{surveyDetails.agent.full_name}</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3 border border-white/40">
                <p className="text-xs text-blue-600 uppercase tracking-wide">Contact Number</p>
                <p className="font-medium text-blue-900">{surveyDetails.agent.contact_number}</p>
              </div>
            </div>
          </div>

          {/* Respondent Info */}
          <div className="bg-gradient-to-br from-green-50/50 to-green-100/50 rounded-2xl p-4 border border-green-100/50 mb-6 animate-in slide-in-from-left duration-500 delay-500">
            <h2 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Respondent Information
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-white/60 rounded-xl p-3 border border-white/40">
                <p className="text-xs text-green-600 uppercase tracking-wide">Business Name</p>
                <p className="font-medium text-green-900">{surveyDetails.respondent.business_name}</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3 border border-white/40">
                <p className="text-xs text-green-600 uppercase tracking-wide">Respondent Name</p>
                <p className="font-medium text-green-900">{surveyDetails.respondent.respondent_name || 'N/A'}</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3 border border-white/40">
                <p className="text-xs text-green-600 uppercase tracking-wide">Business Type</p>
                <p className="font-medium text-green-900">{surveyDetails.respondent.type}</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3 border border-white/40">
                <p className="text-xs text-green-600 uppercase tracking-wide">District</p>
                <p className="font-medium text-green-900">{surveyDetails.respondent.location.district}</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3 border border-white/40">
                <p className="text-xs text-green-600 uppercase tracking-wide">Area/Village</p>
                <p className="font-medium text-green-900">{surveyDetails.respondent.location.area_village || 'N/A'}</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3 border border-white/40">
                <p className="text-xs text-green-600 uppercase tracking-wide">Pincode</p>
                <p className="font-medium text-green-900">{surveyDetails.respondent.location.pincode || 'N/A'}</p>
              </div>
              {surveyDetails.respondent.location.address && (
                <div className="bg-white/60 rounded-xl p-3 border border-white/40 col-span-2 sm:col-span-3 lg:col-span-4">
                  <p className="text-xs text-green-600 uppercase tracking-wide">Address</p>
                  <p className="font-medium text-green-900">{surveyDetails.respondent.location.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Questions and Answers */}
          <div className="bg-gradient-to-br from-purple-50/50 to-purple-100/50 rounded-2xl p-4 border border-purple-100/50 animate-in slide-in-from-left duration-500 delay-600">
            <h2 className="text-lg font-semibold text-purple-800 mb-6 flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Survey Responses
            </h2>
            <div className="space-y-4">
              {surveyDetails.questions_and_answers?.map((qa: any, index: number) => (
                <div key={index} className="bg-white/60 rounded-xl p-4 border border-white/40 animate-in fade-in duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-start mb-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-800 text-xs font-bold mr-3 flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-xs font-medium">
                          {qa.question_code}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {qa.question_english}
                      </h3>
                      {qa.question_bengali && (
                        <p className="text-sm text-gray-600 italic">
                          {qa.question_bengali}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-100/50">
                    <p className="text-xs text-purple-600 uppercase tracking-wide mb-1">Response</p>
                    <p className="font-medium text-purple-900">{qa.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyDetailsPage;
