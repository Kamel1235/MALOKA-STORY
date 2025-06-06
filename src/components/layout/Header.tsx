import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { THEME_COLORS, SITE_NAME, NAVIGATION_LINKS } from '../../constants';
import { EarringIcon } from '../icons/EarringIcon';
import { RingIcon } from '../icons/RingIcon';
import { NecklaceIcon } from '../icons/NecklaceIcon';
import { OfferIcon } from '../icons/OfferIcon';
import { ContactIcon } from '../icons/ContactIcon';
import { HomeIcon } from '../icons/HomeIcon';
import { MenuIcon } from '../icons/MenuIcon';
import { CloseIcon } from '../icons/CloseIcon';
// PublishIcon is no longer needed for header navigation if "Publish Changes" is admin-only and in admin sidebar
import { useData } from '../../contexts/DataContext'; 

// Define a fallback logo URL directly or import if it's a general fallback
const FALLBACK_LOGO = "https://i.ibb.co/tZPYk6G/Maloka-Story-Logo.png";

const IconMap: { [key: string]: React.FC<{className?: string}> } = {
  HomeIcon,
  EarringIcon,
  RingIcon,
  NecklaceIcon,
  OfferIcon,
  ContactIcon,
  // PublishIcon no longer needed here if removed from user-facing NAVIGATION_LINKS
};

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings, isLoading } = useData();

  // Determine logo: use settings.siteLogoUrl if available, otherwise use a hardcoded fallback.
  const siteLogoUrl = settings?.siteLogoUrl || FALLBACK_LOGO;

  const activeLinkStyle = `${THEME_COLORS.accentGold} font-bold`;
  const inactiveLinkStyle = `${THEME_COLORS.textSecondary} hover:${THEME_COLORS.accentGold}`;

  // User navigation links (ensure "PublishIcon" related links are not here if they were for admin)
  const userNavLinks = NAVIGATION_LINKS.filter(link => link.icon !== "PublishIcon");

  const navItems = userNavLinks.map(link => {
    const IconComponent = IconMap[link.icon];
    return (
      <NavLink
        key={link.name}
        to={link.path}
        className={({ isActive }) => 
          `flex flex-col items-center p-2 rounded-md transition-colors duration-200 ${isActive ? activeLinkStyle : inactiveLinkStyle}`
        }
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {IconComponent && <IconComponent className="w-7 h-7 mb-1" />}
        <span className="text-xs">{link.name}</span>
      </NavLink>
    );
  });

  return (
    <header className={`${THEME_COLORS.cardBackground} shadow-lg sticky top-0 z-40 bg-opacity-80 backdrop-blur-md`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className={`flex items-center text-3xl font-bold ${THEME_COLORS.accentGold}`}>
            {!isLoading && siteLogoUrl && (
                <img 
                src={siteLogoUrl} 
                alt="Maloka Story Logo" 
                className="h-10 w-auto mr-3 object-contain"
                onError={(e) => (e.currentTarget.src = FALLBACK_LOGO)} // Fallback for broken images
                />
            )}
            {(isLoading || !siteLogoUrl) && !settings && ( /* Show placeholder if still loading and no settings yet */
                 <div className="h-10 w-24 mr-3 bg-purple-700 rounded animate-pulse"></div>
            )}
            <span>{SITE_NAME}</span>
          </Link>
          
          <nav className="hidden md:flex space-x-3 items-center">
            {navItems}
            <NavLink
              to="/admin"
              className={({ isActive }) => 
                `p-2 rounded-md transition-colors duration-200 ${isActive ? activeLinkStyle : inactiveLinkStyle} text-sm`
              }
            >
              لوحة التحكم
            </NavLink>
          </nav>

          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={THEME_COLORS.textPrimary}>
              {isMobileMenuOpen ? <CloseIcon className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={`md:hidden absolute top-full left-0 right-0 ${THEME_COLORS.cardBackground} shadow-xl pb-4 border-t ${THEME_COLORS.borderColor}`}>
          <nav className="flex flex-col items-center space-y-2 p-4">
            {navItems}
            <NavLink
              to="/admin"
              className={({ isActive }) => 
                `w-full text-center p-2 rounded-md transition-colors duration-200 ${isActive ? activeLinkStyle : inactiveLinkStyle}`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              لوحة التحكم
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
