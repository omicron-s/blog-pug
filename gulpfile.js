const gulp = require('gulp'); // Подключаем Gulp
const browserSync = require('browser-sync').create(); // Лайв-сервер
const watch = require('gulp-watch'); // Слежка за изменением файлов
const sass = require('gulp-sass'); // Компиляция SCSS
const autoprefixer = require('gulp-autoprefixer'); //Автопрефиксы
const sourcemaps = require('gulp-sourcemaps'); // Добавление соусмапов
const notify = require('gulp-notify'); // Нотификации ошибок
const plumber = require('gulp-plumber'); // Обработчик ошибок
const gcmq = require('gulp-group-css-media-queries'); // Группировка медиа-запросов
const sassGlob = require('gulp-sass-glob'); // Автодавбелние блоков в SCSS
const pug = require('gulp-pug'); // Подключение PUG
const del = require('del'); // Подключение очистки build
const fs = require('fs');

//Таск для сборки Gulp файлов
gulp.task('pug', function(callback) {
  return gulp
    .src('./src/pug/pages/**/*.pug')
    .pipe(
      plumber({
        errorHandler: notify.onError(function(err) {
          return {
            title: 'Pug',
            sound: false,
            message: err.message
          };
        })
      })
    )
    .pipe(
      pug({
        pretty: true,
        locals: {
          mainData: JSON.parse(fs.readFileSync('./src/data/main.json', 'utf8')),
          footerData: JSON.parse(
            fs.readFileSync('./src/data/footer.json', 'utf8')
          ),
          commentsData: JSON.parse(
            fs.readFileSync('./src/data/comments.json', 'utf8')
          )
        }
      })
    )
    .pipe(gulp.dest('./build/'))
    .pipe(browserSync.stream());
  callback();
});

//Таск для компиляции SCSS
gulp.task('scss', function(callback) {
  return gulp
    .src('./src/scss/main.scss')
    .pipe(
      plumber({
        errorHandler: notify.onError(function(err) {
          return {
            title: 'Styles',
            sound: false,
            message: err.message
          };
        })
      })
    )
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(
      sass({
        indentType: 'tab',
        indentWidth: 1,
        outputStyle: 'expanded'
      })
    )
    .pipe(gcmq())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 4 versions']
      })
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build/css/'))
    .pipe(browserSync.stream());

  callback();
});

// Копирование img
gulp.task('copy:img', function(callback) {
  return gulp.src('./src/img/**/*.*').pipe(gulp.dest('./build/img/'));
  callback();
});

// Копирование js
gulp.task('copy:js', function(callback) {
  return gulp.src('./src/js/**/*.*').pipe(gulp.dest('./build/js/'));
  callback();
});

// Копирование libs
gulp.task('copy:libs', function(callback) {
  return gulp.src('./src/libs/**/*.*').pipe(gulp.dest('./build/libs/'));
  callback();
});

//Таск для слежений изменений в файлах
gulp.task('watch', function() {
  watch('./src/scss/**/*.scss', gulp.parallel('scss'));
  watch(['./src/pug/**/*.pug', './src/data/**/*.json'], gulp.parallel('pug'));
  watch('./src/img/**/*.*', gulp.parallel('copy:img'));
  watch('./src/js/**/*.*', gulp.parallel('copy:js'));
  watch('./src/libs/**/*.*', gulp.parallel('copy:libs'));

  //Слежение изменений за img, libs и js
  watch(
    ['./build/js/**/*.*', './build/img/**/*.*', './build/libs/**/*.*'],
    gulp.parallel(browserSync.reload)
  );
});

//Таск для запуска лайв-сервера
gulp.task('server', function() {
  browserSync.init({
    server: {
      baseDir: './build/'
    }
  });
});

gulp.task('clean:build', function() {
  return del('./build');
});

//Дефолтный таск, запускает все
gulp.task(
  'default',
  gulp.series(
    gulp.parallel('clean:build'),
    gulp.parallel('pug', 'scss', 'copy:img', 'copy:js', 'copy:libs'),
    gulp.parallel('server', 'watch')
  )
);
