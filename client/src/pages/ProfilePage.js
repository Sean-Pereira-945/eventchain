import Button from '../components/UI/Button';
import './pages.css';

const ProfilePage = () => (
  <section className="page" aria-labelledby="profile-heading">
    <header className="page__header">
      <h1 id="profile-heading">Profile & preferences</h1>
      <p>Update your personal details, manage API keys, and configure notification preferences.</p>
    </header>
    <div className="page__content">
      <div className="page__section">
        <h2>Account information</h2>
        <p>Connect to the auth service to load profile data, multi-factor authentication, and device trust settings.</p>
        <Button type="button">Update profile</Button>
      </div>
      <div className="page__section">
        <h2>Security</h2>
        <p>Integrate password change, blockchain identity proofs, and session revocation controls here.</p>
      </div>
    </div>
  </section>
);

export default ProfilePage;
