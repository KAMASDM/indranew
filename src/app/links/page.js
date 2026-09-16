import Image from 'next/image';
import styles from './page.module.css';

export const metadata = {
  title: 'Connect with us | Indraprasth Foundation',
  description: 'Reels, live Vishrajan, photos, and the Indraprasth Foundation WhatsApp channel.',
};

export const viewport = { themeColor: '#65ab9f' };

const website = 'https://indraprasthfoundation.org/';
const links = [
  {
    icon: 'instagram',
    label: 'Reel',
    accessibleLabel: 'Reel on Instagram',
    href: 'https://www.instagram.com/indraprasthfoundation?stkn=MXN3Y3VtaWJsMXNwNA==',
  },
  { icon: 'facebook', label: 'Reel', accessibleLabel: 'Reel on Facebook', href: 'https://facebook.com' },
  {
    icon: 'youtube',
    label: 'For live Vishrajan',
    href: 'https://youtube.com/@indraprasthfoundation?si=dN6HEALH0nO4n7Nl',
  },
  {
    icon: 'whatsapp',
    label: 'WhatsApp channel',
    href: 'https://whatsapp.com/channel/0029Va55HEdC6Zvri1J4UO38',
  },
  { icon: 'globe', label: 'For Photos', href: website, outlined: true },
];

function Icon({ name }) {
  const props = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  switch (name) {
    case 'instagram':
      return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
    case 'facebook':
      return <svg {...props} stroke="none"><path fill="currentColor" d="M3 2h18a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1h-5.5v-7.7h2.6l.4-3h-3V9.4c0-.9.3-1.5 1.5-1.5h1.6V5.2a19 19 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1v2.2H9.5v3h2.7V22H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" /></svg>;
    case 'youtube':
      return <svg {...props} stroke="none"><path fill="currentColor" fillRule="evenodd" d="M3.8 4.8a41 41 0 0 1 16.4 0c1 .3 1.6 1 1.8 2.1a26 26 0 0 1 0 10.2c-.2 1.1-.8 1.8-1.8 2.1a41 41 0 0 1-16.4 0c-1-.3-1.6-1-1.8-2.1a26 26 0 0 1 0-10.2c.2-1.1.8-1.8 1.8-2.1ZM10 8v8l6-4-6-4Z" clipRule="evenodd" /></svg>;
    case 'whatsapp':
      return <svg {...props}><path d="M20.5 11.6a8.6 8.6 0 0 1-12.8 7.5L3 20.5l1.4-4.6A8.6 8.6 0 1 1 20.5 11.6Z" /><path d="m8.4 7.2 1.3 2.5-.9 1.2c.9 1.7 2 2.8 3.8 3.5l1.2-1.1 2.6 1.2c-.2 1.6-1.1 2.1-2.2 2-3.6-.5-6.7-3.3-7.4-6.5-.3-1.3.3-2.4 1.6-2.8Z" strokeWidth="1.4" /></svg>;
    case 'mail':
      return <svg {...props}><rect x="2.5" y="4.5" width="19" height="15" rx="2" /><path d="m3 6 9 7 9-7M3 18l6-6m12 6-6-6" /></svg>;
    default:
      return <svg {...props}><circle cx="12" cy="12" r="9.5" /><ellipse cx="12" cy="12" rx="4" ry="9.5" /><path d="M3 8.5h18M3 15.5h18M12 2.5v19" /></svg>;
  }
}

export default function LinksPage() {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <Image src="/indra.png" alt="Indraprasth Foundation logo" width={500} height={500} priority sizes="260px" className={styles.logoArtwork} />
          </div>
          <h1>INDRAPRASTH FOUNDATION</h1>
          <p>CHARITABLE TRUST</p>
        </header>

        <nav className={styles.links} aria-label="Foundation social and media links">
          {links.map(link => (
            <a key={link.icon} href={link.href} aria-label={link.accessibleLabel || link.label}
              target="_blank" rel="noopener noreferrer"
              className={`${styles.card}${link.outlined ? ` ${styles.outlined}` : ''}`}>
              <span className={styles.iconTile}><Icon name={link.icon} /></span>
              <span>{link.label}</span>
            </a>
          ))}
        </nav>

        <footer className={styles.footer}>
          <a href="mailto:contact@indraprasthfoundation.org" aria-label="Email Indraprasth Foundation"><Icon name="mail" /></a>
          <a href={website} target="_blank" rel="noopener noreferrer" aria-label="Visit the foundation website"><Icon name="globe" /></a>
        </footer>
      </div>
    </main>
  );
}
