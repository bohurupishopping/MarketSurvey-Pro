
import React, { useState, useEffect, useCallback } from 'react';
import { Agent } from '../../types';
import { getAgents, addAgent, updateAgent, deleteAgent } from '../../services/mockApi';
import Modal from '../../components/Modal';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/icons';

const ManageAgents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAgents();
      setAgents(data);
    } catch (error) {
      console.error("Failed to fetch agents", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleOpenModal = (agent: Agent | null = null) => {
    setEditingAgent(agent);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAgent(null);
  };

  const handleSaveAgent = async (agentData: Omit<Agent, 'agent_id'> | Agent) => {
    if ('agent_id' in agentData) {
      // Update
      await updateAgent(agentData as Agent);
    } else {
      // Add
      await addAgent(agentData);
    }
    fetchAgents();
    handleCloseModal();
  };

  const handleDeleteAgent = async (agentId: number) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      await deleteAgent(agentId);
      fetchAgents();
    }
  };

  if (isLoading) {
    return <div>Loading agents...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Agents</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold flex items-center hover:bg-primary-focus"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Agent
        </button>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Contact</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.agent_id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {agent.first_name} {agent.last_name}
                  </td>
                  <td className="px-6 py-4">{agent.contact_number}</td>
                  <td className="px-6 py-4">{agent.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${agent.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {agent.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenModal(agent)} className="text-blue-600 hover:text-blue-900 mr-4"><EditIcon /></button>
                    <button onClick={() => handleDeleteAgent(agent.agent_id)} className="text-red-600 hover:text-red-900"><TrashIcon /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingAgent ? 'Edit Agent' : 'Add Agent'}>
        <AgentForm agent={editingAgent} onSave={handleSaveAgent} onCancel={handleCloseModal} />
      </Modal>
    </div>
  );
};

const AgentForm: React.FC<{
  agent: Agent | null;
  onSave: (agent: Omit<Agent, 'agent_id'> | Agent) => void;
  onCancel: () => void;
}> = ({ agent, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: agent?.first_name || '',
    last_name: agent?.last_name || '',
    contact_number: agent?.contact_number || '',
    email: agent?.email || '',
    is_active: agent?.is_active ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (agent) {
      onSave({ ...agent, ...formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First Name" required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" />
      <input name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last Name" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" />
      <input name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder="Contact Number" required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" />
      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" />
      <div className="flex items-center">
        <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"/>
        <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-900">Active</label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-focus font-semibold">Save</button>
      </div>
    </form>
  );
};

export default ManageAgents;
