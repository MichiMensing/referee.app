module.exports = {
  plugins: {
    "postcss-nesting": {},
    "postcss-custom-properties": {
      importFrom: "src/components/shared.css",
    },
    "postcss-preset-env": {},
  },
};
