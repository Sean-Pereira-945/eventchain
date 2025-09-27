import './Header.css';

const Header = ({ title, subtitle, actions }) => (
  <div className="page-header">
    <div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {actions && <div className="page-header__actions">{actions}</div>}
  </div>
);

export default Header;
