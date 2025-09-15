
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Survey } from '../../types';
import { getSurveys, deleteSurvey, getSurveyDetails } from '../../services/mockApi';

const ViewSurveys: React.FC = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSurveys, setSelectedSurveys] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchSurveys = async () => {
      setIsLoading(true);
      try {
        const data = await getSurveys();
        setSurveys(data);
      } catch (error) {
        console.error("Failed to fetch surveys", error);
      }
      setIsLoading(false);
    };
    fetchSurveys();
  }, []);

  const handleViewDetails = (surveyId: number) => {
    navigate(`/admin/surveys/${surveyId}`);
  };

  const handleSelectSurvey = (surveyId: number, isSelected: boolean) => {
    setSelectedSurveys(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(surveyId);
      } else {
        newSet.delete(surveyId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedSurveys(new Set(surveys.map(s => s.survey_id)));
    } else {
      setSelectedSurveys(new Set());
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedSurveys.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedSurveys.size} survey(s)?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      for (const surveyId of selectedSurveys) {
        await deleteSurvey(surveyId);
      }
      // Refresh the surveys list
      const data = await getSurveys();
      setSurveys(data);
      setSelectedSurveys(new Set());
    } catch (error) {
      console.error("Failed to delete surveys", error);
      alert("Failed to delete surveys. Please try again.");
    }
    setIsDeleting(false);
  };

  const handleDownloadSelected = async () => {
    if (selectedSurveys.size === 0) return;

    try {
      const surveyData = [];
      for (const surveyId of selectedSurveys) {
        const details = await getSurveyDetails(surveyId);
        surveyData.push(details);
      }

      const dataStr = JSON.stringify(surveyData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `surveys_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download surveys", error);
      alert("Failed to download surveys. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading surveys...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">View Surveys</h1>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadSelected}
            disabled={selectedSurveys.size === 0}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
          >
            Download JSON ({selectedSurveys.size})
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={selectedSurveys.size === 0 || isDeleting}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
          >
            {isDeleting ? 'Deleting...' : `Delete (${selectedSurveys.size})`}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedSurveys.size === surveys.length && surveys.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th scope="col" className="px-6 py-3">Survey ID</th>
                <th scope="col" className="px-6 py-3">Respondent ID</th>
                <th scope="col" className="px-6 py-3">Agent ID</th>
                <th scope="col" className="px-6 py-3">Survey Date</th>
                <th scope="col" className="px-6 py-3">Agent Notes</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map((survey) => (
                <tr key={survey.survey_id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedSurveys.has(survey.survey_id)}
                      onChange={(e) => handleSelectSurvey(survey.survey_id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{survey.survey_id}</td>
                  <td className="px-6 py-4">{survey.respondent_id}</td>
                  <td className="px-6 py-4">{survey.agent_id}</td>
                  <td className="px-6 py-4">{new Date(survey.survey_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{survey.agent_notes || 'N/A'}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleViewDetails(survey.survey_id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewSurveys;
