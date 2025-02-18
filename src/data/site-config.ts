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
    articulosPerPage?: number;
    exploraPerPage?: number;
};

const siteConfig: SiteConfig = {
    title: 'Angel C. Corral',
    subtitle: '',
    description: 'Blog y portafolio personal',
    image: {
        src: '/logito.png',
        alt: 'logo'
    },
    headerNavLinks: [
        {
            text: 'Inicio',
            href: '/'
        },
        {
            text: 'Proyectos',
            href: '/projects'
        },
        {
            text: 'Maquinas',
            href: '/maquinas'
        },
        {
            text: 'Proyecto Recorrechile.cl',
            href: '/explora'
        },
        {
            text: 'Articulos',
            href: '/articulos'
        }
    ],
    footerNavLinks: [
        {
            text: 'Sobre mi',
            href: '/about'
        },
        {
            text: 'Contacto',
            href: '/contact'
        }
    ],
    hero: {
        title: 'Bienvenidos a mi Portafolio-Blog',
        text: "Mi nombre es Ángel Corral, electrónico de profesión y estudiante de Ingeniería en Informática. Mi enfoque principal es la seguridad, integrando prácticas de desarrollo web seguro y conocimientos en DevSecOps. Mi objetivo es seguir perfeccionándome en ciberseguridad y DevSecOps para proteger infraestructuras críticas.",
        image: {
            src: '/logito2.png',
            alt: 'logo'
        },
        actions: [
            {
                text: 'Contacto',
                href: '/contact'
            },
            {
                text: 'Sobre Mi',
                href: '/about'
            }
        ]
    },
   
    postsPerPage: 8,
    projectsPerPage: 8
};

export default siteConfig;
