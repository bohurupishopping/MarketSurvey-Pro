
import React, { useState, useEffect, useCallback } from 'react';
import { Question, QuestionGroup, RespondentType, AnswerFormat } from '../../types';
import { getQuestions, addQuestion, updateQuestion, deleteQuestion } from '../../services/mockApi';
import Modal from '../../components/Modal';

const ManageQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<Question, 'question_id'>>({
    question_code: '',
    question_text_bengali: '',
    question_text_english: '',
    question_group: undefined,
    target_respondent: undefined,
    answer_format: AnswerFormat.OpenText,
    is_active: true,
  });

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getQuestions();
      setQuestions(data);
    } catch (error) {
      console.error("Failed to fetch questions", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingQuestion) {
        await updateQuestion({ ...editingQuestion, ...formData });
      } else {
        await addQuestion(formData);
      }
      fetchQuestions();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save question', error);
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return <div>Loading questions...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Question Master</h1>
        <button
          onClick={() => {
            setEditingQuestion(null);
            setFormData({
              question_code: '',
              question_text_bengali: '',
              question_text_english: '',
              question_group: undefined,
              target_respondent: undefined,
              answer_format: AnswerFormat.OpenText,
              is_active: true,
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Question
        </button>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Code</th>
                <th scope="col" className="px-6 py-3">Question (English)</th>
                <th scope="col" className="px-6 py-3">Group</th>
                <th scope="col" className="px-6 py-3">Answer Format</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.question_id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs">{q.question_code}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{q.question_text_english}</td>
                  <td className="px-6 py-4">{q.question_group}</td>
                  <td className="px-6 py-4">{q.answer_format}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${q.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {q.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setEditingQuestion(q);
                        setFormData({
                          question_code: q.question_code,
                          question_text_bengali: q.question_text_bengali,
                          question_text_english: q.question_text_english || '',
                          question_group: q.question_group,
                          target_respondent: q.target_respondent,
                          answer_format: q.answer_format,
                          is_active: q.is_active,
                        });
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this question?')) {
                          try {
                            await deleteQuestion(q.question_id);
                            fetchQuestions();
                          } catch (error) {
                            console.error('Failed to delete question', error);
                          }
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Add Question'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Question Code</label>
            <input
              type="text"
              value={formData.question_code}
              onChange={(e) => setFormData({ ...formData, question_code: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Question Text (Bengali)</label>
            <textarea
              value={formData.question_text_bengali}
              onChange={(e) => setFormData({ ...formData, question_text_bengali: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Question Text (English)</label>
            <textarea
              value={formData.question_text_english}
              onChange={(e) => setFormData({ ...formData, question_text_english: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Question Group</label>
            <select
              value={formData.question_group || ''}
              onChange={(e) => setFormData({ ...formData, question_group: e.target.value as QuestionGroup || undefined })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select Group</option>
              {Object.values(QuestionGroup).map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Respondent</label>
            <select
              value={formData.target_respondent || ''}
              onChange={(e) => setFormData({ ...formData, target_respondent: e.target.value as RespondentType || undefined })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select Respondent Type</option>
              {Object.values(RespondentType).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Answer Format</label>
            <select
              value={formData.answer_format}
              onChange={(e) => setFormData({ ...formData, answer_format: e.target.value as AnswerFormat })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            >
              {Object.values(AnswerFormat).map((format) => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="mr-2"
              />
              Active
            </label>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageQuestions;
