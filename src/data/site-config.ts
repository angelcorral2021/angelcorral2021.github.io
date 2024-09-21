export type Image = {
    src: string;
    alt?: string;
    caption?: string;
};

export type Link = {
    text: string;
    href: string;
};

export type Hero = {
    title?: string;
    text?: string;
    image?: Image;
    actions?: Link[];
};



export type SiteConfig = {
    logo?: Image;
    title: string;
    subtitle?: string;
    description: string;
    image?: Image;
    headerNavLinks?: Link[];
    footerNavLinks?: Link[];
    socialLinks?: Link[];
    hero?: Hero;
    postsPerPage?: number;
    projectsPerPage?: number;
};

const siteConfig: SiteConfig = {
    title: 'Angel C. Corral',
    subtitle: 'Portfolio y Ciberseguridad',
    description: 'Blog y portafolio personal',
    image: {
        src: '/logo.jpg',
        alt: 'logo'
    },
    headerNavLinks: [
        {
            text: 'Home',
            href: '/'
        },
        {
            text: 'Projects',
            href: '/projects'
        },
        {
            text: 'Blog',
            href: '/blog'
        },
        {
            text: 'Tags',
            href: '/tags'
        }
    ],
    footerNavLinks: [
        {
            text: 'About',
            href: '/about'
        },
        {
            text: 'Contact',
            href: '/contact'
        }
    ],
    hero: {
        title: 'Hola y Bienvenidos a mi Portafolio-Blog!',
        text: "Soy Ángel Corral, técnico electrónico y estudiante de Ingeniería en Informática, con especialización en desarrollo web, ciberseguridad y DevSecOps. Tengo experiencia en lenguajes como Python, JavaScript y Bash, así como en entornos Linux y Windows. Mi enfoque principal es la seguridad, integrando prácticas DevSecOps y realizando pruebas con OWASP ZAP y Burp Suite. He desarrollado proyectos de gestión para PYMES y automatización de inventarios, siempre aplicando altos estándares de seguridad y factibilidad técnica. Mi objetivo es seguir perfeccionándome en ciberseguridad y DevSecOps para proteger infraestructuras críticas.",
        image: {
            src: '/logo.jpg',
            alt: 'logo'
        },
        actions: [
            {
                text: 'Contacto',
                href: '/contact'
            }
        ]
    },
   
    postsPerPage: 8,
    projectsPerPage: 8
};

export default siteConfig;
