export interface UserProfile {
    $id?: string;
    userId: string;
    displayName: string;
    email: string;
    homeCountry?: string;
    phone?: string;
    dateOfBirth?: string;
    headline?: string;
    bio?: string;
    address?: string;
    currentRole?: string;
    yearsExperience?: number;
    certifications?: string;
    targetTrainingDate?: string;
    readinessLevel?: string;
    learningGoals?: string;
    learningStyle?: string;
    availability?: string;
    instructorPreferences?: string;
    idtype?: string;
    idNumber?: string;
    idField?: string;
    instructorNotes?: string;
    profileCompleted: boolean;
    currentStep: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProfileStepProps {
    formData: Partial<UserProfile>;
    onChange: (field: string, value: any) => void;
    onNext: () => void;
    onBack?: () => void;
    onSave: () => void;
    loading: boolean;
}
