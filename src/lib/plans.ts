export interface PricingPlan {
    name: string;
    basePrice: number; // price in GHS
    period: string;
    description: string;
    features: string[];
    popular?: boolean;
    cta: string;
    certifications: string[];
}

export const plans: PricingPlan[] = [
    {
        name: 'Starter Plan',
        basePrice: 2500,
        period: 'CAPM Certification',
        description: 'Perfect for those starting their PMI certification journey',
        certifications: ['CAPM'],
        features: [
            'Complete CAPM exam preparation',
            'Interactive study materials',
            'Practice exams and quizzes',
            'WhatsApp community access',
            'Live virtual sessions',
            'CAPM certificate upon completion',
            '6-month support access',
            'Project management fundamentals',
        ],
        cta: 'Get Started',
    },
    {
        name: 'Intermediate Plan',
        basePrice: 5500,
        period: 'PMP & PMI-ACP',
        description: 'Advanced certifications for professional project managers',
        certifications: ['PMP', 'PMI-ACP'],
        features: [
            'Complete PMP exam preparation',
            'Complete PMI-ACP exam preparation',
            'Advanced project management methodologies',
            'Agile and predictive approaches',
            'Priority WhatsApp support',
            'All live virtual sessions',
            'Practice exams and simulations',
            'Certificates for both certifications',
            '9-month support access',
            'Career guidance sessions',
        ],
        popular: true,
        cta: 'Get Started',
    },
    {
        name: 'Comprehensive Plan',
        basePrice: 8500,
        period: 'All PMI Certifications',
        description: 'Complete portfolio for executive-level project management',
        certifications: ['CAPM', 'PMP', 'PMI-ACP', 'PfMP'],
        features: [
            'All PMI certifications (CAPM, PMP, PMI-ACP, PfMP)',
            'Executive-level portfolio management',
            'Strategic project leadership',
            'Premium priority support',
            'Exclusive masterclass sessions',
            'All certification materials',
            'Certificates for all certifications',
            '12-month support access',
            'Multiple project simulations',
            'One-on-one mentorship',
            'Job placement assistance',
            'Lifetime community access',
        ],
        cta: 'Get Started',
    },
];
