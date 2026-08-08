export interface RoleSuggestion {
    title: string;
    category: string;
}

const ROLE_CATEGORIES: Record<string, string[]> = {
    Technology: [
        'Software Engineer',
        'Frontend Developer',
        'Backend Developer',
        'Full Stack Developer',
        'Mobile Developer',
        'DevOps Engineer',
        'Data Analyst',
        'Data Scientist',
        'Machine Learning Engineer',
        'Cybersecurity Analyst',
        'QA Engineer',
        'Cloud Architect',
        'Systems Administrator',
        'Database Administrator',
        'IT Support Specialist',
    ],
    'Business & Management': ['Product Manager', 'Project Manager', 'Business Analyst', 'Operations Manager', 'General Manager', 'Management Consultant', 'Strategy Consultant', 'Program Manager'],
    Sales: ['Sales Executive', 'Sales Manager', 'Sales Representative', 'Business Development Executive', 'Account Executive', 'Account Manager', 'Inside Sales Representative'],
    Marketing: ['Marketing Executive', 'Marketing Manager', 'Digital Marketing Specialist', 'SEO Specialist', 'Content Marketing Manager', 'Brand Manager', 'Social Media Manager', 'Growth Marketer'],
    'Finance & Accounting': ['Accountant', 'Financial Analyst', 'Investment Analyst', 'Financial Controller', 'Auditor', 'Tax Consultant', 'Bookkeeper', 'Investment Banker'],
    'Human Resources': ['HR Executive', 'HR Manager', 'Recruiter', 'Talent Acquisition Specialist', 'HR Business Partner', 'Compensation & Benefits Analyst'],
    Healthcare: ['Nurse', 'Pharmacist', 'Doctor', 'Healthcare Administrator', 'Medical Assistant', 'Physical Therapist', 'Dentist', 'Radiologic Technologist'],
    Education: ['Teacher', 'Lecturer', 'School Principal', 'Academic Counselor', 'Curriculum Developer', 'Tutor'],
    Hospitality: ['Hotel Manager', 'Front Office Manager', 'Chef', 'Restaurant Manager', 'Hospitality Executive', 'Event Manager', 'Housekeeping Manager', 'Concierge'],
    Engineering: ['Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Industrial Engineer', 'Chemical Engineer', 'Structural Engineer'],
    'Design & Creative': ['UI/UX Designer', 'Product Designer', 'Graphic Designer', 'Interior Designer', 'Fashion Designer', 'Motion Designer', 'Illustrator'],
    Legal: ['Lawyer', 'Legal Associate', 'Paralegal', 'Legal Counsel', 'Compliance Officer', 'Contract Manager'],
    'Operations & Supply Chain': ['Supply Chain Manager', 'Logistics Coordinator', 'Procurement Specialist', 'Warehouse Manager', 'Inventory Manager'],
    'Customer Service': ['Customer Support Executive', 'Customer Success Manager', 'Call Center Representative', 'Client Relations Manager'],
    'Media & Communications': ['Content Writer', 'Copywriter', 'Journalist', 'Public Relations Specialist', 'Editor', 'Social Media Coordinator'],
    'Architecture & Construction': ['Architect', 'Construction Manager', 'Site Engineer', 'Urban Planner', 'Quantity Surveyor'],
    Retail: ['Retail Manager', 'Store Manager', 'Merchandiser', 'Visual Merchandiser', 'Retail Sales Associate'],
    Administrative: ['Administrative Assistant', 'Office Manager', 'Executive Assistant', 'Data Entry Specialist', 'Real Estate Agent'],
};

export const ROLE_SUGGESTIONS: RoleSuggestion[] = Object.entries(ROLE_CATEGORIES).flatMap(([category, titles]) => titles.map((title) => ({ title, category })));

export const POPULAR_ROLES: RoleSuggestion[] = [
    { title: 'Software Engineer', category: 'Technology' },
    { title: 'Product Manager', category: 'Business & Management' },
    { title: 'Data Analyst', category: 'Technology' },
    { title: 'Sales Executive', category: 'Sales' },
    { title: 'UI/UX Designer', category: 'Design & Creative' },
    { title: 'Nurse', category: 'Healthcare' },
];