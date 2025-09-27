import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Button from '../UI/Button';
import FormInput from '../UI/FormInput';
import useAuth from '../../hooks/useAuth';
import styles from './Auth.module.css';

const Register = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });
  const { register: registerUser, loading } = useAuth();

  const onSubmit = async (values) => {
    const { password, confirmPassword, ...rest } = values;
    if (password !== confirmPassword) {
      setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }

    try {
      await registerUser({ ...rest, password });
      navigate('/login', { replace: true, state: { email: rest.email } });
    } catch (error) {
      setError('root', { message: error?.response?.data?.message || 'Unable to register. Please try again.' });
    }
  };

  return (
    <section className={styles.authContainer} aria-labelledby="register-heading">
      <header>
        <h1 id="register-heading" className={styles.title}>
          Create your account
        </h1>
        <p className={styles.subtitle}>Register to unlock blockchain-verified event experiences.</p>
      </header>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormInput
          label="Full name"
          placeholder="Ada Lovelace"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
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
        <FormInput
          label="Password"
          type="password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters'
            }
          })}
        />
        <FormInput
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === watch('password') || 'Passwords do not match'
          })}
        />
        {errors.root && (
          <p role="alert" className={styles.error}>
            {errors.root.message}
          </p>
        )}
        <Button type="submit" isLoading={loading}>
          Create account
        </Button>
      </form>
      <p className={styles.switcher}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </section>
  );
};

export default Register;
