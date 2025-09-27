export const parseAPIError = (error) => {
  if (!error) return 'Unexpected error occurred';
  if (typeof error === 'string') return error;

  if (error.response?.data) {
    const { message, errors } = error.response.data;
    if (errors && Array.isArray(errors) && errors.length) {
      return errors.join(', ');
    }
    return message || 'Request failed';
  }

  if (error.message) return error.message;
  return 'Something went wrong';
};

export const createErrorHandler = (setError) => (error) => {
  const message = parseAPIError(error);
  setError(message);
  return message;
};
