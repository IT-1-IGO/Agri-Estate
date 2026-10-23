import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import './Navbar.css';
import { usePublishedCollection } from '../admin/store';
import { NAV_SEED } from '../data/siteContent';

const Navbar: React.FC = () => {
  const NAV_ITEMS = usePublishedCollection('nav', NAV_SEED).map((n) => ({ label: String(n.label), to: String(n.to) }));
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const isActive = (to: string) => to === '/faq' && pathname === '/faq';

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <header className={`igo-header ${isScrolled ? 'is-scrolled' : ''}`}>
      {/* Utility bar */}
      <div className="igo-topbar">
        <div className="igo-container igo-topbar__inner">
          <a href="tel:+917397789803"><Phone size={14} aria-hidden /> +91 73977 89803</a>
          <a href="mailto:bd1@igogroups.com"><Mail size={14} aria-hidden /> bd1@igogroups.com</a>
          <LanguageSelector />
        </div>
      </div>

      {/* Main nav */}
      <nav className="igo-nav" aria-label="Main navigation">
        <div className="igo-container igo-nav__inner">
          <Link to="/" className="igo-logo" onClick={() => { close(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <img src="/images/logo.png" alt="IGO Agri Estate" />
            <span className="igo-logo__text">
              <strong>IGO</strong>
              <small>Agri Estate</small>
            </span>
          </Link>

          <ul className="igo-menu">
            {NAV_ITEMS.map(item => (
              <li key={item.label}>
                <Link to={item.to} className={`igo-link${isActive(item.to) ? ' is-active' : ''}`} aria-current={isActive(item.to) ? 'page' : undefined}>{item.label}</Link>
              </li>
            ))}
          </ul>


          <button
            type="button"
            className="igo-toggle"
            onClick={() => setIsOpen(o => !o)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            aria-controls="igo-mobile-menu"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile menu */}
        <div id="igo-mobile-menu" className={`igo-mobile ${isOpen ? 'is-open' : ''}`}>
          <ul>
            {NAV_ITEMS.map(item => (
              <li key={item.label}>
                <Link to={item.to} onClick={close} className={isActive(item.to) ? 'is-active' : undefined}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
