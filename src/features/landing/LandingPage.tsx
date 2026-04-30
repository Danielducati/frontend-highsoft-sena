import '../../shared/styles/landing.css';
import { ImageWithFallback } from '../guidelines/figma/ImageWithFallback';
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';

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
            <p>+57 323 2875383</p>
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

      {/* ── MAPA ── */}
      <section style={{ width: "100%", lineHeight: 0, background: "#1E2D24" }}>
        <iframe
          title="Ubicación High Life Spa"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d980.8!2d-75.5866994!3d6.2405752!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4429a97d003859%3A0x6d1b2fb6da5e8f7e!2sHighlife%20Spa!5e0!3m2!1ses!2sco!4v1"
          width="100%"
          height="420"
          style={{ border: 0, display: "block" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>

      {/* ── FOOTER ── */}
      <footer className="hl-footer">
        <div className="hl-footer__brand">
          <div className="hl-footer__logo">High Life Spa</div>
          <p>Tu destino de bienestar y lujo en Medellín.</p>
          <p className="hl-footer__copy">© 2026 HIGHLIFE SPA &amp; BAR. Todos los derechos reservados.</p>
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
          <span>Lunes - Viernes: 8:30AM - 5:30PM</span>
          <span>Sábado: 8:30AM - 5:30PM</span>
          <span>Domingo: 8:30AM - 5:30PM</span>
        </div>

        <div className="hl-footer__col">
          <p className="hl-footer__label">SÍGUENOS</p>
          <div className="hl-footer__social">
            <a href="https://web.facebook.com/profile.php?id=61575715787939#" target="_blank" rel="noopener noreferrer" className="hl-footer__social-btn" aria-label="Facebook"><Facebook size={16} /></a>
            <a href="https://www.instagram.com/spahighlife/" target="_blank" rel="noopener noreferrer" className="hl-footer__social-btn" aria-label="Instagram"><Instagram size={16} /></a>
          </div>
        </div>

        <div className="hl-footer__bottom">
          HIGHLIFE SPA &amp; BAR — DIGITAL SANCTUARY
        </div>
      </footer>

      {/* ── BOTÓN FLOTANTE WHATSAPP ── */}
      <a
        href="https://wa.me/573232875383"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contáctanos por WhatsApp"
        style={{
          position:        "fixed",
          bottom:          28,
          right:           28,
          zIndex:          9999,
          width:           56,
          height:          56,
          borderRadius:    "50%",
          backgroundColor: "#25D366",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          boxShadow:       "0 4px 16px rgba(37,211,102,0.45)",
          transition:      "transform 0.2s, box-shadow 0.2s",
          textDecoration:  "none",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.transform  = "scale(1.1)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow  = "0 6px 22px rgba(37,211,102,0.6)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.transform  = "scale(1)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow  = "0 4px 16px rgba(37,211,102,0.45)";
        }}
      >
        {/* Ícono SVG oficial de WhatsApp */}
        <svg viewBox="0 0 32 32" width="30" height="30" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.003 2.667C8.637 2.667 2.667 8.637 2.667 16c0 2.363.618 4.674 1.794 6.706L2.667 29.333l6.784-1.778A13.267 13.267 0 0 0 16.003 29.333C23.37 29.333 29.333 23.363 29.333 16S23.37 2.667 16.003 2.667zm0 24.267a11.01 11.01 0 0 1-5.617-1.543l-.403-.24-4.027 1.056 1.073-3.92-.263-.42A10.987 10.987 0 0 1 5.003 16c0-6.065 4.935-11 11-11s11 4.935 11 11-4.935 11-11 11zm6.03-8.23c-.33-.165-1.953-.963-2.256-1.073-.303-.11-.524-.165-.744.165-.22.33-.854 1.073-1.047 1.293-.193.22-.386.248-.716.083-.33-.165-1.393-.513-2.653-1.637-.98-.874-1.642-1.953-1.835-2.283-.193-.33-.02-.508.145-.672.149-.148.33-.386.495-.579.165-.193.22-.33.33-.55.11-.22.055-.413-.028-.579-.083-.165-.744-1.793-1.02-2.455-.268-.644-.54-.557-.744-.567l-.634-.011c-.22 0-.579.083-.882.413-.303.33-1.157 1.13-1.157 2.757s1.185 3.198 1.35 3.418c.165.22 2.332 3.56 5.652 4.993.79.34 1.406.543 1.886.695.793.252 1.515.216 2.086.131.636-.095 1.953-.799 2.228-1.57.275-.771.275-1.432.193-1.57-.083-.138-.303-.22-.634-.386z"/>
        </svg>
      </a>

    </div>
  );
}
