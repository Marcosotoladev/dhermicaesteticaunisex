export interface ProfileData {
  personalInfo: {
    fullName: string;
    address: string;
    phone: string;
    birthDate: string;
  };
  medicalInfo: {
    tattoos: {
      has: boolean;
      locations: string[];
    };
    skinProblems: string[];
    cancer: {
      has: boolean;
      details: string;
    };
    allergies: string[];
    currentMedications: string[];
    previousTreatments: string[];
  };
}