export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error. Please check your connection.') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class AuthError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message)
    this.name = 'AuthError'
  }
}

export function handleApiError(error: any): string {
  if (error.response?.status === 401) {
    return 'Your session has expired. Please login again.'
  }

  if (error.response?.status === 403) {
    return 'You do not have permission to access this resource.'
  }

  if (error.response?.status === 404) {
    return 'The requested resource was not found.'
  }

  if (error.response?.status === 422) {
    return error.response?.data?.message || 'Invalid input. Please check your data.'
  }

  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.'
  }

  if (error.message === 'Network Error') {
    return 'Network error. Please check your connection.'
  }

  return error.response?.data?.message || error.message || 'An error occurred. Please try again.'
}
