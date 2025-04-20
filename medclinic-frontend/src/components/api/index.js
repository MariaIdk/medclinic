export const getPatientDocuments = async (patientId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/patient-documents/?patient=${patientId}`);
      if (!res.ok) throw new Error('Ошибка при получении документов');
      return await res.json();
    } catch (error) {
      console.error('Error fetching patient documents:', error);
      throw error;
    }
  };
  
  