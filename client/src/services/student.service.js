import api from './api';

export const studentService = {
  getSemesterPlan: async () => {
    const res = await api.get('/student/semester-plan');
    return res.data;
  },

  saveSemesterFees: async (fees) => {
    const res = await api.post('/student/semester-plan', { fees });
    return res.data;
  },

  getFirstSalaryPlan: async (salary, city = 'tier1') => {
    const res = await api.post('/student/first-salary', { salary, city });
    return res.data;
  },
};

export default studentService;
