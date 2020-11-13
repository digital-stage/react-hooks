import { Theme } from '@theme-ui/css';

const theme: Theme = {
  colors: {
    text: '#fff',
    background: '#1c1c1c',
    primary: '#F20544',
    secondary: '#2452CE',
    tertiary: '#012340', // cambridge blue
    muted: 'hsl(211, 16%, 68%)',
    accent: 'hsl(45, 100%, 50%)',
    danger: '#FA000099',
    dangerBg: '#9D131364',
    dangerUnderline: '#FA000099',
    success: '#24A312',
    navigation: 'hsl(333, 50%, 8%)',
    modalBg: '#000000B2',
    online: '#00FF3C',
    gray: ['#D1D1D1', '#B3B3B3', '#828282', '#535353', '#282828', '#181818', '#101010', '#000000'],
  },
  fonts: {
    body: "'Open Sans', Verdana, sans-serif",
    heading: 'Poppins, Verdana, sans-serif',
    monospace: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
    // SANSERATA
  },
  fontWeights: {
    body: 300,
    heading: 600,
    bold: 600,
  },
  lineHeights: {
    body: '1.5',
    heading: '1.125',
  },
  fontSizes: [14, 16, 18, 20, 24, 32, 48, 64, 72, 96],
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  breakpoints: [600, 900, 1200, 1500].map((n) => `${n}px`),
  radii: {
    card: '18px',
    button: '21px',
    round: '50%',
  },
  sizes: {
    container: {
      fullscreen: '100%',
      wide: '1407px',
      default: '800px',
      stage: '600px',
      small: '400px',
      tiny: '332px',
    },
    page: {
      default: '1280px',
    },
    group: {
      width: '30px',
      height: '30px',
      borderRadius: 'radii.round',
      mr: 3,
    },
  },
  shadows: {
    default: '0px 23px 17px #00000052',
  },
  text: {
    default: {
      color: 'text',
      fontSize: 1,
    },
    hint: {
      fontSize: 0,
      color: 'gray.1',
    },
    caps: {
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
    },
    heading: {
      color: 'text',
    },
    title: {
      color: 'background',
    },
    subTitle: {
      color: 'background',
      fontSize: 0,
      mt: 2,
    },
  },
  buttons: {
    primary: {
      fontFamily: 'heading',
      fontSize: 0,
      m: 2,
      py: 2,
      px: 3,
      border: '1px solid transparent',
      borderColor: 'primary',
      borderRadius: 'button',
      color: 'text',
      bg: 'primary',
      width: 'auto',
      height: 'auto',
    },
    secondary: {
      variant: 'buttons.primary',
      borderColor: 'secondary',
      color: 'text',
      bg: 'secondary',
    },
    white: {
      variant: 'buttons.primary',
      borderColor: 'text',
      color: 'background',
      bg: 'text',
    },
    black: {
      variant: 'buttons.primary',
      color: 'text',
      borderColor: 'background',
      bg: 'background',
    },
    outline: {
      variant: 'buttons.primary',
      borderColor: 'text',
      color: 'text',
      bg: 'transparent',
    },
    login: {
      fontFamily: 'heading',
      fontSize: 3,
      bg: 'background',
      color: 'text',
      padding: '10px 20px',
      my: 2,
      py: 3,
      px: 3,
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      ':hover,:active,:focus': {
        border: 'none',
        transition: 'border 1s ease-out',
        borderBottom: '2px solid transparent',
        borderColor: 'secondary',
      },
    },
    text: {
      border: 'none',
      bg: 'transparent',
      m: 0,
      p: 0,
      cursor: 'pointer',
    },
    circle: {
      border: 'none',
      m: 0,
      p: 0,
      bg: 'secondary',
      width: '64px',
      height: '64px',
      color: 'text',
      borderRadius: '32px',
    },
  },
  links: {
    auth: {
      fontFamily: 'heading',
      fontSize: 3,
      my: 2,
      py: 3,
      px: 3,
      color: 'text',
      textDecoration: 'none',
      borderBottom: '2px solid transparent',
      transition: 'border 1s ease-out',
      ':active,:visited': { color: 'text' },
      ':hover': {
        borderBottomColor: 'primary',
      },
    },
  },
  cards: {
    primary: {
      padding: 2,
      borderRadius: 4,
      boxShadow: '0 0 8px rgba(0, 0, 0, 0.125)',
    },
    compact: {
      padding: 1,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'muted',
    },
  },
  messages: {
    info: {
      mt: 4,
      borderRadius: 0,
      bg: 'text',
      color: 'background',
    },
    success: {
      variant: 'messages.info',
      borderLeftColor: 'success',
      bg: 'success',
      color: 'text',
    },
    warning: {
      variant: 'messages.info',
      borderLeftColor: 'accent',
      bg: 'accent',
      color: 'background',
    },
    danger: {
      variant: 'messages.info',
      borderLeftColor: '#A61010',
      bg: '#A61010',
      color: 'text',
    },
  },
  styles: {
    root: {
      fontFamily: 'body',
      fontWeight: 'body',
      fontSize: 1,
      'h1,h2,h3': {
        fontFamily: 'heading',
        fontWeight: 'heading',
        color: 'gray.0',
      },
      h1: {
        fontSize: 5,
        hyphens: ['auto', 'manual'],
      },
      'h2,h3': {
        hyphens: ['auto', 'manual'],
        marginTop: '2.58rem',
        marginBottom: '1.00781rem',
      },
      'summary,.tldr': {
        fontFamily: 'heading',
        fontSize: '1.25rem',
        fontWeight: 200,
        color: '#002856',
        lineHeight: '1.5rem',
        hyphens: 'auto',
        marginBottom: '1.00781rem',
        '&.landing': {
          fontSize: '1.75rem',
          lineHeight: '2rem',
          color: 'background',
        },
      },
      p: {
        mb: '1rem',
      },
      strong: {
        color: 'primary',
      },
      blockquote: {
        fontFamily: 'heading',
        fontSize: '1.25rem',
        // fontStyle: 'italic',
        color: 'secondary',
        borderLeft: '0.25rem solid',
        borderColor: 'secondary',
        my: [4, 5],
        mx: [0, null, '-32px', '-64px'],
        py: '0.75rem',
        pr: ['0.75rem', null, 0],
        pl: ['0.75rem', null, 'calc(32px - 0.25rem)', 'calc(64px - 0.25rem)'],
        '& strong': {
          color: 'secondary',
        },
        '& p': {
          mb: 0,
        },
      },
      'blockquote > :last-child': {
        mb: 0,
      },
      'code,kbd,pre,samp': {
        fontFamily: 'monospace',
        lineHeight: '1.6125',
      },
      ul: {
        listStyleType: 'square',
      },
      '.gatsby-resp-image-image': {
        bg: 'primary',
        borderRadius: 4,
      },
      '.iAmIlH': {
        fontSize: '0px',
        lineHeight: 0,
        visibility: 'hidden',
        display: 'none',
      },
    },
    code: {
      // ...prismTheme,
      fontSize: '0.75rem',
    },
    navlink: {
      mb: [0, null, 2],
      // pb: [`3px`, null, 0],
      px: [2, null, 3],
      fontFamily: 'heading',
      fontWeight: 600,
      textDecoration: 'none',
      color: 'navigation',
      borderBottom: 'unset',
      border: '2px solid',
      borderColor: 'background',
      boxShadow: 'unset',
      transition: '1s ease-in all',
      ':hover': {
        boxShadow: 'unset',
        borderBottom: 'unset',
        border: '2px solid',
        borderColor: 'background',
        color: 'primary',
        transition: '1s ease-in all',
      },
      ':active, &.active': {
        color: ['navigation', null, 'navigation'],
        fontWeight: [600, null, 400],
        bg: ['transparent', null, 'transparent'],
        border: '2px solid',
        borderColor: ['background', null, 'navigation'],
        borderRadius: '4px',
        transition: '1s ease-in all',
        boxShadow: 'unset',
      },
    },
    pre: {
      // fontSize: `0.75rem`,
      '&.prism-code': {
        p: [2, 3],
      },
      '&.language-sh > div': {
        ':before': {
          content: '"$ "',
        },
      },
      '&.highlight': {
        background: 'hsla(0, 0%, 30%, .5)',
      },
    },
  },
  images: {
    avatar: {
      width: 30,
      height: 30,
      borderRadius: 'radii.round',
      mr: 3,
    },
  },
};
export default theme;
