import { useEffect, useState } from 'react'
import './App.css'

const categories = [
  { icon: '🔧', name: 'Assistência técnica' },
  { icon: '💈', name: 'Barbearia' },
  { icon: '💅', name: 'Beleza e estética' },
  { icon: '🚗', name: 'Oficina' },
  { icon: '🏥', name: 'Saúde' },
  { icon: '💻', name: 'Tecnologia' },
  { icon: '🏠', name: 'Serviços para casa' },
  { icon: '➕', name: 'Outros serviços' },
]

const weekDays = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
]

function App() {
  const [search, setSearch] = useState('')
  const [professionalSearch, setProfessionalSearch] = useState('')
  const [professionalDirectoryVersion, setProfessionalDirectoryVersion] =
    useState(0)
  const [selectedProfessional, setSelectedProfessional] = useState(null)
  const [bookingService, setBookingService] = useState('')
  const [bookingDate, setBookingDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  )
  const [bookingTime, setBookingTime] = useState('')

  const [screen, setScreen] = useState(() => {
    const savedUser = localStorage.getItem('trafex_logged_user')

    if (!savedUser) return 'home'

    try {
      const user = JSON.parse(savedUser)

      if (user?.id && user?.type) {
        return 'dashboard'
      }

      localStorage.removeItem('trafex_logged_user')
      return 'home'
    } catch {
      localStorage.removeItem('trafex_logged_user')
      return 'home'
    }
  })

  const [accountType, setAccountType] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [category, setCategory] = useState('')

  const [message, setMessage] = useState('')

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('trafex_logged_user')

    if (!savedUser) return null

    try {
      const user = JSON.parse(savedUser)

      if (!user?.id || !user?.type) {
        localStorage.removeItem('trafex_logged_user')
        return null
      }

      return user
    } catch {
      localStorage.removeItem('trafex_logged_user')
      return null
    }
  })

  const [profileImage, setProfileImage] = useState(() => {
    const savedUser = localStorage.getItem('trafex_logged_user')

    if (!savedUser) return ''

    try {
      const user = JSON.parse(savedUser)
      return user?.profileImage || ''
    } catch {
      return ''
    }
  })

  const [professionalSection, setProfessionalSection] =
    useState('overview')

  const [selectedAgendaDate, setSelectedAgendaDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  )

  const [appointmentMessage, setAppointmentMessage] = useState('')
  const [bookingStep, setBookingStep] = useState(1)
  const [clientSection, setClientSection] = useState('search')
  const [clientAppointments, setClientAppointments] = useState(() => {
    const savedUser = localStorage.getItem('trafex_logged_user')

    if (!savedUser) return []

    try {
      const user = JSON.parse(savedUser)

      if (user?.type !== 'client' || !user?.id) return []

      const savedAppointments = localStorage.getItem(
        `trafex_client_appointments_${user.id}`
      )

      const parsed = savedAppointments
        ? JSON.parse(savedAppointments)
        : []

      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    const refreshDirectory = () => {
      setProfessionalDirectoryVersion((version) => version + 1)
    }

    window.addEventListener('storage', refreshDirectory)
    window.addEventListener('trafex-professional-updated', refreshDirectory)

    return () => {
      window.removeEventListener('storage', refreshDirectory)
      window.removeEventListener(
        'trafex-professional-updated',
        refreshDirectory
      )
    }
  }, [])

  const [professionalData, setProfessionalData] = useState(() => {
    const savedUser = localStorage.getItem('trafex_logged_user')

    if (!savedUser) return null

    try {
      const user = JSON.parse(savedUser)

      if (user.type !== 'professional') return null

      const savedData = localStorage.getItem(
        `trafex_professional_${user.id}`
      )

      if (savedData) {
        const parsedData = JSON.parse(savedData)

        return {
          businessName: parsedData.businessName || user.businessName || '',
          category: parsedData.category || user.category || '',
          description: parsedData.description || '',
          phone: parsedData.phone || '',
          address: parsedData.address || '',
          city: parsedData.city || '',
          instagram: parsedData.instagram || '',
          profileImage:
            parsedData.profileImage || user.profileImage || '',
          publicProfile: parsedData.publicProfile !== false,
          services: Array.isArray(parsedData.services)
            ? parsedData.services
            : [],
          schedule: Array.isArray(parsedData.schedule)
            ? parsedData.schedule
            : weekDays.map((day) => ({
                day,
                enabled: day !== 'Domingo',
                start: '08:00',
                end: '18:00',
              })),
          appointments: Array.isArray(parsedData.appointments)
            ? parsedData.appointments
            : [],
        }
      }

      return {
        businessName: user.businessName || '',
        category: user.category || '',
        description: '',
        phone: '',
        address: '',
        city: '',
        instagram: '',
        profileImage: user.profileImage || '',
        publicProfile: true,
        services: [],
        schedule: weekDays.map((day) => ({
          day,
          enabled: day !== 'Domingo',
          start: '08:00',
          end: '18:00',
        })),
        appointments: [],
      }
    } catch {
      return null
    }
  })

  const filteredCategories = categories.filter((categoryItem) =>
    categoryItem.name.toLowerCase().includes(search.toLowerCase())
  )

  function getProfessionalDirectory() {
    professionalDirectoryVersion
    let users = []

    try {
      users = JSON.parse(
        localStorage.getItem('trafex_users') || '[]'
      )

      if (!Array.isArray(users)) {
        users = []
      }
    } catch {
      users = []
    }

    return users
      .filter((user) => user.type === 'professional')
      .map((user) => {
        let details = {}

        try {
          details = JSON.parse(
            localStorage.getItem(
              `trafex_professional_${user.id}`
            ) || '{}'
          )

          if (!details || typeof details !== 'object') {
            details = {}
          }
        } catch {
          details = {}
        }

        /*
         * O cadastro básico fica em trafex_users e os dados do
         * profissional ficam em trafex_professional_ID.
         *
         * A busca precisa juntar os dois registros antes de decidir
         * se o profissional pode aparecer. Assim, adicionar serviços
         * nunca faz o profissional desaparecer da busca.
         */
        const publicProfile =
          details.publicProfile !== undefined
            ? details.publicProfile !== false
            : user.publicProfile !== false

        return {
          id: user.id,
          name: user.name || '',
          createdAt: user.createdAt || '',
          publicProfile,
          businessName:
            details.businessName ||
            user.businessName ||
            user.name ||
            'Negócio',
          category:
            details.category ||
            user.category ||
            'Serviços',
          description: details.description || '',
          phone: details.phone || '',
          address: details.address || '',
          city: details.city || '',
          instagram: details.instagram || '',
          profileImage:
            details.profileImage ||
            user.profileImage ||
            '',
          services: Array.isArray(details.services)
            ? details.services
            : [],
          schedule: Array.isArray(details.schedule)
            ? details.schedule
            : weekDays.map((day) => ({
                day,
                enabled: day !== 'Domingo',
                start: '08:00',
                end: '18:00',
              })),
          appointments: Array.isArray(details.appointments)
            ? details.appointments
            : [],
        }
      })
      .filter((professional) => professional.publicProfile !== false)
  }

  function getFilteredProfessionals(excludeCurrentUser = false) {
    const term = professionalSearch.trim().toLowerCase()

    return getProfessionalDirectory()
      .filter((professional) =>
        excludeCurrentUser
          ? professional.id !== currentUser?.id
          : true
      )
      .filter((professional) => {
        if (!term) return true

        const serviceText = professional.services
          .map((service) =>
            `${service.name || ''} ${service.description || ''}`
          )
          .join(' ')

        const searchableText = [
          professional.name,
          professional.businessName,
          professional.category,
          professional.description,
          professional.city,
          professional.address,
          serviceText,
        ]
          .join(' ')
          .toLowerCase()

        return searchableText.includes(term)
      })
  }

  function saveProfessionalData(data) {
    setProfessionalData(data)

    if (currentUser?.id) {
      localStorage.setItem(
        `trafex_professional_${currentUser.id}`,
        JSON.stringify(data)
      )

      let users = []

      try {
        users = JSON.parse(
          localStorage.getItem('trafex_users') || '[]'
        )

        if (!Array.isArray(users)) {
          users = []
        }
      } catch {
        users = []
      }

      const updatedUsers = users.map((user) =>
        user.id === currentUser.id
          ? {
              ...user,
              businessName:
                data.businessName ??
                user.businessName ??
                '',
              category:
                data.category ??
                user.category ??
                '',
              profileImage:
                data.profileImage ??
                user.profileImage ??
                '',
              publicProfile:
                data.publicProfile ?? user.publicProfile ?? true,
            }
          : user
      )

      localStorage.setItem(
        'trafex_users',
        JSON.stringify(updatedUsers)
      )

      const updatedCurrentUser = {
        ...currentUser,
        businessName:
          data.businessName ??
          currentUser.businessName ??
          '',
        category:
          data.category ??
          currentUser.category ??
          '',
        profileImage:
          data.profileImage ??
          currentUser.profileImage ??
          '',
        publicProfile:
          data.publicProfile ??
          currentUser.publicProfile ??
          true,
      }

      setCurrentUser(updatedCurrentUser)
      localStorage.setItem(
        'trafex_logged_user',
        JSON.stringify(updatedCurrentUser)
      )

      // Atualiza imediatamente outras áreas/telas do TRAFEX.
      window.dispatchEvent(
        new CustomEvent('trafex-professional-updated')
      )
    }
  }

  function openRegister(type = '') {
    setAccountType(type)
    setMessage('')
    setPassword('')
    setConfirmPassword('')
    setScreen('register')
  }

  function openLogin() {
    setMessage('')
    setPassword('')
    setScreen('login')
  }

  function handleRegister(event) {
    event.preventDefault()
    setMessage('')

    if (!accountType) {
      setMessage('Escolha se você é cliente ou profissional.')
      return
    }

    if (!name || !email || !password) {
      setMessage('Preencha todos os campos obrigatórios.')
      return
    }

    if (password.length < 6) {
      setMessage('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('As senhas não são iguais.')
      return
    }

    if (accountType === 'professional' && !businessName) {
      setMessage('Informe o nome do seu negócio.')
      return
    }

    if (accountType === 'professional' && !category) {
      setMessage('Escolha a categoria do seu negócio.')
      return
    }

    let users = []

    try {
      users = JSON.parse(
        localStorage.getItem('trafex_users') || '[]'
      )

      if (!Array.isArray(users)) {
        users = []
      }
    } catch {
      users = []
    }

    const emailExists = users.some(
      (user) =>
        user.email?.toLowerCase() === email.toLowerCase()
    )

    if (emailExists) {
      setMessage('Este e-mail já está cadastrado.')
      return
    }

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      type: accountType,
      businessName:
        accountType === 'professional'
          ? businessName.trim()
          : '',
      category:
        accountType === 'professional'
          ? category
          : '',
      profileImage: '',
      publicProfile: accountType === 'professional',
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem(
      'trafex_users',
      JSON.stringify([...users, newUser])
    )

    window.dispatchEvent(
      new CustomEvent('trafex-professional-updated')
    )

    const loggedUser = { ...newUser }

    delete loggedUser.password

    localStorage.setItem(
      'trafex_logged_user',
      JSON.stringify(loggedUser)
    )

    setCurrentUser(loggedUser)
    setProfileImage('')

    if (accountType === 'professional') {
      const initialData = {
        businessName: businessName.trim(),
        category,
        description: '',
        phone: '',
        address: '',
        city: '',
        instagram: '',
        profileImage: '',
        publicProfile: true,
        services: [],
        schedule: weekDays.map((day) => ({
          day,
          enabled: day !== 'Domingo',
          start: '08:00',
          end: '18:00',
        })),
        appointments: [],
      }

      setProfessionalData(initialData)

      localStorage.setItem(
        `trafex_professional_${loggedUser.id}`,
        JSON.stringify(initialData)
      )
    } else {
      setProfessionalData(null)
    }

    setProfessionalSection('overview')
    setClientSection('search')
    setSelectedProfessional(null)
    setClientAppointments([])
    resetBookingSelection()
    setScreen('dashboard')
    setMessage('')

    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setBusinessName('')
    setCategory('')
  }

  function handleLogin(event) {
    event.preventDefault()
    setMessage('')

    if (!email || !password) {
      setMessage('Digite seu e-mail e sua senha.')
      return
    }

    let users = []

    try {
      users = JSON.parse(
        localStorage.getItem('trafex_users') || '[]'
      )

      if (!Array.isArray(users)) {
        users = []
      }
    } catch {
      users = []
    }

    const user = users.find(
      (item) =>
        item.email?.toLowerCase() === email.toLowerCase() &&
        item.password === password
    )

    if (!user) {
      setMessage('E-mail ou senha incorretos.')
      return
    }

    const loggedUser = { ...user }

    delete loggedUser.password

    localStorage.setItem(
      'trafex_logged_user',
      JSON.stringify(loggedUser)
    )

    setCurrentUser(loggedUser)
    setProfileImage(loggedUser.profileImage || '')
    setClientSection('search')

    if (loggedUser.type === 'client') {
      try {
        const savedAppointments = JSON.parse(
          localStorage.getItem(
            `trafex_client_appointments_${loggedUser.id}`
          ) || '[]'
        )

        setClientAppointments(
          Array.isArray(savedAppointments) ? savedAppointments : []
        )
      } catch {
        setClientAppointments([])
      }
    } else {
      setClientAppointments([])
    }

    if (loggedUser.type === 'professional') {
      const savedData = localStorage.getItem(
        `trafex_professional_${loggedUser.id}`
      )

      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)

          const normalizedData = {
            businessName:
              parsedData.businessName ||
              loggedUser.businessName ||
              '',
            category:
              parsedData.category ||
              loggedUser.category ||
              '',
            description: parsedData.description || '',
            phone: parsedData.phone || '',
            address: parsedData.address || '',
            city: parsedData.city || '',
            instagram: parsedData.instagram || '',
            profileImage:
              parsedData.profileImage ||
              loggedUser.profileImage ||
              '',
            publicProfile: parsedData.publicProfile !== false,
            services: Array.isArray(parsedData.services)
              ? parsedData.services
              : [],
            schedule: Array.isArray(parsedData.schedule)
              ? parsedData.schedule
              : weekDays.map((day) => ({
                  day,
                  enabled: day !== 'Domingo',
                  start: '08:00',
                  end: '18:00',
                })),
            appointments: Array.isArray(
              parsedData.appointments
            )
              ? parsedData.appointments
              : [],
          }

          setProfessionalData(normalizedData)

          if (
            normalizedData.profileImage &&
            normalizedData.profileImage !== loggedUser.profileImage
          ) {
            const updatedLoggedUser = {
              ...loggedUser,
              profileImage: normalizedData.profileImage,
            }

            setCurrentUser(updatedLoggedUser)
            setProfileImage(normalizedData.profileImage)

            localStorage.setItem(
              'trafex_logged_user',
              JSON.stringify(updatedLoggedUser)
            )

            const updatedUsers = users.map((item) =>
              item.id === loggedUser.id
                ? {
                    ...item,
                    profileImage: normalizedData.profileImage,
                  }
                : item
            )

            localStorage.setItem(
              'trafex_users',
              JSON.stringify(updatedUsers)
            )
          }
        } catch {
          setProfessionalData({
            businessName: loggedUser.businessName || '',
            category: loggedUser.category || '',
            description: '',
            phone: '',
            address: '',
            city: '',
            instagram: '',
            profileImage: loggedUser.profileImage || '',
            services: [],
            schedule: weekDays.map((day) => ({
              day,
              enabled: day !== 'Domingo',
              start: '08:00',
              end: '18:00',
            })),
            appointments: [],
          })
        }
      } else {
        const initialData = {
          businessName: loggedUser.businessName || '',
          category: loggedUser.category || '',
          description: '',
          phone: '',
          address: '',
          city: '',
          instagram: '',
          profileImage: loggedUser.profileImage || '',
          services: [],
          schedule: weekDays.map((day) => ({
            day,
            enabled: day !== 'Domingo',
            start: '08:00',
            end: '18:00',
          })),
          appointments: [],
        }

        setProfessionalData(initialData)

        localStorage.setItem(
          `trafex_professional_${loggedUser.id}`,
          JSON.stringify(initialData)
        )
      }
    } else {
      setProfessionalData(null)
    }

    setProfessionalSection('overview')
    setScreen('dashboard')

    setEmail('')
    setPassword('')
    setMessage('')
  }

  function handleLogout() {
    localStorage.removeItem('trafex_logged_user')

    setCurrentUser(null)
    setProfileImage('')
    setProfessionalData(null)
    setProfessionalSection('overview')
    setClientSection('search')
    setClientAppointments([])
    setSelectedProfessional(null)
    resetBookingSelection()
    setScreen('home')
    setMessage('')
    setEmail('')
    setPassword('')
  }

  function goHome() {
    setScreen('home')
    setMessage('')
  }

  function handleProfileImage(event) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage('Escolha um arquivo de imagem válido.')
      return
    }

    const maxSize = 2 * 1024 * 1024

    if (file.size > maxSize) {
      setMessage(
        'A imagem precisa ter no máximo 2 MB.'
      )
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const image = reader.result

      if (typeof image !== 'string') {
        setMessage('Não foi possível carregar a imagem.')
        return
      }

      setProfileImage(image)
      setMessage('')

      if (!currentUser?.id) return

      const updatedUser = {
        ...currentUser,
        profileImage: image,
      }

      setCurrentUser(updatedUser)

      localStorage.setItem(
        'trafex_logged_user',
        JSON.stringify(updatedUser)
      )

      let users = []

      try {
        users = JSON.parse(
          localStorage.getItem('trafex_users') || '[]'
        )

        if (!Array.isArray(users)) {
          users = []
        }
      } catch {
        users = []
      }

      const updatedUsers = users.map((user) =>
        user.id === currentUser.id
          ? {
              ...user,
              profileImage: image,
            }
          : user
      )

      localStorage.setItem(
        'trafex_users',
        JSON.stringify(updatedUsers)
      )

      if (currentUser.type === 'professional') {
        const updatedProfessionalData = {
          ...(professionalData || {}),
          profileImage: image,
        }

        setProfessionalData(updatedProfessionalData)

        localStorage.setItem(
          `trafex_professional_${currentUser.id}`,
          JSON.stringify(updatedProfessionalData)
        )
      }
    }

    reader.onerror = () => {
      setMessage('Não foi possível carregar a imagem.')
    }

    reader.readAsDataURL(file)

    event.target.value = ''
  }

  function removeProfileImage() {
    if (!currentUser?.id) return

    const updatedUser = {
      ...currentUser,
      profileImage: '',
    }

    setCurrentUser(updatedUser)
    setProfileImage('')

    localStorage.setItem(
      'trafex_logged_user',
      JSON.stringify(updatedUser)
    )

    let users = []

    try {
      users = JSON.parse(
        localStorage.getItem('trafex_users') || '[]'
      )

      if (!Array.isArray(users)) {
        users = []
      }
    } catch {
      users = []
    }

    const updatedUsers = users.map((user) =>
      user.id === currentUser.id
        ? {
            ...user,
            profileImage: '',
          }
        : user
    )

    localStorage.setItem(
      'trafex_users',
      JSON.stringify(updatedUsers)
    )

    if (currentUser.type === 'professional') {
      const updatedProfessionalData = {
        ...(professionalData || {}),
        profileImage: '',
      }

      setProfessionalData(updatedProfessionalData)

      localStorage.setItem(
        `trafex_professional_${currentUser.id}`,
        JSON.stringify(updatedProfessionalData)
      )
    }
  }

  function updateBusinessField(field, value) {
    const updated = {
      ...(professionalData || {}),
      [field]: value,
    }

    saveProfessionalData(updated)
  }

  function addService(event) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)

    const serviceName = form.get('serviceName')?.trim()
    const price = form.get('price')?.trim()
    const duration = form.get('duration')?.trim()
    const description = form.get('serviceDescription')?.trim()

    if (!serviceName || !price || !duration) return

    const newService = {
      id: Date.now(),
      name: serviceName,
      price,
      duration,
      description,
    }

    const updated = {
      ...professionalData,
      services: [
        ...(professionalData?.services || []),
        newService,
      ],
    }

    saveProfessionalData(updated)
    event.currentTarget.reset()
  }

  function removeService(serviceId) {
    const updated = {
      ...professionalData,
      services: (professionalData?.services || []).filter(
        (service) => service.id !== serviceId
      ),
    }

    saveProfessionalData(updated)
  }

  function updateSchedule(dayIndex, field, value) {
    const schedule = [...(professionalData?.schedule || [])]

    schedule[dayIndex] = {
      ...schedule[dayIndex],
      [field]: value,
    }

    saveProfessionalData({
      ...professionalData,
      schedule,
    })
  }

  function createAppointment(event) {
    event.preventDefault()
    setAppointmentMessage('')

    const form = new FormData(event.currentTarget)
    const clientName = form.get('clientName')?.trim()
    const clientPhone = form.get('clientPhone')?.trim()
    const serviceId = form.get('appointmentService')
    const date = form.get('appointmentDate')
    const time = form.get('appointmentTime')

    if (!clientName || !serviceId || !date || !time) {
      setAppointmentMessage(
        'Preencha cliente, serviço, data e horário.'
      )
      return
    }

    const service = (professionalData?.services || []).find(
      (item) => String(item.id) === String(serviceId)
    )

    if (!service) {
      setAppointmentMessage('Selecione um serviço válido.')
      return
    }

    const appointments = professionalData?.appointments || []

    const alreadyBooked = appointments.some(
      (appointment) =>
        appointment.date === date &&
        appointment.time === time &&
        appointment.status !== 'Cancelado'
    )

    if (alreadyBooked) {
      setAppointmentMessage(
        'Esse horário já está ocupado. Escolha outro horário.'
      )
      return
    }

    const newAppointment = {
      id: Date.now(),
      clientName,
      clientPhone,
      serviceId: service.id,
      service: service.name,
      date,
      day: new Date(
        `${date}T12:00:00`
      ).toLocaleDateString('pt-BR'),
      time,
      status: 'Pendente',
      createdAt: new Date().toISOString(),
    }

    saveProfessionalData({
      ...professionalData,
      appointments: [
        ...appointments,
        newAppointment,
      ].sort((a, b) =>
        `${a.date} ${a.time}`.localeCompare(
          `${b.date} ${b.time}`
        )
      ),
    })

    setSelectedAgendaDate(date)
    setAppointmentMessage(
      'Agendamento criado com sucesso.'
    )

    event.currentTarget.reset()
  }

  function updateAppointmentStatus(
    appointmentId,
    status
  ) {
    const appointments = (
      professionalData?.appointments || []
    ).map((appointment) =>
      appointment.id === appointmentId
        ? { ...appointment, status }
        : appointment
    )

    saveProfessionalData({
      ...professionalData,
      appointments,
    })
  }

  function removeAppointment(appointmentId) {
    const appointments = (
      professionalData?.appointments || []
    ).filter(
      (appointment) =>
        appointment.id !== appointmentId
    )

    saveProfessionalData({
      ...professionalData,
      appointments,
    })
  }

  function formatAgendaDate(dateString) {
    if (!dateString) return ''

    return new Date(
      `${dateString}T12:00:00`
    ).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    })
  }

  function renderProfilePhotoEditor() {
    return (
      <section className="professional-form-panel profile-photo-panel">
        <div className="professional-form-heading">
          <div className="professional-form-icon">
            🖼️
          </div>

          <div>
            <h3>Foto do perfil</h3>

            <p>
              Adicione uma imagem para deixar seu perfil mais
              profissional e fácil de reconhecer.
            </p>
          </div>
        </div>

        <div className="profile-photo-editor">
          <div className="profile-photo-preview">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Foto do perfil"
              />
            ) : (
              <span>
                {currentUser?.name
                  ?.charAt(0)
                  .toUpperCase() || 'T'}
              </span>
            )}
          </div>

          <div className="profile-photo-actions">
            <label className="photo-upload-button">
              📷 Escolher imagem

              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImage}
                hidden
              />
            </label>

            {profileImage && (
              <button
                type="button"
                className="secondary-button"
                onClick={removeProfileImage}
              >
                Remover foto
              </button>
            )}

            <small>
              JPG, PNG, WEBP ou outra imagem. Máximo de 2 MB.
            </small>
          </div>
        </div>
      </section>
    )
  }

  function renderAppointmentForm() {
    const services = professionalData?.services || []

    return (
      <section className="professional-form-panel agenda-create-panel">
        <div className="professional-form-heading">
          <div className="professional-form-icon">➕</div>

          <div>
            <h3>Novo agendamento</h3>

            <p>
              Cadastre um atendimento para um cliente diretamente
              pela sua agenda.
            </p>
          </div>
        </div>

        {services.length ? (
          <form
            className="professional-form-grid"
            onSubmit={createAppointment}
          >
            <label>
              Nome do cliente

              <input
                name="clientName"
                placeholder="Ex.: João da Silva"
              />
            </label>

            <label>
              Telefone / WhatsApp

              <input
                name="clientPhone"
                placeholder="(00) 00000-0000"
              />
            </label>

            <label>
              Serviço

              <select
                name="appointmentService"
                defaultValue=""
              >
                <option value="">
                  Selecione um serviço
                </option>

                {services.map((service) => (
                  <option
                    key={service.id}
                    value={service.id}
                  >
                    {service.name} • {service.duration}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Data

              <input
                type="date"
                name="appointmentDate"
                value={selectedAgendaDate}
                onChange={(event) =>
                  setSelectedAgendaDate(
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Horário

              <input
                type="time"
                name="appointmentTime"
                min="00:00"
                max="23:59"
              />
            </label>

            <button
              className="primary-button full-width-button"
              type="submit"
            >
              Criar agendamento
              <span>+</span>
            </button>

            {appointmentMessage && (
              <div
                className={`agenda-message ${
                  appointmentMessage.includes(
                    'sucesso'
                  )
                    ? 'success'
                    : 'error'
                }`}
              >
                {appointmentMessage.includes(
                  'sucesso'
                )
                  ? '✓'
                  : '⚠️'}{' '}
                {appointmentMessage}
              </div>
            )}
          </form>
        ) : (
          <div className="agenda-no-services">
            <span>🛠️</span>

            <div>
              <strong>
                Cadastre um serviço primeiro
              </strong>

              <p>
                Para criar um agendamento, você precisa
                ter pelo menos um serviço cadastrado.
              </p>
            </div>

            <button
              className="secondary-button"
              onClick={() =>
                setProfessionalSection('services')
              }
            >
              Cadastrar serviço
            </button>
          </div>
        )}
      </section>
    )
  }

  function getProfessionalCompletion() {
    if (!professionalData) return 0

    const checks = [
      Boolean(professionalData.businessName),
      Boolean(professionalData.category),
      Boolean(professionalData.description),
      Boolean(professionalData.phone),
      Boolean(professionalData.address),
      professionalData.services?.length > 0,
    ]

    return Math.round(
      (checks.filter(Boolean).length /
        checks.length) *
        100
    )
  }

  function renderProfessionalOverview() {
    const completion = getProfessionalCompletion()

    return (
      <>
        <div className="professional-page-heading">
          <div>
            <span className="section-label">
              VISÃO GERAL
            </span>

            <h2>
              Seu negócio está
              <span> nas suas mãos.</span>
            </h2>

            <p>
              Gerencie seu negócio, seus serviços e sua
              agenda em um único lugar.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              setProfessionalSection('business')
            }
          >
            Editar meu negócio
            <span>→</span>
          </button>
        </div>

        <div className="professional-stat-grid">
          <div className="professional-stat-card">
            <div className="professional-stat-icon purple">
              🛠️
            </div>

            <span>Serviços cadastrados</span>

            <strong>
              {professionalData?.services?.length || 0}
            </strong>

            <small>Serviços oferecidos</small>
          </div>

          <div className="professional-stat-card">
            <div className="professional-stat-icon blue">
              📅
            </div>

            <span>Agendamentos</span>

            <strong>
              {professionalData?.appointments?.length || 0}
            </strong>

            <small>Agendamentos recebidos</small>
          </div>

          <div className="professional-stat-card">
            <div className="professional-stat-icon green">
              ✓
            </div>

            <span>Perfil completo</span>

            <strong>{completion}%</strong>

            <small>Preenchimento do perfil</small>
          </div>

          <div className="professional-stat-card">
            <div className="professional-stat-icon orange">
              👁️
            </div>

            <span>Perfil público</span>

            <strong>Ativo</strong>

            <small>Disponível para clientes</small>
          </div>
        </div>

        <div className="professional-overview-grid">
          <section className="professional-panel">
            <div className="professional-panel-heading">
              <div>
                <span className="section-label">
                  CONFIGURAÇÃO
                </span>

                <h3>Configure seu negócio</h3>
              </div>
            </div>

            <div className="setup-progress">
              <div className="setup-progress-top">
                <span>Perfil do negócio</span>

                <strong>{completion}%</strong>
              </div>

              <div className="progress-bar">
                <div
                  style={{
                    width: `${completion}%`,
                  }}
                ></div>
              </div>

              <p>
                Complete seu perfil para deixar seu
                negócio pronto para receber clientes.
              </p>
            </div>

            <div className="quick-action-grid">
              <button
                onClick={() =>
                  setProfessionalSection('business')
                }
              >
                <span>🏢</span>

                <div>
                  <strong>Meu negócio</strong>
                  <small>
                    Informações do negócio
                  </small>
                </div>

                <b>→</b>
              </button>

              <button
                onClick={() =>
                  setProfessionalSection('services')
                }
              >
                <span>🛠️</span>

                <div>
                  <strong>Serviços</strong>
                  <small>
                    Cadastre seus serviços
                  </small>
                </div>

                <b>→</b>
              </button>

              <button
                onClick={() =>
                  setProfessionalSection('schedule')
                }
              >
                <span>🕐</span>

                <div>
                  <strong>Horários</strong>
                  <small>
                    Defina seu atendimento
                  </small>
                </div>

                <b>→</b>
              </button>

              <button
                onClick={() =>
                  setProfessionalSection(
                    'public-profile'
                  )
                }
              >
                <span>🌐</span>

                <div>
                  <strong>Perfil público</strong>
                  <small>
                    Veja como clientes verão você
                  </small>
                </div>

                <b>→</b>
              </button>
            </div>
          </section>

          <section className="professional-panel public-mini-panel">
            <div className="professional-panel-heading">
              <div>
                <span className="section-label">
                  SEU NEGÓCIO
                </span>

                <h3>Prévia pública</h3>
              </div>

              <span className="online-badge">
                ● Ativo
              </span>
            </div>

            <div className="public-business-card">
              <div className="public-business-cover">
                <div className="public-business-avatar">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Foto do negócio"
                    />
                  ) : (
                    (
                      professionalData?.businessName ||
                      'T'
                    )
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>
              </div>

              <div className="public-business-content">
                <span className="public-category">
                  {professionalData?.category ||
                    'Categoria'}
                </span>

                <h3>
                  {professionalData?.businessName ||
                    'Seu negócio'}
                </h3>

                <p>
                  {professionalData?.description ||
                    'Adicione uma descrição para apresentar seu negócio aos clientes.'}
                </p>

                <button
                  onClick={() =>
                    setProfessionalSection(
                      'public-profile'
                    )
                  }
                >
                  Ver perfil público →
                </button>
              </div>
            </div>
          </section>
        </div>
      </>
    )
  }

  function renderBusinessSection() {
    return (
      <>
        <div className="professional-page-heading">
          <div>
            <span className="section-label">
              MEU NEGÓCIO
            </span>

            <h2>
              Configure seu <span>negócio.</span>
            </h2>

            <p>
              Essas informações serão utilizadas no seu
              perfil público.
            </p>
          </div>
        </div>

        {renderProfilePhotoEditor()}

        <section className="professional-form-panel">
          <div className="professional-form-heading">
            <div className="professional-form-icon">
              🏢
            </div>

            <div>
              <h3>Informações principais</h3>

              <p>
                Apresente seu negócio para quem estiver
                procurando por seus serviços.
              </p>
            </div>
          </div>

          <div className="professional-form-grid">
            <label>
              Nome do negócio

              <input
                value={
                  professionalData?.businessName || ''
                }
                onChange={(event) =>
                  updateBusinessField(
                    'businessName',
                    event.target.value
                  )
                }
                placeholder="Ex.: DragonForce Tech"
              />
            </label>

            <label>
              Categoria

              <select
                value={
                  professionalData?.category || ''
                }
                onChange={(event) =>
                  updateBusinessField(
                    'category',
                    event.target.value
                  )
                }
              >
                <option value="">
                  Selecione uma categoria
                </option>

                {categories.map((item) => (
                  <option
                    key={item.name}
                    value={item.name}
                  >
                    {item.icon} {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="full-width">
              Descrição

              <textarea
                value={
                  professionalData?.description || ''
                }
                onChange={(event) =>
                  updateBusinessField(
                    'description',
                    event.target.value
                  )
                }
                placeholder="Conte um pouco sobre seu negócio, seus serviços e seu atendimento..."
                rows="5"
              />
            </label>
          </div>
        </section>

        <section className="professional-form-panel">
          <div className="professional-form-heading">
            <div className="professional-form-icon blue">
              📍
            </div>

            <div>
              <h3>Contato e localização</h3>

              <p>
                Ajude seus clientes a encontrarem e
                entrarem em contato com você.
              </p>
            </div>
          </div>

          <div className="professional-form-grid">
            <label>
              Telefone / WhatsApp

              <input
                value={professionalData?.phone || ''}
                onChange={(event) =>
                  updateBusinessField(
                    'phone',
                    event.target.value
                  )
                }
                placeholder="(00) 00000-0000"
              />
            </label>

            <label>
              Cidade

              <input
                value={professionalData?.city || ''}
                onChange={(event) =>
                  updateBusinessField(
                    'city',
                    event.target.value
                  )
                }
                placeholder="Sua cidade"
              />
            </label>

            <label className="full-width">
              Endereço

              <input
                value={
                  professionalData?.address || ''
                }
                onChange={(event) =>
                  updateBusinessField(
                    'address',
                    event.target.value
                  )
                }
                placeholder="Rua, número, bairro..."
              />
            </label>

            <label className="full-width">
              Instagram

              <input
                value={
                  professionalData?.instagram || ''
                }
                onChange={(event) =>
                  updateBusinessField(
                    'instagram',
                    event.target.value
                  )
                }
                placeholder="@seunegocio"
              />
            </label>
          </div>

          <div className="saved-message">
            ✓ Alterações salvas automaticamente
          </div>
        </section>
      </>
    )
  }

  function renderServicesSection() {
    return (
      <>
        <div className="professional-page-heading">
          <div>
            <span className="section-label">
              SERVIÇOS
            </span>

            <h2>
              O que você <span>oferece?</span>
            </h2>

            <p>
              Cadastre os serviços que seus clientes
              poderão escolher ao fazer um agendamento.
            </p>
          </div>
        </div>

        <div className="services-layout">
          <section className="professional-form-panel">
            <div className="professional-form-heading">
              <div className="professional-form-icon">
                ➕
              </div>

              <div>
                <h3>Novo serviço</h3>

                <p>
                  Adicione um serviço ao seu catálogo.
                </p>
              </div>
            </div>

            <form
              className="professional-form-grid"
              onSubmit={addService}
            >
              <label className="full-width">
                Nome do serviço

                <input
                  name="serviceName"
                  placeholder="Ex.: Manutenção de computador"
                />
              </label>

              <label>
                Preço

                <input
                  name="price"
                  placeholder="Ex.: R$ 80,00"
                />
              </label>

              <label>
                Duração

                <select
                  name="duration"
                  defaultValue=""
                >
                  <option value="">
                    Selecione
                  </option>

                  <option value="30 minutos">
                    30 minutos
                  </option>

                  <option value="45 minutos">
                    45 minutos
                  </option>

                  <option value="1 hora">
                    1 hora
                  </option>

                  <option value="1h30">
                    1h30
                  </option>

                  <option value="2 horas">
                    2 horas
                  </option>

                  <option value="3 horas">
                    3 horas
                  </option>
                </select>
              </label>

              <label className="full-width">
                Descrição

                <textarea
                  name="serviceDescription"
                  rows="4"
                  placeholder="Descreva o que está incluído nesse serviço..."
                />
              </label>

              <button
                className="primary-button full-width-button"
                type="submit"
              >
                Adicionar serviço
                <span>+</span>
              </button>
            </form>
          </section>

          <section className="professional-panel">
            <div className="professional-panel-heading">
              <div>
                <span className="section-label">
                  CATÁLOGO
                </span>

                <h3>Seus serviços</h3>
              </div>

              <span className="service-count">
                {professionalData?.services?.length ||
                  0}
              </span>
            </div>

            {professionalData?.services?.length ? (
              <div className="service-list">
                {professionalData.services.map(
                  (service) => (
                    <div
                      className="service-item"
                      key={service.id}
                    >
                      <div className="service-item-icon">
                        🛠️
                      </div>

                      <div className="service-item-info">
                        <strong>
                          {service.name}
                        </strong>

                        <span>
                          {service.duration} •{' '}
                          {service.price}
                        </span>

                        {service.description && (
                          <small>
                            {service.description}
                          </small>
                        )}
                      </div>

                      <button
                        className="delete-service"
                        onClick={() =>
                          removeService(service.id)
                        }
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="professional-empty">
                <div>🛠️</div>

                <h3>
                  Nenhum serviço cadastrado
                </h3>

                <p>
                  Adicione seus primeiros serviços
                  para começar a montar seu catálogo.
                </p>
              </div>
            )}
          </section>
        </div>
      </>
    )
  }

  function renderScheduleSection() {
    return (
      <>
        <div className="professional-page-heading">
          <div>
            <span className="section-label">
              HORÁRIOS DE ATENDIMENTO
            </span>

            <h2>
              Defina seus <span>horários.</span>
            </h2>

            <p>
              Informe quando seus clientes poderão
              solicitar agendamentos.
            </p>
          </div>
        </div>

        <section className="professional-form-panel">
          <div className="professional-form-heading">
            <div className="professional-form-icon">
              🕐
            </div>

            <div>
              <h3>Horário de funcionamento</h3>

              <p>
                Configure os dias e horários em que seu
                negócio estará disponível.
              </p>
            </div>
          </div>

          <div className="schedule-settings">
            {(professionalData?.schedule || []).map(
              (item, index) => (
                <div
                  className="schedule-row"
                  key={item.day}
                >
                  <div className="schedule-day">
                    <button
                      type="button"
                      className={`schedule-toggle ${
                        item.enabled ? 'active' : ''
                      }`}
                      onClick={() =>
                        updateSchedule(
                          index,
                          'enabled',
                          !item.enabled
                        )
                      }
                    >
                      <span></span>
                    </button>

                    <strong>{item.day}</strong>
                  </div>

                  {item.enabled ? (
                    <div className="schedule-times">
                      <input
                        type="time"
                        value={item.start}
                        onChange={(event) =>
                          updateSchedule(
                            index,
                            'start',
                            event.target.value
                          )
                        }
                      />

                      <span>até</span>

                      <input
                        type="time"
                        value={item.end}
                        onChange={(event) =>
                          updateSchedule(
                            index,
                            'end',
                            event.target.value
                          )
                        }
                      />
                    </div>
                  ) : (
                    <span className="closed-label">
                      Fechado
                    </span>
                  )}
                </div>
              )
            )}
          </div>

          <div className="saved-message">
            ✓ Horários salvos automaticamente
          </div>
        </section>
      </>
    )
  }

  function renderPublicProfile() {
    const completion = getProfessionalCompletion()

    return (
      <>
        <div className="professional-page-heading">
          <div>
            <span className="section-label">
              PERFIL PÚBLICO
            </span>

            <h2>
              É assim que os{' '}
              <span>clientes verão você.</span>
            </h2>

            <p>
              Essa é uma prévia do seu perfil dentro do
              TRAFEX AGENDS.
            </p>
          </div>
        </div>

        <div className="public-profile-layout">
          <section className="public-profile-card">
            <div className="public-profile-cover">
              <div className="public-profile-avatar">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Foto do perfil"
                  />
                ) : (
                  (
                    professionalData?.businessName ||
                    'T'
                  )
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              <span className="public-status">
                ● Disponível
              </span>
            </div>

            <div className="public-profile-body">
              <span className="public-category">
                {professionalData?.category ||
                  'Categoria'}
              </span>

              <h1>
                {professionalData?.businessName ||
                  'Nome do seu negócio'}
              </h1>

              <p className="public-description">
                {professionalData?.description ||
                  'A descrição do seu negócio aparecerá aqui. Volte em "Meu negócio" para adicionar uma apresentação.'}
              </p>

              <div className="public-contact-grid">
                {professionalData?.city && (
                  <div>
                    <span>📍</span>
                    <strong>
                      {professionalData.city}
                    </strong>
                  </div>
                )}

                {professionalData?.phone && (
                  <div>
                    <span>📱</span>
                    <strong>
                      {professionalData.phone}
                    </strong>
                  </div>
                )}

                {professionalData?.instagram && (
                  <div>
                    <span>📸</span>
                    <strong>
                      {professionalData.instagram}
                    </strong>
                  </div>
                )}
              </div>

              <div className="public-services-heading">
                <div>
                  <span className="section-label">
                    SERVIÇOS
                  </span>

                  <h2>O que oferecemos</h2>
                </div>
              </div>

              {professionalData?.services?.length ? (
                <div className="public-services-list">
                  {professionalData.services.map(
                    (service) => (
                      <div
                        className="public-service-card"
                        key={service.id}
                      >
                        <div>
                          <strong>
                            {service.name}
                          </strong>

                          <span>
                            {service.duration}
                          </span>
                        </div>

                        <strong>
                          {service.price}
                        </strong>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="public-no-services">
                  Nenhum serviço cadastrado ainda.
                </div>
              )}

              <button
                className="primary-button public-book-button"
                onClick={() =>
                  setProfessionalSection(
                    'services'
                  )
                }
              >
                Gerenciar meus serviços
                <span>→</span>
              </button>
            </div>
          </section>

          <aside className="public-profile-sidebar">
            <section className="professional-panel">
              <div className="professional-panel-heading">
                <div>
                  <span className="section-label">
                    PERFIL
                  </span>

                  <h3>Completude</h3>
                </div>

                <strong className="completion-number">
                  {completion}%
                </strong>
              </div>

              <div className="progress-bar">
                <div
                  style={{
                    width: `${completion}%`,
                  }}
                ></div>
              </div>

              <p className="sidebar-help">
                Quanto mais informações você adicionar,
                mais completo ficará seu perfil para os
                clientes.
              </p>

              <button
                className="secondary-button profile-edit-button"
                onClick={() =>
                  setProfessionalSection('business')
                }
              >
                Editar informações
              </button>
            </section>

            <section className="professional-panel">
              <span className="section-label">
                VISIBILIDADE
              </span>

              <h3 className="visibility-title">
                Seu perfil está ativo
              </h3>

              <div className="visibility-status">
                <span>●</span>

                <div>
                  <strong>
                    Visível para clientes
                  </strong>

                  <small>
                    Seu negócio poderá aparecer nas
                    buscas.
                  </small>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </>
    )
  }

  function renderAppointments() {
    const appointments =
      professionalData?.appointments || []

    return (
      <>
        <div className="professional-page-heading">
          <div>
            <span className="section-label">
              AGENDAMENTOS RECEBIDOS
            </span>

            <h2>
              Seus <span>agendamentos.</span>
            </h2>

            <p>
              Acompanhe os horários solicitados pelos
              seus clientes.
            </p>
          </div>
        </div>

        <section className="professional-panel appointments-panel">
          {appointments.length ? (
            <div className="appointments-list">
              {appointments.map((appointment) => (
                <div
                  className="professional-appointment"
                  key={appointment.id}
                >
                  <div className="appointment-date">
                    <strong>
                      {appointment.day}
                    </strong>

                    <span>
                      {appointment.time}
                    </span>
                  </div>

                  <div className="professional-appointment-info">
                    <strong>
                      {appointment.clientName}
                    </strong>

                    <span>
                      {appointment.service}
                    </span>
                  </div>

                  <span className="appointment-status">
                    {appointment.status ||
                      'Pendente'}
                  </span>

                  <div className="professional-appointment-actions">
                    {appointment.status ===
                      'Pendente' && (
                      <button
                        className="agenda-action-confirm"
                        onClick={() =>
                          updateAppointmentStatus(
                            appointment.id,
                            'Concluído'
                          )
                        }
                      >
                        Concluir
                      </button>
                    )}

                    {appointment.status !==
                      'Cancelado' && (
                      <button
                        className="agenda-action-cancel"
                        onClick={() =>
                          updateAppointmentStatus(
                            appointment.id,
                            'Cancelado'
                          )
                        }
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="professional-empty appointments-empty">
              <div>📅</div>

              <h3>
                Nenhum agendamento recebido
              </h3>

              <p>
                Quando seus clientes começarem a fazer
                agendamentos, eles aparecerão aqui.
              </p>

              <button
                className="secondary-button"
                onClick={() =>
                  setProfessionalSection(
                    'public-profile'
                  )
                }
              >
                Ver meu perfil público
              </button>
            </div>
          )}
        </section>
      </>
    )
  }

  function renderAgenda() {
    const appointments =
      professionalData?.appointments || []

    const dayAppointments = appointments
      .filter(
        (appointment) =>
          appointment.date ===
          selectedAgendaDate
      )
      .sort((a, b) =>
        a.time.localeCompare(b.time)
      )

    const today = new Date()
      .toISOString()
      .slice(0, 10)

    return (
      <>
        <div className="professional-page-heading">
          <div>
            <span className="section-label">
              AGENDA
            </span>

            <h2>
              Organize seus{' '}
              <span>atendimentos.</span>
            </h2>

            <p>
              Crie e acompanhe os agendamentos dos seus
              clientes em um único lugar.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() => {
              document
                .querySelector(
                  '.agenda-create-panel'
                )
                ?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                })
            }}
          >
            Novo agendamento
            <span>+</span>
          </button>
        </div>

        {renderAppointmentForm()}

        <section className="professional-panel agenda-panel">
          <div className="agenda-preview-heading">
            <div>
              <span className="section-label">
                AGENDA DO DIA
              </span>

              <h3>
                {formatAgendaDate(
                  selectedAgendaDate
                )}
              </h3>
            </div>

            <div className="agenda-date-actions">
              <button
                className="agenda-today-button"
                onClick={() =>
                  setSelectedAgendaDate(today)
                }
              >
                Hoje
              </button>

              <input
                type="date"
                value={selectedAgendaDate}
                onChange={(event) =>
                  setSelectedAgendaDate(
                    event.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="agenda-summary">
            <div>
              <span>Atendimentos</span>
              <strong>
                {dayAppointments.length}
              </strong>
            </div>

            <div>
              <span>Pendentes</span>

              <strong>
                {
                  dayAppointments.filter(
                    (item) =>
                      item.status ===
                      'Pendente'
                  ).length
                }
              </strong>
            </div>

            <div>
              <span>Concluídos</span>

              <strong>
                {
                  dayAppointments.filter(
                    (item) =>
                      item.status ===
                      'Concluído'
                  ).length
                }
              </strong>
            </div>
          </div>

          {dayAppointments.length ? (
            <div className="agenda-appointments-list">
              {dayAppointments.map(
                (appointment) => (
                  <div
                    className="agenda-appointment-card"
                    key={appointment.id}
                  >
                    <div className="agenda-appointment-time">
                      <strong>
                        {appointment.time}
                      </strong>

                      <span>
                        {appointment.service}
                      </span>
                    </div>

                    <div className="agenda-appointment-client">
                      <div className="agenda-client-avatar">
                        {appointment.clientName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {appointment.clientName}
                        </strong>

                        {appointment.clientPhone && (
                          <span>
                            📱{' '}
                            {
                              appointment.clientPhone
                            }
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`agenda-status ${appointment.status
                        .toLowerCase()
                        .replace('í', 'i')}`}
                    >
                      {appointment.status}
                    </span>

                    <div className="agenda-appointment-actions">
                      {appointment.status ===
                        'Pendente' && (
                        <button
                          className="agenda-action-confirm"
                          onClick={() =>
                            updateAppointmentStatus(
                              appointment.id,
                              'Concluído'
                            )
                          }
                        >
                          Concluir
                        </button>
                      )}

                      {appointment.status !==
                        'Cancelado' && (
                        <button
                          className="agenda-action-cancel"
                          onClick={() =>
                            updateAppointmentStatus(
                              appointment.id,
                              'Cancelado'
                            )
                          }
                        >
                          Cancelar
                        </button>
                      )}

                      <button
                        className="agenda-action-delete"
                        onClick={() =>
                          removeAppointment(
                            appointment.id
                          )
                        }
                        title="Excluir agendamento"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="professional-empty appointments-empty">
              <div>📅</div>

              <h3>
                Agenda livre neste dia
              </h3>

              <p>
                Nenhum cliente está agendado para{' '}
                {formatAgendaDate(
                  selectedAgendaDate
                )}
                .
              </p>

              <button
                className="secondary-button"
                onClick={() =>
                  document
                    .querySelector(
                      '.agenda-create-panel'
                    )
                    ?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    })
                }
              >
                Adicionar cliente
              </button>
            </div>
          )}

          <div className="agenda-info">
            <span>💡</span>

            <p>
              Os agendamentos ficam salvos no seu
              navegador nesta versão. Mais à frente,
              vamos conectar essa agenda ao sistema de
              clientes para que os pedidos feitos pelos
              clientes apareçam automaticamente aqui.
            </p>
          </div>
        </section>
      </>
    )
  }

  function getBookingDayName(dateString) {
    if (!dateString) return ''

    const date = new Date(`${dateString}T12:00:00`)
    const dayIndex = date.getDay()

    return [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ][dayIndex]
  }

  function getAvailableBookingTimes(professional) {
    if (!professional || !bookingDate) return []

    const dayName = getBookingDayName(bookingDate)
    const daySchedule = (professional.schedule || []).find(
      (item) => item.day === dayName
    )

    if (!daySchedule?.enabled) return []

    const start = daySchedule.start || '08:00'
    const end = daySchedule.end || '18:00'
    const step = 30
    const times = []

    const toMinutes = (value) => {
      const [hours, minutes] = value.split(':').map(Number)
      return hours * 60 + minutes
    }

    const formatTime = (minutes) => {
      const hours = String(Math.floor(minutes / 60)).padStart(2, '0')
      const mins = String(minutes % 60).padStart(2, '0')
      return `${hours}:${mins}`
    }

    const startMinutes = toMinutes(start)
    const endMinutes = toMinutes(end)
    const appointments = Array.isArray(professional.appointments)
      ? professional.appointments
      : []

    for (let minutes = startMinutes; minutes < endMinutes; minutes += step) {
      const time = formatTime(minutes)
      const occupied = appointments.some(
        (appointment) =>
          appointment.date === bookingDate &&
          appointment.time === time &&
          appointment.status !== 'Cancelado'
      )

      if (!occupied) times.push(time)
    }

    return times
  }

  function resetBookingSelection() {
    setBookingService('')
    setBookingTime('')
    setBookingDate(new Date().toISOString().slice(0, 10))
    setBookingStep(1)
    setAppointmentMessage('')
  }

  function saveClientAppointments(appointments) {
    if (!currentUser?.id || currentUser.type !== 'client') return

    const sortedAppointments = [...appointments].sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
    )

    setClientAppointments(sortedAppointments)
    localStorage.setItem(
      `trafex_client_appointments_${currentUser.id}`,
      JSON.stringify(sortedAppointments)
    )
  }

  function saveProfessionalAppointments(professionalId, appointments) {
    const key = `trafex_professional_${professionalId}`

    let data = {}

    try {
      data = JSON.parse(localStorage.getItem(key) || '{}')
    } catch {
      data = {}
    }

    const normalized = {
      ...data,
      appointments: Array.isArray(appointments) ? appointments : [],
    }

    localStorage.setItem(key, JSON.stringify(normalized))
  }

  function confirmBooking() {
    if (
      !currentUser?.id ||
      currentUser.type !== 'client' ||
      !selectedProfessional ||
      !bookingService ||
      !bookingDate ||
      !bookingTime
    ) {
      setAppointmentMessage('Faça login como cliente para confirmar o agendamento.')
      return
    }

    const freshProfessional =
      getProfessionalDirectory().find(
        (item) => item.id === selectedProfessional.id
      ) || selectedProfessional

    const service = (freshProfessional.services || []).find(
      (item) => String(item.id || item.name) === String(bookingService)
    )

    if (!service) {
      setAppointmentMessage('O serviço selecionado não está mais disponível.')
      return
    }

    const professionalAppointments = Array.isArray(
      freshProfessional.appointments
    )
      ? freshProfessional.appointments
      : []

    const alreadyBooked = professionalAppointments.some(
      (appointment) =>
        appointment.date === bookingDate &&
        appointment.time === bookingTime &&
        appointment.status !== 'Cancelado'
    )

    if (alreadyBooked) {
      setAppointmentMessage(
        'Esse horário acabou de ser ocupado. Escolha outro horário.'
      )
      setSelectedProfessional(freshProfessional)
      setBookingTime('')
      setBookingStep(1)
      return
    }

    const newAppointment = {
      id: Date.now(),
      clientId: currentUser.id,
      clientName: currentUser.name,
      clientEmail: currentUser.email,
      professionalId: freshProfessional.id,
      professionalName: freshProfessional.name,
      businessName: freshProfessional.businessName,
      serviceId: service.id || service.name,
      service: service.name,
      price: service.price || '',
      duration: service.duration || '',
      date: bookingDate,
      day: new Date(`${bookingDate}T12:00:00`).toLocaleDateString('pt-BR'),
      time: bookingTime,
      status: 'Pendente',
      createdAt: new Date().toISOString(),
    }

    saveProfessionalAppointments(freshProfessional.id, [
      ...professionalAppointments,
      newAppointment,
    ].sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
    ))

    saveClientAppointments([
      ...clientAppointments,
      newAppointment,
    ])

    setSelectedProfessional({
      ...freshProfessional,
      appointments: [...professionalAppointments, newAppointment],
    })
    setBookingStep(3)
    setAppointmentMessage('Agendamento confirmado com sucesso!')
  }

  function cancelClientAppointment(appointmentId) {
    const appointment = clientAppointments.find(
      (item) => item.id === appointmentId
    )

    if (!appointment || appointment.status === 'Cancelado') return

    const updatedClientAppointments = clientAppointments.map((item) =>
      item.id === appointmentId
        ? { ...item, status: 'Cancelado' }
        : item
    )

    saveClientAppointments(updatedClientAppointments)

    const freshProfessional = getProfessionalDirectory().find(
      (item) => item.id === appointment.professionalId
    )

    if (freshProfessional) {
      const updatedProfessionalAppointments = (
        freshProfessional.appointments || []
      ).map((item) =>
        item.id === appointmentId
          ? { ...item, status: 'Cancelado' }
          : item
      )

      saveProfessionalAppointments(
        freshProfessional.id,
        updatedProfessionalAppointments
      )
    }
  }

  function renderClientAppointments() {
    const activeAppointments = clientAppointments.filter(
      (appointment) => appointment.status !== 'Cancelado'
    )

    const sortedAppointments = [...clientAppointments].sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
    )

    return (
      <section className="client-appointments-section">
        <div className="professional-page-heading">
          <div>
            <span className="section-label">MEUS AGENDAMENTOS</span>
            <h2>
              Seus horários <span>em um só lugar.</span>
            </h2>
            <p>
              Acompanhe seus agendamentos e o status de cada atendimento.
            </p>
          </div>
        </div>

        {sortedAppointments.length > 0 ? (
          <div className="client-appointments-list">
            {sortedAppointments.map((appointment) => (
              <article
                className={`client-appointment-card ${
                  appointment.status === 'Cancelado' ? 'cancelled' : ''
                }`}
                key={appointment.id}
              >
                <div className="client-appointment-date">
                  <span>📅</span>
                  <strong>{appointment.date}</strong>
                  <b>{appointment.time}</b>
                </div>

                <div className="client-appointment-info">
                  <span className="section-label">
                    {appointment.status || 'Pendente'}
                  </span>
                  <h3>{appointment.businessName}</h3>
                  <p>
                    {appointment.service} • {appointment.duration || 'Horário agendado'}
                  </p>
                  <small>
                    Profissional: {appointment.professionalName}
                  </small>
                </div>

                <div className="client-appointment-actions">
                  <span
                    className={`client-appointment-status ${
                      appointment.status === 'Cancelado'
                        ? 'cancelled'
                        : appointment.status === 'Concluído'
                          ? 'completed'
                          : ''
                    }`}
                  >
                    {appointment.status || 'Pendente'}
                  </span>

                  {appointment.status !== 'Cancelado' && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        cancelClientAppointment(appointment.id)
                      }
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state client-appointments-empty">
            <div className="empty-state-icon">📅</div>
            <h3>Nenhum agendamento ainda</h3>
            <p>
              Escolha um profissional, selecione um serviço e reserve seu
              primeiro horário.
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={() => setClientSection('search')}
            >
              Buscar profissionais
              <span>→</span>
            </button>
          </div>
        )}

        {activeAppointments.length > 0 && (
          <div className="client-appointments-note">
            ✓ Seus agendamentos ficam sincronizados com a agenda do profissional
            nesta versão.
          </div>
        )}
      </section>
    )
  }

  function openProfessionalProfile(professional) {
    if (!professional?.id) return

    const freshProfessional =
      getProfessionalDirectory().find(
        (item) => item.id === professional.id
      ) || professional

    setSelectedProfessional(freshProfessional)
    resetBookingSelection()
  }

  function closeProfessionalProfile() {
    setSelectedProfessional(null)
    resetBookingSelection()
  }

  function renderSelectedProfessionalProfile() {
    const professional = selectedProfessional

    if (!professional) return null

    const services = Array.isArray(professional.services)
      ? professional.services
      : []

    return (
      <section className="public-professional-view">
        <div className="public-professional-topbar">
          <button
            type="button"
            className="secondary-button public-professional-back"
            onClick={closeProfessionalProfile}
          >
            ← Voltar para a busca
          </button>

          <span className="public-professional-live">
            ● Perfil público
          </span>
        </div>

        <div className="public-professional-layout">
          <section className="public-professional-main-card">
            <div className="public-professional-cover">
              <div className="public-professional-avatar">
                {professional.profileImage ? (
                  <img
                    src={professional.profileImage}
                    alt={`Foto de ${professional.businessName}`}
                  />
                ) : (
                  professional.businessName
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>
            </div>

            <div className="public-professional-body">
              <span className="public-professional-category">
                {professional.category || 'Serviços'}
              </span>

              <h1>{professional.businessName}</h1>

              <p className="public-professional-owner">
                Profissional: {professional.name}
              </p>

              <p className="public-professional-description">
                {professional.description ||
                  'Este profissional ainda não adicionou uma descrição ao perfil.'}
              </p>

              <div className="public-professional-info-grid">
                {professional.city && (
                  <div className="public-professional-info-item">
                    <span>📍</span>
                    <div>
                      <small>Localização</small>
                      <strong>{professional.city}</strong>
                    </div>
                  </div>
                )}

                {professional.address && (
                  <div className="public-professional-info-item">
                    <span>🏠</span>
                    <div>
                      <small>Endereço</small>
                      <strong>{professional.address}</strong>
                    </div>
                  </div>
                )}

                {professional.phone && (
                  <div className="public-professional-info-item">
                    <span>📱</span>
                    <div>
                      <small>Contato</small>
                      <strong>{professional.phone}</strong>
                    </div>
                  </div>
                )}

                {professional.instagram && (
                  <div className="public-professional-info-item">
                    <span>📸</span>
                    <div>
                      <small>Instagram</small>
                      <strong>{professional.instagram}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="public-professional-section-heading">
                <span className="section-label">SERVIÇOS</span>
                <h2>O que este profissional oferece</h2>
                <p>
                  Confira os serviços cadastrados neste perfil.
                </p>
              </div>

              {services.length > 0 ? (
                <div className="public-professional-services">
                  {services.map((service) => (
                    <article
                      className="public-professional-service"
                      key={service.id || service.name}
                    >
                      <div>
                        <span className="public-service-icon">🛠️</span>
                        <div>
                          <h3>{service.name}</h3>
                          {service.description && (
                            <p>{service.description}</p>
                          )}
                          <span className="public-service-duration">
                            ⏱️ {service.duration}
                          </span>
                        </div>
                      </div>

                      <strong>{service.price}</strong>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="public-professional-empty">
                  <span>🛠️</span>
                  <div>
                    <strong>Nenhum serviço cadastrado ainda</strong>
                    <p>
                      Este profissional ainda está preparando o catálogo de serviços.
                    </p>
                  </div>
                </div>
              )}

              <div className="public-professional-booking">
                <div className="public-booking-heading">
                  <div>
                    <span className="section-label">AGENDAR</span>
                    <h2>
                      {bookingStep === 1
                        ? 'Escolha o serviço e o horário.'
                        : bookingStep === 2
                          ? 'Confira os detalhes do agendamento.'
                          : 'Agendamento realizado!'}
                    </h2>
                    <p>
                      {bookingStep === 1
                        ? 'Veja somente os horários de atendimento que estão livres.'
                        : bookingStep === 2
                          ? 'Confirme as informações antes de reservar seu horário.'
                          : 'Seu horário foi enviado para a agenda do profissional.'}
                    </p>
                  </div>
                  <span className="public-booking-step">
                    {bookingStep} de 3
                  </span>
                </div>

                {services.length > 0 ? (
                  <>
                    {bookingStep === 1 && (
                      <>
                        <label className="public-booking-field">
                          Serviço
                          <select
                            value={bookingService}
                            onChange={(event) => {
                              setBookingService(event.target.value)
                              setBookingTime('')
                              setAppointmentMessage('')
                            }}
                          >
                            <option value="">Selecione um serviço</option>
                            {services.map((service) => (
                              <option
                                key={service.id || service.name}
                                value={String(service.id || service.name)}
                              >
                                {service.name} • {service.duration} • {service.price}
                              </option>
                            ))}
                          </select>
                        </label>

                        <div className="public-booking-date-row">
                          <label className="public-booking-field">
                            Data
                            <input
                              type="date"
                              min={new Date().toISOString().slice(0, 10)}
                              value={bookingDate}
                              onChange={(event) => {
                                setBookingDate(event.target.value)
                                setBookingTime('')
                                setAppointmentMessage('')
                              }}
                            />
                          </label>

                          <div className="public-booking-field">
                            Horários disponíveis
                            <div className="public-booking-times">
                              {!bookingService ? (
                                <span className="public-booking-hint">
                                  Escolha um serviço primeiro.
                                </span>
                              ) : getAvailableBookingTimes(professional).length > 0 ? (
                                getAvailableBookingTimes(professional).map((time) => (
                                  <button
                                    key={time}
                                    type="button"
                                    className={`public-booking-time ${
                                      bookingTime === time ? 'selected' : ''
                                    }`}
                                    onClick={() => {
                                      setBookingTime(time)
                                      setAppointmentMessage('')
                                    }}
                                  >
                                    {time}
                                  </button>
                                ))
                              ) : (
                                <span className="public-booking-hint">
                                  Nenhum horário livre neste dia.
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="public-booking-footer">
                          <div>
                            <span>📅</span>
                            <p>
                              {bookingTime
                                ? `Horário selecionado: ${bookingTime}`
                                : 'Selecione um horário para continuar.'}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="primary-button"
                            disabled={!bookingService || !bookingTime}
                            onClick={() => {
                              if (!bookingService || !bookingTime) return
                              setAppointmentMessage('')
                              setBookingStep(2)
                            }}
                          >
                            Continuar
                            <span>→</span>
                          </button>
                        </div>
                      </>
                    )}

                    {bookingStep === 2 && (
                      <div className="booking-confirmation">
                        {(() => {
                          const selectedService = services.find(
                            (service) =>
                              String(service.id || service.name) ===
                              String(bookingService)
                          )

                          return (
                            <>
                              <div className="booking-confirmation-grid">
                                <div>
                                  <small>PROFISSIONAL</small>
                                  <strong>{professional.businessName}</strong>
                                </div>
                                <div>
                                  <small>SERVIÇO</small>
                                  <strong>
                                    {selectedService?.name || 'Serviço'}
                                  </strong>
                                </div>
                                <div>
                                  <small>DATA</small>
                                  <strong>
                                    {new Date(
                                      `${bookingDate}T12:00:00`
                                    ).toLocaleDateString('pt-BR')}
                                  </strong>
                                </div>
                                <div>
                                  <small>HORÁRIO</small>
                                  <strong>{bookingTime}</strong>
                                </div>
                                <div>
                                  <small>DURAÇÃO</small>
                                  <strong>
                                    {selectedService?.duration || 'Não informado'}
                                  </strong>
                                </div>
                                <div>
                                  <small>VALOR</small>
                                  <strong>
                                    {selectedService?.price || 'A combinar'}
                                  </strong>
                                </div>
                              </div>

                              <div className="booking-confirmation-client">
                                <span>👤</span>
                                <div>
                                  <strong>{currentUser?.name}</strong>
                                  <small>{currentUser?.email}</small>
                                </div>
                              </div>

                              <div className="booking-confirmation-actions">
                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() => {
                                    setBookingStep(1)
                                    setAppointmentMessage('')
                                  }}
                                >
                                  ← Alterar horário
                                </button>

                                <button
                                  type="button"
                                  className="primary-button"
                                  onClick={confirmBooking}
                                >
                                  Confirmar agendamento
                                  <span>✓</span>
                                </button>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    )}

                    {bookingStep === 3 && (
                      <div className="booking-success">
                        <div className="booking-success-icon">✓</div>
                        <span className="section-label">AGENDAMENTO CONFIRMADO</span>
                        <h3>Seu horário está reservado.</h3>
                        <p>
                          {new Date(
                            `${bookingDate}T12:00:00`
                          ).toLocaleDateString('pt-BR')} às {bookingTime} com{' '}
                          <strong>{professional.businessName}</strong>.
                        </p>

                        <div className="booking-success-actions">
                          <button
                            type="button"
                            className="primary-button"
                            onClick={() => {
                              setClientSection('appointments')
                              setSelectedProfessional(null)
                              resetBookingSelection()
                            }}
                          >
                            Ver meus agendamentos
                            <span>→</span>
                          </button>

                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => {
                              setSelectedProfessional(null)
                              resetBookingSelection()
                            }}
                          >
                            Buscar outro profissional
                          </button>
                        </div>
                      </div>
                    )}

                    {appointmentMessage && bookingStep !== 3 && (
                      <div className="public-booking-message">
                        ⚠️ {appointmentMessage}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="public-professional-empty">
                    <span>🛠️</span>
                    <div>
                      <strong>
                        Este profissional ainda não cadastrou serviços.
                      </strong>
                      <p>
                        Não é possível escolher um horário enquanto não houver
                        serviços disponíveis.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="public-professional-side">
            <section className="professional-panel public-professional-summary">
              <span className="section-label">RESUMO</span>
              <h3>Perfil do profissional</h3>

              <div className="public-summary-row">
                <span>Categoria</span>
                <strong>{professional.category || 'Não informado'}</strong>
              </div>

              <div className="public-summary-row">
                <span>Serviços</span>
                <strong>{services.length}</strong>
              </div>

              <div className="public-summary-row">
                <span>Localização</span>
                <strong>{professional.city || 'Não informado'}</strong>
              </div>

              <div className="public-profile-trust">
                <span>✓</span>
                <div>
                  <strong>Perfil encontrado no TRAFEX</strong>
                  <small>Informações exibidas conforme o cadastro do profissional.</small>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
    )
  }

  function renderProfessionalSearch({ excludeCurrentUser = false } = {}) {
    const professionals = getFilteredProfessionals(
      excludeCurrentUser
    )

    if (selectedProfessional) {
      return renderSelectedProfessionalProfile()
    }

    return (
      <section className="professional-search-section">
        <div className="professional-page-heading">
          <div>
            <span className="section-label">
              BUSCAR PROFISSIONAIS
            </span>

            <h2>
              Encontre o profissional <span>ideal.</span>
            </h2>

            <p>
              Pesquise por nome, negócio, categoria, cidade ou serviço.
            </p>
          </div>
        </div>

        <div className="professional-search-panel">
          <div className="professional-search-input">
            <span>⌕</span>

            <input
              type="text"
              value={professionalSearch}
              onChange={(event) =>
                setProfessionalSearch(event.target.value)
              }
              placeholder="Buscar profissional, negócio, categoria ou serviço..."
              aria-label="Buscar profissionais"
            />

            {professionalSearch && (
              <button
                type="button"
                className="professional-search-clear"
                onClick={() => setProfessionalSearch('')}
                aria-label="Limpar busca"
              >
                ×
              </button>
            )}
          </div>

          <div className="professional-search-meta">
            <span>
              🔍 {professionals.length}{' '}
              {professionals.length === 1
                ? 'profissional encontrado'
                : 'profissionais encontrados'}
            </span>

            {professionalSearch && (
              <span>
                Buscando por “{professionalSearch}”
              </span>
            )}
          </div>
        </div>

        {professionals.length > 0 ? (
          <div className="professional-search-results">
            {professionals.map((professional) => (
              <article
                className="professional-result-card"
                key={professional.id}
              >
                <div className="professional-result-top">
                  <div className="professional-result-avatar">
                    {professional.profileImage ? (
                      <img
                        src={professional.profileImage}
                        alt={`Foto de ${professional.businessName}`}
                      />
                    ) : (
                      professional.businessName
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </div>

                  <div className="professional-result-title">
                    <div className="professional-result-category-row">
                      <span>
                        {professional.category}
                      </span>

                      {professional.createdAt &&
                        Date.now() -
                          new Date(professional.createdAt).getTime() <
                          7 * 24 * 60 * 60 * 1000 && (
                          <small className="professional-new-badge">
                            ✨ Novo
                          </small>
                        )}
                    </div>

                    <h3>
                      {professional.businessName}
                    </h3>

                    <p>
                      {professional.name}
                    </p>
                  </div>
                </div>

                {professional.description && (
                  <p className="professional-result-description">
                    {professional.description}
                  </p>
                )}

                <div className="professional-result-info">
                  {professional.city && (
                    <span>📍 {professional.city}</span>
                  )}

                  {professional.services.length > 0 && (
                    <span>🛠️ {professional.services.length}{' '}
                      {professional.services.length === 1
                        ? 'serviço'
                        : 'serviços'}
                    </span>
                  )}
                </div>

                {professional.services.length > 0 && (
                  <div className="professional-result-services">
                    {professional.services.slice(0, 3).map((service) => (
                      <span key={service.id || service.name}>
                        {service.name}
                      </span>
                    ))}

                    {professional.services.length > 3 && (
                      <span>
                        +{professional.services.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  className="professional-result-button"
                  onClick={() =>
                    openProfessionalProfile(professional)
                  }
                >
                  Ver profissional
                  <span>→</span>
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="professional-search-empty">
            <div>🔎</div>

            <h3>
              Nenhum profissional encontrado
            </h3>

            <p>
              Tente pesquisar por outro nome, categoria ou serviço.
            </p>

            {professionalSearch && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => setProfessionalSearch('')}
              >
                Limpar busca
              </button>
            )}
          </div>
        )}
      </section>
    )
  }

  function renderProfessionalModule() {
    return (
      <div className="professional-module">
        <aside className="professional-sidebar">
          <div className="professional-sidebar-business">
            <div className="sidebar-business-avatar">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Foto do negócio"
                />
              ) : (
                (
                  professionalData?.businessName ||
                  'T'
                )
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            <div>
              <strong>
                {professionalData?.businessName ||
                  currentUser.businessName ||
                  'Meu negócio'}
              </strong>

              <span>Profissional</span>
            </div>
          </div>

          <div className="professional-sidebar-divider"></div>

          <nav className="professional-menu">
            <button
              className={
                professionalSection === 'search'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setProfessionalSection('search')
              }
            >
              <span>⌕</span>
              Buscar profissionais
            </button>

            <button
              className={
                professionalSection === 'overview'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setProfessionalSection(
                  'overview'
                )
              }
            >
              <span>▦</span>
              Visão geral
            </button>

            <button
              className={
                professionalSection === 'business'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setProfessionalSection(
                  'business'
                )
              }
            >
              <span>🏢</span>
              Meu negócio
            </button>

            <button
              className={
                professionalSection ===
                'public-profile'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setProfessionalSection(
                  'public-profile'
                )
              }
            >
              <span>🌐</span>
              Perfil público
            </button>

            <button
              className={
                professionalSection ===
                'services'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setProfessionalSection(
                  'services'
                )
              }
            >
              <span>🛠️</span>
              Serviços
            </button>

            <button
              className={
                professionalSection ===
                'schedule'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setProfessionalSection(
                  'schedule'
                )
              }
            >
              <span>🕐</span>
              Horários
            </button>

            <button
              className={
                professionalSection ===
                'agenda'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setProfessionalSection(
                  'agenda'
                )
              }
            >
              <span>📅</span>
              Agenda
            </button>

            <button
              className={
                professionalSection ===
                'appointments'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setProfessionalSection(
                  'appointments'
                )
              }
            >
              <span>📥</span>
              Agendamentos

              {professionalData?.appointments
                ?.length > 0 && (
                <b>
                  {
                    professionalData
                      .appointments.length
                  }
                </b>
              )}
            </button>
          </nav>

          <div className="professional-sidebar-bottom">
            <button
              onClick={() =>
                setProfessionalSection(
                  'business'
                )
              }
            >
              ⚙️ Configurações
            </button>
          </div>
        </aside>

        <div className="professional-content">
          {professionalSection === 'search' &&
            renderProfessionalSearch({
              excludeCurrentUser: true,
            })}

          {professionalSection === 'overview' &&
            renderProfessionalOverview()}

          {professionalSection === 'business' &&
            renderBusinessSection()}

          {professionalSection === 'services' &&
            renderServicesSection()}

          {professionalSection === 'schedule' &&
            renderScheduleSection()}

          {professionalSection ===
            'public-profile' &&
            renderPublicProfile()}

          {professionalSection ===
            'appointments' &&
            renderAppointments()}

          {professionalSection === 'agenda' &&
            renderAgenda()}
        </div>
      </div>
    )
  }

  if (screen === 'register') {
    return (
      <div className="auth-page">
        <div className="auth-background-glow auth-glow-one"></div>

        <div className="auth-background-glow auth-glow-two"></div>

        <div className="auth-container">
          <button
            className="back-home"
            onClick={goHome}
          >
            ← Voltar para o início
          </button>

          <div className="auth-card register-card">
            <div className="auth-logo">
              <div className="brand-icon">
                T
              </div>

              <div>
                <strong>TRAFEX</strong>
                <span>AGENDS</span>
              </div>
            </div>

            <div className="auth-heading">
              <span className="section-label">
                COMECE AGORA
              </span>

              <h1>
                Crie sua <span>conta.</span>
              </h1>

              <p>
                Escolha como você deseja utilizar o
                TRAFEX AGENDS.
              </p>
            </div>

            <div className="account-type-grid">
              <button
                className={`account-type ${
                  accountType === 'client'
                    ? 'selected'
                    : ''
                }`}
                onClick={() => {
                  setAccountType('client')
                  setMessage('')
                }}
                type="button"
              >
                <div className="account-type-icon">
                  👤
                </div>

                <div>
                  <strong>Cliente</strong>

                  <span>
                    Quero encontrar serviços e fazer
                    agendamentos.
                  </span>
                </div>

                <b>
                  {accountType === 'client'
                    ? '✓'
                    : '→'}
                </b>
              </button>

              <button
                className={`account-type ${
                  accountType ===
                  'professional'
                    ? 'selected'
                    : ''
                }`}
                onClick={() => {
                  setAccountType(
                    'professional'
                  )
                  setMessage('')
                }}
                type="button"
              >
                <div className="account-type-icon">
                  🏢
                </div>

                <div>
                  <strong>
                    Profissional
                  </strong>

                  <span>
                    Quero divulgar meu negócio e
                    receber agendamentos.
                  </span>
                </div>

                <b>
                  {accountType ===
                  'professional'
                    ? '✓'
                    : '→'}
                </b>
              </button>
            </div>

            {accountType && (
              <form
                className="auth-form"
                onSubmit={handleRegister}
              >
                <div className="form-divider">
                  <span>seus dados</span>
                </div>

                <label>
                  Nome completo

                  <input
                    type="text"
                    placeholder="Digite seu nome"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  E-mail

                  <input
                    type="email"
                    placeholder="voce@email.com"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                  />
                </label>

                {accountType ===
                  'professional' && (
                  <>
                    <label>
                      Nome do negócio

                      <input
                        type="text"
                        placeholder="Ex.: DragonForce Tech"
                        value={
                          businessName
                        }
                        onChange={(event) =>
                          setBusinessName(
                            event.target
                              .value
                          )
                        }
                      />
                    </label>

                    <label>
                      Categoria do negócio

                      <select
                        value={category}
                        onChange={(event) =>
                          setCategory(
                            event.target
                              .value
                          )
                        }
                      >
                        <option value="">
                          Selecione uma categoria
                        </option>

                        {categories
                          .filter(
                            (item) =>
                              item.name !==
                              'Outros serviços'
                          )
                          .map((item) => (
                            <option
                              key={
                                item.name
                              }
                              value={
                                item.name
                              }
                            >
                              {item.icon}{' '}
                              {item.name}
                            </option>
                          ))}

                        <option value="Outros serviços">
                          ➕ Outros serviços
                        </option>
                      </select>
                    </label>
                  </>
                )}

                <div className="form-two-columns">
                  <label>
                    Senha

                    <input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target
                            .value
                        )
                      }
                    />
                  </label>

                  <label>
                    Confirmar senha

                    <input
                      type="password"
                      placeholder="Digite novamente"
                      value={
                        confirmPassword
                      }
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target
                            .value
                        )
                      }
                    />
                  </label>
                </div>

                {message && (
                  <div className="auth-message error">
                    ⚠️ {message}
                  </div>
                )}

                <button
                  className="primary-button auth-submit"
                  type="submit"
                >
                  Criar minha conta
                  <span>→</span>
                </button>

                <p className="auth-switch">
                  Já possui uma conta?{' '}

                  <button
                    type="button"
                    onClick={openLogin}
                  >
                    Entrar
                  </button>
                </p>
              </form>
            )}

            {!accountType && (
              <div className="auth-tip">
                <span>💡</span>

                <p>
                  Escolha uma opção acima para
                  começar seu cadastro.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'login') {
    return (
      <div className="auth-page">
        <div className="auth-background-glow auth-glow-one"></div>

        <div className="auth-background-glow auth-glow-two"></div>

        <div className="auth-container">
          <button
            className="back-home"
            onClick={goHome}
          >
            ← Voltar para o início
          </button>

          <div className="auth-card login-card">
            <div className="auth-logo">
              <div className="brand-icon">
                T
              </div>

              <div>
                <strong>TRAFEX</strong>
                <span>AGENDS</span>
              </div>
            </div>

            <div className="auth-heading">
              <span className="section-label">
                BEM-VINDO DE VOLTA
              </span>

              <h1>
                Entre na sua <span>conta.</span>
              </h1>

              <p>
                Acesse seus agendamentos e continue de
                onde parou.
              </p>
            </div>

            <form
              className="auth-form"
              onSubmit={handleLogin}
            >
              <label>
                E-mail

                <input
                  type="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Senha

                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                />
              </label>

              {message && (
                <div className="auth-message error">
                  ⚠️ {message}
                </div>
              )}

              <button
                className="primary-button auth-submit"
                type="submit"
              >
                Entrar na minha conta
                <span>→</span>
              </button>

              <div className="login-info">
                🔒 Seus dados ficam armazenados
                localmente nesta versão.
              </div>

              <p className="auth-switch">
                Ainda não possui uma conta?{' '}

                <button
                  type="button"
                  onClick={() =>
                    openRegister()
                  }
                >
                  Criar conta
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    )
  }

  if (
    screen === 'dashboard' &&
    currentUser
  ) {
    if (
      currentUser.type ===
      'professional'
    ) {
      return (
        <div className="dashboard-page">
          <header className="dashboard-header">
            <div className="container dashboard-header-content">
              <button
                className="brand dashboard-brand"
                onClick={() => {
                  setProfessionalSection(
                    'overview'
                  )

                  setScreen(
                    'dashboard'
                  )
                }}
              >
                <div className="brand-icon">
                  T
                </div>

                <div>
                  <strong>
                    TRAFEX
                  </strong>

                  <span>
                    AGENDS
                  </span>
                </div>
              </button>

              <div className="dashboard-user">
                <div className="dashboard-user-avatar">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Foto do perfil"
                    />
                  ) : (
                    currentUser.name
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>

                <div className="dashboard-user-info">
                  <strong>
                    {currentUser.name}
                  </strong>

                  <span>
                    Profissional
                  </span>
                </div>

                <button
                  className="dashboard-logout"
                  onClick={
                    handleLogout
                  }
                >
                  Sair
                </button>
              </div>
            </div>
          </header>

          <main className="dashboard-main professional-dashboard-main">
            <div className="container">
              {renderProfessionalModule()}
            </div>
          </main>
        </div>
      )
    }

    return (
      <div className="dashboard-page">
        <header className="dashboard-header">
          <div className="container dashboard-header-content">
            <button
              className="brand dashboard-brand"
              onClick={goHome}
            >
              <div className="brand-icon">
                T
              </div>

              <div>
                <strong>
                  TRAFEX
                </strong>

                <span>
                  AGENDS
                </span>
              </div>
            </button>

            <div className="dashboard-user">
              <div className="dashboard-user-avatar">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Foto do perfil"
                  />
                ) : (
                  currentUser.name
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              <div className="dashboard-user-info">
                <strong>
                  {currentUser.name}
                </strong>

                <span>
                  Cliente
                </span>
              </div>

              <button
                className="dashboard-logout"
                onClick={
                  handleLogout
                }
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        <main className="dashboard-main">
          <div className="container">
            <div className="dashboard-welcome">
              <div>
                <span className="section-label">
                  PAINEL PRINCIPAL
                </span>

                <h1>
                  Olá,{' '}
                  <span>
                    {
                      currentUser.name.split(
                        ' '
                      )[0]
                    }!
                  </span>{' '}
                  👋
                </h1>

                <p>
                  Encontre serviços e acompanhe
                  seus agendamentos.
                </p>
              </div>

              <div className="dashboard-date">
                <span>
                  HOJE
                </span>

                <strong>
                  {new Date().toLocaleDateString(
                    'pt-BR',
                    {
                      day: '2-digit',
                      month: 'long',
                    }
                  )}
                </strong>
              </div>
            </div>

            <div className="client-dashboard-nav">
              <button
                type="button"
                className={clientSection === 'search' ? 'active' : ''}
                onClick={() => {
                  setClientSection('search')
                  setSelectedProfessional(null)
                  resetBookingSelection()
                }}
              >
                🔎 Buscar profissionais
              </button>

              <button
                type="button"
                className={
                  clientSection === 'appointments' ? 'active' : ''
                }
                onClick={() => setClientSection('appointments')}
              >
                📅 Meus agendamentos
                {clientAppointments.filter(
                  (appointment) => appointment.status !== 'Cancelado'
                ).length > 0 && (
                  <b>
                    {
                      clientAppointments.filter(
                        (appointment) =>
                          appointment.status !== 'Cancelado'
                      ).length
                    }
                  </b>
                )}
              </button>
            </div>

            <div className="dashboard-stat-grid">
              <div className="dashboard-stat">
                <div className="dashboard-stat-icon purple">📅</div>
                <span>Agendamentos</span>
                <strong>{clientAppointments.length}</strong>
                <small>Horários registrados</small>
              </div>

              <div className="dashboard-stat">
                <div className="dashboard-stat-icon blue">⏰</div>
                <span>Próximos</span>
                <strong>
                  {
                    clientAppointments.filter(
                      (appointment) =>
                        appointment.status !== 'Cancelado' &&
                        appointment.date >=
                          new Date().toISOString().slice(0, 10)
                    ).length
                  }
                </strong>
                <small>Próximos horários</small>
              </div>

              <div className="dashboard-stat">
                <div className="dashboard-stat-icon green">✓</div>
                <span>Concluídos</span>
                <strong>
                  {
                    clientAppointments.filter(
                      (appointment) =>
                        appointment.status === 'Concluído'
                    ).length
                  }
                </strong>
                <small>Atendimentos realizados</small>
              </div>

              <div className="dashboard-stat">
                <div className="dashboard-stat-icon orange">🔔</div>
                <span>Status</span>
                <strong>
                  {
                    clientAppointments.filter(
                      (appointment) =>
                        appointment.status === 'Pendente'
                    ).length
                  }
                </strong>
                <small>Agendamentos pendentes</small>
              </div>
            </div>

            {clientSection === 'appointments' ? (
              renderClientAppointments()
            ) : (
              <>
                {renderProfessionalSearch()}

                <div className="dashboard-content-grid">
                  <section className="dashboard-panel profile-panel">
                    <div className="dashboard-panel-heading">
                      <div>
                        <span className="section-label">PERFIL</span>
                        <h2>Minha conta</h2>
                      </div>
                    </div>

                    <div className="profile-preview">
                      <div className="profile-large-avatar">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt="Foto do perfil"
                          />
                        ) : (
                          currentUser.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <h3>{currentUser.name}</h3>
                      <p>{currentUser.email}</p>

                      <span className="profile-type">
                        👤 Cliente
                      </span>

                      <label className="photo-upload-button">
                        📷 Alterar foto
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImage}
                          hidden
                        />
                      </label>

                      {profileImage && (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={removeProfileImage}
                        >
                          Remover foto
                        </button>
                      )}
                    </div>
                  </section>

                  <section className="dashboard-panel">
                    <div className="dashboard-panel-heading">
                      <div>
                        <span className="section-label">AGENDA</span>
                        <h2>Próximo horário</h2>
                      </div>
                    </div>

                    {clientAppointments.filter(
                      (appointment) =>
                        appointment.status !== 'Cancelado' &&
                        appointment.date >=
                          new Date().toISOString().slice(0, 10)
                    ).length > 0 ? (
                      (() => {
                        const nextAppointment = [...clientAppointments]
                          .filter(
                            (appointment) =>
                              appointment.status !== 'Cancelado' &&
                              appointment.date >=
                                new Date().toISOString().slice(0, 10)
                          )
                          .sort((x, y) =>
                            `${x.date} ${x.time}`.localeCompare(
                              `${y.date} ${y.time}`
                            )
                          )[0]

                        return (
                          <div className="client-next-appointment">
                            <span className="section-label">
                              {nextAppointment.status}
                            </span>
                            <h3>{nextAppointment.businessName}</h3>
                            <p>{nextAppointment.service}</p>
                            <strong>
                              📅 {new Date(
                                `${nextAppointment.date}T12:00:00`
                              ).toLocaleDateString('pt-BR')}{' '}
                              • ⏰ {nextAppointment.time}
                            </strong>
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() =>
                                setClientSection('appointments')
                              }
                            >
                              Ver meus agendamentos →
                            </button>
                          </div>
                        )
                      })()
                    ) : (
                      <div className="empty-state">
                        <div className="empty-state-icon">📅</div>
                        <h3>Nenhum próximo horário</h3>
                        <p>
                          Encontre um profissional e faça seu primeiro
                          agendamento.
                        </p>
                      </div>
                    )}
                  </section>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container header-content">
          <button
            className="brand"
            onClick={goHome}
          >
            <div className="brand-icon">
              T
            </div>

            <div>
              <strong>
                TRAFEX
              </strong>

              <span>
                AGENDS
              </span>
            </div>
          </button>

          <nav className="nav">
            <a href="#inicio">
              Início
            </a>

            <a href="#categorias">
              Categorias
            </a>

            <a href="#como-funciona">
              Como funciona
            </a>
          </nav>

          <div className="header-actions">
            <button
              className="login-button"
              onClick={openLogin}
            >
              Entrar
            </button>

            <button
              className="primary-button small"
              onClick={() =>
                openRegister()
              }
            >
              Criar conta
            </button>
          </div>
        </div>
      </header>

      <main>
        <section
          className="hero-section"
          id="inicio"
        >
          <div className="hero-glow glow-one"></div>
          <div className="hero-glow glow-two"></div>

          <div className="container hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                <span className="badge-dot"></span>

                Sua agenda. Seu negócio. Tudo
                em um só lugar.
              </div>

              <h1>
                Agende tudo de forma
                <span>
                  {' '}
                  simples e inteligente.
                </span>
              </h1>

              <p>
                Encontre serviços, marque seus
                horários e organize seu negócio
                em uma plataforma feita para
                todos.
              </p>

              <div className="hero-buttons">
                <button
                  className="primary-button"
                  onClick={() =>
                    currentUser
                      ? setScreen(
                          'dashboard'
                        )
                      : openRegister(
                          'client'
                        )
                  }
                >
                  Agendar agora
                  <span>→</span>
                </button>

                <button
                  className="secondary-button"
                  onClick={() =>
                    openRegister(
                      'professional'
                    )
                  }
                >
                  Quero usar no meu negócio
                </button>
              </div>

              <div className="trust-row">
                <div className="trust-item">
                  <span>✓</span>
                  Fácil de usar
                </div>

                <div className="trust-item">
                  <span>✓</span>
                  Seguro
                </div>

                <div className="trust-item">
                  <span>✓</span>
                  Para qualquer serviço
                </div>
              </div>
            </div>

            <div className="hero-dashboard">
              <div className="dashboard-window">
                <div className="window-top">
                  <div className="window-dots">
                    <i></i>
                    <i></i>
                    <i></i>
                  </div>

                  <span>
                    TRAFEX AGENDS
                  </span>

                  <div className="window-status">
                    ● Online
                  </div>
                </div>

                <div className="dashboard-body">
                  <div className="dashboard-heading">
                    <div>
                      <small>
                        Olá, seja bem-vindo 👋
                      </small>

                      <h3>
                        Encontre um serviço
                      </h3>
                    </div>

                    <div className="avatar">
                      U
                    </div>
                  </div>

                  <div className="dashboard-search">
                    <span>⌕</span>

                    <span>
                      Buscar serviço ou
                      profissional...
                    </span>
                  </div>

                  <div className="mini-cards">
                    <div className="mini-card active">
                      <span>📅</span>
                      <strong>12</strong>
                      <small>
                        Agendamentos
                      </small>
                    </div>

                    <div className="mini-card">
                      <span>⏰</span>
                      <strong>04</strong>
                      <small>
                        Hoje
                      </small>
                    </div>

                    <div className="mini-card">
                      <span>✓</span>
                      <strong>98%</strong>
                      <small>
                        Organização
                      </small>
                    </div>
                  </div>

                  <div className="schedule-preview">
                    <div className="schedule-title">
                      <strong>
                        Próximo agendamento
                      </strong>

                      <span>
                        Ver agenda →
                      </span>
                    </div>

                    <div className="appointment">
                      <div className="appointment-icon">
                        🔧
                      </div>

                      <div className="appointment-info">
                        <strong>
                          Assistência técnica
                        </strong>

                        <span>
                          Hoje • 14:30
                        </span>
                      </div>

                      <div className="confirmed">
                        Confirmado
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="floating-card floating-one">
                <span>✓</span>

                <div>
                  <strong>
                    Agendamento confirmado
                  </strong>

                  <small>
                    Seu horário está reservado
                  </small>
                </div>
              </div>

              <div className="floating-card floating-two">
                <span>🔔</span>

                <div>
                  <strong>
                    Lembrete
                  </strong>

                  <small>
                    Atendimento em 30 min
                  </small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="categories-section"
          id="categorias"
        >
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="section-label">
                  ENCONTRE O QUE PRECISA
                </span>

                <h2>
                  Um lugar para{' '}
                  <span>
                    todo tipo de serviço.
                  </span>
                </h2>
              </div>

              <div className="search-box">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Buscar categoria..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="category-grid">
              {filteredCategories.map(
                (categoryItem) => (
                  <button
                    className="category-card"
                    key={
                      categoryItem.name
                    }
                    onClick={() =>
                      openRegister(
                        'client'
                      )
                    }
                  >
                    <span className="category-icon">
                      {
                        categoryItem.icon
                      }
                    </span>

                    <strong>
                      {
                        categoryItem.name
                      }
                    </strong>

                    <span className="category-arrow">
                      →
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        <section
          className="features-section"
          id="como-funciona"
        >
          <div className="container">
            <div className="section-heading centered">
              <span className="section-label">
                POR QUE TRAFEX AGENDS?
              </span>

              <h2>
                Feito para ser{' '}
                <span>
                  simples.
                </span>
              </h2>

              <p>
                Tudo que você precisa para
                organizar seus horários e
                serviços sem complicação.
              </p>
            </div>

            <div className="features-grid">
              <article className="feature-card">
                <div className="feature-icon purple">
                  📅
                </div>

                <h3>
                  Agenda organizada
                </h3>

                <p>
                  Veja seus horários de forma
                  clara e mantenha seus
                  agendamentos sempre
                  organizados.
                </p>
              </article>

              <article className="feature-card featured">
                <div className="feature-icon blue">
                  🛡️
                </div>

                <h3>
                  Segurança e confiança
                </h3>

                <p>
                  Uma experiência pensada para
                  transmitir segurança tanto
                  para clientes quanto para
                  profissionais.
                </p>
              </article>

              <article className="feature-card">
                <div className="feature-icon green">
                  ⚡
                </div>

                <h3>
                  Fácil de usar
                </h3>

                <p>
                  Menos complicação, menos
                  cliques e uma experiência
                  que qualquer pessoa consegue
                  entender.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <div className="cta-box">
              <div>
                <span className="section-label">
                  PARA CLIENTES E NEGÓCIOS
                </span>

                <h2>
                  Sua rotina pode ser
                  <span>
                    {' '}
                    muito mais simples.
                  </span>
                </h2>

                <p>
                  Organize seus serviços,
                  encontre profissionais e
                  cuide dos seus agendamentos
                  em um único lugar.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={() =>
                  openRegister()
                }
              >
                Começar agora
                <span>→</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <button
            className="brand footer-brand"
            onClick={goHome}
          >
            <div className="brand-icon">
              T
            </div>

            <div>
              <strong>
                TRAFEX
              </strong>

              <span>
                AGENDS
              </span>
            </div>
          </button>

          <p>
            Agendamento simples para todos.
          </p>

          <span className="copyright">
            © 2026 TRAFEX AGENDS
          </span>
        </div>
      </footer>
    </div>
  )
}

export default App