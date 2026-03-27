import '../../shared/styles/landing.css';
import { ImageWithFallback } from '../guidelines/figma/ImageWithFallback';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="hl-landing">

      {/* ── HEADER ── */}
      <header className="hl-header">
        <div className="hl-header__logo">High Life Spa</div>
        <nav className="hl-header__nav">
          <a href="#inicio"    className="hl-nav-link hl-nav-link--active">Inicio</a>
          <a href="#servicios" className="hl-nav-link">Servicios</a>
          <a href="#nosotros"  className="hl-nav-link">Sobre Nosotros</a>
          <a href="#contacto"  className="hl-nav-link">Contacto</a>
        </nav>
        <div className="hl-header__auth">
          <button className="hl-btn-register" onClick={() => onNavigate('register')}>
            Registrar
          </button>
          <button className="hl-btn-reserve" onClick={() => onNavigate('login')}>
            Iniciar Sesión
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section id="inicio" className="hl-hero">
        <div className="hl-hero__bg">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1400&q=85"
            alt="Luxury spa"
            className="hl-hero__img"
          />
          <div className="hl-hero__overlay" />
        </div>

        <div className="hl-hero__content">
          <p className="hl-hero__eyebrow">THE SANCTUARY EXPERIENCE</p>
          <h1 className="hl-hero__title">
            Bienvenido a <em>HIGH LIFE</em><br />SPA &amp; BAR
          </h1>
          <p className="hl-hero__subtitle">
            Descubre un oasis de tranquilidad diseñado para renovar tu cuerpo y espíritu.
          </p>
          <div className="hl-hero__actions">
            <button className="hl-btn-primary" onClick={() => onNavigate('login')}>
              Reservar Cita
            </button>
            <button
              className="hl-btn-ghost"
              onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver Servicios
            </button>
          </div>
        </div>

        <div className="hl-stats">
          <div className="hl-stat">
            <span className="hl-stat__icon">★</span>
            <div>
              <strong>5.0 Calificación</strong>
              <span>GOOGLE REVIEWS</span>
            </div>
          </div>
          <div className="hl-stat">
            <span className="hl-stat__icon">👥</span>
            <div>
              <strong>100+ Clientes Satisfechos</strong>
              <span>MENSUALES</span>
            </div>
          </div>
          <div className="hl-stat">
            <span className="hl-stat__icon">✦</span>
            <div>
              <strong>10+ Servicios</strong>
              <span>ESPECIALIZADOS</span>
            </div>
          </div>
          <button className="hl-stat__cta" onClick={() => onNavigate('login')}>
            <span>RESERVA DIRECTA.</span>
            Agendar Ahora
          </button>
        </div>
      </section>

      {/* ── SERVICES INTRO ── */}
      <section id="servicios" className="hl-services-intro">
        <div className="hl-services-intro__left">
          <h2 className="hl-section-title"><em>Experiencias de Bienestar</em></h2>
          <p className="hl-section-body">
            Nuestros rituales están diseñados para transportarte a un estado de relajación
            absoluta, combinando técnicas milenarias con la sofisticación moderna.
          </p>
        </div>
        <button className="hl-link-upper">VER TODOS LOS RITUALES →</button>
      </section>

      {/* ── SERVICES GRID ── */}
      <section className="hl-grid">
        {/* Tall left */}
        <div className="hl-card hl-card--tall">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&q=80"
            alt="Manicure"
            className="hl-card__img"
          />
          <div className="hl-card__info">
            <p className="hl-card__category">CUIDADO ESTÉTICO</p>
            <h3 className="hl-card__name">Manicure &amp; Pedicura</h3>
          </div>
        </div>

        {/* Featured top-right */}
        <div className="hl-card hl-card--featured">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=700&q=80"
            alt="Masaje"
            className="hl-card__img"
          />
          <div className="hl-card__info">
            <p className="hl-card__category">TERAPIA CORPORAL</p>
            <h3 className="hl-card__name">Masajes de Relajación</h3>
            <span className="hl-card__price">Desde $85</span>
          </div>
        </div>

        {/* Portrait bottom-center */}
        <div className="hl-card hl-card--portrait">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=80"
            alt="Facial"
            className="hl-card__img"
          />
        </div>

        {/* CTA bottom-right */}
        <div className="hl-card hl-card--cta">
          <span className="hl-card__sparkle">✦</span>
          <h3 className="hl-card__name">Experiencia Personalizada</h3>
          <p className="hl-card__desc">
            ¿No sabes qué elegir? Déjanos asesorarte para crear un plan a tu medida.
          </p>
          <button className="hl-link-upper" onClick={() => onNavigate('login')}>
            CONSULTAR AHORA
          </button>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section className="hl-quote">
        <span className="hl-quote__mark">"</span>
        <blockquote className="hl-quote__text">
          <em>En el silencio del cuidado personal,<br />
          encontramos la voz de nuestra propia paz.</em>
        </blockquote>
        <div className="hl-quote__divider" />
        <p className="hl-quote__author">EDITORIAL HIGH LIFE</p>
      </section>

      {/* ── ABOUT ── */}
      <section id="nosotros" className="hl-about">
        <div className="hl-about__images">
          <div className="hl-about__img-wrap hl-about__img-wrap--offset">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1757940113920-69e3686438d3?w=500&q=80"
              alt="Spa interior"
              className="hl-about__img"
            />
          </div>
          <div className="hl-about__img-wrap">
            <ImageWithFallback
              src="https://st.depositphotos.com/3584053/54659/i/450/depositphotos_546598946-stock-photo-after-shave-irritation-barber-shop.jpg"
              alt="Barbería"
              className="hl-about__img"
            />
          </div>
        </div>

        <div className="hl-about__text">
          <p className="hl-eyebrow">SOBRE NOSOTROS</p>
          <h2 className="hl-section-title"><em>Lujo y Bienestar<br />en Cada Detalle</em></h2>
          <p className="hl-section-body">
            HIGHLIFE SPA &amp; BAR es más que un spa, es un destino de bienestar donde la elegancia
            se encuentra con la relajación. Nuestro equipo de profesionales altamente capacitados
            se dedica a proporcionar experiencias transformadoras que nutren el cuerpo, la mente y el espíritu.
          </p>
          <div className="hl-about__stats">
            <div className="hl-about__stat">
              <strong>2+</strong>
              <span>Años de experiencia</span>
            </div>
            <div className="hl-about__stat">
              <strong>6+</strong>
              <span>Especialistas certificados</span>
            </div>
          </div>
          <button className="hl-btn-primary" onClick={() => onNavigate('login')}>
            Conocer Más
          </button>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contacto" className="hl-contact">
        <p className="hl-eyebrow" style={{ textAlign: 'center' }}>CONTÁCTANOS</p>
        <h2 className="hl-section-title" style={{ textAlign: 'center' }}>
          <em>Estamos Aquí para Ti</em>
        </h2>
        <div className="hl-contact__grid">
          <div className="hl-contact-card">
            <div className="hl-contact-card__icon"><Phone size={20} /></div>
            <h3>Teléfono</h3>
            <p>+57 (604) 123-4567</p>
          </div>
          <div className="hl-contact-card">
            <div className="hl-contact-card__icon"><Mail size={20} /></div>
            <h3>Email</h3>
            <p>info@highlifespa.com</p>
          </div>
          <div className="hl-contact-card">
            <div className="hl-contact-card__icon"><MapPin size={20} /></div>
            <h3>Ubicación</h3>
            <p>Laureles, Unicentro</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="hl-footer">
        <div className="hl-footer__brand">
          <div className="hl-footer__logo">High Life Spa</div>
          <p>Tu destino de bienestar y lujo en Medellín.</p>
          <p className="hl-footer__copy">© 2025 HIGHLIFE SPA &amp; BAR. Todos los derechos reservados.</p>
        </div>

        <div className="hl-footer__col">
          <p className="hl-footer__label">NAVEGACIÓN</p>
          <a href="#inicio">Inicio</a>
          <a href="#servicios">Servicios</a>
          <a href="#nosotros">Sobre Nosotros</a>
          <a href="#contacto">Contacto</a>
        </div>

        <div className="hl-footer__col">
          <p className="hl-footer__label">HORARIOS</p>
          <span>Lunes - Viernes: 9AM - 9PM</span>
          <span>Sábado: 10AM - 8PM</span>
          <span>Domingo: 10AM - 6PM</span>
        </div>

        <div className="hl-footer__col">
          <p className="hl-footer__label">SÍGUENOS</p>
          <div className="hl-footer__social">
            <button className="hl-footer__social-btn"><Facebook size={16} /></button>
            <button className="hl-footer__social-btn"><Instagram size={16} /></button>
            <button className="hl-footer__social-btn"><Twitter size={16} /></button>
          </div>
        </div>

        <div className="hl-footer__bottom">
          HIGHLIFE SPA &amp; BAR — DIGITAL SANCTUARY
        </div>
      </footer>

    </div>
  );
}