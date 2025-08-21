const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: './src/index.tsx',
  externals: [
    function({ request }, callback) {
      if (request === '/playground/compiler.js') {
        return callback(null, `import('${request}')`);
      }
      callback();
    }
  ],
  output: {
    filename: 'index.min.js',
    path: path.resolve(__dirname, 'public/dist'),
    clean: true,
  },
  optimization: {
    splitChunks: false,
    runtimeChunk: false,
  },
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? false : 'source-map',
  resolve: {
    alias: {
      '@assets': path.join(__dirname, './assets'),
      '@components': path.join(__dirname, './src/components'),
      '@pages': path.join(__dirname, './src/pages'),
      '@layouts': path.join(__dirname, './src/layouts'),
      '@services': path.join(__dirname, './src/services'),
      '@styles': path.join(__dirname, './src/styles'),
    },
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  module: {
    rules: [
    {
      test: /.(ts|tsx)$/,
      exclude: /node_modules/,
      use: [
      {
        loader: path.resolve(
          __dirname,
          './node_modules/@rumious/webpack-loader/dist/index.js',
        ),
        options: {
          configFile: './rumious.config.json',
        },
      },
      {
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      }, ],
    },
    {
      test: /\.jsx$/,
      exclude: /node_modules/,
      use: [
      {
        loader: path.resolve(
          __dirname,
          './node_modules/@rumious/webpack-loader/dist/index.js',
        ),
      }, ],
    },
    {
      test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
      type: 'asset/resource',
      generator: {
        filename: '../assets/[name][hash][ext][query]',
      },
    },
    {
      test: /\.module\.css$/i,
      use: [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          esModule: true,
        },
      },
      {
        loader: 'css-loader',
        options: {
          esModule: true,
          modules: {
            exportLocalsConvention: 'camelCase',
            namedExport: false,
          },
          importLoaders: 1,
        },
      }, ],
    },
    {
      test: /\.css$/i,
      exclude: /\.module\.css$/i,
      use: [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          esModule: true,
        },
      },
      {
        loader: 'css-loader',
        options: {
          esModule: true,
        },
      }, ],
    }, ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
};