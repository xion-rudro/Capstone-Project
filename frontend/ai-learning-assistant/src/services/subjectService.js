import axiosInstance from '../utils/axiosinstance';
import { API_PATHS } from '../utils/apiPaths';

const getSubjects = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.SUBJECTS.GET_ALL);
    return response.data?.data || [];
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch subjects' };
  }
};

const createSubject = async (name) => {
  try {
    const response = await axiosInstance.post(API_PATHS.SUBJECTS.CREATE, { name });
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create subject' };
  }
};

const createTopic = async (subjectId, name) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.SUBJECTS.CREATE_TOPIC(subjectId),
      { name }
    );
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create topic' };
  }
};

const subjectService = { getSubjects, createSubject, createTopic };
export default subjectService;
