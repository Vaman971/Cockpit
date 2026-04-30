module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
  test: /\.css$/,
  loader:
    "style-loader!css-loader?modules=true&localIdentName=[name]__[local]___[hash:base64:5]"
,
}
