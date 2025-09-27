import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Button from '../UI/Button';
import FormInput from '../UI/FormInput';
import { useNotifications } from '../../context/NotificationContext';
import * as authService from '../../services/authService';
import { parseAPIError } from '../../utils/errorHandling';
import styles from './Auth.module.css';

const ForgotPassword = () => {
  const { showNotification } = useNotifications();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset
  } = useForm({
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (values) => {
    try {
      await authService.forgotPassword(values);
      showNotification({
        type: 'success',
        title: 'Email sent',
        message: 'Check your inbox for password reset instructions.'
      });
      reset();
    } catch (error) {
      const message = parseAPIError(error) || 'Unable to send reset instructions.';
      setError('root', { message });
    }
  };

  return (
    <section className={styles.authContainer} aria-labelledby="forgot-password-heading">
      <header>
        <h1 id="forgot-password-heading" className={styles.title}>
          Reset your password
        </h1>
        <p className={styles.subtitle}>Enter your email and we'll send you a secure reset link.</p>
      </header>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email address'
            }
          })}
        />
        {errors.root && (
          <p role="alert" className={styles.error}>
            {errors.root.message}
          </p>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          Send reset link
        </Button>
      </form>
      <p className={styles.switcher}>
        Remembered your password? <Link to="/login">Return to sign in</Link>
      </p>
    </section>
  );
};

export default ForgotPassword;
