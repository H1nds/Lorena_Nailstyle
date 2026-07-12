/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                babyblue: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                gold: {
                    50: '#fdfbf0',
                    100: '#faf3d7',
                    200: '#f5e4a8',
                    300: '#eed070',
                    400: '#e6ba3f',
                    500: '#d99c1b',
                    600: '#be7812',
                    700: '#9b5613',
                    800: '#804417',
                    900: '#6a3818',
                }
            }
        },
    },
    plugins: [],
};