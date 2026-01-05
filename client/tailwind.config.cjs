module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgba(2,108,138,1)',
        primarySoft: 'rgba(2,108,138,0.15)',
        secondary: 'rgba(163,208,66,1)',
        secondarySoft: 'rgba(163,208,66,0.15)'
      },
      backgroundImage: theme => ({
        'primary-gradient': 'linear-gradient(180deg, rgba(2,108,138,0.08), transparent)',
        'secondary-gradient': 'linear-gradient(180deg, rgba(163,208,66,0.06), transparent)'
      })
    }
  },
  plugins: []
};