export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' }
  }
  return { valid: true }
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function validateLicenseNumber(license: string): boolean {
  return license.length >= 5 && license.length <= 20
}

export function validateDate(date: string): boolean {
  const d = new Date(date)
  return d instanceof Date && !isNaN(d.getTime())
}

export function validateTime(time: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

export function validateFileSize(size: number, maxSize: number = 10485760): boolean {
  return size <= maxSize
}

export function validateFileType(type: string, allowedTypes: string[] = ['application/pdf', 'image/jpeg', 'image/png']): boolean {
  return allowedTypes.includes(type)
}
