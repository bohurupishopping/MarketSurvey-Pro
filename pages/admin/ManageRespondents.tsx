
import React, { useState, useEffect, useCallback } from 'react';
import { Respondent } from '../../types';
import { getRespondents } from '../../services/mockApi';

const ManageRespondents: React.FC = () => {
  const [respondents, setRespondents] = useState<Respondent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRespondents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getRespondents();
      setRespondents(data);
    } catch (error) {
      console.error("Failed to fetch respondents", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchRespondents();
  }, [fetchRespondents]);

  if (isLoading) {
    return <div>Loading respondents...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Respondents</h1>
        {/* Add button can be added here */}
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Business Name</th>
                <th scope="col" className="px-6 py-3">Respondent Name</th>
                <th scope="col" className="px-6 py-3">Type</th>
                <th scope="col" className="px-6 py-3">Years in Business</th>
              </tr>
            </thead>
            <tbody>
              {respondents.map((respondent) => (
                <tr key={respondent.respondent_id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{respondent.business_name}</td>
                  <td className="px-6 py-4">{respondent.respondent_name}</td>
                  <td className="px-6 py-4">{respondent.type}</td>
                  <td className="px-6 py-4">{respondent.years_in_business}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageRespondents;
