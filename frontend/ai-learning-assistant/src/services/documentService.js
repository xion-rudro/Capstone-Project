import api from '../utils/axiosinstance';

const documentService = {
  async listSubjects() { return (await api.get('/subjects')).data.subjects; },
  async createSubject(name) { return (await api.post('/subjects', { name })).data.subject; },
  async updateSubject(id, name) { return (await api.patch(`/subjects/${id}`, { name })).data.subject; },
  async deleteSubject(id) { return (await api.delete(`/subjects/${id}`)).data; },
  async createTopic(subjectId, name) { return (await api.post(`/subjects/${subjectId}/topics`, { name })).data.topic; },
  async updateTopic(subjectId, topicId, name) { return (await api.patch(`/subjects/${subjectId}/topics/${topicId}`, { name })).data.topic; },
  async deleteTopic(subjectId, topicId) { return (await api.delete(`/subjects/${subjectId}/topics/${topicId}`)).data; },
  async uploadPdf(subjectId, topicId, file) {
    const form = new FormData();
    form.append('pdf', file);
    return (await api.post(`/subjects/${subjectId}/topics/${topicId}/pdf`, form)).data.topic;
  },
  async renamePdf(subjectId, topicId, displayName) { return (await api.patch(`/subjects/${subjectId}/topics/${topicId}/pdf`, { displayName })).data.topic; },
  async deletePdf(subjectId, topicId) { return (await api.delete(`/subjects/${subjectId}/topics/${topicId}/pdf`)).data; },
  pdfUrl(fileId) { return `${import.meta.env.VITE_API_URL || '/api'}/subjects/files/${encodeURIComponent(fileId)}`; }
};

export default documentService;
