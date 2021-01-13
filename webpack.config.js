const path = require('path'),
      fs = require('fs'),
      HTMLWebpackPlugin = require('html-webpack-plugin'),
      BrowserSyncPlugin = require('browser-sync-webpack-plugin'),
      OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin'),
      TerserWebpackPlugin = require('terser-webpack-plugin'),
      {CleanWebpackPlugin} = require('clean-webpack-plugin'),
      MiniCssExtractPlugin = require('mini-css-extract-plugin'),
      CopyWebpackPlugin = require('copy-webpack-plugin');

const PATHS = {
  src: path.join(__dirname, 'src'),
  dist: path.join(__dirname, 'dist')
}

const isDev = process.env.NODE_ENV === 'development',
      isProd = !isDev,
      filename = (ext) => isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`,
      PAGES_DIR = `${PATHS.src}/pug/pages/`,
      PAGES = fs.readdirSync(PAGES_DIR).filter(fileName => fileName.endsWith('.pug'));

const optimization = () => {
  const configObj = {
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: 'vendors',
          test: /node_modules/,
          chunks: 'all',
          enforce: true
        }        
      }
    }
  };

  if (isProd) {
    configObj.minimizer = [
      new OptimizeCssAssetWebpackPlugin(),
      new TerserWebpackPlugin()
    ];
  }

  return configObj;
};

const plugins = () => {
  const basePlugins = [
      ...PAGES.map(
        page => new HTMLWebpackPlugin({
          template: `${PAGES_DIR}/${page}`,
          filename: `./${page.replace(/\.pug/,'.html')}`,
          minify: {
            collapseWhitespace: isProd
          }
        })
      ),
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: `./css/${filename('css')}`
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: `${PATHS.src}/img`, to: `${PATHS.dist}/img` },
        ]
      }),
      new BrowserSyncPlugin({
        host: 'localhost',
        port: 4000,
        proxy: "localhost:8080"
      })
  ];   

  return basePlugins;
};

module.exports = {
  context: PATHS.src,
  mode: 'development',
  entry: {
    app: PATHS.src,
  },
  output: {
    filename: `./js/${filename('js')}`,
    path: PATHS.dist,
    publicPath: '/'
  },
  // devServer: {
  //   contentBase: PATHS.dist,
  //   port: 8081,
  //   open: false,
  //   overlay: {
  //     warnings: true,
  //     errors: true
  //   }
  // },
  optimization: optimization(),
  plugins: plugins(),
  devtool: isProd ? false : 'source-map',
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: ['pug-loader', 'pug-plain-loader'],
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev
            },
          },
          'css-loader'
        ]
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: (resourcePath, context) => {
                return path.relative(path.dirname(resourcePath), context) + '/';
              },
            }
          },
          'css-loader',
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: ["autoprefixer"]
              }
            }
          },
          'sass-loader'
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(?:|ttf|woff|svg)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: `./font/${filename('[ext]')}`
          }
        }]
      }
    ]
  }
};