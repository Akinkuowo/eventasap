// components/registration/UnifiedRegistrationWithVerification.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Briefcase,
    Mail,
    Lock,
    User,
    Phone,
    Building,
    MapPin,
    Globe,
    Check,
    Loader2,
    ChevronRight,
    AlertCircle,
    Sparkles,
    Zap,
    ArrowLeft,
    Eye,
    EyeOff,
    Send
} from 'lucide-react';
import { toast } from 'sonner';

const NEXT_AUTH_PATH = process.env.NEXT_PUBLIC_API_URL

interface RegistrationData {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    createVendorProfile: boolean;
    vendorData?: {
        businessName: string;
        businessEmail: string;
        businessPhone: string;
        city: string;
        country: string;
        category: string;
        description: string;
        serviceAreas: string[];
        whatsappEnabled: boolean;
    };
}

const UnifiedRegistration = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [emailChecked, setEmailChecked] = useState(false);
    const [isEmailAvailable, setIsEmailAvailable] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [resendLoading, setResendLoading] = useState(false);

    const [formData, setFormData] = useState<RegistrationData>({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        createVendorProfile: false,
        vendorData: {
            businessName: '',
            businessEmail: '',
            businessPhone: '',
            city: '',
            country: 'UK',
            category: '',
            description: '',
            serviceAreas: [],
            whatsappEnabled: false
        }
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const serviceCategories = [
        'Photography & Videography',
        'Catering & Food Services',
        'Venue & Location',
        'Entertainment & Music',
        'Decoration & Florist',
        'Makeup & Hairstyling',
        'Event Planning & Coordination',
        'Audio-Visual & Lighting',
        'Transportation',
        'Wedding Services',
        'Corporate Events',
        'Party Planning',
        'Other'
    ];

    const ukCities = [
        'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow',
        'Liverpool', 'Bristol', 'Sheffield', 'Edinburgh', 'Cardiff',
        'Belfast', 'Newcastle', 'Nottingham', 'Brighton', 'Oxford',
        'Cambridge', 'York', 'Bath', 'Reading', 'Southampton'
    ];

    const steps = [
        { number: 1, title: 'Account Type', description: 'Choose your role' },
        { number: 2, title: 'Personal Details', description: 'Basic information' },
        { number: 3, title: 'Vendor Details', description: 'Business information' },
        { number: 4, title: 'Complete', description: 'Verify your email' }
    ];

    const checkEmailAvailability = async (email: string) => {
        if (!email || !email.includes('@')) return;

        try {
            const response = await fetch(`${NEXT_AUTH_PATH}/api/auth/check-email/${email}`);
            const data = await response.json();
            setIsEmailAvailable(data.available);
            setEmailChecked(true);

            if (!data.available) {
                setErrors(prev => ({ ...prev, email: 'Email already registered' }));
            }
        } catch (error) {
            console.error('Error checking email:', error);
        }
    };

    const checkBusinessEmailAvailability = async (email: string) => {
        if (!email || !email.includes('@')) return;

        try {
            const response = await fetch(`${NEXT_AUTH_PATH}/api/auth/check-business-email/${email}`);
            const data = await response.json();

            if (!data.available) {
                setErrors(prev => ({ ...prev, businessEmail: 'Business email already registered' }));
            }
        } catch (error) {
            console.error('Error checking business email:', error);
        }
    };

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.firstName) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Phone number is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        if (!formData.createVendorProfile) return true;

        const newErrors: Record<string, string> = {};

        if (!formData.vendorData?.businessName) {
            newErrors.businessName = 'Business name is required';
        }

        if (!formData.vendorData?.businessEmail) {
            newErrors.businessEmail = 'Business email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.vendorData.businessEmail)) {
            newErrors.businessEmail = 'Business email is invalid';
        }

        if (!formData.vendorData?.businessPhone) {
            newErrors.businessPhone = 'Business phone is required';
        }

        if (!formData.vendorData?.city) {
            newErrors.city = 'City is required';
        }

        if (!formData.vendorData?.category) {
            newErrors.category = 'Service category is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (name.includes('vendorData.')) {
            const fieldName = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                vendorData: {
                    ...prev.vendorData!,
                    [fieldName]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
                }
            }));

            if (fieldName === 'businessEmail') {
                checkBusinessEmailAvailability(value);
            }
        } else {
            if (type === 'checkbox') {
                const checked = (e.target as HTMLInputElement).checked;
                setFormData(prev => ({ ...prev, [name]: checked }));
            } else {
                setFormData(prev => ({ ...prev, [name]: value }));
            }

            if (name === 'email') {
                checkEmailAvailability(value);
            }
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleNextStep = async () => {
        if (step === 1) {
            if (!validateStep1()) return;
            if (!isEmailAvailable) return;
            setStep(2);
        } else if (step === 2) {
            if (validateStep2()) {
                setStep(3);
            }
        } else if (step === 3) {
            if (validateStep3()) {
                await handleSubmit();
            }
        }
    };

    const handlePreviousStep = () => {
        setStep(step - 1);
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            const payload = {
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber,
                createVendorProfile: formData.createVendorProfile,
                vendorData: formData.createVendorProfile ? formData.vendorData : undefined
            };

            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                setRegisteredEmail(formData.email);
                setStep(4);
            } else {
                toast.error(data.error || 'Registration failed');

                if (data.details) {
                    const fieldErrors = data.details.reduce((acc: Record<string, string>, detail: any) => {
                        acc[detail.field] = detail.message;
                        return acc;
                    }, {});
                    setErrors(fieldErrors);
                }
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
            console.error('Registration error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setResendLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: registeredEmail }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
            } else {
                toast.error(data.error || 'Failed to resend verification email');
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    const StepProgress = () => (
        <div className="mb-8">
            <div className="flex justify-between items-center">
                {steps.map((s, index) => (
                    <React.Fragment key={s.number}>
                        <div className="flex flex-col items-center">
                            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold text-sm
                ${step > s.number
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-600 text-white'
                                    : step === s.number
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-500'
                                }
              `}>
                                {step > s.number ? <Check className="w-5 h-5" /> : s.number}
                            </div>
                            <div className="mt-2 text-xs font-medium text-white">{s.title}</div>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`
                flex-1 h-1 mx-4 mt-5
                ${step > s.number + 1
                                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                                    : 'bg-gray-200'
                                }
              `} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );

    const StepIndicator = () => (
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
                {steps[step - 1].title}
            </h2>
            <p className="text-gray-600 mt-1">{steps[step - 1].description}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="md:flex">
                        <div className="md:w-2/5 bg-purple-600 p-8 text-white">
                            <div className="h-full flex flex-col">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold mb-4">
                                        Join the Premier Event Marketplace
                                    </h2>
                                    <p className="text-orange-100">
                                        Whether you're planning events or providing services, EventASAP connects you with the right people.
                                    </p>
                                </div>

                                <StepProgress />

                                <div className="mt-auto space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Zap className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Switch Roles Instantly</h4>
                                            <p className="text-sm text-orange-100">Toggle between client and vendor modes anytime</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">One Account, Dual Purpose</h4>
                                            <p className="text-sm text-orange-100">Single registration for both client and vendor needs</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/20">
                                    <p className="text-sm text-orange-100">
                                        Already have an account?{' '}
                                        <a href="/login" className="text-white font-semibold hover:underline">
                                            Sign in here
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="md:w-3/5 p-8">
                            <StepIndicator />

                            <AnimatePresence mode="wait">
                                {/* Step 1 - Account Type */}
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address *
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${errors.email || (emailChecked && !isEmailAvailable)
                                                        ? 'border-red-500 focus:ring-red-200'
                                                        : 'border-gray-300 focus:ring-orange-200 focus:border-orange-300'
                                                        }`}
                                                    placeholder="your.email@example.com"
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.email}
                                                </p>
                                            )}
                                            {emailChecked && !isEmailAvailable && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    Email already registered
                                                </p>
                                            )}
                                            {emailChecked && isEmailAvailable && formData.email && (
                                                <p className="mt-1 text-sm text-green-600 flex items-center">
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Email available
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Choose Your Role</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, createVendorProfile: false }))}
                                                    className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${!formData.createVendorProfile
                                                        ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 shadow-md'
                                                        : 'border-gray-200 hover:border-orange-200 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${!formData.createVendorProfile
                                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                                                            : 'bg-gray-100'
                                                            }`}>
                                                            <Users className={`w-6 h-6 ${!formData.createVendorProfile ? 'text-white' : 'text-gray-400'
                                                                }`} />
                                                        </div>
                                                        <div>
                                                            <h4 className={`font-bold ${!formData.createVendorProfile ? 'text-orange-700' : 'text-gray-700'
                                                                }`}>
                                                                Event Client
                                                            </h4>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                Find & book vendors for your events
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, createVendorProfile: true }))}
                                                    className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${formData.createVendorProfile
                                                        ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 shadow-md'
                                                        : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${formData.createVendorProfile
                                                            ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                                                            : 'bg-gray-100'
                                                            }`}>
                                                            <Briefcase className={`w-6 h-6 ${formData.createVendorProfile ? 'text-white' : 'text-gray-400'
                                                                }`} />
                                                        </div>
                                                        <div>
                                                            <h4 className={`font-bold ${formData.createVendorProfile ? 'text-purple-700' : 'text-gray-700'
                                                                }`}>
                                                                Service Vendor
                                                            </h4>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                Offer your services to clients
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 2 - Personal Details */}
                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    First Name *
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        value={formData.firstName}
                                                        onChange={handleInputChange}
                                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${errors.firstName
                                                            ? 'border-red-500 focus:ring-red-200'
                                                            : 'border-gray-300 focus:ring-orange-200 focus:border-orange-300'
                                                            }`}
                                                        placeholder="John"
                                                    />
                                                </div>
                                                {errors.firstName && (
                                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                                        <AlertCircle className="w-4 h-4 mr-1" />
                                                        {errors.firstName}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Last Name *
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        name="lastName"
                                                        value={formData.lastName}
                                                        onChange={handleInputChange}
                                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${errors.lastName
                                                            ? 'border-red-500 focus:ring-red-200'
                                                            : 'border-gray-300 focus:ring-orange-200 focus:border-orange-300'
                                                            }`}
                                                        placeholder="Doe"
                                                    />
                                                </div>
                                                {errors.lastName && (
                                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                                        <AlertCircle className="w-4 h-4 mr-1" />
                                                        {errors.lastName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number *
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    name="phoneNumber"
                                                    value={formData.phoneNumber}
                                                    onChange={handleInputChange}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${errors.phoneNumber
                                                        ? 'border-red-500 focus:ring-red-200'
                                                        : 'border-gray-300 focus:ring-orange-200 focus:border-orange-300'
                                                        }`}
                                                    placeholder="+44 1234 567890"
                                                />
                                            </div>
                                            {errors.phoneNumber && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.phoneNumber}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Password *
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${errors.password
                                                        ? 'border-red-500 focus:ring-red-200'
                                                        : 'border-gray-300 focus:ring-orange-200 focus:border-orange-300'
                                                        }`}
                                                    placeholder="Create a strong password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirm Password *
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${errors.confirmPassword
                                                        ? 'border-red-500 focus:ring-red-200'
                                                        : 'border-gray-300 focus:ring-orange-200 focus:border-orange-300'
                                                        }`}
                                                    placeholder="Confirm your password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.confirmPassword}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3 - Vendor Details */}
                                {step === 3 && formData.createVendorProfile && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Business Name *
                                                </label>
                                                <div className="relative">
                                                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        name="vendorData.businessName"
                                                        value={formData.vendorData?.businessName || ''}
                                                        onChange={handleInputChange}
                                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${errors.businessName
                                                            ? 'border-red-500 focus:ring-red-200'
                                                            : 'border-gray-300 focus:ring-orange-200 focus:border-orange-300'
                                                            }`}
                                                        placeholder="Your Business Name"
                                                    />
                                                </div>
                                                {errors.businessName && (
                                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                                        <AlertCircle className="w-4 h-4 mr-1" />
                                                        {errors.businessName}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Business Phone *
                                                </label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="tel"
                                                        name="vendorData.businessPhone"
                                                        value={formData.vendorData?.businessPhone || ''}
                                                        onChange={handleInputChange}
                                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${errors.businessPhone
                                                            ? 'border-red-500 focus:ring-red-200'
                                                            : 'border-gray-300 focus:ring-orange-200 focus:border-orange-300'
                                                            }`}
                                                        placeholder="+44 1234 567890"
                                                    />
                                                </div>
                                                {errors.businessPhone && (
                                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                                        <AlertCircle className="w-4 h-4 mr-1" />
                                                        {errors.businessPhone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Business Email *
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    name="vendorData.businessEmail"
                                                    value={formData.vendorData?.businessEmail || ''}
                                                    onChange={handleInputChange}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${errors.businessEmail
                                                        ? 'border-red-500 focus:ring-red-200'
                                                        : 'border-gray-300 focus:ring-orange-200 focus:border-orange-300'
                                                        }`}
                                                    placeholder="business@example.com"
                                                />
                                            </div>
                                            {errors.businessEmail && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.businessEmail}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    City *
                                                </label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <select
                                                        name="vendorData.city"
                                                        value={formData.vendorData?.city || ''}
                                                        onChange={handleInputChange}
                                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${errors.city
                                                            ? 'border-red-500 focus:ring-red-200'
                                                            : 'border-gray-300 focus:ring-orange-200 focus:border-orange-300'
                                                            }`}
                                                    >
                                                        <option value="">Select City</option>
                                                        {ukCities.map(city => (
                                                            <option key={city} value={city}>{city}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {errors.city && (
                                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                                        <AlertCircle className="w-4 h-4 mr-1" />
                                                        {errors.city}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Service Category *
                                                </label>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <select
                                                        name="vendorData.category"
                                                        value={formData.vendorData?.category || ''}
                                                        onChange={handleInputChange}
                                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${errors.category
                                                            ? 'border-red-500 focus:ring-red-200'
                                                            : 'border-gray-300 focus:ring-orange-200 focus:border-orange-300'
                                                            }`}
                                                    >
                                                        <option value="">Select Category</option>
                                                        {serviceCategories.map(category => (
                                                            <option key={category} value={category}>{category}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {errors.category && (
                                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                                        <AlertCircle className="w-4 h-4 mr-1" />
                                                        {errors.category}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Business Description
                                            </label>
                                            <textarea
                                                name="vendorData.description"
                                                value={formData.vendorData?.description || ''}
                                                onChange={handleInputChange}
                                                rows={3}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                                                placeholder="Describe your services and expertise..."
                                            />
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id="whatsappEnabled"
                                                name="vendorData.whatsappEnabled"
                                                checked={formData.vendorData?.whatsappEnabled || false}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                            />
                                            <label htmlFor="whatsappEnabled" className="text-sm text-gray-700">
                                                Enable WhatsApp notifications for booking inquiries
                                            </label>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3 - Client Confirmation */}
                                {step === 3 && !formData.createVendorProfile && (
                                    <motion.div
                                        key="step3-client"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border border-green-200">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                                    <Users className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">Client Account Setup Complete</h3>
                                                    <p className="text-gray-600 mt-1">
                                                        You're almost done! Review your information below and complete registration.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h4 className="font-semibold text-gray-900 mb-4">Registration Summary</h4>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Name</p>
                                                        <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Email</p>
                                                        <p className="font-medium">{formData.email}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Phone</p>
                                                        <p className="font-medium">{formData.phoneNumber}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Account Type</p>
                                                        <p className="font-medium text-green-600">Event Client</p>
                                                    </div>
                                                </div>
                                                <div className="pt-4 border-t border-gray-200">
                                                    <p className="text-sm text-gray-600">
                                                        As a client, you'll be able to browse vendors, request quotes, and manage bookings.
                                                        You can upgrade to a vendor account anytime in your settings.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 4 - Email Verification Notice */}
                                {step === 4 && (
                                    <motion.div
                                        key="step4"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-8"
                                    >
                                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Mail className="w-10 h-10 text-white" />
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            Check Your Email
                                        </h3>

                                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                            We've sent a verification link to <strong>{registeredEmail}</strong>
                                        </p>

                                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl max-w-md mx-auto mb-6">
                                            <div className="space-y-4 text-left">
                                                <div className="flex items-start space-x-3">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-blue-600 font-bold text-sm">1</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-700">
                                                            Check your inbox for an email from EventASAP
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start space-x-3">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-blue-600 font-bold text-sm">2</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-700">
                                                            Click the verification link in the email
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start space-x-3">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-blue-600 font-bold text-sm">3</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-700">
                                                            Your account will be activated and you'll be logged in
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6 max-w-md mx-auto">
                                            <p className="text-sm text-gray-700">
                                                <strong>Didn't receive the email?</strong> Check your spam folder or request a new verification email.
                                            </p>
                                        </div>

                                        <div className="space-y-3 max-w-md mx-auto">
                                            <button
                                                onClick={handleResendVerification}
                                                disabled={resendLoading}
                                                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                {resendLoading ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="w-5 h-5 mr-2" />
                                                        Resend Verification Email
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => router.push('/login')}
                                                className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                            >
                                                Back to Login
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {step < 4 && (
                                <div className="mt-8 flex justify-between">
                                    {step > 1 ? (
                                        <button
                                            onClick={handlePreviousStep}
                                            disabled={isLoading}
                                            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back
                                        </button>
                                    ) : (
                                        <div></div>
                                    )}

                                    <button
                                        onClick={handleNextStep}
                                        disabled={isLoading || (step === 1 && (!emailChecked || !isEmailAvailable))}
                                        className="cursor-pointer px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                {step === 3 ? 'Registering...' : 'Processing...'}
                                            </>
                                        ) : (
                                            <>
                                                {step === 3 ? 'Complete Registration' : 'Continue'}
                                                <ChevronRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <p className="text-xs text-gray-500 text-center">
                                    By registering, you agree to EventASAP's{' '}
                                    <a href="/terms" className="text-orange-600 hover:underline font-medium">
                                        Terms of Service
                                    </a>{' '}
                                    and{' '}
                                    <a href="/privacy" className="text-orange-600 hover:underline font-medium">
                                        Privacy Policy
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedRegistration;