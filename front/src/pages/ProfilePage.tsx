import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Shield, Settings, Edit3, Save, X, Award, Briefcase, GraduationCap, Clock, Languages, Heart, Activity, FileDown, AlertCircle } from 'lucide-react';
import HeaderCompo from './components/Header';
import FooterCompo from './components/Footer';
import { exportComprehensiveReport } from '@/lib/api';
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  dateOfBirth: string;
  profession: string;
  specialization?: string;
  bio: string;
  avatar?: string;
  experience: string;
  education: string;
  languages: string[];
  certifications: string[];
  workingHours: string;
  emergencyContact: string;
  medicalLicense: string;
  institution: string;
}

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@medimate.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    dateOfBirth: '1985-03-15',
    profession: 'Médecin Généraliste',
    specialization: 'Médecine Interne',
    bio: 'Médecin expérimenté avec plus de 10 ans d\'expérience dans la médecine générale et la consultation médicale assistée par IA.',
    experience: '12 ans',
    education: 'Doctorat en Médecine - Université de Harvard',
    languages: ['Français', 'Anglais', 'Espagnol'],
    certifications: ['Board Certified Internal Medicine', 'Advanced Cardiac Life Support (ACLS)', 'Telemedicine Certification'],
    workingHours: 'Lun-Ven: 8h00-18h00, Sam: 9h00-13h00',
    emergencyContact: '+1 (555) 987-6543',
    medicalLicense: 'NY-MD-2015-789456',
    institution: 'Hôpital Central de New York'
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [exportError, setExportError] = useState<string | null>(null);

  // Get userId from localStorage
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const storedUserId = localStorage.getItem('mindmate_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserProfile, value: string | string[]) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleExportProfile = async () => {
    if (!userId) {
      setExportError("Please log in to export your profile.");
      setExportStatus('error');
      return;
    }

    try {
      setExportStatus('loading');
      setExportError(null);
      
      await exportComprehensiveReport(userId);
      
      setExportStatus('success');
      // Reset success status after 3 seconds
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (err: any) {
      console.error("Profile export failed:", err);
      setExportError(err.message || "Failed to export profile report");
      setExportStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
       <HeaderCompo/>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-800"></div>
                </div>
                
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-2xl font-bold text-white bg-slate-700 rounded-lg px-3 py-1 mb-2 text-center w-full"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-white mb-2">{profile.name}</h2>
                )}
                
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.profession}
                    onChange={(e) => handleInputChange('profession', e.target.value)}
                    className="text-blue-200 bg-slate-700 rounded-lg px-3 py-1 mb-4 text-center w-full"
                  />
                ) : (
                  <p className="text-blue-200 mb-4">{profile.profession}</p>
                )}
                
                <div className="flex items-center justify-center space-x-2 text-green-400 mb-6">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm">En ligne</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">150+</div>
                  <div className="text-sm text-gray-400">Consultations</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">98%</div>
                  <div className="text-sm text-gray-400">Satisfaction</div>
                </div>
              </div>

              {/* Experience & License */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Award className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300">Licence: {profile.medicalLicense}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Briefcase className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">{profile.experience} d'expérience</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Heart className="h-4 w-4 text-red-400" />
                  <span className="text-gray-300">{profile.institution}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Informations Personnelles</h3>
                <Settings className="h-5 w-5 text-gray-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg">{profile.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <Phone className="h-4 w-4" />
                    <span>Téléphone</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg">{profile.phone}</p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <MapPin className="h-4 w-4" />
                    <span>Localisation</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg">{profile.location}</p>
                  )}
                </div>

                {/* Institution */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <Heart className="h-4 w-4" />
                    <span>Institution</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.institution}
                      onChange={(e) => handleInputChange('institution', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg">{profile.institution}</p>
                  )}
                </div>

                {/* Medical License */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <Award className="h-4 w-4" />
                    <span>Licence Médicale</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.medicalLicense}
                      onChange={(e) => handleInputChange('medicalLicense', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg">{profile.medicalLicense}</p>
                  )}
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <Briefcase className="h-4 w-4" />
                    <span>Années d'expérience</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg">{profile.experience}</p>
                  )}
                </div>

                {/* Education */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <GraduationCap className="h-4 w-4" />
                    <span>Formation</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.education}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg">{profile.education}</p>
                  )}
                </div>

                {/* Working Hours */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <Clock className="h-4 w-4" />
                    <span>Heures de travail</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.workingHours}
                      onChange={(e) => handleInputChange('workingHours', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg">{profile.workingHours}</p>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <Activity className="h-4 w-4" />
                    <span>Contact d'urgence</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg">{profile.emergencyContact}</p>
                  )}
                </div>

                {/* Specialization */}
                <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <Shield className="h-4 w-4" />
                    <span>Spécialisation</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.specialization || ''}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg">{profile.specialization}</p>
                  )}
                </div>

                {/* Languages */}
                <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <Languages className="h-4 w-4" />
                    <span>Langues parlées</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.languages.join(', ')}
                      onChange={(e) => handleInputChange('languages', e.target.value.split(', '))}
                      placeholder="Séparez les langues par des virgules"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((lang, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">
                          {lang}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Certifications */}
                <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <Award className="h-4 w-4" />
                    <span>Certifications</span>
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editedProfile.certifications.join('\n')}
                      onChange={(e) => handleInputChange('certifications', e.target.value.split('\n'))}
                      placeholder="Une certification par ligne"
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  ) : (
                    <div className="space-y-2">
                      {profile.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-slate-700/50 rounded-lg">
                          <Shield className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span className="text-white text-sm">{cert}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Export Profile Section */}
              <div className="mt-8 p-4 bg-slate-700/50 border border-blue-500/30 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FileDown className="h-5 w-5 text-blue-400" />
                  Export Profile Report
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Download a comprehensive PDF report of your profile data and session history.
                </p>
                
                {/* Export Status Messages */}
                {exportStatus === 'error' && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-200">{exportError || "Failed to export profile report"}</span>
                  </div>
                )}
                
                {exportStatus === 'success' && (
                  <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-start gap-2">
                    <FileDown className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-green-200">Profile report exported successfully! Check your downloads folder.</span>
                  </div>
                )}
                
                <button
                  onClick={handleExportProfile}
                  disabled={exportStatus === 'loading' || !userId}
                  className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-lg font-medium 
                    ${userId ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-600 text-gray-300 cursor-not-allowed'}
                    transition-colors duration-200`}
                >
                  {exportStatus === 'loading' ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileDown className="h-4 w-4" />
                      {userId ? 'Export Profile Report' : 'Login Required to Export'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterCompo/>
    </div>
  );
};

export default ProfilePage;