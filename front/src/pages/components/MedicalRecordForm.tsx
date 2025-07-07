import React, { useState } from 'react';
import { User, Calendar, Phone, Mail, MapPin, AlertCircle, Heart, Pill, FileText, Save, Plus, X } from 'lucide-react';
import HeaderCompo from '../components/Header';
import FooterCompo from '../components/Footer';
// Interfaces TypeScript
interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  emergencyContact: string;
  emergencyPhone: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

interface Surgery {
  procedure: string;
  date: string;
  notes: string;
}

interface FamilyHistory {
  condition: string;
  relation: string;
}

interface VitalSigns {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  respiratoryRate: string;
}

interface CurrentConsultation {
  chiefComplaint: string;
  symptoms: string;
  symptomDuration: string;
  painLevel: string;
  vitalSigns: VitalSigns;
}

interface MedicalInfo {
  bloodType: string;
  height: string;
  weight: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: Medication[];
  previousSurgeries: Surgery[];
  familyHistory: FamilyHistory[];
}

interface FormData {
  personalInfo: PersonalInfo;
  medicalInfo: MedicalInfo;
  currentConsultation: CurrentConsultation;
}

const MedicalRecordForm = () => {
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      postalCode: '',
      emergencyContact: '',
      emergencyPhone: '',
    },
    medicalInfo: {
      bloodType: '',
      height: '',
      weight: '',
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
      previousSurgeries: [],
      familyHistory: [],
    },
    currentConsultation: {
      chiefComplaint: '',
      symptoms: '',
      symptomDuration: '',
      painLevel: '0',
      vitalSigns: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        respiratoryRate: '',
      }
    }
  });

  const [currentAllergy, setCurrentAllergy] = useState('');
  const [currentCondition, setCurrentCondition] = useState('');
  const [currentMedication, setCurrentMedication] = useState<Medication>({ name: '', dosage: '', frequency: '' });
  const [currentSurgery, setCurrentSurgery] = useState<Surgery>({ procedure: '', date: '', notes: '' });
  const [currentFamilyHistory, setCurrentFamilyHistory] = useState<FamilyHistory>({ condition: '', relation: '' });

  const handleInputChange = (section: keyof FormData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section: keyof FormData, subsection: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as any)[subsection],
          [field]: value
        }
      }
    }));
  };

  const addToArray = <T,>(section: keyof FormData, field: string, item: T) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...(prev[section] as any)[field], item]
      }
    }));
  };

  const removeFromArray = (section: keyof FormData, field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: (prev[section] as any)[field].filter((_: any, i: number) => i !== index)
      }
    }));
  };

  const handleSubmit = () => {
    console.log('Données du dossier médical:', formData);
    alert('Dossier médical enregistré avec succès!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <HeaderCompo/>

      <div className="max-w-4xl py-20 mx-auto ">
        {/* Header */}
        <div>
             
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Dossier Médical <span className="text-blue-300">MediMate</span>
          </h1>
          <p className="text-blue-200">Formulaire complet de consultation médicale</p>
        </div>

        <div className="space-y-8">
          {/* Informations Personnelles */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-6">
              <User className="text-blue-300 mr-3" size={24} />
              <h2 className="text-2xl font-bold text-white">Informations Personnelles</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Prénom</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Entrez le prénom"
                  value={formData.personalInfo.firstName}
                  onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Nom</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Entrez le nom"
                  value={formData.personalInfo.lastName}
                  onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Date de naissance</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Sexe</label>
                <select
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.personalInfo.gender}
                  onChange={(e) => handleInputChange('personalInfo', 'gender', e.target.value)}
                >
                  <option value="">Sélectionnez</option>
                  <option value="male">Masculin</option>
                  <option value="female">Féminin</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Téléphone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="+212 6XX XXX XXX"
                  value={formData.personalInfo.phone}
                  onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="exemple@email.com"
                  value={formData.personalInfo.email}
                  onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-blue-200 text-sm font-medium mb-2">Adresse</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Adresse complète"
                  value={formData.personalInfo.address}
                  onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Contact d'urgence</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Nom du contact"
                  value={formData.personalInfo.emergencyContact}
                  onChange={(e) => handleInputChange('personalInfo', 'emergencyContact', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Téléphone d'urgence</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="+212 6XX XXX XXX"
                  value={formData.personalInfo.emergencyPhone}
                  onChange={(e) => handleInputChange('personalInfo', 'emergencyPhone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Informations Médicales */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-6">
              <Heart className="text-red-400 mr-3" size={24} />
              <h2 className="text-2xl font-bold text-white">Informations Médicales</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Groupe sanguin</label>
                <select
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.medicalInfo.bloodType}
                  onChange={(e) => handleInputChange('medicalInfo', 'bloodType', e.target.value)}
                >
                  <option value="">Sélectionnez</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Taille (cm)</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="170"
                  value={formData.medicalInfo.height}
                  onChange={(e) => handleInputChange('medicalInfo', 'height', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Poids (kg)</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="70"
                  value={formData.medicalInfo.weight}
                  onChange={(e) => handleInputChange('medicalInfo', 'weight', e.target.value)}
                />
              </div>
            </div>

            {/* Allergies */}
            <div className="mb-6">
              <label className="block text-blue-200 text-sm font-medium mb-2">Allergies</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Ajouter une allergie"
                  value={currentAllergy}
                  onChange={(e) => setCurrentAllergy(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (currentAllergy.trim()) {
                      addToArray('medicalInfo', 'allergies', currentAllergy.trim());
                      setCurrentAllergy('');
                    }
                  }}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.medicalInfo.allergies.map((allergy, index) => (
                  <span key={index} className="bg-red-500/20 text-red-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {allergy}
                    <X 
                      size={16} 
                      className="cursor-pointer hover:text-red-100" 
                      onClick={() => removeFromArray('medicalInfo', 'allergies', index)}
                    />
                  </span>
                ))}
              </div>
            </div>

            {/* Conditions chroniques */}
            <div className="mb-6">
              <label className="block text-blue-200 text-sm font-medium mb-2">Conditions chroniques</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Ajouter une condition"
                  value={currentCondition}
                  onChange={(e) => setCurrentCondition(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (currentCondition.trim()) {
                      addToArray('medicalInfo', 'chronicConditions', currentCondition.trim());
                      setCurrentCondition('');
                    }
                  }}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.medicalInfo.chronicConditions.map((condition, index) => (
                  <span key={index} className="bg-orange-500/20 text-orange-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {condition}
                    <X 
                      size={16} 
                      className="cursor-pointer hover:text-orange-100" 
                      onClick={() => removeFromArray('medicalInfo', 'chronicConditions', index)}
                    />
                  </span>
                ))}
              </div>
            </div>

            {/* Médicaments actuels */}
            <div className="mb-6">
              <label className="block text-blue-200 text-sm font-medium mb-2">Médicaments actuels</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <input
                  type="text"
                  className="px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Nom du médicament"
                  value={currentMedication.name}
                  onChange={(e) => setCurrentMedication(prev => ({ ...prev, name: e.target.value }))}
                />
                <input
                  type="text"
                  className="px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Dosage"
                  value={currentMedication.dosage}
                  onChange={(e) => setCurrentMedication(prev => ({ ...prev, dosage: e.target.value }))}
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Fréquence"
                    value={currentMedication.frequency}
                    onChange={(e) => setCurrentMedication(prev => ({ ...prev, frequency: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (currentMedication.name.trim()) {
                        addToArray('medicalInfo', 'currentMedications', { ...currentMedication });
                        setCurrentMedication({ name: '', dosage: '', frequency: '' });
                      }
                    }}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {formData.medicalInfo.currentMedications.map((medication, index) => (
                  <div key={index} className="bg-blue-500/20 text-blue-200 px-4 py-2 rounded-lg flex items-center justify-between">
                    <span>
                      <strong>{medication.name}</strong> - {medication.dosage} - {medication.frequency}
                    </span>
                    <X 
                      size={16} 
                      className="cursor-pointer hover:text-blue-100" 
                      onClick={() => removeFromArray('medicalInfo', 'currentMedications', index)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Consultation actuelle */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-6">
              <FileText className="text-green-400 mr-3" size={24} />
              <h2 className="text-2xl font-bold text-white">Consultation Actuelle</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Motif de consultation</label>
                <textarea
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 h-24 resize-none"
                  placeholder="Décrivez le motif principal de la consultation..."
                  value={formData.currentConsultation.chiefComplaint}
                  onChange={(e) => handleInputChange('currentConsultation', 'chiefComplaint', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">Symptômes</label>
                <textarea
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 h-32 resize-none"
                  placeholder="Décrivez les symptômes en détail..."
                  value={formData.currentConsultation.symptoms}
                  onChange={(e) => handleInputChange('currentConsultation', 'symptoms', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">Durée des symptômes</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Ex: 3 jours, 1 semaine..."
                    value={formData.currentConsultation.symptomDuration}
                    onChange={(e) => handleInputChange('currentConsultation', 'symptomDuration', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">Niveau de douleur (1-10)</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    value={formData.currentConsultation.painLevel}
                    onChange={(e) => handleInputChange('currentConsultation', 'painLevel', e.target.value)}
                  />
                  <div className="text-white text-center mt-2">
                    {formData.currentConsultation.painLevel}/10
                  </div>
                </div>
              </div>

              {/* Signes vitaux */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Signes Vitaux</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-blue-200 text-sm font-medium mb-2">Tension artérielle</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="120/80"
                      value={formData.currentConsultation.vitalSigns.bloodPressure}
                      onChange={(e) => handleNestedInputChange('currentConsultation', 'vitalSigns', 'bloodPressure', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-blue-200 text-sm font-medium mb-2">Fréquence cardiaque</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="72"
                      value={formData.currentConsultation.vitalSigns.heartRate}
                      onChange={(e) => handleNestedInputChange('currentConsultation', 'vitalSigns', 'heartRate', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-blue-200 text-sm font-medium mb-2">Température (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="37.0"
                      value={formData.currentConsultation.vitalSigns.temperature}
                      onChange={(e) => handleNestedInputChange('currentConsultation', 'vitalSigns', 'temperature', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-blue-200 text-sm font-medium mb-2">Fréquence respiratoire</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="16"
                      value={formData.currentConsultation.vitalSigns.respiratoryRate}
                      onChange={(e) => handleNestedInputChange('currentConsultation', 'vitalSigns', 'respiratoryRate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="text-center">
            <button
              onClick={handleSubmit}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Save className="mr-2" size={20} />
              Enregistrer le Dossier Médical
            </button>
          </div>
        </div>
      </div>
      <FooterCompo/>

    </div>
  );
};

export default MedicalRecordForm;