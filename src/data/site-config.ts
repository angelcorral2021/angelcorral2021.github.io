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
        src: '/hero.jpg',
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
        text: "Hola, soy Angel Corral, estudiante de Ingeniería en Informática con un enfoque en desarrollo web, ciberseguridad y DevSecOps. Mi pasión es crear soluciones tecnológicas seguras y escalables, asegurando que la seguridad esté integrada desde las primeras etapas del ciclo de desarrollo de software. Tengo sólidos conocimientos en lenguajes como Python, JavaScript y Bash, además de experiencia en el desarrollo web utilizando tecnologías como HTML5, CSS3 (incluyendo Tailwind CSS) y Node.js. También manejo bases de datos como MySQL y MongoDB. Sin embargo, mi verdadera especialidad radica en la ciberseguridad y en la integración de prácticas DevSecOps, automatizando la seguridad a través de herramientas como Jenkins, Docker, y Kubernetes, y realizando pruebas de seguridad con OWASP ZAP y Burp Suite.En cuanto a proyectos, he desarrollado un sistema de control de gestión para PYMES, donde empleé arquitecturas en capas y buenas prácticas de seguridad. También he llevado a cabo pruebas de seguridad para aplicaciones web, contribuyendo a la identificación y mitigación de vulnerabilidades en entornos reales. Otro de mis proyectos incluye la automatización del control de inventario para un comedor comunitario, donde apliqué un enfoque de factibilidad técnica y operativa.Mis objetivos son seguir desarrollando mi carrera en ciberseguridad y DevSecOps, contribuyendo a proyectos que protejan aplicaciones e infraestructuras críticas. Estoy comprometido en seguir aprendiendo y perfeccionando mis habilidades para enfrentar los desafíos de seguridad en el mundo digital.",
        image: {
            src: '/post-1.jpg',
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
