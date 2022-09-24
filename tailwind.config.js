/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
        colors: {
            gray: {
                850: "#172033"
            }
        },
        keyframes: {
            openSettings: {
                "0%": {
                    opacity: "0.6",
                    transform: "scale(1.3)"
                },
                "100%": {
                    opacity: "1",
                    transform: "scale(1)"
                }    
            },
            slideFromBottom: {
                "0%": {
                    transform: "translateY(100%)",
                },
                "100%": {
                    transform: "translateY(0)"
                }
            }
        },
        animation: {
            openSettings: "openSettings 150ms linear",
            slideFromBottom: "slideFromBottom 150ms linear"
        }
    },
  },
  plugins: [
    require('tailwindcss-labeled-groups')(['icon'])
  ],
}

