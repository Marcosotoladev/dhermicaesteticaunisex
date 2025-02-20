// components/profile/ChatBot.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  options?: string[];
}

interface ProfileData {
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

interface ChatBotProps {
  onComplete: (data: ProfileData) => void;
  onClose: () => void;
}

interface ChatStep {
  id: string;
  content: string;
  type: 'text' | 'date' | 'boolean' | 'multiselect';
  field: string;
  options?: string[];
}

const CHAT_STEPS: ChatStep[] = [
  {
    id: 'welcome',
    content: '¡Hola! Soy el asistente de Dhermica. Voy a ayudarte a completar tu perfil para brindarte la mejor atención. ¿Comenzamos?',
    type: 'boolean',
    field: 'start',
    options: ['Sí, empecemos', 'Más tarde']
  },
  {
    id: 'name',
    content: 'Para empezar, ¿podrías decirme tu nombre completo?',
    type: 'text',
    field: 'personalInfo.fullName'
  },
  {
    id: 'phone',
    content: '¿Cuál es tu número de teléfono?',
    type: 'text',
    field: 'personalInfo.phone'
  },
  {
    id: 'address',
    content: '¿Cuál es tu dirección?',
    type: 'text',
    field: 'personalInfo.address'
  },
  {
    id: 'birthDate',
    content: '¿Cuál es tu fecha de nacimiento?',
    type: 'date',
    field: 'personalInfo.birthDate'
  },
  {
    id: 'tattoos',
    content: '¿Tienes tatuajes?',
    type: 'boolean',
    field: 'medicalInfo.tattoos.has',
    options: ['Sí', 'No']
  },
  {
    id: 'skinProblems',
    content: '¿Has tenido alguno de estos problemas en la piel?',
    type: 'multiselect',
    field: 'medicalInfo.skinProblems',
    options: [
      'Acné',
      'Manchas',
      'Rosácea',
      'Dermatitis',
      'Psoriasis',
      'Ninguno'
    ]
  },
  {
    id: 'cancer',
    content: '¿Has tenido o tienes actualmente cáncer?',
    type: 'boolean',
    field: 'medicalInfo.cancer.has',
    options: ['Sí', 'No']
  },
  {
    id: 'allergies',
    content: '¿Tienes alguna alergia? Por favor, especifica cuáles',
    type: 'text',
    field: 'medicalInfo.allergies'
  },
  {
    id: 'medications',
    content: '¿Estás tomando algún medicamento actualmente?',
    type: 'text',
    field: 'medicalInfo.currentMedications'
  },
  {
    id: 'treatments',
    content: '¿Te has realizado tratamientos estéticos previamente?',
    type: 'multiselect',
    field: 'medicalInfo.previousTreatments',
    options: [
      'Botox',
      'Rellenos',
      'Peeling',
      'Depilación láser',
      'Ninguno'
    ]
  }
]

export function ChatBot({ onComplete, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([{
    id: Date.now().toString(),
    type: 'bot',
    content: CHAT_STEPS[0].content,
    options: CHAT_STEPS[0].options
  }])


  const [currentStep, setCurrentStep] = useState(0)
  const [profileData, setProfileData] = useState<Partial<ProfileData>>({
    personalInfo: {
      fullName: '',
      address: '',
      phone: '',
      birthDate: ''
    },
    medicalInfo: {
      tattoos: { has: false, locations: [] },
      skinProblems: [],
      cancer: { has: false, details: '' },
      allergies: [],
      currentMedications: [],
      previousTreatments: []
    }
  })
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [userInput, setUserInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])



  const addBotMessage = (step: ChatStep) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'bot',
      content: step.content,
      options: step.options
    }])
  }

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content
    }])
  }

  const handleUserInput = () => {
    if (!userInput.trim()) return

    const currentStepData = CHAT_STEPS[currentStep]
    addUserMessage(userInput)
    updateProfileData(currentStepData.field, userInput)
    setUserInput('')
    nextStep()
  }

  const handleOption = (option: string) => {
    const currentStepData = CHAT_STEPS[currentStep]
    addUserMessage(option)

    if (currentStepData.id === 'welcome' && option === 'Más tarde') {
      onClose()
      return
    }

    const value = currentStepData.type === 'boolean' ? option === 'Sí' : option
    updateProfileData(currentStepData.field, value)
    nextStep()
  }

  const handleMultiSelect = (option: string) => {
    setSelectedOptions(prev => {
      const newOptions = [...prev]
      const index = newOptions.indexOf(option)
      
      if (option === 'Ninguno') {
        // Si selecciona "Ninguno", limpia todas las demás opciones
        return ['Ninguno']
      } else {
        // Si selecciona otra opción, quita "Ninguno" si estaba seleccionado
        if (index === -1) {
          newOptions.push(option)
        } else {
          newOptions.splice(index, 1)
        }
        return newOptions.filter(opt => opt !== 'Ninguno')
      }
    })
  }

  const handleMultiSelectComplete = () => {
    if (selectedOptions.length > 0) {
      const currentStepData = CHAT_STEPS[currentStep]
      addUserMessage(selectedOptions.join(', '))
      updateProfileData(currentStepData.field, selectedOptions)
      setSelectedOptions([])
      nextStep()
    }
  }

  const updateProfileData = (field: string, value: any) => {
    const fields = field.split('.')
    setProfileData(prev => {
      const newData = { ...prev }
      let current: any = newData
      for (let i = 0; i < fields.length - 1; i++) {
        if (!current[fields[i]]) {
          current[fields[i]] = {}
        }
        current = current[fields[i]]
      }
      current[fields[fields.length - 1]] = value
      return newData
    })
  }

  const nextStep = () => {
    if (currentStep < CHAT_STEPS.length - 1) {
      const nextStepData = CHAT_STEPS[currentStep + 1]
      setTimeout(() => {
        addBotMessage(nextStepData)
        setCurrentStep(prev => prev + 1)
      }, 500)
    } else {
      setTimeout(() => {
        addBotMessage({
          id: 'complete',
          content: '¡Gracias! Hemos completado tu perfil.',
          type: 'text',
          field: 'complete'
        })
        onComplete(profileData as ProfileData)
      }, 500)
    }
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-dhermica-success to-dhermica-info p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium">Completar Perfil</h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-dhermica-success text-white'
                  : 'bg-gray-100'
              }`}
            >
              <p>{message.content}</p>
              {message.options && (
                <div className="mt-3 space-y-2">
                  {CHAT_STEPS[currentStep].type === 'multiselect' ? (
                    <>
                      {message.options.map(option => (
                        <button
                          key={option}
                          onClick={() => handleMultiSelect(option)}
                          className={`w-full px-4 py-2 rounded-xl text-left ${
                            selectedOptions.includes(option)
                              ? 'bg-dhermica-success text-white'
                              : 'bg-white border border-dhermica-secondary/20 text-dhermica-primary'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                      <Button
                        onClick={handleMultiSelectComplete}
                        disabled={selectedOptions.length === 0}
                        className="w-full mt-4"
                      >
                        Continuar
                      </Button>
                    </>
                  ) : (
                    message.options.map(option => (
                      <Button
                        key={option}
                        onClick={() => handleOption(option)}
                        variant={message.type === 'user' ? 'secondary' : 'primary'}
                        className="w-full"
                      >
                        {option}
                      </Button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {currentStep > 0 && (CHAT_STEPS[currentStep].type === 'text' || CHAT_STEPS[currentStep].type === 'date') && (
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type={CHAT_STEPS[currentStep].type === 'date' ? 'date' : 'text'}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUserInput()}
              className="flex-1 px-4 py-2 rounded-xl border border-dhermica-secondary/20 
                       focus:border-dhermica-success focus:ring-2 focus:ring-dhermica-success/20"
              placeholder={CHAT_STEPS[currentStep].type === 'date' ? 'Selecciona una fecha' : 'Escribe tu respuesta...'}
            />
            <Button onClick={handleUserInput}>
              Enviar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}