import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';

type Theme = 'light' | 'dark';

export type AnimationVariant = 'circle' | 'rectangle' | 'gif' | 'polygon' | 'circle-blur';

export type AnimationStart = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'top-center' | 'bottom-center' | 'bottom-up' | 'top-down' | 'left-right' | 'right-left';

type ThemeContextType = {
    theme: Theme;
    toggleTheme: () => void;
    animationVariant: AnimationVariant;
    animationStart: AnimationStart;
    animationBlur: boolean;
    gifUrl: string;
    setAnimationVariant: (variant: AnimationVariant) => void;
    setAnimationStart: (start: AnimationStart) => void;
    setAnimationBlur: (blur: boolean) => void;
    setGifUrl: (url: string) => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
    children: ReactNode;
};

type Animation = {
    name: string;
    css: string;
};

type DocumentWithViewTransition = Document & {
    startViewTransition?: (callback: () => void | Promise<void>) => {
        finished: Promise<void>;
    };
};

const DEFAULT_GIF_URL = 'https://media.giphy.com/media/KBbr4hHl9DSahKvInO/giphy.gif?cid=790b76112m5eeeydoe7et0cr3j3ekb1erunxozyshuhxx2vl&ep=v1_stickers_search&rid=giphy.gif&ct=s';

const getPositionCoords = (position: AnimationStart) => {
    switch (position) {
        case 'top-left':
            return { cx: '0', cy: '0' };
        case 'top-right':
            return { cx: '40', cy: '0' };
        case 'bottom-left':
            return { cx: '0', cy: '40' };
        case 'bottom-right':
            return { cx: '40', cy: '40' };
        case 'top-center':
            return { cx: '20', cy: '0' };
        case 'bottom-center':
            return { cx: '20', cy: '40' };
        case 'center':
            return { cx: '20', cy: '20' };
        default:
            return { cx: '20', cy: '20' };
    }
};

const getTransformOrigin = (start: AnimationStart) => {
    switch (start) {
        case 'top-left':
            return 'top left';
        case 'top-right':
            return 'top right';
        case 'bottom-left':
            return 'bottom left';
        case 'bottom-right':
            return 'bottom right';
        case 'top-center':
            return 'top center';
        case 'bottom-center':
            return 'bottom center';
        default:
            return 'center';
    }
};

const generateSVG = (variant: AnimationVariant, start: AnimationStart) => {
    if (variant === 'circle-blur') {
        const positionCoords = getPositionCoords(start);
        const { cx, cy } = positionCoords;

        return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="${cx}" cy="${cy}" r="18" fill="white" filter="url(%23blur)"/></svg>`;
    }

    if (start === 'center') return '';
    if (variant === 'rectangle' || variant === 'polygon' || variant === 'gif') return '';

    const { cx, cy } = getPositionCoords(start);

    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="${cx}" cy="${cy}" r="20" fill="white"/></svg>`;
};

export const createAnimation = (variant: AnimationVariant, start: AnimationStart = 'center', blur = false, url = DEFAULT_GIF_URL): Animation => {
    const svg = generateSVG(variant, start);
    const transformOrigin = getTransformOrigin(start);

    if (variant === 'rectangle') {
        const getClipPath = (direction: AnimationStart) => {
            switch (direction) {
                case 'bottom-up':
                    return {
                        from: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
                        to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                    };
                case 'top-down':
                    return {
                        from: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
                        to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                    };
                case 'left-right':
                    return {
                        from: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
                        to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                    };
                case 'right-left':
                    return {
                        from: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
                        to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                    };
                case 'top-left':
                    return {
                        from: 'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)',
                        to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                    };
                case 'top-right':
                    return {
                        from: 'polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)',
                        to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                    };
                case 'bottom-left':
                    return {
                        from: 'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)',
                        to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                    };
                case 'bottom-right':
                    return {
                        from: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)',
                        to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                    };
                default:
                    return {
                        from: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
                        to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                    };
            }
        };

        const clipPath = getClipPath(start);

        return {
            name: `${variant}-${start}${blur ? '-blur' : ''}`,
            css: `
                ::view-transition-group(root) {
                    animation-duration: 0.7s;
                    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
                }

                ::view-transition-new(root) {
                    animation: theme-reveal-light-${start}${blur ? '-blur' : ''} 0.7s forwards;
                }

                ::view-transition-old(root),
                .dark::view-transition-old(root) {
                    animation: none;
                    z-index: -1;
                }

                .dark::view-transition-new(root) {
                    animation: theme-reveal-dark-${start}${blur ? '-blur' : ''} 0.7s forwards;
                }

                @keyframes theme-reveal-dark-${start}${blur ? '-blur' : ''} {
                    from { clip-path: ${clipPath.from}; }
                    to { clip-path: ${clipPath.to}; }
                }

                @keyframes theme-reveal-light-${start}${blur ? '-blur' : ''} {
                    from { clip-path: ${clipPath.from}; }
                    to { clip-path: ${clipPath.to}; }
                }
            `,
        };
    }

    if (variant === 'gif') {
        return {
            name: `${variant}-${start}`,
            css: `
                ::view-transition-group(root) {
                    animation-duration: 3s;
                    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
                }

                ::view-transition-new(root) {
                    mask: url('${url}') center / 0 no-repeat;
                    -webkit-mask: url('${url}') center / 0 no-repeat;
                    animation: theme-gif-scale 3s forwards;
                }

                ::view-transition-old(root),
                .dark::view-transition-old(root) {
                    animation: none;
                    z-index: -1;
                }

                @keyframes theme-gif-scale {
                    0% {
                        mask-size: 0;
                        -webkit-mask-size: 0;
                    }
                    10% {
                        mask-size: 50vmax;
                        -webkit-mask-size: 50vmax;
                    }
                    90% {
                        mask-size: 50vmax;
                        -webkit-mask-size: 50vmax;
                    }
                    100% {
                        mask-size: 2000vmax;
                        -webkit-mask-size: 2000vmax;
                    }
                }
            `,
        };
    }

    if (variant === 'circle-blur') {
        if (start === 'center') {
            return {
                name: `${variant}-${start}`,
                css: `
                    ::view-transition-group(root) {
                        animation-duration: 1s;
                        animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
                    }

                    ::view-transition-new(root) {
                        clip-path: circle(0% at 50% 50%);
                        animation: theme-circle-blur-center 1s forwards;
                    }

                    ::view-transition-old(root),
                    .dark::view-transition-old(root) {
                        animation: none;
                        z-index: -1;
                    }

                    @keyframes theme-circle-blur-center {
                        from { clip-path: circle(0% at 50% 50%); }
                        to { clip-path: circle(100% at 50% 50%); }
                    }
                `,
            };
        }

        return {
            name: `${variant}-${start}`,
            css: `
                ::view-transition-group(root) {
                    animation-duration: 1s;
                    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
                }

                ::view-transition-new(root) {
                    mask: url('${svg}') ${start.replace('-', ' ')} / 0 no-repeat;
                    -webkit-mask: url('${svg}') ${start.replace('-', ' ')} / 0 no-repeat;
                    mask-origin: content-box;
                    -webkit-mask-origin: content-box;
                    animation: theme-circle-blur-scale 1s forwards;
                    transform-origin: ${transformOrigin};
                }

                ::view-transition-old(root),
                .dark::view-transition-old(root) {
                    animation: none;
                    z-index: -1;
                }

                @keyframes theme-circle-blur-scale {
                    from {
                        mask-size: 0;
                        -webkit-mask-size: 0;
                    }
                    to {
                        mask-size: 350vmax;
                        -webkit-mask-size: 350vmax;
                    }
                }
            `,
        };
    }

    if (variant === 'polygon') {
        const getPolygonClipPaths = (position: AnimationStart) => {
            switch (position) {
                case 'top-right':
                    return {
                        darkFrom: 'polygon(150% -71%, 250% 71%, 250% 71%, 150% -71%)',
                        darkTo: 'polygon(150% -71%, 250% 71%, 50% 171%, -71% 50%)',
                        lightFrom: 'polygon(-71% 50%, 50% 171%, 50% 171%, -71% 50%)',
                        lightTo: 'polygon(-71% 50%, 50% 171%, 250% 71%, 150% -71%)',
                    };
                case 'bottom-left':
                    return {
                        darkFrom: 'polygon(-71% 50%, 50% 171%, 50% 171%, -71% 50%)',
                        darkTo: 'polygon(-71% 50%, 50% 171%, 150% -71%, 250% 71%)',
                        lightFrom: 'polygon(250% 71%, 150% -71%, 150% -71%, 250% 71%)',
                        lightTo: 'polygon(250% 71%, 150% -71%, 50% 171%, -71% 50%)',
                    };
                case 'bottom-right':
                    return {
                        darkFrom: 'polygon(250% 71%, 150% -71%, 150% -71%, 250% 71%)',
                        darkTo: 'polygon(250% 71%, 150% -71%, -71% 50%, 50% 171%)',
                        lightFrom: 'polygon(50% 171%, -71% 50%, -71% 50%, 50% 171%)',
                        lightTo: 'polygon(50% 171%, -71% 50%, 150% -71%, 250% 71%)',
                    };
                default:
                    return {
                        darkFrom: 'polygon(50% -71%, -50% 71%, -50% 71%, 50% -71%)',
                        darkTo: 'polygon(50% -71%, -50% 71%, 50% 171%, 171% 50%)',
                        lightFrom: 'polygon(171% 50%, 50% 171%, 50% 171%, 171% 50%)',
                        lightTo: 'polygon(171% 50%, 50% 171%, -50% 71%, 50% -71%)',
                    };
            }
        };

        const clipPaths = getPolygonClipPaths(start);

        return {
            name: `${variant}-${start}${blur ? '-blur' : ''}`,
            css: `
                ::view-transition-group(root) {
                    animation-duration: 0.7s;
                    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
                }

                ::view-transition-new(root) {
                    animation: theme-polygon-light-${start}${blur ? '-blur' : ''} 0.7s forwards;
                }

                ::view-transition-old(root),
                .dark::view-transition-old(root) {
                    animation: none;
                    z-index: -1;
                }

                .dark::view-transition-new(root) {
                    animation: theme-polygon-dark-${start}${blur ? '-blur' : ''} 0.7s forwards;
                }

                @keyframes theme-polygon-dark-${start}${blur ? '-blur' : ''} {
                    from { clip-path: ${clipPaths.darkFrom}; }
                    to { clip-path: ${clipPaths.darkTo}; }
                }

                @keyframes theme-polygon-light-${start}${blur ? '-blur' : ''} {
                    from { clip-path: ${clipPaths.lightFrom}; }
                    to { clip-path: ${clipPaths.lightTo}; }
                }
            `,
        };
    }

    if (variant === 'circle' && start === 'center') {
        return {
            name: `${variant}-${start}${blur ? '-blur' : ''}`,
            css: `
                ::view-transition-group(root) {
                    animation-duration: 0.7s;
                    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
                }

                ::view-transition-new(root) {
                    animation: theme-circle-light${blur ? '-blur' : ''} 0.7s forwards;
                }

                ::view-transition-old(root),
                .dark::view-transition-old(root) {
                    animation: none;
                    z-index: -1;
                }

                .dark::view-transition-new(root) {
                    animation: theme-circle-dark${blur ? '-blur' : ''} 0.7s forwards;
                }

                @keyframes theme-circle-dark${blur ? '-blur' : ''} {
                    from { clip-path: circle(0% at 50% 50%); }
                    to { clip-path: circle(100% at 50% 50%); }
                }

                @keyframes theme-circle-light${blur ? '-blur' : ''} {
                    from { clip-path: circle(0% at 50% 50%); }
                    to { clip-path: circle(100% at 50% 50%); }
                }
            `,
        };
    }

    if (variant === 'circle') {
        const getClipPathPosition = (position: AnimationStart) => {
            switch (position) {
                case 'top-left':
                    return '0% 0%';
                case 'top-right':
                    return '100% 0%';
                case 'bottom-left':
                    return '0% 100%';
                case 'bottom-right':
                    return '100% 100%';
                case 'top-center':
                    return '50% 0%';
                case 'bottom-center':
                    return '50% 100%';
                default:
                    return '50% 50%';
            }
        };

        const clipPosition = getClipPathPosition(start);

        return {
            name: `${variant}-${start}${blur ? '-blur' : ''}`,
            css: `
                ::view-transition-group(root) {
                    animation-duration: 1s;
                    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
                }

                ::view-transition-new(root) {
                    animation: theme-circle-position-light-${start}${blur ? '-blur' : ''} 1s forwards;
                }

                ::view-transition-old(root),
                .dark::view-transition-old(root) {
                    animation: none;
                    z-index: -1;
                }

                .dark::view-transition-new(root) {
                    animation: theme-circle-position-dark-${start}${blur ? '-blur' : ''} 1s forwards;
                }

                @keyframes theme-circle-position-dark-${start}${blur ? '-blur' : ''} {
                    from { clip-path: circle(0% at ${clipPosition}); }
                    to { clip-path: circle(150% at ${clipPosition}); }
                }

                @keyframes theme-circle-position-light-${start}${blur ? '-blur' : ''} {
                    from { clip-path: circle(0% at ${clipPosition}); }
                    to { clip-path: circle(150% at ${clipPosition}); }
                }
            `,
        };
    }

    return {
        name: `${variant}-${start}${blur ? '-blur' : ''}`,
        css: `
            ::view-transition-group(root) {
                animation-duration: 1s;
                animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
            }

            ::view-transition-new(root) {
                mask: url('${svg}') ${start.replace('-', ' ')} / 0 no-repeat;
                -webkit-mask: url('${svg}') ${start.replace('-', ' ')} / 0 no-repeat;
                mask-origin: content-box;
                -webkit-mask-origin: content-box;
                animation: theme-mask-scale-${start}${blur ? '-blur' : ''} 1s forwards;
                transform-origin: ${transformOrigin};
            }

            ::view-transition-old(root),
            .dark::view-transition-old(root) {
                animation: none;
                z-index: -1;
            }

            @keyframes theme-mask-scale-${start}${blur ? '-blur' : ''} {
                from {
                    mask-size: 0;
                    -webkit-mask-size: 0;
                }
                to {
                    mask-size: 2000vmax;
                    -webkit-mask-size: 2000vmax;
                }
            }
        `,
    };
};

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme;
        }

        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    const [animationVariant, setAnimationVariant] = useState<AnimationVariant>('circle-blur');
    const [animationStart, setAnimationStart] = useState<AnimationStart>('top-right');
    const [animationBlur, setAnimationBlur] = useState(false);
    const [gifUrl, setGifUrl] = useState(DEFAULT_GIF_URL);

    const updateTransitionStyles = useCallback((css: string) => {
        const styleId = 'theme-transition-styles';

        let styleElement = document.getElementById(styleId) as HTMLStyleElement | null;
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }

        styleElement.textContent = css;
    }, []);

    const toggleTheme = useCallback(() => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        const viewTransitionDocument = document as DocumentWithViewTransition;
        if (!viewTransitionDocument.startViewTransition) {
            setTheme(nextTheme);
            return;
        }

        const animation = createAnimation(animationVariant, animationStart, animationBlur, gifUrl);
        updateTransitionStyles(animation.css);

        const transition = viewTransitionDocument.startViewTransition(() => {
            flushSync(() => {
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(nextTheme);

                localStorage.setItem('theme', nextTheme);
                setTheme(nextTheme);
            });
        });

        transition.finished.then(() => {
            updateTransitionStyles('');
        });
    }, [animationBlur, animationStart, animationVariant, gifUrl, theme, updateTransitionStyles]);

    const value = useMemo(
        () => ({
            theme,
            toggleTheme,
            animationVariant,
            animationStart,
            animationBlur,
            gifUrl,
            setAnimationVariant,
            setAnimationStart,
            setAnimationBlur,
            setGifUrl,
        }),
        [animationBlur, animationStart, animationVariant, gifUrl, theme, toggleTheme],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}