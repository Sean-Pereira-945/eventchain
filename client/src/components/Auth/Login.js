import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Button from '../UI/Button';
import FormInput from '../UI/FormInput';
import useAuth from '../../hooks/useAuth';
import styles from './Auth.module.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const { login, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/events');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values) => {
    try {
      const redirectPath = location.state?.from?.pathname || '/events';
      await login(values);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setError('root', { message: error?.response?.data?.message || 'Unable to login. Please try again.' });
    }
  };

  return (
    <section className={styles.authContainer} aria-labelledby="login-heading">
      <header>
        <h1 id="login-heading" className={styles.title}>
          Welcome back
        </h1>
        <p className={styles.subtitle}>Access your events, certificates, and analytics dashboard.</p>
      </header>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormInput
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email address'
            }
          })}
        />
        <FormInput
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters'
            }
          })}
        />
        {errors.root && (
          <p role="alert" className={styles.error}>
            {errors.root.message}
          </p>
        )}
        <Button type="submit" isLoading={loading}>
          Sign in
        </Button>
      </form>
      <p className={styles.switcher}>
        <Link to="/forgot-password">Forgot your password?</Link>
      </p>
      <p className={styles.switcher}>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </section>
  );
};

export default Login;
